import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import getStarfield from "./src/getStarfield.js";

let scene, camera, renderer, raycaster, mouse;
let isAnimationRunning = true;
const loader = new THREE.TextureLoader();


const planets = []; // Масив для збереження планет і Сонця
const planetObjects = {}; // Об'єкт для збереження посилань на планети // Масив для збереження планет і Сонця
const planetInfo = {
    "Sun": {
        name: "The Sun",
        info: "The Sun is the star at the center of the Solar System."
    },
    "Mercury": {
        name: "Mercury",
        info: "Mercury is the closest planet to the Sun and the smallest in the Solar System."
    },
    "Venus": {
        name: "Venus",
        info: "Venus is the second planet from the Sun and has a toxic atmosphere."
    },
    "Earth": {
        name: "Earth",
        info: "Earth is the third planet from the Sun and the only known planet with life."
    },
    "Mars": {
        name: "Mars",
        info: "Mars is the fourth planet from the Sun and is known as the Red Planet."
    },
    "Jupiter": {
        name: "Jupiter",
        info: "Jupiter is the fifth planet from the Sun and the largest in the Solar System."
    },
    "Saturn": {
        name: "Saturn",
        info: "Saturn is the sixth planet from the Sun, famous for its ring system."
    },
    "Uranus": {
        name: "Uranus",
        info: "Uranus is the seventh planet from the Sun and has a unique tilted orbit."
    },
    "Neptune": {
        name: "Neptune",
        info: "Neptune is the eighth and farthest planet from the Sun."
    }
};

// Функція для створення планет
function createPlanet({ radius, texture, bumpMap, bumpScale, position, isSun = false, ring, name }) {
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
    planet.userData.planetName = name;

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
        ringMesh.rotation.x = ring.texture.includes('uranus') ? 0 : Math.PI / 2;
        ringMesh.position.set(...position);
        planetOrbit.add(ringMesh);
    }

    scene.add(planetOrbit);

    // Store the planet reference in planetObjects
    planetObjects[name] = planet;

    return { planet, planetOrbit };
}

// Функція для створення астероїдів
function createAsteroid(position, radius) {
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const asteroid = new THREE.Mesh(geometry, material);
    asteroid.position.set(...position);
    return asteroid;
}

// Функція для створення кільця астероїдів
function createAsteroidBelt(innerRadius, outerRadius, numAsteroids) {
    const asteroidBelt = new THREE.Object3D();
    for (let i = 0; i < numAsteroids; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
        const x = distance * Math.cos(angle);
        const z = distance * Math.sin(angle);
        const y = (Math.random() - 0.5) * 2;
        const asteroid = createAsteroid([x, y, z], Math.random() * 0.3 + 0.1);
        asteroidBelt.add(asteroid);
    }
    scene.add(asteroidBelt);
    return asteroidBelt;

}

// Функція для переміщення камери до об'єкта
// Update the moveToObject function
let isMovingCamera = false;
let controls; // Move OrbitControls to global scope



function moveToObject(object) {
    if (!object) return;

    // First, pause the system animation
    isAnimationRunning = false;
    const pauseIcon = document.querySelector('.pause-icon');
    const playIcon = document.querySelector('.play-icon');
    if (pauseIcon && playIcon) {
        pauseIcon.style.display = 'none';
        playIcon.style.display = 'block';
    }

    // If camera is already moving, stop the current animation
    if (isMovingCamera) {
        isMovingCamera = false;
        return;
    }

    isMovingCamera = true;
    const objectRadius = object.geometry.parameters.radius;
    const distance = objectRadius * 5;
    const offset = new THREE.Vector3(distance, distance * 0.5, distance);

    const duration = 1000;
    const startCameraPos = camera.position.clone();
    const startTime = Date.now();

    // Disable OrbitControls during animation
    controls.enabled = false;

    function animate() {
        if (!isMovingCamera) {
            isMovingCamera = false;
            controls.enabled = true;  // Re-enable controls if animation is stopped
            return;
        }

        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const ease = progress * (2 - progress);

        const worldPosition = new THREE.Vector3();
        object.getWorldPosition(worldPosition);

        const currentTargetPosition = new THREE.Vector3()
            .copy(worldPosition)
            .add(offset);

        camera.position.lerpVectors(startCameraPos, currentTargetPosition, ease);
        camera.lookAt(worldPosition);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isMovingCamera = false;
            controls.enabled = true;  // Re-enable controls after animation

            // Set the OrbitControls target to the object's position
            controls.target.copy(worldPosition);
            controls.update();
        }
    }

    animate();
}

// Додавання обробників подій для меню
function setupMenuListeners() {
    const menuItems = document.querySelectorAll('.header-menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const planetName = item.textContent;
            const planet = planetObjects[planetName];

            if (planet) {
                moveToObject(planet);

                // Show planet information
                const infoBox = document.getElementById('infoBox');
                const planetNameElement = document.getElementById('planetName');
                const planetInfoText = document.getElementById('planetInfo');

                planetNameElement.innerText = planetInfo[planetName].name;
                planetInfoText.innerText = planetInfo[planetName].info;
                infoBox.style.display = 'block';

                // Position the info box
                infoBox.style.left = '20px';
                infoBox.style.top = '100px';
            }
        });
    });
}

const animationButton = document.getElementById('animationButton');
const playIcon = animationButton.querySelector('.play-icon');
const pauseIcon = animationButton.querySelector('.pause-icon');

