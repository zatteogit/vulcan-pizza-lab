/* === PRE-FERMENTS PAGE — VPL-069 ===
   Guida educativa completa: Biga, Poolish, Autolisi.
   Route: /learn/pre-ferments */

import { motion } from "motion/react";
import { FlaskConical, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import {
  PreFermentCard,
  PRE_FERMENT_DB,
  COMPARISON_ROWS,
} from "../components/pre-ferment-guide";

const PRE_FERMENT_ORDER = [
  "biga",
  "poolish",
  "autolisi",
] as const;

export function PreFermentsPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16"
      >
        {/* Back link */}
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 mb-8 active:scale-95 transition-transform"
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--weight-medium)" as any,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} />
          <span>Impara</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center mb-4"
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background:
                "color-mix(in srgb, var(--cta) 12%, rgba(0,0,0,0))",
            }}
          >
            <FlaskConical
              size={28}
              style={{ color: "var(--cta)" }}
            />
          </div>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              lineHeight: "var(--leading-snug)",
              color: "var(--text-default)",
            }}
          >
            Pre-fermenti
          </h1>
          <p
            className="font-serif italic mt-2"
            style={{
              fontSize: "var(--font-size-xl-5)",
              color: "var(--text-muted)",
              opacity: 0.65,
            }}
          >
            Biga, Poolish e Autolisi: quando e perche usarli.
          </p>
        </div>

        {/* Intro paragraph */}
        <div
          className="rounded-2xl px-5 py-4 mb-8"
          style={{
            background: "var(--container-bg-low)",
            border: "1px solid var(--container-border)",
          }}
        >
          <p
            style={{
              fontSize: "var(--font-size-lg)",
              lineHeight: "var(--leading-relaxed)",
              color: "var(--text-default)",
              margin: 0,
            }}
          >
            I pre-fermenti sono impasti preliminari che maturano
            prima dell'impasto finale. Migliorano sapore,
            struttura e digeribilita della pizza. Ogni tecnica
            ha caratteristiche uniche: la <strong>Biga</strong>{" "}
            (asciutta) dona complessita aromatica, il{" "}
            <strong>Poolish</strong> (liquido) regala leggerezza
            e crosta dorata, l'<strong>Autolisi</strong> (solo
            farina+acqua) sviluppa il glutine senza sforzo.
          </p>
        </div>

        {/* Pre-ferment cards */}
        <div className="flex flex-col gap-4 mb-10">
          {PRE_FERMENT_ORDER.map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                delay: i * 0.08,
              }}
            >
              <PreFermentCard preFermentType={id} />
            </motion.div>
          ))}
        </div>

        {/* Comparison table — always visible on this page */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            delay: 0.3,
          }}
        >
          <h2
            className="font-serif mb-4"
            style={{
              fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
              lineHeight: "var(--leading-snug)",
            }}
          >
            Confronto rapido
          </h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid var(--outline-variant)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "var(--font-size-md)",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}> </th>
                    <th
                      style={{
                        ...thStyle,
                        color: "var(--primary)",
                      }}
                    >
                      Biga
                    </th>
                    <th
                      style={{
                        ...thStyle,
                        color: "var(--cta)",
                      }}
                    >
                      Poolish
                    </th>
                    <th
                      style={{
                        ...thStyle,
                        color: "var(--tertiary)",
                      }}
                    >
                      Autolisi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.label}>
                      <td
                        style={{
                          ...tdStyle,
                          fontSize: "var(--font-size-xs)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase" as const,
                          color: "var(--muted-foreground)",
                          fontWeight:
                            "var(--weight-semibold)" as any,
                          background:
                            i % 2 === 0
                              ? "var(--surface-container-low)"
                              : "rgba(0,0,0,0)",
                        }}
                      >
                        {row.label}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          background:
                            i % 2 === 0
                              ? "var(--surface-container-low)"
                              : "rgba(0,0,0,0)",
                        }}
                      >
                        {row.biga}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          background:
                            i % 2 === 0
                              ? "var(--surface-container-low)"
                              : "rgba(0,0,0,0)",
                        }}
                      >
                        {row.poolish}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          background:
                            i % 2 === 0
                              ? "var(--surface-container-low)"
                              : "rgba(0,0,0,0)",
                        }}
                      >
                        {row.autolisi}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Decision guide */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            delay: 0.4,
          }}
          className="mt-8"
        >
          <h2
            className="font-serif mb-4"
            style={{
              fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
              lineHeight: "var(--leading-snug)",
            }}
          >
            Quale scegliere?
          </h2>
          <div className="flex flex-col gap-3">
            <DecisionCard
              emoji="🍞"
              title="Biga"
              when="Quando vuoi sapore complesso e crosta friabile"
              best="Napoletana classica, Pinsa, Pizza al taglio"
              color="var(--primary)"
            />
            <DecisionCard
              emoji="💧"
              title="Poolish"
              when="Quando vuoi leggerezza e crosta dorata intensa"
              best="Teglia Romana, NY Style, Focacce"
              color="var(--cta)"
            />
            <DecisionCard
              emoji="💦"
              title="Autolisi"
              when="Quando vuoi ridurre il tempo di impasto e migliorare l'estensibilita"
              best="Tutti gli stili — tecnica universale, combinabile con Biga/Poolish"
              color="var(--tertiary)"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* === DECISION CARD === */
function DecisionCard({
  emoji,
  title,
  when,
  best,
  color,
}: {
  emoji: string;
  title: string;
  when: string;
  best: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl px-4 py-3.5"
      style={{
        background: "var(--container-bg-low)",
        border: "1px solid var(--container-border)",
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span style={{ fontSize: "var(--font-size-xl)" }}>
          {emoji}
        </span>
        <span
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--weight-semibold)" as any,
            color,
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          fontSize: "var(--font-size-lg)",
          lineHeight: "var(--leading-relaxed)",
          color: "var(--text-default)",
        }}
      >
        {when}
      </div>
      <div
        className="mt-1"
        style={{
          fontSize: "var(--font-size-md)",
          color: "var(--text-muted)",
          lineHeight: "var(--leading-relaxed)",
        }}
      >
        Ideale per: {best}
      </div>
    </div>
  );
}

/* === TABLE STYLES === */
const thStyle: React.CSSProperties = {
  padding: "0.625rem 0.75rem",
  textAlign: "left",
  fontSize: "var(--font-size-xs)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  fontWeight: "var(--weight-semibold)" as any,
  borderBottom: "1px solid var(--outline-variant)",
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  color: "var(--text-default)",
  borderBottom: "1px solid var(--outline-variant)",
};