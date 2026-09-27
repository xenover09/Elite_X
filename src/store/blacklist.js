'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const DATA_DIR = path.join(__dirname, '../../data');
const BLACKLIST_FILE = path.join(DATA_DIR, 'blacklist.json');

// Memory store
let blacklist = {
  user: {},
  guild: {}
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadBlacklist() {
  ensureDataDir();
  if (fs.existsSync(BLACKLIST_FILE)) {
    try {
      const data = fs.readFileSync(BLACKLIST_FILE, 'utf8');
      blacklist = JSON.parse(data);
      // Ensure structure
      if (!blacklist.user) blacklist.user = {};
      if (!blacklist.guild) blacklist.guild = {};
      logger.info(`[Blacklist] Loaded ${Object.keys(blacklist.user).length} users and ${Object.keys(blacklist.guild).length} guilds.`);
    } catch (e) {
      logger.error(`[Blacklist] Failed to parse blacklist.json`, e);
    }
  }
}

function saveBlacklist() {
  ensureDataDir();
  try {
    fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(blacklist, null, 2), 'utf8');
  } catch (e) {
    logger.error(`[Blacklist] Failed to save blacklist.json`, e);
  }
  const { saveBlacklistData } = require('./persistentStore');
  saveBlacklistData(blacklist);
}

function isUserBlacklisted(id) {
  return !!blacklist.user[id];
}

function isGuildBlacklisted(id) {
  return !!blacklist.guild[id];
}

function addToBlacklist(type, id, reason) {
  if (type !== 'user' && type !== 'guild') return false;
  blacklist[type][id] = {
    reason: reason || 'No reason provided',
    date: new Date().toISOString()
  };
  saveBlacklist();
  logger.info(`[Blacklist] Added ${type} ${id}. Reason: ${reason}`);
  return true;
}

function removeFromBlacklist(type, id) {
  if (type !== 'user' && type !== 'guild') return false;
  if (blacklist[type][id]) {
    delete blacklist[type][id];
    saveBlacklist();
    logger.info(`[Blacklist] Removed ${type} ${id}.`);
    return true;
  }
  return false;
}

function getBlacklist() {
  return blacklist;
}

function setBlacklistState(data) {
  blacklist = data;
  if (!blacklist.user) blacklist.user = {};
  if (!blacklist.guild) blacklist.guild = {};
}

// Initial load
loadBlacklist();

module.exports = {
  isUserBlacklisted,
  isGuildBlacklisted,
  addToBlacklist,
  removeFromBlacklist,
  getBlacklist,
  setBlacklistState
};
