// Дані про планети з їх параметрами для 3D візуалізації
export const planetData = {
    sun: {
        radius: 20,
        texture: 'textures/0sun/sunmap.jpg',
        bumpMap: 'textures/0sun/sunmap.jpg',
        bumpScale: 300,
        position: [0, 0, 0],
        isSun: true,
        name: "Sun"
    },
    mercury: {
        radius: 0.38,
        texture: 'textures/1mercury/mercurymap.jpg',
        bumpMap: 'textures/1mercury/mercurybump.jpg',
        bumpScale: 100,
        position: [17, 0, 17],
        name: "Mercury"
    },
    venus: {
        radius: 0.95,
        texture: 'textures/2venus/venusmap.jpg',
        bumpMap: 'textures/2venus/venusbump.jpg',
        bumpScale: 100,
        position: [22, 0, 22],
        name: "Venus"
    },
    earth: {
        radius: 1,
        texture: 'textures/3earth/earthmap1k.jpg',
        bumpMap: 'textures/3earth/earthbump.jpg',
        bumpScale: 300,
        position: [27, 0, 27],
        name: "Earth"
    },
    mars: {
        radius: 0.53,
        texture: 'textures/4mars/marsmap1k.jpg',
        bumpMap: 'textures/4mars/marsbump1k.jpg',
        bumpScale: 300,
        position: [35, 0, 35],
        name: "Mars"
    },
    jupiter: {
        radius: 8,
        texture: 'textures/5jupiter/jupitermap.jpg',
        bumpMap: 'textures/5jupiter/jupitermap.jpg',
        bumpScale: 10,
        position: [58, 0, 58],
        name: "Jupiter"
    },
    saturn: {
        radius: 6.5,
        texture: 'textures/6saturn/saturnmap.jpg',
        bumpMap: 'textures/6saturn/saturnmap.jpg',
        bumpScale: 10,
        position: [80, 0, 80],
        name: "Saturn",
        ring: {
            innerRadius: 10,
            outerRadius: 20,
            texture: 'textures/6saturn/saturnringcolor.jpg'
        }
    },
    uranus: {
        radius: 3.98,
        texture: 'textures/7uranus/uranusmap.jpg',
        bumpMap: 'textures/7uranus/uranusmap.jpg',
        bumpScale: 10,
        position: [100, 0, 100],
        name: "Uranus",
        ring: {
            innerRadius: 13,
            outerRadius: 14,
            texture: 'textures/7uranus/uranusringcolor.jpg'
        }
    },
    neptune: {
        radius: 3.86,
        texture: 'textures/8neptune/neptunemap.jpg',
        bumpMap: 'textures/8neptune/neptunemap.jpg',
        bumpScale: 10,
        position: [115, 0, 115],
        name: "Neptune"
    }
};

export class PlanetSystem {
    constructor() {
        this.planets = [];
        this.asteroidBelt = null;
    }

    createPlanet(config) {
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
        // Повертаємо об'єкт з планетою та додатковими властивостями
        const planetObj = {
            planet: null, // тут буде об'єкт Three.js
            config: config
        };
        return planetObj;
    }

    createAsteroidBelt(innerRadius = 55, outerRadius = 63, count = 500) {
        this.asteroidBelt = {
            innerRadius,
            outerRadius,
            count
        };
        // Логіка створення поясу астероїдів
    }

    addPlanet(planet) {
        this.planets.push(planet);
    }

    getAllPlanets() {
        return this.planets;
    }

    updatePlanetPositions(time) {
        // Оновлення позицій планет для анімації
        this.planets.forEach(planet => {
            // Логіка оновлення позиції
        });
    }
}

// Функція для створення всієї сонячної системи
export function createSolarSystem() {
    const system = new PlanetSystem();

    // Створення Сонця
    const sun = system.createPlanet(planetData.sun);
    system.addPlanet(sun.planet);

    // Створення планет
    Object.values(planetData).forEach(planetConfig => {
        if (!planetConfig.isSun) {
            const planet = system.createPlanet(planetConfig);
            system.addPlanet(planet.planet);
        }
    });

    // Створення поясу астероїдів між Марсом та Юпітером
    system.createAsteroidBelt();

    return system;
}