import Layer from './components/Layer.js';
import Connection from './components/Connection.js';

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
}

export { NeuralNetworkVis };