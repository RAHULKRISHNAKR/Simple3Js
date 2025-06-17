// src/js/main.js

import * as THREE from 'three';
import { NeuralNetworkVis } from './NeuralNetworkVis.js';
import { setupScene } from './utils/SceneSetup.js';
import Controls from './components/Controls.js';

let scene, camera, renderer, neuralNetworkVis, controls, orbitControls;
let stars = [];

function init() {
    // Setup ThreeJS scene
    const container = document.getElementById('visualization');
    const { scene: s, camera: c, renderer: r, orbitControls: o } = setupScene(container);
    scene = s;
    camera = c;
    renderer = r;
    orbitControls = o;
    
    // Find stars in the scene
    scene.traverse((object) => {
        if (object instanceof THREE.Points) {
            stars.push(object);
        }
    });
    
    // Set camera position for better view
    camera.position.z = 10;
    
    // Create neural network visualization
    neuralNetworkVis = new NeuralNetworkVis(scene);
    neuralNetworkVis.createLayers(3); // Initialize with 3 layers
    
    // Create UI controls
    controls = new Controls(neuralNetworkVis);
    
    // Update controls style to match space theme
    updateControlsStyle();
    
    // Start animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update orbit controls
    orbitControls.update();
    
    // Animate connections
    if (neuralNetworkVis && neuralNetworkVis.connections) {
        neuralNetworkVis.connections.forEach(connection => {
            if (connection.pulse) {
                connection.pulse();
            }
        });
    }
    
    // Rotate all layers slightly
    if (neuralNetworkVis && neuralNetworkVis.layers) {
        neuralNetworkVis.layers.forEach(layer => {
            layer.mesh.rotation.y = Math.sin(Date.now() * 0.0005) * Math.PI * 0.1 + Math.PI * 0.05;
        });
    }
    
    // Subtle starfield rotation
    stars.forEach(star => {
        star.rotation.y += 0.0001;
        star.rotation.z += 0.0002;
    });
    
    renderer.render(scene, camera);
}

function updateControlsStyle() {
    // Make the controls panel match the space theme
    const controlsElement = document.querySelector('.controls');
    if (controlsElement) {
        controlsElement.style.backgroundColor = 'rgba(0, 30, 60, 0.7)';
        controlsElement.style.color = '#ffffff';
        controlsElement.style.border = '1px solid #00aaff';
        controlsElement.style.boxShadow = '0 0 10px rgba(0, 150, 255, 0.5)';
    }
}

// Initialize when the window loads
window.addEventListener('load', init);