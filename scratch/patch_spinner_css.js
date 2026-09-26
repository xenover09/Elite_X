const fs = require('fs');
const path = require('path');
const cssPath = path.join(__dirname, '../src/dashboard/public/style.css');
let css = fs.readFileSync(cssPath, 'utf-8');

if (!css.includes('@keyframes spin')) {
  css += `
@keyframes spin {
  100% { transform: rotate(360deg); }
}
`;
  fs.writeFileSync(cssPath, css);
}
