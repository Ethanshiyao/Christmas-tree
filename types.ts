import * as THREE from 'three';

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface DualPosition {
  scatterPosition: THREE.Vector3;
  scatterRotation: THREE.Euler;
  treePosition: THREE.Vector3;
  treeRotation: THREE.Euler;
  scale: number;
  color: THREE.Color; // Changed from optional string to THREE.Color for easier handling
}

export interface ParticleSystemProps {
  count: number;
  mode: TreeState;
}