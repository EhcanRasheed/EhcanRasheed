import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Resume() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Resume analyzer state
  const [keyText, setKeyText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Small chat box state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      logout();
      localStorage.clear();
      navigate('/login');
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setAnalysisStep(0);
      setAnalysisResult(null);
      setChatMessages([]);
      setAnalysisError('');
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setAnalysisStep(0);
      setAnalysisResult(null);
      setChatMessages([]);
      setAnalysisError('');
    }
  };

  const startAnalysis = async () => {
    if (!file) return;
    if (!keyText.trim()) {
      setAnalysisError('Please paste the job description or key criteria so we can analyze against it.');
      return;
    }

    setAnalysisError('');
    setIsAnalyzing(true);
    setAnalysisStep(1);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('key', keyText);

    const progressTimeout = setTimeout(() => {
      setAnalysisStep((current) => (current === 1 ? 2 : current));
    }, 1200);

    try {
      const response = await fetch('http://localhost:3000/resume/analyze', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      clearTimeout(progressTimeout);

      if (!response.ok) {
        throw new Error('We could not analyze this resume. Please try a different file or try again later.');
      }

      const data = await response.json();
      setAnalysisResult(data);
      setAnalysisStep(3);
    } catch (error) {
      console.error('Resume analysis error:', error);
      setAnalysisError(error.message || 'Something went wrong while analyzing your resume.');
      setAnalysisStep(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendChatMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const newUserMessage = { role: 'user', content: trimmed };
    const nextMessages = [...chatMessages, newUserMessage];
    setChatMessages(nextMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('http://localhost:3000/resume/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages,
          key: keyText,
          analysis: analysisResult,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to get a response from the Resume Analyzer right now.');
      }

      const data = await response.json();
      const assistantText = data.reply || data.message || 'I have reviewed your resume.';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I could not process that.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div style={styles.workspace}>
      <div style={styles.navbarTriggerLine} onMouseEnter={() => setIsNavbarVisible(true)} />

      <aside 
        style={{
          ...styles.sidebar, 
          width: isNavbarVisible ? '280px' : '0px',
          visibility: isNavbarVisible ? 'visible' : 'hidden',
          opacity: isNavbarVisible ? 1 : 0
        }}
        onMouseLeave={() => {
          setIsNavbarVisible(false);
          setIsAccountOpen(false);
        }}
      >
        <div style={styles.sidebarHeader} onClick={() => navigate('/dashboard')}>
          <div style={styles.logoBox}>HC</div>
          <span style={styles.brandName}>HireCraft</span>
        </div>

        <nav style={styles.sideNav}>
          <Link to="/dashboard" style={styles.sideNavLink}>Home</Link>
          <Link to="/resume" style={styles.sideNavLinkActive}>Resume Lab</Link>
          <Link to="/chatbot" style={styles.sideNavLink}>Chatbot</Link>
          <Link to="/interview" style={styles.sideNavLink}>Interview Preparation</Link>

          <div style={styles.accountTabTrigger} onClick={() => setIsAccountOpen(!isAccountOpen)}>
            <span>Account</span>
            <span style={{ transform: isAccountOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>▼</span>
          </div>

          {isAccountOpen && (
            <div style={styles.nestedMenu}>
              <Link to="/change-username" style={styles.nestedLink}>Change Username</Link>
              <Link to="/change-password" style={styles.nestedLink}>Change Password</Link>
              <button style={styles.logoutTrigger} onClick={() => setShowLogoutModal(true)}>Sign Out</button>
            </div>
          )}
        </nav>
      </aside>

      <main style={{ ...styles.mainContent, paddingLeft: isNavbarVisible ? '320px' : '80px' }}>
        <div style={styles.headerSection}>
          <h1 style={styles.pageTitle}>Resume Lab</h1>
          <p style={styles.subText}>Tailor your profile for maximum impact.</p>
        </div>

        <div style={styles.dashboardLayout}>
          <section style={styles.inputSection}>
            <div style={styles.glassCard}>
              <div 
                style={{
                  ...styles.uploadZone,
                  backgroundColor: isDragging ? '#fff5f5' : 'transparent',
                  borderColor: isDragging ? '#800000' : '#cbd5e1'
                }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <div style={styles.uploadIcon}>{file ? '📄' : '☁️'}</div>
                <h3 style={styles.uploadTitle}>{file ? file.name : 'Upload Resume'}</h3>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileSelect}
                  accept=".pdf"
                />
                <button style={styles.secondaryBtn} onClick={() => fileInputRef.current.click()}>
                  {file ? 'Change File' : 'Select PDF'}
                </button>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Job Description / Role</label>
                <textarea
                  style={styles.modernTextArea}
                  placeholder="What role are you targeting?"
                  value={keyText}
                  onChange={(e) => setKeyText(e.target.value)}
                />
              </div>

              {file && (
                <button style={styles.primaryBtn} onClick={startAnalysis} disabled={isAnalyzing}>
                  {isAnalyzing ? 'Processing...' : 'Analyze Match'}
                </button>
              )}

              {analysisStep > 0 && (
                <div style={styles.loaderContainer}>
                  <div style={{ ...styles.loaderBar, width: analysisStep === 1 ? '33%' : analysisStep === 2 ? '66%' : '100%' }} />
                </div>
              )}
            </div>
          </section>

          <section style={styles.resultsSection}>
            {analysisResult ? (
              <div style={styles.glassCard}>
                <div style={styles.scoreRow}>
                  <div style={styles.scoreCircle}>
                    <span style={styles.scoreNum}>{analysisResult.overallScore}</span>
                    <span style={styles.scorePct}>%</span>
                  </div>
                  <div>
                    <h4 style={styles.cardHeading}>ATS Match Score</h4>
                    <p style={styles.summaryText}>{analysisResult.summary}</p>
                  </div>
                </div>

                <div style={styles.statsGrid}>
                  <div style={styles.statBox}>
                    <span style={styles.statLabel}>Strengths</span>
                    <ul style={styles.list}>
                      {analysisResult.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div style={styles.statBox}>
                    <span style={styles.statLabel}>Gaps</span>
                    <ul style={styles.list}>
                      {analysisResult.gaps?.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.emptyCard}>
                <p>Run analysis to see technical insights</p>
              </div>
            )}

            <div style={styles.chatContainer}>
              <div style={styles.chatHeader}>HireCraft Assistant</div>
              <div style={styles.messageArea}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot}>
                    {msg.content}
                  </div>
                ))}
                {isChatLoading && <div style={styles.bubbleBot}>Thinking...</div>}
              </div>
              <div style={styles.chatInputWrapper}>
                <input 
                  style={styles.chatField} 
                  placeholder="Ask a follow-up..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                <button style={styles.sendIconBtn} onClick={sendChatMessage}>→</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const styles = {
  // --- BASE LAYOUT ---
  workspace: { 
    display: 'flex', 
    minHeight: '100vh', 
    width: '100%', 
    background: '#ffffff', 
    color: '#1e293b', 
    fontFamily: "'Inter', sans-serif", 
    overflowX: 'hidden' 
  },

  // --- NAVBAR & SIDEBAR ---
  navbarTriggerLine: { 
    position: 'fixed', 
    left: 0, 
    top: 0, 
    bottom: 0, 
    width: '12px', 
    zIndex: 150, 
    background: '#800000', 
    cursor: 'pointer' 
  },
  sidebar: { 
    background: '#ffffff', 
    borderRight: '1px solid #e2e8f0', 
    display: 'flex', 
    flexDirection: 'column', 
    padding: '32px 24px', 
    position: 'fixed', 
    left: 0, 
    top: 0, 
    height: '100vh', 
    zIndex: 200, 
    transition: '0.3s ease', 
    overflow: 'hidden' 
  },
  sidebarHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    marginBottom: '40px', 
    cursor: 'pointer' 
  },
  logoBox: { 
    minWidth: '34px', 
    height: '34px', 
    background: '#0f172a', 
    borderRadius: '8px', 
    color: '#fff', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: 800 
  },
  brandName: { fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' },
  sideNav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  sideNavLink: { 
    textDecoration: 'none', 
    color: '#64748b', 
    padding: '12px 16px', 
    borderRadius: '8px', 
    fontSize: '14px', 
    fontWeight: 500 
  },
  sideNavLinkActive: { 
    textDecoration: 'none', 
    color: '#0f172a', 
    background: '#f1f5f9', 
    padding: '12px 16px', 
    borderRadius: '8px', 
    fontSize: '14px', 
    fontWeight: 600 
  },
  accountTabTrigger: { 
    cursor: 'pointer', 
    padding: '12px 16px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    fontSize: '14px', 
    fontWeight: 500, 
    color: '#64748b' 
  },
  nestedMenu: { paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '4px' },
  nestedLink: { textDecoration: 'none', color: '#94a3b8', fontSize: '13px', padding: '4px 0' },
  logoutTrigger: { 
    background: 'none', 
    border: 'none', 
    color: '#ef4444', 
    textAlign: 'left', 
    cursor: 'pointer', 
    padding: '8px 0', 
    fontSize: '13px', 
    fontWeight: 600 
  },

  // --- CONTENT HEADER ---
  mainContent: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    padding: '48px 60px', 
    transition: 'padding-left 0.3s ease' 
  },
  headerSection: { marginBottom: '40px' },
  pageTitle: { fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 },
  subText: { color: '#64748b', fontSize: '14px', marginTop: '4px' },

  // --- DASHBOARD LAYOUT ---
  dashboardLayout: { 
    display: 'grid', 
    gridTemplateColumns: '1.2fr 1.1fr', 
    gap: '32px', 
    alignItems: 'start' 
  },
  glassCard: { 
    background: '#ffffff', 
    border: '1px solid #e2e8f0', 
    padding: '40px', 
    borderRadius: '24px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '24px' 
  },
  uploadZone: { 
    border: '2px dashed #e2e8f0', 
    borderRadius: '20px', 
    padding: '40px 20px', 
    textAlign: 'center', 
    transition: '0.2s' 
  },
  uploadIcon: { fontSize: '2rem', marginBottom: '10px' },
  uploadTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' },
  inputGroup: { marginTop: '10px' },
  label: { 
    fontSize: '13px', 
    fontWeight: 600, 
    color: '#0f172a', 
    marginBottom: '6px', 
    display: 'block' 
  },
  modernTextArea: { 
    width: '100%', 
    minHeight: '100px', 
    padding: '12px', 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0', 
    fontSize: '13px', 
    outline: 'none', 
    resize: 'vertical' 
  },
  primaryBtn: { 
    width: '100%', 
    padding: '14px', 
    borderRadius: '12px', 
    background: '#800000', 
    border: 'none', 
    color: '#fff', 
    fontWeight: 600, 
    cursor: 'pointer' 
  },
  secondaryBtn: { 
    background: '#f1f5f9', 
    color: '#0f172a', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '10px', 
    fontWeight: 600, 
    cursor: 'pointer', 
    marginTop: '10px' 
  },
  loaderContainer: { height: '6px', background: '#e2e8f0', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' },
  loaderBar: { height: '100%', background: '#800000', transition: '0.4s' },

  // --- RESULTS SECTION ---
  resultsSection: { display: 'flex', flexDirection: 'column', gap: '24px' },
  scoreRow: { display: 'flex', gap: '20px', alignItems: 'center' },
  scoreCircle: { 
    minWidth: '70px', 
    height: '70px', 
    borderRadius: '50%', 
    border: '4px solid #800000', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#800000' 
  },
  scoreNum: { fontSize: '1.4rem', fontWeight: 800 },
  scorePct: { fontSize: '0.7rem', fontWeight: 700 },
  cardHeading: { fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' },
  summaryText: { fontSize: '13px', color: '#64748b', marginTop: '4px' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' },
  statBox: { 
    background: '#fff5f5', 
    padding: '16px', 
    borderRadius: '16px', 
    border: '1px solid #fecaca' 
  },
  statLabel: { 
    display: 'block', 
    fontWeight: 700, 
    fontSize: '12px', 
    color: '#800000', 
    marginBottom: '8px', 
    textTransform: 'uppercase' 
  },
  list: { paddingLeft: '15px', fontSize: '13px', color: '#475569', margin: 0 },
  emptyCard: { 
    flex: 1, 
    background: '#fff', 
    borderRadius: '24px', 
    border: '2px dashed #e2e8f0', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#94a3b8', 
    minHeight: '200px' 
  },

  // --- HIRECRAFT ASSISTANT (CHAT) ---
  chatContainer: { 
    background: '#ffffff', 
    borderRadius: '24px', 
    border: '1px solid #e2e8f0', 
    height: '420px', 
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden' 
  },
  chatHeader: { 
    padding: '16px 20px', 
    background: '#800000', // Updated to Maroon
    color: '#fff', 
    fontWeight: 700, 
    fontSize: '14px',
    textAlign: 'center'
  },
  messageArea: { 
    flex: 1, 
    padding: '20px', 
    overflowY: 'auto', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px', 
    background: '#f8fafc' 
  },
  bubbleBot: { 
    alignSelf: 'flex-start', 
    background: '#e2e8f0', 
    color: '#0f172a', 
    padding: '10px 14px', 
    borderRadius: '16px 16px 16px 4px', 
    fontSize: '13px', 
    maxWidth: '85%' 
  },
  bubbleUser: { 
    alignSelf: 'flex-end', 
    background: '#800000', 
    color: '#fff', 
    padding: '10px 14px', 
    borderRadius: '16px 16px 4px 16px', 
    fontSize: '13px', 
    maxWidth: '85%' 
  },
  chatInputWrapper: { 
    padding: '12px 16px', 
    borderTop: '1px solid #e2e8f0', 
    display: 'flex', 
    gap: '10px', 
    background: '#fff' 
  },
  chatField: { 
    flex: 1, 
    border: '1px solid #e2e8f0', 
    background: '#f8fafc', 
    padding: '10px 16px', 
    borderRadius: '999px', 
    outline: 'none', 
    fontSize: '13px' 
  },
  sendIconBtn: { 
    background: '#800000', 
    color: '#fff', 
    border: 'none', 
    width: '40px', 
    height: '40px', 
    borderRadius: '50%', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: 700 
  }
};