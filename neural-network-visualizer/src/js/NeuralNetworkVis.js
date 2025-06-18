import * as THREE from 'three';
import Layer from './components/Layer.js';
import Connection from './components/Connection.js';
import { CSS2DObject } from './utils/SceneSetup.js';

class NeuralNetworkVis {
    constructor(scene) {
        this.scene = scene;
        this.layers = [];
        this.connections = [];
    }

    createLayers(numLayers) {
        this.clearLayers();
        const layerWidth = 1;
        const layerHeight = 2;
        const spacing = 2;
        
        // Sample layer types to make it more realistic
        const layerTypes = [
            "Input", 
            "Conv2D", 
            "MaxPooling", 
            "Conv2D", 
            "Dense", 
            "Dropout", 
            "Dense", 
            "Output"
        ];

        for (let i = 0; i < numLayers; i++) {
            // Generate layer info based on position
            const layerInfo = this.generateLayerInfo(i, numLayers, layerTypes);
            
            // Create layer with position and info
            const layer = new Layer(
                i * spacing - ((numLayers - 1) * spacing / 2), 
                0, 
                layerWidth, 
                layerHeight,
                0.5, // depth
                layerInfo
            );
            
            this.layers.push(layer);
            this.scene.add(layer.mesh);
        }
        this.createConnections();
    }
    
    // Generate meaningful layer info based on position in network
    generateLayerInfo(index, totalLayers, layerTypes) {
        // Determine layer type based on position
        let layerType;
        if (index === 0) {
            layerType = "Input";
        } else if (index === totalLayers - 1) {
            layerType = "Output";
        } else {
            layerType = layerTypes[Math.min(index, layerTypes.length - 1)];
        }
        
        // Generate appropriate parameters based on layer type
        let info = {
            name: `Layer ${index + 1}: ${layerType}`
        };
        
        switch (layerType) {
            case "Input":
                info.shape = "224×224×3";
                break;
            case "Conv2D":
                info.kernelSize = "3×3";
                info.filters = 64 * (1 + Math.floor(index / 2));
                info.activation = "ReLU";
                info.padding = "same";
                break;
            case "MaxPooling":
                info.poolSize = "2×2";
                info.stride = "2×2";
                break;
            case "Dense":
                info.units = index === totalLayers - 2 ? 10 : 128;
                info.activation = index === totalLayers - 2 ? "softmax" : "ReLU";
                break;
            case "Dropout":
                info.rate = 0.3;
                break;
            case "Output":
                info.units = 10;
                info.activation = "softmax";
                break;
        }
        
        return info;
    }

    createConnections() {
        this.clearConnections();
        for (let i = 0; i < this.layers.length - 1; i++) {
            const connection = new Connection(this.layers[i], this.layers[i + 1]);
            this.connections.push(connection);
            this.scene.add(connection.line);
        }
    }

    clearLayers() {
        this.layers.forEach(layer => {
            this.scene.remove(layer.mesh);
        });
        this.layers = [];
    }

    clearConnections() {
        this.connections.forEach(connection => {
            this.scene.remove(connection.line);
        });
        this.connections = [];
    }

    updateLayers(numLayers) {
        this.createLayers(numLayers);
    }

    // Preparing for future implementation
    visualizeModelArchitecture(modelData) {
        console.log("Model data received:", modelData);
        // Will be implemented to visualize actual model architecture
        
        // For now, just update layers based on model data length
        if (modelData && modelData.layers) {
            this.updateLayers(modelData.layers.length);
        }
   }

