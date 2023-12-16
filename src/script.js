import * as THREE from "three";
import daruma_frag from "./shaders/daruma.frag";
import daruma_vert from "./shaders/daruma.vert";
import lefteye_frag from "./shaders/lefteye.frag"
import lefteye_vert from "./shaders/lefteye.vert"
import text_frag from "./shaders/text.frag";
import text_vert from "./shaders/text.vert";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import GUI from 'lil-gui'

const daruma = './daruma_3.glb'
const lefteye = './lefteye_15.glb'
const righteye = './righteye_11.glb'
const typeface = './Tsukimi Rounded_Regular.json'
const galaxy = './Nebula-realistic-1-k.hdr';
// const typeface = './Rounded Mplus 1c Medium_Regular.json'

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    //this.renderer = new THREE.WebGLRenderer();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    this.renderer.setPixelRatio(window.devicePixelRatio*2);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1); 
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.3;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    //var frustumSize = 2;
    //var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 2.5);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;
    
    this.addObjects();
    this.resize();
    
    this.setupResize();
    // this.settings();

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

    // Material for Daruma 
    this.darumaMaterial = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        tsugaru: {type:'t', value: new THREE.TextureLoader().load('./tsugaru_512.jpg')}, 
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
    const eye_pattern_array = [0.07, 0.2, 1.0]
    const eye_pattern = eye_pattern_array[Math.floor(Math.random() * eye_pattern_array.length)]
    console.log(eye_pattern)

    const eye_color_array = [1, 2, 3, 4, 5, 6, 7]
    const eye_color = eye_color_array[Math.floor(Math.random() * eye_color_array.length)]
    console.log(eye_color)

    const eye_cycle_array = [32, 64, 128];
    const eye_cycle =  eye_cycle_array[Math.floor(Math.random() * eye_cycle_array.length)]
    console.log(eye_cycle)

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

    // Text Material
    this.textMaterial = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uMin: { type: "v3", value: new THREE.Vector3(0, 0, 0)},
        uMax: {type: "v3", value: new THREE.Vector3(0, 0, 0)},
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: text_vert,
      fragmentShader: text_frag
    });

    this.textMaterial.transparent = true;



    // Video Material for Right Eye
    let video = document.getElementById("video")
    video.addEventListener('canplay', function() {
      this.play();
    });
    video.load();
    video.play()
    this.videoTexture = new THREE.VideoTexture(video)
    console.log(this.videoTexture)

    this.righteyeMaterial = new THREE.MeshBasicMaterial({
      map: this.videoTexture,
      side: THREE.DoubleSide,
    })


    this.hdriLoader = new RGBELoader();
    //const pmremGenerator = new THREE.PMREMGenerator( this.renderer );

    this.hdriLoader.load( galaxy, (texture) => {
      //const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
      //texture.dispose();
      //this.scene.background = texture; 
      //this.scene.environment = envMap;
      //this.scene.background = envMap;
      
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = texture;
      this.scene.enviroment = texture;
      console.log(this.scene.backgounrd)
      
    } );


    
    //
    // Load Daruma GLTF
    // 
    this.loader = new GLTFLoader()
    this.loader.load(daruma, (gltf)=>{
      console.log(gltf)
      this.scene.add(gltf.scene)
      this.daruma = gltf.scene
      console.log(this.daruma)
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
    this.loader.load(lefteye, (gltf)=>{
      console.log(gltf)
      this.scene.add(gltf.scene)
      this.lefteye = gltf.scene
      console.log(this.lefteye)
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
    this.loader.load(righteye, (gltf)=>{
      console.log(gltf)
      this.scene.add(gltf.scene)
      this.righteye = gltf.scene
      console.log(this.righteye)
      gltf.scene.traverse( o => {
          // o.geometry.center()
          o.scale.set(0.25, 0.25, 0.25)
          o.position.set(0, -0.5, 0)
          o.material = this.righteyeMaterial
        }
      )
    })

    //
    // Load Text 
    // 
    
    const fontLoader = new FontLoader()
    fontLoader.load(typeface, (font) => {
      console.log("loaded font!!")
      const textGeometry = new TextGeometry("ようこさん、はやくげんきになってください。 ーだるまより", {
      font: font,
      size: 0.1,
      height: 0.001,
      curveSegments: 100,
      bevelEnabled: false,
      })

      textGeometry.center()
      textGeometry.computeBoundingBox()
      console.log(textGeometry.boundingBox)
      this.textMaterial.uniforms.uMin.value = textGeometry.boundingBox.min
      this.textMaterial.uniforms.uMax.value = textGeometry.boundingBox.max

      

      const text = new THREE.Mesh(textGeometry, this.textMaterial);
      //text.castShadow = true
      //text.position.z = 1
      this.scene.add(text);

    })

    // Adding Axis
    // const axesHelper = new THREE.AxesHelper( 5 );
    // this.scene.add( axesHelper );

    // Adding plane 
    /*this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.plane = new THREE.Mesh(this.geometry, this.righteyeMaterial);
    this.scene.add(this.plane);*/



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
    this.time += 0.05;
    this.videoTexture.needsUpdate = true
    this.darumaMaterial.uniforms.time.value = this.time;
    this.lefteyeMaterial.uniforms.time.value = this.time;
    this.textMaterial.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));

    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById('webgl')
});