'use strict';

const { PermissionsBitField } = require('discord.js');

/**
 * Runs a security audit on a guild.
 * @param {import('discord.js').Guild} guild 
 */
async function runSecurityAudit(guild) {
  let score = 100;
  const findings = [];
  const strengths = [];

  // 1. Server Settings
  if (guild.verificationLevel === 0 /* NONE */) {
    score -= 10;
    findings.push({ severity: 'High', category: 'Settings', title: 'Weak Verification Level', detail: 'Verification level is set to None. Anyone can join and immediately spam.', fix: 'Server Settings → Moderation → Set Verification Level to at least "Low".' });
  } else if (guild.verificationLevel === 1 /* LOW */) {
    score -= 5;
    findings.push({ severity: 'Medium', category: 'Settings', title: 'Low Verification Level', detail: 'Verification level is set to Low.', fix: 'Consider setting it to Medium or higher.' });
  } else {
    strengths.push('Verification level is adequately configured.');
  }

  if (guild.mfaLevel === 0 /* NONE */) {
    score -= 10;
    findings.push({ severity: 'High', category: 'Settings', title: 'No 2FA Requirement', detail: 'Moderators are not required to have 2FA enabled.', fix: 'Server Settings → Moderation → 2FA Requirement ON.' });
  } else {
    strengths.push('2FA Requirement for Moderation is ON.');
  }

  if (guild.explicitContentFilter === 0 /* DISABLED */) {
    score -= 5;
    findings.push({ severity: 'Medium', category: 'Settings', title: 'Explicit Content Filter Disabled', detail: 'Discord will not scan media content from members.', fix: 'Server Settings → Moderation → Explicit Media Content Filter ON.' });
  } else {
    strengths.push('Explicit Media Content Filter is enabled.');
  }

  // 2. @everyone audit
  const everyoneRole = guild.roles.everyone;
  const everyonePerms = everyoneRole.permissions;
  const dangerousEveryone = [];
  if (everyonePerms.has(PermissionsBitField.Flags.MentionEveryone)) dangerousEveryone.push('Mention Everyone');
  if (everyonePerms.has(PermissionsBitField.Flags.ManageMessages)) dangerousEveryone.push('Manage Messages');
  if (everyonePerms.has(PermissionsBitField.Flags.Administrator)) dangerousEveryone.push('Administrator');
  if (everyonePerms.has(PermissionsBitField.Flags.ManageGuild)) dangerousEveryone.push('Manage Server');

  if (dangerousEveryone.length > 0) {
    score -= 20;
    findings.push({ severity: 'Critical', category: 'Roles', title: '@everyone has dangerous permissions', detail: `@everyone role can: ${dangerousEveryone.join(', ')}`, fix: 'Server Settings → Roles → Default Permissions → Disable these permissions.' });
  } else {
    strengths.push('@everyone role has safe default permissions.');
  }

  // 3. Administrator audit
  // Fetch all roles with Administrator
  const adminRoles = guild.roles.cache.filter(r => r.permissions.has(PermissionsBitField.Flags.Administrator) && !r.managed && r.id !== guild.id);
  
  if (adminRoles.size > 3) {
    score -= 20;
    findings.push({ severity: 'High', category: 'Roles', title: 'Too many Admin roles', detail: `Found ${adminRoles.size} standard roles with Administrator permission.`, fix: 'Review roles and remove Administrator permission from non-essential roles. Use specific permissions instead.' });
  } else if (adminRoles.size > 0) {
    strengths.push('Number of Administrator roles is kept to a minimum.');
  }

  // 4. Bot audit
  const botMembers = guild.members.cache.filter(m => m.user.bot);
  const adminBots = botMembers.filter(m => m.permissions.has(PermissionsBitField.Flags.Administrator));
  if (adminBots.size > 5) {
    score -= 10;
    findings.push({ severity: 'Medium', category: 'Bots', title: 'High number of Admin bots', detail: `Found ${adminBots.size} bots with Administrator permission.`, fix: 'Remove Administrator from bots that do not strictly need it.' });
  }

  const { GatewayIntentBits } = require('discord.js');
  if (guild.members.cache.size < guild.memberCount && !guild.client.options.intents.has(GatewayIntentBits.GuildMembers)) {
    findings.push({ severity: 'Low', category: 'Information', title: 'Limited Member Scan', detail: 'The bot does not have the Server Members Intent enabled.', fix: 'Enable Server Members Intent in Discord Developer Portal for deeper member analysis.' });
  }

  // 6. Webhook count
  try {
    const webhooks = await guild.fetchWebhooks();
    if (webhooks.size >= 25) {
      score -= 10;
      findings.push({ severity: 'High', category: 'Webhooks', title: 'Excessive Webhooks', detail: `Found ${webhooks.size} webhooks. Attackers often use webhooks to spam channels during a nuke.`, fix: 'Server Settings → Integrations → Webhooks. Delete unnecessary webhooks.' });
    } else if (webhooks.size >= 10) {
      score -= 5;
      findings.push({ severity: 'Medium', category: 'Webhooks', title: 'Many Webhooks', detail: `Found ${webhooks.size} webhooks.`, fix: 'Review webhooks to ensure they are all needed.' });
    } else {
      strengths.push('Webhook count is within safe limits.');
    }
  } catch (err) {
    findings.push({ severity: 'Low', category: 'Information', title: 'Could not fetch webhooks', detail: 'Bot lacks Manage Webhooks permission to analyze webhook risk.', fix: 'Grant Manage Webhooks permission to the bot.' });
  }

  // Cap score
  if (score < 0) score = 0;

  // Determine levels
  let riskLevel = 'Strong';
  let nukeRisk = 'Low';
  if (score < 40) {
    riskLevel = 'Critical';
    nukeRisk = 'Severe';
  } else if (score < 60) {
    riskLevel = 'Weak';
    nukeRisk = 'High';
  } else if (score < 80) {
    riskLevel = 'Moderate';
    nukeRisk = 'Medium';
  }

  // Sort findings: Critical > High > Medium > Low
  const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    score,
    riskLevel,
    nukeRisk,
    findings,
    strengths,
    scannedAt: new Date().toISOString()
  };
}

module.exports = { runSecurityAudit };
