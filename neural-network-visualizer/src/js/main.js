// src/js/main.js

import * as THREE from 'three';
import { NeuralNetworkVis } from './NeuralNetworkVis.js';
import { setupScene } from './utils/SceneSetup.js';
import Controls from './components/Controls.js';

let scene, camera, renderer, neuralNetworkVis, controls, orbitControls;
let stars = [];
let raycaster, mouse;
let hoveredLayer = null;
let tooltipElement;

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
    
    // Setup raycaster for hover detection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Create tooltip element
    createTooltip();
    
    // Add mouse move event listener
    window.addEventListener('mousemove', onMouseMove);
    
    // Start animation loop
    animate();
}

function createTooltip() {
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'tooltip';
    tooltipElement.style.display = 'none';
    document.body.appendChild(tooltipElement);
}

function updateTooltip(x, y, layer) {
    const tooltipContent = `
        <div class="tooltip-header">${layer.layerInfo.name}</div>
        <div class="tooltip-body">
            ${getLayerDetails(layer)}
        </div>
    `;
    
    tooltipElement.innerHTML = tooltipContent;
    tooltipElement.style.left = `${x + 15}px`;
    tooltipElement.style.top = `${y + 15}px`;
    tooltipElement.style.display = 'block';
}

function getLayerDetails(layer) {
    const info = layer.layerInfo;
    let details = '';
    
    // Display different details depending on the layer type
    Object.keys(info).forEach(key => {
        if (key !== 'name') {
            details += `<div><span class="property">${key}:</span> ${info[key]}</div>`;
        }
    });
    
    return details;
}

function hideTooltip() {
    tooltipElement.style.display = 'none';
}

function onMouseMove(event) {
    // Convert mouse position to normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Check if mouse is over a layer
    checkLayerHover();
}

function checkLayerHover() {
    if (!neuralNetworkVis || !neuralNetworkVis.layers) return;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Find all intersections with layer meshes
    const layerMeshes = neuralNetworkVis.layers.map(layer => layer.mesh);
    const intersects = raycaster.intersectObjects(layerMeshes, true);
    
    // If we found an intersection, show the tooltip
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        let layerObject = null;
        
        // Find the main mesh with the layer reference
        if (intersectedObject.userData.layerObject) {
            layerObject = intersectedObject.userData.layerObject;
        } else if (intersectedObject.parent && intersectedObject.parent.userData.layerObject) {
            layerObject = intersectedObject.parent.userData.layerObject;
        }
        
        if (layerObject) {
            hoveredLayer = layerObject;
            updateTooltip(event.clientX, event.clientY, hoveredLayer);
            
            // Highlight the hovered layer
            layerObject.material.emissiveIntensity = 0.8;
        }
    } else {
        // Reset highlight if previously hovered
        if (hoveredLayer) {
            hoveredLayer.material.emissiveIntensity = 0.4;
            hoveredLayer = null;
        }
        hideTooltip();
    }
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
            if (layer !== hoveredLayer) {
                layer.mesh.rotation.y = Math.sin(Date.now() * 0.0005) * Math.PI * 0.1 + Math.PI * 0.05;
            }
        });
    }
    
    // Subtle starfield rotation
    stars.forEach(star => {
        star.rotation.y += 0.0001;
        star.rotation.z += 0.0002;
    });
    
    // Check for layer hover
    checkLayerHover();
    
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