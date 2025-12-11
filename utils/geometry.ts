import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';

const { SCATTER_RADIUS, TREE_HEIGHT, TREE_BASE_RADIUS } = CONFIG;

// Helper to get a random point in a sphere
const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const generateNeedlePositions = (count: number) => {
  const data = [];
  const color1 = new THREE.Color(COLORS.EMERALD_DEEP);
  const color2 = new THREE.Color(COLORS.EMERALD_LIGHT);
  const colorGold = new THREE.Color(COLORS.GOLD_METALLIC);

  for (let i = 0; i < count; i++) {
    // 1. Scatter State
    const scatterPos = getRandomSpherePoint(SCATTER_RADIUS);
    const scatterRot = new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    // 2. Tree State (Random Cloud in Cone Shape)
    // No spiral patterns. Pure random distribution within the cone volume.
    
    // Height from 0 to TREE_HEIGHT
    const h = Math.random() * TREE_HEIGHT;
    
    // Radius at this height (Linear Cone)
    const maxR = ((TREE_HEIGHT - h) / TREE_HEIGHT) * TREE_BASE_RADIUS;
    
    // Distribute mostly on the surface, but with some depth
    // r = maxR * sqrt(random) gives uniform disk distribution
    // r = maxR * (0.8 + 0.2 * random) gives a hollow shell (thicker look)
    const r = maxR * (0.6 + 0.4 * Math.random());
    
    const angle = Math.random() * Math.PI * 2;

    const treePos = new THREE.Vector3(
      r * Math.cos(angle),
      h - TREE_HEIGHT / 2, // Centered vertically
      r * Math.sin(angle)
    );

    // Rotation: Random rotation for cubes looks like glitter
    const treeRot = new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    // Color Logic
    let c = new THREE.Color().lerpColors(color1, color2, Math.random());
    
    // Occasional Gold Highlight
    if (Math.random() > 0.95) {
        c = colorGold;
    }

    data.push({
      scatterPosition: scatterPos,
      scatterRotation: scatterRot,
      treePosition: treePos,
      treeRotation: treeRot,
      scale: 0.2 + Math.random() * 0.3, // Small cubes
      color: c,
    });
  }
  return data;
};

export const generateOrnamentPositions = (count: number) => {
  const data = [];
  const colorGold = new THREE.Color(COLORS.GOLD_METALLIC);
  const colorRose = new THREE.Color(COLORS.GOLD_ROSE);
  const colorGem = new THREE.Color("#ff3366"); 

  for (let i = 0; i < count; i++) {
    const scatterPos = getRandomSpherePoint(SCATTER_RADIUS * 0.9);
    const scatterRot = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );

    // Random placement on the tree surface
    const h = Math.random() * TREE_HEIGHT;
    const maxR = ((TREE_HEIGHT - h) / TREE_HEIGHT) * TREE_BASE_RADIUS;
    // Ornaments sit slightly outside the bulk of needles
    const r = maxR + 0.2; 
    const angle = Math.random() * Math.PI * 2;

    const treePos = new THREE.Vector3(
      r * Math.cos(angle),
      h - TREE_HEIGHT / 2,
      r * Math.sin(angle)
    );
    
    const treeRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0);

    let c = new THREE.Color().lerpColors(colorGold, colorRose, Math.random());
    if (Math.random() > 0.8) c = colorGem;

    data.push({
      scatterPosition: scatterPos,
      scatterRotation: scatterRot,
      treePosition: treePos,
      treeRotation: treeRot,
      scale: 0.5 + Math.random() * 0.5,
      color: c,
    });
  }
  return data;
};