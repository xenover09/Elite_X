import { describe, it, expect, vi } from 'vitest';
import { runSecurityAudit } from '../src/services/securityAudit.js';
import { PermissionsBitField } from 'discord.js';

function createMockGuild(options = {}) {
  const adminRoleIds = options.adminRoleIds || [];
  const everyonePerms = options.everyonePerms || [];

  return {
    verificationLevel: options.verificationLevel ?? 2, // MEDIUM
    mfaLevel: options.mfaLevel ?? 1, // ELEVATED
    explicitContentFilter: options.explicitContentFilter ?? 2, // ALL_MEMBERS
    id: 'guild-123',
    roles: {
      everyone: {
        permissions: {
          has: (perm) => everyonePerms.includes(perm)
        }
      },
      cache: {
        filter: (cb) => {
          // Mock roles with admin perms
          const roles = adminRoleIds.map(id => ({
            id,
            managed: false,
            permissions: {
              has: (perm) => perm === PermissionsBitField.Flags.Administrator
            }
          }));
          return { size: roles.filter(cb).length };
        }
      }
    },
    members: {
      cache: {
        size: 10,
        filter: (cb) => {
          return {
            filter: (cb2) => {
              // Mock admin bots
              return { size: options.adminBots || 0 };
            }
          };
        }
      }
    },
    memberCount: 10,
    client: {
      options: {
        intents: {
          has: () => true
        }
      }
    },
    fetchWebhooks: vi.fn().mockResolvedValue({ size: options.webhooks || 0 })
  };
}

describe('Security Audit Math & Logic', () => {
  it('should return a perfect score for a secure guild', async () => {
    const guild = createMockGuild();
    const result = await runSecurityAudit(guild);

    expect(result.score).toBe(100);
    expect(result.riskLevel).toBe('Strong');
    expect(result.nukeRisk).toBe('Low');
    expect(result.findings.length).toBe(0);
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('should penalize for verification level NONE (-10, High)', async () => {
    const guild = createMockGuild({ verificationLevel: 0 });
    const result = await runSecurityAudit(guild);

    expect(result.score).toBe(90);
    const finding = result.findings.find(f => f.title === 'Weak Verification Level');
    expect(finding).toBeDefined();
    expect(finding.severity).toBe('High');
  });

  it('should penalize for dangerous everyone permissions (-20, Critical)', async () => {
    const guild = createMockGuild({ everyonePerms: [PermissionsBitField.Flags.Administrator] });
    const result = await runSecurityAudit(guild);

    expect(result.score).toBe(80);
    const finding = result.findings.find(f => f.category === 'Roles' && f.severity === 'Critical');
    expect(finding).toBeDefined();
  });

  it('should correctly cap score at 0 and return Severe risk', async () => {
    const guild = createMockGuild({
      verificationLevel: 0, // -10
      mfaLevel: 0, // -10
      explicitContentFilter: 0, // -5
      everyonePerms: [PermissionsBitField.Flags.Administrator], // -20
      adminRoleIds: ['1', '2', '3', '4'], // -20
      adminBots: 6, // -10
      webhooks: 30 // -10
    }); // Total penalties: 85. Score: 15.

    const result = await runSecurityAudit(guild);
    expect(result.score).toBe(15);
    expect(result.riskLevel).toBe('Critical');
    expect(result.nukeRisk).toBe('Severe');
  });

  it('should determine Moderate risk level (60-79)', async () => {
    const guild = createMockGuild({
      everyonePerms: [PermissionsBitField.Flags.Administrator], // -20
      mfaLevel: 0, // -10
    }); // Score: 70

    const result = await runSecurityAudit(guild);
    expect(result.score).toBe(70);
    expect(result.riskLevel).toBe('Moderate');
    expect(result.nukeRisk).toBe('Medium');
  });
});
