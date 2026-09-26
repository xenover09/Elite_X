const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../src/dashboard/public/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf-8');

const appPath = path.join(__dirname, '../src/dashboard/public/app.js');
let appJs = fs.readFileSync(appPath, 'utf-8');

// --- 1. Update index.html ---
if (!indexHtml.includes('card-icon-modlog')) {
  const modLogCardHtml = `
              <!-- Module 6: Mod Log -->
              <div class="card module-card" style="cursor: pointer; text-align: center; padding: 40px 20px; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.classList.add('hover-active')" onmouseout="this.classList.remove('hover-active')" onclick="document.querySelector('#card-manage .nav-sub-btn[data-target=\\'card-modlog\\']').click()">
                <div class="card-icon card-icon-modlog" style="margin: 0 auto 15px auto; background: rgba(239, 68, 68, 0.1); color: #ef4444;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--text-primary);">Mod Log</h3>
                <p class="text-muted" style="font-size: 0.9rem;">Keep a track of all moderation and bot actions.</p>
                <button class="nav-sub-btn" data-target="card-modlog" style="display:none;"></button>
              </div>
`;
  indexHtml = indexHtml.replace('<!-- Module 3 -->', modLogCardHtml + '\n              <!-- Module 3 -->');
}

if (!indexHtml.includes('id="card-modlog"')) {
  const modLogSectionHtml = `
          <!-- Card: Mod Log -->
          <section class="card tab-content" id="card-modlog" style="overflow: visible;">
            <button class="btn btn-sm btn-outline nav-sub-btn" data-target="card-manage" style="margin-bottom: 20px;">&larr; Back to Manage Server</button>
            <div class="card-header">
              <div class="card-icon" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div>
                <h2>Mod Log Settings</h2>
                <p class="card-desc">Configure where bot moderation actions are logged.</p>
              </div>
            </div>
            
            <form id="modlog-form" style="display: flex; flex-direction: column; gap: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border); padding: 15px; border-radius: 8px;">
                <div>
                  <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">Enable Mod Log</div>
                  <div style="font-size: 0.85rem; color: var(--text-muted);">Toggle whether logs should be sent to a channel.</div>
                </div>
                <label class="switch"><input type="checkbox" id="modlog-enabled"><span class="slider"></span></label>
              </div>
              
              <div class="form-group">
                <label>Mod Log Channel</label>
                <select id="modlog-channel-select" class="channel-select" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary);">
                  <option value="">------- SELECT CHANNEL -------</option>
                </select>
              </div>
              
              <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 10px;">Save Mod Log Settings</button>
            </form>
          </section>
`;
  indexHtml = indexHtml.replace('<!-- Card 1: Channel Lock/Unlock -->', modLogSectionHtml + '\n          <!-- Card 1: Channel Lock/Unlock -->');
  fs.writeFileSync(indexPath, indexHtml);
}

// --- 2. Update app.js ---
if (!appJs.includes('modlog-form')) {
  // Update loadSettings
  const loadSearch = `if (amInvites) amInvites.checked = data.amInvites || false;`;
  const loadReplace = loadSearch + `
    
    // Mod Log
    const modLogEnabled = $('#modlog-enabled');
    const modLogChannel = $('#modlog-channel-select');
    if (modLogEnabled) modLogEnabled.checked = data.modLogEnabled || false;
    if (modLogChannel) modLogChannel.value = data.modLogChannelId || '';
`;
  appJs = appJs.replace(loadSearch, loadReplace);

  // Form handling
  const modLogLogic = `
  const modLogForm = $('#modlog-form');
  if (modLogForm) {
    modLogForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentGuildId) return toast('Select a server first', 'error');
      
      const payload = {
        modLogEnabled: $('#modlog-enabled').checked,
        modLogChannelId: $('#modlog-channel-select').value
      };
      
      try {
        await api('/api/settings/modlog', {
          method: 'POST',
          body: payload
        });
        toast('Mod Log settings saved successfully!', 'success');
      } catch (e) {
        toast(e.message || 'Failed to save Mod Log settings', 'error');
      }
    });
  }
`;
  appJs = appJs.replace('// ─── Panel Actions ───────────────────────────────────', modLogLogic + '\n  // ─── Panel Actions ───────────────────────────────────');
  
  fs.writeFileSync(appPath, appJs);
}

console.log('Mod Log UI patch applied.');
