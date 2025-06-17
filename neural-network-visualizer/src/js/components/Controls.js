class Controls {
    constructor(neuralNetworkVis) {
        this.neuralNetworkVis = neuralNetworkVis;
        
        // Create control container
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.className = 'controls';
        
        // Create label
        const label = document.createElement('label');
        label.textContent = 'Number of Layers:';
        this.controlsContainer.appendChild(label);
        
        // Create input
        this.layerCountInput = document.createElement('input');
        this.layerCountInput.type = 'range';
        this.layerCountInput.min = 2;
        this.layerCountInput.max = 10;
        this.layerCountInput.value = 3;
        this.layerCountInput.step = 1;
        this.controlsContainer.appendChild(this.layerCountInput);
        
        // Create display for current value
        this.valueDisplay = document.createElement('span');
        this.valueDisplay.textContent = this.layerCountInput.value;
        this.controlsContainer.appendChild(this.valueDisplay);
        
        // Add event listener
        this.layerCountInput.addEventListener('input', () => {
            const newLayerCount = parseInt(this.layerCountInput.value);
            this.valueDisplay.textContent = newLayerCount;
            this.neuralNetworkVis.updateLayers(newLayerCount);
        });
        
        // Add to document
        document.body.appendChild(this.controlsContainer);
    }
}

export default Controls;