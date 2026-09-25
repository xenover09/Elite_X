/* ═══════════════════════════════════════════════════════════
   Elite X — Dashboard Client Logic
   Manual Admin Key Login · Secure Bearer Auth · Embed Builder
   ═══════════════════════════════════════════════════════════ */

'use strict';

'use strict';

(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

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
        await loadDashboard(data.user);
      } else {
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
      topbar.style.display = name === 'login' ? 'none' : 'flex';
    }
  }

  async function loadDashboard(user) {
    try {
      showScreen('servers');
      
      // Fetch bot info for logo
      const healthObj = await api('/api/health');
      if (topbarBotLogo) {
        topbarBotLogo.src = 'logo.jpg';
        topbarBotLogo.style.display = 'block';
      }

      if (user) {
        userAvatar.src = user.avatarURL || 'https://cdn.discordapp.com/embed/avatars/0.png';
        userName.textContent = user.global_name || user.username;
      }
      
      await fetchAndRenderGuilds();
    } catch (e) {
      console.error('Dashboard load failed', e);
      showScreen('login');
    }
  }

  async function fetchAndRenderGuilds() {
    guildsData = await api('/api/settings/guilds');
    populateGuildSelect(guildsData);
    
    if (guildsListEl) {
      guildsListEl.innerHTML = '';
      guildsData.forEach(g => {
        const row = document.createElement('div');
        row.className = 'guild-row';
        
        const iconHtml = g.icon 
          ? `<img src="${g.icon}" class="guild-row-icon">`
          : `<div class="guild-row-icon">${g.name.charAt(0)}</div>`;
          
        const actionHtml = g.botInGuild
          ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`
          : `<button class="btn btn-primary btn-sm">Invite</button>`;
          
        row.innerHTML = `
          <div class="guild-row-left">
            ${iconHtml}
            <div class="guild-row-name">${g.name}</div>
          </div>
          <div class="guild-row-right">
            ${actionHtml}
          </div>
        `;
        
        row.addEventListener('click', (e) => {
          if (!g.botInGuild) {
            window.open('https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands', '_blank');
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
    
    // Auto-select if only 1 guild
    if (guilds.length === 1) {
      guildSelect.value = guilds[0].id;
      selectGuild(guilds[0].id);
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
      loadRoles(guildId),
      loadSettings()
    ]);
  }

  async function loadChannels(guildId) {
    try {
      const channels = await api(`/api/settings/${guildId}/channels`);
      const dropdowns = $$('.channel-select');
      dropdowns.forEach(dd => {
        dd.innerHTML = '<option value="" disabled selected>------- SELECT CHANNEL -------</option>';
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
          <label for="role-${role.id}">${role.name}</label>
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
  }

  function setAIState(enabled) {
    aiToggleBtn.classList.toggle('active', enabled);
    aiStatusLabel.textContent = enabled ? 'AI Status: Online' : 'AI Status: Offline';
    aiStatusLabel.className = 'ai-status-label ' + (enabled ? 'on' : 'off');
  }

  aiToggleBtn.addEventListener('click', async () => {
    if (!currentGuildId) return;
    try {
      const data = await api('/api/settings/toggle', { method: 'POST', body: { guildId: currentGuildId } });
      setAIState(data.aiEnabled);
      toast(data.aiEnabled ? 'AI Activated' : 'AI Deactivated', 'success');
    } catch (e) {
      toast('Toggle failed', 'error');
    }
  });

  // ─── Panel Actions ───────────────────────────────────

  // 1. Send Embed
  addButtonRow.addEventListener('click', () => {
    if (buttonsContainer.children.length >= 5) return toast('Max 5 buttons allowed', 'error');
    const div = document.createElement('div');
    div.className = 'button-config-row';
    div.innerHTML = `
      <input type="text" placeholder="Label" class="btn-label">
      <input type="url" placeholder="URL" class="btn-url">
      <button type="button" class="btn-remove">×</button>
    `;
    div.querySelector('.btn-remove').onclick = () => div.remove();
    buttonsContainer.appendChild(div);
  });

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
    
    // Fallback for manual key if still using it for some reason
    const key = localStorage.getItem('admin_key');
    if (key) {
      config.headers['Authorization'] = `Bearer ${key}`;
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
    navDashboardBtn.addEventListener('click', () => showScreen('servers'));
  }
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
