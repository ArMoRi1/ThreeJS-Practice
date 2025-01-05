import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import getStarfield from "./src/getStarfield.js";

let scene, camera, renderer, raycaster, mouse;
let isAnimationRunning = true;
const loader = new THREE.TextureLoader();
let isMovingCamera = false;
let controls;

const planets = [];
const planetObjects = {};
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

const cameraPositions = {
    '2d': {
        position: new THREE.Vector3(0, 300, 0),
        rotation: new THREE.Euler(-Math.PI / 2, 0, 0)
    },
    '3d': {
        position: new THREE.Vector3(150, 150, 0),
        rotation: new THREE.Euler(-Math.PI / 2, Math.PI / 4, Math.PI / 2)
    }
};

function switchView(mode) {
    isMovingCamera = true;
    const targetPosition = cameraPositions[mode].position;
    const targetRotation = cameraPositions[mode].rotation;

    // Create current position point
    const currentPosition = {
        position: camera.position.clone(),
        rotation: camera.rotation.clone()
    };

    const duration = 1000;
    const startTime = Date.now();

    controls.enabled = false;

    function animateCamera() {
        if (!isMovingCamera) {
            // Вмикаємо controls тільки для 3D режиму
            controls.enabled = mode === '3d';
            return;
        }

        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const ease = progress * (2 - progress); // Ease function for smoother transition

        // Interpolate position
        camera.position.lerpVectors(currentPosition.position, targetPosition, ease);

        // Interpolate rotation (angles in Euler)
        camera.rotation.x = THREE.MathUtils.lerp(currentPosition.rotation.x, targetRotation.x, ease);
        camera.rotation.y = THREE.MathUtils.lerp(currentPosition.rotation.y, targetRotation.y, ease);
        camera.rotation.z = THREE.MathUtils.lerp(currentPosition.rotation.z, targetRotation.z, ease);

        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            isMovingCamera = false;
            // Вмикаємо controls тільки для 3D режиму
            controls.enabled = mode === '3d';
            controls.update();
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        // Перевіряємо чи checkbox активний по замовчуванню
        const viewSwitch = document.getElementById("viewSwitch");
        console.log(viewSwitch.checked);
        // Якщо checkbox активний (тобто 3D за замовчуванням), змінюємо вигляд
        if (viewSwitch.checked) {
            switchView('3d');  // Перемикаємо на 3D
        } else {
            switchView('2d');  // Якщо чекбокс не активний, ставимо 2D
        }

        // Слухач подій для зміни режиму
        viewSwitch.addEventListener("change", () => {
            if (viewSwitch.checked) {
                switchView('3d');  // Якщо 3D режим
            } else {
                switchView('2d');  // Якщо 2D режим
            }
        });
    });

    animateCamera();
}


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

// Create orbit ring
    const orbitRadius = position[0]; // Центральний радіус орбіти
    const orbitGeometry = new THREE.RingGeometry(orbitRadius - 0.5, orbitRadius + 0.5, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // Білий колір орбіти
        side: THREE.DoubleSide,
        opacity: 0.05,
        transparent: true
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2; // Зробити кільце горизонтальним
    // if(planet !== asteroidBelt){
    planetOrbit.add(orbit);
    // }



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
    planetObjects[name] = planet;



    return { planet, planetOrbit };
}


function createAsteroid(position, radius) {
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const asteroid = new THREE.Mesh(geometry, material);
    asteroid.position.set(...position);
    return asteroid;
}

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

function moveToObject(object) {
    if (!object) return;

    isAnimationRunning = false;
    const pauseIcon = document.querySelector('.pause-icon');
    const playIcon = document.querySelector('.play-icon');
    if (pauseIcon && playIcon) {
        pauseIcon.style.display = 'none';
        playIcon.style.display = 'block';
    }

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

    controls.enabled = false;

    function animate() {
        if (!isMovingCamera) {
            isMovingCamera = false;
            controls.enabled = true;
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
            controls.enabled = true;

            controls.target.copy(worldPosition);
            controls.update();
        }
    }

    animate();
}

function setupMenuListeners() {
    const menuItems = document.querySelectorAll('.header-menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const planetName = item.textContent;
            const planet = planetObjects[planetName];

            if (planet) {
                moveToObject(planet);

                const infoBox = document.getElementById('infoBox');
                const planetNameElement = document.getElementById('planetName');
                const planetInfoText = document.getElementById('planetInfo');

                planetNameElement.innerText = planetInfo[planetName].name;
                planetInfoText.innerText = planetInfo[planetName].info;
                infoBox.style.display = 'block';

                infoBox.style.left = '20px';
                infoBox.style.top = '100px';
            }
        });
    });
}

