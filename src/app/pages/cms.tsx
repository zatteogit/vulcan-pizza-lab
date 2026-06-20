import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Type,
  ListOrdered,
  LayoutGrid,
  Settings,
  Scale,
  Layers,
  Image,
  RotateCcw,
  Upload,
  Check,
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Undo2,
  Moon,
  Sun,
  Globe,
  TextCursorInput,
  Lightbulb,
} from "lucide-react";
import { useDarkMode } from "../components/root-layout";
import {
  useCms,
  CMS_SECTIONS,
  CMS_DEFAULTS,
  getByPath,
  type CmsSectionDef,
  type CmsFieldDef,
} from "../components/cms/cms-context";
import { Badge, Surface } from "../components/ds";
import { LOCALE_META } from "../components/cms/locales";

/* ═══ ICON MAP ═══ */
const ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number | string }>
> = {
  type: Type,
  "list-ordered": ListOrdered,
  "layout-grid": LayoutGrid,
  settings: Settings,
  scale: Scale,
  layers: Layers,
  image: Image,
  globe: Globe,
  "text-cursor-input": TextCursorInput,
  lightbulb: Lightbulb,
};

/* ═══ CMS PAGE ═══ */
export function CmsPage() {
  const { darkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const {
    cms,
    update,
    resetField,
    resetAll,
    isModified,
    modifiedCount,
    modifiedPaths,
    exportJSON,
    importOverrides,
  } = useCms();

  const [activeSection, setActiveSection] = useState(
    CMS_SECTIONS[0].id,
  );
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] =
    useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const currentSection =
    CMS_SECTIONS.find((s) => s.id === activeSection) ||
    CMS_SECTIONS[0];

  /* Count modified fields per section */
  const sectionModifiedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const section of CMS_SECTIONS) {
      counts[section.id] = section.fields.filter((f) =>
        isModified(f.path),
      ).length;
    }
    return counts;
  }, [isModified, modifiedPaths]);

  /* Export */
  const handleExport = useCallback(() => {
    const json = exportJSON();
    try {
      navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = json;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [exportJSON]);

  /* Import */
  const handleImport = useCallback(() => {
    try {
      const parsed = JSON.parse(importText);
      if (typeof parsed !== "object" || parsed === null)
        throw new Error("Non e un oggetto JSON valido");
      importOverrides(parsed);
      setShowImport(false);
      setImportText("");
      setImportError("");
    } catch (err: any) {
      setImportError(err.message || "JSON non valido");
    }
  }, [importText, importOverrides]);

  /* Reset all */
  const handleResetAll = useCallback(() => {
    resetAll();
    setShowResetConfirm(false);
  }, [resetAll]);

  /* Composite weight sum */
  const compositeSum = useMemo(() => {
    const dims = cms.scoreDimensions;
    return Object.values(dims).reduce(
      (sum, d) => sum + (d.weight || 0),
      0,
    );
  }, [cms.scoreDimensions]);

  const recSum = useMemo(() => {
    const w = cms.recommendationWeights;
    return w.time + w.oven + w.skill + w.equipment + w.pantry;
  }, [cms.recommendationWeights]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      {/* ═══ TOP BAR ═══ */}
      <header
        className="sticky top-0 z-50 px-4 sm:px-6 py-3 flex items-center gap-3"
        style={{
          background:
            "color-mix(in srgb, var(--container-page) 88%, transparent)",
          backdropFilter: "blur(24px) saturate(1.6)",
          borderBottom: "1px solid var(--border-muted)",
        }}
      >
        <motion.button
          onClick={() => navigate("/")}
          className="p-2 rounded-xl active:scale-95"
          aria-label="Torna alla home"
          style={{ color: "var(--text-muted)" }}
          whileHover={{ scale: 1.05 }}
        >
          <ArrowLeft size={18} />
        </motion.button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="font-mono"
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-accent)",
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
              }}
            >
              CMS
            </span>
            <h1
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--weight-semibold)" as any,
              }}
            >
              Content Manager
            </h1>
          </div>
        </div>

        {/* Status badge */}
        {modifiedCount > 0 && (
          <Badge size="xs" tone="tertiary">
            {modifiedCount} modific
            {modifiedCount === 1 ? "a" : "he"}
          </Badge>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <motion.button
            onClick={handleExport}
            className="p-2 rounded-xl active:scale-95"
            aria-label="Esporta CMS"
            style={{
              color: copied
                ? "var(--cta)"
                : "var(--text-muted)",
            }}
            whileHover={{ scale: 1.05 }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </motion.button>

          <motion.button
            onClick={() => setShowImport(!showImport)}
            className="p-2 rounded-xl active:scale-95"
            aria-label="Importa CMS"
            style={{
              color: showImport
                ? "var(--primary)"
                : "var(--text-muted)",
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Upload size={16} />
          </motion.button>

          {modifiedCount > 0 && (
            <motion.button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-xl active:scale-95"
              aria-label="Reset tutto"
              style={{ color: "var(--text-error)" }}
              whileHover={{ scale: 1.05 }}
            >
              <RotateCcw size={16} />
            </motion.button>
          )}

          <motion.button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl active:scale-95"
            aria-label={darkMode ? "Light mode" : "Dark mode"}
            style={{ color: "var(--text-muted)" }}
            whileHover={{ scale: 1.05 }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>
        </div>
      </header>

      {/* ═══ IMPORT PANEL ═══ */}
      <AnimatePresence>
        {showImport && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
            className="overflow-hidden border-b"
            style={{ borderColor: "var(--border-muted)" }}
          >
            <div
              className="p-4 flex flex-col gap-3"
              style={{
                background: "var(--surface-container-low)",
              }}
            >
              <div className="flex items-center gap-2">
                <Upload
                  size={14}
                  style={{ color: "var(--primary)" }}
                />
                <span
                  className="type-label"
                  style={{
                    color: "var(--text-default)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  Incolla JSON CMS
                </span>
              </div>
              <textarea
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportError("");
                }}
                className="w-full rounded-xl p-3 font-mono"
                rows={6}
                placeholder='{"hero":{"title_line1":"La mia",...}}'
                style={{
                  fontSize: "var(--font-size-xs)",
                  background: "var(--surface-container)",
                  color: "var(--text-default)",
                  border: "1px solid var(--outline-variant)",
                  resize: "vertical",
                }}
              />
              {importError && (
                <div
                  className="flex items-center gap-2"
                  style={{
                    color: "var(--text-error)",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  <AlertCircle size={12} /> {importError}
                </div>
              )}
              <div className="flex gap-2">
                <motion.button
                  onClick={handleImport}
                  className="px-4 py-2 rounded-xl active:scale-95"
                  style={{
                    background: "var(--cta)",
                    color: "white",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--weight-medium)" as any,
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  Importa
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowImport(false);
                    setImportText("");
                    setImportError("");
                  }}
                  className="px-4 py-2 rounded-xl active:scale-95"
                  style={{
                    background: "var(--surface-container)",
                    color: "var(--text-muted)",
                    fontSize: "var(--font-size-sm)",
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  Annulla
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ RESET CONFIRM ═══ */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
            className="overflow-hidden border-b"
            style={{ borderColor: "var(--border-muted)" }}
          >
            <div
              className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
              style={{
                background:
                  "color-mix(in srgb, var(--text-error) 8%, var(--container-page))",
              }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <AlertCircle
                  size={18}
                  style={{
                    color: "var(--text-error)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-default)",
                  }}
                >
                  Resettare tutte le {modifiedCount} modifiche
                  ai valori default?
                </span>
              </div>
              <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                <motion.button
                  onClick={handleResetAll}
                  className="px-4 py-2 rounded-xl active:scale-95 flex-1 sm:flex-initial"
                  style={{
                    background: "var(--text-error)",
                    color: "white",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--weight-medium)" as any,
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  Conferma reset
                </motion.button>
                <motion.button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-xl active:scale-95 flex-1 sm:flex-initial"
                  style={{
                    background: "var(--surface-container)",
                    color: "var(--text-muted)",
                    fontSize: "var(--font-size-sm)",
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  Annulla
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* ── SIDEBAR (desktop) ── */}
        <aside
          className="hidden lg:flex flex-col gap-1 p-3 overflow-y-auto"
          style={{
            width: 240,
            borderRight: "1px solid var(--border-muted)",
            background: "var(--surface-container-low)",
            flexShrink: 0,
          }}
        >
          <SidebarContent
            sections={CMS_SECTIONS}
            activeSection={activeSection}
            onSelect={setActiveSection}
            modifiedCounts={sectionModifiedCounts}
          />
        </aside>

        {/* ── MOBILE SECTION SELECTOR ── */}
        <div className="lg:hidden flex-shrink-0 z-40 w-full">
          <button
            onClick={() =>
              setMobileSidebarOpen(!mobileSidebarOpen)
            }
            className="w-full flex items-center justify-between px-4 py-3 active:scale-[0.99]"
            style={{
              background: "var(--surface-container-low)",
              borderBottom: "1px solid var(--border-muted)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--weight-medium)" as any,
              color: "var(--text-default)",
            }}
          >
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = ICON_MAP[currentSection.icon];
                return Icon ? <Icon size={14} /> : null;
              })()}
              {currentSection.label}
              {sectionModifiedCounts[currentSection.id] > 0 && (
                <Badge size="xs" tone="tertiary">
                  {sectionModifiedCounts[currentSection.id]}
                </Badge>
              )}
            </div>
            {mobileSidebarOpen ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
          <AnimatePresence>
            {mobileSidebarOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                className="overflow-hidden"
                style={{
                  background: "var(--surface-container-low)",
                  borderBottom: "1px solid var(--border-muted)",
                }}
              >
                <div className="p-3 flex flex-col gap-1">
                  <SidebarContent
                    sections={CMS_SECTIONS}
                    activeSection={activeSection}
                    onSelect={(id) => {
                      setActiveSection(id);
                      setMobileSidebarOpen(false);
                    }}
                    modifiedCounts={sectionModifiedCounts}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            >
              <SectionEditor
                section={currentSection}
                cms={cms}
                onUpdate={update}
                onReset={resetField}
                isModified={isModified}
                compositeSum={
                  activeSection === "scoring"
                    ? compositeSum
                    : undefined
                }
                recSum={
                  activeSection === "scoring"
                    ? recSum
                    : undefined
                }
              />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ═══ SIDEBAR CONTENT ═══ */
function SidebarContent({
  sections,
  activeSection,
  onSelect,
  modifiedCounts,
}: {
  sections: CmsSectionDef[];
  activeSection: string;
  onSelect: (id: string) => void;
  modifiedCounts: Record<string, number>;
}) {
  return (
    <div className="flex flex-col gap-1">
      {sections.map((s) => {
        const Icon = ICON_MAP[s.icon];
        const isActive = activeSection === s.id;
        const modCount = modifiedCounts[s.id] || 0;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left active:scale-[0.98] transition-transform"
            style={{
              background: isActive
                ? "var(--container-page)"
                : "transparent",
              color: isActive
                ? "var(--text-default)"
                : "var(--text-muted)",
              fontSize: "var(--font-size-sm)",
              fontWeight: isActive
                ? ("var(--weight-semibold)" as any)
                : ("var(--weight-medium)" as any),
              boxShadow: isActive ? "var(--shadow-sm)" : "none",
            }}
          >
            {Icon && (
              <span
                style={{
                  color: isActive
                    ? "var(--primary)"
                    : "var(--text-muted)",
                  flexShrink: 0,
                }}
              >
                <Icon size={14} />
              </span>
            )}
            <span className="flex-1 truncate">{s.label}</span>
            {modCount > 0 && (
              <Badge
                tone="tertiary"
                style={{
                  fontSize: "var(--font-size-xs)",
                  padding: "1px 6px",
                }}
              >
                {modCount}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ═══ SECTION EDITOR ═══ */
function SectionEditor({
  section,
  cms,
  onUpdate,
  onReset,
  isModified,
  compositeSum,
  recSum,
}: {
  section: CmsSectionDef;
  cms: any;
  onUpdate: (path: string, value: any) => void;
  onReset: (path: string) => void;
  isModified: (path: string) => boolean;
  compositeSum?: number;
  recSum?: number;
}) {
  /* Group fields by their first dot-segment after section prefix, or by explicit grouping */
  const groups = useMemo(() => {
    const map = new Map<string, CmsFieldDef[]>();
    for (const f of section.fields) {
      // Group by second segment: "timeSlots.tonight.label" → "tonight"
      const parts = f.path.split(".");
      let groupKey: string;
      if (parts.length >= 3) {
        groupKey = parts.slice(0, 2).join(".");
      } else {
        groupKey = parts[0];
      }
      if (!map.has(groupKey)) map.set(groupKey, []);
      map.get(groupKey)!.push(f);
    }
    return Array.from(map.entries());
  }, [section]);

  const hasModified = section.fields.some((f) =>
    isModified(f.path),
  );

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      {/* Section header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="font-mono"
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--primary)",
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
            }}
          >
            {section.id}
          </span>
          {hasModified && (
            <Badge size="xs" tone="tertiary">
              modificato
            </Badge>
          )}
        </div>
        <h2
          className="font-serif"
          style={{
            fontSize: "clamp(var(--font-size-5xl), 4vw, var(--font-size-6-5xl))",
            lineHeight: "var(--leading-tight)",
          }}
        >
          {section.label}
        </h2>
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--text-muted)",
            marginTop: 4,
          }}
        >
          {section.description}
        </p>
      </div>

      {/* Weight sum warnings for scoring section */}
      {compositeSum !== undefined && (
        <WeightSumBanner
          label="Composite Score"
          sum={compositeSum}
        />
      )}
      {recSum !== undefined && (
        <WeightSumBanner label="Recommendation" sum={recSum} />
      )}

      {/* Locale switcher for locale section */}
      {section.id === "locale" && <LocaleSwitcher />}

      {/* Field groups */}
      {groups.map(([groupKey, fields]) => (
        <Surface
          key={groupKey}
          className="p-4 flex flex-col gap-4"
        >
          {fields.map((field) => (
            <FieldEditor
              key={field.path}
              field={field}
              value={getByPath(cms, field.path)}
              defaultValue={getByPath(CMS_DEFAULTS, field.path)}
              modified={isModified(field.path)}
              onUpdate={(v) => onUpdate(field.path, v)}
              onReset={() => onReset(field.path)}
            />
          ))}
        </Surface>
      ))}
    </div>
  );
}

/* ═══ WEIGHT SUM BANNER ═══ */
function WeightSumBanner({
  label,
  sum,
}: {
  label: string;
  sum: number;
}) {
  const rounded = Math.round(sum * 100) / 100;
  const isGood = Math.abs(rounded - 1) < 0.001;
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: isGood
          ? "color-mix(in srgb, var(--cta) 10%, transparent)"
          : "color-mix(in srgb, var(--text-warning) 10%, transparent)",
        border: `1px solid ${isGood ? "var(--cta)" : "var(--text-warning)"}`,
      }}
    >
      {isGood ? (
        <Check size={14} style={{ color: "var(--cta)" }} />
      ) : (
        <AlertCircle
          size={14}
          style={{ color: "var(--text-warning)" }}
        />
      )}
      <span
        style={{
          fontSize: "var(--font-size-sm)",
          color: isGood ? "var(--cta)" : "var(--text-warning)",
        }}
      >
        {label}: somma pesi ={" "}
        <strong style={{ fontVariantNumeric: "tabular-nums" }}>
          {rounded.toFixed(2)}
        </strong>
        {isGood ? " — perfetto" : " — dovrebbe essere 1.00"}
      </span>
    </div>
  );
}

/* ═══ FIELD EDITOR ═══ */
function FieldEditor({
  field,
  value,
  defaultValue,
  modified,
  onUpdate,
  onReset,
}: {
  field: CmsFieldDef;
  value: any;
  defaultValue: any;
  modified: boolean;
  onUpdate: (v: any) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Label row */}
      <div className="flex items-center gap-2">
        <label
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--weight-medium)" as any,
            color: "var(--text-default)",
            flex: 1,
          }}
        >
          {field.label}
        </label>
        {modified && (
          <div className="flex items-center gap-1.5">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--tertiary)",
                flexShrink: 0,
              }}
            />
            <motion.button
              onClick={onReset}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg active:scale-95"
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-muted)",
                background: "var(--surface-container)",
              }}
              whileHover={{ scale: 1.02 }}
              aria-label={`Reset ${field.label}`}
            >
              <Undo2 size={10} />
              default
            </motion.button>
          </div>
        )}
      </div>

      {/* Description */}
      {field.description && (
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-muted)",
          }}
        >
          {field.description}
        </span>
      )}

      {/* Input */}
      {field.type === "text" && (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onUpdate(e.target.value)}
          className="w-full rounded-xl px-3 py-2"
          style={{
            fontSize: "var(--font-size-sm)",
            background: "var(--surface-container)",
            color: "var(--text-default)",
            border: modified
              ? "1px solid var(--tertiary)"
              : "1px solid var(--outline-variant)",
            outline: "none",
          }}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          value={value ?? ""}
          onChange={(e) => onUpdate(e.target.value)}
          rows={3}
          className="w-full rounded-xl px-3 py-2"
          style={{
            fontSize: "var(--font-size-sm)",
            background: "var(--surface-container)",
            color: "var(--text-default)",
            border: modified
              ? "1px solid var(--tertiary)"
              : "1px solid var(--outline-variant)",
            outline: "none",
            resize: "vertical",
          }}
        />
      )}

      {field.type === "url" && (
        <div className="flex gap-2 items-center">
          <input
            type="url"
            value={value ?? ""}
            onChange={(e) => onUpdate(e.target.value)}
            className="flex-1 rounded-xl px-3 py-2 font-mono"
            style={{
              fontSize: "var(--font-size-xs)",
              background: "var(--surface-container)",
              color: "var(--text-default)",
              border: modified
                ? "1px solid var(--tertiary)"
                : "1px solid var(--outline-variant)",
              outline: "none",
            }}
          />
          {value && (
            <div
              className="rounded-lg overflow-hidden flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                border: "1px solid var(--outline-variant)",
              }}
            >
              <img
                src={value}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display =
                    "none";
                }}
              />
            </div>
          )}
        </div>
      )}

      {field.type === "image" && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <input
              type="url"
              value={
                typeof value === "string" &&
                !value.startsWith("data:")
                  ? value
                  : ""
              }
              onChange={(e) => onUpdate(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 rounded-xl px-3 py-2 font-mono"
              style={{
                fontSize: "var(--font-size-xs)",
                background: "var(--surface-container)",
                color: "var(--text-default)",
                border: modified
                  ? "1px solid var(--tertiary)"
                  : "1px solid var(--outline-variant)",
                outline: "none",
              }}
            />
            <label
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl active:scale-95 transition-transform"
              style={{
                background: "var(--surface-container)",
                border: "1px solid var(--outline-variant)",
                cursor: "pointer",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--weight-medium)" as any,
                color: "var(--text-default)",
                whiteSpace: "nowrap" as any,
                flexShrink: 0,
              }}
            >
              <Upload size={12} />
              File
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    alert(
                      "Immagine troppo grande (max 2 MB). Verrà compressa automaticamente.",
                    );
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = reader.result as string;
                    /* Compress large images via canvas */
                    if (file.size > 512 * 1024) {
                      const img = new window.Image();
                      img.onload = () => {
                        const canvas =
                          document.createElement("canvas");
                        const maxDim = 800;
                        let w = img.width;
                        let h = img.height;
                        if (w > maxDim || h > maxDim) {
                          const ratio = Math.min(
                            maxDim / w,
                            maxDim / h,
                          );
                          w = Math.round(w * ratio);
                          h = Math.round(h * ratio);
                        }
                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                          ctx.drawImage(img, 0, 0, w, h);
                          onUpdate(
                            canvas.toDataURL(
                              "image/jpeg",
                              0.82,
                            ),
                          );
                        }
                      };
                      img.src = result;
                    } else {
                      onUpdate(result);
                    }
                  };
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {value && (
            <div className="flex items-center gap-2">
              <div
                className="rounded-lg overflow-hidden flex-shrink-0"
                style={{
                  width: 56,
                  height: 56,
                  border: "1px solid var(--outline-variant)",
                }}
              >
                <img
                  src={value}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    (
                      e.target as HTMLImageElement
                    ).style.display = "none";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                {typeof value === "string" &&
                value.startsWith("data:") ? (
                  <span
                    className="type-data"
                    style={{
                      fontSize: "var(--font-size-2xs)",
                      color: "var(--cta)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Upload size={10} />
                    File locale (
                    {Math.round(value.length / 1024)} KB base64)
                  </span>
                ) : (
                  <span
                    className="type-data font-mono"
                    style={{
                      fontSize: "var(--font-size-2xs)",
                      color: "var(--text-muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap" as any,
                      display: "block",
                    }}
                  >
                    {value}
                  </span>
                )}
              </div>
              <button
                onClick={() => onUpdate("")}
                className="flex-shrink-0 px-2 py-1 rounded-lg active:scale-95 transition-transform"
                style={{
                  background: "var(--surface-container)",
                  border: "1px solid var(--outline-variant)",
                  fontSize: "var(--font-size-2xs)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                Rimuovi
              </button>
            </div>
          )}
        </div>
      )}

      {field.type === "number" && (
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) =>
            onUpdate(parseFloat(e.target.value) || 0)
          }
          min={field.min}
          max={field.max}
          step={field.step || 1}
          className="w-full max-w-[200px] rounded-xl px-3 py-2"
          style={{
            fontSize: "var(--font-size-sm)",
            background: "var(--surface-container)",
            color: "var(--text-default)",
            border: modified
              ? "1px solid var(--tertiary)"
              : "1px solid var(--outline-variant)",
            outline: "none",
            fontVariantNumeric: "tabular-nums",
          }}
        />
      )}

      {field.type === "slider" && (
        <div className="flex items-center gap-3">
          <input
            type="range"
            value={value ?? 0}
            onChange={(e) =>
              onUpdate(parseFloat(e.target.value))
            }
            min={field.min ?? 0}
            max={field.max ?? 1}
            step={field.step ?? 0.01}
            className="flex-1"
            style={{
              accentColor: "var(--primary)",
            }}
          />
          <span
            className="font-mono"
            style={{
              fontSize: "var(--font-size-sm)",
              color: modified
                ? "var(--tertiary)"
                : "var(--text-default)",
              minWidth: 48,
              textAlign: "right",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {(typeof value === "number" ? value : 0).toFixed(2)}
          </span>
        </div>
      )}

      {/* Default value hint */}
      {modified && (
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-muted)",
            fontStyle: "italic",
          }}
        >
          Default:{" "}
          {typeof defaultValue === "number"
            ? defaultValue.toFixed(
                field.step && field.step < 1 ? 2 : 0,
              )
            : String(defaultValue)}
        </span>
      )}
    </div>
  );
}

