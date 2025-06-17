import * as THREE from 'three';

class Layer {
    constructor(x, y, width, height, depth = 0.5) {
        // Replace PlaneGeometry with BoxGeometry
        this.geometry = new THREE.BoxGeometry(width, height, depth);
        
        // Use MeshPhongMaterial for better 3D appearance
        this.material = new THREE.MeshPhongMaterial({ 
            color: 0x3498db,
            specular: 0x111111,
            shininess: 30
        });
        
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(x, y, 0);
        
        // Add subtle rotation to better show the 3D effect
        this.mesh.rotation.y = Math.PI * 0.05;
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