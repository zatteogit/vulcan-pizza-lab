/* ═══ Colore delle barre del browser ═══
 * Chrome e Samsung Internet su Android, Edge e Safari fino a iOS 18 colorano
 * barra di stato e barra degli indirizzi con <meta name="theme-color">. Il
 * meta segue il tema dell'app (classe .dark, temi data-theme), non solo il
 * tema del sistema: chi sceglie il tema scuro a mano non vede una barra
 * chiara sopra una pagina scura. Safari 26 non usa più il meta e prende il
 * colore della pagina (html/body), già allineato in theme.css. */

const THEME_ATTRIBUTES = ["class", "data-theme"];

/** Colore di fondo effettivo della pagina, come lo disegna il browser. */
export function pageBackground(doc: Document): string | null {
  const color = doc.defaultView?.getComputedStyle(doc.body).backgroundColor ?? "";
  return color && color !== "transparent" && !/rgba\(.*,\s*0\)$/.test(color) ? color : null;
}

/** Un solo meta theme-color, col colore della pagina. */
export function applyThemeColor(doc: Document, color: string | null): void {
  if (!color) return;
  const metas = Array.from(doc.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'));
  const [meta = doc.createElement("meta"), ...extra] = metas;
  extra.forEach((node) => node.remove());
  meta.name = "theme-color";
  meta.removeAttribute("media");
  if (meta.content !== color) meta.content = color;
  if (!meta.parentNode) doc.head.appendChild(meta);
}

/** Allinea il meta ora e a ogni cambio di tema; restituisce lo stop. */
export function syncBrowserChrome(doc: Document = document): () => void {
  const sync = () => applyThemeColor(doc, pageBackground(doc));
  sync();
  const observer = new MutationObserver(() => requestAnimationFrame(sync));
  observer.observe(doc.documentElement, { attributes: true, attributeFilter: THEME_ATTRIBUTES });
  return () => observer.disconnect();
}
