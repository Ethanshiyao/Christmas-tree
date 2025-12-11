import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { TreeState } from './types';

const App: React.FC = () => {
  // Start in SCATTERED state for dramatic effect upon first interaction
  const [mode, setMode] = useState<TreeState>(TreeState.SCATTERED);

  const toggleMode = () => {
    setMode((prev) => 
      prev === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED
    );
  };

  return (
    <div className="w-full h-screen bg-black relative">
      <Suspense fallback={null}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0, 35], fov: 45 }}
          gl={{ antialias: false, toneMappingExposure: 1.5 }}
        >
          <Scene mode={mode} />
        </Canvas>
      </Suspense>
      
      <UI currentMode={mode} onToggle={toggleMode} />
      
      <Loader 
        containerStyles={{ background: '#010b05' }}
        innerStyles={{ width: '40vw', background: '#022c22' }}
        barStyles={{ background: '#FFD700', height: '2px' }}
        dataStyles={{ fontFamily: 'Playfair Display', color: '#FFD700' }}
      />
    </div>
  );
};

export default App;