import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sparkles, Float, MeshReflectorMaterial, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { easing } from 'maath';
import { InstancedParticles } from './InstancedParticles';
import { generateNeedlePositions, generateOrnamentPositions } from '../utils/geometry';
import { COLORS, CONFIG } from '../constants';
import { TreeState } from '../types';

interface SceneProps {
  mode: TreeState;
}

const Star: React.FC<{ mode: TreeState }> = ({ mode }) => {
    const ref = useRef<THREE.Group>(null);
    const isTree = mode === TreeState.TREE_SHAPE;

    useFrame((state, delta) => {
        if (!ref.current) return;
        
        // Target Position: Top of tree vs Random scatter
        const targetPos = isTree 
            ? new THREE.Vector3(0, CONFIG.TREE_HEIGHT / 2 + 0.5, 0) 
            : new THREE.Vector3(10, 20, -10); // Specific scatter spot or random

        // Target Scale
        const targetScale = isTree ? 1 : 0;

        easing.damp3(ref.current.position, targetPos, 1.5, delta);
        easing.damp(ref.current.scale, 'x', targetScale, 1.0, delta);
        easing.damp(ref.current.scale, 'y', targetScale, 1.0, delta);
        easing.damp(ref.current.scale, 'z', targetScale, 1.0, delta);
        
        // Spin
        ref.current.rotation.y += delta * 0.5;
    });

    return (
        <group ref={ref}>
             {/* Core */}
            <mesh>
                <octahedronGeometry args={[0.8, 0]} />
                <meshStandardMaterial 
                    color={COLORS.GOLD_METALLIC} 
                    emissive={COLORS.GOLD_METALLIC}
                    emissiveIntensity={2}
                    toneMapped={false}
                />
            </mesh>
            {/* Halo */}
            <mesh scale={1.5} rotation={[0, Math.PI/4, 0]}>
                <octahedronGeometry args={[0.8, 0]} />
                <meshStandardMaterial 
                    color={COLORS.GOLD_METALLIC} 
                    transparent 
                    opacity={0.3}
                    wireframe
                />
            </mesh>
            <pointLight intensity={500} distance={10} color={COLORS.GOLD_METALLIC} />
        </group>
    )
}

export const Scene: React.FC<SceneProps> = ({ mode }) => {
  // Generate Data
  const needleData = useMemo(() => generateNeedlePositions(CONFIG.NEEDLE_COUNT), []);
  const ornamentData = useMemo(() => generateOrnamentPositions(CONFIG.ORNAMENT_COUNT), []);

  // Moving light ref
  const movingLight = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
      if (movingLight.current) {
          const t = clock.getElapsedTime();
          // Spiral light moving up
          movingLight.current.position.x = Math.sin(t * 0.5) * 15;
          movingLight.current.position.z = Math.cos(t * 0.5) * 15;
          movingLight.current.position.y = Math.sin(t * 0.2) * 8;
      }
  });

  // Geometries - CHANGED TO CUBE (BOX) AND SPHERE
  const needleGeo = useMemo(() => {
    // Cube geometry for "digital glitter" needles
    return new THREE.BoxGeometry(0.15, 0.15, 0.15);
  }, []);

  const ornamentGeo = useMemo(() => new THREE.SphereGeometry(0.35, 16, 16), []);

  // Materials - High gloss
  const needleMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0xffffff, 
    roughness: 0.15,
    metalness: 0.7, 
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
  }), []);

  const ornamentMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.05,
    metalness: 0.9,
    clearcoat: 1.0,
    emissive: COLORS.GOLD_ROSE,
    emissiveIntensity: 0.2,
  }), []);

  return (
    <>
      <OrbitControls 
        minDistance={10} 
        maxDistance={50} 
        enablePan={false} 
        autoRotate={mode === TreeState.TREE_SHAPE} 
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5} 
      />
      
      <Environment preset="city" background={false} />

      <color attach="background" args={['#000200']} />
      <fog attach="fog" args={['#000200', 15, 60]} />

      {/* Lighting Setup */}
      <ambientLight intensity={0.2} color={COLORS.EMERALD_DEEP} />
      
      <spotLight
        position={[20, 40, 20]}
        angle={0.25}
        penumbra={1}
        intensity={2000}
        color="#fff5cc"
        castShadow
        shadow-bias={-0.0001}
      />

      <pointLight position={[-15, 10, -15]} intensity={400} color="#00ffaa" distance={40} />
      <pointLight position={[15, -5, -15]} intensity={400} color="#ffaa00" distance={40} />

      <pointLight 
        ref={movingLight} 
        intensity={600} 
        color={COLORS.GOLD_METALLIC} 
        distance={25} 
        decay={2}
      />

      {/* Objects */}
      <Star mode={mode} />

      <InstancedParticles 
        data={needleData} 
        mode={mode} 
        geometry={needleGeo} 
        material={needleMaterial}
        castShadow 
      />

      <InstancedParticles 
        data={ornamentData} 
        mode={mode} 
        geometry={ornamentGeo} 
        material={ornamentMaterial}
        castShadow 
      />

      {/* Reflective Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -CONFIG.TREE_HEIGHT / 2 - 2, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <MeshReflectorMaterial
            mirror={1}
            blur={[400, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={2} 
            roughness={0.4}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#050505"
            metalness={0.8}
        />
      </mesh>
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sparkles 
          count={400} 
          scale={25} 
          size={3} 
          speed={0.4} 
          opacity={0.6} 
          color="#FFD700" 
        />
      </Float>

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.9} 
          mipmapBlur 
          intensity={2.5} 
          radius={0.5} 
          levels={9}
        />
        <ToneMapping />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
      </EffectComposer>
    </>
  );
};