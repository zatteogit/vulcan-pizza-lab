import { useEffect, useRef } from "react";
import type { ConsoleLog } from "./annotation-types";

/**
 * Patches console.error/warn to keep a rolling buffer of the last N entries.
 * The buffer lives in a ref so capturing a log never re-renders the overlay;
 * callers read the current snapshot on demand (pin capture, prompt build).
 */
export function useConsoleCapture(limit = 20) {
  const logsRef = useRef<ConsoleLog[]>([]);

  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    const pushLog = (type: "error" | "warn", ...args: any[]) => {
      const message = args
        .map((arg) => {
          if (arg instanceof Error) return arg.stack || arg.message;
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg);
            } catch {
              return "[Object]";
            }
          }
          return String(arg);
        })
        .join(" ");

      const next = [...logsRef.current, { type, message, timestamp: new Date().toLocaleTimeString() }];
      logsRef.current = next.slice(-limit);
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
  }, [limit]);

  return logsRef;
}
