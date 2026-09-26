const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../src/dashboard/public/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf-8');

const appPath = path.join(__dirname, '../src/dashboard/public/app.js');
let appJs = fs.readFileSync(appPath, 'utf-8');

// 1. Update index.html
if (!indexHtml.includes('id="ai-personality"')) {
  // Find where aiChannel is, and add personality below it
  const searchStr = `                    <select id="ai-channel-select" class="channel-select" style="padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-family: var(--font-primary);">
                      <option value="">------- ANY CHANNEL (OPTIONAL) -------</option>
                    </select>`;
  const replacementStr = searchStr + `
                  </div>
                  
                  <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="font-weight: 600; color: var(--text-secondary);">AI Personality</label>
                    <select id="ai-personality" style="padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-family: var(--font-primary);">
                      <option value="default">Default (Helpful & Concise)</option>
                      <option value="formal">Formal (Professional & Structured)</option>
                      <option value="friendly">Friendly (Warm & Casual)</option>
                      <option value="strict">Strict (Direct & No Filler)</option>
                    </select>`;
  indexHtml = indexHtml.replace(searchStr, replacementStr);
  fs.writeFileSync(indexPath, indexHtml);
}

// 2. Update app.js
if (!appJs.includes('aiPersonalitySelect')) {
  // Add reference
  const refSearch = `  const aiChannelSelect   = $('#ai-channel-select');`;
  appJs = appJs.replace(refSearch, refSearch + `\n  const aiPersonalitySelect = $('#ai-personality');`);
  
  // Add to loadSettings
  const loadSearch = `if (aiChannelSelect) aiChannelSelect.value = data.aiChannel || '';`;
  appJs = appJs.replace(loadSearch, loadSearch + `\n    if (aiPersonalitySelect) aiPersonalitySelect.value = data.aiPersonality || 'default';`);
  
  // Add to save payload
  const saveSearch = `aiChannel: aiChannelSelect ? aiChannelSelect.value : '',`;
  appJs = appJs.replace(saveSearch, saveSearch + `\n        aiPersonality: aiPersonalitySelect ? aiPersonalitySelect.value : 'default',`);
  
  fs.writeFileSync(appPath, appJs);
}

console.log('AI Personality UI patch applied.');
