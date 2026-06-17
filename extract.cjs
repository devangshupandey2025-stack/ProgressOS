const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('<select id="goal-source"'));
const end = lines.findIndex((l, i) => i > start && l.includes('</select>'));
console.log(lines.slice(start - 2, end + 3).join('\n'));
