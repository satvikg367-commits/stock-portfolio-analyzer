const fs = require('fs');

let content = fs.readFileSync('src/App.css', 'utf-8');

content = content.replace(
`.sidebar {
    position: sticky;
    top: 0;
    overflow-y: auto;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;`,
`.sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;`
);

fs.writeFileSync('src/App.css', content);
