import * as THREE from "three";

export class InteractionSystem {
  constructor(player, world) {
    this.player = player;
    this.world = world;
    this.interactionRange = 3;
    this.currentInteraction = null;
    this.promptElement = null;
    
    this.init();
  }
  
  init() {
    // Create prompt element
    this.promptElement = document.createElement("div");
    this.promptElement.className = "prompt";
    this.promptElement.textContent = "Press E to interact";
    document.body.appendChild(this.promptElement);
    
    // Set interaction callback on player
    this.player.setInteractionCallback(() => this.triggerInteraction());
    
    // Listen for E key
    document.addEventListener("keydown", (e) => {
      if (e.code === "KeyE") {
        this.triggerInteraction();
      }
    });
  }
  
  triggerInteraction() {
    // Find nearest interactive object
    const interactive = this.findInteractiveObject();
    if (interactive) {
      interactive.interact();
      this.showPrompt(`Interacting with ${interactive.name}`);
    } else {
      this.showPrompt("Nothing to interact with");
    }
  }
  
  findInteractiveObject() {
    // Simple raycast from camera
    const raycaster = new THREE.Raycaster();
    
    // Calculate mouse position (center of screen for auto-interaction)
    const mouse = new THREE.Vector2(0, 0);
    raycaster.setFromCamera(mouse, this.player.camera);
    
    const intersects = raycaster.intersectObjects(this.world.furniture, true);
    
    if (intersects.length > 0) {
      const closest = intersects[0].object;
      
      // Check if it has interaction data
      if (closest.userData && closest.userData.interactable) {
        return closest;
      }
      
      // Check parent chain
      let parent = closest.parent;
      while (parent) {
        if (parent.userData && parent.userData.interactable) {
          return parent;
        }
        parent = parent.parent;
      }
    }
    
    return null;
  }
  
  showPrompt(text) {
    if (this.promptElement) {
      this.promptElement.textContent = text;
      this.promptElement.classList.add("visible");
      
      setTimeout(() => {
        this.promptElement.classList.remove("visible");
      }, 2000);
    }
  }
  
  update(delta) {
    // Update interaction range checks, etc.
  }
}