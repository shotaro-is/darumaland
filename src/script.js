import * as THREE from "three";
import daruma_frag from "./shaders/daruma.frag";
import daruma_vert from "./shaders/daruma.vert";
import lefteye_frag from "./shaders/lefteye.frag";
import lefteye_vert from "./shaders/lefteye.vert";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import GUI from 'lil-gui'

const daruma = './daruma_3.glb'
const lefteye = './lefteye_15.glb'
const righteye = './righteye_11.glb'
const galaxy = './Nebula-black.hdr';
const tsugaru = './tsugaru_black.jpg'

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    this.renderer.setPixelRatio(window.devicePixelRatio*2);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1); 
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.3;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.camera.position.set(0, 0, 1.5);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxDistance = 13.0;
    this.controls.minDistance = 1.0;

    this.time = 0;

    this.isPlaying = true;

    this.progressBarContainer = document.querySelector('.progress-bar-container');

    
    this.addObjects();
    this.resize();
    this.setupResize();
    this.render();


  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;



    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.gltfLoader = new GLTFLoader(this.manager);
    this.hdriLoader = new RGBELoader(this.manager);


    // Material for Daruma 
    this.darumaMaterial = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        tsugaru: {type:'t', value: this.textureLoader.load(tsugaru)}, 
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: daruma_vert,
      fragmentShader: daruma_frag
    });

    // Material for Left Eye
    //const eye_pattern_array = [0.07, 0.2, 1.0]
    //const eye_pattern = eye_pattern_array[Math.floor(Math.random() * eye_pattern_array.length)]
    const eye_pattern = 0.2;

    //const eye_color_array = [1, 2, 3, 4, 5, 6, 7]
    //const eye_color = eye_color_array[Math.floor(Math.random() * eye_color_array.length)]
    const eye_color = 8;

    //const eye_cycle_array = [32, 64, 128];
    //const eye_cycle =  eye_cycle_array[Math.floor(Math.random() * eye_cycle_array.length)]
    const eye_cycle = 64;

    this.lefteyeMaterial = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        pattern:{type:"v2", value: new THREE.Vector2(eye_pattern, eye_pattern)},
        color: {type: "f", value : eye_color},
        cycle: {type: "f", value : eye_cycle},
        // tsugaru: {type:'t', value: new THREE.TextureLoader().load('./tsugaru_512.jpg')}, 
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: lefteye_vert,
      fragmentShader: lefteye_frag
    });


    //
    // Load HDRI
    //
    this.hdriLoader.load( galaxy, (texture) =>  {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = texture;
      this.scene.enviroment = texture;
    } );

    
    //
    // Load Daruma GLTF
    // 
    this.gltfLoader.load(daruma, (gltf)=>{
      this.scene.add(gltf.scene)
      this.daruma = gltf.scene
      gltf.scene.traverse( o => {
          // o.geometry.center()
          o.scale.set(0.25, 0.25, 0.25)
          o.position.set(0, -0.5, 0)
          o.material = this.darumaMaterial
        }
      )
    })

    
    //
    // Load Left Eye GLTF
    //
    this.gltfLoader.load(lefteye, (gltf)=>{
      this.scene.add(gltf.scene)
      this.lefteye = gltf.scene
      gltf.scene.traverse( o => {
          // o.geometry.center()
          o.scale.set(0.25, 0.25, 0.25)
          o.position.set(0, -0.5, 0)
          o.material = this.lefteyeMaterial
        }
      )
    })

    //
    // Load Right Eye GLTF
    //
    this.gltfLoader.load(righteye, (gltf)=>{
      this.scene.add(gltf.scene)
      this.righteye = gltf.scene
      gltf.scene.traverse( o => {
          // o.geometry.center()
          o.scale.set(0.25, 0.25, 0.25)
          o.position.set(0, -0.5, 0)
          o.material = this.lefteyeMaterial
        }
      )
    })
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    const alpha = 1/(this.time*0.35);
    this.progressBarContainer.style.backgroundColor = `rgba(0, 0, 0, ${alpha}`
    if (this.time > 15) this.progressBarContainer.style.display = 'none';

    this.time += 0.05;
    this.darumaMaterial.uniforms.time.value = this.time;
    this.lefteyeMaterial.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));

    this.renderer.render(this.scene, this.camera);

    

  }
}

new Sketch({
  dom: document.getElementById('webgl')
});