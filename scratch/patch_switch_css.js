const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/dashboard/public/style.css');
let css = fs.readFileSync(cssPath, 'utf-8');

if (!css.includes('.switch {')) {
  const switchCss = `
/* ═══════════════════════════════════════════════════════════
   TOGGLE SWITCH
   ═══════════════════════════════════════════════════════════ */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  transition: .3s;
  border-radius: 24px;
  border: 1px solid var(--border);
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text-muted);
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--accent);
  border-color: var(--accent);
}

input:checked + .slider:before {
  transform: translateX(20px);
  background-color: #fff;
}
`;
  fs.appendFileSync(cssPath, switchCss);
  console.log('Appended switch CSS');
} else {
  console.log('Switch CSS already exists');
}
