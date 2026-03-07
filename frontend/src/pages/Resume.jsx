import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { saveResumeAnalysis, listResumeAnalyses, getResumeAnalysis, deleteResumeAnalysis, updateResumeAnalysis } from '../api/resume';

export default function Resume() {
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const savedAnalysisIdRef = useRef(null);
  const navigate = useNavigate();
  const { usageLimits, refreshUsage } = useAuth();

  const resumeUsage = usageLimits?.usage?.resumes;
  const atLimit = resumeUsage && resumeUsage.limit !== null && resumeUsage.used >= resumeUsage.limit;

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

  // History state
  const [tab, setTab] = useState('analyze');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try { setHistory(await listResumeAnalyses()); } catch (_) {}
    setHistoryLoading(false);
  };

  const handleLoadAnalysis = async (id) => {
    try {
      const data = await getResumeAnalysis(id);
      setAnalysisResult({ overallScore: data.overallScore, summary: data.summary, strengths: data.strengths, gaps: data.gaps });
      setChatMessages(data.chatMessages || []);
      setKeyText(data.jobDescription || '');
      setFile({ name: data.fileName });
      savedAnalysisIdRef.current = id;
      setTab('analyze');
    } catch (_) {}
  };

  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this analysis?')) return;
    try {
      await deleteResumeAnalysis(id);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (_) {}
  };

  // Derived wizard phase
  const phase = !file
    ? 'upload'
    : isAnalyzing
      ? 'analyzing'
      : analysisResult
        ? 'results'
        : 'configure';

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

  const resetAnalysis = () => {
    setFile(null);
    setAnalysisResult(null);
    setAnalysisStep(0);
    setAnalysisError('');
    setChatMessages([]);
    setKeyText('');
    savedAnalysisIdRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/resume/analyze`, {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });

      clearTimeout(progressTimeout);

      if (!response.ok) {
        if (response.status === 403) {
          const errData = await response.json().catch(() => ({}));
          clearTimeout(progressTimeout);
          setAnalysisError(errData.message || 'Resume analysis limit reached. Upgrade your plan.');
          setAnalysisStep(0);
          setIsAnalyzing(false);
          return;
        }
        throw new Error('We could not analyze this resume. Please try a different file or try again later.');
      }

      const data = await response.json();
      setAnalysisResult(data);
      setAnalysisStep(3);

      // Auto-save to history
      try {
        const saved = await saveResumeAnalysis({
          fileName: file?.name || 'resume.pdf',
          jobDescription: keyText,
          overallScore: data.overallScore,
          summary: data.summary,
          strengths: data.strengths,
          gaps: data.gaps,
          chatMessages: [],
        });
        savedAnalysisIdRef.current = saved?.id || null;
        loadHistory();
      } catch (_) {}
      await refreshUsage();
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/resume/chat`, {
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
      const updatedMessages = [...nextMessages, { role: 'assistant', content: assistantText }];
      setChatMessages(updatedMessages);

      // Persist chat to saved analysis
      if (savedAnalysisIdRef.current) {
        try { await updateResumeAnalysis(savedAnalysisIdRef.current, { chatMessages: updatedMessages }); } catch (_) {}
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I could not process that.' }]);
    } finally {
      setIsChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    return parts.map((part, i) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return <strong key={i} className="resume-chat-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderMessageContent = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let bulletBuffer = [];

    const flushBullets = () => {
      if (bulletBuffer.length === 0) return;
      elements.push(
        <ul key={`ul-${elements.length}`} className="resume-chat-list">
          {bulletBuffer.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      bulletBuffer = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const bulletMatch = line.match(/^\s*(?:[-*\u2022]|\d+[.)]) \s*(.+)/);
      if (bulletMatch) {
        bulletBuffer.push(bulletMatch[1]);
      } else {
        flushBullets();
        if (line.trim() === '') {
          elements.push(<div key={`br-${i}`} style={{ height: '6px' }} />);
        } else {
          elements.push(
            <p key={`p-${i}`} className="resume-chat-paragraph">{renderInline(line)}</p>
          );
        }
      }
    }
    flushBullets();

    return elements;
  };

  // Score ring SVG params
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const rawScore = analysisResult?.overallScore || 0;
  const score = rawScore <= 10 ? Math.round(rawScore * 10) : Math.round(rawScore);
  const scoreOffset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 80 ? '#3faa72' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#dc4a4a';

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const mx = 18;
      const cw = pw - 2 * mx;
      let y = 0;

      const drawBg = () => { doc.setFillColor(10, 10, 11); doc.rect(0, 0, pw, ph, 'F'); };
      const ensureSpace = (need = 8) => {
        if (y + need > ph - 14) { doc.addPage(); drawBg(); y = mx; }
      };
      const writeLines = (text, x, size, rgb, style = 'normal', maxW) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.setTextColor(...rgb);
        const w = maxW || (cw - (x - mx));
        const lines = doc.splitTextToSize(String(text || ''), w);
        const lh = size * 0.42 + 0.8;
        for (const line of lines) {
          ensureSpace(lh);
          doc.text(line, x, y);
          y += lh;
        }
      };
      const goldRule = () => {
        ensureSpace(6);
        doc.setDrawColor(139, 92, 246); doc.setLineWidth(0.4);
        doc.line(mx, y, pw - mx, y); y += 5;
      };
      const subtleRule = () => {
        ensureSpace(6);
        doc.setDrawColor(50, 50, 55); doc.setLineWidth(0.2);
        doc.line(mx, y, pw - mx, y); y += 4;
      };

      drawBg();
      y = mx + 6;

      doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(232, 232, 235);
      doc.text('Hire-Craft Resume Analysis', pw / 2, y, { align: 'center' });
      y += 8;
      goldRule();

      doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 107, 112);
      doc.text(`${new Date().toLocaleDateString()} — ${file?.name || 'resume.pdf'}`, pw / 2, y, { align: 'center' });
      y += 10;

      // Score
      writeLines(`ATS MATCH SCORE: ${score}%`, mx, 16, [139, 92, 246], 'bold'); y += 2;
      if (analysisResult?.summary) { writeLines(analysisResult.summary, mx, 10, [160, 160, 165]); y += 3; }

      // Strengths
      if (analysisResult?.strengths?.length) {
        goldRule();
        writeLines('STRENGTHS', mx, 12, [63, 170, 114], 'bold'); y += 2;
        for (const s of analysisResult.strengths) writeLines(`•  ${s}`, mx + 4, 10, [200, 200, 204]);
        y += 3;
      }

      // Gaps
      if (analysisResult?.gaps?.length) {
        goldRule();
        writeLines('AREAS TO IMPROVE', mx, 12, [249, 115, 22], 'bold'); y += 2;
        for (const g of analysisResult.gaps) writeLines(`•  ${g}`, mx + 4, 10, [200, 200, 204]);
        y += 3;
      }

      // Chat conversation
      if (chatMessages.length > 0) {
        goldRule();
        writeLines('FOLLOW-UP CONVERSATION', mx, 13, [232, 232, 235], 'bold'); y += 4;
        for (const m of chatMessages) {
          const isUser = m.role === 'user';
          ensureSpace(12);
          writeLines(isUser ? 'You' : 'Hire-Craft Advisor', mx, 9, isUser ? [139, 92, 246] : [160, 160, 165], 'bold');
          writeLines((m.content || '').replace(/\*\*/g, ''), mx + 2, 10, [200, 200, 204]);
          y += 3;
        }
      }

      y += 4;
      subtleRule();
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 107, 112);
      doc.text('Generated by Hire-Craft — AI Resume Analysis Platform', pw / 2, y, { align: 'center' });

      doc.save(`Hire-Craft_Resume_Analysis_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  const handleExportHistoryPDF = async (e, id) => {
    e.stopPropagation();
    try {
      const data = await getResumeAnalysis(id);
      const rawSc = data.overallScore || 0;
      const sc = rawSc <= 10 ? Math.round(rawSc * 10) : Math.round(rawSc);
      const doc = new jsPDF('p', 'mm', 'a4');
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const mx = 18; const cw = pw - 2 * mx; let y = 0;
      const drawBg = () => { doc.setFillColor(10, 10, 11); doc.rect(0, 0, pw, ph, 'F'); };
      const ensureSpace = (need = 8) => { if (y + need > ph - 14) { doc.addPage(); drawBg(); y = mx; } };
      const writeLines = (text, x, size, rgb, style = 'normal', maxW) => {
        doc.setFontSize(size); doc.setFont('helvetica', style); doc.setTextColor(...rgb);
        const lines = doc.splitTextToSize(String(text || ''), maxW || (cw - (x - mx)));
        const lh = size * 0.42 + 0.8;
        for (const line of lines) { ensureSpace(lh); doc.text(line, x, y); y += lh; }
      };
      const rule = () => { ensureSpace(6); doc.setDrawColor(139, 92, 246); doc.setLineWidth(0.4); doc.line(mx, y, pw - mx, y); y += 5; };

      drawBg(); y = mx + 6;
      doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(232, 232, 235);
      doc.text('Hire-Craft Resume Analysis', pw / 2, y, { align: 'center' }); y += 8; rule();
      doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 107, 112);
      doc.text(`${new Date(data.createdAt).toLocaleDateString()} — ${data.fileName || 'resume.pdf'}`, pw / 2, y, { align: 'center' }); y += 10;
      writeLines(`ATS MATCH SCORE: ${sc}%`, mx, 16, [139, 92, 246], 'bold'); y += 2;
      if (data.summary) { writeLines(data.summary, mx, 10, [160, 160, 165]); y += 3; }
      if (data.strengths?.length) { rule(); writeLines('STRENGTHS', mx, 12, [63, 170, 114], 'bold'); y += 2; for (const s of data.strengths) writeLines(`•  ${s}`, mx + 4, 10, [200, 200, 204]); y += 3; }
      if (data.gaps?.length) { rule(); writeLines('AREAS TO IMPROVE', mx, 12, [249, 115, 22], 'bold'); y += 2; for (const g of data.gaps) writeLines(`•  ${g}`, mx + 4, 10, [200, 200, 204]); y += 3; }
      if (data.chatMessages?.length) {
        rule(); writeLines('FOLLOW-UP CONVERSATION', mx, 13, [232, 232, 235], 'bold'); y += 4;
        for (const m of data.chatMessages) {
          const isU = m.role === 'user'; ensureSpace(12);
          writeLines(isU ? 'You' : 'Hire-Craft Advisor', mx, 9, isU ? [139, 92, 246] : [160, 160, 165], 'bold');
          writeLines((m.content || '').replace(/\*\*/g, ''), mx + 2, 10, [200, 200, 204]); y += 3;
        }
      }
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 107, 112);
      y += 4; doc.text('Generated by Hire-Craft — AI Resume Analysis Platform', pw / 2, y, { align: 'center' });
      doc.save(`Hire-Craft_Resume_${new Date(data.createdAt).toISOString().slice(0, 10)}.pdf`);
    } catch (_) {}
  };

  return (
    <AppLayout activePage="resume" mainClassName="resume-wizard" mainStyle={null}>
      <div className="resume-header">
        <h1>Resume Analysis</h1>
        <p>Upload your resume, describe the target role, and get AI-powered insights.</p>
        {resumeUsage && (
          <div style={{ display:'inline-block', marginTop:10, background:'rgba(196,160,82,0.12)', border:'1px solid rgba(196,160,82,0.25)', color:'#c4a052', fontSize:12, fontWeight:600, padding:'4px 14px', borderRadius:20 }}>
            {resumeUsage.limit === null ? '∞ Unlimited analyses' : `${resumeUsage.used} / ${resumeUsage.limit} analyses used this month`}
          </div>
        )}
      </div>
      {atLimit && (
        <div style={{ background:'rgba(231,76,60,0.1)', border:'1px solid rgba(231,76,60,0.3)', color:'#e74c3c', fontSize:14, padding:'14px 20px', borderRadius:12, marginBottom:24, lineHeight:1.6 }}>
          You've used all <strong>{resumeUsage.limit}</strong> resume analyses this month.&nbsp;
          <span style={{ cursor:'pointer', textDecoration:'underline' }} onClick={() => navigate('/subscription')}>Upgrade your plan →</span>
        </div>
      )}

      {/* Tab Bar */}
      <div style={{ display:'flex', gap:12, marginBottom:18 }}>
        <button
          onClick={() => setTab('analyze')}
          style={{
            padding:'8px 22px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, fontSize:14,
            background: tab==='analyze' ? 'rgba(139,92,246,.18)' : 'rgba(255,255,255,.04)',
            color: tab==='analyze' ? '#a78bfa' : '#888',
          }}
        >Analyze</button>
        <button
          onClick={() => { setTab('history'); loadHistory(); }}
          style={{
            padding:'8px 22px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, fontSize:14,
            background: tab==='history' ? 'rgba(139,92,246,.18)' : 'rgba(255,255,255,.04)',
            color: tab==='history' ? '#a78bfa' : '#888',
          }}
        >My History{history.length ? ` (${history.length})` : ''}</button>
      </div>

      {tab === 'history' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {historyLoading ? (
            <p style={{ color:'#888', textAlign:'center', padding:32 }}>Loading…</p>
          ) : history.length === 0 ? (
            <p style={{ color:'#888', textAlign:'center', padding:32 }}>No past analyses yet.</p>
          ) : history.map(h => (
            <div
              key={h.id}
              onClick={() => handleLoadAnalysis(h.id)}
              style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)',
                borderRadius:10, padding:'12px 16px', cursor:'pointer', transition:'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(139,92,246,.08)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,.03)'}
            >
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                <span style={{ color:'#e2e2e2', fontWeight:600, fontSize:14 }}>{(h.jobDescription || h.fileName || 'Resume').split('\n')[0].slice(0, 60)}</span>
                <span style={{ color:'#888', fontSize:12 }}>
                  Score: {h.overallScore ?? '–'}% · {new Date(h.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={(e) => handleExportHistoryPDF(e, h.id)}
                style={{
                  background:'rgba(139,92,246,.12)', color:'#a78bfa', border:'none', borderRadius:6,
                  padding:'5px 12px', cursor:'pointer', fontSize:12, fontWeight:600, marginRight:8,
                }}
              >PDF</button>
              <button
                onClick={(e) => handleDeleteHistory(e, h.id)}
                style={{
                  background:'rgba(220,74,74,.12)', color:'#dc4a4a', border:'none', borderRadius:6,
                  padding:'5px 12px', cursor:'pointer', fontSize:12, fontWeight:600,
                }}
              >Delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'analyze' && <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        accept=".pdf"
      />

      {/* STEP 1: Upload */}
      {phase === 'upload' && (
        <div className="resume-step" key="upload">
          <div
            className={`resume-upload-hero ${isDragging ? 'dragging' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <div className="resume-upload-icon">☁️</div>
            <h2 className="resume-upload-title">Drop your resume here</h2>
            <p className="resume-upload-subtitle">or click anywhere in this area to browse</p>
            <button
              className="resume-browse-btn"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
            >
              Browse Files
            </button>
            <p className="resume-upload-formats">Supports PDF files</p>
          </div>
        </div>
      )}

      {/* STEP 2: Configure */}
      {phase === 'configure' && (
        <div className="resume-step" key="configure">
          <div className="resume-file-chip">
            <div className="resume-file-chip-icon">📄</div>
            <span className="resume-file-chip-name">{file?.name}</span>
            <button
              className="resume-file-chip-change"
              onClick={() => fileInputRef.current.click()}
            >
              Change
            </button>
          </div>

          <div className="resume-job-section">
            <label className="resume-job-label">Job Description / Target Role</label>
            <textarea
              className="resume-job-textarea"
              placeholder="Paste the job description or describe the role you're targeting..."
              value={keyText}
              onChange={(e) => setKeyText(e.target.value)}
            />
          </div>

          {analysisError && <div className="resume-error">{analysisError}</div>}

          <button
            className="resume-analyze-btn"
            onClick={atLimit ? () => navigate('/subscription') : startAnalysis}
            disabled={isAnalyzing}
            style={atLimit ? { background:'rgba(231,76,60,0.15)', color:'#e74c3c', border:'1px solid rgba(231,76,60,0.3)' } : {}}
          >
            {atLimit ? 'Upgrade to Analyze' : 'Analyze Match'}
          </button>
        </div>
      )}

      {/* STEP 3: Analyzing */}
      {phase === 'analyzing' && (
        <div className="resume-step" key="analyzing">
          <div className="resume-progress-section">
            <div className="resume-progress-steps">
              <div className={`resume-progress-step ${analysisStep >= 1 ? 'active' : ''} ${analysisStep > 1 ? 'done' : ''}`}>
                <div className="resume-progress-step-dot" />
                <span>Parsing Resume</span>
              </div>
              <div className={`resume-progress-step ${analysisStep >= 2 ? 'active' : ''} ${analysisStep > 2 ? 'done' : ''}`}>
                <div className="resume-progress-step-dot" />
                <span>Analyzing Match</span>
              </div>
              <div className={`resume-progress-step ${analysisStep >= 3 ? 'active' : ''}`}>
                <div className="resume-progress-step-dot" />
                <span>Generating Insights</span>
              </div>
            </div>

            <div className="resume-progress-bar">
              <div
                className="resume-progress-fill"
                style={{ width: analysisStep === 1 ? '33%' : analysisStep === 2 ? '66%' : '100%' }}
              />
            </div>
            <p className="resume-progress-hint">This usually takes a few seconds...</p>
          </div>
        </div>
      )}

      {/* STEP 4: Results + Chat */}
      {phase === 'results' && (
        <div className="resume-step resume-results-step" key="results">
          <div className="resume-score-banner">
            <div className="resume-score-gauge">
              <svg className="resume-score-ring" viewBox="0 0 108 108" width="110" height="110">
                <circle className="resume-score-ring-bg" cx="54" cy="54" r={radius} />
                <circle
                  className="resume-score-ring-fg"
                  cx="54" cy="54" r={radius}
                  stroke={scoreColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={scoreOffset}
                />
              </svg>
              <div className="resume-score-value">
                <span className="resume-score-num" style={{ color: scoreColor }}>{score}</span>
                <span className="resume-score-pct" style={{ color: scoreColor }}>%</span>
              </div>
            </div>
            <div className="resume-score-info">
              <h2>ATS Match Score</h2>
              <p>{analysisResult?.summary}</p>
            </div>
          </div>

          <div className="resume-insights-grid">
            <div className="resume-insight-card strengths">
              <h3 className="resume-insight-title">Strengths</h3>
              <ul className="resume-insight-list">
                {analysisResult?.strengths?.map((s, i) => (
                  <li key={i} className="resume-insight-item">{s}</li>
                ))}
              </ul>
            </div>
            <div className="resume-insight-card gaps">
              <h3 className="resume-insight-title">Areas to Improve</h3>
              <ul className="resume-insight-list">
                {analysisResult?.gaps?.map((g, i) => (
                  <li key={i} className="resume-insight-item">{g}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="resume-actions">
            <button className="resume-new-btn" onClick={resetAnalysis}>
              Analyze Another Resume
            </button>
            <button
              className="resume-new-btn"
              onClick={handleExportPDF}
              style={{ background: 'rgba(139,92,246,.18)', color: '#a78bfa', marginLeft: 10 }}
            >
              📄 Download PDF
            </button>
          </div>

          <div className="resume-chat-section">
            <div className="resume-chat-header">
              <span>💬</span> Ask about your results
            </div>
            <div className="resume-chat-messages">
              {chatMessages.length === 0 && (
                <p style={{ textAlign: 'center', color: '#3a3a3d', fontSize: '13px', margin: 'auto' }}>
                  Ask follow-up questions about your resume analysis...
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`resume-chat-bubble ${msg.role}`}>
                  {msg.role === 'assistant' && <div className="resume-chat-avatar">HC</div>}
                  <div className="resume-chat-text">{renderMessageContent(msg.content)}</div>
                </div>
              ))}
              {isChatLoading && (
                <div className="resume-chat-bubble assistant">
                  <div className="resume-chat-avatar">HC</div>
                  <div className="resume-chat-text">
                    <span className="resume-typing">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="resume-chat-input-row">
              <input
                className="resume-chat-input"
                placeholder="Ask a follow-up question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <button className="resume-chat-send" onClick={sendChatMessage}>→</button>
            </div>
          </div>
        </div>
      )}
      </>}
    </AppLayout>
  );
}
