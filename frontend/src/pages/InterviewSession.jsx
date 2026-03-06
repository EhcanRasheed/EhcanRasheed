import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { SkeletonText, SkeletonLine } from '../components/Skeleton';
import * as interviewApi from '../api/interview';

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [ending, setEnding] = useState(false);
  const [answers, setAnswers] = useState({}); // { questionId: answerText }
  const [loading, setLoading] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [countdown, setCountdown] = useState(null); // null = not started, number = seconds left

  // ───────────── Voice state ─────────────
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const SPEED_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const [speechRate, setSpeechRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const speedMenuRef = useRef(null);
  const pendingTranscriptRef = useRef('');
  const baseAnswerRef = useRef(''); // answer text BEFORE mic started
  const wasListeningRef = useRef(false);
  const latestAnswerRef = useRef('');
  useEffect(() => { latestAnswerRef.current = answer; }, [answer]);

  // ───────────── Speech Recognition setup ─────────────
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
      const spoken = (final + interim).trim();
      pendingTranscriptRef.current = spoken;
      // Use the frozen base from when mic started
      const base = baseAnswerRef.current;
      if (spoken) {
        setAnswer(base ? base + '\n' + spoken : spoken);
      } else {
        setAnswer(base);
      }

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        recognition.stop();
      }, 3000); // 3s silence = stop (longer than chatbot since answers are longer)
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      pendingTranscriptRef.current = '';
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

  // Auto-save & advance when mic turns off
  useEffect(() => {
    if (wasListeningRef.current && !isListening && latestAnswerRef.current.trim()) {
      goNext();
    }
    wasListeningRef.current = isListening;
  }, [isListening]);

  // Cancel speech on unmount / page refresh
  useEffect(() => {
    const stopSpeech = () => window.speechSynthesis.cancel();
    window.addEventListener('beforeunload', stopSpeech);
    return () => { stopSpeech(); window.removeEventListener('beforeunload', stopSpeech); };
  }, []);

  // Pause speech when tab becomes hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        window.speechSynthesis.cancel();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Close speed menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target)) setShowSpeedMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ───────────── Voice helpers ─────────────
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
    for (const test of ranked) { const match = voices.find(test); if (match) return match; }
    return voices[0] || null;
  };

  const speakText = (text, autoListenAfter = false) => {
    if (!autoSpeak) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\*\*/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    const voice = getBestVoice();
    if (voice) utterance.voice = voice;
    if (autoListenAfter) {
      utterance.onend = () => {
        setTimeout(() => startListening(), 500);
      };
    }
    window.speechSynthesis.speak(utterance);
  };

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
  const selectedVoiceName = availableVoices.find(v => v.voiceURI === selectedVoiceURI)?.name || 'Select voice...';

  const startListening = () => {
    if (!recognitionRef.current) return;
    window.speechSynthesis.cancel();
    pendingTranscriptRef.current = '';
    // Freeze current answer as the base before mic starts
    baseAnswerRef.current = document.querySelector('textarea')?.value || '';
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (_) {}
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    window.speechSynthesis.cancel();
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      startListening();
    }
  };

  // Auto-read question when it changes (only after countdown finishes)
  useEffect(() => {
    if (countdown !== null && countdown > 0) return;
    if (questions.length > 0 && questions[currentIdx]) {
      const q = questions[currentIdx];
      speakText(`Question ${currentIdx + 1}. ${q.text}`, true);
    }
  }, [currentIdx, questions.length, autoSpeak, countdown]);

  // ───────────── Original session logic ─────────────

  useEffect(() => { loadQuestions(); }, [sessionId]);

  const loadQuestions = async () => {
    try {
      const data = await interviewApi.getSessionQuestions(sessionId);
      setQuestions(data);
      setCountdown(5); // Start 5-second countdown
    } catch (e) {
      alert('Failed to load questions');
      navigate('/interview');
    }
    setLoading(false);
  };

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const currentQ = questions[currentIdx];

  const handleSaveAnswer = async () => {
    if (!answer.trim() || !currentQ) return;
    setSaving(true);
    try {
      await interviewApi.submitAnswer(sessionId, currentQ.id, answer, currentIdx + 1);
      setAnswers((prev) => ({ ...prev, [currentQ.id]: answer }));
    } catch (e) { console.error('Failed to save answer:', e); }
    setSaving(false);
  };

  const goNext = async () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
    if (answer.trim()) await handleSaveAnswer();
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setAnswer(answers[questions[nextIdx].id] || '');
    }
  };

  const goPrev = () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      setAnswer(answers[questions[prevIdx].id] || '');
    }
  };

  const handleEnd = async () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
    if (answer.trim()) await handleSaveAnswer();
    setEnding(true);
    try {
      const result = await interviewApi.endSession(sessionId);
      navigate(`/interview/result/${sessionId}`, { state: result });
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to end session');
    }
    setEnding(false);
  };

  const jumpTo = (idx) => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
    if (answer.trim() && currentQ) handleSaveAnswer();
    setCurrentIdx(idx);
    setAnswer(answers[questions[idx].id] || '');
  };

  if (loading) return <AppLayout activePage="interview"><div style={{ padding: 40 }}><SkeletonLine width="60%" height={20} style={{ marginBottom: 16 }} /><SkeletonText lines={4} /><SkeletonLine width="100%" height={120} style={{ marginTop: 20 }} /></div></AppLayout>;

  if (countdown > 0) {
    return (
      <AppLayout activePage="interview">
        <div style={s.countdownWrap}>
          <p style={s.countdownLabel}>Your interview starts in</p>
          <div style={s.countdownCircle}>
            <span style={s.countdownNum}>{countdown}</span>
          </div>
          <p style={s.countdownHint}>Get ready — questions will appear automatically</p>
        </div>
      </AppLayout>
    );
  }

  const progress = Object.keys(answers).length;
  const total = questions.length;

  return (
    <AppLayout activePage="interview">
      {/* Voice Controls Bar */}
      <div style={s.voiceBar}>
        <button
          style={{ ...s.voiceToggle, ...(autoSpeak ? s.voiceToggleActive : {}) }}
          onClick={() => { setAutoSpeak(!autoSpeak); if (autoSpeak) window.speechSynthesis.cancel(); }}
          title={autoSpeak ? 'Voice On — click to mute' : 'Voice Off — click to enable'}
        >
          {autoSpeak ? '🔊' : '🔇'}
        </button>

        <button
          style={s.voiceSettingsBtn}
          onClick={() => setShowVoicePanel(!showVoicePanel)}
          title="Voice settings"
        >
          ⚙️ Voice
        </button>

        <div ref={speedMenuRef} style={{ position: 'relative' }}>
          <button style={s.speedBadge} onClick={() => setShowSpeedMenu(!showSpeedMenu)} title="Speed">
            {speechRate}x
          </button>
          {showSpeedMenu && (
            <div style={s.speedPopup}>
              <div style={s.speedPopupTitle}>Speed</div>
              {SPEED_PRESETS.map(speed => (
                <button
                  key={speed}
                  style={{ ...s.speedPopupItem, ...(speechRate === speed ? s.speedPopupItemActive : {}) }}
                  onClick={() => { setSpeechRate(speed); setShowSpeedMenu(false); }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          style={{ ...s.micBtn, ...(isListening ? s.micBtnActive : {}) }}
          onClick={toggleListening}
          title={isListening ? 'Listening… click to stop' : 'Click to speak your answer'}
        >
          🎤 {isListening ? 'Listening…' : 'Speak'}
        </button>
      </div>

      {/* Voice Settings Panel (collapsible) */}
      {showVoicePanel && (
        <div style={s.voicePanel}>
          <select
            style={s.voiceSelect}
            value=""
            onChange={e => { const uri = e.target.value; setSelectedVoiceURI(uri); speakPreview(uri); }}
          >
            <option value="" disabled hidden>{selectedVoiceName}</option>
            {filteredVoices.length === 0 && <option value="" disabled>Loading voices…</option>}
            {filteredVoices.map((v, i) => (
              <option key={v.voiceURI + i} value={v.voiceURI}>
                {v.voiceURI === selectedVoiceURI ? '✓ ' : '  '}{v.name} ({v.lang})
              </option>
            ))}
          </select>
          <span style={s.voicePanelHint}>Questions are read aloud automatically. Speak into your mic to answer.</span>
        </div>
      )}

      {/* Progress Bar */}
      <div style={s.progressWrap}>
        <div style={{ ...s.progressBar, width: `${(progress / total) * 100}%` }} />
      </div>
      <div style={s.progressText}>{progress}/{total} answered</div>

      {/* Question Tracker */}
      <div style={s.tracker}>
        {questions.map((q, i) => (
          <div
            key={q.id}
            style={{
              ...s.trackerDot,
              background: i === currentIdx ? '#c4a052' : answers[q.id] ? '#28a745' : '#23232a',
              color: i === currentIdx ? '#0a0a0b' : answers[q.id] ? '#fff' : '#6b6b70',
            }}
            onClick={() => jumpTo(i)}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Current Question */}
      {currentQ && (
        <div style={s.questionCard}>
          <div style={s.qHeader}>
            <span style={s.qBadge}>{currentQ.category}{currentQ.subcategory ? ` / ${currentQ.subcategory}` : ''}</span>
            <span style={s.qDiffBadge(currentQ.difficulty)}>{currentQ.difficulty}</span>
            <button
              style={s.replayBtn}
              onClick={() => speakText(`Question ${currentIdx + 1}. ${currentQ.text}`, true)}
              title="Read question aloud"
            >
              🔊 Read
            </button>
          </div>
          <h2 style={s.qText}>Q{currentIdx + 1}. {currentQ.text}</h2>

          {/* Listening indicator */}
          {isListening && (
            <div style={s.listeningBar}>
              <span style={s.listeningDot} />
              <span style={s.listeningText}>Listening… speak your answer</span>
              <button style={s.stopListenBtn} onClick={() => recognitionRef.current?.stop()}>Stop</button>
            </div>
          )}

          <textarea
            style={s.textarea}
            rows={8}
            placeholder={isListening ? '🎤 Listening… speak your answer' : 'Type your answer here or click 🎤 Speak…'}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          <div style={s.navRow}>
            <button style={s.navBtn} onClick={goPrev} disabled={currentIdx === 0}>← Previous</button>
            <div style={s.navCenter}>
              {currentIdx < total - 1 && (
                <button style={s.nextBtn} onClick={goNext}>
                  {saving ? 'Saving…' : 'Next →'}
                </button>
              )}
              <button style={s.endBtn} onClick={() => setShowEndConfirm(true)} disabled={ending}>
                {ending ? 'Submitting…' : 'End Interview'}
              </button>
            </div>
            <span style={s.counter}>{currentIdx + 1} / {total}</span>
          </div>
        </div>
      )}

      {/* End Confirm Modal */}
      {showEndConfirm && (() => {
        const answeredCount = new Set([
          ...Object.keys(answers),
          ...(answer.trim() && currentQ ? [currentQ.id] : []),
        ]).size;
        const unanswered = total - answeredCount;
        return (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>End Interview?</h3>
            <p style={s.modalBody}>
              You have answered {answeredCount} out of {total} questions.
              {unanswered > 0 && ` ${unanswered} unanswered questions will be skipped.`}
              <br /><br />
              Your answers will be sent for AI evaluation. This action cannot be undone.
            </p>
            <div style={s.modalActions}>
              <button style={s.endBtn} onClick={handleEnd} disabled={ending}>
                {ending ? 'Submitting…' : 'Yes, End Interview'}
              </button>
              <button style={s.cancelBtn} onClick={() => setShowEndConfirm(false)}>Go Back</button>
            </div>
          </div>
        </div>
        );
      })()}
    </AppLayout>
  );
}

const s = {
  // Countdown
  countdownWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24 },
  countdownLabel: { color: '#6b6b70', fontSize: 16, fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: 1 },
  countdownCircle: { width: 140, height: 140, borderRadius: '50%', background: 'rgba(196,160,82,0.10)', border: '3px solid #c4a052', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  countdownNum: { fontSize: 64, fontWeight: 900, color: '#c4a052' },
  countdownHint: { color: '#6b6b70', fontSize: 13, margin: 0 },
  // Voice controls
  voiceBar: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap', background: '#161618', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 16px' },
  voiceToggle: { background: '#23232a', border: '1px solid rgba(255,255,255,0.08)', color: '#6b6b70', padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' },
  voiceToggleActive: { background: '#c4a05220', borderColor: '#c4a052', color: '#c4a052' },
  voiceSettingsBtn: { background: '#23232a', border: '1px solid rgba(255,255,255,0.08)', color: '#6b6b70', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  speedBadge: { background: '#c4a05220', color: '#c4a052', border: 'none', padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 },
  speedPopup: { position: 'absolute', bottom: '110%', left: 0, background: '#1e1e20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 8, minWidth: 80, zIndex: 100 },
  speedPopupTitle: { color: '#6b6b70', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, padding: '2px 8px 6px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 4 },
  speedPopupItem: { display: 'block', width: '100%', background: 'transparent', border: 'none', color: '#c8c8cc', padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 13, textAlign: 'left' },
  speedPopupItemActive: { background: '#c4a05225', color: '#c4a052', fontWeight: 700 },
  micBtn: { background: '#23232a', border: '1px solid rgba(255,255,255,0.08)', color: '#6b6b70', padding: '5px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', transition: 'all 0.15s' },
  micBtnActive: { background: '#dc354520', borderColor: '#dc3545', color: '#dc3545', animation: 'none' },
  voicePanel: { background: '#0e0e10', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  voiceSelect: { background: '#161618', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#c8c8cc', padding: '6px 10px', fontSize: 12, cursor: 'pointer', maxWidth: 320 },
  voicePanelHint: { color: '#6b6b70', fontSize: 11 },
  replayBtn: { background: '#23232a', border: '1px solid rgba(255,255,255,0.08)', color: '#c4a052', padding: '3px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, marginLeft: 'auto' },
  listeningBar: { display: 'flex', alignItems: 'center', gap: 10, background: '#dc354510', border: '1px solid #dc354530', borderRadius: 8, padding: '8px 14px', marginBottom: 12 },
  listeningDot: { width: 10, height: 10, borderRadius: '50%', background: '#dc3545', animation: 'pulse 1.2s infinite', flexShrink: 0 },
  listeningText: { color: '#dc3545', fontSize: 13, fontWeight: 600 },
  stopListenBtn: { background: '#dc354520', border: '1px solid #dc354540', color: '#dc3545', padding: '3px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, marginLeft: 'auto' },
  // Original styles
  progressWrap: { height: 4, background: '#23232a', borderRadius: 2, marginBottom: 6 },
  progressBar: { height: '100%', background: '#c4a052', borderRadius: 2, transition: 'width 0.3s' },
  progressText: { color: '#6b6b70', fontSize: 12, textAlign: 'right', marginBottom: 20 },
  tracker: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 },
  trackerDot: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.08)' },
  questionCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '32px 28px' },
  qHeader: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' },
  qBadge: { background: '#c4a05220', color: '#c4a052', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8 },
  qDiffBadge: (diff) => {
    const color = diff === 'easy' ? '#4ade80' : diff === 'hard' ? '#f87171' : '#c4a052';
    return { color, background: `${color}18`, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, textTransform: 'capitalize' };
  },
  qText: { fontSize: 18, fontWeight: 700, color: '#e8e8eb', lineHeight: 1.5, margin: '0 0 20px' },
  textarea: { width: '100%', background: '#0e0e10', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e8eb', borderRadius: 10, padding: '14px 16px', fontSize: 14, lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, position: 'sticky', bottom: 0, background: '#161618', padding: '16px 0 4px', zIndex: 10 },
  navCenter: { display: 'flex', gap: 10 },
  navBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#c8c8cc', padding: '9px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  nextBtn: { background: '#c4a052', color: '#0a0a0b', border: 'none', padding: '9px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  endBtn: { background: '#dc3545', color: '#fff', border: 'none', padding: '9px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  cancelBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#c8c8cc', padding: '9px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  counter: { color: '#6b6b70', fontSize: 13, fontWeight: 600 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#1a1a1d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '32px 28px', maxWidth: 440, width: '90%' },
  modalTitle: { color: '#e8e8eb', fontSize: 18, fontWeight: 800, margin: '0 0 12px' },
  modalBody: { color: '#6b6b70', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' },
  modalActions: { display: 'flex', gap: 10 },
};
