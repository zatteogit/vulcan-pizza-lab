import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wheat, Check, ChevronRight } from "lucide-react";
import { FLOURS_DB, FLOUR_CATEGORY_LABELS, getEffectiveWRange } from "./flour-database";
import type { FlourEntry } from "./flour-database";
import { useCms } from "./cms/cms-context";

interface FlourSuggestionCardProps {
  styleId: string;
  recipeW: number;
  fermentationHours: number;
  selectedFlourId?: string | null;
  onSelectFlour?: (flour: FlourEntry | null) => void;
}

type CategoryId = FlourEntry["category"];

/* ═══ HELPERS ═══ */

/** Score a flour for compatibility (lower = better) */
function flourScore(f: FlourEntry, styleId: string, recipeW: number, fermH: number): number {
  const styleBonus = f.stili_compatibili.includes(styleId) ? 0 : 50;
  const wDist = Math.abs(f.w - recipeW);
  const fermOk = fermH >= f.fermentazione_min_h && fermH <= f.fermentazione_max_h ? 0 : 20;
  return wDist + styleBonus + fermOk;
}

/** Get categories that have compatible flours, sorted by best score */
function getCompatibleCategories(
  styleId: string, recipeW: number, fermH: number,
): { id: CategoryId; bestScore: number; count: number }[] {
  const catMap = new Map<CategoryId, { bestScore: number; count: number }>();

  for (const f of FLOURS_DB) {
    if (f.w === 0 && f.category === "gluten_free") continue; // skip zero-W GF for normal suggestions
    const score = flourScore(f, styleId, recipeW, fermH);
    const existing = catMap.get(f.category);
    if (!existing) {
      catMap.set(f.category, { bestScore: score, count: 1 });
    } else {
      existing.bestScore = Math.min(existing.bestScore, score);
      existing.count++;
    }
  }

  return Array.from(catMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => a.bestScore - b.bestScore);
}

/** Get flours for a category, sorted by compatibility */
function getFloursForCategory(
  cat: CategoryId, styleId: string, recipeW: number, fermH: number,
): FlourEntry[] {
  return FLOURS_DB
    .filter((f) => f.category === cat)
    .map((f) => ({ f, score: flourScore(f, styleId, recipeW, fermH) }))
    .sort((a, b) => a.score - b.score)
    .map((x) => x.f);
}

