import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getCandidateDetail, getCandidateResume } from '../api/hiring';
import { SkeletonText, SkeletonCardGrid } from '../components/Skeleton';
import jsPDF from 'jspdf';

/* ── Scoring constants ── */
const INTERVIEW_WEIGHT = 0.85;
const RESUME_WEIGHT = 0.15;
const WEIGHT_LABEL = '85% interview + 15% resume';

const computeCombined = (i, r) =>
  i != null && r != null ? Math.round(i * INTERVIEW_WEIGHT + r * RESUME_WEIGHT) : i;

const computeGrade = (score) =>
  score == null ? null : score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : score >= 50 ? 'C' : score >= 40 ? 'D' : 'F';

const gradeColor = (g) =>
  !g ? '#555' : g.startsWith('A') ? '#2f8a5a' : g.startsWith('B') ? '#5b9bd5' : g.startsWith('C') ? '#c4a052' : '#dc4a4a';

/* ════════════════════ MAIN ════════════════════ */
export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    getCandidateDetail(id)
      .then(setCandidate)
      .catch(() => { toast.error('Failed to load candidate'); navigate(-1); })
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Resume download ── */
  const downloadResume = async () => {
    try {
      const data = await getCandidateResume(id);
      if (data?.base64) {
        const link = document.createElement('a');
        link.href = 'data:application/pdf;base64,' + data.base64;
        link.download = data.fileName || 'resume.pdf';
        link.click();
      } else toast.error('No resume file available');
    } catch {
      toast.error('Failed to download resume');
    }
  };

  /* ───────── PDF Report with HireCraft Theme ───────── */
  const downloadReportPDF = () => {
    if (!candidate) return;
    const { evaluation, answers, resumeAnalysis } = candidate;
    const ansArr = Array.isArray(answers) ? answers : [];
    const perQ = evaluation?.perQuestion || [];

    const iScore = candidate.totalScore;
    const rScore = resumeAnalysis?.overallScore;
    const combined = computeCombined(iScore, rScore);
    const grade = evaluation?.overallGrade || computeGrade(combined);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentW = W - margin * 2;
    let y = 0;

    const gold = [196, 160, 82];
    const dark = [10, 10, 11];
    const darkCard = [22, 22, 24];
    const white = [232, 232, 235];
    const gray = [134, 134, 139];
    const green = [47, 138, 90];
    const red = [220, 74, 74];

    const paintBg = () => { doc.setFillColor(...dark); doc.rect(0, 0, W, H, 'F'); };
    const addPage = () => { doc.addPage(); paintBg(); y = 16; };
    const checkPage = (need) => { if (y + need > H - 20) addPage(); };

    /* ─ Dark background on first page ─ */
    paintBg();

    /* ─ Header banner ─ */
    doc.setFillColor(...dark);
    doc.rect(0, 0, W, 52, 'F');
    doc.setFillColor(...gold);
    doc.roundedRect(margin, 10, 12, 12, 2, 2, 'F');
    doc.setTextColor(...dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('HC', margin + 6, 18, { align: 'center' });

    doc.setTextColor(...gold);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('HireCraft', margin + 16, 18);

    doc.setTextColor(...white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Interview Report', margin + 16, 25);

    doc.setTextColor(...gray);
    doc.setFontSize(8);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W - margin, 18, { align: 'right' });

    // Candidate name on banner
    doc.setTextColor(...white);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(candidate.name, margin, 40);
    doc.setTextColor(...gray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(candidate.email, margin, 46);

    // Score box on the right
    if (combined != null) {
      doc.setFillColor(...darkCard);
      doc.roundedRect(W - margin - 40, 30, 40, 20, 3, 3, 'F');
      doc.setTextColor(...gold);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${Math.round(combined)}%`, W - margin - 20, 41, { align: 'center' });
      doc.setTextColor(...gray);
      doc.setFontSize(7);
      doc.text(grade || '', W - margin - 20, 47, { align: 'center' });
    }

    // Gold accent line
    doc.setFillColor(...gold);
    doc.rect(0, 52, W, 1.5, 'F');
    y = 60;

    /* ─ Scores section ─ */
    doc.setFillColor(22, 22, 24);
    doc.roundedRect(margin, y, contentW, 24, 3, 3, 'F');
    const scoreBoxW = contentW / 4;
    const scoreLabels = ['Interview', 'Resume/ATS', 'Combined', 'Grade'];
    const scoreVals = [
      iScore != null ? `${Math.round(iScore)}%` : '—',
      rScore != null ? `${Math.round(rScore)}%` : '—',
      combined != null ? `${Math.round(combined)}%` : '—',
      grade || '—'
    ];
    const scoreColors = [gold, [91, 155, 213], white, grade ? (grade.startsWith('A') ? green : grade.startsWith('B') ? [91, 155, 213] : grade.startsWith('C') ? gold : red) : gray];

    scoreLabels.forEach((lbl, i) => {
      const cx = margin + scoreBoxW * i + scoreBoxW / 2;
      doc.setTextColor(...gray);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(lbl.toUpperCase(), cx, y + 8, { align: 'center' });
      doc.setTextColor(...scoreColors[i]);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(scoreVals[i], cx, y + 18, { align: 'center' });
    });
    y += 30;

    doc.setTextColor(...gray);
    doc.setFontSize(7);
    doc.text(WEIGHT_LABEL, W / 2, y, { align: 'center' });
    y += 8;

    /* Helper: section header */
    const sectionHeader = (title) => {
      checkPage(14);
      doc.setFillColor(...gold);
      doc.rect(margin, y, 1.5, 7, 'F');
      doc.setTextColor(...white);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 5, y + 5.5);
      y += 12;
    };

    /* Helper: wrapped text */
    const addWrapped = (text, color = white, size = 9, indent = 0) => {
      doc.setTextColor(...color);
      doc.setFontSize(size);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(text, contentW - indent);
      lines.forEach(line => {
        checkPage(5);
        doc.text(line, margin + indent, y);
        y += 4.5;
      });
      y += 2;
    };

    /* Helper: bullet list */
    const addBulletList = (items, color = white) => {
      (items || []).forEach(item => {
        doc.setTextColor(...color);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(`• ${item}`, contentW - 6);
        lines.forEach(line => {
          checkPage(5);
          doc.text(line, margin + 4, y);
          y += 4.5;
        });
      });
      y += 2;
    };

    /* ─ AI Evaluation Summary ─ */
    if (evaluation?.summary) {
      sectionHeader('AI Evaluation Summary');
      addWrapped(evaluation.summary, white, 9);
    }

    if (evaluation?.strengths?.length) {
      checkPage(8);
      doc.setTextColor(...green);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('STRENGTHS', margin + 2, y);
      y += 5;
      addBulletList(evaluation.strengths, green);
    }

    if (evaluation?.weaknesses?.length) {
      checkPage(8);
      doc.setTextColor(...red);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('WEAKNESSES', margin + 2, y);
      y += 5;
      addBulletList(evaluation.weaknesses, red);
    }

    if (evaluation?.recommendations?.length) {
      checkPage(8);
      doc.setTextColor(...gold);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMMENDATIONS', margin + 2, y);
      y += 5;
      addBulletList(evaluation.recommendations, gold);
    }

    /* ─ Resume Analysis ─ */
    if (resumeAnalysis) {
      sectionHeader('Resume Analysis');
      if (resumeAnalysis.overallScore != null) {
        doc.setTextColor(...gray);
        doc.setFontSize(8);
        doc.text('ATS SCORE: ', margin + 2, y);
        const atsColor = resumeAnalysis.overallScore >= 70 ? green : resumeAnalysis.overallScore >= 40 ? gold : red;
        doc.setTextColor(...atsColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${resumeAnalysis.overallScore}%`, margin + 24, y);
        y += 7;
      }
      if (resumeAnalysis.summary) addWrapped(resumeAnalysis.summary, gray, 9);
      if (resumeAnalysis.strengths?.length) {
        doc.setTextColor(...green); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.text('STRENGTHS', margin + 2, y); y += 5;
        addBulletList(resumeAnalysis.strengths, green);
      }
      if (resumeAnalysis.gaps?.length) {
        doc.setTextColor(...red); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.text('GAPS', margin + 2, y); y += 5;
        addBulletList(resumeAnalysis.gaps, red);
      }
    }

    /* ─ Interview Q&A ─ */
    sectionHeader('Interview Questions & Answers');
    const allQs = perQ.length > 0 ? perQ : ansArr;
    allQs.forEach((q, i) => {
      checkPage(30);
      // Question number + difficulty
      doc.setTextColor(...gold);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const diff = q.difficulty || ansArr[i]?.difficulty || '';
      const scoreStr = q.score != null ? `   ${q.score}/${q.maxScore || 10}` : '';
      doc.text(`Q${i + 1}` + (diff ? ` [${diff.toUpperCase()}]` : '') + scoreStr, margin + 2, y);
      y += 5;

      // Question text
      const qText = q.question || q.questionText || ansArr[i]?.questionText || 'Question';
      addWrapped(qText, white, 9, 2);

      // Candidate answer
      const candAnswer = q.userAnswer || ansArr[i]?.answerText || ansArr.find(a => a.questionId === q.questionId)?.answerText || '(No answer)';
      doc.setTextColor(...gray); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      doc.text('CANDIDATE ANSWER', margin + 2, y); y += 4;
      addWrapped(candAnswer, gray, 8, 4);

      // Correct answer
      if (q.correctAnswer) {
        doc.setTextColor(...green); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
        doc.text('CORRECT ANSWER', margin + 2, y); y += 4;
        addWrapped(q.correctAnswer, green, 8, 4);
      }

      // Feedback
      if (q.feedback) {
        doc.setTextColor(107, 107, 112); doc.setFontSize(7); doc.setFont('helvetica', 'italic');
        const fLines = doc.splitTextToSize(q.feedback, contentW - 6);
        fLines.forEach(fl => { checkPage(5); doc.text(fl, margin + 4, y); y += 4; });
        y += 2;
      }

      // Separator
      if (i < allQs.length - 1) {
        doc.setDrawColor(40, 40, 45);
        doc.line(margin + 4, y, W - margin - 4, y);
        y += 4;
      }
    });

    /* ─ Footer on every page ─ */
    const pageCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      /* footer bar */
      doc.setFillColor(...dark);
      doc.rect(0, H - 12, W, 12, 'F');
      doc.setFillColor(...gold);
      doc.rect(0, H - 12, W, 0.5, 'F');
      doc.setTextColor(...gray);
      doc.setFontSize(7);
      doc.text(`HireCraft Interview Report — ${candidate.name}`, margin, H - 5);
      doc.text(`Page ${p} of ${pageCount}`, W - margin, H - 5, { align: 'right' });
    }

    doc.save(`${candidate.name.replace(/\s+/g, '_')}_Interview_Report.pdf`);
    toast.success('PDF report downloaded!');
  };

  /* ── Render ── */
  if (loading) {
    return <div style={S.page}><div style={S.container}><SkeletonText lines={3} /><div style={{ marginTop: 24 }}><SkeletonCardGrid count={3} /></div></div></div>;
  }
  if (!candidate) return null;

  const { resumeAnalysis, evaluation, answers, transcript } = candidate;
  const statusColors = { NOT_STARTED: '#6b6b70', IN_PROGRESS: '#c4a052', COMPLETED: '#5b9bd5', EVALUATED: '#2f8a5a' };

  const iScore = candidate.totalScore;
  const rScore = resumeAnalysis?.overallScore ?? null;
  const combined = computeCombined(iScore, rScore);
  const overallGrade = evaluation?.overallGrade || computeGrade(combined);
  const ansArr = Array.isArray(answers) ? answers : [];

  return (
    <div style={S.page}>
      <div style={S.container}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>← Back</button>

        {/* ── Header Card ── */}
        <div style={S.headerCard}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 16, textAlign: 'center' }}>
            <div style={{ flex: '1 1 auto', minWidth: 200 }}>
              <h1 style={S.name}>{candidate.name}</h1>
              <p style={{ color: '#6b6b70', fontSize: 13, margin: '4px 0 0' }}>{candidate.email}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
              {combined != null && (
                <div style={S.scoreCircle}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#c4a052' }}>{Math.round(combined)}%</span>
                  <span style={{ fontSize: 10, color: '#6b6b70' }}>Combined</span>
                </div>
              )}
              {overallGrade && (
                <div style={{ ...S.gradeBox, color: gradeColor(overallGrade) }}>
                  <span style={{ fontSize: 24, fontWeight: 900 }}>{overallGrade}</span>
                  <span style={{ fontSize: 10, color: '#6b6b70' }}>Grade</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ ...S.statusBadge, color: statusColors[candidate.interviewStatus] }}>
              {(candidate.interviewStatus || '').replace('_', ' ')}
            </span>
            {candidate.startedAt && <span style={S.metaTag}>Started: {new Date(candidate.startedAt).toLocaleString()}</span>}
            {candidate.completedAt && <span style={S.metaTag}>Completed: {new Date(candidate.completedAt).toLocaleString()}</span>}
          </div>
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button style={S.downloadReportBtn} onClick={downloadReportPDF}>📄 Download PDF Report</button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={S.tabRow}>
          {['overview', 'resume', 'interview', 'evaluation'].map((t) => (
            <button key={t} style={{ ...S.tabBtn, ...(tab === t ? S.tabActive : {}) }} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div>
          {tab === 'overview' && <OverviewTab candidate={candidate} iScore={iScore} rScore={rScore} combined={combined} overallGrade={overallGrade} ansArr={ansArr} />}
          {tab === 'resume' && <ResumeTab resumeAnalysis={resumeAnalysis} onDownload={downloadResume} />}
          {tab === 'interview' && <InterviewTab answers={ansArr} evaluation={evaluation} transcript={transcript} />}
          {tab === 'evaluation' && <EvaluationTab evaluation={evaluation} ansArr={ansArr} />}
        </div>
      </div>
    </div>
  );
}

/* ════════════ OVERVIEW TAB ════════════ */
function OverviewTab({ candidate, iScore, rScore, combined, overallGrade, ansArr }) {
  const { resumeAnalysis, evaluation } = candidate;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Score cards */}
      <div style={S.statsGrid}>
        <div style={S.statCard}>
          <p style={S.statLabel}>Interview Score</p>
          <p style={{ ...S.statValue, color: '#c4a052' }}>{iScore != null ? `${Math.round(iScore)}%` : '—'}</p>
        </div>
        <div style={S.statCard}>
          <p style={S.statLabel}>ATS / Resume Score</p>
          <p style={{ ...S.statValue, color: '#5b9bd5' }}>{rScore != null ? `${Math.round(rScore)}%` : '—'}</p>
        </div>
        <div style={S.statCard}>
          <p style={S.statLabel}>Combined Score</p>
          <p style={S.statValue}>{combined != null ? `${Math.round(combined)}%` : '—'}</p>
          <p style={{ color: '#555558', fontSize: 10, margin: '4px 0 0' }}>{WEIGHT_LABEL}</p>
        </div>
        <div style={S.statCard}>
          <p style={S.statLabel}>Overall Grade</p>
          <p style={{ ...S.statValue, color: gradeColor(overallGrade) }}>{overallGrade || '—'}</p>
        </div>
        <div style={S.statCard}>
          <p style={S.statLabel}>Questions Answered</p>
          <p style={S.statValue}>{ansArr.length}</p>
        </div>
        {evaluation?.perQuestion?.length > 0 && (
          <div style={S.statCard}>
            <p style={S.statLabel}>Avg Question Score</p>
            <p style={S.statValue}>
              {(evaluation.perQuestion.reduce((s, q) => s + (q.score || 0), 0) / evaluation.perQuestion.length).toFixed(1)}
            </p>
          </div>
        )}
      </div>

      {/* Overall Performance Summary — comparing interview + resume */}
      <div style={S.sectionCard}>
        <h3 style={S.sectionTitleCenter}>Overall Performance Summary</h3>
        {evaluation?.summary ? (
          <p style={{ color: '#e8e8eb', fontSize: 13, lineHeight: 1.8, margin: 0, textAlign: 'center' }}>{evaluation.summary}</p>
        ) : (
          <p style={{ color: '#6b6b70', fontSize: 13, textAlign: 'center', margin: 0 }}>Evaluation pending…</p>
        )}

        {/* Resume vs Interview comparison */}
        {iScore != null && rScore != null && (
          <div style={{ marginTop: 18, padding: '16px 20px', background: '#0a0a0b', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: '#86868b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center', letterSpacing: 0.5 }}>Interview vs Resume Comparison</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#c4a052', fontSize: 28, fontWeight: 900, margin: 0 }}>{Math.round(iScore)}%</p>
                <p style={{ color: '#6b6b70', fontSize: 11, margin: '2px 0 0' }}>Interview ({Math.round(INTERVIEW_WEIGHT * 100)}% weight)</p>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#5b9bd5', fontSize: 28, fontWeight: 900, margin: 0 }}>{Math.round(rScore)}%</p>
                <p style={{ color: '#6b6b70', fontSize: 11, margin: '2px 0 0' }}>Resume ({Math.round(RESUME_WEIGHT * 100)}% weight)</p>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#e8e8eb', fontSize: 28, fontWeight: 900, margin: 0 }}>{Math.round(combined)}%</p>
                <p style={{ color: '#6b6b70', fontSize: 11, margin: '2px 0 0' }}>Combined</p>
              </div>
            </div>
            {Math.abs(iScore - rScore) > 20 && (
              <p style={{ color: '#c4a052', fontSize: 12, textAlign: 'center', margin: '14px 0 0', lineHeight: 1.6, fontStyle: 'italic' }}>
                {iScore > rScore
                  ? `This candidate performed significantly better in the interview than their resume suggests — strong practical skills but may benefit from resume improvement.`
                  : `This candidate's resume is stronger than their interview performance — consider that they may have relevant experience but struggled to articulate it live.`}
              </p>
            )}
          </div>
        )}

        {/* Quick strengths/weaknesses bullets */}
        {(evaluation?.strengths?.length > 0 || evaluation?.weaknesses?.length > 0) && (
          <div style={{ display: 'flex', gap: 16, marginTop: 18, flexWrap: 'wrap' }}>
            {evaluation.strengths?.length > 0 && (
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ color: '#2f8a5a', fontSize: 12, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>STRENGTHS</p>
                <ul style={S.list}>{evaluation.strengths.map((s, i) => <li key={i} style={S.listItem}>{s}</li>)}</ul>
              </div>
            )}
            {evaluation.weaknesses?.length > 0 && (
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ color: '#dc4a4a', fontSize: 12, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>WEAKNESSES</p>
                <ul style={S.list}>{evaluation.weaknesses.map((w, i) => <li key={i} style={S.listItem}>{w}</li>)}</ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════ RESUME TAB ════════════ */
function ResumeTab({ resumeAnalysis, onDownload }) {
  if (!resumeAnalysis) return <div style={S.emptyTab}><p>No resume analysis available.</p></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={S.sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={S.sectionTitle}>Resume Analysis</h3>
          <button style={S.downloadBtn} onClick={onDownload}>📥 Download</button>
        </div>
        {resumeAnalysis.overallScore != null && (
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div style={{ ...S.atsScoreBox, borderColor: resumeAnalysis.overallScore >= 70 ? '#2f8a5a' : resumeAnalysis.overallScore >= 40 ? '#c4a052' : '#dc4a4a' }}>
              <span style={{ fontSize: 11, color: '#6b6b70', textTransform: 'uppercase' }}>ATS Score</span>
              <span style={{ fontSize: 30, fontWeight: 900, color: resumeAnalysis.overallScore >= 70 ? '#2f8a5a' : resumeAnalysis.overallScore >= 40 ? '#c4a052' : '#dc4a4a' }}>{resumeAnalysis.overallScore}%</span>
            </div>
          </div>
        )}
        {resumeAnalysis.summary && (
          <div style={{ marginTop: 14 }}>
            <p style={{ color: '#86868b', fontSize: 12, fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', textAlign: 'center' }}>Summary</p>
            <p style={{ color: '#e8e8eb', fontSize: 13, lineHeight: 1.7, textAlign: 'center' }}>{resumeAnalysis.summary}</p>
          </div>
        )}
        {resumeAnalysis.strengths?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: '#2f8a5a', fontSize: 12, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>STRENGTHS</p>
            <ul style={S.list}>{resumeAnalysis.strengths.map((s, i) => <li key={i} style={S.listItem}>{s}</li>)}</ul>
          </div>
        )}
        {resumeAnalysis.gaps?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: '#dc4a4a', fontSize: 12, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>GAPS</p>
            <ul style={S.list}>{resumeAnalysis.gaps.map((g, i) => <li key={i} style={S.listItem}>{g}</li>)}</ul>
          </div>
        )}
        {(resumeAnalysis.suggestions || resumeAnalysis.recommendations)?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: '#c4a052', fontSize: 12, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>SUGGESTIONS</p>
            <ul style={S.list}>{(resumeAnalysis.suggestions || resumeAnalysis.recommendations).map((r, i) => <li key={i} style={S.listItem}>{r}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════ INTERVIEW TAB ════════════ */
function InterviewTab({ answers, evaluation, transcript }) {
  const ansArr = Array.isArray(answers) ? answers : [];
  const perQ = evaluation?.perQuestion || [];

  if (ansArr.length === 0 && perQ.length === 0 && (!transcript || !transcript.questions))
    return <div style={S.emptyTab}><p>No interview data available.</p></div>;

  const mergedQs = perQ.length > 0
    ? perQ.map((pq, i) => {
        const ans = ansArr.find(a => a.questionId === pq.questionId) || ansArr[i] || {};
        return { ...pq, answerText: ans.answerText || pq.userAnswer, difficulty: ans.difficulty || pq.difficulty };
      })
    : ansArr.map((a) => ({ ...a, question: a.questionText }));

  const diffColor = (d) => d === 'easy' ? '#2f8a5a' : d === 'hard' ? '#dc4a4a' : '#c4a052';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {mergedQs.map((q, i) => (
        <div key={i} style={S.sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ color: '#86868b', fontSize: 11, fontWeight: 700, margin: 0 }}>QUESTION {i + 1}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {q.difficulty && <span style={{ fontSize: 10, fontWeight: 700, color: diffColor(q.difficulty), textTransform: 'uppercase' }}>{q.difficulty}</span>}
              {q.score != null && (
                <span style={{ fontSize: 13, fontWeight: 800, color: q.score >= 7 ? '#2f8a5a' : q.score >= 4 ? '#c4a052' : '#dc4a4a' }}>
                  {q.score}/{q.maxScore || 10}
                </span>
              )}
            </div>
          </div>
          <p style={{ color: '#e8e8eb', fontSize: 14, margin: '0 0 12px', lineHeight: 1.5, fontWeight: 600, textAlign: 'center' }}>{q.question || q.questionText || 'Question'}</p>
          <div style={{ background: '#0a0a0b', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: q.correctAnswer ? 8 : 0 }}>
            <p style={{ color: '#86868b', fontSize: 11, margin: '0 0 4px', fontWeight: 700, textAlign: 'center' }}>CANDIDATE ANSWER</p>
            <p style={{ color: '#e8e8eb', fontSize: 13, margin: 0, lineHeight: 1.6, textAlign: 'center' }}>{q.answerText || q.userAnswer || '(No answer)'}</p>
          </div>
          {q.correctAnswer && (
            <div style={{ background: 'rgba(47,138,90,0.06)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(47,138,90,0.15)' }}>
              <p style={{ color: '#2f8a5a', fontSize: 11, margin: '0 0 4px', fontWeight: 700, textAlign: 'center' }}>CORRECT ANSWER</p>
              <p style={{ color: '#e8e8eb', fontSize: 13, margin: 0, lineHeight: 1.6, textAlign: 'center' }}>{q.correctAnswer}</p>
            </div>
          )}
          {q.feedback && <p style={{ fontSize: 12, color: '#86868b', margin: '8px 0 0', lineHeight: 1.5, fontStyle: 'italic', textAlign: 'center' }}>{q.feedback}</p>}
        </div>
      ))}
    </div>
  );
}

/* ════════════ EVALUATION TAB ════════════ */
function EvaluationTab({ evaluation, ansArr }) {
  if (!evaluation) return <div style={S.emptyTab}><p>No evaluation available yet.</p></div>;

  const perQ = evaluation.perQuestion || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={S.sectionCard}>
        <h3 style={S.sectionTitleCenter}>Overall Evaluation</h3>
        <div style={S.statsGrid}>
          <div style={S.statCard}>
            <p style={S.statLabel}>Interview Score</p>
            <p style={{ ...S.statValue, color: '#c4a052' }}>{evaluation.overallScore != null ? `${Math.round(evaluation.overallScore)}%` : '—'}</p>
          </div>
          <div style={S.statCard}>
            <p style={S.statLabel}>ATS Score</p>
            <p style={{ ...S.statValue, color: '#5b9bd5' }}>{evaluation.atsScore != null ? `${Math.round(evaluation.atsScore)}%` : '—'}</p>
          </div>
          <div style={S.statCard}>
            <p style={S.statLabel}>Combined Score</p>
            <p style={S.statValue}>{evaluation.combinedScore != null ? `${Math.round(evaluation.combinedScore)}%` : '—'}</p>
            <p style={{ color: '#555558', fontSize: 10, margin: '2px 0 0' }}>{WEIGHT_LABEL}</p>
          </div>
          <div style={S.statCard}>
            <p style={S.statLabel}>Grade</p>
            <p style={{ ...S.statValue, color: gradeColor(evaluation.overallGrade) }}>{evaluation.overallGrade || '—'}</p>
          </div>
        </div>
        {evaluation.summary && (
          <div style={{ marginTop: 18 }}>
            <p style={{ color: '#86868b', fontSize: 12, fontWeight: 700, margin: '0 0 8px', textAlign: 'center' }}>SUMMARY</p>
            <p style={{ color: '#e8e8eb', fontSize: 13, lineHeight: 1.7, textAlign: 'center' }}>{evaluation.summary}</p>
          </div>
        )}
        {evaluation.strengths?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: '#2f8a5a', fontSize: 12, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>STRENGTHS</p>
            <ul style={S.list}>{evaluation.strengths.map((s, i) => <li key={i} style={S.listItem}>{s}</li>)}</ul>
          </div>
        )}
        {evaluation.weaknesses?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: '#dc4a4a', fontSize: 12, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>WEAKNESSES</p>
            <ul style={S.list}>{evaluation.weaknesses.map((w, i) => <li key={i} style={S.listItem}>{w}</li>)}</ul>
          </div>
        )}
        {evaluation.recommendations?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: '#c4a052', fontSize: 12, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>RECOMMENDATIONS</p>
            <ul style={S.list}>{evaluation.recommendations.map((r, i) => <li key={i} style={S.listItem}>{r}</li>)}</ul>
          </div>
        )}
      </div>

      {/* Per-Question Breakdown */}
      {perQ.length > 0 && (
        <div style={S.sectionCard}>
          <h3 style={S.sectionTitleCenter}>Per-Question Breakdown</h3>
          {perQ.map((q, i) => {
            const ans = (ansArr || []).find(a => a.questionId === q.questionId) || (ansArr || [])[i] || {};
            return (
              <div key={i} style={{ padding: '16px 0', borderBottom: i < perQ.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                  <p style={{ color: '#e8e8eb', fontSize: 14, margin: 0, fontWeight: 600 }}>Q{i + 1}: {q.question || q.questionText}</p>
                  <span style={{ fontSize: 14, fontWeight: 800, color: (q.score || 0) >= 7 ? '#2f8a5a' : (q.score || 0) >= 4 ? '#c4a052' : '#dc4a4a' }}>
                    {q.score}/{q.maxScore || 10}
                  </span>
                </div>
                {(ans.answerText || q.userAnswer) && <p style={{ fontSize: 12, color: '#86868b', margin: '4px 0' }}><strong style={{ color: '#e8e8eb' }}>Answer:</strong> {ans.answerText || q.userAnswer}</p>}
                {q.correctAnswer && <p style={{ fontSize: 12, color: '#2f8a5a', margin: '4px 0' }}><strong>Correct:</strong> {q.correctAnswer}</p>}
                {q.feedback && <p style={{ fontSize: 12, color: '#86868b', margin: '6px 0 0', lineHeight: 1.5, fontStyle: 'italic' }}>{q.feedback}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════ STYLES ════════════ */
const S = {
  page: { minHeight: '100vh', background: '#0a0a0b', color: '#e8e8eb', fontFamily: "'Inter', sans-serif", padding: '40px 24px' },
  container: { maxWidth: 1100, width: '100%', margin: '0 auto' },
  backBtn: { background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0, textDecoration: 'underline', display: 'block' },

  headerCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '28px 32px', marginBottom: 20, textAlign: 'center' },
  name: { fontSize: 24, fontWeight: 900, margin: 0, textAlign: 'center' },
  scoreCircle: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(196,160,82,0.1)', borderRadius: 14, padding: '12px 22px', border: '1px solid rgba(196,160,82,0.2)' },
  gradeBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '12px 22px', border: '1px solid rgba(255,255,255,0.08)' },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 8, textTransform: 'uppercase', background: 'rgba(255,255,255,0.06)' },
  metaTag: { fontSize: 12, color: '#555558' },
  downloadReportBtn: { background: 'linear-gradient(135deg, rgba(196,160,82,0.2), rgba(196,160,82,0.1))', color: '#c4a052', border: '1px solid rgba(196,160,82,0.3)', padding: '8px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' },

  tabRow: { display: 'flex', gap: 4, marginBottom: 20, background: '#161618', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.06)' },
  tabBtn: { background: 'transparent', color: '#6b6b70', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', flex: 1, textAlign: 'center' },
  tabActive: { background: 'rgba(196,160,82,0.15)', color: '#c4a052' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 },
  statCard: { background: '#0a0a0b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 16px', textAlign: 'center' },
  statLabel: { color: '#6b6b70', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px', textAlign: 'center' },
  statValue: { color: '#e8e8eb', fontSize: 24, fontWeight: 900, margin: 0, textAlign: 'center' },

  sectionCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '22px 26px' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#e8e8eb', margin: '0 0 14px' },
  sectionTitleCenter: { fontSize: 16, fontWeight: 800, color: '#e8e8eb', margin: '0 0 16px', textAlign: 'center' },

  list: { margin: 0, paddingLeft: 18, listStyleType: 'disc' },
  listItem: { color: '#e8e8eb', fontSize: 13, lineHeight: 1.7, marginBottom: 4 },

  downloadBtn: { background: 'rgba(196,160,82,0.12)', color: '#c4a052', border: '1px solid rgba(196,160,82,0.2)', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },

  atsScoreBox: { display: 'inline-flex', flexDirection: 'column', alignItems: 'center', border: '1px solid', borderRadius: 14, padding: '14px 32px', gap: 2 },

  emptyTab: { textAlign: 'center', padding: '40px 20px', color: '#6b6b70', fontSize: 14 },
};
