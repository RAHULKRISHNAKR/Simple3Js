// src/js/main.js

import * as THREE from 'three';
import { NeuralNetworkVis } from './NeuralNetworkVis.js';
import { setupScene } from './utils/SceneSetup.js';
import Controls from './components/Controls.js';

let scene, camera, renderer, neuralNetworkVis, controls, orbitControls;

function init() {
    // Setup ThreeJS scene
    const container = document.getElementById('visualization');
    const { scene: s, camera: c, renderer: r, orbitControls: o } = setupScene(container);
    scene = s;
    camera = c;
    renderer = r;
    orbitControls = o;
    
    // Set camera position for better view
    camera.position.z = 10;
    
    // Create neural network visualization
    neuralNetworkVis = new NeuralNetworkVis(scene);
    neuralNetworkVis.createLayers(3); // Initialize with 3 layers
    
    // Create UI controls
    controls = new Controls(neuralNetworkVis);
    
    // Start animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update orbit controls
    orbitControls.update();
    
    renderer.render(scene, camera);
}

// Initialize when the window loads
window.addEventListener('load', init);