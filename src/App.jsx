import { useState } from 'react'
import UploadScreen  from './components/UploadScreen'
import LoadingScreen from './components/LoadingScreen'
import ARScreen      from './components/ARScreen'

// App states: 'upload' | 'loading' | 'ar'
export default function App() {
  const [screen,    setScreen]    = useState('upload')
  const [coverFile, setCoverFile] = useState(null)   // book cover photo
  const [stlFile,   setStlFile]   = useState(null)   // CAD/STL file
  const [arData,    setArData]    = useState(null)   // compiled target + geometry

  const handleStart = () => setScreen('loading')

  const handleReady = (data) => {
    setArData(data)
    setScreen('ar')
  }

  const handleBack = () => {
    setArData(null)
    setScreen('upload')
  }

  return (
    <>
      {screen === 'upload'  && (
        <UploadScreen
          coverFile={coverFile} onCoverFile={setCoverFile}
          stlFile={stlFile}     onStlFile={setStlFile}
          onStart={handleStart}
        />
      )}
      {screen === 'loading' && (
        <LoadingScreen
          coverFile={coverFile}
          stlFile={stlFile}
          onReady={handleReady}
          onError={(msg) => { alert(msg); setScreen('upload') }}
        />
      )}
      {screen === 'ar' && (
        <ARScreen arData={arData} onExit={handleBack} />
      )}
    </>
  )
}
