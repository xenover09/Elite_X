'use strict';

const { getState, toggleFeature, updateAISettings } = require('../store/panelState');

/**
 * Returns dashboard-facing settings for a guild.
 * @param {string} guildId
 */
function getSettings(guildId) {
  const state = getState(guildId);
  return { 
    aiEnabled: state.aiChat,
    aiChannel: state.aiChannel,
    aiApiUrl: state.aiApiUrl,
    aiApiKey: state.aiApiKey,
    aiModel: state.aiModel
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

module.exports = { getSettings, toggleAI, updateAISettings };
