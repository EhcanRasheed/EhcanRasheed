const fs = require('fs');

const files = [
  'src/pages/HiringDashboard.jsx',
  'src/pages/HiringBanks.jsx',
  'src/pages/CreateHiringSession.jsx',
  'src/pages/HiringSessionDetail.jsx'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');

  // Fix loader
  c = c.replace(/<\/div>\n          <\/div>\n        <\/div>\n      \);\n    \}/g, '</motion.div>\n          </div>\n        </div>\n      );\n    }');
  c = c.replace(/<\/div>\n          \) : \(/, '</motion.div>\n          ) : (');

  // End component main closure
  c = c.replace(/    <\/div>\n  \);\n\}\n\nconst /g, '    </motion.div>\n  );\n}\n\nconst ');
  c = c.replace(/    <\/div>\n  \);\n\}\n\nfunction StatCard/g, '    </motion.div>\n  );\n}\n\nfunction StatCard');

  fs.writeFileSync(f, c);
});
console.log('Fixed tags!');