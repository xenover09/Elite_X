const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/dashboard/public/app.js');
let appJs = fs.readFileSync(appPath, 'utf-8');

appJs = appJs.replace(
  /const payload = {\s*amSpam: \$\('#am-spam'\)\.checked,/g,
  "const payload = {\n        guildId: currentGuildId,\n        amSpam: $('#am-spam').checked,"
);

appJs = appJs.replace(
  /body: { channelId, content, pairs }/g,
  "body: { guildId: currentGuildId, channelId, content, pairs }"
);

appJs = appJs.replace(
  /const payload = {\s*modLogEnabled: \$\('#modlog-enabled'\)\.checked,/g,
  "const payload = {\n        guildId: currentGuildId,\n        modLogEnabled: $('#modlog-enabled').checked,"
);

fs.writeFileSync(appPath, appJs);
console.log('Patched forms in app.js to include guildId');
