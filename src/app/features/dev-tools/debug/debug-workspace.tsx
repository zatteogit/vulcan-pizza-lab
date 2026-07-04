import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Bug,
  MousePointerClick,
  Trash2,
  X,
  ClipboardCopy,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  MapPin,
  Cloud,
  CloudOff,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Annotation, ToolType } from "./annotation-types";
import { getCssSelector, getParentContext, getComputedStylesData } from "./dom-helpers";
import { compilePrompt } from "./compile-prompt";
import { useConsoleCapture } from "./use-console-capture";
import { usePinPositions } from "./use-pin-positions";
import { useAnnotations } from "./use-annotations";

interface DebugWorkspaceProps {
  showToast: (msg: string) => void;
}

function readRecipeDraft(): any {
  try {
    const draft = localStorage.getItem("vulcan_create_draft");
    return draft ? JSON.parse(draft) : null;
  } catch {
    return null;
  }
}

export function DebugWorkspace({ showToast }: DebugWorkspaceProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const { annotations, upsert, remove, setResolved, clearAll, remoteConfigured, syncing, lastSync, refresh } =
    useAnnotations();
  const consoleLogsRef = useConsoleCapture();

  const [isOpen, setIsOpen] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showPins, setShowPins] = useState(true);

  // Drawing & UI lock states
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolType>("pointer");

  // Selection states
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [hoveredSelector, setHoveredSelector] = useState("");
  const [hoveredTag, setHoveredTag] = useState("");
  const activeHoverTarget = useRef<HTMLElement | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formComment, setFormComment] = useState("");
  const [formPriority, setFormPriority] = useState<"low" | "medium" | "high">("medium");
  const [firstDrawPoint, setFirstDrawPoint] = useState<{ pageX: number; pageY: number } | null>(null);
  const [tempAnnotation, setTempAnnotation] = useState<Partial<Annotation> | null>(null);

  const pinPositions = usePinPositions(annotations, location.pathname, true);

  /* ═══ MOUSE INSPECTION CAPTURE ═══ */
  useEffect(() => {
    if (!isSelecting || currentTool !== "pointer") {
      setHoveredRect(null);
      setHoveredSelector("");
      setHoveredTag("");
      activeHoverTarget.current = null;
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target.closest("#vulcan-debug-ui") || target.closest(".vulcan-debug-exclude")) {
        setHoveredRect(null);
        setHoveredSelector("");
        setHoveredTag("");
        activeHoverTarget.current = null;
        return;
      }
      if (activeHoverTarget.current === target) return;
      activeHoverTarget.current = target;
      setHoveredRect(target.getBoundingClientRect());
      setHoveredSelector(getCssSelector(target));
      setHoveredTag(target.tagName.toLowerCase());
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target.closest("#vulcan-debug-ui") || target.closest(".vulcan-debug-exclude")) return;

      e.preventDefault();
      e.stopPropagation();

      const selector = getCssSelector(target);
      const parentSnippet = getParentContext(target);
      const rect = target.getBoundingClientRect();
      const computedStyles = getComputedStylesData(target);
      const pageX = rect.left + window.scrollX;
      const pageY = rect.top + window.scrollY;

      setTempAnnotation({
        id: `anno-${Date.now()}`,
        selector,
        route: location.pathname,
        elementTag: target.tagName.toLowerCase(),
        outerHTML: target.outerHTML,
        parentHTML: parentSnippet,
        timestamp: new Date().toLocaleTimeString(),
        viewport: { width: window.innerWidth, height: window.innerHeight },
        elementRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        computedStyles,
        recipeStateAtClick: readRecipeDraft(),
        consoleLogsAtClick: [...consoleLogsRef.current],
        pageX,
        pageY,
      });

      setIsSelecting(false);
      setIsDrawingMode(false);
      setHoveredRect(null);
      setHoveredSelector("");
      setHoveredTag("");
      activeHoverTarget.current = null;
      setIsFormOpen(true);
    };

    window.addEventListener("mousemove", handleMouseMove, true);
    window.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove, true);
      window.removeEventListener("click", handleClick, true);
    };
  }, [isSelecting, currentTool, location.pathname, consoleLogsRef]);

  /* ═══ CANVAS SIZE INIT ═══ */
  /* ═══ PIN PLACEMENT ═══ */
  const handlePinPlacement = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (currentTool !== "simple-pin") return;

    e.preventDefault();
    e.stopPropagation();
    const clientX = "touches" in e && e.touches.length > 0 ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e && e.touches.length > 0 ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const pageX = clientX + window.scrollX;
    const pageY = clientY + window.scrollY;

    setTempAnnotation({
      id: `anno-${Date.now()}`,
      selector: "body",
      route: location.pathname,
      elementTag: "simple-pin",
      outerHTML: "<!-- simple-pin -->",
      parentHTML: "",
      timestamp: new Date().toLocaleTimeString(),
      viewport: { width: window.innerWidth, height: window.innerHeight },
      elementRect: { top: clientY, left: clientX, width: 24, height: 24 },
      computedStyles: {
        display: "block", position: "absolute", width: "24px", height: "24px",
        padding: "0", margin: "0", fontSize: "0", fontWeight: "normal",
        color: "inherit", backgroundColor: "transparent", boxShadow: "none", zIndex: "auto", opacity: "1",
      },
      recipeStateAtClick: readRecipeDraft(),
      consoleLogsAtClick: [...consoleLogsRef.current],
      pageX,
      pageY,
    });

    setIsDrawingMode(false);
    setIsSelecting(false);
    setIsFormOpen(true);
  };

  /* ═══ FORM SUBMIT ═══ */
  const resetForm = () => {
    setFormComment("");
    setFormPriority("medium");
    setFirstDrawPoint(null);
    setTempAnnotation(null);
    setIsFormOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim() || !tempAnnotation) return;

    upsert({
      ...(tempAnnotation as Annotation),
      comment: formComment.trim(),
      priority: formPriority,
    });
    showToast(annotations.some((a) => a.id === tempAnnotation.id) ? "Annotazione Aggiornata" : "Nuovo Pin Salvato");

    resetForm();
    setIsOpen(true);
  };

  const openEditForm = (anno: Annotation) => {
    if (anno.route !== location.pathname) {
      navigate(anno.route);
    }
    setTempAnnotation(anno);
    setFormComment(anno.comment);
    setFormPriority(anno.priority || "medium");
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    remove(id);
    showToast("Pin Eliminato");
  };

  const handleCopyPrompt = () => {
    if (annotations.length === 0) {
      showToast("Aggiungi dei Pin prima!");
      return;
    }
    navigator.clipboard
      .writeText(compilePrompt(annotations, consoleLogsRef.current))
      .then(() => showToast("Prompt Copiato in Appunti!"))
      .catch(() => showToast("Errore di scrittura negli appunti"));
  };

  const startNewPin = () => {
    resetForm();
    setIsOpen(false);
    setIsDrawingMode(true);
    setCurrentTool("pointer");
    setIsSelecting(true);
  };

  return (
    <>
      {/* ── SKETCH LAYERS (scaled to current viewport width) ── */}
      {showPins && (
        <div
          className="vulcan-debug-exclude pointer-events-none"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 99990 }}
        >
          {annotations.map((anno) => {
            if (anno.route !== location.pathname || !anno.drawingDataURL) return null;
            const capturedW = anno.viewport?.width || window.innerWidth;
            const capturedH = anno.viewport?.height || window.innerHeight;
            const scale = window.innerWidth / capturedW;
            return (
              <img
                key={`sketch-${anno.id}`}
                src={anno.drawingDataURL}
                alt="Visual sketch drawing"
                style={{
                  position: "absolute",
                  top: `${anno.scrollTop || 0}px`,
                  left: `${anno.scrollLeft || 0}px`,
                  width: `${window.innerWidth}px`,
                  height: `${capturedH * scale}px`,
                  opacity: anno.resolved ? 0.25 : 1,
                  pointerEvents: "none",
                }}
              />
            );
          })}
        </div>
      )}

      {/* ── FLOATING PINS ── */}
      {showPins && !isDrawingMode && (
        <div
          className="vulcan-debug-exclude pointer-events-none"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 99991 }}
        >
          {annotations.map((anno, idx) => {
            const pos = pinPositions[anno.id];
            if (!pos || !pos.visible) return null;
            const dotColor = anno.resolved
              ? "var(--text-success)"
              : anno.elementTag === "simple-pin"
                ? "var(--cta)"
                : "var(--primary)";
            return (
              <div
                key={anno.id}
                style={{ position: "absolute", top: `${pos.top}px`, left: `${pos.left}px`, transform: "translate(-50%, -50%)" }}
                className="flex items-center justify-center pointer-events-auto"
              >
                <div className="group relative cursor-pointer" onClick={(e) => { e.stopPropagation(); openEditForm(anno); }}>
                  {!anno.resolved && (
                    <span className="absolute inline-flex h-full w-full rounded-full opacity-30 animate-pulse scale-125" style={{ background: dotColor }} />
                  )}
                  <div
                    className="relative flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-lg transition-transform hover:scale-110 active:scale-90"
                    style={{ background: dotColor, color: "var(--primary-foreground)", border: "1.5px solid var(--container-bg)" }}
                  >
                    {anno.resolved ? <Check size={12} /> : anno.index || idx + 1}
                  </div>
                  <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block z-[999999]">
                    <div className="px-2.5 py-1.5 rounded-lg text-xs shadow-xl border w-max text-center" style={{ background: "var(--container-bg)", borderColor: "var(--container-border)", color: "var(--text-default)" }}>
                      {anno.comment}
                      <div className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                        {anno.elementTag === "simple-pin" ? "Pin Libero" : `<${anno.elementTag}> Elemento`} · Clicca per modificare
                      </div>
                    </div>
                    <div className="w-2 h-2 border-r border-b rotate-45 mx-auto -mt-1.5" style={{ background: "var(--container-bg)", borderColor: "var(--container-border)" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── HOVER OUTLINE ── */}
      <AnimatePresence>
        {isSelecting && hoveredRect && currentTool === "pointer" && (
          <div
            className="vulcan-debug-exclude pointer-events-none"
            style={{
              position: "fixed", top: `${hoveredRect.top}px`, left: `${hoveredRect.left}px`,
              width: `${hoveredRect.width}px`, height: `${hoveredRect.height}px`,
              border: "2px dashed var(--primary)",
              boxShadow: "0 0 12px color-mix(in srgb, var(--primary) 40%, transparent)",
              background: "color-mix(in srgb, var(--primary) 10%, transparent)",
              borderRadius: "4px", zIndex: 99992,
            }}
          >
            <div style={{ position: "absolute", top: hoveredRect.top > 25 ? "-24px" : "4px", left: "4px", fontSize: "10px", padding: "2px 6px", borderRadius: "3px", background: "var(--container-bg)", border: "1px solid var(--container-border)", color: "var(--primary)", fontWeight: "bold" }}>
              {hoveredTag}
              {hoveredSelector.includes(".") && (
                <span style={{ color: "var(--text-muted)", marginLeft: "4px" }}>.{hoveredSelector.split(".").slice(1, 3).join(".")}</span>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DRAWING CANVAS ── */}
      {/* ── PIN INTERCEPTOR BACKDROP ── */}
      {isDrawingMode && currentTool === "simple-pin" && (
        <div
          onClick={handlePinPlacement}
          onTouchStart={handlePinPlacement}
          className="vulcan-debug-exclude"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99993,
            background: "rgba(0, 0, 0, 0.08)",
            cursor: "cell",
            pointerEvents: "auto",
          }}
        />
      )}

      {/* ── DRAWING TOOLBAR ── */}
      <AnimatePresence>
        {isDrawingMode && (
          <motion.div
            initial={{ y: -50, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: -50, x: "-50%", opacity: 0 }}
            className="fixed top-6 left-1/2 z-[99994] vulcan-debug-exclude flex items-center gap-3 p-2.5 rounded-xl border shadow-2xl"
            style={{ background: "var(--premium-glass-bg)", backdropFilter: "var(--premium-glass-backdrop, blur(24px))", borderColor: "var(--premium-glass-border)", boxShadow: "var(--premium-glass-shadow)" }}
          >
            <div className="flex items-center gap-1">
              {([
                { tool: "pointer" as const, icon: MousePointerClick, title: "Seleziona Elemento (HTML Selector)", select: true },
                { tool: "simple-pin" as const, icon: MapPin, title: "Piazza Pin Semplice", select: false },
              ]).map(({ tool, icon: Icon, title, select }) => (
                <button
                  key={tool}
                  onClick={() => { setCurrentTool(tool); setIsSelecting(select); }}
                  className="p-2 rounded-lg transition-colors active:scale-95"
                  style={{ background: currentTool === tool ? "var(--primary)" : "transparent", color: currentTool === tool ? "var(--primary-foreground)" : "var(--text-default)" }}
                  title={title}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>

            <div className="w-px h-6" style={{ background: "var(--container-border)" }} />

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setIsDrawingMode(false); setIsSelecting(false); setTempAnnotation(null); setIsOpen(true); }}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-95"
                style={{ color: "var(--text-error)" }}
                title="Esci"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ANNOTATION FORM ── */}
      <AnimatePresence>
        {isFormOpen && tempAnnotation && (
          <div className="fixed inset-0 z-[99997] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm vulcan-debug-exclude">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-5 rounded-2xl border shadow-2xl flex flex-col gap-4"
              style={{ background: "var(--premium-glass-bg)", borderColor: "var(--premium-glass-border)", color: "var(--text-default)", boxShadow: "var(--premium-glass-shadow)" }}
            >
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: "var(--container-border)" }}>
                <div className="flex items-center gap-2">
                  <Bug size={16} style={{ color: "var(--text-error)" }} />
                  <h3 className="font-semibold text-base">
                    {annotations.some((a) => a.id === tempAnnotation.id) ? "Modifica Annotazione" : "Aggiungi Annotazione"}
                  </h3>
                </div>
                <button onClick={() => { resetForm(); setIsOpen(true); }} className="p-1 rounded-lg transition-colors border" style={{ background: "transparent", borderColor: "transparent", color: "var(--text-default)" }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Contesto Elemento</label>
                  <div className="p-2.5 rounded-lg font-mono text-[10px] break-all border animate-fade-in" style={{ background: "var(--surface-container)", borderColor: "var(--container-border)", color: "var(--text-muted)" }}>
                    {tempAnnotation.elementTag === "simple-pin" ? (
                      <span className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--primary)" }}>
                        <MapPin size={11} /> Pin Libero (Coordinate: x={Math.round(tempAnnotation.pageX || 0)}, y={Math.round(tempAnnotation.pageY || 0)})
                      </span>
                    ) : (
                      <>&lt;{tempAnnotation.elementTag}&gt; {tempAnnotation.selector}</>
                    )}
                    {tempAnnotation.drawingDataURL && (
                      <span className="block mt-1 font-semibold" style={{ color: "var(--text-success)" }}>✓ Disegno sketch salvato in allegato</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>Descrivi il problema o la modifica</label>
                  <textarea
                    autoFocus
                    required
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Scrivi qui il commento per il bug-fix..."
                    className="w-full min-h-[95px] p-3 rounded-lg text-sm border focus:ring-1 outline-none"
                    style={{ background: "var(--surface-container)", borderColor: "var(--container-border)", color: "var(--text-default)" }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>Priorità</label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map((p) => {
                      const labels = { low: "Bassa", medium: "Media", high: "Alta" };
                      const colors = { low: "var(--text-success)", medium: "var(--primary)", high: "var(--text-error)" };
                      const bgMix = {
                        low: "color-mix(in srgb, var(--text-success) 12%, transparent)",
                        medium: "color-mix(in srgb, var(--primary) 12%, transparent)",
                        high: "color-mix(in srgb, var(--text-error) 12%, transparent)",
                      };
                      const isSelected = formPriority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormPriority(p)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 text-center"
                          style={{ borderColor: isSelected ? colors[p] : "var(--container-border)", background: isSelected ? bgMix[p] : "transparent", color: isSelected ? colors[p] : "var(--text-muted)" }}
                        >
                          {labels[p]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  {annotations.some((a) => a.id === tempAnnotation.id) ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { if (tempAnnotation.id) { handleDelete(tempAnnotation.id); resetForm(); setIsOpen(true); } }}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all active:scale-95"
                        style={{ color: "var(--text-error)", backgroundColor: "color-mix(in srgb, var(--text-error) 10%, transparent)", borderColor: "color-mix(in srgb, var(--text-error) 25%, transparent)" }}
                      >
                        <Trash2 size={13} />
                        Elimina
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const anno = annotations.find((a) => a.id === tempAnnotation.id);
                          if (anno) {
                            setResolved(anno.id, !anno.resolved);
                            showToast(anno.resolved ? "Riaperta" : "Segnata come risolta");
                            resetForm();
                            setIsOpen(true);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all active:scale-95"
                        style={{ color: "var(--text-success)", backgroundColor: "color-mix(in srgb, var(--text-success) 10%, transparent)", borderColor: "color-mix(in srgb, var(--text-success) 25%, transparent)" }}
                      >
                        <CheckCircle2 size={13} />
                        {annotations.find((a) => a.id === tempAnnotation.id)?.resolved ? "Riapri" : "Risolta"}
                      </button>
                    </div>
                  ) : (
                    <div />
                  )}

                  <div className="flex gap-2">
                    <button type="button" onClick={() => { resetForm(); setIsOpen(true); }} className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors" style={{ background: "transparent", borderColor: "var(--container-border)", color: "var(--text-default)" }}>
                      Annulla
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all active:scale-95 hover:opacity-90" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                      Salva
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FAB ── */}
      {!isDrawingMode && (
        <div className="fixed z-[99996] vulcan-debug-exclude flex flex-col items-end gap-3" style={{ right: "16px", bottom: "80px" }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl border transition-all active:scale-90 hover:scale-105"
            style={{ background: "var(--premium-glass-bg)", borderColor: "var(--premium-glass-border)", color: isOpen ? "var(--primary)" : "var(--text-default)", boxShadow: "var(--premium-glass-shadow)", backdropFilter: "var(--premium-glass-backdrop, blur(16px))" }}
            title="AI Debugger (Ctrl+Option+A o Ctrl+Shift+X)"
          >
            <Bug size={20} className={isOpen ? "animate-pulse" : ""} />
          </button>
        </div>
      )}

      {/* ── CONTROL PANEL ── */}
      <AnimatePresence>
        {isOpen && !isDrawingMode && (
          <motion.div
            initial={{ y: 80, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 80, scale: 0.95, opacity: 0 }}
            id="vulcan-debug-ui"
            style={{
              position: "fixed", right: "16px", bottom: "144px", width: "calc(100% - 32px)", maxWidth: "360px", maxHeight: "460px",
              display: "flex", flexDirection: "column", gap: "12px", padding: "16px", borderRadius: "16px",
              border: "1px solid var(--premium-glass-border)", background: "var(--premium-glass-bg)",
              backdropFilter: "var(--premium-glass-backdrop, blur(24px))", boxShadow: "var(--premium-glass-shadow)",
              zIndex: 99995, overflow: "hidden",
            }}
          >
            <div className="flex justify-between items-center pb-2.5 border-b" style={{ borderColor: "var(--container-border)" }}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
                <Bug size={14} />
                <span>AI Debug Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="flex items-center gap-1 text-[9px] font-semibold"
                  style={{ color: remoteConfigured ? "var(--text-success)" : "var(--text-muted)" }}
                  title={remoteConfigured ? "Sync cloud attiva (D1)" : "Solo locale: imposta VITE_ANNOTATIONS_API per la sync cloud"}
                >
                  {remoteConfigured ? <Cloud size={13} /> : <CloudOff size={13} />}
                  {lastSync ? new Date(lastSync).toLocaleTimeString() : ""}
                </span>
                <button
                  onClick={() => { void refresh(); }}
                  disabled={syncing}
                  className="p-1 rounded-md transition-colors disabled:opacity-50"
                  style={{ color: "var(--text-muted)", background: "transparent" }}
                  title="Sync ora"
                >
                  <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-md transition-colors" style={{ color: "var(--text-muted)", background: "transparent" }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={startNewPin} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-bold text-white transition-all active:scale-95" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                <MousePointerClick size={13} />
                Nuovo Pin
              </button>
              <button onClick={handleCopyPrompt} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-bold border transition-all active:scale-95" style={{ background: "transparent", borderColor: "var(--container-border)", color: "var(--text-default)" }}>
                <ClipboardCopy size={13} />
                Copia Prompt
              </button>
              <button onClick={() => setShowPins(!showPins)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-bold border transition-all active:scale-95" style={{ background: showPins ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent", borderColor: showPins ? "var(--primary)" : "var(--container-border)", color: showPins ? "var(--primary)" : "var(--text-muted)" }}>
                {showPins ? <Eye size={13} /> : <EyeOff size={13} />}
                Pin: {showPins ? "Visibili" : "Nascosti"}
              </button>
              <button
                onClick={() => {
                  if (annotations.length === 0) return;
                  if (window.confirm("Sei sicuro di voler eliminare TUTTI i pin nel registro?")) {
                    clearAll();
                    showToast("Registro Svuotato");
                  }
                }}
                disabled={annotations.length === 0}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-bold border disabled:opacity-50 transition-all active:scale-95"
                style={{ background: "transparent", borderColor: "var(--container-border)", color: "var(--text-default)" }}
              >
                <Trash2 size={13} />
                Svuota Tutto
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-1 flex flex-col gap-2 pr-1" style={{ maxHeight: "180px" }}>
              <div className="text-[10px] font-semibold uppercase tracking-wider flex justify-between" style={{ color: "var(--text-muted)" }}>
                <span>Pin nel Registro ({annotations.length})</span>
                {annotations.length > 0 && <span style={{ fontSize: "8px", opacity: 0.7 }}>Clicca su un pin per modificarlo</span>}
              </div>

              {annotations.length === 0 ? (
                <div className="h-24 flex flex-col items-center justify-center border border-dashed rounded-xl p-3 text-center" style={{ borderColor: "var(--container-border)" }}>
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Nessun pin inserito. Clicca su "Nuovo Pin" per iniziare.</span>
                </div>
              ) : (
                annotations.map((anno, idx) => (
                  <div
                    key={anno.id}
                    className="p-2.5 rounded-lg border flex items-start justify-between gap-2 text-xs cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    onClick={() => openEditForm(anno)}
                    style={{ borderColor: "var(--container-border)", background: anno.route === location.pathname ? "color-mix(in srgb, var(--primary) 6%, transparent)" : "var(--container-bg)", opacity: anno.resolved ? 0.6 : 1 }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0" style={{ background: anno.resolved ? "color-mix(in srgb, var(--text-success) 15%, transparent)" : "color-mix(in srgb, var(--primary) 15%, transparent)", color: anno.resolved ? "var(--text-success)" : "var(--primary)" }}>
                          {anno.resolved ? <Check size={9} /> : anno.index || idx + 1}
                        </span>
                        <span className="font-medium break-words truncate block" style={{ color: "var(--text-default)", fontSize: "11px", textDecoration: anno.resolved ? "line-through" : "none" }}>
                          {anno.comment}
                        </span>
                      </div>
                      <div className="text-[9px] mt-1 flex gap-2 flex-wrap" style={{ color: "var(--text-muted)" }}>
                        <span>Strada: <strong style={{ color: "var(--text-default)" }}>{anno.route}</strong></span>
                        <span>{anno.elementTag === "simple-pin" ? "Pin Libero" : `Tag: <${anno.elementTag}>`}</span>
                        <span className="font-bold" style={{ color: anno.priority === "high" ? "var(--text-error)" : anno.priority === "low" ? "var(--text-success)" : "var(--primary)" }}>
                          · {anno.priority === "high" ? "Alta" : anno.priority === "low" ? "Bassa" : "Media"}
                        </span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(anno.id); }} className="p-1 rounded transition-colors flex-shrink-0" style={{ color: "var(--text-error)" }} title="Elimina Pin">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="text-[9px] text-center pt-1.5 border-t" style={{ borderColor: "var(--container-border)", color: "var(--text-muted)" }}>
              Scorciatoie: <kbd className="px-1 rounded border" style={{ borderColor: "var(--container-border)", background: "var(--surface-container)", color: "var(--text-default)" }}>Ctrl+Option+A</kbd> o <kbd className="px-1 rounded border" style={{ borderColor: "var(--container-border)", background: "var(--surface-container)", color: "var(--text-default)" }}>Ctrl+Shift+X</kbd>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
