// src/js/main.js

import * as THREE from 'three';
import { NeuralNetworkVis } from './NeuralNetworkVis.js';
import { setupScene } from './utils/SceneSetup.js';
import Controls from './components/Controls.js';

let scene, camera, renderer, labelRenderer, neuralNetworkVis, controls, orbitControls;
let stars = [];
let raycaster, mouse;
let hoveredLayer = null;
let tooltipElement;
let selectedLayer = null;
let expandedLayer = null;
let expandMode = null; // 'featureMaps' or 'nodes'
let layerActionPanel;
let actionPanelJustOpened = false;
let collapseButton;

let mouseX = 0;
let mouseY = 0;

window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    displayErrorOverlay(event.error);
});

function displayErrorOverlay(error) {
    const errorOverlay = document.createElement('div');
    errorOverlay.style.position = 'fixed';
    errorOverlay.style.top = '0';
    errorOverlay.style.left = '0';
    errorOverlay.style.width = '100%';
    errorOverlay.style.padding = '20px';
    errorOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    errorOverlay.style.color = 'white';
    errorOverlay.style.zIndex = '10000';
    errorOverlay.style.fontFamily = 'Arial, sans-serif';
    errorOverlay.textContent = `Error: ${error.message || 'Unknown error'}`;
    document.body.appendChild(errorOverlay);
}

function init() {
    try {
        // Setup ThreeJS scene
        const container = document.getElementById('visualization');
        if (!container) {
            throw new Error('Visualization container not found!');
        }
        
        const { scene: s, camera: c, renderer: r, labelRenderer: lr, orbitControls: o } = setupScene(container);
        scene = s;
        camera = c;
        renderer = r;
        labelRenderer = lr;
        orbitControls = o;
        
        // Set camera position - make sure it's not inside any object
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        
        // Find stars in the scene
        scene.traverse((object) => {
            if (object instanceof THREE.Points) {
                stars.push(object);
            }
        });
        
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
        
        // Initialize variables for layer action panel
        layerActionPanel = null;
        
        // Add mouse move event listener
        window.addEventListener('mousemove', onMouseMove);
        
        // Add mouse click event listener for layer selection
        window.addEventListener('mousedown', onMouseDown);
        
        // Add click outside to close menu
        window.addEventListener('click', (event) => {
            // Only close if we didn't just open the panel
            if (!actionPanelJustOpened && layerActionPanel && layerActionPanel.style.display !== 'none') {
                // Make sure click is truly outside the panel and not on one of its children
                if (!layerActionPanel.contains(event.target)) {
                    hideLayerActionPanel();
                }
            }
        });
        
        // Create global controls for full model views
        createGlobalControls();
        
        // Start animation loop
        animate();
    } catch (error) {
        console.error('Initialization error:', error);
        displayErrorOverlay(error);
    }
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
    // Store mouse coordinates for later use
    mouseX = event.clientX;
    mouseY = event.clientY;
    
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
            // Use stored coordinates instead of event.clientX and event.clientY
            updateTooltip(mouseX, mouseY, hoveredLayer);
            
            // Highlight the hovered layer
            layerObject.material.emissiveIntensity = 0.8;
            
            // Update layer action panel if this layer is selected
            if (selectedLayer === layerObject) {
                updateLayerActionPanel(layerObject);
            }
        }
    } else {
        // Reset highlight if previously hovered
        if (hoveredLayer && hoveredLayer !== selectedLayer) {
            hoveredLayer.material.emissiveIntensity = 0.4;
            hoveredLayer = null;
        }
        hideTooltip();
    }
}

function createLayerActionPanel() {
    const panel = document.createElement('div');
    panel.id = 'layer-action-panel';
    panel.className = 'layer-action-panel';
    
    const header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = '<span>Layer Actions</span>';
    panel.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'panel-content';
    panel.appendChild(content);
    
    document.body.appendChild(panel);
    return panel;
}

function updateLayerActionPanel(layer) {
    if (!layerActionPanel) {
        layerActionPanel = createLayerActionPanel();
    }
    
    // Update header
    const header = layerActionPanel.querySelector('.panel-header');
    header.innerHTML = `<span>${layer.layerInfo.name}</span>`;
    
    // Update content
    const content = layerActionPanel.querySelector('.panel-content');
    content.innerHTML = '';
    
    // Add feature maps button
    const featureMapsBtn = document.createElement('button');
    featureMapsBtn.className = 'panel-button';
    featureMapsBtn.textContent = 'Show Feature Maps';
    featureMapsBtn.addEventListener('click', () => {
        expandLayer(layer, 'featureMaps');
    });
    content.appendChild(featureMapsBtn);
    
    // Add nodes button
    const nodesBtn = document.createElement('button');
    nodesBtn.className = 'panel-button';
    nodesBtn.textContent = 'Show Neurons';
    nodesBtn.addEventListener('click', () => {
        expandLayer(layer, 'nodes');
    });
    content.appendChild(nodesBtn);
    
    // Show the panel
    layerActionPanel.style.display = 'block';
}

