const fs = require('fs');

let content = fs.readFileSync('src/App.css', 'utf-8');

// The replacement was:
// .sidebar {
//     position: sticky;
//     top: 0;
//     height: 100vh;
//     overflow-y: auto;
//         position: sticky;
//         top: 0;
//         width: 100%;
//         height: auto;
//         min-height: 0;

content = content.replace(
`    .sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
        position: sticky;
        top: 0;
        width: 100%;
        height: auto;`,
`    .sidebar {
        position: sticky;
        top: 0;
        width: 100%;
        height: auto;`
);

fs.writeFileSync('src/App.css', content);