animationButton.addEventListener('click', () => {
    isAnimationRunning = !isAnimationRunning;

    if (isAnimationRunning) {
        pauseIcon.style.display = 'block';
        playIcon.style.display = 'none';
    } else {
        pauseIcon.style.display = 'none';
        playIcon.style.display = 'block';
    }
});

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

    // new OrbitControls(camera, renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Додавання планет і Сонця
    const Sun = createPlanet({
        radius: 20,
        texture: 'textures/0sun/sunmap.jpg',
        bumpMap: 'textures/0sun/sunmap.jpg',
        bumpScale: 300,
        position: [0, 0, 0],
        isSun: true,
        name: "Sun"
    });
    planets.push(Sun.planet);

    const mercury = createPlanet({
        radius: 0.38,
        texture: 'textures/1mercury/mercurymap.jpg',
        bumpMap: 'textures/1mercury/mercurybump.jpg',
        bumpScale: 100,
        position: [17, 0, 17],
        name: "Mercury",
    });
    planets.push(mercury.planet);

    const venus = createPlanet({
        radius: 0.95,
        texture: 'textures/2venus/venusmap.jpg',
        bumpMap: 'textures/2venus/venusbump.jpg',
        bumpScale: 100,
        position: [22, 0, 22],
        name: "Venus"
    });
    planets.push(venus.planet);

    const earth = createPlanet({
        radius: 1,
        texture: 'textures/3earth/earthmap1k.jpg',
        bumpMap: 'textures/3earth/earthbump.jpg',
        bumpScale: 300,
        position: [27, 0, 27],
        name: "Earth"
    });
    planets.push(earth.planet);

    const mars = createPlanet({
        radius: 0.53,
        texture: 'textures/4mars/marsmap1k.jpg',
        bumpMap: 'textures/4mars/marsbump1k.jpg',
        bumpScale: 300,
        position: [35, 0, 35],
        name: "Mars"
    });
    planets.push(mars.planet);

    const asteroidBelt = createAsteroidBelt(55, 63, 500);

    const jupiter = createPlanet({
        radius: 8,
        texture: 'textures/5jupiter/jupitermap.jpg',
        bumpMap: 'textures/5jupiter/jupitermap.jpg',
        bumpScale: 10,
        position: [58, 0, 58],
        name: "Jupiter",
    });
    planets.push(jupiter.planet);

    const saturn = createPlanet({
        radius: 6.5,
        texture: 'textures/6saturn/saturnmap.jpg',
        bumpMap: 'textures/6saturn/saturnmap.jpg',
        bumpScale: 10,
        position: [80, 0, 80],
        name: "Saturn",
        ring: { innerRadius: 10, outerRadius: 20, texture: 'textures/6saturn/saturnringcolor.jpg' }
    });
    planets.push(saturn.planet);

    const uranus = createPlanet({
        radius: 3.98,
        texture: 'textures/7uranus/uranusmap.jpg',
        bumpMap: 'textures/7uranus/uranusmap.jpg',
        bumpScale: 10,
        position: [100, 0, 100],
        name: "Uranus",
        ring: { innerRadius: 13, outerRadius: 14, texture: 'textures/7uranus/uranusringcolor.jpg' }
    });
    planets.push(uranus.planet);

    const neptune = createPlanet({
        radius: 3.86,
        texture: 'textures/8neptune/neptunemap.jpg',
        bumpMap: 'textures/8neptune/neptunemap.jpg',
        bumpScale: 10,
        position: [115, 0, 115],
        name: "Neptune",
    });
    planets.push(neptune.planet);

    // Додавання зірок
    const stars = getStarfield({ numStars: 5000 });
    scene.add(stars);

    // Додавання освітлення
    const sunLight = new THREE.PointLight(0xffffff, 10000, 300);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Подія "mousemove" для взаємодії з об'єктами
    window.addEventListener('mousemove', onMouseMove);

    function onMouseMove(event) {
        // Нормалізація координат миші
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Виявлення об'єктів
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planets);

        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';  // Зміна курсора
        } else {
            document.body.style.cursor = 'default';  // Повернення до стандартного курсора
        }
    }

    // Подія "click" для взаємодії з об'єктами
    window.addEventListener('click', onClick);

    function onClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planets);
        const infoBox = document.getElementById('infoBox');

        if (intersects.length > 0) {
            const selectedPlanet = intersects[0].object;
            const planetName = selectedPlanet.userData.planetName;

            if (planetName && planetInfo[planetName]) {
                const planetNameElement = document.getElementById('planetName');
                const planetInfoText = document.getElementById('planetInfo');

                // If infoBox is already displayed for this planet, hide it
                if (
                    infoBox.style.display === 'block' &&
                    planetNameElement.innerText === planetInfo[planetName].name
                ) {
                    infoBox.style.display = 'none';
                } else {
                    // Show info for the newly selected planet
                    planetNameElement.innerText = planetInfo[planetName].name;
                    planetInfoText.innerText = planetInfo[planetName].info;
                    infoBox.style.display = 'block';
                    infoBox.style.left = `${event.clientX + 20}px`;
                    infoBox.style.top = `${event.clientY + 20}px`;
                }
                moveToObject(selectedPlanet, 2);
            }
        } else {
            // Click outside of any planet - hide the info box
            infoBox.style.display = 'none';
        }
    }
    setupMenuListeners();
    // Анімація
    const animate = () => {
        requestAnimationFrame(animate);

        if (isAnimationRunning) {
            Sun.planetOrbit.rotateY(0.0004);
            mercury.planetOrbit.rotateY(0.009);
            venus.planetOrbit.rotateY(0.006);
            earth.planetOrbit.rotateY(0.004);
            mars.planetOrbit.rotateY(0.002);
            asteroidBelt.rotateY(0.0005);
            jupiter.planetOrbit.rotateY(0.0010);
            saturn.planetOrbit.rotateY(0.0008);
            uranus.planetOrbit.rotateY(0.0006);
            neptune.planetOrbit.rotateY(0.0004);
        }

        renderer.render(scene, camera);
    };

    animate();
}

window.onload = main;
