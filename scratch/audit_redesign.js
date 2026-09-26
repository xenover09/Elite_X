const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../src/dashboard/public/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf-8');

const appPath = path.join(__dirname, '../src/dashboard/public/app.js');
let appJs = fs.readFileSync(appPath, 'utf-8');

// 1. Update index.html
const startTag = '<!-- Card: Security Audit -->';
const endTag = '</section>';
const startIndex = indexHtml.indexOf(startTag);

if (startIndex !== -1) {
  let endIndex = indexHtml.indexOf(endTag, startIndex);
  if (endIndex !== -1) {
    endIndex += endTag.length;
    
    const newHtml = `<!-- Card: Security Audit -->
          <section class="card tab-content" id="card-security">
            <div class="card-header">
              <div class="card-icon" style="background: rgba(34, 197, 94, 0.1); color: #22c55e;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h2 class="card-title">Server Security Audit</h2>
            </div>
            
            <div class="audit-top-section" style="display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; padding-top: 20px;">
              <div class="audit-wheel-container" style="position: relative; width: 220px; height: 220px; margin-bottom: 25px;">
                <svg viewBox="0 0 36 36" class="circular-chart" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                  <!-- Background ring -->
                  <path class="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2.5" />
                  <!-- Progress ring -->
                  <path class="circle" id="audit-main-circle"
                    stroke-dasharray="0, 100"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" style="transition: stroke-dasharray 1.2s cubic-bezier(0.2, 0.8, 0.2, 1), stroke 0.5s;" />
                </svg>
                <div class="audit-score-text" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; width: 100%;">
                  <div id="audit-score-number" style="font-size: 3.5rem; font-weight: 800; line-height: 1; color: var(--text-primary); transition: color 0.5s;">--</div>
                  <div id="audit-score-risk" style="font-size: 1.1rem; color: var(--text-muted); font-weight: 600; margin-top: 8px;">Not Scanned</div>
                  <div id="audit-score-nuke" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; opacity: 0.8;">Nuke Risk: --</div>
                </div>
              </div>
              <button class="btn btn-primary" id="run-audit-btn" style="padding: 12px 40px; font-weight: 600; font-size: 1.1rem; border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.2s;">Run Security Scan</button>
            </div>

            <h3 style="margin-bottom: 20px; font-size: 1.2rem; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px;">Security Categories</h3>
            <div id="audit-categories-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px;">
              <div style="padding: 40px 20px; text-align: center; color: var(--text-muted); background: var(--bg-body); border-radius: 12px; border: 1px dashed var(--border); grid-column: 1 / -1;">
                Run a scan to analyze categories.
              </div>
            </div>

            <h3 style="margin-bottom: 20px; font-size: 1.2rem; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px;">Strong Points</h3>
            <div id="audit-strengths" style="display: flex; flex-direction: column; gap: 12px; color: var(--text-muted);">
              <div style="padding: 20px; text-align: center; color: var(--text-muted); background: var(--bg-body); border-radius: 12px; border: 1px dashed var(--border);">Run a scan to see strong points.</div>
            </div>
          </section>`;
          
    indexHtml = indexHtml.substring(0, startIndex) + newHtml + indexHtml.substring(endIndex);
    fs.writeFileSync(indexPath, indexHtml);
    console.log('index.html updated for audit UI redesign.');
  }
}

// 2. Update app.js
const appStartIndex = appJs.indexOf('// --- Security Audit Logic ---');
const appEndIndex = appJs.indexOf('// ─── Panel Actions ───────────────────────────────────');

