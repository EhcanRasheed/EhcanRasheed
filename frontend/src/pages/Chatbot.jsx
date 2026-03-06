import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { saveChatSession, listChatSessions, getChatSession, deleteChatSession } from '../api/chatbot';

/* ─── Typing animation component ─── */
function TypeWriter({ text, renderFn, speed = 12, onComplete }) {
  const [charCount, setCharCount] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    setCharCount(0);
    completedRef.current = false;
    if (!text) return;
    const timer = setInterval(() => {
      setCharCount(prev => {
        const next = Math.min(prev + 2, text.length);
        if (next >= text.length && !completedRef.current) {
          completedRef.current = true;
          clearInterval(timer);
          setTimeout(() => onCompleteRef.current?.(), 80);
        }
        return next;
      });
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  const isComplete = charCount >= text.length;
  return (
    <>
      {renderFn ? renderFn(text.slice(0, charCount)) : text.slice(0, charCount)}
      {!isComplete && <span style={{ color: '#c4a052', fontWeight: 400 }}>▌</span>}
    </>
  );
}

/* ─── Animated thinking dots ─── */
function ThinkingDots() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 3), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <div style={{ minWidth: '32px', height: '32px', background: '#c4a052', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#0a0a0b' }}>HC</div>
      <div style={{ display: 'flex', gap: '5px', padding: '14px 18px', background: '#1d1d20', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c4a052', opacity: frame === i ? 1 : 0.2, transition: 'opacity 0.25s' }} />
        ))}
      </div>
    </div>
  );
}

