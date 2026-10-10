import * as THREE from "three";

export class CameraController {
  constructor(camera, target = null) {
    this.camera = camera;
    this.target = target; // Player body
    this.followDistance = 8;
    this.followHeight = 2;
    this.minPolarAngle = 0.5; // 30 degrees from straight down
    this.maxPolarAngle = Math.PI - 0.5; // 30 degrees from straight up
    this.polarAngle = 1.2; // ~68 degrees - third person
    this.azimuthAngle = 0;
    this.zoom = 5;
    this.targetZoom = 5;
    this.moveSpeed = 0.1;
    this.dragSpeed = 0.05;
    
    this.mouse = {
      x: 0,
      y: 0,
      isDown: false
    };
    
    this.initEventListeners();
  }
  
  initEventListeners() {
    document.addEventListener("mousedown", (e) => {
      this.mouse.isDown = true;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    
    document.addEventListener("mouseup", () => {
      this.mouse.isDown = false;
    });
    
    document.addEventListener("mousemove", (e) => {
      if (!this.mouse.isDown) return;
      
      const dx = e.clientX - this.mouse.x;
      const dy = e.clientY - this.mouse.y;
      
      this.azimuthAngle -= dx * this.dragSpeed;
      this.polarAngle -= dy * this.dragSpeed;
      
      // Clamp polar angle
      this.polarAngle = Math.max(
        this.minPolarAngle,
        Math.min(this.maxPolarAngle, this.polarAngle)
      );
      
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    
    // Wheel zoom
    document.addEventListener("wheel", (e) => {
      this.targetZoom = Math.max(3, Math.min(12, this.targetZoom - e.deltaY * 0.05));
    }, { passive: false });
  }
  
  update(delta) {
    // If we have a target (player), follow it
    if (this.target) {
      const targetPos = this.target.position;
      
      // Calculate camera position in spherical coords
      const radius = this.targetZoom + this.zoom;
      const theta = this.polarAngle;
      const phi = this.azimuthAngle;
      
      const camX = targetPos.x + radius * Math.sin(theta) * Math.cos(phi);
      const camY = targetPos.y + radius * Math.cos(theta);
      const camZ = targetPos.z + radius * Math.sin(theta) * Math.sin(phi);
      
      // Smooth camera movement
      this.camera.position.x += (camX - this.camera.position.x) * this.moveSpeed;
      this.camera.position.y += (camY - this.camera.position.y) * this.moveSpeed;
      this.camera.position.z += (camZ - this.camera.position.z) * this.moveSpeed;
      
      // Look at target
      this.camera.lookAt(targetPos.x, targetPos.y, targetPos.z);
    } else {
      // Free camera mode - use mouse drag
      if (this.mouse.isDown) {
        this.azimuthAngle -= this.mouse.x * this.dragSpeed;
        this.polarAngle -= this.mouse.y * this.dragSpeed;
        this.polarAngle = Math.max(
          this.minPolarAngle,
          Math.min(this.maxPolarAngle, this.polarAngle)
        );
      }
      
      const radius = this.targetZoom + this.zoom;
      const theta = this.polarAngle;
      const phi = this.azimuthAngle;
      
      const camX = radius * Math.sin(theta) * Math.cos(phi);
      const camY = radius * Math.cos(theta);
      const camZ = radius * Math.sin(theta) * Math.sin(phi);
      
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(0, 0, 0);
    }
  }
}