import * as THREE from 'three';

class Layer {
    constructor(x, y, width, height, depth = 0.5, layerInfo = {}) {
        this.geometry = new THREE.BoxGeometry(width, height, depth, 1, 1, 1);
        
        // Store layer information
        this.layerInfo = {
            name: layerInfo.name || "Unnamed Layer",
            kernelSize: layerInfo.kernelSize || "3x3",
            filters: layerInfo.filters || 64,
            activation: layerInfo.activation || "ReLU",
            ...layerInfo
        };
        
        // Create bright, glowing material that stands out in space
        this.material = new THREE.MeshPhysicalMaterial({ 
            color: 0x88ffff,        // Bright cyan
            emissive: 0x66ccff,     // Blue glow
            emissiveIntensity: 0.4, 
            metalness: 0.2,
            roughness: 0.3,
            transmission: 0.2,      // Some transparency
            clearcoat: 1.0,         // Shiny coating
            clearcoatRoughness: 0.1
        });
        
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(x, y, 0);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.userData.layerObject = this; // Store reference to layer for raycasting
        
        // Add subtle rotation
        this.mesh.rotation.y = Math.PI * 0.05;
        
        // Add bright edge highlighting
        const edges = new THREE.EdgesGeometry(this.geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffffff,  // Bright white edges
            linewidth: 1.5
        });
        this.edgeLines = new THREE.LineSegments(edges, lineMaterial);
        this.mesh.add(this.edgeLines);
        
        // Add layer name as floating text
        this.createLayerLabel();
    }
    
    createLayerLabel() {
        // Create a canvas for the layer name
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        // Set canvas background to be transparent
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        context.font = 'Bold 24px Arial';
        context.fillStyle = 'rgba(255, 255, 255, 1.0)';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.layerInfo.name, canvas.width / 2, canvas.height / 2);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create sprite material using texture
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        
        // Create sprite
        this.labelSprite = new THREE.Sprite(spriteMaterial);
        this.labelSprite.scale.set(2, 0.5, 1);
        this.labelSprite.position.set(0, -1.5, 0); // Position below the layer
        
        this.mesh.add(this.labelSprite);
    }

    getPosition() {
        return new THREE.Vector3(
            this.mesh.position.x,
            this.mesh.position.y,
            this.mesh.position.z
        );
    }
}

export default Layer;