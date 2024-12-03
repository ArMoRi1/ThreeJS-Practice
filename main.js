import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xff9900);
let camera = new THREE.PerspectiveCamera();
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);

document.body.appendChild(renderer.domElement);



const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);
new OrbitControls(camera, renderer.domElement);
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1,8);

const material = new THREE.MeshStandardMaterial({
    map: loader.load("./textures/00_earthmap1k.jpg"),
    // specularMap: loader.load("./textures/02_earthspec1k.jpg"),
    // bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
    // bumpScale: 0.04,

});

const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
    map: loader.load("./textures/03_earthlights1k.jpg"),
    blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

const stars = getStarfield({numStars:10000});
scene.add(stars);



const sunLight = new THREE.DirectionalLight(0xffffff);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

function animate(){
    requestAnimationFrame(animate);
    // earthMesh.rotation.x += 0.001;
    earthMesh.rotation.y += 0.002;
    lightsMesh.rotation.y += 0.002;
    renderer.render(scene, camera);
}

animate();