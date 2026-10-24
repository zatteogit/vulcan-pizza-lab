import { useEffect } from "react";
import { useLocation } from "react-router";
import { BRAND } from "../../config/brand";
import { useCms } from "../../features/cms/cms-context";
import { CtaButton } from "../ds/index";

/* ═══ U-10 (F15) — titolo della pagina per route ═══
 * Prima `document.title` era sempre il nome del prodotto: schede, cronologia e
 * screen reader non distinguevano le viste. Qui le sezioni fisse; la ricetta
 * mette il nome dello stile da sé (pages/recipe.tsx), per non portare i dati
 * del motore nel chunk della shell. */

function sectionTitle(pathname: string, pages: ReturnType<typeof useCms>["cms"]["pages"]): string | null {
  if (pathname === "/") return pages.navCreate;
  if (pathname.startsWith("/explore")) return pages.navExplore;
  if (pathname.startsWith("/learn/glossary")) return pages.learnGlossary;
  if (pathname.startsWith("/learn/troubleshooting")) return pages.learnTroubleshooting;
  if (pathname.startsWith("/learn/pre-ferments")) return pages.learnPreFerments;
  if (pathname.startsWith("/learn")) return pages.navLearn;
  if (pathname.startsWith("/profile")) return pages.navProfile;
  return null;
}

export function RouteTitle() {
  const { pathname } = useLocation();
  const { cms } = useCms();

  useEffect(() => {
    if (pathname.startsWith("/recipe/")) return;
    const section = sectionTitle(pathname, cms.pages);
    document.title = section ? `${section} · ${BRAND.name}` : BRAND.name;
  }, [pathname, cms.pages]);

  return null;
}

/* ═══ U-10 (F22) — «Salta al contenuto» su ogni route ═══
 * Primo elemento della shell, prima di dock e avatar: porta al contenitore
 * delle pagine (#app-content). Prima c'era solo in Crea, ed era la seconda
 * fermata del Tab. */
export function SkipLink() {
  const { cms } = useCms();
  return (
    <CtaButton as="a" href="#app-content" radius="lg" elevated={false} className="home-skiplink">
      {cms.pages.skipToContent}
    </CtaButton>
  );
}