    expandLayer(layer, mode) {
        // If we're asking for full model neuron view
        if (mode === 'fullModelNeurons') {
            // Hide all regular layers
            this.layers.forEach(l => {
                l.mesh.visible = false;
            });
            
            // Hide regular connections
            this.connections.forEach(connection => {
                connection.line.visible = false;
            });
            
            // Store that we're in full model mode
            this.expandedLayer = null; // No specific layer
            this.expandMode = mode;
            
            // Create the full model view
            this.createFullModelNeuronView();
            return;
        }
        
        // For single layer expansion (existing code)
        // Store the original position to return to later
        if (!layer.originalPosition) {
            layer.originalPosition = layer.mesh.position.clone();
        }

        // Move other layers away to make space
        this.layers.forEach(l => {
            if (l !== layer) {
                l.mesh.visible = false;
            }
        });
        
        // Hide the regular connections
        this.connections.forEach(connection => {
            connection.line.visible = false;
        });
        
        // Set the expanded layer to the center
        layer.mesh.position.set(0, 0, 0);
        
        // Create expanded view based on mode
        if (mode === 'featureMaps') {
            this.createFeatureMapsView(layer);
        } else if (mode === 'nodes') {
            this.createNodesView(layer);
        }
        
        // Store which layer is expanded and how
        this.expandedLayer = layer;
        this.expandMode = mode;
    }

    // Simplified collapseLayer method
    collapseLayer(layer) {
        // Clean up expanded elements in a single pass
        if (this.expandedElements) {
            this.expandedElements.forEach(element => {
                if (element instanceof THREE.Group) {
                    element.traverse(object => {
                        if (object.isCSS2DObject && object.element) {
                            if (object.element.parentNode) {
                                object.element.parentNode.removeChild(object.element);
                            }
                            
                            // Remove from parent
                            if (object.parent) {
                                object.parent.remove(object);
                            }
                        }
                    });
                }
                this.scene.remove(element);
            });
            this.expandedElements = [];
        }
        
        // Remove expanded connections
        if (this.expandedConnections) {
            this.expandedConnections.forEach(conn => this.scene.remove(conn));
            this.expandedConnections = [];
        }
        
        // Clean up any orphaned DOM elements
        document.querySelectorAll('.layer-label, .feature-map-label, .connection-info').forEach(el => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
        
        // Clean up any remaining CSS2DObjects
        this.scene.traverse(object => {
            if (object.isCSS2DObject && object.element) {
                if (object.element.parentNode) {
                    object.element.parentNode.removeChild(object.element);
                }
                if (object.parent) object.parent.remove(object);
            }
        });
        
        // Restore original position if applicable
        if (layer && layer.originalPosition) {
            layer.mesh.position.copy(layer.originalPosition);
        }
        
        // Show all layers and connections
        this.layers.forEach(l => l.mesh.visible = true);
        this.connections.forEach(c => c.line.visible = true);
        
        // Reset state
        this.expandedLayer = null;
        this.expandMode = null;
    }

    createFeatureMapsView(layer) {
        // Initialize arrays if they don't exist
        if (!this.expandedElements) this.expandedElements = [];
        if (!this.expandedConnections) this.expandedConnections = [];
        
        const layerType = layer.layerInfo.type || layer.layerInfo.name.split(':')[1].trim();
        let featureMapsCount = 4; // Default number
        
        // Determine number of feature maps based on layer type
        if (layerType.includes('Conv')) {
            featureMapsCount = Math.min(16, layer.layerInfo.filters || 16);
        } else if (layerType === 'Input') {
            featureMapsCount = 3; // RGB channels
        } else if (layerType.includes('Pool')) {
            featureMapsCount = 8;
        }
        
        // Create a grid of feature maps
        const mapSize = 0.4;
        const padding = 0.1;
        const mapsPerRow = Math.ceil(Math.sqrt(featureMapsCount));
        const totalWidth = mapsPerRow * (mapSize + padding) - padding;
        
        const group = new THREE.Group();
        
        for (let i = 0; i < featureMapsCount; i++) {
            const row = Math.floor(i / mapsPerRow);
            const col = i % mapsPerRow;
            
            const x = col * (mapSize + padding) - totalWidth / 2 + mapSize / 2;
            const y = -row * (mapSize + padding) + totalWidth / 2 - mapSize / 2;
            
            // Create a feature map visualization
            const geometry = new THREE.PlaneGeometry(mapSize, mapSize);
            
            // Use different colors for different feature maps
            const hue = i / featureMapsCount;
            const color = new THREE.Color().setHSL(hue, 0.7, 0.5);
            
            const material = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, 0.5);
            
            // Add feature map number
            const labelDiv = document.createElement('div');
            labelDiv.textContent = `FM ${i+1}`;
            labelDiv.className = 'feature-map-label';
            
            const label = new CSS2DObject(labelDiv);
            label.position.set(0, -mapSize/2 - 0.05, 0);
            mesh.add(label);
            
            group.add(mesh);
            this.expandedElements.push(mesh);
        }
        
        // Add the group to the scene
        this.scene.add(group);
        this.expandedElements.push(group);
        
        // Create connections to previous/next layer if needed
        if (this.layers.indexOf(layer) > 0 || this.layers.indexOf(layer) < this.layers.length - 1) {
            // This would require more complex logic to show connections between feature maps
            // For now, we'll just show a text indicating connections
            const connInfoDiv = document.createElement('div');
            connInfoDiv.textContent = "Connections to adjacent layers";
            connInfoDiv.className = 'connection-info';
            
            const connInfo = new CSS2DObject(connInfoDiv);
            connInfo.position.set(0, totalWidth / 2 + 0.5, 0);
            group.add(connInfo);
        }
    }

