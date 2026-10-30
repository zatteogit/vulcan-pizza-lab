import { useEffect, useState } from "react";
import { BRAND } from "../../config/brand";
import { Link } from "react-router";
import { AccountPanel } from "../account/account-panel";
import { refreshPublishedMedia } from "../../components/media/published-media";
import type { PhotoVersion } from "../../../server/media/handler";
import "./photo-library.css";

interface Library { versions: PhotoVersion[]; active: PhotoVersion[] }
export function PhotoLibraryPage() {
  const [library, setLibrary] = useState<Library | null>(null);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [slot, setSlot] = useState("");
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/media/library", { cache: "no-store" });
      if (response.status === 403) { setDenied(true); setLibrary(null); return; }
      if (!response.ok) throw new Error("Non riesco a caricare la libreria. Riprova.");
      const data = await response.json() as Library;
      setLibrary(data); setDenied(false);
      setSlot(old => old || data.versions[0]?.slot || "");
    } catch (e) { setError(e instanceof Error ? e.message : "Errore di caricamento."); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    void load();
    void fetch("/media/catalog.json").then(r => r.json()).then((data: { titles: Record<string, string> }) => setTitles(data.titles)).catch(() => {});
  }, []);
  const active = library?.active.find(p => p.slot === slot);
  async function publish(version: PhotoVersion) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/media/publish", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, id: version.id, expected: active?.id ?? null }) });
      if (!response.ok) { const data = await response.json() as { error?: string }; throw new Error(data.error || "Pubblicazione non riuscita."); }
      await refreshPublishedMedia(); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Pubblicazione non riuscita."); }
    finally { setBusy(false); }
  }
  const slots = [...new Set(library?.versions.map(p => p.slot) ?? [])];
  return <main className="photo-library">
    <header className="photo-library__header">
      <Link to="/explore">Torna a {BRAND.name}</Link>
      <h1>Archivio foto</h1>
      <p>Scegli la foto visibile a tutti. Ogni versione precedente rimane disponibile e può essere ripristinata.</p>
      <button type="button" onClick={() => void load()} disabled={busy}>Ricarica libreria</button>
    </header>
    {error && <p role="alert" className="photo-library__error">{error}</p>}
    {denied && <section aria-label="Accesso al CMS"><p>Accedi con un account amministratore o editor, poi ricarica la libreria.</p><AccountPanel locale="it" /></section>}
    {library && <section aria-label="Versioni delle fotografie">
      <label className="photo-library__selector">Foto da gestire
        <select value={slot} onChange={e => setSlot(e.target.value)}>{slots.map(key => <option key={key} value={key}>{titles[key] || key}</option>)}</select>
      </label>
      <p role="status">{library.active.length} foto pubblicate · {library.versions.length} versioni conservate</p>
      <div className="photo-library__grid">{library.versions.filter(p => p.slot === slot).map(version => <article className="photo-library__version" key={version.id}>
        <a href={version.src} target="_blank" rel="noreferrer"><img src={version.src} srcSet={`${version.smallSrc} ${version.smallWidth}w, ${version.src} ${version.width}w`} sizes="(min-width: 720px) 45vw, 100vw" width={version.width} height={version.height} alt={`${titles[slot] || slot} · ${version.label}`} /></a>
        <h2>{version.label}</h2>
        <p>{active?.id === version.id ? `Visibile su ${BRAND.name}` : "Conservata in archivio"}</p>
        <button type="button" disabled={busy || active?.id === version.id} onClick={() => void publish(version)}>{active?.id === version.id ? "Foto attiva" : "Usa questa foto"}</button>
      </article>)}</div>
    </section>}
  </main>;
}
