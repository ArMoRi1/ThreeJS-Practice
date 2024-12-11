import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import getStarfield from "./src/getStarfield.js";

let scene, camera, renderer;

// Функція для створення планет
function createPlanet({ radius, texture, bumpMap, bumpScale, position }) {
    const loader = new THREE.TextureLoader();

    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        // roughness: 1,
        // metalness: 0,
        map: loader.load(texture),
        bumpMap: loader.load(bumpMap),
        bumpScale: bumpScale,
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(...position);
    return planet;
}

function main() {
    const canvas = document.querySelector('#c');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 7;
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);

    new OrbitControls(camera, renderer.domElement);

    // Створення Сонця
    const Sun = createPlanet({
        radius: 0.6,
        texture: 'textures/0sun/sunmap.jpg',
        bumpMap: 'textures/0sun/sunmap.jpg',
        bumpScale: 300,
        position: [0, 0, 0]
    });
    scene.add(Sun);

    // Створення Меркурія
    const mercury = createPlanet({
        radius: 0.38,
        texture: 'textures/1mercury/mercurymap.jpg',
        bumpMap: 'textures/1mercury/mercurybump.jpg',
        bumpScale: 100,
        position: [1, 0, 1]
    });
    scene.add(mercury);

    // Створення Венери
    const venus = createPlanet({
        radius: 0.95,
        texture: 'textures/2venus/venusmap.jpg',
        bumpMap: 'textures/2venus/venusbump.jpg',
        bumpScale: 100,
        position: [1.87, 0, 1.87]
    });
    scene.add(venus);

    // Створення Землі
    const earth = createPlanet({
        radius: 1,
        texture: 'textures/3earth/earthmap1k.jpg',
        bumpMap: 'textures/3earth/earthbump.jpg',
        bumpScale: 300,
        position: [2.58, 0, 2.58]
    });
    scene.add(earth);

    // Створення Марса
    const mars = createPlanet({
        radius: 0.53,
        texture: 'textures/4mars/marsmap1k.jpg',
        bumpMap: 'textures/4mars/marsbump1k.jpg',
        bumpScale: 300,
        position: [3.94, 0, 3.94]
    });
    scene.add(mars);

    // Створення Юпітера
    const jupiter = createPlanet({
        radius: 10.96,
        texture: 'textures/5jupiter/jupitermap.jpg',
        bumpMap: 'textures/5jupiter/jupitermap.jpg',
        bumpScale: 10,
        position: [13.43, 0, 13.43]
    });
    scene.add(jupiter);

    // Створення Сатурна
    const saturn = createPlanet({
        radius: 9.14,
        texture: 'textures/6saturn/saturnmap.jpg',
        bumpMap: 'textures/6saturn/saturnmap.jpg',
        bumpScale: 10,
        position: [	24.68, 0, 24.68]
    });
    scene.add(saturn);

    // Створення Урана
    const uranus = createPlanet({
        radius: 3.98,
        texture: 'textures/7uranus/uranusmap.jpg',
        bumpMap: 'textures/7uranus/uranusmap.jpg',
        bumpScale: 10,
        position: [49.58, 0, 49.58]
    });
    scene.add(uranus);

    // Створення Нептуна
    const neptune = createPlanet({
        radius: 3.86,
        texture: 'textures/8neptune/neptunemap.jpg',
        bumpMap: 'textures/8neptune/neptunemap.jpg',
        bumpScale: 10,
        position: [77.49, 0, 77.49]
    });
    scene.add(neptune);

    // Створення хмар для Землі
    const cloudGeometry = new THREE.SphereGeometry(1.1, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('textures/3earth/earthCloud.png'),
        transparent: true
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    clouds.position.copy(earth.position);
    scene.add(clouds);

    // Додавання освітлення
    // Sun.material.emissive = new THREE.Color(0xffa500); // Додано емісійне освітлення (помаранчевий колір)
    // Sun.material.emissiveIntensity = 1; // Інтенсивність емісії
    // scene.add(Sun);

    // const sunLight = new THREE.PointLight(0xffffff, 10000, 100000);
    // sunLight.position.set(0, 0, 0);  // Встановити позицію світла на позицію Сонця
    // scene.add(sunLight);


    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);


    // Додавання зірок
    const stars = getStarfield({ numStars: 5000 });
    scene.add(stars);

    // Анімація
    const animate = () => {
        requestAnimationFrame(animate);
        earth.rotation.y -= 0.0015;
        clouds.rotation.y += 0.0015;
        renderer.render(scene, camera);
    };

    animate();
}

window.onload = main;
