import React, { useState, useRef } from 'react';
import AppLayout from '../components/AppLayout';

export default function Resume() {
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/resume/analyze`, {
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
      setChatMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
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
  const score = analysisResult?.overallScore || 0;
  const scoreOffset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 80 ? '#3faa72' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#dc4a4a';

  return (
    <AppLayout activePage="resume" mainClassName="resume-wizard" mainStyle={null}>
      <div className="resume-header">
        <h1>Resume Lab</h1>
        <p>Upload your resume, describe the target role, and get AI-powered insights.</p>
      </div>

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
            onClick={startAnalysis}
            disabled={isAnalyzing}
          >
            Analyze Match
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
    </AppLayout>
  );
}