function hideLayerActionPanel() {
    if (layerActionPanel) {
        layerActionPanel.style.display = 'none';
    }
}

function expandLayer(layer, mode) {
    // If we already have an expanded layer, collapse it first
    if (expandedLayer) {
        collapseLayer();
    }
    
    expandedLayer = layer;
    expandMode = mode;
    
    // Use the NeuralNetworkVis to handle the expansion
    neuralNetworkVis.expandLayer(layer, mode);
    
    // Add a button to collapse back
    showCollapseButton();
}

function showCollapseButton() {
    if (!collapseButton) {
        collapseButton = document.createElement('button');
        collapseButton.className = 'collapse-button';
        collapseButton.textContent = 'Return to Network View';
        collapseButton.addEventListener('click', collapseLayer);
        document.body.appendChild(collapseButton);
    }
    collapseButton.style.display = 'block';
}

function hideCollapseButton() {
    if (collapseButton) {
        collapseButton.style.display = 'none';
    }
}

function collapseLayer() {
    // Check if we're in full model mode or single layer mode
    if (expandMode === 'fullModelNeurons') {
        // Clean up full model visualization
        if (neuralNetworkVis.expandedElements) {
            neuralNetworkVis.expandedElements.forEach(element => {
                neuralNetworkVis.scene.remove(element);
            });
            neuralNetworkVis.expandedElements = [];
        }
        
        if (neuralNetworkVis.expandedConnections) {
            neuralNetworkVis.expandedConnections.forEach(conn => {
                neuralNetworkVis.scene.remove(conn);
            });
            neuralNetworkVis.expandedConnections = [];
        }
        
        // Show original layers and connections
        neuralNetworkVis.layers.forEach(layer => {
            layer.mesh.visible = true;
        });
        
        neuralNetworkVis.connections.forEach(connection => {
            connection.line.visible = true;
        });
    }
    else if (expandedLayer) {
        // Collapse a single expanded layer
        neuralNetworkVis.collapseLayer(expandedLayer);
    }
    
    // Reset state variables
    expandedLayer = null;
    expandMode = null;
    
    // Hide the collapse button
    hideCollapseButton();
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
    
    // Render the scene
    renderer.render(scene, camera);
    
    // Render the labels
    labelRenderer.render(scene, camera);
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

function onMouseDown(event) {
    // Only handle left clicks
    if (event.button !== 0) return;
    
    // Update mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Check for intersections with layers
    raycaster.setFromCamera(mouse, camera);
    const layerMeshes = neuralNetworkVis.layers.map(layer => layer.mesh);
    const intersects = raycaster.intersectObjects(layerMeshes, true);
    
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
            // Select or deselect the layer
            if (selectedLayer === layerObject) {
                // Deselect if clicking the same layer again
                selectedLayer = null;
                hideLayerActionPanel();
            } else {
                // Select this layer
                selectedLayer = layerObject;
                updateLayerActionPanel(layerObject);
                
                // Set flag that panel was just opened
                actionPanelJustOpened = true;
                setTimeout(() => {
                    actionPanelJustOpened = false;
                }, 100);
            }
            
            // Keep the highlight on the selected layer
            layerObject.material.emissiveIntensity = 0.8;
            
            // CRUCIAL: Stop propagation AND prevent default
            event.stopPropagation();
            event.preventDefault();
        }
    } else {
        // If clicking elsewhere in the scene, deselect
        if (selectedLayer) {
            selectedLayer.material.emissiveIntensity = 0.4;
            selectedLayer = null;
            hideLayerActionPanel();
        }
    }
}

// Add this right after init()
function createGlobalControls() {
    const controls = document.createElement('div');
    controls.className = 'global-controls';
    
    const neuronViewBtn = document.createElement('button');
    neuronViewBtn.className = 'global-button';
    neuronViewBtn.textContent = 'Show All Neurons';
    neuronViewBtn.addEventListener('click', () => {
        // If we're already in this mode, collapse back to normal view
        if (expandMode === 'fullModelNeurons') {
            collapseLayer();
        } else {
            // First collapse any expanded layer
            if (expandedLayer) {
                collapseLayer();
            }
            
            // Enable full model neuron view
            expandMode = 'fullModelNeurons';
            neuralNetworkVis.expandLayer(null, 'fullModelNeurons');
            
            // Show the collapse button
            showCollapseButton();
        }
    });
    
    controls.appendChild(neuronViewBtn);
    document.body.appendChild(controls);
}