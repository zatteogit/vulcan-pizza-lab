import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router";
import { 
  Bug, 
  MousePointerClick, 
  Trash2, 
  X, 
  ClipboardCopy, 
  Eye, 
  EyeOff, 
  Edit3, 
  Check, 
  MapPin, 

  Square,
  Circle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ═══ TYPES ═══ */
interface ElementStyles {
  display: string;
  position: string;
  width: string;
  height: string;
  padding: string;
  margin: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  boxShadow: string;
  zIndex: string;
  opacity: string;
}

interface Annotation {
  id: string;
  index?: number;
  priority?: "low" | "medium" | "high";
  comment: string;
  selector: string;
  route: string;
  elementTag: string;
  outerHTML: string;
  parentHTML: string;
  timestamp: string;
  
  // Rich context details
  viewport: {
    width: number;
    height: number;
  };
  elementRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  computedStyles: ElementStyles;
  recipeStateAtClick?: any;
  consoleLogsAtClick?: ConsoleLog[];
  
  // Sketch drawing properties
  drawingDataURL?: string;
  scrollTop?: number;
  scrollLeft?: number;
  
  // Simple pin absolute coordinates
  pageX?: number;
  pageY?: number;
}

interface ConsoleLog {
  type: "error" | "warn";
  message: string;
  timestamp: string;
}

type ToolType = "pointer" | "simple-pin" | "freehand" | "rect" | "circle";

/* ═══ CSS SELECTOR HELPER ═══ */
function getCssSelector(el: HTMLElement): string {
  if (!(el instanceof HTMLElement)) return "";
  const path: string[] = [];
  let current: HTMLElement | null = el;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.nodeName.toLowerCase();
    
    if (current.id) {
      selector += "#" + current.id;
      path.unshift(selector);
      break; 
    }

    let className = current.className;
    if (typeof className === "string" && className.trim()) {
      const classes = className
        .trim()
        .split(/\s+/)
        .filter(c => c && !c.includes(":") && !c.startsWith("motion-") && !c.startsWith("active:"));
      if (classes.length > 0) {
        selector += "." + classes.slice(0, 3).join("."); 
      }
    }

    let sibling = current;
    let nth = 1;
    while (sibling.previousElementSibling) {
      sibling = sibling.previousElementSibling as HTMLElement;
      if (sibling.nodeName === current.nodeName) nth++;
    }
    if (nth > 1) {
      selector += `:nth-of-type(${nth})`;
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(" > ");
}

/* ═══ PARENT CONTEXT HELPER ═══ */
function getParentContext(element: HTMLElement): string {
  const parent = element.parentElement;
  if (!parent) return "";
  const tag = parent.tagName.toLowerCase();
  const idAttr = parent.id ? ` id="${parent.id}"` : "";
  const cleanClass = parent.className ? parent.className.replace(/\s+/g, " ").trim() : "";
  const classAttr = cleanClass ? ` class="${cleanClass}"` : "";

  return `<${tag}${idAttr}${classAttr}>\n  ...\n  ${element.outerHTML.slice(0, 800)}${element.outerHTML.length > 800 ? "..." : ""}\n  ...\n</${tag}>`;
}

/* ═══ COMPUTED STYLES CONTEXT HELPER ═══ */
function getComputedStylesData(el: HTMLElement): ElementStyles {
  const styles = window.getComputedStyle(el);
  return {
    display: styles.display || "inline",
    position: styles.position || "static",
    width: styles.width || "auto",
    height: styles.height || "auto",
    padding: `${styles.paddingTop} ${styles.paddingRight} ${styles.paddingBottom} ${styles.paddingLeft}`,
    margin: `${styles.marginTop} ${styles.marginRight} ${styles.marginBottom} ${styles.marginLeft}`,
    fontSize: styles.fontSize || "inherit",
    fontWeight: styles.fontWeight || "normal",
    color: styles.color || "inherit",
    backgroundColor: styles.backgroundColor || "transparent",
    boxShadow: styles.boxShadow || "none",
    zIndex: styles.zIndex || "auto",
    opacity: styles.opacity || "1",
  };
}

export function DebugOverlay() {
  const location = useLocation();
  
  // Total visibility toggle state (keyboard & mobile gesture)
  const [isEnabled, setIsEnabled] = useState(() => {
    try {
      return localStorage.getItem("vulcan_debug_overlay_enabled") === "true";
    } catch {
      return false;
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showPins, setShowPins] = useState(true);

  // Drawing & UI Lock States
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolType>("pointer");
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const canvasSnapshot = useRef<ImageData | null>(null);
  
  // Selection States
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [hoveredSelector, setHoveredSelector] = useState("");
  const [hoveredTag, setHoveredTag] = useState("");
  const activeHoverTarget = useRef<HTMLElement | null>(null);

  // Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formComment, setFormComment] = useState("");
  const [formPriority, setFormPriority] = useState<"low" | "medium" | "high">("medium");
  const [firstDrawPoint, setFirstDrawPoint] = useState<{ pageX: number; pageY: number } | null>(null);
  const [tempAnnotation, setTempAnnotation] = useState<Partial<Annotation> | null>(null);

  // Console Logs Store
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const consoleLogsRef = useRef<ConsoleLog[]>([]);

  // Pins position cache
  const [pinPositions, setPinPositions] = useState<Record<string, { top: number; left: number; visible: boolean }>>({});

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  /* ═══ TOAST & LOG SYNC ═══ */
  useEffect(() => {
    consoleLogsRef.current = consoleLogs;
  }, [consoleLogs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 2000);
  };

  /* ═══ SYNC ANNOTATIONS FILE ═══ */
  const syncAnnotationsWithFile = (updated: Annotation[]) => {
    fetch("/api/save-annotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated, null, 2),
    }).catch(err => {
      console.warn("Failed to sync annotations with local file", err);
    });
  };

  /* ═══ LOAD INITIAL DATA FROM FILE & CACHE ═══ */
  useEffect(() => {
    // 1. Try sessionStorage first for instant render
    try {
      const stored = sessionStorage.getItem("vulcan_debug_annotations");
      if (stored) {
        setAnnotations(JSON.parse(stored));
      }
    } catch {}

    // 2. Fetch from file system server endpoint for persistent source of truth
    fetch("/api/save-annotations")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        if (Array.isArray(data)) {
          let maxIndex = 0;
          let needsSave = false;
          const migrated = data.map((anno, idx) => {
            if (anno.index === undefined) {
              anno.index = idx + 1;
              needsSave = true;
            }
            maxIndex = Math.max(maxIndex, anno.index);
            return anno;
          });
          setAnnotations(migrated);
          try {
            sessionStorage.setItem("vulcan_debug_annotations", JSON.stringify(migrated));
          } catch {}
          if (needsSave) {
            syncAnnotationsWithFile(migrated);
          }
        }
      })
      .catch(() => {
        // Fallback silently if GET is not supported (e.g. preview mode)
      });
  }, []);

  /* ═══ SAVE ANNOTATIONS ═══ */
  const saveAnnotations = (updated: Annotation[]) => {
    setAnnotations(updated);
    try {
      sessionStorage.setItem("vulcan_debug_annotations", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save annotations to sessionStorage", e);
    }
    syncAnnotationsWithFile(updated);
  };

  /* ═══ HOOK CONSOLE LOGS ═══ */
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    const pushLog = (type: "error" | "warn", ...args: any[]) => {
      const message = args
        .map(arg => {
          if (arg instanceof Error) return arg.stack || arg.message;
          if (typeof arg === "object") {
            try { return JSON.stringify(arg); } catch { return "[Object]"; }
          }
          return String(arg);
        })
        .join(" ");

      setConsoleLogs(prev => {
        const next = [...prev, { type, message, timestamp: new Date().toLocaleTimeString() }];
        return next.slice(-20); 
      });
    };

    console.error = (...args) => {
      pushLog("error", ...args);
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      pushLog("warn", ...args);
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  /* ═══ DYNAMIC POSITIONING OF PINS WITH STATIC COORDINATES FALLBACK ═══ */
  const updatePinPositions = useCallback(() => {
    if (!isEnabled) return;
    
    const positions: Record<string, { top: number; left: number; visible: boolean }> = {};
    
    annotations.forEach(anno => {
      if (anno.route !== location.pathname) {
        positions[anno.id] = { top: 0, left: 0, visible: false };
        return;
      }

      // If it is a simple pin or a sketch layer, position it statically using stored pageX/pageY coordinates
      if ((anno.elementTag === "simple-pin" || anno.elementTag === "sketch-layer") && anno.pageX !== undefined && anno.pageY !== undefined) {
        positions[anno.id] = {
          top: anno.pageY,
          left: anno.pageX,
          visible: true
        };
        return;
      }

      // Try locating element dynamically in the DOM
      let found = false;
      if (anno.selector) {
        try {
          const el = document.querySelector(anno.selector);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              positions[anno.id] = {
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                visible: true
              };
              found = true;
            }
          }
        } catch (e) {}
      }

      // If not found in the current view state or unmounted, fallback to absolute coordinates captured on creation
      if (!found) {
        const fallbackTop = anno.pageY !== undefined 
          ? anno.pageY 
          : (anno.elementRect ? (anno.elementRect.top + (anno.scrollTop || 0)) : 0);
        
        const fallbackLeft = anno.pageX !== undefined 
          ? anno.pageX 
          : (anno.elementRect ? (anno.elementRect.left + (anno.scrollLeft || 0)) : 0);

        positions[anno.id] = {
          top: fallbackTop,
          left: fallbackLeft,
          visible: true
        };
      }
    });

    setPinPositions(positions);
  }, [annotations, location.pathname, isEnabled]);

  /* ═══ GLOBAL TOGGLE SHORTCUTS (Ctrl+Option+A / Ctrl+Shift+X & Mobile Triple Tap) ═══ */
  useEffect(() => {
    const toggleDebug = () => {
      setIsEnabled((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("vulcan_debug_overlay_enabled", String(next));
        } catch {}
        
        setIsOpen(next);
        if (!next) {
          setIsSelecting(false);
          setIsDrawingMode(false);
          setIsFormOpen(false);
        }

        showToast(next ? "AI Debugger Abilitato" : "AI Debugger Disabilitato");
        return next;
      });
    };

    const handleGlobalKeys = (e: KeyboardEvent) => {
      const isAltA = e.ctrlKey && e.altKey && (e.key === "a" || e.key === "A" || e.code === "KeyA");
      const isShiftX = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "x" || e.key === "X" || e.code === "KeyX");

      if (isAltA || isShiftX) {
        e.preventDefault();
        toggleDebug();
      }
    };

    let lastTap = 0;
    let tapCount = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTap < 350) {
        tapCount++;
        if (tapCount >= 3) {
          e.preventDefault();
          toggleDebug();
          tapCount = 0;
        }
      } else {
        tapCount = 1;
      }
      lastTap = now;
    };

    window.addEventListener("keydown", handleGlobalKeys);
    window.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleGlobalKeys);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  /* ═══ UPDATE PINS ON EVENTS & TRANSITION SETTLE TIMEOUTS ═══ */
  useEffect(() => {
    if (!isEnabled) return;
    
    updatePinPositions();

    window.addEventListener("scroll", updatePinPositions, { passive: true });
    window.addEventListener("resize", updatePinPositions, { passive: true });

    // Staggered timeouts to settle layout positioning after route shifts
    const t1 = setTimeout(updatePinPositions, 100);
    const t2 = setTimeout(updatePinPositions, 300);
    const t3 = setTimeout(updatePinPositions, 800);

    const interval = setInterval(updatePinPositions, 1500);

    return () => {
      window.removeEventListener("scroll", updatePinPositions);
      window.removeEventListener("resize", updatePinPositions);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [updatePinPositions, location.pathname, isEnabled]);

  /* ═══ CAPTURE MOUSE INSPECTION (IMMEDIATE EDIT WITHOUT DOUBLE CONFIRM) ═══ */
  useEffect(() => {
    if (!isEnabled || !isSelecting || currentTool !== "pointer") {
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

      const rect = target.getBoundingClientRect();
      const selector = getCssSelector(target);
      
      setHoveredRect(rect);
      setHoveredSelector(selector);
      setHoveredTag(target.tagName.toLowerCase());
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      if (target.closest("#vulcan-debug-ui") || target.closest(".vulcan-debug-exclude")) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const selector = getCssSelector(target);
      const parentSnippet = getParentContext(target);
      const rect = target.getBoundingClientRect();
      const computedStyles = getComputedStylesData(target);

      const draftState = localStorage.getItem("vulcan_create_draft");
      let recipeStateAtClick = null;
      if (draftState) {
        try {
          recipeStateAtClick = JSON.parse(draftState);
        } catch {}
      }

      // Record element coordinates page-relative
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
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        elementRect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        computedStyles,
        recipeStateAtClick,
        consoleLogsAtClick: [...consoleLogsRef.current],
        pageX,
        pageY,
      });

      // Exit selector and canvas drawing modes immediately and show form
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
  }, [isSelecting, currentTool, location.pathname, isEnabled]);

  /* ═══ INITIALIZE DRAWING CANVAS DIMENSIONS ═══ */
  useEffect(() => {
    if (isDrawingMode) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [isDrawingMode]);

  /* ═══ CANVAS DRAWING ACTION HANDLERS ═══ */
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e && e.touches.length > 0 ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e && e.touches.length > 0 ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startCanvasDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (currentTool === "pointer") return;
    
    // Simple pin placing takes action immediately on touch start / mousedown
    if (currentTool === "simple-pin") {
      e.preventDefault();
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = "touches" in e && e.touches.length > 0 ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = "touches" in e && e.touches.length > 0 ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      const pageX = clientX + window.scrollX;
      const pageY = clientY + window.scrollY;

      const draftState = localStorage.getItem("vulcan_create_draft");
      let recipeStateAtClick = null;
      if (draftState) {
        try { recipeStateAtClick = JSON.parse(draftState); } catch {}
      }

      setTempAnnotation({
        id: `anno-${Date.now()}`,
        selector: "body",
        route: location.pathname,
        elementTag: "simple-pin",
        outerHTML: "<!-- simple-pin -->",
        parentHTML: "",
        timestamp: new Date().toLocaleTimeString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        elementRect: { top: clientY, left: clientX, width: 24, height: 24 },
        computedStyles: {
          display: "block", position: "absolute", width: "24px", height: "24px",
          padding: "0", margin: "0", fontSize: "0", fontWeight: "normal",
          color: "inherit", backgroundColor: "transparent", boxShadow: "none", zIndex: "auto", opacity: "1"
        },
        recipeStateAtClick,
        consoleLogsAtClick: [...consoleLogsRef.current],
        pageX,
        pageY,
      });

      setIsDrawingMode(false);
      setIsSelecting(false);
      setIsFormOpen(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    
    // Record first touch/draw point to anchor the visual pin number badge next to it
    const clientX = "touches" in e && e.touches.length > 0 ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e && e.touches.length > 0 ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const pageX = clientX + window.scrollX;
    const pageY = clientY + window.scrollY;
    if (!firstDrawPoint) {
      setFirstDrawPoint({ pageX, pageY });
    }

    startPoint.current = { x, y };
    canvasSnapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (currentTool === "freehand") {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const computedStyles = window.getComputedStyle(document.body);
      ctx.strokeStyle = computedStyles.getPropertyValue("--primary").trim() || "tomato";
    }
    
    setIsDrawing(true);
  };

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    const startX = startPoint.current.x;
    const startY = startPoint.current.y;
    const computedStyles = window.getComputedStyle(document.body);
    const brandColor = computedStyles.getPropertyValue("--primary").trim() || "tomato";

    if (currentTool === "freehand") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === "rect" || currentTool === "circle") {
      if (canvasSnapshot.current) {
        ctx.putImageData(canvasSnapshot.current, 0, 0);
      }
      
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = brandColor;
      
      if (currentTool === "rect") {
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      } else if (currentTool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopCanvasDrawing = () => {
    setIsDrawing(false);
    startPoint.current = null;
    canvasSnapshot.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  /* ═══ SAVE ANNOTATION & CANVAS SKETCH ═══ */
  const handleSaveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    
    const baseAnnotation = tempAnnotation || {
      id: `anno-${Date.now()}`,
      selector: "body",
      route: location.pathname,
      elementTag: "sketch-layer",
      outerHTML: "<!-- canvas-sketch -->",
      parentHTML: "",
      timestamp: new Date().toLocaleTimeString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      elementRect: { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight },
      computedStyles: {
        display: "block", position: "static", width: "100%", height: "100%",
        padding: "0 0 0 0", margin: "0 0 0 0", fontSize: "16px", fontWeight: "normal",
        color: "inherit", backgroundColor: "transparent", boxShadow: "none", zIndex: "auto", opacity: "1"
      },
      pageX: firstDrawPoint ? firstDrawPoint.pageX : (window.innerWidth / 2 + window.scrollX),
      pageY: firstDrawPoint ? firstDrawPoint.pageY : (window.innerHeight / 2 + window.scrollY),
    };

    setTempAnnotation({
      ...baseAnnotation,
      scrollTop: window.scrollY,
      scrollLeft: window.scrollX,
      drawingDataURL: dataUrl,
    });

    setIsDrawingMode(false);
    setIsSelecting(false);
    setIsFormOpen(true);
  };

  /* ═══ FORM SUBMIT (HANDLES BOTH NEW & EDIT) ═══ */
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim() || !tempAnnotation) return;

    const existingIndex = annotations.findIndex(a => a.id === tempAnnotation.id);
    let updated: Annotation[] = [];

    if (existingIndex > -1) {
      // EDIT existing pin comment
      updated = [...annotations];
      updated[existingIndex] = {
        ...updated[existingIndex],
        comment: formComment.trim(),
        priority: formPriority,
      };
      showToast("Annotazione Aggiornata");
    } else {
      // ADD new pin
      const maxIndex = annotations.reduce((max, a) => Math.max(max, a.index || 0), 0);
      const newAnno: Annotation = {
        ...(tempAnnotation as Annotation),
        comment: formComment.trim(),
        priority: formPriority,
        index: maxIndex + 1,
      };
      updated = [...annotations, newAnno];
      showToast("Nuovo Pin Salvato");
    }

    saveAnnotations(updated);
    setFormComment("");
    setFormPriority("medium");
    setFirstDrawPoint(null);
    setTempAnnotation(null);
    setIsFormOpen(false);
    setIsOpen(true); 
  };

  /* ═══ DELETE ANNOTATION ═══ */
  const handleDeleteAnnotation = (id: string) => {
    const updated = annotations.filter(a => a.id !== id);
    saveAnnotations(updated);
    showToast("Pin Eliminato");
  };

  /* ═══ COMPILE FINAL AI PROMPT (REAL-TIME COMPILATION) ═══ */
  const compilePrompt = () => {
    const draftState = localStorage.getItem("vulcan_create_draft");
    
    let md = `### AI Code & UI Fix Request\n\n`;
    md += `I have visually annotated some issues in the interface. Below is the full technical context for each annotation, including target elements and parent code structures. Please modify the code files to resolve these issues.\n\n`;

    md += `#### 💻 Environment Metadata\n`;
    md += `- **Active Route**: \`${location.pathname}\`\n`;
    md += `- **Viewport Size**: \`${window.innerWidth}x${window.innerHeight}px\`\n`;
    md += `- **Theme State**: \`${document.documentElement.classList.contains("dark") ? "Dark Mode" : "Light Mode"}\`\n`;
    md += `- **User Agent**: \`${navigator.userAgent}\`\n\n`;

    if (draftState) {
      try {
        const parsed = JSON.parse(draftState);
        md += `#### 🍕 Active Pizza Engine Configuration State\n`;
        md += `\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\`\n\n`;
      } catch {
        md += `#### 🍕 Active Pizza Engine Configuration State\n`;
        md += `\`\`\`\n${draftState}\n\`\`\`\n\n`;
      }
    }

    md += `#### 📝 Annotations & Bug Details (${annotations.length})\n\n`;

    annotations.forEach((anno, i) => {
      md += `##### [Pin #${anno.index || (i + 1)}] — ${anno.comment}\n`;
      md += `- **Priorità**: \`${anno.priority ? (anno.priority === "high" ? "ALTA" : anno.priority === "low" ? "BASSA" : "MEDIA") : "MEDIA"}\`\n`;
      md += `- **Route**: \`${anno.route}\`\n`;
      md += `- **CSS Selector**: \`${anno.selector}\`\n`;
      md += `- **Target Element tag**: \`${anno.elementTag}\`\n`;
      
      if (anno.viewport) {
        md += `- **Viewport Size Context**: \`${anno.viewport.width}x${anno.viewport.height}px\`\n`;
      }
      if (anno.elementRect) {
        md += `- **Element Bounding Box**: \`top: ${Math.round(anno.elementRect.top)}px, left: ${Math.round(anno.elementRect.left)}px, width: ${Math.round(anno.elementRect.width)}px, height: ${Math.round(anno.elementRect.height)}px\`\n`;
      }
      if (anno.pageX !== undefined && anno.pageY !== undefined) {
        md += `- **Simple Pin Absolute Coordinates**: \`pageX: ${Math.round(anno.pageX)}px, pageY: ${Math.round(anno.pageY)}px\`\n`;
      }
      
      if (anno.computedStyles) {
        md += `- **Computed CSS Styles (Visual Context)**:\n`;
        md += `  - \`display\`: \`${anno.computedStyles.display}\`\n`;
        md += `  - \`position\`: \`${anno.computedStyles.position}\`\n`;
        md += `  - \`width / height\`: \`${anno.computedStyles.width} / ${anno.computedStyles.height}\`\n`;
        md += `  - \`padding\`: \`${anno.computedStyles.padding}\`\n`;
        md += `  - \`margin\`: \`${anno.computedStyles.margin}\`\n`;
        md += `  - \`fontSize / fontWeight\`: \`${anno.computedStyles.fontSize} / ${anno.computedStyles.fontWeight}\`\n`;
        md += `  - \`color / backgroundColor\`: \`${anno.computedStyles.color} / ${anno.computedStyles.backgroundColor}\`\n`;
        md += `  - \`zIndex / opacity\`: \`${anno.computedStyles.zIndex} / ${anno.computedStyles.opacity}\`\n`;
      }

      if (anno.recipeStateAtClick) {
        md += `- **Pizza Recipe Draft at click time**:\n`;
        md += `  \`\`\`json\n  ${JSON.stringify(anno.recipeStateAtClick, null, 2)}\n  \`\`\`\n`;
      }

      if (anno.consoleLogsAtClick && anno.consoleLogsAtClick.length > 0) {
        md += `- **Console logs snapshot at click time**:\n`;
        md += `  \`\`\`\n`;
        anno.consoleLogsAtClick.forEach(log => {
          md += `  [${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}\n`;
        });
        md += `  \`\`\`\n`;
      }

      md += `- **Target Element HTML**:\n`;
      md += `  \`\`\`html\n  ${anno.outerHTML.slice(0, 1000)}${anno.outerHTML.length > 1000 ? "\n  ... [truncated]" : ""}\n  \`\`\`\n`;
      
      if (anno.parentHTML) {
        md += `- **HTML Parent Context**:\n`;
        md += `  \`\`\`html\n  ${anno.parentHTML}\n  \`\`\`\n`;
      }
      md += `\n---\n\n`;
    });

    if (consoleLogs.length > 0) {
      md += `#### ⚠️ Session Console Logs (Errors & Warnings)\n`;
      md += `\`\`\`\n`;
      consoleLogs.forEach(log => {
        md += `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}\n`;
      });
      md += `\`\`\`\n\n`;
    }

    md += `#### 🛠️ Instructions for AI Fix:\n`;
    md += `1. **Design Tokens**: Adhere strictly to the design token tier system (T1-T4) configured in \`src/styles/theme.css\`. Avoid raw hex colors or layout sizes. Use semantic CSS variables.\n`;
    md += `2. **Responsive Styling**: Ensure the design remains fully responsive and mobile-optimized.\n`;
    md += `3. **Quality**: Fix the visual or logical bugs in the respective code files, matching the layout structure.\n`;

    return md;
  };

  /* ═══ COPY PROMPT DIRECTLY (ONE CLICK - REAL-TIME) ═══ */
  const handleCopyPromptRealTime = () => {
    if (annotations.length === 0) {
      showToast("Aggiungi dei Pin prima!");
      return;
    }
    const text = compilePrompt();
    navigator.clipboard.writeText(text).then(() => {
      showToast("Prompt Copiato in Appunti!");
    }).catch(() => {
      showToast("Errore di scrittura negli appunti");
    });
  };

  // If totally disabled, only render the toast messages so they can show deactivation confirmation
  if (!isEnabled) {
    return (
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-6 left-1/2 z-[100001] px-4 py-2 rounded-full border shadow-lg text-xs font-semibold"
            style={{
              background: "var(--premium-glass-bg)",
              borderColor: "var(--premium-glass-border)",
              color: "var(--text-default)",
              boxShadow: "var(--premium-glass-shadow)",
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      {/* ── VISUAL ANNOTATION FLOATING SKETCH LAYERS ── */}
      {showPins && (
        <div 
          className="vulcan-debug-exclude pointer-events-none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 99990,
          }}
        >
          {annotations.map((anno) => {
            if (anno.route !== location.pathname || !anno.drawingDataURL) return null;
            
            return (
              <img
                key={`sketch-${anno.id}`}
                src={anno.drawingDataURL}
                alt="Visual sketch drawing"
                style={{
                  position: "absolute",
                  top: `${anno.scrollTop || 0}px`,
                  left: `${anno.scrollLeft || 0}px`,
                  width: `${anno.viewport?.width || window.innerWidth}px`,
                  height: `${anno.viewport?.height || window.innerHeight}px`,
                  pointerEvents: "none",
                }}
              />
            );
          })}
        </div>
      )}

      {/* ── VISUAL ANNOTATION FLOATING PINS ── */}
      {showPins && !isDrawingMode && (
        <div 
          className="vulcan-debug-exclude pointer-events-none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 99991,
          }}
        >
          {annotations.map((anno, idx) => {
            const pos = pinPositions[anno.id];
            if (!pos || !pos.visible) return null;

            return (
              <div
                key={anno.id}
                style={{
                  position: "absolute",
                  top: `${pos.top}px`,
                  left: `${pos.left}px`,
                  transform: "translate(-50%, -50%)",
                }}
                className="flex items-center justify-center pointer-events-auto"
              >
                <div 
                  className="group relative cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Opens the edit form immediately when clicking a pin badge
                    setTempAnnotation(anno);
                    setFormComment(anno.comment);
                    setFormPriority(anno.priority || "medium");
                    setIsFormOpen(true);
                  }}
                >
                  {/* Subtle pulsing outer glow ring */}
                  <span 
                    className="absolute inline-flex h-full w-full rounded-full opacity-30 animate-pulse scale-125" 
                    style={{ background: anno.elementTag === "simple-pin" ? "var(--cta)" : "var(--primary)" }}
                  />
                  
                  <div 
                    className="relative flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-lg transition-transform hover:scale-110 active:scale-90"
                    style={{
                      background: anno.elementTag === "simple-pin" ? "var(--cta)" : "var(--primary)",
                      color: "var(--primary-foreground)",
                      border: "1.5px solid var(--container-bg)",
                    }}
                  >
                    {anno.index || (idx + 1)}
                  </div>

                  {/* Hover tooltip */}
                  <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block z-[999999]">
                    <div 
                      className="px-2.5 py-1.5 rounded-lg text-xs shadow-xl border w-max text-center"
                      style={{
                        background: "var(--container-bg)",
                        borderColor: "var(--container-border)",
                        color: "var(--text-default)",
                      }}
                    >
                      {anno.comment}
                      <div className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                        {anno.elementTag === "simple-pin" ? "Pin Libero" : `<${anno.elementTag}> Elemento`} · Clicca per modificare
                      </div>
                    </div>
                    {/* Tooltip triangle */}
                    <div 
                      className="w-2 h-2 border-r border-b rotate-45 mx-auto -mt-1.5" 
                      style={{
                        background: "var(--container-bg)",
                        borderColor: "var(--container-border)",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SELECTION HOVER OUTLINE OVERLAY ── */}
      <AnimatePresence>
        {isSelecting && hoveredRect && currentTool === "pointer" && (
          <div
            className="vulcan-debug-exclude pointer-events-none"
            style={{
              position: "fixed",
              top: `${hoveredRect.top}px`,
              left: `${hoveredRect.left}px`,
              width: `${hoveredRect.width}px`,
              height: `${hoveredRect.height}px`,
              border: "2px dashed var(--primary)",
              boxShadow: "0 0 12px color-mix(in srgb, var(--primary) 40%, transparent)",
              background: "color-mix(in srgb, var(--primary) 10%, transparent)",
              borderRadius: "4px",
              zIndex: 99992,
            }}
          >
            {/* Element Tag Indicator Label */}
            <div
              style={{
                position: "absolute",
                top: hoveredRect.top > 25 ? "-24px" : "4px",
                left: "4px",
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "3px",
                background: "var(--container-bg)",
                border: "1px solid var(--container-border)",
                color: "var(--primary)",
                fontWeight: "bold",
              }}
            >
              {hoveredTag}
              {hoveredSelector.includes(".") && (
                <span style={{ color: "var(--text-muted)", marginLeft: "4px" }}>
                  .{hoveredSelector.split(".").slice(1, 3).join(".")}
                </span>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DRAWING CANVAS OVERLAY & UI LOCK ── */}
      {isDrawingMode && (
        <canvas
          ref={canvasRef}
          onMouseDown={startCanvasDrawing}
          onMouseMove={drawOnCanvas}
          onMouseUp={stopCanvasDrawing}
          onMouseLeave={stopCanvasDrawing}
          onTouchStart={startCanvasDrawing}
          onTouchMove={drawOnCanvas}
          onTouchEnd={stopCanvasDrawing}
          className="vulcan-debug-exclude"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99993,
            background: "rgba(0, 0, 0, 0.08)", 
            cursor: currentTool === "pointer" ? "default" : currentTool === "simple-pin" ? "cell" : "crosshair",
            touchAction: "none", 
            pointerEvents: currentTool === "pointer" ? "none" : "auto", // Allow hover selection when pointer tool is active
          }}
        />
      )}

      {/* ── FLOATING DRAWING TOOLBAR ── */}
      <AnimatePresence>
        {isDrawingMode && (
          <motion.div
            initial={{ y: -50, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: -50, x: "-50%", opacity: 0 }}
            className="fixed top-6 left-1/2 z-[99994] vulcan-debug-exclude flex items-center gap-3 p-2.5 rounded-xl border shadow-2xl"
            style={{
              background: "var(--premium-glass-bg)",
              backdropFilter: "var(--premium-glass-backdrop, blur(24px))",
              borderColor: "var(--premium-glass-border)",
              boxShadow: "var(--premium-glass-shadow)",
            }}
          >
            <div className="flex items-center gap-1">
              {/* Pointer Tool */}
              <button
                onClick={() => {
                  setCurrentTool("pointer");
                  setIsSelecting(true);
                }}
                className="p-2 rounded-lg transition-colors active:scale-95"
                style={{
                  background: currentTool === "pointer" ? "var(--primary)" : "transparent",
                  color: currentTool === "pointer" ? "var(--primary-foreground)" : "var(--text-default)",
                }}
                title="Seleziona Elemento (HTML Selector)"
              >
                <MousePointerClick size={16} />
              </button>

              {/* Simple Pin Tool */}
              <button
                onClick={() => {
                  setCurrentTool("simple-pin");
                  setIsSelecting(false);
                }}
                className="p-2 rounded-lg transition-colors active:scale-95"
                style={{
                  background: currentTool === "simple-pin" ? "var(--primary)" : "transparent",
                  color: currentTool === "simple-pin" ? "var(--primary-foreground)" : "var(--text-default)",
                }}
                title="Piazza Pin Semplice"
              >
                <MapPin size={16} />
              </button>

              {/* Freehand Tool */}
              <button
                onClick={() => {
                  setCurrentTool("freehand");
                  setIsSelecting(false);
                }}
                className="p-2 rounded-lg transition-colors active:scale-95"
                style={{
                  background: currentTool === "freehand" ? "var(--primary)" : "transparent",
                  color: currentTool === "freehand" ? "var(--primary-foreground)" : "var(--text-default)",
                }}
                title="Disegno a Mano Libera"
              >
                <Edit3 size={16} />
              </button>

              {/* Rectangle Tool */}
              <button
                onClick={() => {
                  setCurrentTool("rect");
                  setIsSelecting(false);
                }}
                className="p-2 rounded-lg transition-colors active:scale-95"
                style={{
                  background: currentTool === "rect" ? "var(--primary)" : "transparent",
                  color: currentTool === "rect" ? "var(--primary-foreground)" : "var(--text-default)",
                }}
                title="Disegna Rettangolo"
              >
                <Square size={16} />
              </button>

              {/* Circle Tool */}
              <button
                onClick={() => {
                  setCurrentTool("circle");
                  setIsSelecting(false);
                }}
                className="p-2 rounded-lg transition-colors active:scale-95"
                style={{
                  background: currentTool === "circle" ? "var(--primary)" : "transparent",
                  color: currentTool === "circle" ? "var(--primary-foreground)" : "var(--text-default)",
                }}
                title="Disegna Cerchio"
              >
                <Circle size={16} />
              </button>
            </div>

            <div className="w-px h-6" style={{ background: "var(--container-border)" }} />

            <div className="flex items-center gap-1.5">
              <button
                onClick={clearCanvas}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-95"
                style={{ color: "var(--text-muted)" }}
                title="Pulisci Disegni"
              >
                <Trash2 size={16} />
              </button>

              <button
                onClick={handleSaveDrawing}
                className="p-2 rounded-lg transition-colors active:scale-95 text-white"
                style={{ background: "var(--primary)" }}
                title="Salva Pin e Disegni"
              >
                <Check size={16} />
              </button>

              <button
                onClick={() => {
                  setIsDrawingMode(false);
                  setIsSelecting(false);
                  setTempAnnotation(null);
                  setIsOpen(true);
                }}
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

      {/* ── ANNOTATION INPUT FORM MODAL (NEW & EDIT) ── */}
      <AnimatePresence>
        {isFormOpen && tempAnnotation && (
          <div className="fixed inset-0 z-[99997] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm vulcan-debug-exclude">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-5 rounded-2xl border shadow-2xl flex flex-col gap-4"
              style={{
                background: "var(--premium-glass-bg)",
                borderColor: "var(--premium-glass-border)",
                color: "var(--text-default)",
                boxShadow: "var(--premium-glass-shadow)",
              }}
            >
              <div 
                className="flex justify-between items-center pb-2 border-b"
                style={{ borderColor: "var(--container-border)" }}
              >
                <div className="flex items-center gap-2">
                  <Bug size={16} style={{ color: "var(--text-error)" }} />
                  <h3 className="font-semibold text-base">
                    {annotations.some(a => a.id === tempAnnotation.id) ? "Modifica Annotazione" : "Aggiungi Annotazione"}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setIsFormOpen(false);
                    setFormComment("");
                    setFormPriority("medium");
                    setFirstDrawPoint(null);
                    setTempAnnotation(null);
                    setIsOpen(true);
                  }}
                  className="p-1 rounded-lg transition-colors border"
                  style={{
                    background: "transparent",
                    borderColor: "transparent",
                    color: "var(--text-default)",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5">
                <div>
                  <label 
                    className="block text-[11px] uppercase tracking-wider font-semibold mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Contesto Elemento
                  </label>
                  <div 
                    className="p-2.5 rounded-lg font-mono text-[10px] break-all border animate-fade-in"
                    style={{
                      background: "var(--surface-container)",
                      borderColor: "var(--container-border)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {tempAnnotation.elementTag === "simple-pin" ? (
                      <span className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--primary)" }}>
                        <MapPin size={11} /> Pin Libero (Coordinate: x={Math.round(tempAnnotation.pageX || 0)}, y={Math.round(tempAnnotation.pageY || 0)})
                      </span>
                    ) : (
                      <>
                        &lt;{tempAnnotation.elementTag}&gt; {tempAnnotation.selector}
                      </>
                    )}
                    {tempAnnotation.drawingDataURL && (
                      <span className="block mt-1 font-semibold" style={{ color: "var(--text-success)" }}>✓ Disegno sketch salvato in allegato</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label 
                    className="block text-[11px] uppercase tracking-wider font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Descrivi il problema o la modifica
                  </label>
                  <textarea
                    autoFocus
                    required
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Scrivi qui il commento per il bug-fix..."
                    className="w-full min-h-[95px] p-3 rounded-lg text-sm border focus:ring-1 outline-none"
                    style={{
                      background: "var(--surface-container)",
                      borderColor: "var(--container-border)",
                      color: "var(--text-default)",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label 
                    className="block text-[11px] uppercase tracking-wider font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Priorità
                  </label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map((p) => {
                      const labels = { low: "Bassa", medium: "Media", high: "Alta" };
                      const colors = {
                        low: "var(--text-success)",
                        medium: "var(--primary)",
                        high: "var(--text-error)",
                      };
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
                          style={{
                            borderColor: isSelected ? colors[p] : "var(--container-border)",
                            background: isSelected ? bgMix[p] : "transparent",
                            color: isSelected ? colors[p] : "var(--text-muted)",
                          }}
                        >
                          {labels[p]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  {/* Delete button only shown in edit mode */}
                  {annotations.some(a => a.id === tempAnnotation.id) ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (tempAnnotation.id) {
                          handleDeleteAnnotation(tempAnnotation.id);
                          setIsFormOpen(false);
                          setFormComment("");
                          setFormPriority("medium");
                          setFirstDrawPoint(null);
                          setTempAnnotation(null);
                          setIsOpen(true);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all active:scale-95"
                      style={{ 
                        color: "var(--text-error)", 
                        backgroundColor: "color-mix(in srgb, var(--text-error) 10%, transparent)",
                        borderColor: "color-mix(in srgb, var(--text-error) 25%, transparent)"
                      }}
                    >
                      <Trash2 size={13} />
                      Elimina Pin
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setTempAnnotation(null);
                        setFormComment("");
                        setFormPriority("medium");
                        setFirstDrawPoint(null);
                        setIsOpen(true);
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                      style={{
                        background: "transparent",
                        borderColor: "var(--container-border)",
                        color: "var(--text-default)",
                      }}
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all active:scale-95 hover:opacity-90"
                      style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      Salva
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TOGGLE FAB BUTTON ── */}
      {!isDrawingMode && (
        <div 
          className="fixed z-[99996] vulcan-debug-exclude flex flex-col items-end gap-3"
          style={{
            right: "16px",
            bottom: "80px",
          }}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl border transition-all active:scale-90 hover:scale-105"
            style={{
              background: "var(--premium-glass-bg)",
              borderColor: "var(--premium-glass-border)",
              color: isOpen ? "var(--primary)" : "var(--text-default)",
              boxShadow: "var(--premium-glass-shadow)",
              backdropFilter: "var(--premium-glass-backdrop, blur(16px))",
            }}
            title="AI Debugger (Ctrl+Option+A o Ctrl+Shift+X)"
          >
            <Bug size={20} className={isOpen ? "animate-pulse" : ""} />
          </button>
        </div>
      )}

      {/* ── SLEEK FLOATING CONTROL PANEL ── */}
      <AnimatePresence>
        {isOpen && !isDrawingMode && (
          <motion.div
            initial={{ y: 80, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 80, scale: 0.95, opacity: 0 }}
            id="vulcan-debug-ui"
            style={{
              position: "fixed",
              right: "16px",
              bottom: "144px", 
              width: "calc(100% - 32px)",
              maxWidth: "360px",
              maxHeight: "410px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "16px",
              borderRadius: "16px",
              border: "1px solid var(--premium-glass-border)",
              background: "var(--premium-glass-bg)",
              backdropFilter: "var(--premium-glass-backdrop, blur(24px))",
              boxShadow: "var(--premium-glass-shadow)",
              zIndex: 99995,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div 
              className="flex justify-between items-center pb-2.5 border-b"
              style={{ borderColor: "var(--container-border)" }}
            >
              <div 
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--primary)" }}
              >
                <Bug size={14} />
                <span>AI Debug Assistant</span>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md transition-colors"
                style={{ color: "var(--text-muted)", background: "transparent" }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Symmetrical Real-Time Action Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setTempAnnotation(null);
                  setFormComment("");
                  setFormPriority("medium");
                  setFirstDrawPoint(null);
                  setIsOpen(false);
                  setIsDrawingMode(true);
                  setCurrentTool("pointer");
                  setIsSelecting(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-bold text-white transition-all active:scale-95"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                <MousePointerClick size={13} />
                Nuovo Pin
              </button>

              {/* Real-time clipboard copy button */}
              <button
                onClick={handleCopyPromptRealTime}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-bold border transition-all active:scale-95"
                style={{
                  background: "transparent",
                  borderColor: "var(--container-border)",
                  color: "var(--text-default)",
                }}
              >
                <ClipboardCopy size={13} />
                Copia Prompt
              </button>

              {/* Pins Toggle visibility */}
              <button
                onClick={() => setShowPins(!showPins)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-bold border transition-all active:scale-95"
                style={{
                  background: showPins ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent",
                  borderColor: showPins ? "var(--primary)" : "var(--container-border)",
                  color: showPins ? "var(--primary)" : "var(--text-muted)",
                }}
              >
                {showPins ? <Eye size={13} /> : <EyeOff size={13} />}
                Pin: {showPins ? "Visibili" : "Nascosti"}
              </button>

              {/* Clear Registry button */}
              <button
                onClick={() => {
                  if (annotations.length === 0) return;
                  if (window.confirm("Sei sicuro di voler eliminare TUTTI i pin nel registro? Questa operazione scriverà sul workspace locale.")) {
                    saveAnnotations([]);
                    showToast("Registro Svuotato");
                  }
                }}
                disabled={annotations.length === 0}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-bold border disabled:opacity-50 transition-all active:scale-95"
                style={{
                  background: "transparent",
                  borderColor: "var(--container-border)",
                  color: "var(--text-default)",
                }}
              >
                <Trash2 size={13} />
                Svuota Tutto
              </button>
            </div>

            {/* Scrollable Annotations List - Click to edit directly */}
            <div className="flex-1 overflow-y-auto mt-1 flex flex-col gap-2 pr-1" style={{ maxHeight: "180px" }}>
              <div className="text-[10px] font-semibold uppercase tracking-wider flex justify-between" style={{ color: "var(--text-muted)" }}>
                <span>Pin nel Registro ({annotations.length})</span>
                {annotations.length > 0 && <span style={{ fontSize: "8px", opacity: 0.7 }}>Clicca su un pin per modificarlo</span>}
              </div>

              {annotations.length === 0 ? (
                <div 
                  className="h-24 flex flex-col items-center justify-center border border-dashed rounded-xl p-3 text-center"
                  style={{ borderColor: "var(--container-border)" }}
                >
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    Nessun pin inserito. Clicca su "Nuovo Pin" per iniziare.
                  </span>
                </div>
              ) : (
                annotations.map((anno, idx) => (
                  <div 
                    key={anno.id} 
                    className="p-2.5 rounded-lg border flex items-start justify-between gap-2 text-xs cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    onClick={() => {
                      // Click opens form immediately in edit mode
                      setTempAnnotation(anno);
                      setFormComment(anno.comment);
                      setFormPriority(anno.priority || "medium");
                      setIsFormOpen(true);
                    }}
                    style={{
                      borderColor: "var(--container-border)",
                      background: anno.route === location.pathname 
                        ? "color-mix(in srgb, var(--primary) 6%, transparent)" 
                        : "var(--container-bg)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span 
                          className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "color-mix(in srgb, var(--primary) 15%, transparent)",
                            color: "var(--primary)",
                          }}
                        >
                          {anno.index || (idx + 1)}
                        </span>
                        <span 
                          className="font-medium break-words truncate block"
                          style={{ color: "var(--text-default)", fontSize: "11px" }}
                        >
                          {anno.comment}
                        </span>
                      </div>
                      <div className="text-[9px] mt-1 flex gap-2 flex-wrap" style={{ color: "var(--text-muted)" }}>
                        <span>Strada: <strong style={{ color: "var(--text-default)" }}>{anno.route}</strong></span>
                        <span>{anno.elementTag === "simple-pin" ? "Pin Libero" : `Tag: <${anno.elementTag}>`}</span>
                        <span 
                          className="font-bold"
                          style={{
                            color: anno.priority === "high" 
                              ? "var(--text-error)" 
                              : anno.priority === "low" 
                                ? "var(--text-success)" 
                                : "var(--primary)"
                          }}
                        >
                          · {anno.priority === "high" ? "Alta" : anno.priority === "low" ? "Bassa" : "Media"}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAnnotation(anno.id);
                      }}
                      className="p-1 rounded transition-colors flex-shrink-0"
                      style={{ color: "var(--text-error)" }}
                      title="Elimina Pin"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Visual Hotkey Reminder footer */}
            <div 
              className="text-[9px] text-center pt-1.5 border-t"
              style={{ borderColor: "var(--container-border)", color: "var(--text-muted)" }}
            >
              Scorciatoie: <kbd className="px-1 rounded border" style={{ borderColor: "var(--container-border)", background: "var(--surface-container)", color: "var(--text-default)" }}>Ctrl+Option+A</kbd> o <kbd className="px-1 rounded border" style={{ borderColor: "var(--container-border)", background: "var(--surface-container)", color: "var(--text-default)" }}>Ctrl+Shift+X</kbd> per aprire/chiudere
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
