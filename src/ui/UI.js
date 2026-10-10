import * as THREE from "three";

export class UI {
  constructor() {
    this.hud = null;
    this.buildModeUI = null;
    this.inventoryUI = null;
    this.init();
  }
  
  init() {
    this.createHUD();
  }
  
  createHUD() {
    const hud = document.createElement("div");
    hud.className = "hud";
    hud.style.cssText = `
      pointer-events: auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    document.body.appendChild(hud);
    
    // Top bar with player info and needs
    const topBar = document.createElement("div");
    topBar.className = "top-bar";
    topBar.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
      padding: 8px 12px;
      box-sizing: border-box;
    `;
    hud.appendChild(topBar);
    
    // Player info panel
    const playerInfo = document.createElement("div");
    playerInfo.className = "player-info";
    playerInfo.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      background: #2d2d44;
      padding: 6px 10px;
      border-radius: 4px;
    `;
    
    // Player color dot
    const colorDot = document.createElement("div");
    colorDot.className = "player-color-dot";
    colorDot.style.width = "10px";
    colorDot.style.height = "10px";
    colorDot.style.background = "#FF6B6B"; // Will be set per player
    colorDot.style.flexShrink = "0";
    
    const playerName = document.createElement("span");
    playerName.textContent = "Player";
    playerName.style.fontSize = "12px";
    playerName.style.color = "#e0e0e0";
    
    playerInfo.appendChild(colorDot);
    playerInfo.appendChild(playerName);
    topBar.appendChild(playerInfo);
    
    // Needs bars
    const needsContainer = document.createElement("div");
    needsContainer.style.cssText = "display: flex; gap: 12px; align-items: center;";
    
    const needs = [
      { id: "hunger", label: "Hunger", color: "#FF6B6B" },
      { id: "energy", label: "Energy", color: "#4ECDC4" },
      { id: "hygiene", label: "Hygiene", color: "#44A08C" },
      { id: "fun", label: "Fun", color: "#9B59B6" }
    ];
    
    needs.forEach(need => {
      const barWrapper = document.createElement("div");
      barWrapper.style.cssText = "display: flex; flex-direction: column; align-items: flex-start;";
      
      const label = document.createElement("span");
      label.textContent = need.label;
      label.style.fontSize = "10px";
      label.style.color = need.color;
      label.style.marginBottom = "2px";
      
      const bar = document.createElement("div");
      bar.className = "needs-bar";
      bar.style.width = "100%";
      bar.style.height = "6px";
      bar.style.background = "#3a3a5a";
      bar.style.borderRadius = "3px";
      bar.style.overflow = "hidden";
      
      const fill = document.createElement("div");
      fill.className = "needs-fill";
      fill.style.height = "100%";
      fill.style.background = need.color;
      fill.style.width = "100%";
      fill.style.transition = "width 0.3s ease";
      
      barWrapper.appendChild(label);
      barWrapper.appendChild(bar);
      bar.appendChild(fill);
      barWrapper.dataset.needId = need.id;
      
      needsContainer.appendChild(barWrapper);
    });
    
    topBar.appendChild(needsContainer);
    
    // Bottom control bar
    const controlBar = document.createElement("div");
    controlBar.style.cssText = `
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      margin-top: 4px;
    `;
    hud.appendChild(controlBar);
    
    // Money display
    const moneyDisplay = document.createElement("span");
    moneyDisplay.className = "money-display";
    moneyDisplay.textContent = "$0";
    moneyDisplay.style.fontSize = "12px";
    moneyDisplay.style.color = "#ffd700";
    controlBar.appendChild(moneyDisplay);
    
    // Buttons
    const buildBtn = document.createElement("button");
    buildBtn.className = "build-mode-btn";
    buildBtn.textContent = "Build Mode";
    buildBtn.style.fontSize = "12px";
    controlBar.appendChild(buildBtn);
    
    const inventoryBtn = document.createElement("button");
    inventoryBtn.className = "inventory-btn";
    inventoryBtn.textContent = "Inventory";
    inventoryBtn.style.fontSize = "12px";
    controlBar.appendChild(inventoryBtn);
    
    // Settings button
    const settingsBtn = document.createElement("button");
    settingsBtn.className = "settings-btn";
    settingsBtn.textContent = "Settings";
    settingsBtn.style.fontSize = "12px";
    controlBar.appendChild(settingsBtn);
    
    // Store references for updates
    this.hud = hud;
    this.topBar = topBar;
    this.needsContainer = needsContainer;
    this.controlBar = controlBar;
    this.moneyDisplay = moneyDisplay;
    
    // Bind update method
    this.updateNeedsBars = this.updateNeedsBars.bind(this);
  }
  
  updateNeedsBars(needsSystem) {
    if (!this.needsContainer) return;
    
    const bars = {
      hunger: this.needsContainer.querySelector('[data-need-id="hunger"] .needs-fill'),
      energy: this.needsContainer.querySelector('[data-need-id="energy"] .needs-fill'),
      hygiene: this.needsContainer.querySelector('[data-need-id="hygiene"] .needs-fill'),
      fun: this.needsContainer.querySelector('[data-need-id="fun"] .needs-fill')
    };
    
    if (!bars.hunger) return;
    
    const updateBar = (bar, value) => {
      const percent = Math.max(0, Math.min(100, value));
      bar.style.width = `${percent}%`;
    };
    
    updateBar(bars.hunger, needsSystem.hunger);
    updateBar(bars.energy, needsSystem.energy);
    updateBar(bars.hygiene, needsSystem.hygiene);
    updateBar(bars.fun, needsSystem.fun);
  }
  
  updatePlayerColor(color) {
    const colorDot = this.hud?.querySelector(".player-color-dot");
    if (colorDot) {
      colorDot.style.background = color;
    }
  }
  
  updateMoney(amount) {
    if (this.moneyDisplay) {
      this.moneyDisplay.textContent = `$${amount}`;
    }
  }
  
  showPrompt(text) {
    const existing = document.querySelector(".ui-prompt");
    if (existing) {
      existing.textContent = text;
    } else {
      const prompt = document.createElement("div");
      prompt.className = "ui-prompt";
      prompt.textContent = text;
      prompt.style.cssText = `
        position: fixed;
        bottom: 24px;
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
  
  toggleBuildMode(enabled) {
    const overlay = document.querySelector(".build-mode-overlay");
    if (overlay) {
      overlay.classList.toggle("active", enabled);
    }
  }
  
  setBuildModeHints(hasSelected, furnitureName) {
    // Update build mode UI hints
    const buildBtn = this.hud?.querySelector(".build-mode-btn");
    if (buildBtn) {
      // Could change button state based on build mode status
    }
  }
}