export function FlourSuggestionCard({
  styleId,
  recipeW,
  fermentationHours,
  selectedFlourId,
  onSelectFlour,
}: FlourSuggestionCardProps) {
  const { cms } = useCms();
  const [expanded, setExpanded] = useState(false);

  /* Derive selected flour's category to auto-open the right tab */
  const selectedFlour = selectedFlourId
    ? FLOURS_DB.find((f) => f.id === selectedFlourId) ?? null
    : null;

  const categories = useMemo(
    () => getCompatibleCategories(styleId, recipeW, fermentationHours),
    [styleId, recipeW, fermentationHours],
  );

  /* Default active category: selected flour's category, or the best-scoring one */
  const [activeCat, setActiveCat] = useState<CategoryId>(
    selectedFlour?.category ?? categories[0]?.id ?? "grano_tenero",
  );

  const floursInCat = useMemo(
    () => getFloursForCategory(activeCat, styleId, recipeW, fermentationHours),
    [activeCat, styleId, recipeW, fermentationHours],
  );

  /* Best overall suggestion (for collapsed header) */
  const bestFlour = useMemo(() => {
    if (selectedFlour) return selectedFlour;
    const all = FLOURS_DB
      .filter((f) => f.w > 0)
      .map((f) => ({ f, score: flourScore(f, styleId, recipeW, fermentationHours) }))
      .sort((a, b) => a.score - b.score);
    return all[0]?.f ?? null;
  }, [styleId, recipeW, fermentationHours, selectedFlour]);

  const handleSelect = (flour: FlourEntry) => {
    if (!onSelectFlour) return;
    if (selectedFlourId === flour.id) {
      onSelectFlour(null);
    } else {
      onSelectFlour(flour);
    }
  };

  if (!bestFlour) return null;

  const headerFlour = selectedFlour ?? bestFlour;
  const headerCat = FLOUR_CATEGORY_LABELS[headerFlour.category] ?? { emoji: "🌾", label: headerFlour.category };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28, delay: 0.15 }}
      className="mt-5 rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-container-low)",
        border: selectedFlourId
          ? "1px solid var(--tertiary)"
          : "1px solid var(--outline-variant)",
      }}
    >
      {/* ═══ COLLAPSED HEADER ═══ */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3.5 active:scale-[0.99] transition-transform"
        style={{ textAlign: "left" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(204,136,68,0.12)",
          }}
        >
          <Wheat size={15} style={{ color: "var(--tertiary)" }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--weight-semibold)" as any,
                color: "var(--text-default)",
              }}
            >
              {headerFlour.name}
            </span>
            <span
              className="type-numeric"
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--tertiary)",
                letterSpacing: "0.04em",
              }}
            >
              W{headerFlour.w}
            </span>
            {selectedFlourId && (
              <span
                className="px-1.5 py-0.5 rounded-md"
                style={{
                  fontSize: "var(--font-size-2xs)",
                  fontWeight: "var(--weight-bold)" as any,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  background: "rgba(204,136,68,0.12)",
                  color: "var(--tertiary)",
                }}
              >
                {cms.ui.badgeSelected || "Selezionata"}
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-muted)",
            }}
          >
            {headerFlour.producer} {"\u00B7"} {headerCat.emoji} {headerCat.label}
          </span>
        </div>

        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
        </motion.div>
      </motion.button>

      {/* ═══ EXPANDED: 2-LEVEL SELECTOR ═══ */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div style={{ borderTop: "1px solid var(--outline-variant)" }}>

              {/* ── LEVEL 1: Category chips ── */}
              <div className="px-4 pt-3 pb-2">
                <div
                  className="font-mono"
                  style={{
                    fontSize: "var(--font-size-2xs)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase" as const,
                    color: "var(--text-muted)",
                    marginBottom: 8,
                  }}
                >
                  TIPO DI FARINA
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(({ id, count }) => {
                    const meta = FLOUR_CATEGORY_LABELS[id] ?? { emoji: "🌾", label: id };
                    const isActive = activeCat === id;
                    const hasSelected = selectedFlour?.category === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setActiveCat(id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95"
                        style={{
                          background: isActive
                            ? "var(--chip-bg-active)"
                            : "var(--chip-bg)",
                          color: isActive
                            ? "var(--chip-text-active)"
                            : "var(--chip-text)",
                          border: isActive
                            ? "1px solid rgba(0,0,0,0)"
                            : hasSelected
                              ? "1.5px solid var(--tertiary)"
                              : "1px solid var(--chip-border)",
                          fontSize: "var(--font-size-sm)",
                          fontWeight: isActive ? "var(--weight-semibold)" as any : "var(--weight-medium)" as any,
                        }}
                      >
                        <span>{meta.emoji}</span>
                        <span>{meta.label}</span>
                        <span
                          className="type-numeric"
                          style={{
                            fontSize: "var(--font-size-2xs)",
                            opacity: 0.6,
                          }}
                        >
                          {count}
                        </span>
                        {hasSelected && !isActive && (
                          <Check size={10} style={{ color: "var(--tertiary)" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── LEVEL 2: Flour rows (tappable) ── */}
              <div style={{ borderTop: "1px solid var(--outline-variant)" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCat}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  >
                    {floursInCat.map((flour, i) => {
                      const isSelected = selectedFlourId === flour.id;
                      const isCompatible = flour.stili_compatibili.includes(styleId);
                      const [wMin, wMax] = getEffectiveWRange(flour);
                      const hasVariability = flour.w_std > 0;

                      return (
                        <motion.button
                          key={flour.id}
                          onClick={() => handleSelect(flour)}
                          className="w-full flex flex-col gap-1.5 px-4 py-3 text-left active:scale-[0.98] transition-transform"
                          style={{
                            background: isSelected
                              ? "rgba(204,136,68,0.08)"
                              : i % 2 === 0
                                ? "rgba(0,0,0,0)"
                                : "rgba(0,0,0,0.015)",
                            borderBottom: i < floursInCat.length - 1
                              ? "1px solid var(--outline-variant)"
                              : "none",
                          }}
                        >
                          {/* Row 1: Name + producer + check */}
                          <div className="flex items-center gap-2 w-full">
                            <div className="flex-1 min-w-0 flex items-baseline gap-2 flex-wrap">
                              <span
                                style={{
                                  fontSize: "var(--font-size-md)",
                                  fontWeight: isSelected ? "var(--weight-bold)" as any : "var(--weight-semibold)" as any,
                                  color: isSelected ? "var(--tertiary)" : "var(--text-default)",
                                }}
                              >
                                {flour.name}
                              </span>
                              {flour.producer !== "Generico" && (
                                <span
                                  style={{
                                    fontSize: "var(--font-size-xs)",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  {flour.producer}
                                </span>
                              )}
                              {isCompatible && (
                                <span
                                  className="px-1.5 py-0.5 rounded-md"
                                  style={{
                                    fontSize: "var(--font-size-2xs)",
                                    color: "var(--cta)",
                                    background: "rgba(43,123,85,0.08)",
                                    fontWeight: "var(--weight-semibold)" as any,
                                    letterSpacing: "0.04em",
                                  }}
                                >
                                  compatibile
                                </span>
                              )}
                            </div>
                            {/* Selection indicator */}
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background: isSelected ? "var(--tertiary)" : "rgba(0,0,0,0)",
                                border: isSelected
                                  ? "2px solid var(--tertiary)"
                                  : "2px solid var(--outline-variant)",
                                transition: "all 0.15s",
                              }}
                            >
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                >
                                  <Check size={12} style={{ color: "#fff" }} />
                                </motion.div>
                              )}
                            </div>
                          </div>

                          {/* Row 2: Data pills */}
                          <div className="flex flex-wrap gap-1.5">
                            <DataPill
                              label="W"
                              value={hasVariability ? `${flour.w} (${wMin}–${wMax})` : String(flour.w)}
                              accent={isSelected}
                            />
                            <DataPill label="P/L" value={flour.pl.toFixed(2)} accent={isSelected} />
                            <DataPill label="Prot" value={`${flour.proteine_pct}%`} />
                            <DataPill label="H" value={`${flour.idratazione_ideale_pct}%`} />
                            <DataPill label="Ferm" value={`${flour.fermentazione_min_h}\u2013${flour.fermentazione_max_h}h`} />
                            {flour.autolisi_necessaria && (
                              <span
                                className="px-2 py-0.5 rounded-md"
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "var(--text-warning)",
                                  background: "rgba(204,136,68,0.08)",
                                  border: "1px solid rgba(204,136,68,0.2)",
                                }}
                              >
                                {cms.ui.autolysisSuggested || "Autolisi"}
                              </span>
                            )}
                          </div>

                          {/* Row 3: Note (only if selected or expanded) */}
                          {isSelected && (
                            <motion.span
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ type: "spring", stiffness: 400, damping: 28 }}
                              style={{
                                fontSize: "var(--font-size-sm)",
                                color: "var(--text-muted)",
                                lineHeight: "var(--leading-reading)",
                                fontStyle: "italic",
                              }}
                            >
                              {flour.note}
                            </motion.span>
                          )}
                        </motion.button>
                      );
                    })}

                    {floursInCat.length === 0 && (
                      <div
                        className="px-4 py-6 text-center"
                        style={{
                          fontSize: "var(--font-size-sm)",
                          color: "var(--text-muted)",
                        }}
                      >
                        Nessuna farina in questa categoria
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ── Hint ── */}
              {onSelectFlour && (
                <div
                  className="px-4 py-2.5"
                  style={{
                    borderTop: "1px solid var(--outline-variant)",
                    background: "rgba(204,136,68,0.03)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                      lineHeight: "var(--leading-reading)",
                    }}
                  >
                    {cms.ui.flourSelectHint || "Tocca una farina per aggiornare automaticamente W e P/L della ricetta."}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══ DATA PILL ═══ */
function DataPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span
      className="px-2 py-0.5 rounded-md"
      style={{
        fontSize: "var(--font-size-xs)",
        color: accent ? "var(--tertiary)" : "var(--text-secondary)",
        background: accent
          ? "rgba(204,136,68,0.08)"
          : "var(--surface-container)",
        border: accent
          ? "1px solid rgba(204,136,68,0.25)"
          : "1px solid var(--outline-variant)",
        letterSpacing: "0.02em",
      }}
    >
      <span style={{ color: accent ? "var(--tertiary)" : "var(--text-muted)" }}>{label}</span>{" "}
      <span style={{ fontFeatureSettings: "'tnum'", fontWeight: accent ? "var(--weight-bold)" as any : undefined }}>{value}</span>
    </span>
  );
}
