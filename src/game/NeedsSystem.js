export class NeedsSystem {
  constructor() {
    this.hunger = 100;
    this.energy = 100;
    this.hygiene = 100;
    this.fun = 100;
    this.maxValue = 100;
    this.drainRate = 0.01; // per second - very slow
    
    this.bars = {};
    this.init();
  }
  
  init() {
    // Create HUD elements
    this.createNeedsHUD();
  }
  
  createNeedsHUD() {
    const hud = document.querySelector(".hud");
    if (hud) return; // Already created
    
    const topBar = document.createElement("div");
    topBar.className = "top-bar";
    hud.appendChild(topBar);
    
    // Create needs bars
    const needs = [
      { id: "hunger", label: "Hunger", color: "#FF6B6B" },
      { id: "energy", label: "Energy", color: "#4ECDC4" },
      { id: "hygiene", label: "Hygiene", color: "#44A08C" },
      { id: "fun", label: "Fun", color: "#9B59B6" }
    ];
    
    const barContainer = document.createElement("div");
    barContainer.style.cssText = "display: flex; gap: 12px; align-items: center; flex: 1;";
    
    needs.forEach((need, index) => {
      const bar = document.createElement("div");
      bar.className = "needs-bar";
      bar.style.width = "100%";
      
      const fill = document.createElement("div");
      fill.className = "needs-fill";
      fill.style.background = need.color;
      fill.style.width = "100%";
      
      const label = document.createElement("span");
      label.className = "needs-label";
      label.textContent = need.label;
      label.style.color = need.color;
      
      bar.appendChild(fill);
      bar.dataset.needId = need.id;
      bar.appendChild(label);
      barContainer.appendChild(bar);
      
      this.bars[need.id] = { element: bar, fill: fill, value: this[need.id] };
    });
    
    topBar.appendChild(barContainer);
  }
  
  update(delta) {
    // Gradually drain all needs
    const drain = this.drainRate * delta * 100;
    
    this.hunger = Math.max(0, this.hunger - drain);
    this.energy = Math.max(0, this.energy - drain);
    this.hygiene = Math.max(0, this.hygiene - drain);
    this.fun = Math.max(0, this.fun - drain);
    
    // Update HUD
    Object.keys(this.bars).forEach(key => {
      const bar = this.bars[key];
      if (bar.fill) {
        const percent = bar.value / this.maxValue;
        bar.fill.style.width = `${percent * 100}%`;
      }
    });
    
    // Check for low need notifications
    this.checkNotifications();
  }
  
  checkNotifications() {
    const notifications = [];
    
    if (this.hunger < 20) notifications.push("Hunger is low");
    if (this.energy < 20) notifications.push("Energy is low");
    if (this.hygiene < 20) notifications.push("Hygiene is low");
    if (this.fun < 20) notifications.push("Fun is low");
    
    if (notifications.length > 0) {
      this.showNotification(notifications[0]);
    }
  }
  
  showNotification(text) {
    const existing = document.querySelector(".need-notification");
    if (existing) {
      existing.textContent = text;
    } else {
      const note = document.createElement("div");
      note.className = "need-notification";
      note.textContent = text;
      note.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        background: #e74c3c;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 50;
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(note);
      setTimeout(() => note.remove(), 3000);
    }
  }
  
  // Restore a need
  restoreNeed(needId, amount) {
    switch (needId) {
      case "hunger": this.hunger = Math.min(this.maxValue, this.hunger + amount); break;
      case "energy": this.energy = Math.min(this.maxValue, this.energy + amount); break;
      case "hygiene": this.hygiene = Math.min(this.maxValue, this.hygiene + amount); break;
      case "fun": this.fun = Math.min(this.maxValue, this.fun + amount); break;
    }
    
    // Update HUD
    if (this.bars[needId] && this.bars[needId].fill) {
      const percent = this.bars[needId].value / this.maxValue;
      this.bars[needId].fill.style.width = `${percent * 100}%`;
    }
  }
  
  onInteract(interactionType) {
    // Handle interactions that affect needs
    switch (interactionType) {
      case "eat":
        this.restoreNeed("hunger", 30);
        break;
      case "sleep":
        this.restoreNeed("energy", 40);
        break;
      case "wash":
        this.restoreNeed("hygiene", 30);
        break;
      case "watch_tv":
        this.restoreNeed("fun", 30);
        break;
    }
  }
}