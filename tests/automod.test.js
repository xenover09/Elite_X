import { describe, it, expect } from 'vitest';

import { 
  hasInvites, 
  hasBadWords, 
  hasExcessiveCaps, 
  hasExcessiveMentions 
} from '../src/automod/automod.js';

describe('AutoMod Pure Detection Functions', () => {
  
  describe('hasInvites', () => {
    it('should detect discord.gg links', () => {
      expect(hasInvites('Join my server! https://discord.gg/xyz123')).toBe(true);
      expect(hasInvites('discord.gg/xyz123')).toBe(true);
    });

    it('should detect discord.com/invite links', () => {
      expect(hasInvites('https://discord.com/invite/xyz123')).toBe(true);
    });

    it('should ignore non-invite links', () => {
      expect(hasInvites('Check out this cool site: https://google.com')).toBe(false);
      expect(hasInvites('discord.com/app')).toBe(false); // Valid discord URL but not invite
    });
  });

  describe('hasBadWords', () => {
    it('should detect exact bad words', () => {
      expect(hasBadWords('You are a bitch!')).toBe(true);
    });

    it('should detect bad words case-insensitively', () => {
      expect(hasBadWords('FUCK is here')).toBe(true);
    });

    it('should not detect bad words as part of larger words (boundary check)', () => {
      expect(hasBadWords('scunt')).toBe(false); // "cunt" is inside it, but shouldn't trigger boundary
    });
  });

  describe('hasExcessiveCaps', () => {
    it('should trigger if more than 70% of letters are caps (and length > 10)', () => {
      expect(hasExcessiveCaps('THIS IS SHOUTING')).toBe(true);
      expect(hasExcessiveCaps('HELLO EVERYONE!')).toBe(true);
    });

    it('should ignore short messages', () => {
      expect(hasExcessiveCaps('HI THERE')).toBe(false); // only 7 letters
    });

    it('should ignore messages with mostly lowercase letters', () => {
      expect(hasExcessiveCaps('This is a normal message')).toBe(false);
      expect(hasExcessiveCaps('WOW that is crazy man')).toBe(false); // 3 caps out of 18 letters = < 70%
    });
  });

  describe('hasExcessiveMentions', () => {
    it('should trigger on 5 or more mentions', () => {
      expect(hasExcessiveMentions('<@123> <@456> <@789> <@111> <@222> STOP')).toBe(true);
      expect(hasExcessiveMentions('<@!1> <@!2> <@!3> <@!4> <@!5>')).toBe(true);
    });

    it('should not trigger on fewer than 5 mentions', () => {
      expect(hasExcessiveMentions('<@123> <@456> Hello!')).toBe(false);
      expect(hasExcessiveMentions('No mentions here')).toBe(false);
    });
  });

});
