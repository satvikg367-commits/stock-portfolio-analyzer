const fs = require('fs');

let content = fs.readFileSync('src/App.css', 'utf-8');

// Replace the top layout definition
content = content.replace(
`.app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--app-bg);
    color: var(--ink);
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
}

.app-layout {
    display: flex;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    flex: 1 1 auto;
}`,
`.app {
    display: flex;
    min-height: 100vh;
    background: var(--app-bg);
    color: var(--ink);
}

.app-layout {
    display: flex;
    flex-direction: row;
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
}`
);

// Fix .sidebar at top
content = content.replace(
`.sidebar {
    flex: 0 0 288px;
    padding: 24px 16px;
    background: var(--nav);
    color: #ffffff;
    border-right: none;
    max-width: 100%;
    box-sizing: border-box;
}`,
`.sidebar {
    flex: 0 0 288px;
    width: 288px;
    min-width: 288px;
    height: 100vh;
    box-sizing: border-box;
    padding: 24px 16px;
    background: var(--nav);
    color: #ffffff;
    border-right: none;
}`
);

// Replace .main at top
content = content.replace(
`.main {
    flex: 1 1 auto;
    width: auto;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}`,
`.main {
    flex: 1 1 auto;
    min-width: 0;
    width: auto;
    max-width: 100%;
    box-sizing: border-box;
}`
);

// Remove the conflicting line 1161 .app-layout { display: block; }
content = content.replace(
`.app-layout {
    display: block;
}`,
``
);

fs.writeFileSync('src/App.css', content);
