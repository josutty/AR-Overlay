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
        Point the camera at the book — the model will appear on it.
      </p>

      {/* Book cover photo upload */}
      <div className="upload-card" onClick={() => coverRef.current.click()}>
        <div className="upload-icon">{coverFile ? '🖼️' : '📷'}</div>
        <h2>Book Cover Photo</h2>
        {coverFile
          ? <p className="file-name">{coverFile.name}</p>
          : <p>JPG or PNG photo of your book cover</p>
        }
        <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) onCoverFile(e.target.files[0]) }} />
      </div>

      {/* STL file upload */}
      <div className="upload-card" onClick={() => stlRef.current.click()}>
        <div className="upload-icon">{stlFile ? '📦' : '📂'}</div>
        <h2>3D Model File</h2>
        {stlFile
          ? <p className="file-name">{stlFile.name}</p>
          : <p>STL file of your CAD model</p>
        }
        <input ref={stlRef} type="file" accept=".stl"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) onStlFile(e.target.files[0]) }} />
      </div>

      <button className="btn-primary" disabled={!canStart} onClick={onStart}>
        Start AR
      </button>

      <div className="hint-box">
        <strong>How it works:</strong><br />
        1. Upload a clear photo of your book cover<br />
        2. Upload the STL model you want to overlay<br />
        3. Tap Start AR — allow camera access<br />
        4. Point camera at the real book cover<br />
        5. The 3D model appears flat on the cover
      </div>
    </div>
  )
}


export default function FileUploadScreen({ selectedFile, onFileSelected, onStartAR }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const isSTP = selectedFile && /\.(stp|step)$/i.test(selectedFile.name)

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelected(file)
  }
  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) onFileSelected(file)
  }

  return (
    <div className="upload-screen">
      <h1>🔭 AR CAD Viewer</h1>
      <p className="subtitle">Load a CAD file and overlay it on a real object via your camera</p>

      <label
        className={`upload-card ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📦</div>
        <h2>Drop your CAD file here</h2>
        <p>Recommended: <strong>.STL</strong></p>
        <input ref={inputRef} type="file" accept=".stl,.stp,.step" onChange={handleChange} />
      </label>

      {selectedFile && (
        <div className="file-selected">
          <span className="icon">{isSTP ? '⚠️' : '📄'}</span>
          <span className="name">{selectedFile.name}</span>
          <span style={{ color: '#aaa', fontSize: '0.75rem' }}>
            {(selectedFile.size / 1024).toFixed(1)} KB
          </span>
          <button onClick={() => onFileSelected(null)} title="Remove">✕</button>
        </div>
      )}

      {isSTP && (
        <div style={{ background: 'rgba(255,160,0,0.1)', border: '1px solid rgba(255,160,0,0.5)', borderRadius: 12, padding: '12px 16px', fontSize: '0.83rem', color: '#ffcc66', maxWidth: 420, width: '100%', lineHeight: 1.7 }}>
          <strong>⚠️ STP files must be converted to STL first</strong><br />
          Use your CAD tool: <strong>File → Save As → STL</strong><br />
          Works in: SolidWorks, Fusion 360, FreeCAD, CATIA
        </div>
      )}

      <button className="btn-primary" disabled={!selectedFile || isSTP} onClick={onStartAR}>
        {isSTP ? '⚠️ Convert to STL first' : '🚀 Start AR'}
      </button>

      <div className="marker-info">
        <strong>📐 Formats:</strong> ✅ .STL (works now) &nbsp;|&nbsp; ⚠️ .STP/.STEP (convert to STL first)<br />
        <br />
        <strong>📷 How to use:</strong><br />
        1. Upload a <strong>.STL</strong> file → tap Start AR<br />
        2. Allow camera access when prompted<br />
        3. Point camera at your real object<br />
        4. Drag to rotate · Scroll to zoom · Right-drag to pan
      </div>
    </div>
  )
}//*�
