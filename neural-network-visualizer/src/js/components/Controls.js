class Controls {
    constructor(neuralNetworkVis) {
        this.neuralNetworkVis = neuralNetworkVis;
        
        // Create control container
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.className = 'controls';
        
        // Add model selection dropdown
        this.addModelSelector();
        
        // Add separator
        const separator = document.createElement('div');
        separator.className = 'control-separator';
        this.controlsContainer.appendChild(separator);
        
        // Create layer count control
        this.addLayerCountControl();
        
        // Add to document
        document.body.appendChild(this.controlsContainer);
    }
    
    addModelSelector() {
        // Create wrapper for model selection
        const modelSelectorWrapper = document.createElement('div');
        modelSelectorWrapper.className = 'control-group';
        
        // Create label
        const label = document.createElement('label');
        label.textContent = 'Select Model:';
        label.setAttribute('for', 'model-selector');
        modelSelectorWrapper.appendChild(label);
        
        // Create dropdown
        this.modelSelector = document.createElement('select');
        this.modelSelector.id = 'model-selector';
        this.modelSelector.className = 'space-dropdown';
        
        // Add common TensorFlow/Keras models
        const models = [
            { value: 'custom', text: 'Custom Model' },
            { value: 'vgg16', text: 'VGG16' },
            { value: 'vgg19', text: 'VGG19' },
            { value: 'resnet50', text: 'ResNet50' },
            { value: 'mobilenet', text: 'MobileNet' },
            { value: 'densenet121', text: 'DenseNet121' },
            { value: 'efficientnetb0', text: 'EfficientNetB0' },
            { value: 'inception_v3', text: 'Inception V3' },
            { value: 'xception', text: 'Xception' }
        ];
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.text;
            this.modelSelector.appendChild(option);
        });
        
        modelSelectorWrapper.appendChild(this.modelSelector);
        
        // Create load button
        const loadButton = document.createElement('button');
        loadButton.textContent = 'Load Model';
        loadButton.className = 'space-button';
        loadButton.addEventListener('click', () => {
            const selectedModel = this.modelSelector.value;
            this.loadModel(selectedModel);
        });
        modelSelectorWrapper.appendChild(loadButton);
        
        this.controlsContainer.appendChild(modelSelectorWrapper);
    }
    
    addLayerCountControl() {
        // Create wrapper for layer count control
        const layerCountWrapper = document.createElement('div');
        layerCountWrapper.className = 'control-group';
        
        // Create label
        const label = document.createElement('label');
        label.textContent = 'Number of Layers:';
        layerCountWrapper.appendChild(label);
        
        // Create slider container
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        
        // Create input
        this.layerCountInput = document.createElement('input');
        this.layerCountInput.type = 'range';
        this.layerCountInput.min = 2;
        this.layerCountInput.max = 10;
        this.layerCountInput.value = 3;
        this.layerCountInput.step = 1;
        sliderContainer.appendChild(this.layerCountInput);
        
        // Create display for current value
        this.valueDisplay = document.createElement('span');
        this.valueDisplay.className = 'value-display';
        this.valueDisplay.textContent = this.layerCountInput.value;
        sliderContainer.appendChild(this.valueDisplay);
        
        layerCountWrapper.appendChild(sliderContainer);
        this.controlsContainer.appendChild(layerCountWrapper);
        
        // Add event listener
        this.layerCountInput.addEventListener('input', () => {
            const newLayerCount = parseInt(this.layerCountInput.value);
            this.valueDisplay.textContent = newLayerCount;
            this.neuralNetworkVis.updateLayers(newLayerCount);
        });
    }
    
    loadModel(modelName) {
        console.log(`Loading model: ${modelName}`);
        // This will be expanded to actually load model architectures
        
        // For now, just show a notification
        this.showNotification(`Selected model: ${modelName}. Loading...`);
        
        // In the future, this will fetch actual model architecture
        setTimeout(() => {
            // For demonstration purposes only - this would be replaced by actual model loading
            const layerCount = modelName === 'custom' ? 3 : this.getModelDefaultLayers(modelName);
            this.layerCountInput.value = layerCount;
            this.valueDisplay.textContent = layerCount;
            this.neuralNetworkVis.updateLayers(layerCount);
            
            this.showNotification(`Model ${modelName} loaded successfully!`, 'success');
        }, 1000);
    }
    
    getModelDefaultLayers(modelName) {
        // Return approximate layer counts for well-known models
        // (These are simplified for visualization purposes)
        const modelLayers = {
            'vgg16': 6,
            'vgg19': 8,
            'resnet50': 7,
            'mobilenet': 5,
            'densenet121': 6,
            'efficientnetb0': 5,
            'inception_v3': 9,
            'xception': 7
        };
        
        return modelLayers[modelName] || 5;
    }
    
    showNotification(message, type = 'info') {
        // Create notification if it doesn't exist
        if (!this.notification) {
            this.notification = document.createElement('div');
            this.notification.className = 'notification';
            document.body.appendChild(this.notification);
        }
        
        // Set message and type
        this.notification.textContent = message;
        this.notification.className = `notification notification-${type}`;
        
        // Show notification
        this.notification.style.display = 'block';
        
        // Hide after 3 seconds
        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = setTimeout(() => {
            this.notification.style.display = 'none';
        }, 3000);
    }
}

export default Controls;