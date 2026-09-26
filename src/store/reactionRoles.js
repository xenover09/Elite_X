/**
 * In-memory state store for reaction roles.
 * Keyed by guildId. Value is a Map of messageId -> { channelId, pairs: [{ emoji, roleId }] }.
 */
const state = new Map();

/**
 * Get all reaction roles for a guild.
 * @param {string} guildId 
 * @returns {Map<string, { channelId: string, pairs: Array<{emoji: string, roleId: string}> }>}
 */
function getGuildReactionRoles(guildId) {
  if (!state.has(guildId)) {
    state.set(guildId, new Map());
  }
  return state.get(guildId);
}

/**
 * Add a new reaction role mapping.
 * @param {string} guildId 
 * @param {string} messageId 
 * @param {string} channelId 
 * @param {Array<{emoji: string, roleId: string}>} pairs 
 */
function addReactionRole(guildId, messageId, channelId, pairs) {
  const guildRoles = getGuildReactionRoles(guildId);
  guildRoles.set(messageId, { channelId, pairs });
}

/**
 * Remove a reaction role mapping.
 * @param {string} guildId 
 * @param {string} messageId 
 * @returns {boolean}
 */
function removeReactionRole(guildId, messageId) {
  const guildRoles = getGuildReactionRoles(guildId);
  return guildRoles.delete(messageId);
}

/**
 * Get a specific reaction role mapping by messageId.
 * @param {string} guildId 
 * @param {string} messageId 
 * @returns {{ channelId: string, pairs: Array<{emoji: string, roleId: string}> } | undefined}
 */
function getReactionRole(guildId, messageId) {
  const guildRoles = getGuildReactionRoles(guildId);
  return guildRoles.get(messageId);
}

module.exports = {
  getGuildReactionRoles,
  addReactionRole,
  removeReactionRole,
  getReactionRole
};
