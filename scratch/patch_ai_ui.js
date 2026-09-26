const fs = require('fs');
const path = require('path');

// 1. Update index.html
const indexPath = path.join(__dirname, '../src/dashboard/public/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf-8');

const oldAiToggle = `<div class="ai-toggle-row">
              <span id="ai-status-label" class="ai-status-label">Loading…</span>
              <button id="ai-toggle-btn" class="toggle-switch" disabled>
                <span class="toggle-knob"></span>
              </button>
            </div>`;
const newAiToggle = `<div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border); padding: 15px; border-radius: 8px;">
              <div>
                <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">Enable AI System</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);" id="ai-status-label">Toggle whether the AI bot should reply.</div>
              </div>
              <label class="switch"><input type="checkbox" id="ai-toggle-btn"><span class="slider"></span></label>
            </div>`;

if (indexHtml.includes(oldAiToggle)) {
  indexHtml = indexHtml.replace(oldAiToggle, newAiToggle);
  fs.writeFileSync(indexPath, indexHtml);
  console.log('index.html updated.');
} else {
  // Try alternative replacement if exact match fails
  const oldRegex = /<div class="ai-toggle-row">[\s\S]*?<\/div>/;
  if (oldRegex.test(indexHtml)) {
    indexHtml = indexHtml.replace(oldRegex, newAiToggle);
    fs.writeFileSync(indexPath, indexHtml);
    console.log('index.html updated (regex).');
  } else {
    console.log('ai-toggle-row not found in index.html');
  }
}

// 2. Update app.js
const appPath = path.join(__dirname, '../src/dashboard/public/app.js');
let appJs = fs.readFileSync(appPath, 'utf-8');

const oldSetAiState = `  function setAIState(enabled) {
    aiToggleBtn.classList.toggle('active', enabled);
    aiStatusLabel.textContent = enabled ? 'AI Status: Online' : 'AI Status: Offline';
    aiStatusLabel.className = 'ai-status-label ' + (enabled ? 'on' : 'off');
  }`;
const newSetAiState = `  function setAIState(enabled) {
    aiToggleBtn.checked = enabled;
    aiStatusLabel.textContent = enabled ? 'AI Status: Online' : 'AI Status: Offline';
    aiStatusLabel.style.color = enabled ? '#22c55e' : 'var(--text-muted)';
  }`;

if (appJs.includes(oldSetAiState)) {
  appJs = appJs.replace(oldSetAiState, newSetAiState);
  
  // Update the event listener from 'click' to 'change'
  const oldEventListener = `aiToggleBtn.addEventListener('click', async () => {`;
  const newEventListener = `aiToggleBtn.addEventListener('change', async (e) => {
    e.preventDefault(); // Prevent UI from toggling before API confirms`;
  appJs = appJs.replace(oldEventListener, newEventListener);
  
  fs.writeFileSync(appPath, appJs);
  console.log('app.js updated.');
} else {
  console.log('setAIState not found in app.js');
}

// 3. Update style.css
const cssPath = path.join(__dirname, '../src/dashboard/public/style.css');
let css = fs.readFileSync(cssPath, 'utf-8');

const oldCss = `input:checked + .slider {
  background-color: var(--accent);
  border-color: var(--accent);
}`;
const newCss = `input:checked + .slider {
  background-color: #22c55e;
  border-color: #22c55e;
}`;

if (css.includes(oldCss)) {
  css = css.replace(oldCss, newCss);
  fs.writeFileSync(cssPath, css);
  console.log('style.css updated.');
} else {
  console.log('style.css toggle background not found');
}
