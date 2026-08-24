const fs = require('fs');
let code = fs.readFileSync('src/App.css', 'utf-8');

code = code.replace(
`.donut-wrap {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(140px, 180px);
    align-items: center;
    gap: 8px;
    padding: 8px 16px 16px;
}`,
`.donut-wrap {
    display: grid;
    grid-template-columns: minmax(180px, 220px) minmax(0, 1fr);
    align-items: center;
    gap: 20px;
    width: 100%;
    min-width: 0;
    padding: 8px 16px 16px;
}`
);

fs.writeFileSync('src/App.css', code);
