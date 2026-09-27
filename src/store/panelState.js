/**
 * In-memory state store for panel toggles.
 * Keyed by guildId so each server has independent state.
 */
const state = new Map();

function getState(guildId) {
  if (!state.has(guildId)) {
    state.set(guildId, { 
      aiChat: false, 
      aiChannel: '',
      aiApiKey: '',
      aiPersonality: 'default',
      amSpam: false,
      amMentions: false,
      amCaps: false,
      amBadwords: false,
      amInvites: false,
      modLogEnabled: false,
      modLogChannelId: ''
    });
  }
  return state.get(guildId);
}

function toggleFeature(guildId, feature) {
  const current = getState(guildId);
  current[feature] = !current[feature];
  state.set(guildId, current);
  require('./persistentStore').saveGuildState(guildId);
  return current[feature];
}

function updateAISettings(guildId, settings) {
  const current = getState(guildId);
  current.aiChannel = settings.aiChannel || '';
  if (settings.aiApiKey && settings.aiApiKey !== 'gsk_••••••••••••') {
    current.aiApiKey = settings.aiApiKey;
  } else if (!settings.aiApiKey) {
    current.aiApiKey = '';
  }
  if (settings.aiPersonality) {
    current.aiPersonality = settings.aiPersonality;
  }
  state.set(guildId, current);
  require('./persistentStore').saveGuildState(guildId);
  return current;
}

function updateAutoModSettings(guildId, settings) {
  const current = getState(guildId);
  if (typeof settings.amSpam === 'boolean') current.amSpam = settings.amSpam;
  if (typeof settings.amMentions === 'boolean') current.amMentions = settings.amMentions;
  if (typeof settings.amCaps === 'boolean') current.amCaps = settings.amCaps;
  if (typeof settings.amBadwords === 'boolean') current.amBadwords = settings.amBadwords;
  if (typeof settings.amInvites === 'boolean') current.amInvites = settings.amInvites;
  state.set(guildId, current);
  require('./persistentStore').saveGuildState(guildId);
  return current;
}

function updateModLogSettings(guildId, settings) {
  const current = getState(guildId);
  if (typeof settings.modLogEnabled === 'boolean') current.modLogEnabled = settings.modLogEnabled;
  if (typeof settings.modLogChannelId === 'string') current.modLogChannelId = settings.modLogChannelId;
  state.set(guildId, current);
  require('./persistentStore').saveGuildState(guildId);
  return current;
}

function setState(guildId, data) {
  state.set(guildId, data);
}

module.exports = { getState, setState, toggleFeature, updateAISettings, updateAutoModSettings, updateModLogSettings };
