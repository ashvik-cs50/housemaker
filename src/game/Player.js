import * as THREE from "three";

export class Player {
  constructor() {
    this.body = null;
    this.head = null;
    this.torso = null;
    this.leftArm = null;
    this.rightArm = null;
    this.leftLeg = null;
    this.rightLeg = null;
    this.color = this.getRandomColor();
    this.isMoving = false;
    this.velocity = new THREE.Vector3();
    this.targetSpeed = 4;
    this.isRunning = false;
    this.onInteraction = null;
    this.scene = null;
    
    this.init();
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
      "#FFE66D"  // Sunshine yellow light
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }
  
  init() {
    // Stickman creation is done in createStickman()
  }
  
  createStickman(scene) {
    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    this.head = new THREE.Mesh(headGeometry, new THREE.MeshPhongMaterial({ color: this.color }));
    this.head.position.y = 1.0;
    
    // Torso
    const torsoGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.4);
    this.torso = new THREE.Mesh(torsoGeometry, new THREE.MeshPhongMaterial({ color: this.color }));
    this.torso.position.y = 0.4;
    
    // Left arm
    const armGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.2);
    this.leftArm = new THREE.Mesh(armGeometry, new THREE.MeshPhongMaterial({ color: this.color }));
    this.leftArm.position.set(-0.2, 0.45, 0);
    this.leftArm.rotation.z = -0.3;
    
    // Right arm
    this.rightArm = new THREE.Mesh(armGeometry, new THREE.MeshPhongMaterial({ color: this.color }));
    this.rightArm.position.set(0.2, 0.45, 0);
    this.rightArm.rotation.z = 0.3;
    
    // Left leg
    const legGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    this.leftLeg = new THREE.Mesh(legGeometry, new THREE.MeshPhongMaterial({ color: this.color }));
    this.leftLeg.position.set(-0.1, -0.3, 0);
    this.leftLeg.rotation.z = -0.2;
    
    // Right leg
    this.rightLeg = new THREE.Mesh(legGeometry, new THREE.MeshPhongMaterial({ color: this.color }));
    this.rightLeg.position.set(0.1, -0.3, 0);
    this.rightLeg.rotation.z = 0.2;
    
    // Body group
    this.body = new THREE.Group();
    this.body.add(this.head, this.torso, this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);
    this.body.position.set(0, 1.6, 0);
    if (scene) scene.add(this.body);
  }
  
  update(delta) {
    // Update animation based on movement state
    const walkPhase = (this.isMoving ? (performance.now() / 200) % (Math.PI * 2) : 0);
    
    if (this.isMoving) {
      // Swing arms
      this.leftArm.rotation.z = -0.3 + Math.sin(walkPhase) * 0.3;
      this.rightArm.rotation.z = 0.3 - Math.sin(walkPhase) * 0.3;
      // Swing legs
      this.leftLeg.rotation.z = -0.2 + Math.sin(walkPhase) * 0.3;
      this.rightLeg.rotation.z = 0.2 - Math.sin(walkPhase) * 0.3;
    } else {
      // Idle - neutral position
      this.leftArm.rotation.z = -0.3;
      this.rightArm.rotation.z = 0.3;
      this.leftLeg.rotation.z = -0.2;
      this.rightLeg.rotation.z = 0.2;
    }
    
    // Apply movement
    if (this.isMoving && this.velocity.lengthSq() > 0) {
      this.body.position.add(this.velocity.clone().multiplyScalar(delta * 10));
      // Keep player at walking height
      this.body.position.y = Math.max(1.6, this.body.position.y);
    }
    
    // Head follows body rotation
    if (this.body.rotation.y) {
      this.head.rotation.y = -this.body.rotation.y * 0.8;
    }
  }
  
  setPosition(x, z) {
    if (this.body) {
      this.body.position.set(x, 1.6, z);
    }
  }
  
  moveForward() {
    const angle = this.body ? this.body.rotation.y : 0;
    this.velocity.z = -Math.sin(angle) * this.targetSpeed;
    this.velocity.x = Math.cos(angle) * this.targetSpeed;
    this.isMoving = true;
  }
  
  moveBackward() {
    const angle = this.body.rotation.y;
    this.velocity.z = Math.sin(angle) * this.targetSpeed;
    this.velocity.x = -Math.cos(angle) * this.targetSpeed;
    this.isMoving = true;
  }
  
  moveLeft() {
    const angle = this.body.rotation.y - Math.PI / 2;
    this.velocity.z = -Math.sin(angle) * this.targetSpeed;
    this.velocity.x = Math.cos(angle) * this.targetSpeed;
    this.isMoving = true;
  }
  
  moveRight() {
    const angle = this.body.rotation.y + Math.PI / 2;
    this.velocity.z = -Math.sin(angle) * this.targetSpeed;
    this.velocity.x = Math.cos(angle) * this.targetSpeed;
    this.isMoving = true;
  }
  
  stopMovement() {
    this.isMoving = false;
    this.velocity.set(0, 0, 0);
  }
  
  toggleRun() {
    this.isRunning = !this.isRunning;
    this.targetSpeed = this.isRunning ? 8 : 4;
  }
  
  setInteractionCallback(callback) {
    this.onInteraction = callback;
  }
  
  interact() {
    if (this.onInteraction) {
      this.onInteraction();
    }
  }
}