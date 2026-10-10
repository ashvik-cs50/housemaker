import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Game } from "./Game.js";
import { UI } from "./ui/UI.js";
import { Player } from "./game/Player.js";
import { World } from "./game/World.js";
import { CameraController } from "./game/CameraController.js";
import { InteractionSystem } from "./game/InteractionSystem.js";
import { FurnitureSystem } from "./game/FurnitureSystem.js";
import { NeedsSystem } from "./game/NeedsSystem.js";
import { SaveSystem } from "./game/SaveSystem.js";
import { app, analytics } from "./firebase/firebase.js";

export class HousieGame {
  constructor() {
    this.clock = new THREE.Clock();
    this.running = true;
    this.delta = 0;
    this.keydownStates = {
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
      Space: false
    };
    
    // Three.js setup
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    
    // Subsystems
    this.ui = null;
    this.player = null;
    this.world = null;
    this.cameraController = null;
    this.interactionSystem = null;
    this.furnitureSystem = null;
    this.needsSystem = null;
    this.saveSystem = null;
    
    this.initPromise = null;
    
    this.init();
  }
  
  async init() {
    // Create Three.js renderer
    this.createRenderer();
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 20, 60);
    
    // Create camera
    this.createCamera();
    
    // Set up lighting
    this.createLighting();
    
    // Initialize game subsystems (except player which needs scene)
    this.ui = new UI();
    this.world = new World(this.scene);
    this.cameraController = new CameraController(this.camera, this.player);
    this.interactionSystem = new InteractionSystem(this.player, this.world);
    this.furnitureSystem = new FurnitureSystem(this.world, this.player);
    this.needsSystem = new NeedsSystem();
    this.saveSystem = new SaveSystem();
    
    // Create player
    this.player = new Player();
    this.player.scene = this.scene;
    this.player.createStickman(this.scene);
    this.player.color = this.getRandomColor();
    this.ui.updatePlayerColor(this.player.color);
    
    // Player position - start in living room (center)
    this.player.setPosition(0, 0);
    
    // Set interaction callback
    this.player.setInteractionCallback(() => this.interactionSystem.triggerInteraction());
    
    // Set up keyboard controls
    this.setupKeyboardControls();
    
    // Load furniture models
    await this.loadFurniture();
    
    // Update UI
    this.ui.updateNeedsBars(this.needsSystem);
    
    // Start game loop
    this.animate();
    
    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize(), false);
    
    console.log("Housie Game initialized successfully");
  }
  
  getRandomColor() {
    const palette = [
      "#FF6B6B", // Coral
      "#4ECDC4", // Teal
      "#44A08C", // Mint green
      "#9B59B6", // Lavender
      "#F39C12", // Sunshine yellow
      "#E74C3C", // Orange
      "#FF8C42", // Orange-red
      "#AA66CC", // Violet
      "#7FDBFF", // Sky blue
      "#FFE66D"  // Light yellow
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }
  
  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById("three-canvas").appendChild(this.renderer.domElement);
  }
  
  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);
  }
  
  createLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x4a4a6a, 0.8);
    this.scene.add(ambientLight);
    
    // Indoor light - ceiling
    const indoorLight = new THREE.DirectionalLight(0xffffff, 0.6);
    indoorLight.position.set(5, 5, 5);
    indoorLight.castShadow = true;
    indoorLight.shadow.mapSize.width = 1024;
    indoorLight.shadow.mapSize.height = 1024;
    indoorLight.shadow.camera.near = 0.5;
    indoorLight.shadow.camera.far = 20;
    this.scene.add(indoorLight);
    
    // Warm light
    const warmLight = new THREE.DirectionalLight(0xffa07a, 0.3);
    warmLight.position.set(-5, 3, -5);
    this.scene.add(warmLight);
    
    // Point light for cozy feel
    const pointLight = new THREE.PointLight(0xffd5a0, 0.4, 8);
    pointLight.position.set(0, 2, 0);
    this.scene.add(pointLight);
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  setupKeyboardControls() {
    // Handle keydown
    document.addEventListener("keydown", (e) => {
      if (this.keydownStates.hasOwnProperty(e.code)) {
        this.keydownStates[e.code] = true;
      }
      
      // Escape to exit build mode
      if (e.code === "Escape") {
        this.furnitureSystem.toggleBuildMode(false);
      }
    });
    
    // Handle keyup
    document.addEventListener("keyup", (e) => {
      if (this.keydownStates.hasOwnProperty(e.code)) {
        this.keydownStates[e.code] = false;
      }
    });
  }
  
  updatePlayerMovement() {
    // Read keyboard state and move player
    const speed = this.player.isRunning ? this.player.targetSpeed * 1.5 : this.player.targetSpeed;
    
    if (this.keydownStates.KeyW) {
      this.player.moveForward();
    }
    if (this.keydownStates.KeyS) {
      this.player.moveBackward();
    }
    if (this.keydownStates.KeyA) {
      this.player.moveLeft();
    }
    if (this.keydownStates.KeyD) {
      this.player.moveRight();
    }
    
    // Update player animation
    this.player.update(this.delta);
  }
  
  loadFurniture() {
    // World furniture already loaded via World.js
    // This is just a placeholder for any additional loading
    console.log("Furniture system ready");
    return Promise.resolve();
  }
  
  animate() {
    if (!this.running) return;
    
    this.delta = this.clock.getDelta();
    this.update();
    
    requestAnimationFrame(() => this.animate());
  }
  
  update() {
    // Update player movement from keyboard
    this.updatePlayerMovement();
    
    // Update subsystems
    this.player.update(this.delta);
    this.cameraController.update(this.delta);
    this.furnitureSystem.update(this.delta);
    this.needsSystem.update(this.delta);
    this.world.update(this.delta);
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
  
  stop() {
    this.running = false;
  }
}