import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Patch MindAR's pre-built ESM chunks to fix Three.js r163+ breaking changes
const mindARCompat = {
  name: 'mindar-three-compat',
  transform(code, id) {
    if (!id.includes('mindar-image-three.prod.js') && !id.includes('controller-') && !id.includes('ui-')) return null

    // 1. Remove deprecated encoding imports from three and inject numeric fallbacks
    const encodingAliases = []
    code = code.replace(/,\s*(sRGBEncoding|LinearEncoding|GammaEncoding|RGBEEncoding|LogLuvEncoding|RGBM7Encoding|RGBM16Encoding|RGBDEncoding|BasicDepthPacking|RGBADepthPacking)\s+as\s+(\w+)/g,
      (_, _name, alias) => { encodingAliases.push(alias); return '' }
    )
    const injected = encodingAliases.map(a => `var ${a}=3001;`).join('')

    // 2. Patch renderer.outputEncoding → renderer.outputColorSpace
    code = code.replace(/\.outputEncoding\s*=/g, '.outputColorSpace=')

    // 3. Patch ALL .outputColorSpaceConfig access to be safe:
    //    X.outputColorSpaceConfig.Y  → (X.outputColorSpaceConfig||{}).Y
    //    (handles cases where renderer.outputColorSpaceConfig is undefined in r163+)
    code = code.replace(/\.outputColorSpaceConfig\b/g, '?.outputColorSpaceConfig')

    // 4. Inject a one-time prototype patch for WebGLRenderer at the top of the main file
    //    so _outputColorSpaceConfig exists on every renderer instance MindAR creates
    let preamble = injected
    if (id.includes('mindar-image-three.prod.js')) {
      preamble += `
import{WebGLRenderer as __WR}from"three";
if(!Object.getOwnPropertyDescriptor(__WR.prototype,"_outputColorSpaceConfig")){
  Object.defineProperty(__WR.prototype,"_outputColorSpaceConfig",{
    get(){var v={enabled:false};Object.defineProperty(this,"_outputColorSpaceConfig",{value:v,writable:true,configurable:true});return v;},
    configurable:true
  });
}
if(!Object.getOwnPropertyDescriptor(__WR.prototype,"outputColorSpaceConfig")){
  Object.defineProperty(__WR.prototype,"outputColorSpaceConfig",{
    get(){return this._outputColorSpaceConfig||{enabled:false};},
    set(v){this._outputColorSpaceConfig=v;},
    configurable:true
  });
}
if(!Object.getOwnPropertyDescriptor(__WR.prototype,"outputEncoding")){
  Object.defineProperty(__WR.prototype,"outputEncoding",{
    get(){return 3001;},
    set(v){try{this.outputColorSpace=v===3001?"srgb":"srgb-linear";}catch(e){}},
    configurable:true
  });
}
`
    }

    if (preamble) code = preamble + code
    return { code, map: null }
  }
}

export default defineConfig({
  plugins: [react(), mindARCompat],
  resolve: {
    alias: {
      'node-fetch': '/src/lib/node-fetch-stub.js',
    },
  },
  server: { host: true, port: 5173 },
  optimizeDeps: {
    include: ['three'],
  },
})

