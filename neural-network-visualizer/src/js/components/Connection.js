import * as THREE from 'three';

class Connection {
    constructor(startLayer, endLayer) {
        this.startLayer = startLayer;
        this.endLayer = endLayer;
        
        // Create the line geometry
        const points = [
            startLayer.getPosition(),
            endLayer.getPosition()
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Create a brightly glowing line material
        const material = new THREE.LineBasicMaterial({ 
            color: 0x00ffaa,    // Bright green-cyan color
            linewidth: 2,
            transparent: true,
            opacity: 0.9
        });
        
        this.line = new THREE.Line(geometry, material);
        
        // Create a pulse animation for the connections
        this.initialOpacity = 0.9;
        this.pulseSpeed = 1.5;
        this.pulseTimer = Math.random() * Math.PI;
    }
    
    pulse() {
        if (!this.line || !this.line.material) return;
        
        this.pulseTimer += 0.01 * this.pulseSpeed;
        const opacityFactor = (Math.sin(this.pulseTimer) + 1) / 2;
        this.line.material.opacity = 0.6 + (opacityFactor * 0.4); // Brighter minimum opacity in space
    }
}

export default Connection;