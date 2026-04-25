const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("'http://${window.location.hostname}:8000")) {
            lines[i] = lines[i].replace(/'http:\/\/\$\{window\.location\.hostname\}:8000([^']*)'/g, '`http://${window.location.hostname}:8000$1`');
            modified = true;
        }
    }
    if (modified) {
        fs.writeFileSync(file, lines.join('\n'));
        changed++;
    }
});

console.log('Fixed exactly ' + changed + ' files.');
