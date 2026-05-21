import { useEffect, useState } from 'react'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import * as THREE from 'three'

export default function LoadingScreen({ coverFile, stlFile, onReady, onError }) {
  const [step, setStep] = useState('Reading files…')

  useEffect(() => {
    let cancelled = false

    async function prepare() {
      try {
        // ── Step 1: Dynamically import MindAR from src/lib (Vite bundles it) ─
        setStep('Loading AR engine…')
        const mindARModule = await import('../lib/mindar-image-three.prod.js')

        const MindARThree = mindARModule.MindARThree ?? mindARModule.default?.MindARThree

        if (!MindARThree) {
          console.log('MindAR module keys:', Object.keys(mindARModule))
          throw new Error('MindAR module loaded but MindARThree not found.\nModule keys: ' + Object.keys(mindARModule).join(', '))
        }

        // Keep MindARThree accessible for ARScreen
        window.__MindARThree = MindARThree

        // ── Step 2: Convert cover image file → object URL ───────────────────
        // MindARThree accepts a URL directly and compiles internally
        setStep('Preparing book cover image…')
        const coverURL = URL.createObjectURL(coverFile)
        if (cancelled) { URL.revokeObjectURL(coverURL); return }

        // ── Step 3: Parse STL ────────────────────────────────────────────────
        setStep('Loading 3D model…')
        const meshData = await parseSTL(stlFile)
        if (cancelled) return

        setStep('Ready!')
        onReady({ coverURL, meshData })

      } catch (err) {
        console.error(err)
        if (!cancelled) onError('Setup failed: ' + err.message)
      }
    }

    prepare()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p className="loading-text">{step}</p>
      <p className="loading-sub">Please wait — this only takes a few seconds</p>
    </div>
  )
}

function parseSTL(file) {
  return new Promise((resolve, reject) => {
    const loader = new STLLoader()
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const geometry = loader.parse(e.target.result)
        geometry.computeBoundingBox()
        const box    = geometry.boundingBox
        const size   = new THREE.Vector3()
        const center = new THREE.Vector3()
        box.getSize(size)
        box.getCenter(center)
        const maxDim = Math.max(size.x, size.y, size.z) || 1
        geometry.translate(-center.x, -center.y, -center.z)
        geometry.scale(1 / maxDim, 1 / maxDim, 1 / maxDim)
        geometry.computeVertexNormals()
        resolve({
          positions: Array.from(geometry.attributes.position.array),
          normals:   geometry.attributes.normal ? Array.from(geometry.attributes.normal.array) : null,
          indices:   geometry.index ? Array.from(geometry.index.array) : null,
        })
      } catch (err) {
        reject(new Error('STL parse failed: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('Cannot read STL file'))
    reader.readAsArrayBuffer(file)
  })
}
