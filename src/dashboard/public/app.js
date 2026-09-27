/* ═══════════════════════════════════════════════════════════
   Elite X — Dashboard Client Logic
   Secure Discord OAuth · AI Settings · Embed Builder
   ═══════════════════════════════════════════════════════════ */

'use strict';

(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function escapeHtml(unsafe) {
    return (unsafe || '').toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  const loginScreen       = $('#login-screen');
  const dashScreen        = $('#dashboard-screen');
  const serversScreen     = $('#servers-screen');
  const topbar            = $('#main-topbar');
  const loginError        = $('#login-error');

  const userAvatar        = $('#user-avatar');
  const userName          = $('#user-name');
  const guildSelect       = $('#guild-select');
  const guildNameDisplay  = $('#current-guild-name');
  const mainServerTitle   = $('#main-server-title');
  const guildsListEl      = $('#guilds-list');
  const refreshGuildsBtn  = $('#refresh-guilds-btn');
  const navDashboardBtn   = $('#nav-dashboard-btn');
  const topbarBotLogo     = $('#topbar-bot-logo');
  const mainServerAvatar  = $('#main-server-avatar');
  const mainServerAvatarPlaceholder = $('#main-server-avatar-placeholder');
  const navItems          = $$('.nav-item');
  const tabContents       = $$('.tab-content');
  const aiToggleBtn       = $('#ai-toggle-btn');
  const aiStatusLabel     = $('#ai-status-label');
  const aiSettingsForm    = $('#ai-settings-form');
  const aiChannelSelect   = $('#ai-channel-select');
  const aiPersonalitySelect = $('#ai-personality');
  const aiApiKeyInput     = $('#ai-api-key');
  const embedForm         = $('#embed-form');
  const addButtonRow      = $('#add-button-row');
  const buttonsContainer  = $('#buttons-container');
  const toastContainer    = $('#toast-container');
  
  const lockBtn           = $('#lock-btn');
  const clearBtn          = $('#clear-btn');
  const themeToggle       = $('#theme-toggle');
  const sunIcon           = $('.sun-icon');
  const moonIcon          = $('.moon-icon');

  let currentGuildId = null;
  let guildsData     = [];
  let healthData     = null;

  // Theme Initialization
  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcons(currentTheme);

  themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    let newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
  });

  function updateThemeIcons(theme) {
    if (theme === 'dark') {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  }

  init();

  async function init() {
    try {
      const res = await fetch('/auth/user');
      const data = await res.json();
      
      if (data.authenticated) {
        document.body.classList.add('is-logged-in');
        
        // Populate Topbar User Info for both Landing Page and Dashboard
        if (userAvatar) userAvatar.src = data.user.avatarURL || 'https://cdn.discordapp.com/embed/avatars/0.png';
        if (userName) userName.textContent = data.user.global_name || data.user.username;
        if (topbarBotLogo) {
          topbarBotLogo.src = 'logo.jpg';
          topbarBotLogo.style.display = 'block';
        }

        // Only show dashboard if they are actually on /dashboard or another sub-route.
        // If they are on the root URL '/', show the landing page as requested.
        if (window.location.pathname === '/' || window.location.pathname === '') {
          showScreen('login'); // This shows the landing page
          // Fetch data in background so it's instantly ready
          loadDashboard(data.user, false);
        } else {
          await loadDashboard(data.user, true);
        }
      } else {
        // Not authenticated: always show landing page
        document.body.classList.remove('is-logged-in');
        showScreen('login');
      }
    } catch (e) {
      showScreen('login');
    }
  }

  function showScreen(name) {
    loginScreen.classList.toggle('active', name === 'login');
    dashScreen.classList.toggle('active', name === 'dashboard');
    if (serversScreen) serversScreen.classList.toggle('active', name === 'servers');
    
    if (topbar) {
      const isLoggedIn = document.body.classList.contains('is-logged-in');
      topbar.style.display = (name === 'login' && !isLoggedIn) ? 'none' : 'flex';
    }
  }

  async function loadDashboard(user, showServers = true) {
    try {
      if (showServers) showScreen('servers');
      
      // Fetch bot info for later use
      healthData = await api('/api/health');
      
      await fetchAndRenderGuilds();
    } catch (e) {
      console.error('Dashboard load failed', e);
      showScreen('login');
    }
  }

  async function fetchAndRenderGuilds() {
    if (guildsListEl) {
      guildsListEl.innerHTML = `
        <div class="guild-row skeleton">
          <div class="guild-row-left">
            <div class="skeleton-circle"></div>
            <div class="skeleton-text" style="width: 150px;"></div>
          </div>
        </div>
        <div class="guild-row skeleton">
          <div class="guild-row-left">
            <div class="skeleton-circle"></div>
            <div class="skeleton-text" style="width: 120px;"></div>
          </div>
        </div>
      `;
    }

    try {
      guildsData = await api('/api/settings/guilds');
    } catch (e) {
      if (guildsListEl) guildsListEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--danger);">Failed to load guilds.</div>';
      return;
    }

    populateGuildSelect(guildsData);
    
    if (guildsListEl) {
      guildsListEl.innerHTML = '';
      if (!guildsData || guildsData.length === 0) {
        guildsListEl.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);"><h3 class="h3">No Guilds Found</h3><p>You need to join a server first.</p></div>';
        return;
      }
      guildsData.forEach(g => {
        const row = document.createElement('div');
        row.className = 'guild-row';
        
        const escapedName = escapeHtml(g.name);
        
        const iconHtml = g.icon 
          ? `<img src="${g.icon}" class="guild-row-icon">`
          : `<div class="guild-row-icon">${escapedName.charAt(0)}</div>`;
          
        const actionHtml = g.botInGuild
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 18 15 12 9 6"/></svg>`
          : `<button class="btn btn-primary btn-sm" style="padding: 6px 16px; font-weight: 600;">Invite</button>`;
          
        row.innerHTML = `
          <div class="guild-row-left">
            ${iconHtml}
            <div class="guild-row-name">${escapedName}</div>
          </div>
          <div class="guild-row-right">
            ${actionHtml}
          </div>
        `;
        
        row.addEventListener('click', (e) => {
          if (!g.botInGuild) {
            const cid = (healthData && healthData.clientId) ? healthData.clientId : 'YOUR_CLIENT_ID';
            window.open(`https://discord.com/api/oauth2/authorize?client_id=${cid}&permissions=2147576848&scope=bot%20applications.commands`, '_blank');
            return;
          }
          guildSelect.value = g.id;
          selectGuild(g.id);
          showScreen('dashboard');
        });
        
        guildsListEl.appendChild(row);
      });
    }
  }

  function populateGuildSelect(guilds) {
    guildSelect.innerHTML = '<option value="" disabled selected>Change Server</option>';
    // Only put guilds where bot is present in the dropdown
    guilds.filter(g => g.botInGuild).forEach((g) => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = g.name;
      guildSelect.appendChild(opt);
    });
    const activeGuilds = guilds.filter(g => g.botInGuild);
    // Auto-select if only 1 guild
    if (activeGuilds.length === 1) {
      guildSelect.value = activeGuilds[0].id;
      selectGuild(activeGuilds[0].id);
    }
  }

  guildSelect.addEventListener('change', () => selectGuild(guildSelect.value));

  async function selectGuild(guildId) {
    currentGuildId = guildId;
    const guild = guildsData.find(g => g.id === guildId);
    
    const name = guild ? guild.name : 'Unknown';
    guildNameDisplay.textContent = name;
    if (mainServerTitle) mainServerTitle.textContent = name;
    
    // Set server avatar
    const sidebarServerIcon = $('#sidebar-server-icon');
    const sidebarServerPlaceholder = $('#sidebar-server-placeholder');
    
    if (mainServerAvatar && mainServerAvatarPlaceholder && guild) {
      if (guild.icon) {
        mainServerAvatar.src = guild.icon;
        mainServerAvatar.style.display = 'flex';
        mainServerAvatarPlaceholder.style.display = 'none';
        
        if (sidebarServerIcon) {
          sidebarServerIcon.src = guild.icon;
          sidebarServerIcon.style.display = 'block';
          sidebarServerPlaceholder.style.display = 'none';
        }
      } else {
        mainServerAvatar.style.display = 'none';
        mainServerAvatarPlaceholder.style.display = 'flex';
        
        if (sidebarServerIcon) {
          sidebarServerIcon.style.display = 'none';
          sidebarServerPlaceholder.style.display = 'block';
        }
      }
    }

    // Fetch real stats
    try {
      const stats = await api(`/api/settings/${guildId}/stats`);
      const statMembers = $('#stat-members');
      const statTextChannels = $('#stat-text-channels');
      const statVoiceChannels = $('#stat-voice-channels');
      
      if (statMembers) statMembers.textContent = stats.memberCount || 0;
      if (statTextChannels) statTextChannels.textContent = stats.textChannels || 0;
      if (statVoiceChannels) statVoiceChannels.textContent = stats.voiceChannels || 0;
    } catch (e) {
      console.error('Failed to load stats', e);
    }
    aiToggleBtn.disabled = false;
    
    // Default to Server Overview tab
    const overviewTab = $('[data-tab="card-overview"]');
    if (overviewTab) overviewTab.click();
    
    await Promise.all([
      loadChannels(guildId),
      loadRoles(guildId)
    ]);
    await loadSettings();
    await loadRRRoles();
    await loadRRList();
  }

  async function loadChannels(guildId) {
    try {
      const channels = await api(`/api/settings/${guildId}/channels`);
      const dropdowns = $$('.channel-select');
      dropdowns.forEach(dd => {
        const isOptional = dd.id === 'ai-channel-select';
        if (isOptional) {
          dd.innerHTML = '<option value="">------- ANY CHANNEL (OPTIONAL) -------</option>';
        } else {
          dd.innerHTML = '<option value="" disabled selected>------- SELECT CHANNEL -------</option>';
        }
        channels.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = `# ${c.name}`;
          dd.appendChild(opt);
        });
      });
    } catch (e) {
      toast('Failed to load channels', 'error');
    }
  }

  async function loadRoles(guildId) {
    try {
      const roles = await api(`/api/settings/${guildId}/roles`);
      const container = $('.roles-list-container');
      container.innerHTML = '';
      roles.forEach(role => {
        const div = document.createElement('div');
        div.className = 'role-item';
        div.innerHTML = `
          <input type="checkbox" class="role-checkbox" id="role-${role.id}" value="${role.id}">
          <label for="role-${role.id}">${escapeHtml(role.name)}</label>
        `;
        container.appendChild(div);
      });
    } catch (e) {
      toast('Failed to load roles', 'error');
    }
  }

  async function loadSettings() {
    if (!currentGuildId) return;
    const data = await api(`/api/settings?guildId=${currentGuildId}`);
    setAIState(data.aiEnabled);
    if (aiChannelSelect) aiChannelSelect.value = data.aiChannel || '';
    if (aiPersonalitySelect) aiPersonalitySelect.value = data.aiPersonality || 'default';
    if (aiApiKeyInput) aiApiKeyInput.value = data.aiApiKey || '';
    
    // AutoMod
    const amSpam = $('#am-spam');
    const amMentions = $('#am-mentions');
    const amCaps = $('#am-caps');
    const amBadwords = $('#am-badwords');
    const amInvites = $('#am-invites');
    if (amSpam) amSpam.checked = data.amSpam || false;
    if (amMentions) amMentions.checked = data.amMentions || false;
    if (amCaps) amCaps.checked = data.amCaps || false;
    if (amBadwords) amBadwords.checked = data.amBadwords || false;
    if (amInvites) amInvites.checked = data.amInvites || false;
    
    // Mod Log
    const modLogEnabled = $('#modlog-enabled');
    const modLogChannel = $('#modlog-channel-select');
    if (modLogEnabled) modLogEnabled.checked = data.modLogEnabled || false;
    if (modLogChannel) modLogChannel.value = data.modLogChannelId || '';


  }

  function setAIState(enabled) {
    aiToggleBtn.checked = enabled;
    aiStatusLabel.textContent = enabled ? 'AI Status: Online' : 'AI Status: Offline';
    aiStatusLabel.style.color = enabled ? '#22c55e' : 'var(--text-muted)';
  }

  aiToggleBtn.addEventListener('change', async (e) => {
    e.preventDefault(); // Prevent UI from toggling before API confirms
    if (!currentGuildId) return;
    try {
      const data = await api('/api/settings/toggle', { method: 'POST', body: { guildId: currentGuildId } });
      setAIState(data.aiEnabled);
      toast(data.aiEnabled ? 'AI Activated' : 'AI Deactivated', 'success');
    } catch (e) {
      toast('Toggle failed', 'error');
    }
  });

  if (aiSettingsForm) {
    aiSettingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentGuildId) return toast('Select a server first', 'error');

      const payload = {
        guildId: currentGuildId,
        aiChannel: aiChannelSelect ? aiChannelSelect.value : '',
        aiPersonality: aiPersonalitySelect ? aiPersonalitySelect.value : 'default',
        aiApiKey: aiApiKeyInput ? aiApiKeyInput.value : ''
      };

      try {
        await api('/api/settings/ai', {
          method: 'POST',
          body: payload
        });
        toast('AI Settings saved successfully!', 'success');
      } catch (e) {
        toast(e.message || 'Failed to save AI settings', 'error');
      }
    });
  }

  
  const automodForm = $('#automod-form');
  if (automodForm) {
    automodForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentGuildId) return toast('Select a server first', 'error');
      
      const payload = {
        guildId: currentGuildId,
        amSpam: $('#am-spam').checked,
        amMentions: $('#am-mentions').checked,
        amCaps: $('#am-caps').checked,
        amBadwords: $('#am-badwords').checked,
        amInvites: $('#am-invites').checked
      };
      
      try {
        await api('/api/settings/automod', {
          method: 'POST',
          body: payload
        });
        toast('AutoMod settings saved successfully!', 'success');
      } catch (e) {
        toast(e.message || 'Failed to save AutoMod settings', 'error');
      }
    });
  }

  
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
      const roles = await api(`/api/settings/${currentGuildId}/roles`);
      currentGuildRoles = roles.filter(r => r.id !== currentGuildId); // exclude @everyone
      // Update all existing dropdowns
      $('.rr-role-select').forEach(sel => populateRoleSelect(sel, sel.value));
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
      row.innerHTML = `
        <input type="text" class="rr-emoji" placeholder="Emoji (e.g. 🔥)" required style="width: 120px; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary);">
        <select class="rr-role-select" required style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary);">
          <option value="" disabled selected>Select a role...</option>
        </select>
        <button type="button" class="btn btn-outline rr-remove-btn" style="padding: 10px; color: #ef4444; border-color: rgba(239,68,68,0.3);">×</button>
      `;
      
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
      const list = await api(`/api/panel/reactionroles?guildId=${currentGuildId}`);
      rrListBody.innerHTML = '';
      if (list.length === 0) {
        rrListBody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: var(--text-muted);">No active reaction roles.</td></tr>';
        return;
      }
      
      list.forEach(rr => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border)';
        tr.innerHTML = `
          <td style="padding: 12px; color: var(--text-primary);">#${rr.channelId}</td>
          <td style="padding: 12px; font-family: monospace; color: var(--text-muted);">${rr.messageId}</td>
          <td style="padding: 12px; color: var(--text-primary);">${rr.pairs.length} pairs</td>
          <td style="padding: 12px; text-align: right;">
            <button class="btn btn-sm btn-outline rr-del-btn" data-msg="${rr.messageId}" style="color: #ef4444; border-color: rgba(239,68,68,0.3);">Delete</button>
          </td>
        `;
        rrListBody.appendChild(tr);
      });
      
      $('.rr-del-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const msgId = e.target.getAttribute('data-msg');
          if (!confirm('Delete this reaction role message mapping? (Will also attempt to delete the message in Discord)')) return;
          try {
            await api('/api/panel/reactionrole', {
              method: 'DELETE',
              body: { guildId: currentGuildId, messageId: msgId }
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
      $('.rr-pair-row').forEach(row => {
        const emoji = row.querySelector('.rr-emoji').value.trim();
        const roleId = row.querySelector('.rr-role-select').value;
        if (emoji && roleId) pairs.push({ emoji, roleId });
      });
      
      if (pairs.length === 0) return toast('Need at least one pair', 'error');
      
      try {
        await api('/api/panel/reactionrole', {
          method: 'POST',
          body: { guildId: currentGuildId, channelId, content, pairs }
        });
        toast('Reaction role created!', 'success');
        $('#rr-content').value = '';
        loadRRList();
      } catch(err) {
        toast(err.message, 'error');
        alert('Failed to create Reaction Role Message:\n' + err.message);
      }
    });
  }

  
  const modLogForm = $('#modlog-form');
  if (modLogForm) {
    modLogForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentGuildId) return toast('Select a server first', 'error');
      
      const payload = {
        guildId: currentGuildId,
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

  
  // --- Security Audit Logic ---
  const runAuditBtn = $('#run-audit-btn');
  const auditScoreNum = $('#audit-score-number');
  const auditMainCircle = $('#audit-main-circle');
  const auditRisk = $('#audit-score-risk');
  const auditNuke = $('#audit-score-nuke');
  const auditCategoriesGrid = $('#audit-categories-grid');
  const auditStrengths = $('#audit-strengths');

  function getSeverityColor(severity) {
    if (severity === 'Critical') return '#ef4444';
    if (severity === 'High') return '#f97316';
    if (severity === 'Medium') return '#eab308';
    if (severity === 'Low') return '#3b82f6';
    return '#22c55e';
  }

  function getScoreColor(score) {
    if (score < 40) return '#ef4444';
    if (score < 60) return '#f97316';
    if (score < 80) return '#eab308';
    return '#22c55e';
  }

  function renderAudit(data) {
    const mainColor = getScoreColor(data.score);
    
    // Animate wheel
    auditScoreNum.textContent = data.score;
    auditScoreNum.style.color = mainColor;
    auditMainCircle.style.stroke = mainColor;
    // Stroke dasharray represents percentage (0 to 100)
    auditMainCircle.style.strokeDasharray = `${data.score}, 100`;
    
    auditRisk.textContent = `${data.riskLevel} Security`;
    auditNuke.textContent = `Nuke Risk: ${data.nukeRisk}`;
    auditNuke.style.color = mainColor;

    // Process categories
    const allCategories = ['Settings', 'Roles', 'Bots', 'Webhooks', 'Information'];
    const catData = {};
    
    allCategories.forEach(c => catData[c] = { score: 100, findings: [], worstLevel: 4 }); // 0=Critical, 4=Secure
    
    data.findings.forEach(f => {
      if (!catData[f.category]) catData[f.category] = { score: 100, findings: [], worstLevel: 4 };
      catData[f.category].findings.push(f);
      
      let level = 3;
      let deduction = 2;
      if (f.severity === 'Critical') { deduction = 20; level = 0; }
      else if (f.severity === 'High') { deduction = 10; level = 1; }
      else if (f.severity === 'Medium') { deduction = 5; level = 2; }
      
      if (level < catData[f.category].worstLevel) catData[f.category].worstLevel = level;
      catData[f.category].score = Math.max(0, catData[f.category].score - deduction);
    });

    auditCategoriesGrid.innerHTML = '';
    
    // Render Category Cards
    Object.keys(catData).forEach(catName => {
      const cat = catData[catName];
      const hasIssues = cat.findings.length > 0;
      const catColor = hasIssues ? getScoreColor(cat.score) : '#22c55e';
      
      const card = document.createElement('div');
      card.className = 'audit-cat-card';
      card.style.cssText = `
        background: var(--bg-body); 
        border-radius: 12px; 
        border: 1px solid var(--border);
        overflow: hidden;
        transition: all 0.3s;
      `;

      // Card Header
      const header = document.createElement('div');
      header.style.cssText = `
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        cursor: pointer;
        position: relative;
      `;
      
      // Mini Ring
      const ringHtml = `
        <div style="width: 48px; height: 48px; position: relative;">
          <svg viewBox="0 0 36 36" style="width:100%; height:100%; transform: rotate(-90deg);">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="3" />
            <path stroke-dasharray="${cat.score}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${catColor}" stroke-width="3" stroke-linecap="round" />
          </svg>
          <div style="position: absolute; top:50%; left:50%; transform: translate(-50%, -50%); font-size: 0.75rem; font-weight: 700; color: ${catColor};">${cat.score}</div>
        </div>
      `;

      const badgeHtml = hasIssues 
        ? `<span style="background: ${catColor}22; color: ${catColor}; padding: 3px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${cat.findings.length} issues</span>`
        : `<span style="background: rgba(34,197,94,0.1); color: #22c55e; padding: 3px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Secure</span>`;

      header.innerHTML = `
        ${ringHtml}
        <div style="flex: 1;">
          <h4 style="margin:0; font-size: 1.1rem; color: var(--text-primary);">${catName}</h4>
          <div style="margin-top: 4px;">${badgeHtml}</div>
        </div>
        <div style="color: var(--text-muted); transition: transform 0.3s;" class="chevron">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      `;
      
      card.appendChild(header);

      // Findings Container (Expandable)
      const findingsContainer = document.createElement('div');
      findingsContainer.style.cssText = `
        display: none;
        padding: 0 20px 20px 20px;
        border-top: 1px solid var(--border);
        background: rgba(0,0,0,0.1);
      `;
      
      if (hasIssues) {
        cat.findings.forEach(f => {
          const fColor = getSeverityColor(f.severity);
          const fItem = document.createElement('div');
          fItem.style.cssText = `margin-top: 15px; padding-left: 12px; border-left: 3px solid ${fColor};`;
          fItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: ${fColor};">${f.severity}</span>
              <strong style="color: var(--text-primary); font-size: 0.95rem;">${f.title}</strong>
            </div>
            <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 6px; line-height: 1.4;">${f.detail}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);"><strong style="color:var(--text-primary);">Fix:</strong> ${f.fix}</div>
          `;
          findingsContainer.appendChild(fItem);
        });
      } else {
        findingsContainer.innerHTML = `<div style="padding-top:15px; color: #22c55e; font-size: 0.9rem;">No issues found in ${catName}.</div>`;
      }
      card.appendChild(findingsContainer);

      // Expand toggle
      header.addEventListener('click', () => {
        const isExpanded = findingsContainer.style.display === 'block';
        findingsContainer.style.display = isExpanded ? 'none' : 'block';
        header.querySelector('.chevron').style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        card.style.borderColor = isExpanded ? 'var(--border)' : catColor;
      });

      auditCategoriesGrid.appendChild(card);
    });

    // Strengths
    auditStrengths.innerHTML = '';
    if (data.strengths.length === 0) {
      auditStrengths.innerHTML = '<div style="color: var(--text-muted); font-size: 0.95rem; font-style: italic;">No strong points identified.</div>';
    } else {
      data.strengths.forEach(s => {
        const row = document.createElement('div');
        row.style.cssText = `display: flex; align-items: flex-start; gap: 10px; background: var(--bg-body); padding: 12px 15px; border-radius: 8px; border: 1px solid var(--border);`;
        row.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;"><path d="M20 6L9 17l-5-5"/></svg>
          <span style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.4;">${s}</span>
        `;
        auditStrengths.appendChild(row);
      });
    }
  }

  async function loadSecurityAudit() {
    if (!currentGuildId) return toast('Select a server first', 'error');
    try {
      const origText = runAuditBtn.textContent;
      runAuditBtn.innerHTML = '<svg class="spinner" viewBox="0 0 50 50" style="width:20px;height:20px;animation:spin 1s linear infinite;"><circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="80" stroke-linecap="round"></circle></svg> Scanning...';
      runAuditBtn.disabled = true;
      runAuditBtn.style.opacity = '0.7';
      
      // Reset wheel
      auditMainCircle.style.strokeDasharray = '0, 100';
      auditScoreNum.textContent = '--';
      auditScoreNum.style.color = 'var(--text-primary)';
      auditRisk.textContent = 'Scanning...';
      auditNuke.textContent = 'Nuke Risk: --';
      auditNuke.style.color = 'var(--text-muted)';
      
      const data = await api(`/api/panel/security-audit?guildId=${currentGuildId}`);
      
      // small delay for animation effect
      setTimeout(() => {
        renderAudit(data);
        runAuditBtn.textContent = 'Re-scan Server';
        runAuditBtn.disabled = false;
        runAuditBtn.style.opacity = '1';
      }, 500);
      
    } catch(err) {
      toast('Failed to run security audit', 'error');
      runAuditBtn.textContent = 'Re-scan Server';
      runAuditBtn.disabled = false;
      runAuditBtn.style.opacity = '1';
    }
  }

  if (runAuditBtn) {
    runAuditBtn.addEventListener('click', loadSecurityAudit);
  }
  
  // ─── Panel Actions ───────────────────────────────────

  // 1. Send Embed
  
  const embedTitle = $('#embed-title');
  const embedDesc = $('#embed-desc');
  const embedColor = $('#embed-color');
  const embedFileInput = $('#embed-file-input');
  const previewBox = $('#embed-preview');
  const previewTitle = $('#preview-title');
  const previewDesc = $('#preview-desc');
  const previewImage = $('#preview-image');
  const previewButtons = $('#preview-buttons');

  function updatePreview() {
    if (!previewBox) return;
    previewBox.style.borderLeftColor = embedColor.value || '#00bfff';
    previewTitle.textContent = embedTitle.value || 'Title...';
    previewDesc.textContent = embedDesc.value || 'Description...';
    
    if (embedFileInput.files && embedFileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewImage.style.display = 'block';
      };
      reader.readAsDataURL(embedFileInput.files[0]);
    } else {
      previewImage.style.display = 'none';
      previewImage.src = '';
    }

    previewButtons.innerHTML = '';
    $$('.button-config-row').forEach(row => {
      const label = row.querySelector('.btn-label').value;
      if (label) {
        const btn = document.createElement('div');
        btn.style = 'background: #4f545c; color: white; padding: 6px 16px; border-radius: 3px; font-size: 0.85rem; font-weight: 500; display: inline-block;';
        btn.textContent = label;
        previewButtons.appendChild(btn);
      }
    });
  }

  if (embedTitle) embedTitle.addEventListener('input', updatePreview);
  if (embedDesc) embedDesc.addEventListener('input', updatePreview);
  if (embedColor) embedColor.addEventListener('input', updatePreview);
  if (embedFileInput) embedFileInput.addEventListener('change', updatePreview);
  
  addButtonRow.addEventListener('click', () => {
    if (buttonsContainer.children.length >= 5) return toast('Max 5 buttons allowed', 'error');
    const div = document.createElement('div');
    div.className = 'button-config-row';
    div.innerHTML = `
      <input type="text" placeholder="Label" class="btn-label">
      <input type="url" placeholder="URL" class="btn-url">
      <button type="button" class="btn-remove">×</button>
    `;
    div.querySelector('.btn-label').addEventListener('input', updatePreview);
    div.querySelector('.btn-remove').onclick = () => { div.remove(); updatePreview(); };
    buttonsContainer.appendChild(div);
    updatePreview();
  });
  
  // Initialize preview
  setTimeout(updatePreview, 100);

  embedForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentGuildId) return toast('Select a server first', 'error');
    
    const channelId = $('#embed-channel').value;
    const title = $('#embed-title').value;
    const description = $('#embed-desc').value;
    const color = $('#embed-color').value;

    const fileInput = $('#embed-file-input');
    const imageFile = fileInput.files[0];

    if (!channelId) return toast('Select a channel', 'error');

    const buttons = [];
    $$('.button-config-row').forEach(row => {
      const label = row.querySelector('.btn-label').value;
      const url = row.querySelector('.btn-url').value;
      if (label && url) buttons.push({ label, url });
    });

    try {
      const formData = new FormData();
      formData.append('guildId', currentGuildId);
      formData.append('channelId', channelId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('color', color);
      formData.append('buttons', JSON.stringify(buttons));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api('/api/panel/send', {
        method: 'POST',
        body: formData
      });
      toast('Embed added to queue!', 'success');
      embedForm.reset();
      buttonsContainer.innerHTML = '';
    } catch (e) {
      toast(e.message, 'error');
    }
  });

  // 2. Lock Channel
  lockBtn.addEventListener('click', async () => {
    if (!currentGuildId) return toast('Select a server first', 'error');
    const channelId = $('#card-lock .channel-select').value;
    const selectedRoles = Array.from($$('.role-checkbox:checked')).map(cb => cb.value);

    if (!channelId) return toast('Select a channel', 'error');
    if (selectedRoles.length === 0) return toast('Select at least one role', 'error');

    try {
      await api('/api/panel/lock', {
        method: 'POST',
        body: { channelId, roleIds: selectedRoles }
      });
      toast('Permissions updated!', 'success');
    } catch (e) {
      toast(e.message, 'error');
    }
  });

  const unlockBtn = $('#unlock-btn');
  if (unlockBtn) {
    unlockBtn.addEventListener('click', async () => {
      if (!currentGuildId) return toast('Select a server first', 'error');
      const channelId = $('#card-lock .channel-select').value;
      if (!channelId) return toast('Select a channel to unlock', 'error');

      if (!confirm('Are you sure you want to unlock this channel? It will become visible to @everyone again.')) return;

      try {
        await api('/api/panel/unlock', {
          method: 'POST',
          body: { channelId }
        });
        toast('Channel unlocked successfully!', 'success');
      } catch (e) {
        toast(e.message, 'error');
      }
    });
  }

  // 3. Clear Chat
  clearBtn.addEventListener('click', async () => {
    if (!currentGuildId) return toast('Select a server first', 'error');
    const channelId = $('#card-clear .channel-select').value;

    if (!channelId) return toast('Select a channel', 'error');
    if (!confirm('Are you sure you want to clear this channel? All messages will be deleted.')) return;

    try {
      await api('/api/panel/clear', {
        method: 'POST',
        body: { channelId }
      });
      toast('Channel cleared successfully!', 'success');
    } catch (e) {
      toast(e.message, 'error');
    }
  });

  // ─── API Helper ──────────────────────────────────────
  async function api(url, opts = {}) {
    const config = {
      method: opts.method || 'GET',
      headers: {}
    };

    if (!(opts.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    if (opts.body) {
      config.body = (opts.body instanceof FormData) ? opts.body : JSON.stringify(opts.body);
    }

    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    
    if (res.status === 401 || res.status === 403) {
      showScreen('login');
      throw new Error('Unauthorized');
    }
    
    if (!res.ok) throw new Error(data.message || 'API Error');
    return data;
  }

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      navItems.forEach(n => n.classList.toggle('active', n === btn));
      tabContents.forEach(c => c.classList.toggle('active', c.id === tabId));
    });
  });

  const navSubBtns = $$('.nav-sub-btn');
  navSubBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      tabContents.forEach(c => c.classList.toggle('active', c.id === targetId));
    });
  });

  const userInfo = $('#user-info');
  const userDropdownMenu = $('#user-dropdown-menu');
  if (userInfo && userDropdownMenu) {
    userInfo.addEventListener('click', (e) => {
      userDropdownMenu.style.display = userDropdownMenu.style.display === 'none' ? 'block' : 'none';
      e.stopPropagation();
    });
    
    document.addEventListener('click', (e) => {
      if (!userDropdownMenu.contains(e.target) && e.target !== userInfo) {
        userDropdownMenu.style.display = 'none';
      }
    });
  }

  const rolesDropdownToggle = $('#roles-dropdown-toggle .select-box');
  const rolesListContainer = $('.roles-list-container');
  
  if (rolesDropdownToggle && rolesListContainer) {
    rolesDropdownToggle.addEventListener('click', (e) => {
      rolesListContainer.style.display = rolesListContainer.style.display === 'none' ? 'block' : 'none';
      e.stopPropagation();
    });
    
    document.addEventListener('click', (e) => {
      if (!rolesListContainer.contains(e.target) && e.target !== rolesDropdownToggle) {
        rolesListContainer.style.display = 'none';
      }
    });

    rolesListContainer.addEventListener('change', () => {
      const selected = Array.from(rolesListContainer.querySelectorAll('.role-checkbox:checked'));
      if (selected.length === 0) {
        rolesDropdownToggle.textContent = 'Select Roles...';
      } else {
        rolesDropdownToggle.textContent = `${selected.length} roles selected`;
      }
    });
  }

  if (navDashboardBtn) {
    navDashboardBtn.addEventListener('click', () => {
      history.pushState({}, '', '/dashboard');
      showScreen('servers');
    });
  }
  
  const topbarLogoBtn = $('.topbar-left');
  if (topbarLogoBtn) {
    topbarLogoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      history.pushState({}, '', '/');
      showScreen('login');
    });
  }

  window.addEventListener('popstate', () => {
    if (window.location.pathname === '/' || window.location.pathname === '') {
      showScreen('login');
    } else if (window.location.pathname === '/dashboard') {
      showScreen(currentGuildId ? 'dashboard' : 'servers');
    }
  });
  if (refreshGuildsBtn) {
    refreshGuildsBtn.addEventListener('click', fetchAndRenderGuilds);
  }

  function toast(msg, type) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    toastContainer.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
})();