function canvasCursorType() {
    const canvas = document.getElementById('c');
    const viewSwitch = document.getElementById('viewSwitch');
    let isDragging = false; // додамо змінну для перевірки стану натискання

    canvas.style.cursor = 'grab';

    // Обробляємо натискання миші на canvas
    canvas.addEventListener('mousedown', () => {
        isDragging = true; // користувач натиснув і тягне
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false; // користувач відпустив мишу
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mouseleave', () => {
        if (isDragging) {
            canvas.style.cursor = 'grab'; // якщо миша залишає елемент під час натискання
            isDragging = false;
        }
    });

    // Обробка переміщення миші
    canvas.addEventListener('mousemove', (event) => {
        if (!isDragging) {
            // Не оновлюємо курсор, якщо користувач тягне мишу
            const is3DMode = viewSwitch.checked;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(planets, true);

            if (intersects.length > 0) {
                canvas.style.cursor = 'pointer';
            } else {
                canvas.style.cursor = 'grab';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('c');
    if (canvas) {
        canvasCursorType();
    }
});

window.addEventListener('click', onClickObject);
function onClickObject(event) {
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

            if (
                infoBox.style.display === 'block' &&
                planetNameElement.innerText === planetInfo[planetName].name
            ) {
                infoBox.style.display = 'none';
            } else {
                planetNameElement.innerText = planetInfo[planetName].name;
                planetInfoText.innerText = planetInfo[planetName].info;
                infoBox.style.display = 'block';
                infoBox.style.left = `${event.clientX + 20}px`;
                infoBox.style.top = `${event.clientY + 20}px`;
            }
            moveToObject(selectedPlanet, 2);
        }
    } else {
        infoBox.style.display = 'none';
    }
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



    window.addEventListener('cover', onCoverObject);
    const tooltip = document.getElementById('tooltip');
    function onCoverObject(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        tooltip.style.left = event.clientX + 'px';
        tooltip.style.top = event.clientY + 'px';

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planets, true);

        if (intersects.length > 0) {
            const selectedPlanet = intersects[0].object;
            const planetName = selectedPlanet.userData.planetName;

            if (planetName) {
                tooltip.style.display = 'block';
                tooltip.style.left = event.clientX + 'px';
                tooltip.style.top = (event.clientY - 40) + 'px';
                tooltip.textContent = planetName;
            }
        } else {
            tooltip.style.display = 'none';
        }
    }
    renderer.domElement.addEventListener('mousemove', onCoverObject);
    renderer.domElement.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
    });

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.zoomSpeed = 5;
    controls.minDistance = 5;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Додаємо обробник події для перемикача
    const viewSwitch = document.getElementById('viewSwitch');
    viewSwitch.addEventListener('change', (event) => {
        const mode = event.target.checked ? '3d' : '2d';
        switchView(mode);
    });
    const axesHelper = new THREE.AxesHelper( 500 );
    scene.add(axesHelper );
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

    const stars = getStarfield({ numStars: 5000 });
    scene.add(stars);

    const sunLight = new THREE.PointLight(0xffffff, 10000, 300);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    window.addEventListener('load', function () {
        // Після повного завантаження сторінки
        setupMenuListeners();
    });

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

    const slider = document.getElementById('myRange');
    let animationSpeed = slider.value;
    slider.addEventListener('input', () => {
        animationSpeed = slider.value;  // Оновлюємо значення
    });

    const animate = () => {
        requestAnimationFrame(animate);

        if (isAnimationRunning) {
            Sun.planetOrbit.rotateY(0.0004 * animationSpeed);
            mercury.planetOrbit.rotateY(0.009 * animationSpeed);
            venus.planetOrbit.rotateY(0.006 * animationSpeed);
            earth.planetOrbit.rotateY(0.004 * animationSpeed);
            mars.planetOrbit.rotateY(0.002 * animationSpeed);
            asteroidBelt.rotateY(0.0005 * animationSpeed);
            jupiter.planetOrbit.rotateY(0.0010 * animationSpeed);
            saturn.planetOrbit.rotateY(0.0008 * animationSpeed);
            uranus.planetOrbit.rotateY(0.0006 * animationSpeed);
            neptune.planetOrbit.rotateY(0.0004 * animationSpeed);
        }

        renderer.render(scene, camera);
    };

    animate();
}

window.onload = main;