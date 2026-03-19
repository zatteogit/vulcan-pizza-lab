/* ═══ FEEDBACK ANALYSIS PANEL — VPL-075 ═══
   Pannello analisi feedback nei DevTools (Engine Lab → sub-tab "Feedback").
   Mostra: calibrazione pesi, frequenza problemi, success rate per stile,
   adversarial findings confermati/smentiti dal feedback utente. */

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Download,
  Upload,
  Trash2,
  ChevronDown,
  Bug,
  Target,
  Activity,
  XCircle,
  Copy,
  Check,
  HelpCircle,
} from "lucide-react";
import {
  loadFeedback,
  clearAllFeedback,
  exportFeedbackJSON,
  exportFeedbackCSV,
  importFeedbackJSON,
  analyzeCalibration,
  analyzeIssueFrequency,
  analyzeStyleSuccessRate,
  crossReferenceAdversarialWithFeedback,
  ADVERSARIAL_FINDINGS,
  type RecipeFeedback,
  type CalibrationResult,
  type AdversarialFinding,
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
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-default)" }}>
            Feedback & Calibrazione
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
            {feedback.length} feedback · {attempted.length} tentati · {successCount} riusciti
          </div>
        </div>
        <div className="flex gap-2">
          <SmallButton icon={copyDone ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />} label="Export" onClick={handleExport} />
          <SmallButton icon={<Download style={{ width: 12, height: 12 }} />} label="Export CSV" onClick={handleExportCSV} />
          <SmallButton icon={<Upload style={{ width: 12, height: 12 }} />} label="Import" onClick={handleImport} />
          <SmallButton icon={<Trash2 style={{ width: 12, height: 12 }} />} label="Reset" onClick={handleClear} danger />
        </div>
      </div>

      {/* Sections */}
      <Section
        id="overview"
        title="Panoramica Calibrazione"
        icon={<Target style={{ width: 14, height: 14 }} />}
        active={activeSection}
        onToggle={setActiveSection}
      >
        {calibration[0]?.verdict === "insufficient_data" ? (
          <EmptyState message={`Servono almeno 5 feedback con rating per l'analisi di calibrazione. Attualmente: ${calibration[0].sampleCount}.`} />
        ) : (
          <div className="flex flex-col gap-3">
            {calibration.map((cal) => (
              <CalibrationRow key={cal.dimension} cal={cal} />
            ))}
          </div>
        )}
      </Section>

      <Section
        id="issues"
        title="Problemi Frequenti"
        icon={<AlertTriangle style={{ width: 14, height: 14 }} />}
        active={activeSection}
        onToggle={setActiveSection}
        badge={issueFreq.length > 0 ? issueFreq.length : undefined}
      >
        {issueFreq.length === 0 ? (
          <EmptyState message="Nessun problema segnalato. I feedback con issues popoleranno questa sezione." />
        ) : (
          <div className="flex flex-col gap-2">
            {issueFreq.slice(0, 10).map((issue) => (
              <div
                key={issue.issueId}
                className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: "var(--surface-container)" }}
              >
                <div>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-default)" }}>
                    {issue.label}
                  </span>
                  <span style={{ fontSize: "0.6875rem", color: "var(--muted-foreground)", marginLeft: 8 }}>
                    H̄={issue.avgParams.hydration}% · T̄={issue.avgParams.ovenTemp}°C · t̄={issue.avgParams.fermentHours}h
                  </span>
                </div>
                <div
                  className="rounded-lg px-2 py-0.5"
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    background: issue.count >= 3 ? "var(--primary)" : "var(--surface-container-high)",
                    color: issue.count >= 3 ? "#ffffff" : "var(--text-default)",
                  }}
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
        icon={<BarChart3 style={{ width: 14, height: 14 }} />}
        active={activeSection}
        onToggle={setActiveSection}
      >
        {styleSuccess.length === 0 ? (
          <EmptyState message="Nessun tentativo registrato. Prova una ricetta e lascia feedback!" />
        ) : (
          <div className="flex flex-col gap-2">
            {styleSuccess.map((s) => (
              <div
                key={s.styleId}
                className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: "var(--surface-container)" }}
              >
                <div className="flex flex-col">
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-default)", fontWeight: 600 }}>
                    {s.styleName}
                  </span>
                  <span style={{ fontSize: "0.6875rem", color: "var(--muted-foreground)" }}>
                    {s.attempts} tentativi · predicted {s.avgPredictedComposite}
                    {s.calibrationGap !== 0 && (
                      <span style={{ color: s.calibrationGap > 10 ? "var(--primary)" : "var(--cta)" }}>
                        {" "}({s.calibrationGap > 0 ? "+" : ""}{s.calibrationGap} bias)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <SuccessBar rate={s.successRate} />
                  <span style={{
                    fontSize: "0.75rem",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    color: s.successRate >= 70 ? "var(--cta)" : s.successRate >= 40 ? "var(--tertiary)" : "var(--primary)",
                  }}>
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
        icon={<Bug style={{ width: 14, height: 14 }} />}
        active={activeSection}
        onToggle={setActiveSection}
        badge={adversarial.filter((f) => f.confirmedByFeedback).length || undefined}
      >
        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginBottom: 8 }}>
          Problemi noti nel motore, incrociati con feedback utente per conferma/smentita.
        </div>
        <div className="flex flex-col gap-2">
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
      className="rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 active:scale-95"
      onClick={onClick}
      style={{
        fontSize: "0.6875rem",
        border: `1px solid ${danger ? "var(--primary)" : "var(--outline-variant)"}`,
        background: "var(--surface-container)",
        color: danger ? "var(--primary)" : "var(--text-default)",
        cursor: "pointer",
      }}
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
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-container-low)",
        border: "1px solid var(--outline-variant)",
      }}
    >
      <motion.button
        className="w-full flex items-center justify-between px-4 py-3 active:scale-[0.98]"
        onClick={() => onToggle(isOpen ? null : id)}
        style={{ background: "none", border: "none", cursor: "pointer" }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--primary)" }}>{icon}</span>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-default)" }}>
            {title}
          </span>
          {badge !== undefined && badge > 0 && (
            <span
              className="rounded-full px-1.5 py-0.5"
              style={{
                fontSize: "0.625rem",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                background: "var(--primary)",
                color: "#ffffff",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <ChevronDown style={{ color: "var(--muted-foreground)", width: 14, height: 14 }} />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--outline-variant)" }}>
              <div className="pt-3">{children}</div>
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
    <div
      className="flex items-center justify-between px-3 py-2.5 rounded-xl"
      style={{ background: "var(--surface-container)" }}
    >
      <div className="flex flex-col">
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-default)" }}>
          {dimLabels[cal.dimension] ?? cal.dimension}
        </span>
        <span style={{ fontSize: "0.6875rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
          bias={cal.meanBias > 0 ? "+" : ""}{cal.meanBias} · σ={cal.stdDev} · r={cal.correlation} · n={cal.sampleCount}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <VerdictIcon style={{ width: 14, height: 14, color: verdictColors[cal.verdict] }} />
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: verdictColors[cal.verdict] }}>
          {verdictLabels[cal.verdict]}
        </span>
      </div>
    </div>
  );
}

