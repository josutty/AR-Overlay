/**
 * generate-marker.js
 * ------------------
 * Run this ONCE to compile the marker.png → marker.mind target file.
 *
 * Steps:
 *   1. Place your reference marker image at: public/marker.png
 *      (Use the downloaded Hiro marker, or generate one at https://hiukim.github.io/mind-ar-js-doc/tools/compile)
 *   2. Run: node scripts/generate-marker.js
 *   3. The compiled marker.mind will be placed at: public/targets/marker.mind
 *
 * OR use the online MindAR compiler (no code needed):
 *   → https://hiukim.github.io/mind-ar-js-doc/tools/compile
 *   Upload your marker image and download the .mind file to public/targets/
 */

import { writeFileSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log(`
==============================================================
  MindAR Marker Compiler
==============================================================

Option 1 (Easiest — Recommended):
  → Go to: https://hiukim.github.io/mind-ar-js-doc/tools/compile
  → Upload your marker image (e.g., the Hiro marker)
  → Click "Compile" 
  → Download the .mind file
  → Save it to: public/targets/marker.mind

Option 2 (Use default Hiro marker):
  → Download: https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png
  → Save as: public/marker.png
  → Then compile with the online tool above

The AR app is looking for: public/targets/marker.mind
==============================================================
`)
