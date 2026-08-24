const fs = require('fs');
let code = fs.readFileSync('src/App.css', 'utf-8');

code = code.replace(
`.ticker-tape {
    display: flex;
    gap: 28px;
    overflow-x: auto;
    padding: 8px 24px;
    background: var(--surface);`,
`.ticker-tape {
    display: flex;
    gap: 28px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 8px 24px;
    background: var(--surface);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;`
);

fs.writeFileSync('src/App.css', code);
