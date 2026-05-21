# AR CAD Viewer

A web-based Augmented Reality app that overlays **STP/STEP CAD models** on real objects using marker-based tracking — works on any mobile browser, no app install required.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up the AR Marker (One-time setup)
You need a compiled **MindAR `.mind` target file**. Two ways to get it:

**Option A — Online compiler (easiest):**
1. Go to: https://hiukim.github.io/mind-ar-js-doc/tools/compile
2. Upload a high-contrast image (e.g., [Hiro marker](https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png))
3. Click **Start** → download the `.mind` file
4. Save it as: `public/targets/marker.mind`

**Option B — Download default Hiro marker then compile:**
```bash
node scripts/download-marker.js
# then upload public/marker.png to the online compiler
```

### 3. Print the marker
- Print `public/marker.png` (A5 or larger, on plain paper)
- Place it **next to** or **under** your physical object (bottle, part, etc.)

### 4. Run the dev server
```bash
npm run dev
```

Open on your **mobile** by navigating to `http://<your-local-ip>:5173`  
(The server exposes on your local network — Vite shows the IP in the terminal)

### 5. Use the app
1. Open the webpage on your phone/tablet
2. Tap **Browse files** → select your `.stp` or `.step` file
3. Tap **🚀 Start AR**
4. Point the camera at the printed marker
5. Your CAD model overlays on the marker in real-time!

---

## 🗂 Project Structure

```
src/
  App.jsx                  ← State machine (upload → loading → AR → error)
  components/
    FileUploadScreen.jsx   ← File picker UI
    ARScreen.jsx           ← MindAR + Three.js AR renderer
    LoadingScreen.jsx      ← Progress while parsing STP
    ErrorScreen.jsx        ← Error display

public/
  targets/
    marker.mind            ← Compiled MindAR target (YOU MUST ADD THIS)
  marker.png               ← Printable marker image

scripts/
  download-marker.js       ← Downloads the default Hiro marker
  generate-marker.js       ← Instructions for compiling
```

---

## ⚙️ How It Works

```
STP File (user device)
    │
    ▼
occt-import-js (STEP parser, runs in browser via WASM)
    │
    ▼
Three.js BufferGeometry (mesh vertices, normals, faces)
    │
    ▼
MindAR.js (camera + image marker tracking)
    │
    ▼
Three.js Renderer (model anchored to marker in 3D space)
    │
    ▼
Camera Feed + Overlaid 3D Model on screen
```

---

## 📐 Supported CAD Formats
| Format | Status |
|--------|--------|
| `.stp` / `.step` | ✅ Supported |
| `.gltf` / `.glb` | Planned |
| `.obj` | Planned |
| `.stl` | Planned |

---

## 🔧 Tech Stack
- **React** + **Vite** — UI framework & build tool
- **Three.js** — 3D rendering
- **MindAR.js** — Browser-based image marker AR tracking
- **occt-import-js** — OpenCASCADE STEP/STP parser (WebAssembly)

---

## 📱 Deployment Notes
- Camera access requires **HTTPS** in production (not needed for `localhost`)
- For mobile access over LAN during dev, use the IP shown by Vite (`http://192.168.x.x:5173`)
- For deployment: use Vercel, Netlify, or any static HTTPS host
- HTTPS with self-signed cert for LAN: `vite --https` (requires `@vitejs/plugin-basic-ssl`)
"# AR-Overlay" 
