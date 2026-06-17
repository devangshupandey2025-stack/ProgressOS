const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('async function loadGoals'));
const end = lines.findIndex((l, i) => i > start && l.includes('async function loadActivities'));
console.log(lines.slice(start - 2, end).join('\n'));
