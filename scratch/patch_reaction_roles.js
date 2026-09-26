const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../src/dashboard/public/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf-8');

const appPath = path.join(__dirname, '../src/dashboard/public/app.js');
let appJs = fs.readFileSync(appPath, 'utf-8');

// --- 1. Update index.html ---
if (!indexHtml.includes('card-icon-reaction')) {
  const rrCardHtml = `
              <!-- Module 5: Reaction Roles -->
              <div class="card module-card" style="cursor: pointer; text-align: center; padding: 40px 20px; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.classList.add('hover-active')" onmouseout="this.classList.remove('hover-active')" onclick="document.querySelector('#card-manage .nav-sub-btn[data-target=\\'card-reaction\\']').click()">
                <div class="card-icon card-icon-reaction" style="margin: 0 auto 15px auto; background: rgba(168, 85, 247, 0.1); color: #a855f7;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--text-primary);">Reaction Roles</h3>
                <p class="text-muted" style="font-size: 0.9rem;">Allow users to self-assign roles via reactions.</p>
                <button class="nav-sub-btn" data-target="card-reaction" style="display:none;"></button>
              </div>
`;
  indexHtml = indexHtml.replace('<!-- Module 2 -->', rrCardHtml + '\n              <!-- Module 2 -->');
}

if (!indexHtml.includes('id="card-reaction"')) {
  const rrSectionHtml = `
          <!-- Card: Reaction Roles -->
          <section class="card tab-content" id="card-reaction" style="overflow: visible;">
            <button class="btn btn-sm btn-outline nav-sub-btn" data-target="card-manage" style="margin-bottom: 20px;">&larr; Back to Manage Server</button>
            <div class="card-header">
              <div class="card-icon" style="background: rgba(168, 85, 247, 0.1); color: #a855f7;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <h2>Reaction Roles</h2>
                <p class="card-desc">Create messages where members can react to get roles.</p>
              </div>
            </div>
            
            <form id="reaction-role-form" style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;">
              <div class="form-group">
                <label>Target Channel</label>
                <select id="rr-channel-select" class="channel-select" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary);">
                  <option value="" disabled selected>------- SELECT CHANNEL -------</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Message Content</label>
                <textarea id="rr-content" placeholder="React to this message to get your roles!" rows="3" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-family: var(--font-primary); resize: vertical;"></textarea>
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 10px;">Emoji & Role Mappings (Max 10)</label>
                <div id="rr-pairs-container" style="display: flex; flex-direction: column; gap: 10px;">
                  <div class="rr-pair-row" style="display: flex; gap: 10px;">
                    <input type="text" class="rr-emoji" placeholder="Emoji (e.g. 🔥)" required style="width: 120px; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary);">
                    <select class="rr-role-select" required style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary);">
                      <option value="" disabled selected>Select a role...</option>
                    </select>
                    <button type="button" class="btn btn-outline rr-remove-btn" style="padding: 10px; color: #ef4444; border-color: rgba(239,68,68,0.3);">×</button>
                  </div>
                </div>
                <button type="button" id="rr-add-pair-btn" class="btn btn-outline" style="margin-top: 10px; width: 100%; border-style: dashed;">+ Add another pair</button>
              </div>
              
              <button type="submit" class="btn btn-primary" style="padding: 12px; margin-top: 10px; font-weight: 600;">Create Reaction Role Message</button>
            </form>

            <h3 style="margin-bottom: 15px; font-size: 1.1rem;">Active Mappings</h3>
            <div style="background: var(--bg-body); border: 1px solid var(--border); border-radius: 8px; overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border);">
                    <th style="padding: 12px; color: var(--text-muted); font-weight: 600;">Channel</th>
                    <th style="padding: 12px; color: var(--text-muted); font-weight: 600;">Message ID</th>
                    <th style="padding: 12px; color: var(--text-muted); font-weight: 600;">Pairs</th>
                    <th style="padding: 12px; text-align: right; color: var(--text-muted); font-weight: 600;">Action</th>
                  </tr>
                </thead>
                <tbody id="rr-list-body">
                  <tr><td colspan="4" style="padding: 20px; text-align: center; color: var(--text-muted);">Loading...</td></tr>
                </tbody>
              </table>
            </div>
          </section>
`;
  indexHtml = indexHtml.replace('<!-- Card 1: Channel Lock/Unlock -->', rrSectionHtml + '\n          <!-- Card 1: Channel Lock/Unlock -->');
  fs.writeFileSync(indexPath, indexHtml);
}

