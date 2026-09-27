const crypto = require('crypto');
const logger = require('./logger');

const ALGORITHM = 'aes-256-gcm';
let key = null;

function getKey() {
  if (key) return key;
  const rawKey = process.env.SETTINGS_ENCRYPT_KEY || process.env.ADMIN_KEY || 'fallback_elite_key_32_bytes_len!';
  // Hash to exactly 32 bytes
  key = crypto.scryptSync(rawKey, 'elite_salt', 32);
  return key;
}

function encrypt(text) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag().toString('base64');
    return `${iv.toString('base64')}:${encrypted}:${authTag}`;
  } catch (err) {
    logger.error(`Encryption failed: ${err.message}`);
    return text;
  }
}

function decrypt(text) {
  if (!text || typeof text !== 'string' || !text.includes(':')) return text;
  try {
    const parts = text.split(':');
    if (parts.length !== 3) return text;
    
    const [ivStr, encryptedStr, authTagStr] = parts;
    const iv = Buffer.from(ivStr, 'base64');
    const authTag = Buffer.from(authTagStr, 'base64');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedStr, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    logger.error(`Decryption failed: ${err.message}`);
    return text; // Return encrypted or null? Returning original string on failure.
  }
}

module.exports = {
  encrypt,
  decrypt
};
