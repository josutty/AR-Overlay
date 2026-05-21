/**
 * Run this once to download CDN scripts locally.
 * Bypasses SSL certificate issues on corporate/restricted networks.
 * Usage: node scripts/download-libs.js
 */
import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'libs')

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

const libs = [
  {
    url: 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js',
    file: 'mindar-image-three.prod.js',
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.22/dist/occt-import-js.min.js',
    file: 'occt-import-js.min.js',
  },
]

// Disable SSL verification for corporate networks with cert issues
const agent = new https.Agent({ rejectUnauthorized: false })

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, { agent }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        fs.unlinkSync(dest)
        download(res.headers.location, dest).then(resolve).catch(reject)
        return
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', (err) => {
      fs.unlinkSync(dest)
      reject(err)
    })
  })
}

for (const lib of libs) {
  const dest = path.join(outDir, lib.file)
  process.stdout.write(`Downloading ${lib.file}... `)
  try {
    await download(lib.url, dest)
    const size = (fs.statSync(dest).size / 1024).toFixed(1)
    console.log(`✅ ${size} KB`)
  } catch (e) {
    console.log(`❌ ${e.message}`)
  }
}

console.log('\nDone! Restart dev server (npm run dev)')