// --- 2. Update app.js ---
if (!appJs.includes('rr-pairs-container')) {
  const rrLogic = `
  // --- Reaction Roles Logic ---
  const rrForm = $('#reaction-role-form');
  const rrPairsContainer = $('#rr-pairs-container');
  const rrAddPairBtn = $('#rr-add-pair-btn');
  const rrListBody = $('#rr-list-body');
  
  let currentGuildRoles = [];

  // Update roles list on load
  async function loadRRRoles() {
    if (!currentGuildId) return;
    try {
      const roles = await api(\`/api/settings/\${currentGuildId}/roles\`);
      currentGuildRoles = roles.filter(r => r.id !== currentGuildId); // exclude @everyone
      // Update all existing dropdowns
      $$('.rr-role-select').forEach(sel => populateRoleSelect(sel, sel.value));
    } catch(err) {
      console.error(err);
    }
  }

  function populateRoleSelect(selectEl, selectedVal = '') {
    selectEl.innerHTML = '<option value="" disabled selected>Select a role...</option>';
    currentGuildRoles.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.name;
      selectEl.appendChild(opt);
    });
    if (selectedVal) selectEl.value = selectedVal;
  }

  if (rrAddPairBtn) {
    rrAddPairBtn.addEventListener('click', () => {
      if (rrPairsContainer.children.length >= 10) return toast('Max 10 pairs allowed', 'error');
      const row = document.createElement('div');
      row.className = 'rr-pair-row';
      row.style.cssText = 'display: flex; gap: 10px;';
      row.innerHTML = \`
        <input type="text" class="rr-emoji" placeholder="Emoji (e.g. 🔥)" required style="width: 120px; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary);">
        <select class="rr-role-select" required style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary);">
          <option value="" disabled selected>Select a role...</option>
        </select>
        <button type="button" class="btn btn-outline rr-remove-btn" style="padding: 10px; color: #ef4444; border-color: rgba(239,68,68,0.3);">×</button>
      \`;
      
      populateRoleSelect(row.querySelector('.rr-role-select'));
      row.querySelector('.rr-remove-btn').addEventListener('click', () => { row.remove(); });
      rrPairsContainer.appendChild(row);
    });
  }
  
  // Attach remove to initial row
  const initRemoveBtn = document.querySelector('.rr-remove-btn');
  if (initRemoveBtn) {
    initRemoveBtn.addEventListener('click', (e) => {
      if (rrPairsContainer.children.length > 1) e.target.parentElement.remove();
      else toast('At least one pair is required', 'error');
    });
  }

  async function loadRRList() {
    if (!currentGuildId) return;
    try {
      const list = await api(\`/api/panel/reactionroles\`);
      rrListBody.innerHTML = '';
      if (list.length === 0) {
        rrListBody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: var(--text-muted);">No active reaction roles.</td></tr>';
        return;
      }
      
      list.forEach(rr => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border)';
        tr.innerHTML = \`
          <td style="padding: 12px; color: var(--text-primary);">#\${rr.channelId}</td>
          <td style="padding: 12px; font-family: monospace; color: var(--text-muted);">\${rr.messageId}</td>
          <td style="padding: 12px; color: var(--text-primary);">\${rr.pairs.length} pairs</td>
          <td style="padding: 12px; text-align: right;">
            <button class="btn btn-sm btn-outline rr-del-btn" data-msg="\${rr.messageId}" style="color: #ef4444; border-color: rgba(239,68,68,0.3);">Delete</button>
          </td>
        \`;
        rrListBody.appendChild(tr);
      });
      
      $$('.rr-del-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const msgId = e.target.getAttribute('data-msg');
          if (!confirm('Delete this reaction role message mapping? (Will also attempt to delete the message in Discord)')) return;
          try {
            await api('/api/panel/reactionrole', {
              method: 'DELETE',
              body: { messageId: msgId }
            });
            toast('Deleted successfully', 'success');
            loadRRList();
          } catch(err) {
            toast(err.message, 'error');
          }
        });
      });
    } catch (e) {
      console.error(e);
    }
  }

  if (rrForm) {
    rrForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const channelId = $('#rr-channel-select').value;
      const content = $('#rr-content').value.trim();
      
      const pairs = [];
      $$('.rr-pair-row').forEach(row => {
        const emoji = row.querySelector('.rr-emoji').value.trim();
        const roleId = row.querySelector('.rr-role-select').value;
        if (emoji && roleId) pairs.push({ emoji, roleId });
      });
      
      if (pairs.length === 0) return toast('Need at least one pair', 'error');
      
      try {
        await api('/api/panel/reactionrole', {
          method: 'POST',
          body: { channelId, content, pairs }
        });
        toast('Reaction role created!', 'success');
        $('#rr-content').value = '';
        loadRRList();
      } catch(err) {
        toast(err.message, 'error');
      }
    });
  }
`;
  appJs = appJs.replace('// ─── Panel Actions ───────────────────────────────────', rrLogic + '\n  // ─── Panel Actions ───────────────────────────────────');
  
  // Also hook into selectGuild -> loadRRList and loadRRRoles
  const initSearch = `await loadSettings();`;
  appJs = appJs.replace(initSearch, initSearch + `\n    await loadRRRoles();\n    await loadRRList();`);
  
  fs.writeFileSync(appPath, appJs);
}

console.log('Reaction roles UI patch applied.');
