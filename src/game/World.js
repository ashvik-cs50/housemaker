import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { Door } from "./Door.js";
import { Window } from "./Window.js";

export class World {
  constructor(scene) {
    this.scene = scene;
    this.camera = null;
    this.renderer = null;
    this.doors = [];
    this.windows = [];
    this.furniture = [];
    this.ground = null;
    this.walls = [];
    
    this.init();
  }
  
  init() {
    // Create ground plane
    this.createGround();
    
    // Create walls and rooms
    this.createWalls();
    
    // Load furniture
    this.loadFurniture();
    
    // Load doors
    this.loadDoors();
    
    // Load windows
    this.loadWindows();
  }
  
  createGround() {
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshStandardMaterial({
      color: #f5f0e1,
      roughness: 0.8,
      metalness: 0.1
    });
    this.ground = new THREE.Mesh(geometry, material);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }
  
  createWalls() {
    // Living room walls
    const wallHeight = 3;
    const wallDepth = 0.2;
    
    // Long walls (z direction)
    const longWallGeo = new THREE.BoxGeometry(20, wallHeight, wallDepth);
    const shortWallGeo = new THREE.BoxGeometry(10, wallHeight, wallDepth);
    const wallMat = new THREE.MeshStandardMaterial({ color: #ffffff });
    
    // Create 4 walls forming a cross layout for rooms
    const walls = [];
    
    // Wall 1: Back wall (full length)
    const wall1 = new THREE.Mesh(longWallGeo, wallMat);
    wall1.position.set(0, wallHeight / 2, 10);
    wall1.castShadow = true;
    wall1.receiveShadow = true;
    this.scene.add(wall1);
    walls.push(wall1);
    
    // Wall 2: Front wall (full length)
    const wall2 = new THREE.Mesh(longWallGeo, wallMat);
    wall2.position.set(0, wallHeight / 2, -10);
    wall2.castShadow = true;
    wall2.receiveShadow = true;
    this.scene.add(wall2);
    walls.push(wall2);
    
    // Wall 3: Left wall
    const wall3 = new THREE.Mesh(shortWallGeo, wallMat);
    wall3.position.set(-10, wallHeight / 2, 0);
    wall3.castShadow = true;
    wall3.receiveShadow = true;
    this.scene.add(wall3);
    walls.push(wall3);
    
    // Wall 4: Right wall
    const wall4 = new THREE.Mesh(shortWallGeo, wallMat);
    wall4.position.set(10, wallHeight / 2, 0);
    wall4.castShadow = true;
    wall4.receiveShadow = true;
    this.scene.add(wall4);
    walls.push(wall4);
    
    this.walls = walls;
  }
  
  loadFurniture() {
    // Furniture will be loaded via FBXLoader
    // Using Ultimate House Interior Pack models
    this.loadModel("Kitchen_Fridge", {
      x: -5, y: 0, z: 2,
      rx: 0, ry: 0, rz: 0,
      sx: 1, sy: 1, sz: 1
    }, "Kitchen");
    
    this.loadModel("Bed_Single", {
      x: 5, y: 0, z: -3,
      rx: 0, ry: 0, rz: 0,
      sx: 1, sy: 1, sz: 1
    }, "Bedroom");
    
    this.loadModel("Bathroom_Sink", {
      x: -3, y: 0, z: 1,
      rx: 0, ry: 0, rz: 0,
      sx: 1, sy: 1, sz: 1
    }, "Bathroom");
    
    this.loadModel("Couch_Medium1", {
      x: 0, y: 0, z: 1,
      rx: 0, ry: 0.52, rz: 0,
      sx: 1, sy: 1, sz: 1
    }, "Living Room");
    
    this.loadModel("Table_RoundSmall", {
      x: 0, y: 0, z: -1,
      rx: 0, ry: 0, rz: 0,
      sx: 1, sy: 1, sz: 1
    }, "Living Room");
    
    this.loadModel("Shelf_Large", {
      x: 3, y: 0, z: -2,
      rx: 0, ry: 0, rz: 0,
      sx: 1, sy: 1, sz: 1
    }, "Living Room");
    
    this.loadModel("Lamp_Floor1", {
      x: -4, y: 0, z: -3,
      rx: 0, ry: 0, rz: 0,
      sx: 1, sy: 1, sz: 1
    }, "Living Room");
    
    this.loadModel("Fireplace", {
      x: 0, y: 0, z: 3,
      rx: 0, ry: 0, rz: 0,
      sx: 1, sy: 1, sz: 1
    }, "Living Room");
  }
  
  loadModel(name, position, rotation, scale, room) {
    const url = `Ultimate House Interior Pack-zip/${name}/${name}.fbx`;
    const loader = new FBXLoader();
    
    loader.load(url, (object) => {
      object.name = name;
      object.userData.originalName = name;
      
      // Apply transform
      object.position.set(position.x, position.y, position.z);
      object.rotation.set(rotation.rx, rotation.ry, rotation.rz);
      object.scale.set(scale.sx, scale.sy, scale.sz);
      
      // Enable shadows
      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      this.scene.add(object);
      this.furniture.push(object);
      console.log(`Loaded furniture: ${name}`);
    }, (xhr) => {
      console.log(`Loading ${name}: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
    }, (error) => {
      console.error(`Failed to load furniture ${name}:`, error);
      // Create placeholder box
      this.createPlaceholder(name, position);
    });
  }
  
  createPlaceholder(name, position) {
    const size = 2;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({
      color: #ff5555,
      opacity: 0.5,
      transparent: true
    });
    const placeholder = new THREE.Mesh(geometry, material);
    placeholder.position.set(position.x, position.y, position.z);
    placeholder.name = `placeholder_${name}`;
    this.scene.add(placeholder);
    this.furniture.push(placeholder);
  }
  
  loadDoors() {
    // Front door
    this.loadModel("Door_1", {
      x: -5, y: 0, z: 5,
      rx: 0, ry: -Math.PI / 2, rz: 0,
      sx: 1, sy: 1, sz: 1
    }, "Entrance");
    
    // Back door
    this.loadModel("Door_1", {
      x: 5, y: 0, z: -5,
      rx: 0, ry: Math.PI / 2, rz: 0,
      sx: 1, sy: 1, sz: 1
    }, "Back Entrance");
  }
  
  loadWindows() {
    // Window Large
    this.loadModel("Window_Large2", {
      x: -8, y: 0, z: 3,
      rx: 0, ry: 0, rz: 0,
      sx: 1, sy: 1, sz: 1
    }, "Living Room");
    
    this.loadModel("Window_Large2", {
      x: 8, y: 0, z: 3,
      rx: 0, ry: 0, rz: 0,
      sx: 1, sy: 1, sz: 1
    }, "Living Room");
  }
  
  update(delta) {
    // World update logic
  }
}