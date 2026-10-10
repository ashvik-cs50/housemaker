import * as THREE from "three";

export class FurnitureSystem {
  constructor(world, player) {
    this.world = world;
    this.player = player;
    this.placedFurniture = [];
    this.placementPreview = null;
    this.isInBuildMode = false;
    this.placementGridSize = 1;
    this.placementRotation = 0;
    this.availableFurniture = this.getDefaultFurniture();
    this.hoveredObject = null;
    
    this.init();
  }
  
  init() {
    this.createPlacementPreview();
    this.setupAvailableFurniture();
  }
  
  getDefaultFurniture() {
    return [
      { id: "Kitchen_Fridge", name: "Refrigerator", category: "Kitchen", modelUrl: "Ultimate House Interior Pack-zip/Kitchen_Fridge/Kitchen_Fridge.fbx" },
      { id: "Bed_Single", name: "Single Bed", category: "Bedroom", modelUrl: "Ultimate House Interior Pack-zip/Bed_Single/Bed_Single.fbx" },
      { id: "Bathroom_Sink", name: "Sink", category: "Bathroom", modelUrl: "Ultimate House Interior Pack-zip/Bathroom_Sink/Bathroom_Sink.fbx" },
      { id: "Couch_Medium1", name: "Medium Couch", category: "Living Room", modelUrl: "Ultimate House Interior Pack-zip/Couch_Medium/Couch_Medium1.fbx" },
      { id: "Table_RoundSmall", name: "Round Table", category: "Living Room", modelUrl: "Ultimate House Interior Pack-zip/Table_RoundSmall/Table_RoundSmall.fbx" },
      { id: "Shelf_Large", name: "Shelf", category: "Living Room", modelUrl: "Ultimate House Interior Pack-zip/Shelf_Large/Shelf_Large.fbx" },
      { id: "Lamp_Floor1", name: "Floor Lamp", category: "Living Room", modelUrl: "Ultimate House Interior Pack-zip/Lamp/Lamp_Floor1.fbx" },
      { id: "Fireplace", name: "Fireplace", category: "Living Room", modelUrl: "Ultimate House Interior Pack-zip/Fireplace/Fireplace.fbx" }
    ];
  }
  
