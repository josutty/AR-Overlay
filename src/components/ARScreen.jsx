import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
// MindARThree is set on window.__MindARThree by LoadingScreen after dynamic import

export default function ARScreen({ arData, onExit }) {
  const containerRef = useRef(null)
  const [status, setStatus]   = useState('Starting camera…')
  const [found,  setFound]    = useState(false)
  const [error,  setError]    = useState(null)

  useEffect(() => {
    if (!containerRef.current || !arData) return
    let mindAR = null
    let cancelled = false

    async function start() {
      try {
        // MindARThree was stored on window by LoadingScreen after import
        const MindARThree = window.__MindARThree
        if (!MindARThree) throw new Error('MindAR not initialised — try reloading')

        // ── Patch THREE.WebGLRenderer BEFORE MindAR creates its renderer ─────
        // MindAR 1.2.x was built against Three.js r148–r162 which had
        // _outputColorSpaceConfig as an instance property (removed in r163+).
        // Adding a prototype getter so every new renderer instance has it.
        if (!Object.getOwnPropertyDescriptor(THREE.WebGLRenderer.prototype, '_outputColorSpaceConfig')) {
          Object.defineProperty(THREE.WebGLRenderer.prototype, '_outputColorSpaceConfig', {
            get() {
              // Create own property on first access so reads/writes work normally
              const val = { enabled: false }
              Object.defineProperty(this, '_outputColorSpaceConfig', {
                value: val, writable: true, configurable: true,
              })
              return val
            },
            configurable: true,
          })
        }
        // outputEncoding was removed in r163; stub it so MindAR's setter is silent
        if (!Object.getOwnPropertyDescriptor(THREE.WebGLRenderer.prototype, 'outputEncoding')) {
          Object.defineProperty(THREE.WebGLRenderer.prototype, 'outputEncoding', {
            get() { return 3001 },
            set(v) { try { this.outputColorSpace = v === 3001 ? 'srgb' : 'srgb-linear' } catch(_){} },
            configurable: true,
          })
        }

        // ── Create MindAR instance ───────────────────────────────────────────
        mindAR = new MindARThree({
          container:      containerRef.current,
          imageTargetSrc: arData.coverURL,
          maxTrack:       1,
          uiLoading:      'no',
          uiScanning:     'no',
          uiError:        'no',
        })

        const { renderer, scene, camera } = mindAR

        // ── Lights ───────────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0xffffff, 0.9))
        const sun = new THREE.DirectionalLight(0xffffff, 1.2)
        sun.position.set(1, 2, 1)
        scene.add(sun)

        // ── Rebuild geometry from raw arrays using window.THREE ──────────────
        const { positions, normals, indices } = arData.meshData
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
        if (normals) geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3))
        if (indices)  geo.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
        if (!normals) geo.computeVertexNormals()

        const material = new THREE.MeshPhongMaterial({
          color:       0x2288ff,
          shininess:   60,
          side:        THREE.DoubleSide,
          transparent: true,
          opacity:     0.88,
        })
        const mesh = new THREE.Mesh(geo, material)
        // Lay flat on the book cover surface
        mesh.rotation.x = -Math.PI / 2
        mesh.scale.setScalar(0.8)

        // ── Anchor model to image target 0 ───────────────────────────────────
        const anchor = mindAR.addAnchor(0)
        anchor.group.add(mesh)

        anchor.onTargetFound = () => {
          if (!cancelled) { setFound(true);  setStatus('Book cover detected!') }
        }
        anchor.onTargetLost  = () => {
          if (!cancelled) { setFound(false); setStatus('Scanning for book cover…') }
        }

        // ── Start camera + tracking ───────────────────────────────────────────
        if (!cancelled) {
          setStatus('Scanning for book cover…')
          await mindAR.start()
          renderer.setAnimationLoop(() => renderer.render(scene, camera))
        }

      } catch (err) {
        console.error(err)
        if (!cancelled) setError('AR failed to start: ' + err.message)
      }
    }

    start()

    return () => {
      cancelled = true
      if (mindAR) {
        try { mindAR.stop() } catch (_) {}
        try { mindAR.renderer.setAnimationLoop(null) } catch (_) {}
      }
    }
  }, [arData])

  if (error) {
    return (
      <div className="error-screen">
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h2>AR Error</h2>
        <p style={{ color: '#ffaaaa', maxWidth: 340, textAlign: 'center' }}>{error}</p>
        <button className="btn-primary" onClick={onExit}>Back</button>
      </div>
    )
  }

  return (
    <div className="ar-wrapper">
      {/* MindAR mounts camera + canvas into this div */}
      <div ref={containerRef} className="ar-container" />

      {/* Status badge */}
      <div className="ar-hud">
        <div className={`status-badge ${found ? 'tracking' : 'scanning'}`}>
          <div className={`status-dot ${found ? '' : 'pulse'}`} />
          {status}
        </div>
      </div>

      {/* Scanning hint */}
      {!found && (
        <div className="scan-hint">
          <div className="scan-frame" />
          <p>Point camera at your book cover</p>
        </div>
      )}

      {/* Exit */}
      <button className="btn-exit" onClick={onExit}>✕ Exit AR</button>
    </div>
  )
}

