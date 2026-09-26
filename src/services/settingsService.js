'use strict';

const { getState, toggleFeature, updateAISettings } = require('../store/panelState');

/**
 * Returns dashboard-facing settings for a guild.
 * @param {string} guildId
 */
function getSettings(guildId) {
  const state = getState(guildId);
  const isKeyPresent = !!state.aiApiKey;
  return { 
    aiEnabled: state.aiChat,
    aiChannel: state.aiChannel,
    aiPersonality: state.aiPersonality || 'default',
    hasApiKey: isKeyPresent,
    aiApiKey: isKeyPresent ? 'gsk_••••••••••••' : '',
    amSpam: state.amSpam,
    amMentions: state.amMentions,
    amCaps: state.amCaps,
    amBadwords: state.amBadwords,
    amInvites: state.amInvites,
    modLogEnabled: state.modLogEnabled,
    modLogChannelId: state.modLogChannelId
  };
}

/**
 * Toggles the AI chat feature for a guild.
 * @param {string} guildId
 * @returns {{ aiEnabled: boolean }}
 */
function toggleAI(guildId) {
  const newValue = toggleFeature(guildId, 'aiChat');
  return { aiEnabled: newValue };
}

const { updateAutoModSettings, updateModLogSettings } = require('../store/panelState');

module.exports = { getSettings, toggleAI, updateAISettings, updateAutoModSettings, updateModLogSettings };