export default function Chatbot() {
  const bottomRef = useRef(null);
  const { usageLimits, refreshUsage } = useAuth();
  const chatbotUsage = usageLimits?.usage?.chatbot;
  const atLimit = chatbotUsage && chatbotUsage.limit !== null && chatbotUsage.used >= chatbotUsage.limit;

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'I am your HireCraft Interview Mentor. Ask me any question related to your interview.',
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const SPEED_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const [speechRate, setSpeechRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const navigate = useNavigate();
  const [copiedIdx, setCopiedIdx] = useState(-1);
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionStart] = useState(() => new Date());
  const [tab, setTab] = useState('chat');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const speedMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const pendingTranscriptRef = useRef('');

  // -- Speech Recognition setup (auto-send after 2s silence) --
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e) => {
      let final = '';
      let interim = '';
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      const fullText = (final + interim).trim();
      pendingTranscriptRef.current = fullText;
      setInput(fullText);

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        recognition.stop();
      }, 2000);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (pendingTranscriptRef.current.trim()) {
        setTimeout(() => {
          document.getElementById('chatbot-send-btn')?.click();
          pendingTranscriptRef.current = '';
        }, 100);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    recognitionRef.current = recognition;
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // Cancel speech on page refresh / unmount
  useEffect(() => {
    const stopSpeech = () => window.speechSynthesis.cancel();
    window.addEventListener('beforeunload', stopSpeech);
    return () => {
      stopSpeech();
      window.removeEventListener('beforeunload', stopSpeech);
    };
  }, []);

  // Close speed menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target)) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Speak a preview with a given voice URI
  const speakPreview = (voiceURI) => {
    window.speechSynthesis.cancel();
    const v = availableVoices.find(v => v.voiceURI === voiceURI);
    if (v) {
      const u = new SpeechSynthesisUtterance('Hello, I am your interview coach.');
      u.voice = v;
      u.rate = speechRate;
      window.speechSynthesis.speak(u);
    }
  };

  // Get display name for selected voice
  const selectedVoiceName = availableVoices.find(v => v.voiceURI === selectedVoiceURI)?.name || 'Select voice...';

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    window.speechSynthesis.cancel();
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      pendingTranscriptRef.current = '';
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // -- Text-to-Speech (best available voice) --
  const getBestVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (selectedVoiceURI) {
      const picked = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (picked) return picked;
    }
    const ranked = [
      v => /Microsoft.*Online.*Natural/i.test(v.name) && /en/i.test(v.lang),
      v => /Microsoft.*(Aria|Guy|Jenny|Ana|Sonia|Ryan)/i.test(v.name),
      v => /Google UK English Female/i.test(v.name),
      v => /Google US English/i.test(v.name),
      v => /Google/i.test(v.name) && /en/i.test(v.lang),
      v => /Microsoft/i.test(v.name) && /en/i.test(v.lang),
      v => /en[-_]US/i.test(v.lang) && /female/i.test(v.name),
      v => /en/i.test(v.lang),
    ];
    for (const test of ranked) {
      const match = voices.find(test);
      if (match) return match;
    }
    return voices[0] || null;
  };

  const speak = (text) => {
    if (!autoSpeak) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\*\*/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    const voice = getBestVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      setTimeout(() => {
        if (recognitionRef.current && !isListening) {
          pendingTranscriptRef.current = '';
          setInput('');
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch (_) {}
        }
      }, 500);
    };
    window.speechSynthesis.speak(utterance);
  };

  // Preload voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        setAvailableVoices(voices);
        if (!selectedVoiceURI) {
          const best = getBestVoice();
          if (best) setSelectedVoiceURI(best.voiceURI);
        }
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const filteredVoices = availableVoices.filter(v => /^en/i.test(v.lang));

  // Load history on mount
  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try { setHistory(await listChatSessions()); } catch (_) {}
    setHistoryLoading(false);
  };

  const handleLoadSession = async (id) => {
    try {
      const session = await getChatSession(id);
      setMessages(session.messages || []);
      setEvaluation(session.evaluation || null);
      if (session.evaluation) setShowSummary(true);
      setTab('chat');
    } catch (_) {}
  };

  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat session?')) return;
    try {
      await deleteChatSession(id);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (_) {}
  };

  const handleExportHistoryPDF = async (e, id) => {
    e.stopPropagation();
    try {
      const session = await getChatSession(id);
      const msgs = session.messages || [];
      const ev = session.evaluation || {};
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
      const goldRule = () => { ensureSpace(6); doc.setDrawColor(196, 160, 82); doc.setLineWidth(0.4); doc.line(mx, y, pw - mx, y); y += 5; };

      drawBg(); y = mx + 6;
      doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(232, 232, 235);
      doc.text('HireCraft Interview Transcript', pw / 2, y, { align: 'center' }); y += 8; goldRule();
      doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 107, 112);
      doc.text(`${new Date(session.createdAt).toLocaleDateString()}`, pw / 2, y, { align: 'center' }); y += 10;
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(196, 160, 82);
      doc.text(`${session.questionCount || '?'} Questions  •  ${session.durationMinutes || '--'} Minutes`, pw / 2, y, { align: 'center' }); y += 10;

      if (ev.score != null) {
        goldRule();
        writeLines('PERFORMANCE EVALUATION', mx, 13, [232, 232, 235], 'bold'); y += 2;
        writeLines(`Score: ${ev.score} / 10`, mx, 16, [196, 160, 82], 'bold'); y += 2;
        if (ev.summary) { writeLines(ev.summary, mx, 10, [160, 160, 165]); y += 3; }
        if (ev.strengths?.length) { writeLines('STRENGTHS', mx, 9, [107, 107, 112], 'bold'); y += 1; for (const s of ev.strengths) writeLines(`•  ${s}`, mx + 4, 10, [200, 200, 204]); y += 3; }
        if (ev.improvements?.length) { writeLines('AREAS TO IMPROVE', mx, 9, [107, 107, 112], 'bold'); y += 1; for (const s of ev.improvements) writeLines(`•  ${s}`, mx + 4, 10, [200, 200, 204]); y += 3; }
      }

      goldRule();
      writeLines('CONVERSATION', mx, 13, [232, 232, 235], 'bold'); y += 4;
      for (const m of msgs) {
        const isUser = m.role === 'user';
        ensureSpace(12);
        writeLines(isUser ? 'You' : 'HireCraft Mentor', mx, 9, isUser ? [196, 160, 82] : [160, 160, 165], 'bold');
        writeLines((m.content || '').replace(/\*\*/g, ''), mx + 2, 10, [200, 200, 204]); y += 3;
      }

      y += 4;
      doc.setDrawColor(50, 50, 55); doc.setLineWidth(0.2); doc.line(mx, y, pw - mx, y); y += 4;
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 107, 112);
      doc.text('Generated by HireCraft — AI Interview Preparation Platform', pw / 2, y, { align: 'center' });
      doc.save(`HireCraft_Transcript_${new Date(session.createdAt).toISOString().slice(0, 10)}.pdf`);
    } catch (_) {}
  };

  // Derived values
  const questionCount = messages.filter(m => m.role === 'user').length;
  const sessionDuration = Math.max(1, Math.round((Date.now() - sessionStart.getTime()) / 60000));

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Keep scrolling during typing animation
  useEffect(() => {
    if (!isTyping) return;
    const t = setInterval(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 250);
    return () => clearInterval(t);
  }, [isTyping]);

  const handleNewInterview = () => {
    window.speechSynthesis.cancel();
    setMessages([{ role: 'bot', content: 'I am your HireCraft Interview Mentor. Ask me any question related to your interview.', time: new Date() }]);
    setInput('');
    setIsProcessing(false);
    setIsTyping(false);
    setShowSummary(false);
    setCopiedIdx(-1);
    setEvaluation(null);
    setIsEvaluating(false);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text.replace(/\*\*/g, '')).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(-1), 1500);
    });
  };

  const handleExportPDF = () => {
    try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const mx = 18;
    const cw = pw - 2 * mx;
    let y = 0;

    /* ── helpers ── */
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
      doc.setDrawColor(196, 160, 82); doc.setLineWidth(0.4);
      doc.line(mx, y, pw - mx, y); y += 5;
    };
    const subtleRule = () => {
      ensureSpace(6);
      doc.setDrawColor(50, 50, 55); doc.setLineWidth(0.2);
      doc.line(mx, y, pw - mx, y); y += 4;
    };

    /* ── page 1 ── */
    drawBg();
    y = mx + 6;

    /* title */
    doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(232, 232, 235);
    doc.text('HireCraft Interview Transcript', pw / 2, y, { align: 'center' });
    y += 8;
    goldRule();

    /* date */
    doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 107, 112);
    doc.text(`${sessionStart.toLocaleDateString()} at ${sessionStart.toLocaleTimeString()}`, pw / 2, y, { align: 'center' });
    y += 10;

    /* stats row */
    const dur = Math.max(1, Math.round((Date.now() - sessionStart.getTime()) / 60000));
    const botCount = messages.filter(m => m.role === 'bot').length - 1;
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(196, 160, 82);
    doc.text(`${questionCount} Questions   \u2022   ${dur} Minutes   \u2022   ${botCount} AI Responses`, pw / 2, y, { align: 'center' });
    y += 10;

    /* evaluation */
    if (evaluation?.score != null) {
      goldRule();
      writeLines('PERFORMANCE EVALUATION', mx, 13, [232, 232, 235], 'bold'); y += 2;
      writeLines(`Score: ${evaluation.score} / 10`, mx, 16, [196, 160, 82], 'bold'); y += 2;
      if (evaluation.summary) { writeLines(evaluation.summary, mx, 10, [160, 160, 165]); y += 3; }
      if (evaluation.strengths?.length) {
        writeLines('STRENGTHS', mx, 9, [107, 107, 112], 'bold'); y += 1;
        for (const s of evaluation.strengths) writeLines(`\u2022  ${s}`, mx + 4, 10, [200, 200, 204]);
        y += 3;
      }
      if (evaluation.improvements?.length) {
        writeLines('AREAS TO IMPROVE', mx, 9, [107, 107, 112], 'bold'); y += 1;
        for (const s of evaluation.improvements) writeLines(`\u2022  ${s}`, mx + 4, 10, [200, 200, 204]);
        y += 3;
      }
    }

    /* conversation */
    goldRule();
    writeLines('CONVERSATION', mx, 13, [232, 232, 235], 'bold'); y += 4;

    for (const m of messages) {
      const isUser = m.role === 'user';
      const who = isUser ? 'You' : 'HireCraft Mentor';
      const t = m.time ? new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      const content = (m.content || '').replace(/\*\*/g, '');
      ensureSpace(12);
      writeLines(`${who}  ${t}`, mx, 9, isUser ? [196, 160, 82] : [160, 160, 165], 'bold');
      writeLines(content, mx + 2, 10, [200, 200, 204]);
      y += 3;
    }

    /* footer */
    y += 4;
    subtleRule();
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 107, 112);
    doc.text('Generated by HireCraft \u2014 AI Interview Preparation Platform', pw / 2, y, { align: 'center' });

    /* direct download — no print dialog */
    doc.save(`HireCraft_Transcript_${sessionStart.toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF: ' + err.message);
    }
  };

  const handleEndInterview = async () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setShowSummary(true);
    setIsEvaluating(true);
    setEvaluation(null);
    try {
      const history = messages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: (m.content || '').replace(/\*\*/g, ''),
      }));
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chatbot/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ history }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const evalData = { score: data.score, strengths: data.strengths, improvements: data.improvements, summary: data.summary };
        setEvaluation(evalData);
        // Save session to backend
        try {
          await saveChatSession({
            messages,
            questionCount: messages.filter(m => m.role === 'user').length,
            score: data.score,
            evaluation: evalData,
            durationMinutes: Math.max(1, Math.round((Date.now() - sessionStart.getTime()) / 60000)),
            title: (messages.find(m => m.role === 'user')?.content || '').slice(0, 80) || 'Interview Session',
          });
          loadHistory();
        } catch (_) {}
      } else {
        setEvaluation({ score: null, strengths: [], improvements: [], summary: 'Could not generate evaluation. Try again later.' });
      }
    } catch {
      setEvaluation({ score: null, strengths: [], improvements: [], summary: 'Network error while evaluating. Try again later.' });
    } finally {
      setIsEvaluating(false);
    }
  };

  const renderContent = (text) => {
    if (typeof text !== 'string') return text;
    const parts = text.split(/(\*\*[\s\S]*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    if (atLimit) {
      navigate('/subscription');
      return;
    }

    const userText = input.trim();
    const history = messages.slice(1).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: (m.content || '').replace(/\*\*/g, '')
    }));

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText, time: new Date() }]);
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({ message: userText, history }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setMessages(prev => [...prev, { role: 'bot', content: data.message || 'Monthly chatbot limit reached. Please upgrade your plan.', time: new Date() }]);
          await refreshUsage();
          return;
        }
        setMessages(prev => [...prev, { role: 'bot', content: data.message || 'Error communicating with AI.', time: new Date() }]);
        return;
      }
      await refreshUsage();
      setMessages(prev => [...prev, { role: 'bot', content: data.response, time: new Date() }]);
      setIsTyping(true);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Network error. Please try again.', time: new Date() }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppLayout activePage="chatbot">
      <header style={styles.topBar}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={styles.pageTitle}>HireCraft Interview Mentor</h1>
            <p style={styles.subText}>Practical AI guidance for your next big opportunity.</p>
            {chatbotUsage && (
              <div style={{ display: 'inline-block', marginTop: 6, background: atLimit ? 'rgba(231,76,60,0.12)' : 'rgba(196,160,82,0.12)', border: `1px solid ${atLimit ? 'rgba(231,76,60,0.3)' : 'rgba(196,160,82,0.25)'}`, color: atLimit ? '#e74c3c' : '#c4a052', fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 20 }}>
                {chatbotUsage.limit === null ? '∞ Unlimited messages' : `${chatbotUsage.used} / ${chatbotUsage.limit} messages used this month`}
              </div>
            )}
          </div>
          <div style={styles.headerActions}>
            {questionCount > 0 && <span style={styles.questionBadge}>Q{questionCount}</span>}
            <button style={styles.headerBtn} onClick={handleNewInterview} title="New interview">🔄 New</button>
            {questionCount > 0 && <button style={styles.endBtn} onClick={handleEndInterview} title="End interview">⏹ End Interview</button>}
          </div>
        </div>
      </header>
      {atLimit && (
        <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', color: '#e74c3c', fontSize: 14, padding: '14px 20px', borderRadius: 12, marginBottom: 20, lineHeight: 1.6 }}>
          You've used all <strong>{chatbotUsage.limit}</strong> chatbot messages this month.&nbsp;
          <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/subscription')}>Upgrade your plan →</span>
        </div>
      )}

      {/* Tab bar */}
      <div style={styles.tabBar}>
        <button style={tab === 'chat' ? styles.tabActive : styles.tab} onClick={() => setTab('chat')}>Chat</button>
        <button style={tab === 'history' ? styles.tabActive : styles.tab} onClick={() => setTab('history')}>My History ({history.length})</button>
      </div>

      {tab === 'history' ? (
        <div className="glass-card" style={{ ...styles.chatCard, padding: '24px' }}>
          {historyLoading ? (
            <p style={{ color: '#6b6b70', textAlign: 'center', marginTop: 40 }}>Loading...</p>
          ) : history.length === 0 ? (
            <p style={{ color: '#6b6b70', textAlign: 'center', marginTop: 40 }}>No past sessions yet. Start a conversation and end it to save.</p>
          ) : (
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {history.map(h => (
                <div key={h.id} onClick={() => handleLoadSession(h.id)} style={styles.historyRow}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e8e8eb', fontSize: 14, fontWeight: 600 }}>
                      {h.title || `${h.questionCount} Questions`}
                    </div>
                    <div style={{ color: '#6b6b70', fontSize: 12, marginTop: 4 }}>
                      {h.questionCount} Qs &middot; {h.durationMinutes || '--'} min &middot; {new Date(h.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {h.score != null && (
                    <span style={{ color: h.score >= 8 ? '#4ade80' : h.score >= 5 ? '#c4a052' : '#e05555', fontWeight: 800, fontSize: 18, marginRight: 12 }}>{h.score}/10</span>
                  )}
                  <button onClick={(e) => handleExportHistoryPDF(e, h.id)} style={{ background: 'rgba(196,160,82,.12)', color: '#c4a052', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600, marginRight: 6 }} title="Download PDF">📄</button>
                  <button onClick={(e) => handleDeleteHistory(e, h.id)} style={styles.historyDeleteBtn} title="Delete">🗑</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
      <div className="glass-card" style={styles.chatCard}>
        {/* Voice controls bar */}
        <div style={styles.voiceBar}>
          {/* Voice dropdown — always fires onChange, even for same voice */}
          <select
            style={styles.voiceSelect}
            value=""
            onChange={e => {
              const uri = e.target.value;
              setSelectedVoiceURI(uri);
              speakPreview(uri);
            }}
          >
            <option value="" disabled hidden>
              {selectedVoiceName}
            </option>
            {filteredVoices.length === 0 && <option value="" disabled>Loading voices...</option>}
            {filteredVoices.map((v, i) => (
              <option key={v.voiceURI + i} value={v.voiceURI}>
                {v.voiceURI === selectedVoiceURI ? '✓ ' : '  '}{v.name} ({v.lang})
              </option>
            ))}
          </select>

          {/* Speed badge — click to open YouTube-style popup */}
          <div ref={speedMenuRef} style={{ position: 'relative' }}>
            <button
              style={styles.speedBadge}
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              title="Playback speed"
            >
              {speechRate}x
            </button>
            {showSpeedMenu && (
              <div style={styles.speedPopup}>
                <div style={styles.speedPopupTitle}>Speed</div>
                {SPEED_PRESETS.map(speed => (
                  <button
                    key={speed}
                    style={{
                      ...styles.speedPopupItem,
                      ...(speechRate === speed ? styles.speedPopupItemActive : {}),
                    }}
                    onClick={() => { setSpeechRate(speed); setShowSpeedMenu(false); }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            style={{ ...styles.voiceToggle, ...(autoSpeak ? styles.voiceToggleActive : {}) }}
            onClick={() => { setAutoSpeak(!autoSpeak); if (!autoSpeak === false) window.speechSynthesis.cancel(); }}
            title={autoSpeak ? 'Auto-read ON -- click to mute' : 'Auto-read OFF -- click to enable'}
          >
            {autoSpeak ? '🔊' : '🔇'}
            <span style={styles.voiceLabel}>{autoSpeak ? 'Voice On' : 'Voice Off'}</span>
          </button>
        </div>

        <div style={styles.messagesArea}>
          {messages.map((m, i) => {
            const isBot = m.role === 'bot';
            const isLastBotTyping = isBot && i === messages.length - 1 && isTyping;
            const msgContent = isLastBotTyping
              ? <TypeWriter text={m.content} renderFn={renderContent} onComplete={() => { setIsTyping(false); speak(m.content); }} />
              : renderContent(m.content);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isBot ? 'flex-start' : 'flex-end', marginBottom: '20px' }}>
                {/* Message bubble */}
                {isBot ? (
                  <div style={{ display: 'flex', gap: '10px', maxWidth: '85%', alignItems: 'flex-start' }}>
                    <div style={styles.avatar}>HC</div>
                    <div style={{ ...styles.bubble, ...styles.botBubble, maxWidth: 'none' }}>
                      {msgContent}
                    </div>
                  </div>
                ) : (
                  <div style={{ ...styles.bubble, ...styles.userBubble }}>
                    {msgContent}
                  </div>
                )}
                {/* Meta row: timestamp, replay, copy */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px', ...(isBot ? { marginLeft: '42px' } : {}) }}>
                  <span style={styles.tsText}>
                    {isBot ? 'Mentor' : 'You'}
                    {m.time && <span style={{ color: '#3a3a3d' }}>{' \u00B7 '}{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  </span>
                  {isBot && i > 0 && !isLastBotTyping && (
                    <button
                      style={styles.replayBtn}
                      onClick={() => {
                        window.speechSynthesis.cancel();
                        const clean = m.content.replace(/\*\*/g, '');
                        const u = new SpeechSynthesisUtterance(clean);
                        u.rate = speechRate; u.pitch = 1.0;
                        const voice = getBestVoice();
                        if (voice) u.voice = voice;
                        window.speechSynthesis.speak(u);
                      }}
                      title="Read aloud"
                    >
                      🔊
                    </button>
                  )}
                  {!isLastBotTyping && (
                    <button style={styles.copyBtn} onClick={() => handleCopy(m.content, i)} title="Copy message">
                      {copiedIdx === i ? '\u2713' : '\uD83D\uDCCB'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {isProcessing && <ThinkingDots />}
          <div ref={bottomRef} />
        </div>

        <div style={styles.inputWrapper}>
          <button
            style={{ ...styles.micBtn, ...(isListening ? styles.micBtnActive : {}) }}
            onClick={toggleListening}
            title={isListening ? 'Listening... click to stop' : 'Click to speak'}
          >
            🎤
          </button>
          <input
            style={{ ...styles.input, ...(atLimit ? { opacity: 0.4 } : {}) }}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={atLimit ? 'Monthly limit reached — upgrade to continue...' : isListening ? 'Listening...' : 'Ask an interview question...'}
            onKeyDown={e => e.key === 'Enter' && !atLimit && sendMessage()}
            disabled={atLimit}
            autoFocus
          />
          <button
            id="chatbot-send-btn"
            style={{ ...styles.maroonBtnChat, ...(atLimit ? { background: 'rgba(231,76,60,0.2)', color: '#e74c3c', cursor: 'pointer' } : {}) }}
            onClick={atLimit ? () => navigate('/subscription') : sendMessage}
          >{atLimit ? 'Upgrade' : 'Send'}</button>
        </div>
      </div>
      )}

      {/* End Interview summary modal */}
      {showSummary && (
        <div style={styles.overlay}>
          <div style={styles.summaryModal}>
            <button onClick={() => { setShowSummary(false); navigate('/dashboard'); }} style={styles.smCloseX} title="Back to Dashboard">&times;</button>
            <h2 style={styles.smTitle}>Interview Complete</h2>
            <p style={{ color: '#6b6b70', fontSize: '13px', marginBottom: '20px' }}>Great job! Here's how your session went.</p>

            {/* Score circle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {isEvaluating ? (
                <div style={styles.scoreCircle}>
                  <span style={{ ...styles.scoreNum, fontSize: '14px', color: '#86868b' }}>Evaluating...</span>
                </div>
              ) : evaluation?.score != null ? (() => {
                const sc = evaluation.score;
                const r = 40, circ = 2 * Math.PI * r;
                const off = circ - (sc / 10) * circ;
                const col = sc >= 8 ? '#4ade80' : sc >= 5 ? '#c4a052' : '#e05555';
                return (
                  <div style={{ position:'relative', width:90, height:90 }}>
                    <svg viewBox="0 0 90 90" width="90" height="90" style={{ transform:'rotate(-90deg)' }}>
                      <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                      <circle cx="45" cy="45" r={r} fill="none" stroke={col} strokeWidth="6"
                        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
                        style={{ transition:'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)' }} />
                    </svg>
                    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ ...styles.scoreNum, color: col }}>{sc}</span>
                      <span style={styles.scoreMax}>/10</span>
                    </div>
                  </div>
                );
              })() : null}
            </div>

            <div style={styles.smGrid}>
              <div style={styles.smCard}>
                <span style={styles.smNum}>{questionCount}</span>
                <span style={styles.smLabel}>Questions</span>
              </div>
              <div style={styles.smCard}>
                <span style={styles.smNum}>{sessionDuration}</span>
                <span style={styles.smLabel}>Minutes</span>
              </div>
            </div>

            {/* AI Evaluation details */}
            {isEvaluating && (
              <p style={{ color: '#86868b', fontSize: '12px', fontStyle: 'italic', marginBottom: '16px' }}>AI is evaluating your performance...</p>
            )}
            {evaluation && !isEvaluating && (
              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                {evaluation.summary && (
                  <p style={{ color: '#c8c8cc', fontSize: '13px', marginBottom: '14px', lineHeight: 1.5 }}>{evaluation.summary}</p>
                )}
                {evaluation.strengths?.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={styles.evalHeading}>Strengths</div>
                    {evaluation.strengths.map((s, i) => (
                      <div key={i} style={styles.evalItem}><span style={{ color: '#4ade80' }}>{"\u2713"}</span> {s}</div>
                    ))}
                  </div>
                )}
                {evaluation.improvements?.length > 0 && (
                  <div>
                    <div style={styles.evalHeading}>Areas to Improve</div>
                    {evaluation.improvements.map((s, i) => (
                      <div key={i} style={styles.evalItem}><span style={{ color: '#c4a052' }}>{"\u25B2"}</span> {s}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={styles.smActions}>
              <button style={styles.smCloseBtn} onClick={() => setShowSummary(false)}>Continue</button>
              <button style={styles.smPdfBtn} onClick={handleExportPDF}>📄 Download PDF</button>
              <button style={styles.smNewBtn} onClick={() => { setShowSummary(false); handleNewInterview(); }}>🔄 New Interview</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

const styles = {
  topBar: { marginBottom: '16px' },
  pageTitle: { fontSize: '2rem', fontWeight: 800, color: '#e8e8eb', letterSpacing: '-0.5px' },
  subText: { color: '#6b6b70', fontSize: '14px', marginTop: '6px' },
  tabBar: { display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' },
  tab: { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px 24px', cursor: 'pointer', color: '#6b6b70', fontSize: '14px', fontWeight: 600, fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' },
  tabActive: { background: 'none', border: 'none', borderBottom: '2px solid #c4a052', padding: '10px 24px', cursor: 'pointer', color: '#c4a052', fontSize: '14px', fontWeight: 600, fontFamily: "'Inter', sans-serif" },
  historyRow: { display: 'flex', alignItems: 'center', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', marginBottom: '8px', cursor: 'pointer', transition: 'all 0.15s' },
  historyDeleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.4, padding: '4px 8px', transition: 'opacity 0.2s' },
  chatCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', display: 'flex', flexDirection: 'column', height: '70vh', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' },
  messagesArea: { flex: 1, padding: '32px', overflowY: 'auto' },
  bubble: { padding: '14px 18px', borderRadius: '10px', maxWidth: '75%', fontSize: '14px', lineHeight: '1.65', whiteSpace: 'pre-wrap' },
  userBubble: { background: '#b89545', color: '#0a0a0b', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  botBubble: { background: '#1d1d20', color: '#e8e8eb', border: '1px solid rgba(255,255,255,0.07)' },
  headerActions: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  headerBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', color: '#86868b', fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', sans-serif", transition: 'all 0.2s', whiteSpace: 'nowrap' },
  endBtn: { background: 'rgba(220,60,60,0.10)', border: '1px solid rgba(220,60,60,0.25)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', color: '#e05555', fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', sans-serif", transition: 'all 0.2s', whiteSpace: 'nowrap' },
  questionBadge: { background: 'rgba(196,160,82,0.12)', border: '1px solid rgba(196,160,82,0.25)', color: '#c4a052', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, fontFamily: "'Inter', sans-serif" },
  avatar: { minWidth: '32px', height: '32px', background: '#c4a052', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#0a0a0b', flexShrink: 0 },
  tsText: { fontSize: '11px', color: '#555558' },
  copyBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', opacity: 0.4, padding: '0 2px', transition: 'opacity 0.2s' },
  inputWrapper: { display: 'flex', gap: '16px', padding: '20px 32px', borderTop: '1px solid rgba(255,255,255,0.07)' },
  input: { flex: 1, padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1d1d20', outline: 'none', color: '#e8e8eb', fontSize: '14px' },
  maroonBtnChat: { background: '#c4a052', color: '#0a0a0b', border: 'none', padding: '0 28px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  micBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 14px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
  micBtnActive: { background: 'rgba(196,160,82,0.15)', border: '1px solid rgba(196,160,82,0.4)', boxShadow: '0 0 12px rgba(196,160,82,0.2)' },
  voiceBar: { display: 'flex', justifyContent: 'flex-end', padding: '10px 20px 0', gap: '8px', alignItems: 'center' },
  voiceSelect: { background: '#1d1d20', color: '#e8e8eb', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontFamily: "'Inter', sans-serif", cursor: 'pointer', outline: 'none', maxWidth: '260px', appearance: 'auto' },
  speedBadge: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', color: '#c4a052', fontSize: '12px', fontWeight: 700, fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' },
  speedPopup: { position: 'absolute', bottom: '110%', right: 0, background: '#1d1d20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '6px', minWidth: '80px', zIndex: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' },
  speedPopupTitle: { fontSize: '10px', fontWeight: 700, color: '#555558', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '4px 8px 6px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  speedPopupItem: { display: 'block', width: '100%', background: 'none', border: 'none', color: '#86868b', fontSize: '12px', fontWeight: 600, padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s' },
  speedPopupItemActive: { background: 'rgba(196,160,82,0.15)', color: '#c4a052', fontWeight: 700 },
  voiceToggle: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '14px', color: '#6b6b70', transition: 'all 0.2s' },
  voiceToggleActive: { background: 'rgba(196,160,82,0.08)', border: '1px solid rgba(196,160,82,0.2)', color: '#c4a052' },
  voiceLabel: { fontSize: '12px', fontWeight: 600 },
  replayBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.5, padding: '0 2px', transition: 'opacity 0.2s' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 300 },
  summaryModal: { background: '#161618', border: '1px solid rgba(255,255,255,0.1)', padding: '36px', borderRadius: '16px', width: '500px', maxHeight: '85vh', overflowY: 'auto', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', position: 'relative' },
  smCloseX: { position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#86868b', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px', lineHeight: 1, fontFamily: 'sans-serif', transition: 'all 0.2s' },
  smTitle: { marginBottom: '24px', fontSize: '1.4rem', fontWeight: 800, color: '#e8e8eb' },
  smGrid: { display: 'flex', gap: '12px', marginBottom: '24px' },
  smCard: { flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '4px' },
  smNum: { fontSize: '1.6rem', fontWeight: 800, color: '#c4a052' },
  smLabel: { fontSize: '11px', color: '#6b6b70', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  smText: { color: '#86868b', fontSize: '13px', marginBottom: '24px', lineHeight: 1.5 },
  smActions: { display: 'flex', gap: '12px' },
  smCloseBtn: { flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#86868b', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: "'Inter', sans-serif" },
  smPdfBtn: { flex: 1, background: 'rgba(196,160,82,0.12)', border: '1px solid rgba(196,160,82,0.25)', color: '#c4a052', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: "'Inter', sans-serif" },
  smNewBtn: { flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#86868b', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: "'Inter', sans-serif" },
  scoreCircle: { width: '90px', height: '90px', borderRadius: '50%', border: '3px solid #c4a052', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0px' },
  scoreNum: { fontSize: '2rem', fontWeight: 800, lineHeight: 1 },
  scoreMax: { fontSize: '12px', color: '#6b6b70', fontWeight: 600 },
  evalHeading: { fontSize: '11px', fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' },
  evalItem: { fontSize: '13px', color: '#c8c8cc', padding: '4px 0', display: 'flex', gap: '8px', alignItems: 'flex-start', lineHeight: 1.4 },
};
