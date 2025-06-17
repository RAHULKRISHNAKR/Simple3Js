export function createRectangleGeometry(width, height) {
    const geometry = new THREE.PlaneGeometry(width, height);
    return geometry;
}

export function createLineMaterial(color, linewidth = 2) {
    return new THREE.LineBasicMaterial({ color: color, linewidth: linewidth });
}

export function createLayerMaterial(color) {
    return new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
}

export function createConnectionLine(start, end) {
    const points = [];
    points.push(start);
    points.push(end);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
}