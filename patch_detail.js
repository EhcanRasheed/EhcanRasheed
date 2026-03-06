const fs = require('fs');
const target = 'C:/Users/Ehsan/Desktop/FYP/Ehsan/ehsan_interview/frontend/src/pages/HiringSessionDetail.jsx';
let code = fs.readFileSync(target, 'utf8');

const newStyles = `const styles = {
  page: { 
    minHeight: '100vh', 
    background: '#0a0a0b', 
    color: '#e8e8eb', 
    fontFamily: "'Inter', sans-serif", 
    padding: '40px 24px',
    backgroundImage: 'radial-gradient(ellipse at top, rgba(196,160,82,0.04) 0%, transparent 70%)'
  },
  container: { 
    maxWidth: 1100, 
    margin: '0 auto', 
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  backBtn: { 
    background: 'transparent', 
    border: '1px solid rgba(255,255,255,0.1)', 
    color: '#e8e8eb', 
    cursor: 'pointer', 
    fontSize: 13, 
    padding: '8px 16px', 
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 0
  },

  headerCard: { 
    background: 'rgba(22, 22, 24, 0.7)', 
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(196,160,82,0.15)', 
    borderRadius: 16, 
    padding: '30px 36px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 16,
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
  },
  headerTop: { 
    display: 'flex', 
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16
  },
  title: { 
    fontSize: 28, 
    fontWeight: 800, 
    margin: '0 0 6px', 
    letterSpacing: '-0.5px' 
  },
  statusBadge: { 
    fontSize: 11, 
    fontWeight: 800, 
    padding: '6px 12px', 
    borderRadius: 8, 
    textTransform: 'uppercase', 
    letterSpacing: 0.8 
  },
  infoText: { 
    color: '#86868b', 
    fontSize: 13, 
    margin: 0,
    lineHeight: 1.5 
  },

  actionBtnGroup: { 
    display: 'flex', 
    gap: 12, 
    flexWrap: 'wrap' 
  },
  primaryBtn: { 
    background: 'linear-gradient(135deg, #d4b062 0%, #c4a052 100%)', 
    color: '#0a0a0b', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: 10, 
    fontWeight: 700, 
    fontSize: 14, 
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(196,160,82,0.2)',
  },
  dangerBtn: { 
    background: 'rgba(220,74,74,0.1)', 
    color: '#dc4a4a', 
    border: '1px solid rgba(220,74,74,0.2)', 
    padding: '10px 20px', 
    borderRadius: 10, 
    fontWeight: 700, 
    fontSize: 14, 
    cursor: 'pointer' 
  },

  progressWrap: { 
    marginTop: 8 
  },
  progressLabels: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: 6, 
    fontSize: 12, 
    color: '#a0a0a5', 
    fontWeight: 600 
  },
  progressBar: { 
    height: 8, 
    background: 'rgba(255,255,255,0.05)', 
    borderRadius: 6, 
    overflow: 'hidden' 
  },
  progressFill: { 
    height: '100%', 
    background: 'linear-gradient(90deg, #c4a052 0%, #e2c57a 100%)', 
    borderRadius: 6, 
    transition: 'width 0.5s ease' 
  },

  controlsRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    gap: 16,
    background: 'rgba(22, 22, 24, 0.4)',
    padding: '16px 24px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.05)'
  },
  searchBar: { 
    display: 'flex', 
    alignItems: 'center', 
    background: 'rgba(0,0,0,0.3)', 
    border: '1px solid rgba(255,255,255,0.1)', 
    borderRadius: 10, 
    padding: '8px 14px', 
    width: 260 
  },
  searchInput: { 
    background: 'transparent', 
    border: 'none', 
    color: '#e8e8eb', 
    fontSize: 13, 
    outline: 'none', 
    width: '100%', 
    marginLeft: 8 
  },
  filterGroup: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 12, 
    flexWrap: 'wrap' 
  },
  select: { 
    background: 'rgba(0,0,0,0.3)', 
    color: '#e8e8eb', 
    border: '1px solid rgba(255,255,255,0.1)', 
    padding: '8px 12px', 
    borderRadius: 8, 
    fontSize: 13, 
    outline: 'none' 
  },

  tableWrap: { 
    background: 'rgba(22, 22, 24, 0.7)', 
    backdropFilter: 'blur(10px)',
    borderRadius: 16, 
    border: '1px solid rgba(255,255,255,0.06)', 
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse', 
    textAlign: 'left' 
  },
  th: { 
    padding: '16px 20px', 
    fontSize: 11, 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    color: '#86868b', 
    borderBottom: '1px solid rgba(255,255,255,0.05)', 
    background: 'rgba(0,0,0,0.2)',
    fontWeight: 700 
  },
  td: { 
    padding: '16px 20px', 
    fontSize: 13, 
    borderBottom: '1px solid rgba(255,255,255,0.03)', 
    verticalAlign: 'middle',
    color: '#e8e8eb'
  },
  tr: { 
    transition: 'background 0.2s',
    cursor: 'default'
  },
  badge: { 
    fontSize: 10, 
    fontWeight: 800, 
    padding: '4px 8px', 
    borderRadius: 6, 
    textTransform: 'uppercase',
    letterSpacing: 0.5 
  },
  viewBtn: { 
    background: 'rgba(196,160,82,0.1)', 
    color: '#c4a052', 
    border: '1px solid rgba(196,160,82,0.2)', 
    padding: '6px 12px', 
    borderRadius: 8, 
    fontSize: 12, 
    fontWeight: 600, 
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
};`;

code = code.replace(/const styles = \{[\s\S]*?\};/, newStyles);

// Update inline styles that might still be bad
code = code.replace(/style={{ flex: 1, textAlign: 'center' }}/g, "style={{ flex: 1 }}");
code = code.replace(/display: 'flex', flexDirection: 'column', alignItems: 'center'/g, "display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'");

fs.writeFileSync(target, code);
console.log('HiringSessionDetail patched');
