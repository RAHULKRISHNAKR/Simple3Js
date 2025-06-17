import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function setupScene(container) {
    const scene = new THREE.Scene();
    
    // Set black background for space
    scene.background = new THREE.Color(0x000000);
    
    // Add stars to the background
    addStars(scene, 1000);
    
    const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    if (container) {
        container.appendChild(renderer.domElement);
    } else {
        document.body.appendChild(renderer.domElement);
    }
    
    // Create orbit controls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.rotateSpeed = 0.7;
    
    // Enhanced lighting for space environment
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3); // Reduced ambient light
    scene.add(ambientLight);
    
    // Main light source (like a sun)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(1, 1, 2);
    scene.add(mainLight);
    
    // Additional colored lights to make model pop
    const blueLight = new THREE.PointLight(0x4466ff, 0.8);
    blueLight.position.set(-3, 2, -1);
    scene.add(blueLight);
    
    const purpleLight = new THREE.PointLight(0xaa44ff, 0.5);
    purpleLight.position.set(3, -2, -1);
    scene.add(purpleLight);
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    return { scene, camera, renderer, orbitControls };
}

// Helper function to add stars
function addStars(scene, count) {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.8
    });
    
    const starVertices = [];
    
    for (let i = 0; i < count; i++) {
        // Create stars in a large sphere around the camera
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        
        starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    return stars;
}