/* ═══ LOCALE SWITCHER ═══ */
function LocaleSwitcher() {
  const { cms, switchLocale } = useCms();
  const currentLocale = cms.locale.id;

  return (
    <Surface className="p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <Globe size={14} style={{ color: "var(--primary)" }} />
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--weight-semibold)" as any,
            color: "var(--text-default)",
          }}
        >
          Cambia lingua
        </span>
      </div>
      <p
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--text-muted)",
        }}
      >
        Seleziona una lingua per caricare tutti i testi
        tradotti. Le lingue non disponibili saranno attivabili
        aggiungendo un bundle locale.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {LOCALE_META.map((meta) => {
          const isActive = currentLocale === meta.id;
          return (
            <motion.button
              key={meta.id}
              onClick={() => {
                if (meta.available) switchLocale(meta.id);
              }}
              disabled={!meta.available}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left active:scale-[0.97] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: isActive
                  ? "color-mix(in srgb, var(--primary) 12%, var(--container-page))"
                  : "var(--surface-container)",
                border: isActive
                  ? "1.5px solid var(--primary)"
                  : "1px solid var(--outline-variant)",
              }}
              whileHover={
                meta.available ? { scale: 1.02 } : undefined
              }
            >
              <span style={{ fontSize: "var(--font-size-3xl)" }}>
                {meta.flag}
              </span>
              <div className="flex flex-col min-w-0">
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: isActive
                      ? ("var(--weight-semibold)" as any)
                      : ("var(--weight-medium)" as any),
                    color: isActive
                      ? "var(--primary)"
                      : "var(--text-default)",
                  }}
                >
                  {meta.name}
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--text-muted)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {meta.id.toUpperCase()}
                  {!meta.available && " — coming soon"}
                </span>
              </div>
              {isActive && (
                <Check
                  size={14}
                  style={{
                    color: "var(--primary)",
                    marginLeft: "auto",
                    flexShrink: 0,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </Surface>
  );
}
