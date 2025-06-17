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

        for (let i = 0; i < numLayers; i++) {
            const layer = new Layer(i * spacing - ((numLayers - 1) * spacing / 2), 0, layerWidth, layerHeight);
            this.layers.push(layer);
            this.scene.add(layer.mesh);
        }
        this.createConnections();
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