const fs = require('fs');
const target = 'C:/Users/Ehsan/Desktop/FYP/Ehsan/ehsan_interview/frontend/src/pages/HiringBanks.jsx';
let code = fs.readFileSync(target, 'utf8');

const newStyles = `const styles = {
  page: { 
    minHeight: '100vh', 
    background: '#0a0a0b', 
    color: '#e8e8eb', 
    fontFamily: "'Inter', sans-serif", 
    padding: '40px 24px',
    backgroundImage: 'radial-gradient(circle at top right, rgba(196,160,82,0.06) 0%, transparent 60%)'
  },
  container: { 
    maxWidth: 900, 
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
  topRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: 24,
    flexWrap: 'wrap',
    gap: 16
  },
  title: { 
    fontSize: 28, 
    fontWeight: 800, 
    margin: 0, 
    letterSpacing: '-0.5px' 
  },
  primaryBtn: { 
    background: 'linear-gradient(135deg, #d4b062 0%, #c4a052 100%)', 
    color: '#0a0a0b', 
    border: 'none', 
    padding: '12px 24px', 
    borderRadius: 10, 
    fontWeight: 700, 
    fontSize: 14, 
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(196,160,82,0.2)',
  },
  createCard: { 
    background: 'rgba(22, 22, 24, 0.6)', 
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(196,160,82,0.2)', 
    borderRadius: 16, 
    padding: '30px', 
    marginBottom: 10,
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
  },
  inputGroup: { 
    display: 'flex', 
    flexDirection: 'column',
    gap: 8
  },
  label: { 
    fontSize: 12, 
    fontWeight: 700, 
    color: '#a0a0a5', 
    textTransform: 'uppercase', 
    letterSpacing: 0.8 
  },
  input: { 
    padding: '14px 16px', 
    borderRadius: 10, 
    border: '1px solid rgba(255,255,255,0.1)', 
    fontSize: 14, 
    outline: 'none', 
    color: '#e8e8eb', 
    backgroundColor: 'rgba(0,0,0,0.3)',
    transition: 'border-color 0.2s',
  },
  helpText: { 
    marginTop: 6, 
    fontSize: 12, 
    color: '#86868b' 
  },
  emptyState: { 
    textAlign: 'center', 
    padding: '48px 20px', 
    background: 'rgba(22, 22, 24, 0.4)', 
    borderRadius: 16, 
    border: '1px dashed rgba(255,255,255,0.05)' 
  },
  bankCard: { 
    background: 'rgba(22, 22, 24, 0.6)', 
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.06)', 
    borderRadius: 16, 
    overflow: 'hidden', 
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  questionsPanel: { 
    padding: '0 24px 24px', 
    borderTop: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(0,0,0,0.2)'
  },
  questionItem: { 
    padding: '16px 0', 
    borderBottom: '1px solid rgba(255,255,255,0.03)' 
  },
};`;

code = code.replace(/const styles = \{[\s\S]*?\};/, newStyles);
fs.writeFileSync(target, code);
console.log('HiringBanks patched');