if (appStartIndex !== -1 && appEndIndex !== -1) {
  const newAppJs = `// --- Security Audit Logic ---
  const runAuditBtn = $('#run-audit-btn');
  const auditScoreNum = $('#audit-score-number');
  const auditMainCircle = $('#audit-main-circle');
  const auditRisk = $('#audit-score-risk');
  const auditNuke = $('#audit-score-nuke');
  const auditCategoriesGrid = $('#audit-categories-grid');
  const auditStrengths = $('#audit-strengths');

  function getSeverityColor(severity) {
    if (severity === 'Critical') return '#ef4444';
    if (severity === 'High') return '#f97316';
    if (severity === 'Medium') return '#eab308';
    if (severity === 'Low') return '#3b82f6';
    return '#22c55e';
  }

  function getScoreColor(score) {
    if (score < 40) return '#ef4444';
    if (score < 60) return '#f97316';
    if (score < 80) return '#eab308';
    return '#22c55e';
  }

  function renderAudit(data) {
    const mainColor = getScoreColor(data.score);
    
    // Animate wheel
    auditScoreNum.textContent = data.score;
    auditScoreNum.style.color = mainColor;
    auditMainCircle.style.stroke = mainColor;
    // Stroke dasharray represents percentage (0 to 100)
    auditMainCircle.style.strokeDasharray = \`\${data.score}, 100\`;
    
    auditRisk.textContent = \`\${data.riskLevel} Security\`;
    auditNuke.textContent = \`Nuke Risk: \${data.nukeRisk}\`;
    auditNuke.style.color = mainColor;

    // Process categories
    const allCategories = ['Settings', 'Roles', 'Bots', 'Webhooks', 'Information'];
    const catData = {};
    
    allCategories.forEach(c => catData[c] = { score: 100, findings: [], worstLevel: 4 }); // 0=Critical, 4=Secure
    
    data.findings.forEach(f => {
      if (!catData[f.category]) catData[f.category] = { score: 100, findings: [], worstLevel: 4 };
      catData[f.category].findings.push(f);
      
      let level = 3;
      let deduction = 2;
      if (f.severity === 'Critical') { deduction = 20; level = 0; }
      else if (f.severity === 'High') { deduction = 10; level = 1; }
      else if (f.severity === 'Medium') { deduction = 5; level = 2; }
      
      if (level < catData[f.category].worstLevel) catData[f.category].worstLevel = level;
      catData[f.category].score = Math.max(0, catData[f.category].score - deduction);
    });

    auditCategoriesGrid.innerHTML = '';
    
    // Render Category Cards
    Object.keys(catData).forEach(catName => {
      const cat = catData[catName];
      const hasIssues = cat.findings.length > 0;
      const catColor = hasIssues ? getScoreColor(cat.score) : '#22c55e';
      
      const card = document.createElement('div');
      card.className = 'audit-cat-card';
      card.style.cssText = \`
        background: var(--bg-body); 
        border-radius: 12px; 
        border: 1px solid var(--border);
        overflow: hidden;
        transition: all 0.3s;
      \`;

      // Card Header
      const header = document.createElement('div');
      header.style.cssText = \`
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        cursor: pointer;
        position: relative;
      \`;
      
      // Mini Ring
      const ringHtml = \`
        <div style="width: 48px; height: 48px; position: relative;">
          <svg viewBox="0 0 36 36" style="width:100%; height:100%; transform: rotate(-90deg);">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="3" />
            <path stroke-dasharray="\${cat.score}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="\${catColor}" stroke-width="3" stroke-linecap="round" />
          </svg>
          <div style="position: absolute; top:50%; left:50%; transform: translate(-50%, -50%); font-size: 0.75rem; font-weight: 700; color: \${catColor};">\${cat.score}</div>
        </div>
      \`;

      const badgeHtml = hasIssues 
        ? \`<span style="background: \${catColor}22; color: \${catColor}; padding: 3px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">\${cat.findings.length} issues</span>\`
        : \`<span style="background: rgba(34,197,94,0.1); color: #22c55e; padding: 3px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Secure</span>\`;

      header.innerHTML = \`
        \${ringHtml}
        <div style="flex: 1;">
          <h4 style="margin:0; font-size: 1.1rem; color: var(--text-primary);">\${catName}</h4>
          <div style="margin-top: 4px;">\${badgeHtml}</div>
        </div>
        <div style="color: var(--text-muted); transition: transform 0.3s;" class="chevron">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      \`;
      
      card.appendChild(header);

      // Findings Container (Expandable)
      const findingsContainer = document.createElement('div');
      findingsContainer.style.cssText = \`
        display: none;
        padding: 0 20px 20px 20px;
        border-top: 1px solid var(--border);
        background: rgba(0,0,0,0.1);
      \`;
      
      if (hasIssues) {
        cat.findings.forEach(f => {
          const fColor = getSeverityColor(f.severity);
          const fItem = document.createElement('div');
          fItem.style.cssText = \`margin-top: 15px; padding-left: 12px; border-left: 3px solid \${fColor};\`;
          fItem.innerHTML = \`
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: \${fColor};">\${f.severity}</span>
              <strong style="color: var(--text-primary); font-size: 0.95rem;">\${f.title}</strong>
            </div>
            <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 6px; line-height: 1.4;">\${f.detail}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);"><strong style="color:var(--text-primary);">Fix:</strong> \${f.fix}</div>
          \`;
          findingsContainer.appendChild(fItem);
        });
      } else {
        findingsContainer.innerHTML = \`<div style="padding-top:15px; color: #22c55e; font-size: 0.9rem;">No issues found in \${catName}.</div>\`;
      }
      card.appendChild(findingsContainer);

      // Expand toggle
      header.addEventListener('click', () => {
        const isExpanded = findingsContainer.style.display === 'block';
        findingsContainer.style.display = isExpanded ? 'none' : 'block';
        header.querySelector('.chevron').style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        card.style.borderColor = isExpanded ? 'var(--border)' : catColor;
      });

      auditCategoriesGrid.appendChild(card);
    });

    // Strengths
    auditStrengths.innerHTML = '';
    if (data.strengths.length === 0) {
      auditStrengths.innerHTML = '<div style="color: var(--text-muted); font-size: 0.95rem; font-style: italic;">No strong points identified.</div>';
    } else {
      data.strengths.forEach(s => {
        const row = document.createElement('div');
        row.style.cssText = \`display: flex; align-items: flex-start; gap: 10px; background: var(--bg-body); padding: 12px 15px; border-radius: 8px; border: 1px solid var(--border);\`;
        row.innerHTML = \`
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;"><path d="M20 6L9 17l-5-5"/></svg>
          <span style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.4;">\${s}</span>
        \`;
        auditStrengths.appendChild(row);
      });
    }
  }

  async function loadSecurityAudit() {
    if (!currentGuildId) return toast('Select a server first', 'error');
    try {
      const origText = runAuditBtn.textContent;
      runAuditBtn.innerHTML = '<svg class="spinner" viewBox="0 0 50 50" style="width:20px;height:20px;animation:spin 1s linear infinite;"><circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="80" stroke-linecap="round"></circle></svg> Scanning...';
      runAuditBtn.disabled = true;
      runAuditBtn.style.opacity = '0.7';
      
      // Reset wheel
      auditMainCircle.style.strokeDasharray = '0, 100';
      auditScoreNum.textContent = '--';
      auditScoreNum.style.color = 'var(--text-primary)';
      auditRisk.textContent = 'Scanning...';
      auditNuke.textContent = 'Nuke Risk: --';
      auditNuke.style.color = 'var(--text-muted)';
      
      const data = await api(\`/api/panel/security-audit\`);
      
      // small delay for animation effect
      setTimeout(() => {
        renderAudit(data);
        runAuditBtn.textContent = 'Re-scan Server';
        runAuditBtn.disabled = false;
        runAuditBtn.style.opacity = '1';
      }, 500);
      
    } catch(err) {
      toast('Failed to run security audit', 'error');
      runAuditBtn.textContent = 'Re-scan Server';
      runAuditBtn.disabled = false;
      runAuditBtn.style.opacity = '1';
    }
  }

  if (runAuditBtn) {
    runAuditBtn.addEventListener('click', loadSecurityAudit);
  }
  
  `;
  appJs = appJs.substring(0, appStartIndex) + newAppJs + appJs.substring(appEndIndex);
  fs.writeFileSync(appPath, appJs);
  console.log('app.js updated for audit UI redesign.');
}
