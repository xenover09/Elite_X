const fs = require('fs');
let c = fs.readFileSync('src/dashboard/public/style.css', 'utf8');

c = c.replace(/input\[type="text"\],\s*input\[type="url"\]/g, 'input[type="text"], input[type="password"], input[type="url"]');
c = c.replace(/input\[type="text"\]:focus,\s*input\[type="url"\]:focus/g, 'input[type="text"]:focus, input[type="password"]:focus, input[type="url"]:focus');

fs.writeFileSync('src/dashboard/public/style.css', c, 'utf8');
