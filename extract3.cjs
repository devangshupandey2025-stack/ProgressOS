const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('function fetchGoals'));
if (start === -1) {
  const start2 = lines.findIndex(l => l.includes('async function loadGoals'));
  const end2 = lines.findIndex((l, i) => i > start2 && l.includes('}'));
  console.log(lines.slice(start2 - 2, end2 + 20).join('\n'));
} else {
  const end = lines.findIndex((l, i) => i > start && l.includes('function '));
  console.log(lines.slice(start - 2, end + 2).join('\n'));
}
