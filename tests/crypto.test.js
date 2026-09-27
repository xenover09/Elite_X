import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { encrypt, decrypt } from '../src/utils/crypto.js';

describe('Crypto Utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.SETTINGS_ENCRYPT_KEY = 'test_secret_key_123';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should encrypt and decrypt a string back to its original value', () => {
    const originalText = 'my-secret-api-key';
    const encrypted = encrypt(originalText);
    
    expect(encrypted).not.toBe(originalText);
    expect(encrypted.split(':').length).toBe(3); // iv:encrypted:authTag

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(originalText);
  });

  it('should handle empty or null input', () => {
    expect(encrypt('')).toBe('');
    expect(encrypt(null)).toBe(null);
    expect(decrypt('')).toBe('');
    expect(decrypt(null)).toBe(null);
  });

  it('should return original text on decryption failure (invalid format)', () => {
    const invalidText = 'not-valid-encrypted-string';
    expect(decrypt(invalidText)).toBe(invalidText);
  });

  it('should return original text on decryption failure (wrong key/tampered data)', () => {
    const originalText = 'secret-data';
    const encrypted = encrypt(originalText);
    
    // Change the environment key to simulate decryption with wrong key
    process.env.SETTINGS_ENCRYPT_KEY = 'wrong_key_456';
    
    // In our implementation, since the key is cached in module scope (let key = null),
    // changing process.env won't change the key in the loaded module.
    // However, we can tamper with the encrypted string to force a failure.
    const parts = encrypted.split(':');
    // base64 strings contain alphanumeric characters, changing the first char safely tampers it.
    parts[1] = (parts[1][0] === 'A' ? 'B' : 'A') + parts[1].substring(1);
    const tampered = parts.join(':');

    expect(decrypt(tampered)).toBe(tampered);
  });
});
