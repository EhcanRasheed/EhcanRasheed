import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getCandidateQuestions, submitCandidateAnswer, endCandidateInterview } from '../api/hiring';
import { SkeletonLine, SkeletonText } from '../components/Skeleton';

export default function CandidateInterview() {
  const { sessionId, candidateId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ending, setEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [preStartTimer, setPreStartTimer] = useState(5);

  // ── Voice state ──
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const SPEED_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const [speechRate, setSpeechRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const speedMenuRef = useRef(null);
  const wasListeningRef = useRef(false);
  const latestAnswerRef = useRef(answer);
  useEffect(() => { latestAnswerRef.current = answer; }, [answer]);
  const finalTranscriptRef = useRef('');
  const baseAnswerRef = useRef('');

  // ── Load questions ──
  useEffect(() => {
    getCandidateQuestions(sessionId, candidateId)
      .then((data) => {
        const qs = Array.isArray(data) ? data : data.questions || [];
        setQuestions(qs);
        if (data.savedAnswers) setAnswers(data.savedAnswers);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load questions');
        navigate(`/hire/${sessionId}`);
      })
      .finally(() => setLoading(false));
  }, [sessionId, candidateId]);

  // ── Pre-start countdown ──
  useEffect(() => {
    if (isStarted || loading) return;
    if (preStartTimer > 0) {
      const t = setTimeout(() => setPreStartTimer(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
    setIsStarted(true);
  }, [preStartTimer, isStarted, loading]);

  // ── Timer ──
  useEffect(() => {
    if (!isStarted) return;
    const interval = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isStarted]);

  // ── Speech Recognition setup ──
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscriptRef.current += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      const spoken = (finalTranscriptRef.current + interim).trim();
      const base = baseAnswerRef.current;
      setAnswer(base ? base + '\n' + spoken : spoken);

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => recognition.stop(), 3000);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
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

  // Cancel speech on unmount
  useEffect(() => {
    const stopSpeech = () => window.speechSynthesis.cancel();
    window.addEventListener('beforeunload', stopSpeech);
    return () => { stopSpeech(); window.removeEventListener('beforeunload', stopSpeech); };
  }, []);

  // Auto-submit when mic turns off
  useEffect(() => {
    if (wasListeningRef.current && !isListening) {
      if (latestAnswerRef.current.trim()) {
        handleSaveAndNext();
      }
    }
    wasListeningRef.current = isListening;
  }, [isListening]);

  // Close speed menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target)) setShowSpeedMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Voice helpers ──
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
      utterance.onend = () => setTimeout(() => startListening(), 500);
    }
    window.speechSynthesis.speak(utterance);
  };

  const speakPreview = (voiceURI) => {
    window.speechSynthesis.cancel();
    const v = availableVoices.find(v => v.voiceURI === voiceURI);
    if (v) {
      const u = new SpeechSynthesisUtterance('Hello, welcome to the interview.');
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

  // Auto-read question when it changes
  useEffect(() => {
    if (questions.length > 0 && questions[currentIdx] && isStarted) {
      const q = questions[currentIdx];
      speakText(`Question ${currentIdx + 1}. ${q.text || q.question || q.questionText}`, true);
    }
  }, [currentIdx, questions.length, autoSpeak, isStarted]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    window.speechSynthesis.cancel();
    finalTranscriptRef.current = '';
    baseAnswerRef.current = answer;
    try { recognitionRef.current.start(); setIsListening(true); } catch (_) {}
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

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const currentQ = questions[currentIdx];

  const handleSaveAndNext = async () => {
    if (!answer.trim() && !answers[currentIdx]) return;
    window.speechSynthesis.cancel();
    if (recognitionRef.current && isListening) recognitionRef.current.stop();

    setSaving(true);
    try {
      await submitCandidateAnswer(sessionId, candidateId, {
        questionId: currentQ?.id || `q-${currentIdx}`,
        questionText: currentQ?.text || currentQ?.question || '',
        answerText: answer.trim(),
        difficulty: currentQ?.difficulty,
        questionOrder: currentIdx + 1,
      });
      setAnswers(prev => ({ ...prev, [currentIdx]: answer.trim() }));

      if (currentIdx < questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setAnswer(answers[currentIdx + 1] || '');
      } else {
        setShowEndConfirm(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save answer');
    } finally {
      setSaving(false);
    }
  };

  const handlePrev = () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
    if (currentIdx > 0) {
      if (answer.trim()) setAnswers(prev => ({ ...prev, [currentIdx]: answer.trim() }));
      setCurrentIdx(currentIdx - 1);
      setAnswer(answers[currentIdx - 1] || '');
    }
  };

  const jumpTo = (idx) => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
    if (answer.trim()) setAnswers(prev => ({ ...prev, [currentIdx]: answer.trim() }));
    setCurrentIdx(idx);
    setAnswer(answers[idx] || '');
  };

  const handleEndInterview = async () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
    setEnding(true);
    try {
      if (answer.trim() && !answers[currentIdx]) {
        await submitCandidateAnswer(sessionId, candidateId, {
          questionId: currentQ?.id || `q-${currentIdx}`,
          questionText: currentQ?.text || currentQ?.question || '',
          answerText: answer.trim(),
          difficulty: currentQ?.difficulty,
          questionOrder: currentIdx + 1,
        });
      }
      await endCandidateInterview(sessionId, candidateId);
      navigate(`/hire/${sessionId}/complete`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to end interview');
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return <div style={st.page}><div style={st.centerFull}><SkeletonLine width="50%" height={24} /><div style={{ marginTop: 16 }}><SkeletonText lines={4} /></div></div></div>;
  }

  if (!isStarted) {
    return (
      <div style={st.page}>
        <div style={st.centerFull}>
          <div style={st.countdownCard}>
            <div style={st.logo}>HC</div>
            <h2 style={{ color: '#e8e8eb', fontSize: 20, margin: '0 0 8px' }}>Get Ready</h2>
            <p style={{ color: '#6b6b70', fontSize: 13, margin: '0 0 20px' }}>Your interview will begin in</p>
            <div style={{ fontSize: 64, fontWeight: 900, color: '#c4a052' }}>{preStartTimer}</div>
            <p style={{ color: '#555558', fontSize: 12, marginTop: 16 }}>{questions.length} questions · Type or speak your answers</p>
          </div>
        </div>
      </div>
    );
  }

  if (showEndConfirm) {
    const answeredCount = new Set([...Object.keys(answers).map(Number), ...(answer.trim() ? [currentIdx] : [])]).size;
    const unanswered = questions.length - answeredCount;
    return (
      <div style={st.page}>
        <div style={st.centerFull}>
          <div style={st.endCard}>
            <h2 style={{ color: '#e8e8eb', fontSize: 20, margin: '0 0 8px' }}>Submit Interview?</h2>
            <p style={{ color: '#6b6b70', fontSize: 14, lineHeight: 1.6, margin: '0 0 6px' }}>
              You have answered <strong style={{ color: '#c4a052' }}>{answeredCount}</strong> of {questions.length} questions.
              {unanswered > 0 && ` ${unanswered} unanswered questions will be skipped.`}
            </p>
            <p style={{ color: '#555558', fontSize: 13, margin: '0 0 24px' }}>
              Once submitted, your answers and resume will be evaluated by AI. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={st.secondaryBtn} onClick={() => setShowEndConfirm(false)}>Go Back</button>
              <button style={{ ...st.submitBtn, opacity: ending ? 0.5 : 1 }} onClick={handleEndInterview} disabled={ending}>
                {ending ? 'Submitting...' : 'Submit Interview'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = Object.keys(answers).length;

  return (
    <div style={st.page}>
      <div style={st.mainContainer}>
        {/* Top Bar */}
        <div style={st.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={st.logoSmall}>HC</div>
            <span style={{ color: '#6b6b70', fontSize: 13 }}>AI Interview</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#86868b', fontSize: 13, fontFamily: 'monospace' }}>{formatTime(timeElapsed)}</span>
            <span style={{ color: '#6b6b70', fontSize: 12 }}>{progress}/{questions.length} answered</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={st.progressBar}>
          <div style={{ ...st.progressFill, width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
        </div>

        {/* Question Tracker Dots */}
        <div style={st.tracker}>
          {questions.map((q, i) => (
            <div
              key={i}
              style={{
                ...st.trackerDot,
                background: i === currentIdx ? '#c4a052' : answers[i] ? '#2f8a5a' : '#23232a',
                color: i === currentIdx ? '#0a0a0b' : answers[i] ? '#fff' : '#6b6b70',
              }}
              onClick={() => jumpTo(i)}
              title={`Question ${i + 1}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Question Card */}
        {currentQ && (
          <div style={st.questionCard}>
            {/* Voice Controls Bar */}
            <div style={st.voiceBar}>
              <button
                style={{ ...st.voiceToggle, ...(autoSpeak ? st.voiceToggleActive : {}) }}
                onClick={() => { setAutoSpeak(!autoSpeak); if (autoSpeak) window.speechSynthesis.cancel(); }}
                title={autoSpeak ? 'Voice On — click to mute' : 'Voice Off — click to enable'}
              >
                {autoSpeak ? '\uD83D\uDD0A' : '\uD83D\uDD07'}
              </button>

              <select
                style={st.voiceSelect}
                value={selectedVoiceURI || ''}
                onChange={e => { const uri = e.target.value; setSelectedVoiceURI(uri); speakPreview(uri); }}
                title="Voice Selection"
              >
                {filteredVoices.length === 0 && <option value="" disabled>Loading voices...</option>}
                <option value="" disabled hidden>{selectedVoiceName}</option>
                {filteredVoices.map((v, i) => (
                  <option key={v.voiceURI + i} value={v.voiceURI}>{v.name} ({v.lang})</option>
                ))}
              </select>

              <div ref={speedMenuRef} style={{ position: 'relative' }}>
                <button style={st.speedBadge} onClick={() => setShowSpeedMenu(!showSpeedMenu)} title="Speed">
                  {speechRate}x
                </button>
                {showSpeedMenu && (
                  <div style={st.speedPopup}>
                    <div style={st.speedPopupTitle}>Speed</div>
                    {SPEED_PRESETS.map(speed => (
                      <button
                        key={speed}
                        style={{ ...st.speedPopupItem, ...(speechRate === speed ? st.speedPopupItemActive : {}) }}
                        onClick={() => { setSpeechRate(speed); setShowSpeedMenu(false); }}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                style={{ ...st.micBtnBar, ...(isListening ? st.micBtnBarActive : {}) }}
                onClick={toggleListening}
                title={isListening ? 'Listening… click to stop' : 'Click to speak your answer'}
              >
                🎤 {isListening ? 'Listening…' : 'Speak'}
              </button>
            </div>

            {/* Question Header */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              {currentQ.category && <span style={st.catBadge}>{currentQ.category}{currentQ.subcategory ? ` / ${currentQ.subcategory}` : ''}</span>}
              {currentQ.difficulty && (
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: currentQ.difficulty === 'easy' ? '#2f8a5a' : currentQ.difficulty === 'hard' ? '#dc4a4a' : '#c4a052' }}>
                  {currentQ.difficulty}
                </span>
              )}
            </div>
            <h2 style={st.questionText}>Q{currentIdx + 1}. {currentQ.text || currentQ.question || currentQ.questionText || 'Question'}</h2>

            {/* Listening indicator */}
            {isListening && (
              <div style={st.listeningBar}>
                <span style={st.listeningDot} />
                <span style={{ color: '#dc3545', fontSize: 13, fontWeight: 600 }}>Listening… speak your answer</span>
                <button style={st.stopListenBtn} onClick={() => recognitionRef.current?.stop()}>Stop</button>
              </div>
            )}

            {/* Multiple Choice Options */}
            {currentQ.options && currentQ.options.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: answer === opt ? 'rgba(196,160,82,0.08)' : '#0e0e10',
                      border: answer === opt ? '1px solid rgba(196,160,82,0.4)' : '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, padding: '14px 18px', fontSize: 14, color: '#e8e8eb', cursor: 'pointer', textAlign: 'left',
                    }}
                    onClick={() => setAnswer(opt)}
                  >
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#c4a052', flexShrink: 0 }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Text Answer */}
            <textarea
                ref={textareaRef}
              style={st.textarea}
              rows={8}
              placeholder={isListening ? '🎤 Listening… speak your answer' : 'Type your answer here or click 🎤 Speak…'}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />

            {/* Navigation */}
            <div style={st.navRow}>
              <button style={st.navBtn} onClick={handlePrev} disabled={currentIdx === 0}>← Previous</button>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  style={{ ...st.nextBtn, opacity: saving ? 0.5 : 1 }}
                  onClick={handleSaveAndNext}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : currentIdx < questions.length - 1 ? 'Save & Next →' : 'Finish & Review'}
                </button>
                <button style={st.endEarlyBtn} onClick={() => setShowEndConfirm(true)}>
                  End Interview
                </button>
              </div>
              <span style={{ color: '#6b6b70', fontSize: 13, fontWeight: 600 }}>{currentIdx + 1} / {questions.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const st = {
  page: { minHeight: '100vh', background: '#0a0a0b', color: '#e8e8eb', fontFamily: "'Inter', sans-serif", display: 'flex', justifyContent: 'center' },
  centerFull: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24, width: '100%' },
  mainContainer: { maxWidth: 900, width: '100%', padding: '24px 28px' },

  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logo: { width: 44, height: 44, background: '#c4a052', color: '#0a0a0b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 800, fontSize: 18 },
  logoSmall: { width: 32, height: 32, background: '#c4a052', color: '#0a0a0b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 },

  progressBar: { height: 4, background: '#1d1d20', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', background: '#c4a052', borderRadius: 3, transition: 'width 0.4s' },

  tracker: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 },
  trackerDot: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.08)' },

  questionCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '32px 28px' },

  // Voice controls
  voiceBar: { display: 'flex', justifyContent: 'flex-end', padding: '0 0 16px', gap: 8, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 16 },
  voiceToggle: { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 14, color: '#6b6b70', transition: 'all 0.2s' },
  voiceToggleActive: { background: 'rgba(196,160,82,0.08)', border: '1px solid rgba(196,160,82,0.2)', color: '#c4a052' },
  voiceSelect: { background: '#1d1d20', color: '#e8e8eb', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontFamily: "'Inter', sans-serif", cursor: 'pointer', outline: 'none', maxWidth: 200 },
  speedBadge: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: '#c4a052', fontSize: 12, fontWeight: 700, fontFamily: "'Inter', sans-serif" },
  speedPopup: { position: 'absolute', bottom: '110%', left: 0, background: '#1d1d20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 6, minWidth: 80, zIndex: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' },
  speedPopupTitle: { fontSize: 10, fontWeight: 700, color: '#555558', textTransform: 'uppercase', letterSpacing: 0.8, padding: '4px 8px 6px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  speedPopupItem: { display: 'block', width: '100%', background: 'none', border: 'none', color: '#86868b', fontSize: 12, fontWeight: 600, padding: '7px 10px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontFamily: "'Inter', sans-serif" },
  speedPopupItemActive: { background: 'rgba(196,160,82,0.15)', color: '#c4a052', fontWeight: 700 },
  micBtnBar: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '6px 16px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#e8e8eb', fontWeight: 600, marginLeft: 'auto', transition: 'all 0.2s' },
  micBtnBarActive: { background: 'rgba(196,160,82,0.15)', border: '1px solid rgba(196,160,82,0.4)', boxShadow: '0 0 12px rgba(196,160,82,0.2)' },

  catBadge: { background: 'rgba(196,160,82,0.12)', color: '#c4a052', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8 },
  questionText: { fontSize: 18, fontWeight: 700, color: '#e8e8eb', lineHeight: 1.5, margin: '0 0 20px' },

  listeningBar: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(220,53,69,0.08)', border: '1px solid rgba(220,53,69,0.2)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 },
  listeningDot: { width: 10, height: 10, borderRadius: '50%', background: '#dc3545', display: 'inline-block', animation: 'pulse 1.2s infinite', flexShrink: 0 },
  stopListenBtn: { background: 'rgba(220,53,69,0.15)', border: '1px solid rgba(220,53,69,0.3)', color: '#dc3545', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, marginLeft: 'auto' },

  textarea: { width: '100%', background: '#0e0e10', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e8eb', borderRadius: 10, padding: '14px 16px', fontSize: 14, lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 20 },

  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', bottom: 0, background: '#161618', padding: '16px 0 4px', zIndex: 10 },
  navBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#c8c8cc', padding: '10px 22px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  nextBtn: { background: '#c4a052', color: '#0a0a0b', border: 'none', padding: '10px 26px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  endEarlyBtn: { background: '#dc3545', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },

  // Countdown & End confirm
  countdownCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '40px 48px', textAlign: 'center' },
  endCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '36px 32px', maxWidth: 440, width: '100%', textAlign: 'center' },
  secondaryBtn: { background: 'transparent', color: '#6b6b70', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', flex: 1 },
  submitBtn: { background: '#c4a052', color: '#0a0a0b', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', flex: 1 },
};
