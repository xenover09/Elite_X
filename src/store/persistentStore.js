const { Redis } = require('@upstash/redis');
const logger = require('../utils/logger');
const crypto = require('../utils/crypto');

let redis = null;

function initRedis() {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    logger.warn('[Redis] UPSTASH_REDIS_REST_URL or TOKEN missing. Falling back to in-memory/local storage.');
    return null;
  }
  try {
    redis = new Redis({ url, token });
    return redis;
  } catch (err) {
    logger.warn(`[Redis] Failed to initialize: ${err.message}. Falling back to in-memory.`);
    return null;
  }
}

async function loadAllData() {
  const r = initRedis();
  if (!r) return;
  try {
    logger.info('[Redis] Preloading data from Upstash...');
    // Load Blacklist
    const bl = await r.get('blacklist');
    if (bl) {
      const { setBlacklistState } = require('./blacklist');
      setBlacklistState(bl);
    }

    // Scan for all guild:* keys
    let cursor = "0";
    let iterations = 0;
    const { setState } = require('./panelState');
    const { setGuildReactionRoles } = require('./reactionRoles');

    do {
      const result = await r.scan(cursor, { match: 'guild:*', count: 100 });
      cursor = String(result[0]);
      const keys = result[1];
      
      if (keys.length > 0) {
        const values = await r.mget(...keys);
        keys.forEach((key, i) => {
          const data = values[i];
          if (!data) return;
          const guildId = key.split(':')[1];
          
          if (data.panel) {
            // Decrypt API key
            if (data.panel.aiApiKey) {
              data.panel.aiApiKey = crypto.decrypt(data.panel.aiApiKey);
            }
            setState(guildId, data.panel);
          }
          if (data.reactionRoles) {
            const map = new Map();
            for (const [msgId, rrData] of Object.entries(data.reactionRoles)) {
              map.set(msgId, rrData);
            }
            setGuildReactionRoles(guildId, map);
          }
        });
      }
      if (++iterations > 50) { 
        logger.warn('[Redis] SCAN iteration guard hit, breaking loop'); 
        break; 
      }
    } while (cursor !== "0");

    logger.info('[Redis] Successfully preloaded all guild states.');
  } catch (err) {
    logger.error(`[Redis] Error during preload: ${err.message}`);
  }
}

async function saveGuildState(guildId) {
  const r = initRedis();
  if (!r) return;
  
  const { getState } = require('./panelState');
  const { getGuildReactionRoles } = require('./reactionRoles');
  
  try {
    const panel = { ...getState(guildId) };
    if (panel.aiApiKey) {
      panel.aiApiKey = crypto.encrypt(panel.aiApiKey);
    }

    const rrMap = getGuildReactionRoles(guildId);
    const reactionRoles = {};
    for (const [msgId, data] of rrMap.entries()) {
      reactionRoles[msgId] = data;
    }

    const payload = { panel, reactionRoles };
    await r.set(`guild:${guildId}`, payload);
  } catch (err) {
    logger.error(`[Redis] Failed to save guild state for ${guildId}: ${err.message}`);
  }
}

async function saveBlacklistData(list) {
  const r = initRedis();
  if (!r) return;
  try {
    await r.set('blacklist', list);
  } catch (err) {
    logger.error(`[Redis] Failed to save blacklist: ${err.message}`);
  }
}

module.exports = {
  loadAllData,
  saveGuildState,
  saveBlacklistData
};