  createPlacementPreview() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      opacity: 0.3,
      transparent: true
    });
    this.placementPreview = new THREE.Mesh(geometry, material);
    this.placementPreview.visible = false;
    this.world.scene.add(this.placementPreview);
  }
  
  setupAvailableFurniture() {
    // Create build mode UI buttons for available furniture
    const buildModeOverlay = document.querySelector(".build-mode-overlay");
    if (!buildModeOverlay) return;
    
    const categoryPanel = buildModeOverlay.querySelector(".build-mode-panel");
    if (!categoryPanel) return;
    
    // Group by category
    const categories = {};
    this.availableFurniture.forEach(item => {
      if (!categories[item.category]) categories[item.category] = [];
      categories[item.category].push(item);
    });
    
    // Add furniture buttons
    let html = "";
    for (const [category, items] of Object.entries(categories)) {
      html += `<div class="furniture-category"><h4>${category}</h4>`;
      items.forEach(item => {
        html += `<button class="furniture-btn" data-furniture-id="${item.id}"">${item.name}</button>`;
      });
      html += `</div>`;
    }
    categoryPanel.innerHTML = html;
    
    // Add event listeners
    document.querySelectorAll(".furniture-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const furnitureId = btn.getAttribute("data-furniture-id");
        this.startPlacement(furnitureId);
      });
    });
    
    // Rotation controls
    const buildControls = buildModeOverlay.querySelector(".build-controls");
    if (buildControls) {
      const rotateLeft = document.createElement("button");
      rotateLeft.className = "build-control-btn";
      rotateLeft.textContent = "Rotate Left";
      rotateLeft.addEventListener("click", () => {
        this.placementRotation = (this.placementRotation + Math.PI / 2) % (Math.PI * 2);
        this.updatePreviewTransform();
      });
      buildControls.appendChild(rotateLeft);
      
      const rotateRight = document.createElement("button");
      rotateRight.className = "build-control-btn";
      rotateRight.textContent = "Rotate Right";
      rotateRight.addEventListener("click", () => {
        this.placementRotation = (this.placementRotation - Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
        this.updatePreviewTransform();
      });
      buildControls.appendChild(rotateRight);
    }
    
    // Confirm/Cancel buttons
    const closeBuildBtn = buildModeOverlay.querySelector(".close-build-btn");
    if (closeBuildBtn) {
      closeBuildBtn.textContent = "Cancel";
      closeBuildBtn.addEventListener("click", () => this.cancelPlacement());
    }
    
    const confirmBuildBtn = buildModeOverlay.querySelector(".build-control-btn");
    if (!confirmBuildBtn && buildControls) {
      const confirmBtn = document.createElement("button");
      confirmBtn.className = "build-control-btn";
      confirmBtn.textContent = "Place";
      confirmBtn.addEventListener("click", () => this.confirmPlacement());
      buildControls.appendChild(confirmBtn);
    }
  }
  
  startPlacement(furnitureId) {
    this.isInBuildMode = true;
    this.placementRotation = 0;
    
    // Find furniture definition
    const furnitureDef = this.availableFurniture.find(f => f.id === furnitureId);
    if (!furnitureDef) return;
    
    // Load model for preview
    const loader = new THREE.FBXLoader();
    loader.load(furnitureDef.modelUrl, (object) => {
      object.name = furnitureDef.name;
      object.userData.furnitureId = furnitureId;
      
      this.placementPreview.geometry = new THREE.BoxGeometry(1, 1, 1); // Reset
      this.placementPreview.material = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        opacity: 0.3,
        transparent: true
      });
      
      // Scale preview based on model bounds
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = maxDim > 0 ? 1 / maxDim : 1;
      
      object.scale.set(scaleFactor * 0.8, scaleFactor * 0.8, scaleFactor * 0.8);
      
      this.placeObject(object);
    }, undefined, (error) => {
      console.error("Failed to load placement preview:", error);
    });
  }
  
  placeObject(object) {
    object.visible = false;
    this.world.scene.add(object);
    this.placedFurniture.push(object);
    this.isInBuildMode = false;
    this.hidePlacementPreview();
    
    // Update UI
    const buildModeOverlay = document.querySelector(".build-mode-overlay");
    if (buildModeOverlay) {
      buildModeOverlay.classList.remove("active");
    }
  }
  
  cancelPlacement() {
    this.isInBuildMode = false;
    this.hidePlacementPreview();
    
    // Remove preview from scene if it was added
    if (this.placementPreview.parent) {
      this.placementPreview.parent.remove(this.placementPreview);
    }
    
    // Restore UI
    const buildModeOverlay = document.querySelector(".build-mode-overlay");
    if (buildModeOverlay) {
      buildModeOverlay.classList.remove("active");
    }
  }
  
  confirmPlacement() {
    if (!this.isInBuildMode) return;
    
    // Finalize placement
    this.placementPreview.visible = false;
    
    // Apply final transform based on grid snap
    const placedObj = this.placementPreview.userData.object;
    if (placedObj) {
      // Snap to grid
      const pos = placedObj.position;
      placedObj.position.x = Math.round(pos.x / this.placementGridSize) * this.placementGridSize;
      placedObj.position.z = Math.round(pos.z / this.placementGridSize) * this.placementGridSize;
      placedObj.rotation.y = this.placementRotation;
    }
    
    this.placeObject(this.placementPreview.userData.object);
    this.showPlacementSuccess();
  }
  
  updatePreviewTransform() {
    if (!this.placementPreview) return;
    
    // Update preview rotation
    this.placementPreview.rotation.y = this.placementRotation;
    
    // Position preview in front of player
    const playerPos = this.player.body.position;
    this.placementPreview.position.set(
      playerPos.x,
      playerPos.y,
      playerPos.z
    );
  }
  
  showPlacementSuccess() {
    this.showPrompt("Furniture placed successfully");
  }
  
  showPrompt(text) {
    // Simple prompt
    const existing = document.querySelector(".build-prompt");
    if (existing) {
      existing.textContent = text;
    } else {
      const prompt = document.createElement("div");
      prompt.className = "build-prompt";
      prompt.textContent = text;
      prompt.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.7);
        border: 1px solid #5a5a7a;
        padding: 8px 16px;
        color: #e0e0e0;
        font-size: 13px;
        z-index: 100;
      `;
      document.body.appendChild(prompt);
      setTimeout(() => prompt.remove(), 2000);
    }
  }
  
  hidePlacementPreview() {
    if (this.placementPreview) {
      this.placementPreview.visible = false;
    }
  }
  
  toggleBuildMode() {
    this.isInBuildMode = !this.isInBuildMode;
    
    const buildModeOverlay = document.querySelector(".build-mode-overlay");
    if (buildModeOverlay) {
      buildModeOverlay.classList.toggle("active", this.isInBuildMode);
    }
    
    if (!this.isInBuildMode) {
      this.cancelPlacement();
    }
  }
  
  update(delta) {
    if (!this.isInBuildMode) return;
    
    // Update preview position - follow player
    const playerPos = this.player.body.position;
    this.placementPreview.position.set(
      playerPos.x,
      playerPos.y,
      playerPos.z
    );
    
    // Update rotation
    this.placementPreview.rotation.y = this.placementRotation;
    
    // Check for valid placement
    this.checkPlacementValidity();
  }
  
  checkPlacementValidity() {
    // Simple overlap check with existing furniture
    const previewPos = this.placementPreview.position;
    
    for (const obj of this.world.furniture.concat(this.placedFurniture)) {
      if (obj === this.placementPreview.userData?.object) continue;
      
      // Bounding box overlap check
      const previewBox = new THREE.Box3().setFromObject(this.placementPreview);
      const objBox = new THREE.Box3().setFromObject(obj);
      
      if (previewBox.intersectsBox(objBox)) {
        this.setPlacementInvalid();
        return;
      }
    }
    
    // Check room boundaries (simple - keep within ±10)
    if (Math.abs(previewPos.x) > 10 || Math.abs(previewPos.z) > 10) {
      this.setPlacementInvalid();
      return;
    }
    
    this.setPlacementValid();
  }
  
  setPlacementValid() {
    this.placementPreview.material.color.set(0x00ff00);
  }
  
  setPlacementInvalid() {
    this.placementPreview.material.color.set(0xff0000);
  }
}