import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock persistentStore so tests don't touch Redis
vi.mock('../src/store/persistentStore.js', () => ({
  saveGuildState: vi.fn(),
}));

import { 
  getState, 
  setState, 
  toggleFeature, 
  updateAISettings, 
  updateAutoModSettings, 
  updateModLogSettings 
} from '../src/store/panelState.js';

describe('Panel State Store', () => {
  const guildId = 'test-guild-123';

  beforeEach(() => {
    // Reset state to empty before each test by injecting default
    setState(guildId, {
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
  });

  it('should return default state if initialized or missing', () => {
    const state = getState('new-guild');
    expect(state.aiChat).toBe(false);
    expect(state.amSpam).toBe(false);
    expect(state.aiPersonality).toBe('default');
  });

  it('should toggle a boolean feature correctly', () => {
    let result = toggleFeature(guildId, 'aiChat');
    expect(result).toBe(true);
    expect(getState(guildId).aiChat).toBe(true);

    result = toggleFeature(guildId, 'aiChat');
    expect(result).toBe(false);
    expect(getState(guildId).aiChat).toBe(false);
  });

  it('should update AI settings', () => {
    updateAISettings(guildId, {
      aiChannel: '12345',
      aiApiKey: 'gsk_test',
      aiPersonality: 'friendly'
    });

    const state = getState(guildId);
    expect(state.aiChannel).toBe('12345');
    expect(state.aiApiKey).toBe('gsk_test');
    expect(state.aiPersonality).toBe('friendly');
  });

  it('should ignore placeholder API key', () => {
    updateAISettings(guildId, { aiApiKey: 'gsk_real' });
    updateAISettings(guildId, { aiApiKey: 'gsk_••••••••••••' }); // Placeholder from frontend

    const state = getState(guildId);
    expect(state.aiApiKey).toBe('gsk_real'); // Should remain unchanged
  });

  it('should correctly clear API key if empty string provided', () => {
    updateAISettings(guildId, { aiApiKey: 'gsk_real' });
    updateAISettings(guildId, { aiApiKey: '' });

    const state = getState(guildId);
    expect(state.aiApiKey).toBe('');
  });

  it('should update AutoMod settings', () => {
    updateAutoModSettings(guildId, { amSpam: true, amMentions: true });
    
    const state = getState(guildId);
    expect(state.amSpam).toBe(true);
    expect(state.amMentions).toBe(true);
    expect(state.amCaps).toBe(false); // Unchanged
  });

  it('should update ModLog settings', () => {
    updateModLogSettings(guildId, { modLogEnabled: true, modLogChannelId: '999' });

    const state = getState(guildId);
    expect(state.modLogEnabled).toBe(true);
    expect(state.modLogChannelId).toBe('999');
  });
});
