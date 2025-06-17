import * as THREE from 'three';

class Layer {
    constructor(x, y, width, height, depth = 0.5) {
        this.geometry = new THREE.BoxGeometry(width, height, depth, 1, 1, 1);
        
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