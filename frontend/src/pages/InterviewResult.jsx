import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import AppLayout from '../components/AppLayout';
import * as interviewApi from '../api/interview';

export default function InterviewResult() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);

  // Feedback state
  const [fbRating, setFbRating] = useState(0);
  const [fbHover, setFbHover] = useState(0);
  const [fbComment, setFbComment] = useState('');
  const [fbSubmitted, setFbSubmitted] = useState(false);
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbMsg, setFbMsg] = useState('');

  useEffect(() => {
    if (!data) {
      interviewApi.getSessionDetail(sessionId)
        .then((d) => setData(d))
        .catch(() => navigate('/interview'))
        .finally(() => setLoading(false));
    }
  }, [sessionId, data, navigate]);

  const handleFeedbackSubmit = async () => {
    if (fbRating === 0) { setFbMsg('Please select a rating'); return; }
    const bankId = data?.transcript?.bankId || data?.bankId;
    if (!bankId) { setFbMsg('Unable to identify the bank'); return; }
    setFbSubmitting(true);
    try {
      await interviewApi.submitBankFeedback(bankId, { rating: fbRating, comment: fbComment.trim() || undefined });
      setFbSubmitted(true);
      setFbMsg('Thank you for your feedback!');
    } catch (err) {
      setFbMsg(err.response?.data?.message || 'Failed to submit feedback');
    }
    setFbSubmitting(false);
  };

  const downloadTranscript = () => {
    try {
    const transcript = data.transcript;
    const evaluation = data.evaluation;
    if (!transcript) return;

    const bankName = data.bankName || transcript?.bank || 'Interview';
    const dateStr = new Date(data.endedAt || data.createdAt || Date.now()).toLocaleDateString();
    const timeStr = new Date(data.endedAt || data.createdAt || Date.now()).toLocaleTimeString();
    const questions = evaluation?.perQuestion || transcript?.questions || [];

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
      doc.setDrawColor(196, 160, 82); doc.setLineWidth(0.4);
      doc.line(mx, y, pw - mx, y); y += 5;
    };
    const subtleRule = () => {
      ensureSpace(6);
      doc.setDrawColor(50, 50, 55); doc.setLineWidth(0.2);
      doc.line(mx, y, pw - mx, y); y += 4;
    };

    drawBg();
    y = mx + 6;

    /* title */
    doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(232, 232, 235);
    doc.text('HireCraft Interview Transcript', pw / 2, y, { align: 'center' });
    y += 7;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 107, 112);
    doc.text(`${bankName} \u2014 ${dateStr} at ${timeStr}`, pw / 2, y, { align: 'center' });
    y += 6;
    goldRule();

    /* stats */
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(196, 160, 82);
    const statsText = `${questions.length} Questions` + (evaluation?.overallScore != null ? `   \u2022   Score: ${Number(evaluation.overallScore).toFixed(1)} / 100` : '');
    doc.text(statsText, pw / 2, y, { align: 'center' });
    y += 10;

    /* evaluation */
    if (evaluation) {
      goldRule();
      writeLines('PERFORMANCE EVALUATION', mx, 13, [232, 232, 235], 'bold'); y += 2;
      if (evaluation.overallScore != null) { writeLines(`Score: ${Number(evaluation.overallScore).toFixed(1)} / 100`, mx, 16, [196, 160, 82], 'bold'); y += 2; }
      if (evaluation.summary) { writeLines(evaluation.summary, mx, 10, [160, 160, 165]); y += 3; }
      if (evaluation.strengths?.length) {
        writeLines('STRENGTHS', mx, 9, [107, 107, 112], 'bold'); y += 1;
        for (const s2 of evaluation.strengths) writeLines(`\u2022  ${s2}`, mx + 4, 10, [200, 200, 204]);
        y += 3;
      }
      if (evaluation.weaknesses?.length) {
        writeLines('AREAS TO IMPROVE', mx, 9, [107, 107, 112], 'bold'); y += 1;
        for (const s2 of evaluation.weaknesses) writeLines(`\u2022  ${s2}`, mx + 4, 10, [200, 200, 204]);
        y += 3;
      }
      if (evaluation.recommendations?.length) {
        writeLines('RECOMMENDATIONS', mx, 9, [107, 107, 112], 'bold'); y += 1;
        for (const s2 of evaluation.recommendations) writeLines(`\u2022  ${s2}`, mx + 4, 10, [200, 200, 204]);
        y += 3;
      }
    }

    /* questions */
    goldRule();
    writeLines('QUESTION-BY-QUESTION BREAKDOWN', mx, 13, [232, 232, 235], 'bold'); y += 4;

    questions.forEach((item, i) => {
      const answer = item.answer || transcript?.questions?.[i]?.answer || '';
      ensureSpace(14);
      writeLines(`Q${i + 1}. ${item.question}${item.score != null ? `  [${item.score}/${item.maxScore || 10}]` : ''}`, mx, 11, [232, 232, 235], 'bold');
      if (answer) {
        writeLines('Your Answer:', mx + 2, 9, [107, 107, 112], 'bold');
        writeLines(answer, mx + 4, 10, [200, 200, 204]);
      }
      if (item.correctAnswer) {
        writeLines('Correct Answer:', mx + 2, 9, [40, 167, 69], 'bold');
        writeLines(item.correctAnswer, mx + 4, 10, [160, 160, 165]);
      }
      if (item.feedback) {
        writeLines('Feedback:', mx + 2, 9, [196, 160, 82], 'bold');
        writeLines(item.feedback, mx + 4, 10, [160, 160, 165]);
      }
      y += 4;
      subtleRule();
    });

    /* footer */
    y += 2;
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 107, 112);
    doc.text('Generated by HireCraft \u2014 AI Interview Preparation Platform', pw / 2, y, { align: 'center' });

    const safeName = bankName.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`HireCraft_${safeName}_${dateStr.replace(/\//g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF: ' + err.message);
    }
  };

  if (loading) return <AppLayout activePage="interview"><p style={{ color: '#6b6b70', textAlign: 'center', padding: 60 }}>Loading results…</p></AppLayout>;
  if (!data) return null;

  const evaluation = data.evaluation;
  const transcript = data.transcript;

  return (
    <AppLayout activePage="interview">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Interview Results</h1>
          <p style={s.meta}>{data.bankName || transcript?.bank} • {new Date(data.endedAt || data.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
        <div style={s.headerActions}>
          <button style={s.dlBtn} onClick={downloadTranscript}>📄 Download PDF</button>
          <button style={s.backBtn} onClick={() => navigate('/interview')}>← Back to Interviews</button>
        </div>
      </div>

      {/* Overall Score */}
      {evaluation && (
        <div style={s.scoreCard}>
          <div style={s.scoreCircle}>
            <span style={s.scoreNum}>{evaluation.overallScore?.toFixed?.(1) ?? '—'}</span>
            <span style={s.scoreMax}>/100</span>
          </div>
          <div style={s.scoreSummary}>
            <h3 style={s.summaryTitle}>Overall Assessment</h3>
            <p style={s.summaryText}>{evaluation.summary}</p>
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      {evaluation && (evaluation.strengths?.length > 0 || evaluation.weaknesses?.length > 0) && (
        <div style={s.swGrid}>
          {evaluation.strengths?.length > 0 && (
            <div style={s.swCard}>
              <h4 style={{ ...s.swTitle, color: '#28a745' }}>Strengths</h4>
              <ul style={s.swList}>{evaluation.strengths.map((s2, i) => <li key={i} style={s.swItem}>{s2}</li>)}</ul>
            </div>
          )}
          {evaluation.weaknesses?.length > 0 && (
            <div style={s.swCard}>
              <h4 style={{ ...s.swTitle, color: '#dc3545' }}>Areas to Improve</h4>
              <ul style={s.swList}>{evaluation.weaknesses.map((w, i) => <li key={i} style={s.swItem}>{w}</li>)}</ul>
            </div>
          )}
          {evaluation.recommendations?.length > 0 && (
            <div style={s.swCard}>
              <h4 style={{ ...s.swTitle, color: '#c4a052' }}>Recommendations</h4>
              <ul style={s.swList}>{evaluation.recommendations.map((r, i) => <li key={i} style={s.swItem}>{r}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {/* Per-question Breakdown */}
      <h3 style={s.sectionTitle}>Question-by-Question Breakdown</h3>
      <div style={s.qList}>
        {(evaluation?.perQuestion || transcript?.questions || []).map((item, i) => (
          <div key={i} style={s.qCard}>
            <div style={s.qHeader}>
              <span style={s.qNum}>Q{i + 1}</span>
              <span style={s.qQuestion}>{item.question}</span>
              {item.score != null && (
                <span style={s.qScore}>{item.score}/{item.maxScore || 10}</span>
              )}
            </div>
            {/* Show user's answer */}
            {(item.answer || transcript?.questions?.[i]?.answer) && (
              <div style={s.answerBox}>
                <div style={s.answerLabel}>Your Answer:</div>
                <p style={s.answerText}>{item.answer || transcript?.questions?.[i]?.answer}</p>
              </div>
            )}
            {item.correctAnswer && (
              <div style={s.correctAnswerBox}>
                <div style={s.correctAnswerLabel}>Correct Answer:</div>
                <p style={s.correctAnswerText}>{item.correctAnswer}</p>
              </div>
            )}
            {item.feedback && (
              <div style={s.feedbackBox}>
                <div style={s.feedbackLabel}>Feedback:</div>
                <p style={s.feedbackText}>{item.feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bank Feedback Section */}
      {data?.bankId && (
        <div style={s.fbCard}>
          <h3 style={s.fbTitle}>Rate this Question Bank</h3>
          <p style={s.fbSub}>Your feedback helps improve question banks for everyone.</p>
          {fbSubmitted ? (
            <div style={s.fbSuccess}>{fbMsg}</div>
          ) : (
            <>
              <div style={s.fbStarsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      ...s.fbStar,
                      color: star <= (fbHover || fbRating) ? '#c4a052' : '#3a3a3d',
                    }}
                    onClick={() => setFbRating(star)}
                    onMouseEnter={() => setFbHover(star)}
                    onMouseLeave={() => setFbHover(0)}
                  >
                    ★
                  </span>
                ))}
                {fbRating > 0 && <span style={s.fbRatingText}>{fbRating}/5</span>}
              </div>
              <textarea
                style={s.fbTextarea}
                placeholder="Share your thoughts about this question bank (optional)…"
                value={fbComment}
                onChange={(e) => setFbComment(e.target.value)}
                rows={3}
              />
              {fbMsg && <div style={s.fbError}>{fbMsg}</div>}
              <button style={s.fbSubmitBtn} onClick={handleFeedbackSubmit} disabled={fbSubmitting}>
                {fbSubmitting ? 'Submitting…' : 'Submit Feedback'}
              </button>
            </>
          )}
        </div>
      )}
    </AppLayout>
  );
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: '1.6rem', fontWeight: 800, color: '#e8e8eb', margin: 0 },
  meta: { color: '#6b6b70', fontSize: 13, marginTop: 4 },
  headerActions: { display: 'flex', gap: 8 },
  dlBtn: { background: '#c4a052', color: '#0a0a0b', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#c8c8cc', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  scoreCard: { display: 'flex', gap: 28, alignItems: 'center', background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px 32px', marginBottom: 28 },
  scoreCircle: { background: '#0e0e10', border: '3px solid #c4a052', borderRadius: '50%', width: 100, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  scoreNum: { fontSize: 28, fontWeight: 900, color: '#c4a052' },
  scoreMax: { fontSize: 12, color: '#6b6b70' },
  scoreSummary: { flex: 1 },
  summaryTitle: { color: '#e8e8eb', fontSize: 16, fontWeight: 700, margin: '0 0 8px' },
  summaryText: { color: '#a0a0a5', fontSize: 14, lineHeight: 1.6, margin: 0 },
  swGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 32 },
  swCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '18px 20px' },
  swTitle: { fontSize: 13, fontWeight: 700, margin: '0 0 10px' },
  swList: { margin: 0, paddingLeft: 18 },
  swItem: { color: '#c8c8cc', fontSize: 13, lineHeight: 1.6, marginBottom: 4 },
  sectionTitle: { color: '#e8e8eb', fontSize: 16, fontWeight: 700, marginBottom: 16 },
  qList: { display: 'flex', flexDirection: 'column', gap: 12 },
  qCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '18px 20px' },
  qHeader: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 },
  qNum: { background: '#c4a052', color: '#0a0a0b', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 },
  qQuestion: { flex: 1, color: '#e8e8eb', fontSize: 14, fontWeight: 600, lineHeight: 1.5 },
  qScore: { color: '#c4a052', fontSize: 14, fontWeight: 800, flexShrink: 0 },
  answerBox: { background: '#0e0e10', borderRadius: 8, padding: '12px 14px', marginBottom: 8 },
  answerLabel: { color: '#6b6b70', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  answerText: { color: '#c8c8cc', fontSize: 13, lineHeight: 1.6, margin: 0 },
  correctAnswerBox: { background: 'rgba(40,167,69,0.06)', borderLeft: '3px solid #28a745', borderRadius: '0 8px 8px 0', padding: '12px 14px', marginBottom: 8 },
  correctAnswerLabel: { color: '#28a745', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  correctAnswerText: { color: '#a0a0a5', fontSize: 13, lineHeight: 1.6, margin: 0 },
  feedbackBox: { background: '#121214', borderLeft: '3px solid #c4a052', borderRadius: '0 8px 8px 0', padding: '12px 14px' },
  feedbackLabel: { color: '#c4a052', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  feedbackText: { color: '#a0a0a5', fontSize: 13, lineHeight: 1.6, margin: 0 },
  // Bank feedback form
  fbCard: { background: '#161618', border: '1px solid rgba(196,160,82,0.15)', borderRadius: 14, padding: '28px 28px 24px', marginTop: 36 },
  fbTitle: { color: '#e8e8eb', fontSize: 16, fontWeight: 700, margin: '0 0 4px' },
  fbSub: { color: '#6b6b70', fontSize: 13, margin: '0 0 16px' },
  fbStarsRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 },
  fbStar: { fontSize: 28, cursor: 'pointer', transition: 'color 0.15s, transform 0.15s', userSelect: 'none' },
  fbRatingText: { color: '#c4a052', fontWeight: 700, fontSize: 14, marginLeft: 8 },
  fbTextarea: { width: '100%', background: '#0e0e10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8e8eb', padding: '10px 14px', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, marginBottom: 12, outline: 'none' },
  fbSubmitBtn: { background: '#c4a052', color: '#0a0a0b', border: 'none', padding: '9px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  fbSuccess: { background: '#28a74520', color: '#28a745', padding: '12px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 },
  fbError: { color: '#f87171', fontSize: 12, marginBottom: 8 },
};
