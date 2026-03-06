const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src', 'pages');

// 1. HiringDashboard.jsx
let dashPath = path.join(srcDir, 'HiringDashboard.jsx');
let dashCode = fs.readFileSync(dashPath, 'utf8');

if (!dashCode.includes('framer-motion')) {
  dashCode = dashCode.replace(/import React(.*?);/, "import React$1;\nimport { motion } from 'framer-motion';\nimport { LineChart, Line, ResponsiveContainer } from 'recharts';");
}

dashCode = dashCode.replace(
  /if \(loading\) \{\s*return \([\s\S]*?Loading\.\.\.[\s\S]*?\);\s*\}/,
  `if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '20px', flexDirection: 'column', marginTop: 40 }}>
            <div style={{ height: 60, width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />
            <div style={{ height: 120, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }} />
            <div style={{ height: 200, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }} />
          </motion.div>
        </div>
      </div>
    );
  }`
);

dashCode = dashCode.replace(
  /<div style=\{styles\.emptyState\}>[\s\S]*?<\/div>/,
  `<motion.div style={styles.emptyState} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 48, marginBottom: 12 }}>🚀</motion.div>
            <h3 style={{ color: '#c4a052', fontSize: 20, marginBottom: 8 }}>Ready to Find Top Talent?</h3>
            <p style={{ color: '#86868b', fontSize: 14, marginBottom: 20, maxWidth: 400, margin: '0 auto 24px' }}>You haven't created any hiring sessions yet. Set up your first session now and let our AI handle the technical screening.</p>
            <button style={styles.primaryBtn} onClick={() => navigate('/hiring-ease/create-session')}>Start First Session</button>
          </motion.div>`
);

dashCode = dashCode.replace(
  /return \(\s*<div style=\{styles\.page\}>/,
  `return (\n    <motion.div style={styles.page} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>`
);
dashCode = dashCode.replace(
  /<\/div>\n\s*\);\n\}\n\nconst StatCard/,
  `</motion.div>\n  );\n}\n\nconst StatCard`
);

if(!dashCode.includes('chartData')) {
    const mockData = `const chartData = [{v: 2}, {v: 5}, {v: 3}, {v: 8}, {v: 6}, {v: 10}];`;
    dashCode = dashCode.replace(
    /\{stats && \(\s*<div style=\{styles\.statsGrid\}>/,
    mockData + '\n        {stats && (\n          <div style={styles.statsGrid}>'
    );
    dashCode = dashCode.replace(
    /<\/div>\n\s*\)\}/,
    `<div style={{ ...styles.statCard, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={styles.statLabel}>Recent Activity</p>
              <div style={{ height: 40, width: '100%', marginTop: 8 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line type="monotone" dataKey="v" stroke="#c4a052" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>\n          </div>\n        )}`
    );
}
fs.writeFileSync(dashPath, dashCode);
console.log("Updated HiringDashboard.");

// 2. CreateHiringSession.jsx
let createPath = path.join(srcDir, 'CreateHiringSession.jsx');
let createCode = fs.readFileSync(createPath, 'utf8');
if (!createCode.includes('framer-motion')) {
  createCode = createCode.replace(/import React(.*?);/, "import React$1;\nimport { motion } from 'framer-motion';");
  createCode = createCode.replace(
    /return \(\s*<div style=\{styles\.page\}>/,
    `return (\n    <motion.div style={styles.page} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>`
  );
  createCode = createCode.replace(
    /<\/div>\n\s*\);\n\}\n\nconst styles/,
    `</motion.div>\n  );\n}\n\nconst styles`
  );
  fs.writeFileSync(createPath, createCode);
  console.log("Updated CreateHiringSession.");
}

// 3. HiringBanks.jsx
let bankPath = path.join(srcDir, 'HiringBanks.jsx');
let bankCode = fs.readFileSync(bankPath, 'utf8');
if (!bankCode.includes('framer-motion')) {
  bankCode = bankCode.replace(/import React(.*?);/, "import React$1;\nimport { motion } from 'framer-motion';");
  
  bankCode = bankCode.replace(
    /if \(loading\) \{\s*return \([\s\S]*?Loading\.\.\.[\s\S]*?\);\s*\}/,
    `if (loading) {
      return (
        <div style={styles.page}>
          <div style={styles.container}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '20px', flexDirection: 'column', marginTop: 40 }}>
              <div style={{ height: 60, width: '30%', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />
              <div style={{ height: 100, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }} />
              <div style={{ height: 100, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }} />
            </motion.div>
          </div>
        </div>
      );
    }`
  );

  bankCode = bankCode.replace(
    /return \(\s*<div style=\{styles\.page\}>/,
    `return (\n    <motion.div style={styles.page} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>`
  );
  bankCode = bankCode.replace(
    /<\/div>\n\s*\);\n\}\n\nconst styles/,
    `</motion.div>\n  );\n}\n\nconst styles`
  );
  fs.writeFileSync(bankPath, bankCode);
  console.log("Updated HiringBanks.");
}

// 4. HiringSessionDetail.jsx
let detailPath = path.join(srcDir, 'HiringSessionDetail.jsx');
let detailCode = fs.readFileSync(detailPath, 'utf8');
if (!detailCode.includes('framer-motion')) {
  detailCode = detailCode.replace(/import React(.*?);/, "import React$1;\nimport { motion, AnimatePresence } from 'framer-motion';");
  
  detailCode = detailCode.replace(
    /if \(loading\) \{\s*return \([\s\S]*?Loading\.\.\.[\s\S]*?\);\s*\}/,
    `if (loading) {
      return (
        <div style={styles.page}>
          <div style={styles.container}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '20px', flexDirection: 'column', marginTop: 40 }}>
              <div style={{ height: 50, width: '20%', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />
              <div style={{ height: 180, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }} />
              <div style={{ height: 300, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }} />
            </motion.div>
          </div>
        </div>
      );
    }`
  );

  detailCode = detailCode.replace(
    /return \(\s*<div style=\{styles\.page\}>/,
    `return (\n    <motion.div style={styles.page} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>`
  );
  detailCode = detailCode.replace(
    /<\/div>\n\s*\);\n\}\n\nconst styles/,
    `</motion.div>\n  );\n}\n\nconst styles`
  );

  fs.writeFileSync(detailPath, detailCode);
  console.log("Updated HiringSessionDetail.");
}
