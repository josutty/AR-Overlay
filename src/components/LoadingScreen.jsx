import { useEffect, useState } from 'react'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import * as THREE from 'three'

export default function LoadingScreen({ coverFile, stlFile, onReady, onError }) {
  const [step, setStep] = useState('Reading files…')

  useEffect(() => {
    let cancelled = false
    let rawCoverURL = null

    async function prepare() {
      try {
        // ── Step 1: Dynamically import MindAR from src/lib (Vite bundles it) ─
        setStep('Loading AR engine…')
        const [mindARModule, controllerModule] = await Promise.all([
          import('../lib/mindar-image-three.prod.js'),
          import('../lib/controller-mGt1s8dJ.js'),
        ])

        const MindARThree = mindARModule.MindARThree ?? mindARModule.default?.MindARThree
        // DY (ImageTarget Compiler) is exported as "a" from controller bundle
        const Compiler = controllerModule.a

        if (!MindARThree) {
          console.log('MindAR module keys:', Object.keys(mindARModule))
          throw new Error('MindAR module loaded but MindARThree not found.\nModule keys: ' + Object.keys(mindARModule).join(', '))
        }
        if (!Compiler || typeof Compiler !== 'function') {
          throw new Error('MindAR Compiler not found in controller bundle.')
        }

        // Keep MindARThree accessible for ARScreen
        window.__MindARThree = MindARThree

        // ── Step 2: Load cover image into an HTMLImageElement ───────────────
        setStep('Preparing book cover image…')
        rawCoverURL = URL.createObjectURL(coverFile)
        if (cancelled) { URL.revokeObjectURL(rawCoverURL); return }

        const img = await loadImage(rawCoverURL)
        if (cancelled) { URL.revokeObjectURL(rawCoverURL); return }

        // ── Step 3: Compile the image into a MindAR .mind binary ────────────
        setStep('Compiling image target (0%)…')
        const compiler = new Compiler()
        await compiler.compileImageTargets([img], (progress) => {
          if (!cancelled) setStep(`Compiling image target (${Math.round(progress)}%)…`)
        })
        if (cancelled) { URL.revokeObjectURL(rawCoverURL); return }

        const mindBuffer = compiler.exportData()
        const mindBlob   = new Blob([mindBuffer])
        const coverURL   = URL.createObjectURL(mindBlob)

        // Raw image URL no longer needed
        URL.revokeObjectURL(rawCoverURL)
        rawCoverURL = null

        if (cancelled) { URL.revokeObjectURL(coverURL); return }

        // ── Step 4: Parse STL ────────────────────────────────────────────────
        setStep('Loading 3D model…')
        const meshData = await parseSTL(stlFile)
        if (cancelled) return

        setStep('Ready!')
        onReady({ coverURL, meshData })

      } catch (err) {
        console.error(err)
        if (rawCoverURL) { URL.revokeObjectURL(rawCoverURL); rawCoverURL = null }
        if (!cancelled) onError('Setup failed: ' + err.message)
      }
    }

    prepare()
    return () => {
      cancelled = true
      if (rawCoverURL) { URL.revokeObjectURL(rawCoverURL); rawCoverURL = null }
    }
  }, [])

  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p className="loading-text">{step}</p>
      <p className="loading-sub">Please wait — this only takes a few seconds</p>
    </div>
  )
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load cover image'))
    img.src = src
  })
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
 