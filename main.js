import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import getStarfield from "./src/getStarfield.js";

let scene, camera, renderer;

// Функція для створення планет
function createPlanet({ radius, texture, bumpMap, bumpScale, position, isSun = false }) {
    const loader = new THREE.TextureLoader();

    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = isSun
        ? new THREE.MeshBasicMaterial({
            map: loader.load(texture)
        })
        : new THREE.MeshStandardMaterial({
            map: loader.load(texture),
            bumpMap: loader.load(bumpMap),
            bumpScale: bumpScale,
        });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(...position);

    const planetOrbit = new THREE.Object3D();
    planetOrbit.add(planet);
    scene.add(planetOrbit);

    return {planet, planetOrbit};
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


    // Створення Меркурія
    const mercury = createPlanet({
        radius: 0.38,
        texture: 'textures/1mercury/mercurymap.jpg',
        bumpMap: 'textures/1mercury/mercurybump.jpg',
        bumpScale: 100,
        position: [17, 0, 17]
    });
    // Sun.add(mercury.planet, mercury.planetOrbit);

    // Створення Венери
    const venus = createPlanet({
        radius: 0.95,
        texture: 'textures/2venus/venusmap.jpg',
        bumpMap: 'textures/2venus/venusbump.jpg',
        bumpScale: 100,
        position: [22, 0, 22]
    });
    // Sun.add(venus);

    // Створення Землі
    const earth = createPlanet({
        radius: 1,
        texture: 'textures/3earth/earthmap1k.jpg',
        bumpMap: 'textures/3earth/earthbump.jpg',
        bumpScale: 300,
        position: [27, 0, 27]
    });
    // Sun.add(earth);

    // Створення Марса
    const mars = createPlanet({
        radius: 0.53,
        texture: 'textures/4mars/marsmap1k.jpg',
        bumpMap: 'textures/4mars/marsbump1k.jpg',
        bumpScale: 300,
        position: [35, 0, 35]
    });
    // Sun.add(mars);

    // Створення Юпітера
    const jupiter = createPlanet({
        radius: 8,
        texture: 'textures/5jupiter/jupitermap.jpg',
        bumpMap: 'textures/5jupiter/jupitermap.jpg',
        bumpScale: 10,
        position: [58, 0, 58]
    });
    // Sun.add(jupiter);

    // Створення Сатурна
    const saturn = createPlanet({
        radius: 6.5,
        texture: 'textures/6saturn/saturnmap.jpg',
        bumpMap: 'textures/6saturn/saturnmap.jpg',
        bumpScale: 10,
        position: [80, 0, 80]
    });
    // Sun.add(saturn);

    // Створення Урана
    const uranus = createPlanet({
        radius: 3.98,
        texture: 'textures/7uranus/uranusmap.jpg',
        bumpMap: 'textures/7uranus/uranusmap.jpg',
        bumpScale: 10,
        position: [100, 0, 100]
    });
    // Sun.add(uranus);

    // Створення Нептуна
    const neptune = createPlanet({
        radius: 3.86,
        texture: 'textures/8neptune/neptunemap.jpg',
        bumpMap: 'textures/8neptune/neptunemap.jpg',
        bumpScale: 10,
        position: [115, 0, 115]
    });
    // Sun.add(neptune);

    // Створення хмар для Землі
    const cloudGeometry = new THREE.SphereGeometry(1.1, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('textures/3earth/earthCloud.png'),
        transparent: true
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    clouds.position.set(0, 0, 0);
    // earth.add(clouds);

    // Додавання освітлення
    // Sun.material.emissive = new THREE.Color(0xffa500); // Додано емісійне освітлення (помаранчевий колір)
    // Sun.material.emissiveIntensity = 1; // Інтенсивність емісії
    // scene.add(Sun);

    const sunLight = new THREE.PointLight(0xffffff, 10000, 300);
    sunLight.position.set(0, 0, 0);  // Встановити позицію світла на позицію Сонця
    scene.add(sunLight);

    //
    // const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    // scene.add(ambientLight);


    // Додавання зірок
    const stars = getStarfield({ numStars: 5000 });
    scene.add(stars);



    scene.add(Sun);
    // Анімація
    const animate = () => {
        requestAnimationFrame(animate);

        //кругом Сонця

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
