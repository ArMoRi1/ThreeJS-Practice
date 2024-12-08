
//
// import getStarfield from "./src/getStarfield.js";
//
// const w = window.innerWidth;
// const h = window.innerHeight;
// const scene = new THREE.Scene();

// let camera = new THREE.PerspectiveCamera(45, window.innerWidth/innerHeight);
// camera.position.z = 5;
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(w, h);
//
// document.body.appendChild(renderer.domElement);
//
//
//
// const earthGroup = new THREE.Group();
// earthGroup.rotation.z = -23.4 * Math.PI / 180;
// scene.add(earthGroup);
// new OrbitControls(camera, renderer.domElement);
// const loader = new THREE.TextureLoader();
// const geometry = new THREE.IcosahedronGeometry(1,8);
//
// const material = new THREE.MeshPhongMaterial({
//     // map: loader.load("./textures/00_earthmap1k.jpg"),
//     // specularMap: loader.load("./textures/02_earthspec1k.jpg"),
//     // bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
//     // bumpScale: 0.04,
//     roughness : 1,
//     metalness: 0,
//     map: loader.load("./textures/00_earthmap1k.jpg"),
//
//
// });
//
// const earthMesh = new THREE.Mesh(geometry, material);
// earthGroup.add(earthMesh);
//
// const lightsMat = new THREE.MeshBasicMaterial({
//     map: loader.load("./textures/03_earthlights1k.jpg"),
//     blending: THREE.AdditiveBlending,
// });
// const lightsMesh = new THREE.Mesh(geometry, lightsMat);
// earthGroup.add(lightsMesh);
//
// const stars = getStarfield({numStars:10000});
// scene.add(stars);
//
//
//
// const sunLight = new THREE.DirectionalLight(0xffffff);
// sunLight.position.set(-2, 0.5, 1.5);
// scene.add(sunLight);
//
// function animate(){
//     requestAnimationFrame(animate);
//     // earthMesh.rotation.x += 0.001;
//     earthMesh.rotation.y += 0.002;
//     lightsMesh.rotation.y += 0.002;
//     renderer.render(scene, camera);
// }
//
// animate();

import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import getStarfield from "./src/getStarfield.js";

let scene;
let camera;
let renderer;


function main()
{
    const canvas = document.querySelector('#c');


    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2;
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true,});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.autoClear = false;
    renderer.setClearColor(0x00000, 0.0);

    new OrbitControls(camera, renderer.domElement);
    // create earthgeometry
    const loader = new THREE.TextureLoader()
    const earthgeometry = new THREE.SphereGeometry(0.6,32,32);

    const eatrhmaterial = new THREE.MeshPhongMaterial({
        roughness : 1,
        metalness:0,
        map: loader.load('textures/earthmap1k.jpg'),
        bumpMap: loader.load('textures/earthbump.jpg'),
        bumpScale: 300,
    });

    const earthmesh = new THREE.Mesh(earthgeometry,eatrhmaterial);

    scene.add(earthmesh);

    // set ambientlight

    const ambientlight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientlight);

    // set point light

    const pointerlight =  new THREE.PointLight(0xffffff,100);

    // set light position

    pointerlight.position.set(5,3,5);
    scene.add(pointerlight);

    // cloud
    const cloudgeometry =  new THREE.SphereGeometry(0.63,32,32);

    const cloudmaterial = new THREE.MeshPhongMaterial({
        map: loader.load('textures/earthCloud.png'),
        transparent: true
    });

    const cloudmesh = new THREE.Mesh(cloudgeometry,cloudmaterial);
    scene.add(cloudmesh);

    // star
    const stars = getStarfield({numStars:5000});
    scene.add(stars);

    const animate = () =>{
        requestAnimationFrame(animate);
        earthmesh.rotation.y -= 0.0015;
        cloudmesh.rotation.y += 0.0015;
        render();
    }

    const render = () => {
        renderer.render(scene,camera);
    }

    animate();
}

window.onload = main;
