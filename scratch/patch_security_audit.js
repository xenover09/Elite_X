const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../src/dashboard/public/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf-8');

const appPath = path.join(__dirname, '../src/dashboard/public/app.js');
let appJs = fs.readFileSync(appPath, 'utf-8');

// 1. Add Sidebar item for Security Audit (after AI Settings)
if (!indexHtml.includes('card-security')) {
  const sidebarHtml = `
          <button class="nav-item" data-tab="card-ai">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 014 4v1a4 4 0 01-8 0V6a4 4 0 014-4z"/><path d="M16 11a4 4 0 01-8 0"/><line x1="12" y1="15" x2="12" y2="19"/><path d="M8 19h8"/></svg>
            <span>AI Settings</span>
          </button>
          
          <div class="nav-divider"></div>
          
          <button class="nav-item" data-tab="card-security">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Security Audit</span>
          </button>
`;
  indexHtml = indexHtml.replace(/<button class="nav-item" data-tab="card-ai">[\s\S]*?<\/button>/, sidebarHtml);

  // 2. Add the section below card-ai
  const securitySectionHtml = `
          <!-- Card: Security Audit -->
          <section class="card tab-content" id="card-security">
            <div class="card-header">
              <div class="card-icon" style="background: rgba(34, 197, 94, 0.1); color: #22c55e;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h2 class="card-title">Server Security Audit</h2>
            </div>
            
            <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 30px; background: var(--bg-body); padding: 20px; border-radius: 8px; border: 1px solid var(--border);">
              <div style="position: relative; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; color: #fff;" id="audit-score-circle">
                <div style="position: absolute; width: 80px; height: 80px; background: var(--bg-body); border-radius: 50%;"></div>
                <span style="position: relative; z-index: 1;" id="audit-score">--</span>
              </div>
              <div style="flex: 1;">
                <h3 style="font-size: 1.5rem; margin-bottom: 5px; color: var(--text-primary);" id="audit-risk">Run Audit</h3>
                <p style="color: var(--text-muted); margin-bottom: 10px;">Nuke Risk: <strong id="audit-nuke">--</strong></p>
                <button class="btn btn-outline" id="run-audit-btn" style="font-weight: 600;">Re-scan Server</button>
              </div>
            </div>

            <h3 style="margin-bottom: 15px; font-size: 1.1rem; color: var(--text-primary);">Security Findings</h3>
            <div id="audit-findings" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px;">
              <div style="padding: 20px; text-align: center; color: var(--text-muted); background: var(--bg-body); border-radius: 8px; border: 1px solid var(--border);">Run a scan to see findings.</div>
            </div>

            <h3 style="margin-bottom: 15px; font-size: 1.1rem; color: var(--text-primary);">Strong Points</h3>
            <ul id="audit-strengths" style="padding-left: 20px; color: var(--text-muted); display: flex; flex-direction: column; gap: 8px;">
              <li>Run a scan to see strong points.</li>
            </ul>
          </section>
`;
  indexHtml = indexHtml.replace('</main>', securitySectionHtml + '\n        </main>');
  fs.writeFileSync(indexPath, indexHtml);
}

if (!appJs.includes('run-audit-btn')) {
  const auditJs = `
  // --- Security Audit Logic ---
  const runAuditBtn = $('#run-audit-btn');
  const auditScore = $('#audit-score');
  const auditScoreCircle = $('#audit-score-circle');
  const auditRisk = $('#audit-risk');
  const auditNuke = $('#audit-nuke');
  const auditFindings = $('#audit-findings');
  const auditStrengths = $('#audit-strengths');

  function renderAudit(data) {
    auditScore.textContent = data.score;
    
    // Colors based on risk
    let color = '#22c55e'; // Strong
    if (data.score < 40) color = '#ef4444'; // Critical
    else if (data.score < 60) color = '#f97316'; // Weak
    else if (data.score < 80) color = '#eab308'; // Moderate
    
    auditScoreCircle.style.background = \`conic-gradient(\${color} \${data.score}%, #333 0)\`;
    auditScore.style.color = color;
    
    auditRisk.textContent = \`\${data.riskLevel} Security\`;
    auditNuke.textContent = data.nukeRisk;
    auditNuke.style.color = color;

    // Findings
    auditFindings.innerHTML = '';
    if (data.findings.length === 0) {
      auditFindings.innerHTML = '<div style="padding: 20px; text-align: center; color: #22c55e; background: rgba(34, 197, 94, 0.1); border-radius: 8px; border: 1px solid rgba(34,197,94,0.3);">No security risks found! Excellent job.</div>';
    } else {
      data.findings.forEach(f => {
        let fColor = '#3b82f6';
        let bg = 'rgba(59, 130, 246, 0.1)';
        if (f.severity === 'Critical') { fColor = '#ef4444'; bg = 'rgba(239, 68, 68, 0.1)'; }
        else if (f.severity === 'High') { fColor = '#f97316'; bg = 'rgba(249, 115, 22, 0.1)'; }
        else if (f.severity === 'Medium') { fColor = '#eab308'; bg = 'rgba(234, 179, 8, 0.1)'; }
        
        const card = document.createElement('div');
        card.style.cssText = \`background: var(--bg-body); border-left: 4px solid \${fColor}; border-radius: 4px; padding: 15px; border-top: 1px solid var(--border); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);\`;
        card.innerHTML = \`
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
            <span style="background: \${bg}; color: \${fColor}; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">\${f.severity}</span>
            <strong style="color: var(--text-primary); font-size: 1rem;">\${f.title}</strong>
          </div>
          <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 8px;">\${f.detail}</div>
          <div style="font-size: 0.85rem; color: var(--accent); font-weight: 600;">Fix: \${f.fix}</div>
        \`;
        auditFindings.appendChild(card);
      });
    }

    // Strengths
    auditStrengths.innerHTML = '';
    data.strengths.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      auditStrengths.appendChild(li);
    });
  }

  async function loadSecurityAudit() {
    if (!currentGuildId) return;
    try {
      runAuditBtn.textContent = 'Scanning...';
      const data = await api(\`/api/panel/security-audit\`);
      renderAudit(data);
    } catch(err) {
      toast('Failed to run security audit', 'error');
    } finally {
      runAuditBtn.textContent = 'Re-scan Server';
    }
  }

  if (runAuditBtn) {
    runAuditBtn.addEventListener('click', loadSecurityAudit);
  }
`;
  appJs = appJs.replace('// ─── Panel Actions ───────────────────────────────────', auditJs + '\n  // ─── Panel Actions ───────────────────────────────────');
  fs.writeFileSync(appPath, appJs);
}

console.log('Security Audit UI patch applied.');
