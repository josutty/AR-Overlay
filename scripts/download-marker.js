/**
 * download-marker.js
 * ------------------
 * Downloads the standard Hiro marker image to public/marker.png
 * Run: node scripts/download-marker.js
 */
import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputPath = path.join(__dirname, '..', 'public', 'marker.png')

const url = 'https://raw.githubusercontent.com/nicktindall/cyclon.p2p-rtc-client/master/example/img/hiro.png'

console.log('Downloading Hiro marker image...')

const file = fs.createWriteStream(outputPath)
https.get(url, (response) => {
  response.pipe(file)
  file.on('finish', () => {
    file.close()
    console.log(`✅ Saved to: ${outputPath}`)
    console.log(`\nNext step: Upload this file to the MindAR compiler:`)
    console.log(`  https://hiukim.github.io/mind-ar-js-doc/tools/compile`)
    console.log(`  → Download the .mind file → save as: public/targets/marker.mind`)
  })
}).on('error', (err) => {
  fs.unlink(outputPath, () => {})
  console.error('Download failed:', err.message)
})