    createNodesView(layer) {
        // Initialize arrays if they don't exist
        if (!this.expandedElements) this.expandedElements = [];
        if (!this.expandedConnections) this.expandedConnections = [];
        
        const layerType = layer.layerInfo.type || layer.layerInfo.name.split(':')[1].trim();
        let nodeCount = 8; // Default number
        
        // Determine number of nodes based on layer type
        if (layerType.includes('Dense')) {
            nodeCount = layer.layerInfo.units || 16;
        } else if (layerType === 'Input') {
            nodeCount = 12; // Simplified input nodes
        } else if (layerType === 'Output') {
            nodeCount = layer.layerInfo.units || 10;
        }
        
        // Limit to a reasonable number for visualization
        nodeCount = Math.min(nodeCount, 32);
        
        // Create a circle of nodes
        const radius = 2;
        const group = new THREE.Group();
        
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            // Create a node visualization
            const geometry = new THREE.SphereGeometry(0.15, 16, 16);
            
            const material = new THREE.MeshPhongMaterial({
                color: 0x88ffff,
                emissive: 0x66ccff,
                emissiveIntensity: 0.4
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, 0);
            
            // Add to group
            group.add(mesh);
            this.expandedElements.push(mesh);
            
            // Add connections between nodes (fully connected within layer)
            if (i > 0) {
                for (let j = 0; j < i; j++) {
                    const prevNode = group.children[j];
                    const points = [
                        new THREE.Vector3(prevNode.position.x, prevNode.position.y, prevNode.position.z),
                        new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z)
                    ];
                    
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({
                        color: 0x004466,
                        transparent: true,
                        opacity: 0.3
                    });
                    
                    const line = new THREE.Line(geometry, material);
                    group.add(line);
                    this.expandedConnections.push(line);
                }
            }
        }
        
        // Add the group to the scene
        this.scene.add(group);
        this.expandedElements.push(group);
        
        // Create connections to previous/next layer if needed
        const layerIndex = this.layers.indexOf(layer);
        
