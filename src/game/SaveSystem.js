export class SaveSystem {
  constructor() {
    this.saveKey = "housie_save";
    this.version = 1;
    this.init();
  }
  
  init() {
    // Try to load saved data
    this.load();
  }
  
  load() {
    const saved = localStorage.getItem(this.saveKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        
        // Handle versioning
        if (data.version && data.version < this.version) {
          // Outdated save - could apply migration here
          console.log("Applying save format migration...");
        }
        
        // Restore player data
        if (data.player) {
          // Player data restoration would be handled by the game state
          console.log("Loaded save data:", data.player);
        }
        
        // Restore furniture
        if (data.furniture && Array.isArray(data.furniture)) {
          console.log(`Loaded ${data.furniture.length} placed furniture items`);
        }
        
        // Restore needs
        if (data.needs) {
          console.log("Loaded needs:", data.needs);
        }
        
      } catch (error) {
        console.error("Failed to load save data:", error);
        // Corrupted save - start fresh
      }
    }
  }
  
  save() {
    const data = {
      version: this.version,
      timestamp: new Date().toISOString(),
      player: this.getPlayerData(),
      furniture: this.getFurnitureData(),
      needs: this.getNeedsData()
    };
    
    try {
      localStorage.setItem(this.saveKey, JSON.stringify(data));
      console.log("Game saved successfully");
      return true;
    } catch (error) {
      console.error("Failed to save game:", error);
      return false;
    }
  }
  
  getPlayerData() {
    return {
      color: this.player?.color,
      position: this.player?.body?.position ? {
        x: this.player.body.position.x,
        z: this.player.body.position.z
      } : { x: 0, z: 0 }
    };
  }
  
  getFurnitureData() {
    if (!this.placedFurniture) return [];
    
    return this.placedFurniture.map(obj => ({
      id: obj.userData?.furnitureId || obj.name,
      position: {
        x: obj.position.x,
        y: obj.position.y,
        z: obj.position.z
      },
      rotation: {
        y: obj.rotation.y
      }
    }));
  }
  
  getNeedsData() {
    return {
      hunger: this.hunger,
      energy: this.energy,
      hygiene: this.hygiene,
      fun: this.fun
    };
  }
  
  reset() {
    if (confirm("Are you sure you want to reset all save data?")) {
      localStorage.removeItem(this.saveKey);
      // Reset game state
      this.hunger = 100;
      this.energy = 100;
      this.hygiene = 100;
      this.fun = 100;
      this.placedFurniture = [];
      this.showPrompt("Save data reset");
    }
  }
}