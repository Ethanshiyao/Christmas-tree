import React, { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { TreeState, DualPosition } from '../types';
import { CONFIG } from '../constants';

interface InstancedParticlesProps {
  data: DualPosition[];
  mode: TreeState;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  castShadow?: boolean;
}

const dummyObject = new THREE.Object3D();
const dummyPosition = new THREE.Vector3();
const dummyRotation = new THREE.Euler();
const dummyQuaternion = new THREE.Quaternion();
const dummyScale = new THREE.Vector3();

export const InstancedParticles: React.FC<InstancedParticlesProps> = ({
  data,
  mode,
  geometry,
  material,
  castShadow = false,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Initialize instance matrices and colors once
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    data.forEach((item, i) => {
      // Set initial Transform
      dummyObject.position.copy(item.scatterPosition);
      dummyObject.rotation.copy(item.scatterRotation);
      dummyObject.scale.setScalar(item.scale);
      dummyObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummyObject.matrix);

      // Set Color
      meshRef.current!.setColorAt(i, item.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [data]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetFactor = mode === TreeState.TREE_SHAPE ? 1 : 0;
    
    // Ensure userdata exists
    if (meshRef.current.userData.morphProgress === undefined) {
      meshRef.current.userData.morphProgress = 0;
    }

    // Smooth damp the global morph progress
    easing.damp(
      meshRef.current.userData, 
      'morphProgress', 
      targetFactor, 
      CONFIG.ANIMATION_SPEED, 
      delta
    );

    const progress = meshRef.current.userData.morphProgress;
    const time = state.clock.elapsedTime;
    const isFormed = progress > 0.9;

    // Optimization: Skip loop if completely settled (but we want idle animation)
    // We'll optimize by reducing calculation when settled if needed, but for visual fidelity we run it.
    
    let needsUpdate = false;
    
    // If not completely static (which it never is due to time), update
    // To save battery, you might limit this, but user requested "Flowing Light", so we animate.

    for (let i = 0; i < data.length; i++) {
        const { scatterPosition, scatterRotation, treePosition, treeRotation, scale } = data[i];

        // 1. Position Morph
        dummyPosition.lerpVectors(scatterPosition, treePosition, progress);

        // 2. Idle Animation
        if (mode === TreeState.TREE_SHAPE) {
            // "Breathing" / "Wind" effect
            // A wave moving up the tree: y + time
            const wave = Math.sin(treePosition.y * 0.5 - time * 2);
            // Gentle sway
            dummyPosition.x += wave * 0.05 * progress;
            dummyPosition.z += Math.cos(treePosition.y * 0.5 - time * 2) * 0.05 * progress;
        } else {
            // Floating in space
            dummyPosition.y += Math.sin(time + i) * 0.02 * (1 - progress);
            dummyPosition.x += Math.cos(time * 0.5 + i) * 0.02 * (1 - progress);
        }

        // 3. Rotation Morph
        const qScatter = new THREE.Quaternion().setFromEuler(scatterRotation);
        const qTree = new THREE.Quaternion().setFromEuler(treeRotation);
        dummyQuaternion.slerpQuaternions(qScatter, qTree, progress);

        // Add a slow spin to sparkles/ornaments if needed, or just let them shine
        // For needles, keep steady to maintain shape.

        // 4. Scale "Flowing Light" Effect
        // We simulate light flowing by scaling particles up slightly as a wave passes
        let currentScale = scale;
        if (isFormed) {
             // A highlight band moving up
             const flowPhase = (treePosition.y + CONFIG.TREE_HEIGHT/2) / CONFIG.TREE_HEIGHT; // 0 to 1
             const wavePos = (time * 0.5) % 2; // 0 to 2
             const dist = Math.abs(flowPhase - (wavePos - 0.5)); // distance from wave center
             
             // If close to wave, scale up slightly
             if (dist < 0.2) {
                 currentScale *= (1 + (0.2 - dist) * 1.5);
             }
        }
        dummyScale.setScalar(currentScale);

        dummyObject.position.copy(dummyPosition);
        dummyObject.quaternion.copy(dummyQuaternion);
        dummyObject.scale.copy(dummyScale);
        dummyObject.updateMatrix();

        meshRef.current.setMatrixAt(i, dummyObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, data.length]}
      castShadow={castShadow}
      receiveShadow
    />
  );
};