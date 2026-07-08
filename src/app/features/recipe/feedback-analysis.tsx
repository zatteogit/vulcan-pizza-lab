/* ═══ FEEDBACK ANALYSIS PANEL — VPL-075 ═══
   Pannello analisi feedback nei DevTools (Engine Lab → sub-tab "Feedback").
   Mostra: calibrazione pesi, frequenza problemi, success rate per stile,
   adversarial findings confermati/smentiti dal feedback utente. */

import {
Activity,
AlertTriangle,
BarChart3,
Bug,
Check,
CheckCircle2,
ChevronDown,
Copy,
Download,
HelpCircle,
Info,
Target,
Trash2,
TrendingDown,
TrendingUp,
Upload
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import React,{ useCallback,useMemo,useState } from "react";
import {
analyzeCalibration,
analyzeIssueFrequency,
analyzeStyleSuccessRate,
clearAllFeedback,
crossReferenceAdversarialWithFeedback,
exportFeedbackCSV,
exportFeedbackJSON,
importFeedbackJSON,
loadFeedback,
type AdversarialFinding,
type CalibrationResult,
type RecipeFeedback
} from "./feedback-store";

export function FeedbackAnalysisPanel() {
  const [feedback, setFeedback] = useState<RecipeFeedback[]>(() => loadFeedback());
  const [activeSection, setActiveSection] = useState<string | null>("overview");
  const [copyDone, setCopyDone] = useState(false);

  const reload = useCallback(() => setFeedback(loadFeedback()), []);

  const calibration = useMemo(() => analyzeCalibration(feedback), [feedback]);
  const issueFreq = useMemo(() => analyzeIssueFrequency(feedback), [feedback]);
  const styleSuccess = useMemo(() => analyzeStyleSuccessRate(feedback), [feedback]);
  const adversarial = useMemo(
    () => crossReferenceAdversarialWithFeedback(feedback),
    [feedback],
  );

  const attempted = feedback.filter((f) => f.attempted);
  const successCount = attempted.filter((f) => f.success).length;

  const handleExport = useCallback(() => {
    const json = exportFeedbackJSON();
    navigator.clipboard.writeText(json).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    }).catch(() => {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = json;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    });
  }, []);

  const handleExportCSV = useCallback(() => {
    const csv = exportFeedbackCSV();
    // Trigger download as file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vulcan-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(() => {
    const input = prompt("Incolla il JSON di feedback:");
    if (input) {
      const count = importFeedbackJSON(input);
      reload();
      alert(`Importati ${count} nuovi feedback.`);
    }
  }, [reload]);

  const handleClear = useCallback(() => {
    if (confirm("Eliminare tutti i feedback? Questa azione è irreversibile.")) {
      clearAllFeedback();
      reload();
    }
  }, [reload]);

  return (
    <div className="feedback-analysis">
      {/* Header */}
      <div className="feedback-analysis__header">
        <div className="feedback-analysis__header-info">
          <div className="feedback-analysis__header-title">
            Feedback & Calibrazione
          </div>
          <div className="type-body feedback-analysis__header-meta">
            {feedback.length} feedback · {attempted.length} tentati · {successCount} riusciti
          </div>
        </div>
        <div className="feedback-analysis__header-actions">
          <SmallButton icon={copyDone ? <Check className="feedback-analysis__btn-icon" /> : <Copy className="feedback-analysis__btn-icon" />} label="Export" onClick={handleExport} />
          <SmallButton icon={<Download className="feedback-analysis__btn-icon" />} label="Export CSV" onClick={handleExportCSV} />
          <SmallButton icon={<Upload className="feedback-analysis__btn-icon" />} label="Import" onClick={handleImport} />
          <SmallButton icon={<Trash2 className="feedback-analysis__btn-icon" />} label="Reset" onClick={handleClear} danger />
        </div>
      </div>

      {/* Sections */}
      <Section
        id="overview"
        title="Panoramica Calibrazione"
        icon={<Target className="feedback-analysis__section-icon-svg" />}
        active={activeSection}
        onToggle={setActiveSection}
      >
        {calibration[0]?.verdict === "insufficient_data" ? (
          <EmptyState message={`Servono almeno 5 feedback con rating per l'analisi di calibrazione. Attualmente: ${calibration[0].sampleCount}.`} />
        ) : (
          <div className="feedback-analysis__list feedback-analysis__list--wide-gap">
            {calibration.map((cal) => (
              <CalibrationRow key={cal.dimension} cal={cal} />
            ))}
          </div>
        )}
      </Section>

      <Section
        id="issues"
        title="Problemi Frequenti"
        icon={<AlertTriangle className="feedback-analysis__section-icon-svg" />}
        active={activeSection}
        onToggle={setActiveSection}
        badge={issueFreq.length > 0 ? issueFreq.length : undefined}
      >
        {issueFreq.length === 0 ? (
          <EmptyState message="Nessun problema segnalato. I feedback con issues popoleranno questa sezione." />
        ) : (
          <div className="feedback-analysis__list">
            {issueFreq.slice(0, 10).map((issue) => (
              <div key={issue.issueId} className="feedback-analysis__row">
                <div className="feedback-analysis__issue-info">
                  <span className="type-body-lg feedback-analysis__issue-label">
                    {issue.label}
                  </span>
                  <span className="type-body-sm feedback-analysis__issue-meta">
                    H̄={issue.avgParams.hydration}% · T̄={issue.avgParams.ovenTemp}°C · t̄={issue.avgParams.fermentHours}h
                  </span>
                </div>
                <div
                  className={`feedback-analysis__issue-count${issue.count >= 3 ? " feedback-analysis__issue-count--hot" : ""}`}
                >
                  {issue.count}×
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        id="styles"
        title="Success Rate per Stile"
        icon={<BarChart3 className="feedback-analysis__section-icon-svg" />}
        active={activeSection}
        onToggle={setActiveSection}
      >
        {styleSuccess.length === 0 ? (
          <EmptyState message="Nessun tentativo registrato. Prova una ricetta e lascia feedback!" />
        ) : (
          <div className="feedback-analysis__list">
            {styleSuccess.map((s) => (
              <div key={s.styleId} className="feedback-analysis__row">
                <div className="feedback-analysis__style-info">
                  <span className="type-body-lg feedback-analysis__style-name">
                    {s.styleName}
                  </span>
                  <span className="type-body-sm feedback-analysis__style-meta">
                    {s.attempts} tentativi · predicted {s.avgPredictedComposite}
                    {s.calibrationGap !== 0 && (
                      <span className={`feedback-analysis__style-gap${s.calibrationGap > 10 ? " feedback-analysis__style-gap--high" : ""}`}>
                        {" "}({s.calibrationGap > 0 ? "+" : ""}{s.calibrationGap} bias)
                      </span>
                    )}
                  </span>
                </div>
                <div className="feedback-analysis__style-rate-wrap">
                  <SuccessBar rate={s.successRate} />
                  <span className={`feedback-analysis__style-rate${
                    s.successRate >= 70 ? "" : s.successRate >= 40 ? " feedback-analysis__style-rate--mid" : " feedback-analysis__style-rate--low"
                  }`}>
                    {s.successRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        id="adversarial"
        title="Audit Adversarial"
        icon={<Bug className="feedback-analysis__section-icon-svg" />}
        active={activeSection}
        onToggle={setActiveSection}
        badge={adversarial.filter((f) => f.confirmedByFeedback).length || undefined}
      >
        <div className="type-body feedback-analysis__adversarial-intro">
          Problemi noti nel motore, incrociati con feedback utente per conferma/smentita.
        </div>
        <div className="feedback-analysis__list">
          {adversarial.map((finding) => (
            <AdversarialRow key={finding.id} finding={finding} />
          ))}
        </div>
      </Section>
    </div>
  );
}

// ═══ SUB-COMPONENTS ═══

function SmallButton({
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <motion.button
      className={`feedback-analysis__btn${danger ? " feedback-analysis__btn--danger" : ""}`}
      onClick={onClick}
      aria-label={label}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function Section({
  id, title, icon, active, onToggle, children, badge,
}: {
  id: string; title: string; icon: React.ReactNode;
  active: string | null; onToggle: (id: string | null) => void;
  children: React.ReactNode; badge?: number;
}) {
  const isOpen = active === id;
  return (
    <div className="feedback-analysis__section">
      <motion.button
        className="feedback-analysis__section-trigger"
        onClick={() => onToggle(isOpen ? null : id)}
        aria-expanded={isOpen}
      >
        <div className="feedback-analysis__section-heading">
          <span className="feedback-analysis__section-icon">{icon}</span>
          <span className="type-body-lg feedback-analysis__section-title">
            {title}
          </span>
          {badge !== undefined && badge > 0 && (
            <span className="feedback-analysis__section-badge">
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <ChevronDown className="feedback-analysis__section-chevron" />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="feedback-analysis__section-panel"
          >
            <div className="feedback-analysis__section-panel-inner">
              <div className="feedback-analysis__section-panel-content">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalibrationRow({ cal }: { cal: CalibrationResult }) {
  const dimLabels: Record<string, string> = {
    authenticity: "Autenticità",
    feasibility: "Fattibilità",
    digestibility: "Digeribilità",
    composite: "Composito",
  };
  const verdictColors: Record<string, string> = {
    calibrated: "var(--cta)",
    overestimates: "var(--primary)",
    underestimates: "var(--tertiary)",
    uncorrelated: "var(--muted-foreground)",
    insufficient_data: "var(--muted-foreground)",
  };
  const verdictLabels: Record<string, string> = {
    calibrated: "Calibrato",
    overestimates: "Sovrastima",
    underestimates: "Sottostima",
    uncorrelated: "Non correlato",
    insufficient_data: "Dati insufficienti",
  };
  const VerdictIcon = cal.verdict === "calibrated" ? CheckCircle2
    : cal.verdict === "overestimates" ? TrendingUp
    : cal.verdict === "underestimates" ? TrendingDown
    : cal.verdict === "uncorrelated" ? Activity
    : HelpCircle;

  return (
    <div className="feedback-analysis__row feedback-analysis__row--tall">
      <div className="feedback-analysis__calibration-info">
        <span className="type-body-lg feedback-analysis__calibration-label">
          {dimLabels[cal.dimension] ?? cal.dimension}
        </span>
        <span className="feedback-analysis__calibration-stats">
          bias={cal.meanBias > 0 ? "+" : ""}{cal.meanBias} · σ={cal.stdDev} · r={cal.correlation} · n={cal.sampleCount}
        </span>
      </div>
      <div
        className="feedback-analysis__calibration-verdict"
        style={{ ["--tone" as any]: verdictColors[cal.verdict] }}
      >
        <VerdictIcon className="feedback-analysis__calibration-verdict-icon" />
        <span className="type-body feedback-analysis__calibration-verdict-label">
          {verdictLabels[cal.verdict]}
        </span>
      </div>
    </div>
  );
}

function SuccessBar({ rate }: { rate: number }) {
  const toneClass = rate >= 70 ? "" : rate >= 40 ? " feedback-analysis__success-bar-fill--mid" : " feedback-analysis__success-bar-fill--low";
  return (
    <div className="feedback-analysis__success-bar">
      <div
        className={`feedback-analysis__success-bar-fill${toneClass}`}
        style={{ ["--rate" as any]: `${rate}%` }}
      />
    </div>
  );
}

function AdversarialRow({ finding }: { finding: AdversarialFinding }) {
  const [expanded, setExpanded] = useState(false);
  const severityLabels: Record<string, string> = {
    bug: "BUG",
    bias: "BIAS",
    noise: "NOISE",
  };

  return (
    <div className={`feedback-analysis__adversarial${finding.confirmedByFeedback ? " feedback-analysis__adversarial--confirmed" : ""}`}>
      <motion.button
        className="feedback-analysis__adversarial-trigger"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`feedback-analysis__severity-badge${
          finding.severity === "bug" ? " feedback-analysis__severity-badge--bug"
          : finding.severity === "bias" ? " feedback-analysis__severity-badge--bias"
          : " feedback-analysis__severity-badge--noise"
        }`}>
          {severityLabels[finding.severity]}
        </span>
        <span className="feedback-analysis__adversarial-id">
          {finding.id}
        </span>
        <span className="type-body feedback-analysis__adversarial-title">
          {finding.title}
        </span>
        {finding.fixed && (
          <span className="feedback-analysis__adversarial-tag feedback-analysis__adversarial-tag--fixed">
            FIXED
          </span>
        )}
        {finding.confirmedByFeedback && (
          <span className="feedback-analysis__adversarial-tag feedback-analysis__adversarial-tag--confirmed">
            CONFERMATO
          </span>
        )}
        {finding.feedbackCount > 0 && !finding.confirmedByFeedback && (
          <span className="feedback-analysis__adversarial-fbcount">
            {finding.feedbackCount}fb
          </span>
        )}
      </motion.button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="feedback-analysis__adversarial-panel"
          >
            <div className="feedback-analysis__adversarial-detail">
              <div className="feedback-analysis__adversarial-desc">
                {finding.description}
              </div>
              <div className="feedback-analysis__adversarial-styles">
                <span className="feedback-analysis__adversarial-detail-label">Stili:</span>{" "}
                {finding.affectedStyles.join(", ")}
              </div>
              <div className="feedback-analysis__adversarial-fix">
                <span className="feedback-analysis__adversarial-detail-label">Fix:</span>{" "}
                {finding.suggestedFix}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="feedback-analysis__empty">
      <Info className="feedback-analysis__empty-icon" />
      {message}
    </div>
  );
}
