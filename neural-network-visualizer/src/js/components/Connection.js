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
        const material = new THREE.LineBasicMaterial({ color: 0x2ecc71 });
        this.line = new THREE.Line(geometry, material);
    }
}

export default Connection;