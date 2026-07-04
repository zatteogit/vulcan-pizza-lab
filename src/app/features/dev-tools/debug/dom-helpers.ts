import type { ElementStyles } from "./annotation-types";

/* ═══ CSS SELECTOR HELPER ═══ */
export function getCssSelector(el: HTMLElement): string {
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

    const className = current.className;
    if (typeof className === "string" && className.trim()) {
      const classes = className
        .trim()
        .split(/\s+/)
        .filter((c) => c && !c.includes(":") && !c.startsWith("motion-") && !c.startsWith("active:"));
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
export function getParentContext(element: HTMLElement): string {
  const parent = element.parentElement;
  if (!parent) return "";
  const tag = parent.tagName.toLowerCase();
  const idAttr = parent.id ? ` id="${parent.id}"` : "";
  const cleanClass = parent.className ? parent.className.replace(/\s+/g, " ").trim() : "";
  const classAttr = cleanClass ? ` class="${cleanClass}"` : "";

  return `<${tag}${idAttr}${classAttr}>\n  ...\n  ${element.outerHTML.slice(0, 800)}${element.outerHTML.length > 800 ? "..." : ""}\n  ...\n</${tag}>`;
}

/* ═══ COMPUTED STYLES CONTEXT HELPER ═══ */
export function getComputedStylesData(el: HTMLElement): ElementStyles {
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
