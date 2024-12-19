import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import getStarfield from "./src/getStarfield.js";
// import {textureLoad} from "three/build/three.tsl";

let scene, camera, renderer;

// Функція для створення планет

function createPlanet({ radius, texture, bumpMap, bumpScale, position, isSun = false, ring }) {
    const loader = new THREE.TextureLoader();

    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = isSun
        ? new THREE.MeshBasicMaterial({ map: loader.load(texture) })
        : new THREE.MeshStandardMaterial({
            map: loader.load(texture),
            bumpMap: loader.load(bumpMap),
            bumpScale: bumpScale,
        });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(...position);

    const planetOrbit = new THREE.Object3D();
    planetOrbit.add(planet);

    if (ring) {
        const ringGeometry = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: loader.load(ring.texture),
            side: THREE.DoubleSide,
            transparent: true,
            color: new THREE.Color(0x666666)
        });

        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);

        // Базове обертання для всіх кілець
        if (ring.texture.includes('uranus')) {
            // Для Урана - вертикальне положення
            ringMesh.rotation.x = 0;  // Скидаємо обертання по X
            ringMesh.rotation.z = Math.PI / 2;  // Повертаємо на 90 градусів навколо осі Z
        } else {
            // Для інших планет (Сатурна) - горизонтальне положення
            ringMesh.rotation.x = Math.PI / 2;
        }

        ringMesh.position.set(...position);
        planetOrbit.add(ringMesh);
    }

    scene.add(planetOrbit);

    return { planet, planetOrbit };
}

function main() {
    const canvas = document.querySelector('#c');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(150, 150, 0);

    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);

    new OrbitControls(camera, renderer.domElement);

    // Створення Сонця
    const Sun = createPlanet({
        radius: 20,
        texture: 'textures/0sun/sunmap.jpg',
        bumpMap: 'textures/0sun/sunmap.jpg',
        bumpScale: 300,
        position: [0, 0, 0],
        isSun: true
    });

    // Add the Sun to the scene
    scene.add(Sun.planetOrbit);

    // Create planets independently, don't add them to Sun
    const mercury = createPlanet({
        radius: 0.38,
        texture: 'textures/1mercury/mercurymap.jpg',
        bumpMap: 'textures/1mercury/mercurybump.jpg',
        bumpScale: 100,
        position: [17, 0, 17]
    });

    const venus = createPlanet({
        radius: 0.95,
        texture: 'textures/2venus/venusmap.jpg',
        bumpMap: 'textures/2venus/venusbump.jpg',
        bumpScale: 100,
        position: [22, 0, 22]
    });

    const earth = createPlanet({
        radius: 1,
        texture: 'textures/3earth/earthmap1k.jpg',
        bumpMap: 'textures/3earth/earthbump.jpg',
        bumpScale: 300,
        position: [27, 0, 27]
    });

    const mars = createPlanet({
        radius: 0.53,
        texture: 'textures/4mars/marsmap1k.jpg',
        bumpMap: 'textures/4mars/marsbump1k.jpg',
        bumpScale: 300,
        position: [35, 0, 35]
    });

    const jupiter = createPlanet({
        radius: 8,
        texture: 'textures/5jupiter/jupitermap.jpg',
        bumpMap: 'textures/5jupiter/jupitermap.jpg',
        bumpScale: 10,
        position: [58, 0, 58]
    });

    const saturn = createPlanet({
        radius: 6.5,
        texture: 'textures/6saturn/saturnmap.jpg',
        bumpMap: 'textures/6saturn/saturnmap.jpg',
        bumpScale: 10,
        position: [80, 0, 80],
        ring: { innerRadius: 10, outerRadius: 20, texture: 'textures/6saturn/saturnringcolor.jpg' },
    });

    const uranus = createPlanet({
        radius: 3.98,
        texture: 'textures/7uranus/uranusmap.jpg',
        bumpMap: 'textures/7uranus/uranusmap.jpg',
        bumpScale: 10,
        position: [100, 0, 100],
        ring: { innerRadius: 13, outerRadius: 14, texture: 'textures/7uranus/uranusringcolor.jpg' },
    });

    const neptune = createPlanet({
        radius: 3.86,
        texture: 'textures/8neptune/neptunemap.jpg',
        bumpMap: 'textures/8neptune/neptunemap.jpg',
        bumpScale: 10,
        position: [115, 0, 115]
    });

    // Add lighting
    const sunLight = new THREE.PointLight(0xffffff, 10000, 300);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const stars = getStarfield({ numStars: 5000 });
    scene.add(stars);

    // Анімація
    const animate = () => {
        requestAnimationFrame(animate);

        // Rotation of planets and their orbits
        Sun.planetOrbit.rotateY(0.0004);
        Sun.planet.rotateY(0.0004);

        mercury.planetOrbit.rotateY(0.009);
        mercury.planet.rotateY(0.009);

        venus.planetOrbit.rotateY(0.006);
        venus.planet.rotateY(0.006);

        earth.planetOrbit.rotateY(0.004);
        earth.planet.rotateY(0.004);

        mars.planetOrbit.rotateY(0.002);
        mars.planet.rotateY(0.002);

        jupiter.planetOrbit.rotateY(0.0010);
        jupiter.planet.rotateY(0.0010);

        saturn.planetOrbit.rotateY(0.0008);
        saturn.planet.rotateY(0.0008);

        uranus.planetOrbit.rotateY(0.0006);
        uranus.planet.rotateY(0.0006);


        neptune.planetOrbit.rotateY(0.0004);
        neptune.planet.rotateY(0.0004);

        renderer.render(scene, camera);
    };

    animate();
}

window.onload = main;
