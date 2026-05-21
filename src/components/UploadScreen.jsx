import { useRef } from 'react'

export default function UploadScreen({ coverFile, onCoverFile, stlFile, onStlFile, onStart }) {
  const coverRef = useRef(null)
  const stlRef   = useRef(null)

  const canStart = coverFile && stlFile

  return (
    <div className="upload-screen">
      <h1>AR Book Viewer</h1>
      <p className="subtitle">
        Upload your book cover photo and a 3D model.<br />
        Point the camera at the book — the model appears on it.
      </p>

      {/* ── Book cover photo ── */}
      <div className="upload-card" onClick={() => coverRef.current.click()}>
        <div className="upload-icon">{coverFile ? '🖼️' : '📷'}</div>
        <h2>Book Cover Photo</h2>
        {coverFile
          ? <p className="file-name">{coverFile.name}</p>
          : <p>JPG / PNG photo of your book cover</p>
        }
        <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) onCoverFile(e.target.files[0]) }} />
      </div>

      {/* ── STL model ── */}
      <div className="upload-card" onClick={() => stlRef.current.click()}>
        <div className="upload-icon">{stlFile ? '📦' : '📂'}</div>
        <h2>3D Model (STL)</h2>
        {stlFile
          ? <p className="file-name">{stlFile.name}</p>
          : <p>STL file of your CAD model</p>
        }
        <input ref={stlRef} type="file" accept=".stl"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) onStlFile(e.target.files[0]) }} />
      </div>

      <button className="btn-primary" disabled={!canStart} onClick={onStart}>
        {canStart ? '🚀 Start AR' : 'Upload both files to continue'}
      </button>

      <div className="hint-box">
        <strong>📖 How it works</strong><br />
        1. Upload a clear photo of your book cover<br />
        2. Upload the STL model to overlay<br />
        3. Tap Start AR — allow camera access<br />
        4. Point camera at the real book<br />
        5. 3D model appears flat on the cover ✅
      </div>
    </div>
  )
}