function SuccessBar({ rate }: { rate: number }) {
  return (
    <div
      className="rounded-full overflow-hidden"
      style={{ width: 48, height: 6, background: "var(--surface-container-high)" }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${rate}%`,
          background: rate >= 70 ? "var(--cta)" : rate >= 40 ? "var(--tertiary)" : "var(--primary)",
          transition: "width 0.3s",
        }}
      />
    </div>
  );
}

function AdversarialRow({ finding }: { finding: AdversarialFinding }) {
  const [expanded, setExpanded] = useState(false);
  const severityColors: Record<string, string> = {
    bug: "var(--primary)",
    bias: "var(--tertiary)",
    noise: "var(--muted-foreground)",
  };
  const severityLabels: Record<string, string> = {
    bug: "BUG",
    bias: "BIAS",
    noise: "NOISE",
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--surface-container)",
        border: `1px solid ${finding.confirmedByFeedback ? "var(--primary)" : "var(--outline-variant)"}`,
      }}
    >
      <motion.button
        className="w-full flex items-center gap-2 px-3 py-2 active:scale-[0.98]"
        onClick={() => setExpanded(!expanded)}
        style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <span
          className="rounded px-1.5 py-0.5 shrink-0"
          style={{
            fontSize: "0.5625rem",
            fontFamily: "var(--font-mono)",
            fontWeight: 800,
            letterSpacing: "0.08em",
            background: severityColors[finding.severity],
            color: "#ffffff",
          }}
        >
          {severityLabels[finding.severity]}
        </span>
        <span
          className="rounded px-1 py-0.5 shrink-0"
          style={{
            fontSize: "0.5625rem",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            background: "var(--surface-container-high)",
            color: "var(--muted-foreground)",
          }}
        >
          {finding.id}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--text-default)", flex: 1 }}>
          {finding.title}
        </span>
        {finding.fixed && (
          <span
            className="rounded-full px-1.5 py-0.5 shrink-0"
            style={{
              fontSize: "0.5625rem",
              fontWeight: 700,
              background: "var(--cta)",
              color: "#ffffff",
            }}
          >
            FIXED
          </span>
        )}
        {finding.confirmedByFeedback && (
          <span
            className="rounded-full px-1.5 py-0.5 shrink-0"
            style={{
              fontSize: "0.5625rem",
              fontWeight: 700,
              background: "var(--primary)",
              color: "#ffffff",
            }}
          >
            CONFERMATO
          </span>
        )}
        {finding.feedbackCount > 0 && !finding.confirmedByFeedback && (
          <span style={{ fontSize: "0.625rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
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
            className="overflow-hidden"
          >
            <div
              className="px-3 pb-3 flex flex-col gap-2"
              style={{ borderTop: "1px solid var(--outline-variant)", fontSize: "0.75rem" }}
            >
              <div className="pt-2" style={{ color: "var(--text-default)" }}>
                {finding.description}
              </div>
              <div style={{ color: "var(--muted-foreground)" }}>
                <span style={{ fontWeight: 600 }}>Stili:</span>{" "}
                {finding.affectedStyles.join(", ")}
              </div>
              <div style={{ color: "var(--cta)" }}>
                <span style={{ fontWeight: 600 }}>Fix:</span>{" "}
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
    <div className="py-4 text-center" style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>
      <Info style={{ width: 20, height: 20, margin: "0 auto 8px", opacity: 0.5 }} />
      {message}
    </div>
  );
}