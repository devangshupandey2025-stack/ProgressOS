import fs from 'fs';
import path from 'path';

const trackersDir = path.join(process.cwd(), 'trackers');
const files = fs.readdirSync(trackersDir).filter(f => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(trackersDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Add script if not there
  if (!content.includes('auth.js')) {
    content = content.replace('</head>', '  <script src="../js/auth.js"></script>\n</head>');
  }

  // Add auth container to navbar
  if (!content.includes('id="auth-container"')) {
    content = content.replace(
      '<div class="flex items-center gap-8">',
      `<div class="flex justify-between w-full"><div class="flex items-center gap-8">`
    );
    // find the end of the flex container for nav and insert auth-container
    // We can just append it before </header> inside the inner flex? 
    // Actually the easiest is to inject it near the end of the topnav div
    content = content.replace(
      '</div>\n  </div>\n</header>',
      '  <div id="auth-container"></div>\n    </div>\n  </div>\n</header>'
    );
  }

  // Replace fetch calls
  content = content.replace(/await fetch\(/g, 'await window.apiFetch(');

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