        // This would show just a hint of connections to adjacent layers
        if (layerIndex > 0 || layerIndex < this.layers.length - 1) {
            const connInfoDiv = document.createElement('div');
            connInfoDiv.textContent = "Connections to adjacent layers";
            connInfoDiv.className = 'connection-info';
            
            const connInfo = new CSS2DObject(connInfoDiv);
            connInfo.position.set(0, radius + 0.5, 0);
            group.add(connInfo);
        }
    }

    // Add this new method to the NeuralNetworkVis class
    createFullModelNeuronView() {
        // Initialize arrays if they don't exist
        if (!this.expandedElements) this.expandedElements = [];
        if (!this.expandedConnections) this.expandedConnections = [];
        
        // Create a group for all neurons
        const neuronGroup = new THREE.Group();
        
        // Store positions of neurons by layer to create connections later
        const neuronPositionsByLayer = [];
        
        // For each layer, create neurons
        this.layers.forEach((layer, layerIndex) => {
            const layerType = layer.layerInfo.type || layer.layerInfo.name.split(':')[1].trim();
            
            // Determine neuron count based on layer type
            let neuronCount = 8; // Default
            if (layerType.includes('Dense')) {
                neuronCount = layer.layerInfo.units || 16;
            } else if (layerType === 'Input') {
                neuronCount = 12;
            } else if (layerType === 'Output') {
                neuronCount = layer.layerInfo.units || 10;
            } else if (layerType.includes('Conv')) {
                neuronCount = Math.min(16, layer.layerInfo.filters || 16);
            }
            
            // Cap to reasonable visualization size
            neuronCount = Math.min(neuronCount, 16);
            
            // Calculate x position for the layer
            const xPos = layerIndex * 3 - ((this.layers.length - 1) * 3 / 2);
            
            // Store positions for this layer
            const layerNeuronPositions = [];
            neuronPositionsByLayer.push(layerNeuronPositions);
            
            // Create neurons for this layer, arranged vertically
            const neuronSpacing = 0.5;
            const totalHeight = (neuronCount - 1) * neuronSpacing;
            
            for (let i = 0; i < neuronCount; i++) {
                const yPos = i * neuronSpacing - totalHeight / 2;
                
                // Create neuron mesh
                const geometry = new THREE.SphereGeometry(0.15, 16, 16);
                
                // Use color based on layer type
                let color;
                switch (layerType) {
                    case 'Input':
                        color = 0x88ddff; // Light blue
                        break;
                    case 'Output':
                        color = 0x88ffaa; // Light green
                        break;
                    case 'Conv2D':
                        color = 0xffaa88; // Orange
                        break;
                    case 'MaxPooling':
                        color = 0xaa88ff; // Purple
                        break;
                    default:
                        color = 0xffffff; // White
                }
                
                const material = new THREE.MeshPhongMaterial({
                    color: color,
                    emissive: 0x333333,
                    shininess: 70,
                    specular: 0x555555
                });
                
                const neuron = new THREE.Mesh(geometry, material);
                neuron.position.set(xPos, yPos, 0);
                
                // Store neuron position for connections
                layerNeuronPositions.push(new THREE.Vector3(xPos, yPos, 0));
                
                neuronGroup.add(neuron);
                this.expandedElements.push(neuron);
            }
            
            // Add layer label
            const labelDiv = document.createElement('div');
            labelDiv.textContent = layer.layerInfo.name;
            labelDiv.className = 'layer-label';
            
            const layerLabel = new CSS2DObject(labelDiv);
            layerLabel.position.set(xPos, -totalHeight/2 - 0.7, 0);
            neuronGroup.add(layerLabel);
        });
        
        // Create connections between layers
        for (let layerIndex = 0; layerIndex < neuronPositionsByLayer.length - 1; layerIndex++) {
            const currentLayerNeurons = neuronPositionsByLayer[layerIndex];
            const nextLayerNeurons = neuronPositionsByLayer[layerIndex + 1];
            
            // Create connections - not all neurons to reduce visual clutter
            const connectionDensity = 0.3; // Connect 30% of possible connections
            
            for (let i = 0; i < currentLayerNeurons.length; i++) {
                for (let j = 0; j < nextLayerNeurons.length; j++) {
                    // Only create some connections to avoid visual overload
                    if (Math.random() > connectionDensity) continue;
                    
                    const points = [currentLayerNeurons[i], nextLayerNeurons[j]];
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    
                    const material = new THREE.LineBasicMaterial({
                        color: 0x00ffaa,
                        transparent: true,
                        opacity: 0.2
                    });
                    
                    const connection = new THREE.Line(geometry, material);
                    neuronGroup.add(connection);
                    this.expandedConnections.push(connection);
                }
            }
        }
        
        // Add group to scene
        this.scene.add(neuronGroup);
        this.expandedElements.push(neuronGroup);
    }
}

export { NeuralNetworkVis };