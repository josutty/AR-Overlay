// Download occt-import-js files locally to avoid CDN/SSL issues
import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'libs')
fs.mkdirSync(outDir, { recursive: true })

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const agent = new https.Agent({ rejectUnauthorized: false })

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const req = https.get(url, { agent }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close()
        fs.unlinkSync(dest)
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    })
    req.on('error', (e) => { try { fs.unlinkSync(dest) } catch (_) {}; reject(e) })
  })
}

const files = [
  ['https://cdn.jsdelivr.net/npm/occt-import-js@0.0.22/dist/occt-import-js.min.js',  'occt-import-js.js'],
  ['https://cdn.jsdelivr.net/npm/occt-import-js@0.0.22/dist/occt-import-js.wasm',    'occt-import-js.wasm'],
]

for (const [url, name] of files) {
  const dest = path.join(outDir, name)
  process.stdout.write(`Downloading ${name} ... `)
  try {
    await download(url, dest)
    const kb = (fs.statSync(dest).size / 1024).toFixed(0)
    console.log(`OK (${kb} KB)`)
  } catch (e) {
    console.log(`FAILED: ${e.message}`)
  }
}
console.log('All done.')
