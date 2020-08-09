import * as THREE from 'three/build/three.module.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {CopyShader} from 'three/examples/jsm/shaders/CopyShader.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import earthMap from './textures/earthmap4k.jpg'
import fairCloud from './textures/fair_clouds_4k.png'
import starryBackground from './textures/starry_background.jpg'
import earthNormalMap from './textures/earth_normalmap_flat4k.jpg'
import earthSpecMap from "./textures/earthspec4k.jpg"

let camera, scene, renderer, cameraControl, cameraBG, sceneBG, composer;

init();
animate();
window.addEventListener("resize", onWindowResize, false);

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 40;

  scene = new THREE.Scene();

  // Create sphere object
  const sphereGeometry = new THREE.SphereGeometry(15, 30, 30);
  const sphereMaterial = createEarthMaterial();
  const earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  earthMesh.name = "earth";
  scene.add(earthMesh);

  // Create transparent sphere with clouds
  const cloudGeometry = new THREE.SphereGeometry(15.25, 30, 30);
  const cloudMaterial = createCloudMaterial();
  const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
  cloudMesh.name = "cloud";
  scene.add(cloudMesh);

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(20, 10, -10);
  directionalLight.name = "directionalLight";
  scene.add(directionalLight);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x111111);
  ambientLight.name = "ambientLight";
  scene.add(ambientLight);

  // position and point the camera to the center of the scene
  camera.position.x = 25;
  camera.position.y = 10;
  camera.position.z = 23;
  camera.lookAt(scene.position);

  // add controls
  cameraControl = new OrbitControls(camera, renderer.domElement);

  // add background using a camera
  cameraBG = new THREE.OrthographicCamera(
    -window.innerWidth,
    window.innerWidth,
    window.innerHeight,
    -window.innerHeight,
    -10000,
    10000
  );
  cameraBG.position.z = 50;
  sceneBG = new THREE.Scene();

  const materialColor = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(
      starryBackground
    ),
    depthTest: false,
  });
  const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materialColor);
  bgPlane.position.z = -100;
  bgPlane.scale.set(window.innerWidth * 2, window.innerHeight * 2, 1);
  sceneBG.add(bgPlane);

  // setup the passes
  var bgPass = new RenderPass(sceneBG, cameraBG);
  var renderPass = new RenderPass(scene, camera);
  renderPass.clear = false;
  var effectCopy = new ShaderPass(CopyShader);
  effectCopy.renderToScreen = true;


  //add these passes to the composer 
  composer = new EffectComposer(renderer); 
  composer.addPass(bgPass); 
  composer.addPass(renderPass); 
  composer.addPass(effectCopy);
}

function createEarthMaterial() {
  const earthTexture = new THREE.TextureLoader().load(
    earthMap
  );
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture
  });
  earthMaterial.map = earthTexture;
  var normalMap = THREE.ImageUtils.loadTexture(
    earthNormalMap);
  earthMaterial.normalMap = normalMap;
  earthMaterial.normalScale = new THREE.Vector2(0.5, 0.7);

  var specularMap = THREE.ImageUtils.loadTexture(
    earthSpecMap
  );

  earthMaterial.specularMap = specularMap;
  earthMaterial.specular = new THREE.Color(0x262626);
  return earthMaterial;
}

function createCloudMaterial() {
  const cloudTexture = new THREE.TextureLoader().load(
    fairCloud
  );
  const cloudMaterial = new THREE.MeshPhongMaterial({ map: cloudTexture });
  cloudMaterial.map = cloudTexture;
  cloudMaterial.transparent = true;
  return cloudMaterial;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  cameraControl.update();


  requestAnimationFrame(animate);
  // renderer.render(scene, camera);
  // renderer.render(sceneBG, cameraBG);
  renderer.autoClear = false;
  composer.render();
}
