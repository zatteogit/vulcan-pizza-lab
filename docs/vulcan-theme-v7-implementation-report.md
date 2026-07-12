# Vulcan V7 — specifica completa del tema “Editorial FireGlow”

> Stato: tema `editorial-fire` implementato e verificato nel prodotto
> Mockup: `output/playwright/vulcan-redesign/v7-system/`
> Matrice: Crea, Scopri, Impara, Ricetta × light/dark × desktop/mobile = 16 immagini

## 1. Decisione di design

La direzione finale unisce:

- impianto editoriale chiaro, fotografico e tipografico;
- superfici aperte su desktop, evitando il pattern “card dentro card”;
- composizione verticale ariosa e dock flottante su mobile;
- dark mode nativa, non semplice inversione cromatica;
- `VulcanHero` attuale preservato come firma di brand;
- FireGlow semantico: la luce indica dove serve attenzione, non decora casualmente lo sfondo.

### Regole non negoziabili

1. Il blob/logo attuale non cambia geometria, layer, rapporto mark/blob o keyframe.
2. Il verde CTA è piatto e uniforme: nessun riflesso arancio, glow o gradiente.
3. FireGlow illumina solo stati con priorità: consigliato, attivo, warning, step corrente.
4. Una pagina senza richieste di attenzione non mostra FireGlow.
5. Le fotografie hero sono sempre mascherate da contenitori con terminazione netta; niente scontorni o bleed irregolari.
6. Desktop: usare griglia, divider e spazio; introdurre una surface solo se raggruppa davvero un’unità funzionale.
7. Mobile: CTA pill, almeno 48px; almeno 16px fra primaria e secondaria; dock sopra la safe area.
8. In Ricetta mobile, `Approfondisci` segue la descrizione inline.
9. Ricetta include un’azione cuore/favorite nell’hero chrome.

## 2. Cosa recuperare dai concept esterni

Da integrare:

- progressione numerata dei percorsi didattici;
- leggibilità delle quantità con valore allineato a destra;
- split fotografico/testuale della Ricetta desktop;
- heart action riconoscibile;
- fotografie dark più cinematografiche;
- titoli serif forti e dati tecnici sobri;
- oggetti materici solo quando spiegano una scelta.

Da non importare:

- scintille, particelle e brace decorative;
- CTA arancioni emissive;
- glow diffuso su tutto il viewport;
- nuove voci di navigazione non presenti nella IA;
- reinterpretazioni del marchio o del blob;
- card per ogni singolo blocco informativo.

## 3. Architettura esistente da rispettare

Vulcan dispone già dei livelli corretti:

- `src/styles/theme.css`: T1 primitivi, T2 semantici, T3 composite;
- `src/styles/layout.css`: ricomposizione tramite `data-theme`, `data-page`, `data-region`;
- `.dark` su `<html>`: palette dark;
- `AppShell`: `ThemeMode = light | dark | auto`, persistenza `vulcan_dark_mode`;
- `FireGlow`: tre layer motion e fallback reduced-motion;
- `DoughBlob` / `VulcanHero`: brand motion parametrico;
- guard automatici `check:tokens`, `check:semantics`, `check:css-tokens`.

Il redesign deve estendere questo modello, non creare un secondo sistema.

## 4. Strategia dei token

### 4.1 Nuovi primitivi T1

Da aggiungere in `:root` di `theme.css`. I valori raw sono ammessi solo qui.

```css
:root {
  --color-editorial-ivory-0: #fffdf9;
  --color-editorial-ivory-50: #fbf7f1;
  --color-editorial-ivory-100: #f5eee6;
  --color-editorial-ink-700: #3a3430;
  --color-editorial-ink-900: #171513;

  --color-obsidian-700: #24201e;
  --color-obsidian-800: #1c1917;
  --color-obsidian-900: #121110;
  --color-obsidian-950: #0d0c0b;

  --color-ember-focus-300: #f49a72;
  --color-ember-focus-500: #d95a32;
  --color-ember-focus-700: #9f321d;

  --duration-attention-enter: 420ms;
  --duration-attention-breathe: 2600ms;
  --duration-attention-exit: 280ms;
}
```

### 4.2 Token semantici T2

```css
:root {
  --container-page: var(--color-editorial-ivory-0);
  --container-bg: color-mix(in srgb, var(--container-page) 92%, transparent);
  --container-bg-low: color-mix(in srgb, var(--container-page) 72%, transparent);
  --container-border: color-mix(in srgb, var(--text-default) 10%, transparent);
  --container-border-subtle: color-mix(in srgb, var(--text-default) 6%, transparent);

  --text-default: var(--color-editorial-ink-900);
  --text-muted: color-mix(in srgb, var(--text-default) 62%, transparent);
  --text-accent: var(--color-terracotta-600);

  --attention-color-info: var(--color-amber-500);
  --attention-color-recommended: var(--color-ember-focus-500);
  --attention-color-warning: var(--color-terracotta-700);
  --attention-color-critical: var(--color-red-500);

  --attention-opacity-rest: 0;
  --attention-opacity-info: 0.06;
  --attention-opacity-recommended: 0.11;
  --attention-opacity-warning: 0.16;
  --attention-blur: var(--blur-2xl);
  --attention-spread: var(--space-12);

  --hero-media-radius: var(--radius-3xl);
  --hero-media-gap: var(--gap-lg);
  --action-pill-radius: var(--radius-full);
  --action-pill-height: var(--space-13);
  --action-stack-gap: var(--gap-md);
  --content-gutter-mobile: var(--space-5);
  --content-gutter-desktop: var(--space-10);
  --desktop-shoulder-width: var(--measure-2xs);
}

.dark {
  --container-page: var(--color-obsidian-900);
  --container-bg: color-mix(in srgb, var(--color-obsidian-700) 82%, transparent);
  --container-bg-low: color-mix(in srgb, var(--color-obsidian-800) 68%, transparent);
  --container-border: color-mix(in srgb, var(--color-parchment-100) 13%, transparent);
  --container-border-subtle: color-mix(in srgb, var(--color-parchment-100) 8%, transparent);
  --text-default: var(--color-parchment-100);
  --text-muted: color-mix(in srgb, var(--text-default) 62%, transparent);

  --attention-opacity-info: 0.07;
  --attention-opacity-recommended: 0.14;
  --attention-opacity-warning: 0.2;
  --attention-blur: var(--blur-3xl);
}
```

### 4.3 Composite T3

```css
:root {
  --editorial-glass-bg:
    color-mix(in srgb, var(--container-page) 78%, transparent);
  --editorial-glass-border:
    var(--border-width-thin) solid var(--container-border-subtle);
  --editorial-glass-shadow:
    0 var(--space-2) var(--space-6)
    color-mix(in srgb, var(--shadow-color) 7%, transparent);

  --attention-shadow-recommended:
    0 0 var(--attention-spread)
    color-mix(in srgb, var(--attention-color-recommended) 22%, transparent);

  --attention-wash-recommended:
    radial-gradient(
      ellipse at var(--attention-x, 50%) var(--attention-y, 50%),
      color-mix(in srgb, var(--attention-color-recommended) 32%, transparent) 0%,
      transparent 68%
    );
}
```

Non assegnare `--attention-*` alle CTA verdi. La CTA continua a usare `--cta`, `--cta-foreground`, `--elevation-cta` senza FireGlow.

## 5. FireGlow semantico

### 5.1 Modello dati

Creare `src/app/features/attention/attention-types.ts`:

```ts
export type AttentionLevel = "none" | "info" | "recommended" | "warning" | "critical";

export type AttentionReason =
  | "active-navigation"
  | "recommended-choice"
  | "current-learning-step"
  | "recipe-mismatch"
  | "validation-error";

export interface AttentionSignal {
  id: string;
  level: AttentionLevel;
  reason: AttentionReason;
  active: boolean;
  pulse?: boolean;
}
```

### 5.2 Componente

Sostituire l’API decorativa `FireGlow({ intensity, variant })` con un wrapper compatibile:

```tsx
import { motion, useReducedMotion } from "motion/react";
import type { AttentionLevel, AttentionReason } from "./attention-types";

type AttentionGlowProps = {
  level?: AttentionLevel;
  reason: AttentionReason;
  active: boolean;
  pulse?: boolean;
  className?: string;
};

export function AttentionGlow({
  level = "recommended",
  reason,
  active,
  pulse = true,
  className,
}: AttentionGlowProps) {
  const reduced = useReducedMotion();

  if (!active || level === "none") return null;

  return (
    <motion.span
      aria-hidden="true"
      data-testid="attention-glow"
      data-attention-level={level}
      data-attention-reason={reason}
      className={["attention-glow", className].filter(Boolean).join(" ")}
      initial={false}
      animate={
        reduced || !pulse
          ? { opacity: 1, scale: 1 }
          : { opacity: [0.72, 1, 0.72], scale: [0.98, 1.02, 0.98] }
      }
      transition={{
        duration: 2.6,
        repeat: reduced || !pulse ? 0 : Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
```

```css
@layer components {
  .attention-host {
    position: relative;
    isolation: isolate;
  }

  .attention-host > :not(.attention-glow) {
    position: relative;
    z-index: 1;
  }

  .attention-glow {
    position: absolute;
    inset: calc(var(--attention-spread) * -0.5);
    z-index: 0;
    pointer-events: none;
    background: var(--attention-wash-recommended);
    filter: blur(var(--attention-blur));
    opacity: var(--attention-opacity-recommended);
  }

  .attention-glow[data-attention-level="warning"] {
    --attention-color-recommended: var(--attention-color-warning);
    opacity: var(--attention-opacity-warning);
  }

  .attention-glow[data-attention-level="critical"] {
    --attention-color-recommended: var(--attention-color-critical);
    opacity: var(--attention-opacity-warning);
  }

  @media (prefers-reduced-motion: reduce) {
    .attention-glow { animation: none; transform: none; }
  }
}
```

### 5.3 Compatibilità con `FireGlow`

Conservare temporaneamente `FireGlow`, ma deprecarne il montaggio page-level:

```tsx
/** @deprecated Use AttentionGlow on a semantic target. */
export function FireGlow(props: LegacyFireGlowProps) {
  return <LegacyAmbientGlow {...props} />;
}
```

Migrare nell’ordine: Home slot consigliato → Learn step corrente → Recipe mismatch → Explore feature attiva. Dopo la migrazione, rimuovere i tre layer page-level.

## 6. Invariante `VulcanHero`

Non cambiare:

- `BLOB_RADII.forge` e `ACCENT_RADII.forge`;
- quantità e ordine dei layer;
- `markRatio` predefinito;
- range di scala e velocità parametrica;
- posizione centrale del mark;
- comportamento reduced-motion.

Sono consentite solo override di token:

```css
:root {
  --blob-body-forge: linear-gradient(
    145deg,
    var(--forge-abyss),
    var(--forge-core) 35%,
    var(--forge-mid) 65%,
    var(--forge-glow)
  );
}

.dark {
  --blob-body-forge: linear-gradient(
    145deg,
    color-mix(in srgb, var(--forge-abyss) 92%, var(--container-page)),
    var(--forge-core) 38%,
    var(--forge-mid) 70%,
    var(--forge-glow)
  );
  --blob-edge-forge:
    var(--border-width-thin) solid
    color-mix(in srgb, var(--forge-glow) 24%, transparent);
}
```

## 7. Componenti necessari

### `EditorialHeroMedia`

```tsx
type EditorialHeroMediaProps = {
  src: string;
  alt: string;
  actions?: React.ReactNode;
  className?: string;
};

export function EditorialHeroMedia({ src, alt, actions, className }: EditorialHeroMediaProps) {
  return (
    <figure data-region="hero" className={["editorial-hero", className].filter(Boolean).join(" ")}>
      <img className="editorial-hero__image" src={src} alt={alt} />
      {actions && <div className="editorial-hero__actions">{actions}</div>}
    </figure>
  );
}
```

```css
@layer components {
  .editorial-hero {
    position: relative;
    overflow: hidden;
    border-radius: var(--hero-media-radius);
    background: var(--surface-container-low);
  }
  .editorial-hero__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .editorial-hero__actions {
    position: absolute;
    inset-block-start: var(--space-4);
    inset-inline: var(--space-4);
    display: flex;
    justify-content: space-between;
    gap: var(--gap-sm);
  }
}
```

Questo componente impedisce scontorni, fade e protrusioni dell’immagine sotto l’hero.

### `FavoriteButton`

Usare `Heart` / `HeartFill` da Lucide nel chrome hero:

```tsx
<IconButton
  aria-label={isFavorite ? cms.actions.removeFavorite : cms.actions.addFavorite}
  pressed={isFavorite}
  onClick={toggleFavorite}
>
  <Heart aria-hidden="true" fill={isFavorite ? "currentColor" : "none"} />
</IconButton>
```

### `ActionPill`

```css
@layer components {
  .action-pill {
    min-height: var(--action-pill-height);
    padding-inline: var(--space-6);
    border-radius: var(--action-pill-radius);
    background: var(--cta);
    color: var(--cta-foreground);
    box-shadow: var(--elevation-cta);
  }
  .action-pill--secondary {
    background: transparent;
    color: var(--text-accent);
    border: var(--border-width-thin) solid var(--outline-variant);
    box-shadow: none;
  }
  .action-stack {
    display: grid;
    gap: var(--action-stack-gap);
  }
}
```

### `RecipeShoulder`

Desktop non deve diventare una card pesante. Il shoulder usa un solo bordo logico e diventa sticky:

```css
@layer components {
  .recipe-shoulder {
    align-self: start;
    position: sticky;
    top: var(--space-6);
    padding-inline-start: var(--space-8);
    border-inline-start: var(--border-width-thin) solid var(--outline-variant);
  }
}
```

### `StageDock`

```css
@layer components {
  .stage-dock {
    position: fixed;
    inset-inline: var(--content-gutter-mobile);
    bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: var(--space-1);
    border-radius: var(--radius-full);
    background: var(--editorial-glass-bg);
    border: var(--editorial-glass-border);
    backdrop-filter: blur(var(--blur-dock-glass)) saturate(1.45);
    box-shadow: var(--elevation-dock);
  }
}
```

## 8. Layout per pagina

### Crea

- Desktop: masthead centrale, slot in un’unica strip con divider.
- Mobile: una sola surface schedule; FireGlow solo sullo slot consigliato.
- `VulcanHero` invariato.

```tsx
<button className="needs-slot attention-host" data-recommended={slot.recommended}>
  {slot.recommended && (
    <AttentionGlow reason="recommended-choice" level="recommended" active />
  )}
  <SlotContent slot={slot} />
</button>
```

### Scopri

- Feature editoriale foto/testo.
- FireGlow solo sulla feature corrente o su un filtro appena attivato.
- Dark: pannello feature più scuro, fotografia invariata.
- Collezione aperta; non avvolgere l’intera sezione in una card.

### Impara

- Progress rail numerata e stato corrente chiarissimo.
- FireGlow esclusivamente sullo step corrente.
- Oggetti materici limitati a hero o supporto didattico.
- Quantità/valori allineati e tabulari.

### Ricetta

- Hero sempre mascherata da `EditorialHeroMedia`.
- Cuore nel chrome hero.
- Desktop: main 68% / shoulder 32%; shoulder con divider, non card annidata.
- Mobile: `Approfondisci` inline:

```tsx
<p className="recipe-identity__summary">
  {cms.recipe.summary}{" "}
  <Link className="recipe-identity__learn-more" to={learnMoreHref}>
    {cms.actions.learnMore}
  </Link>
</p>
```

- FireGlow sul MATCH solo quando esiste una discrepanza azionabile.
- CTA pill verde piatta, mai illuminata dal FireGlow.

## 9. Ricomposizione responsive in `layout.css`

```css
@media (min-width: 768px) {
  [data-theme="editorial-fire"] [data-page="recipe"] [data-region="body"] {
    display: grid;
    grid-template-columns:
      minmax(0, 1fr)
      minmax(var(--measure-2xs), 0.32fr);
    gap: var(--space-10);
    align-items: start;
  }

  [data-theme="editorial-fire"] [data-region="collection"] {
    gap: var(--gap-ml);
  }
}

@media (max-width: 767px) {
  [data-theme="editorial-fire"] [data-region="page"] {
    padding-inline: var(--content-gutter-mobile);
    padding-bottom: calc(var(--space-24) + env(safe-area-inset-bottom, 0px));
  }

  [data-theme="editorial-fire"] [data-region="hero"] {
    margin-inline: calc(var(--content-gutter-mobile) * -1);
    border-radius: 0 0 var(--hero-media-radius) var(--hero-media-radius);
  }
}
```

## 10. Attivazione tema

Il tema editoriale deve essere un’identità visuale; light/dark resta una modalità separata.

```tsx
const VISUAL_THEME = "editorial-fire";

useEffect(() => {
  document.documentElement.dataset.theme = VISUAL_THEME;
  return () => {
    delete document.documentElement.dataset.theme;
  };
}, []);
```

Continuare ad applicare `.dark` tramite `ThemeMode`. Risultati:

- `[data-theme="editorial-fire"]`: struttura e token condivisi;
- `[data-theme="editorial-fire"].dark`: override dark;
- `auto`: segue `prefers-color-scheme` senza cambiare il tema visuale.

## 11. CMS e accessibilità

Nuove stringhe obbligatorie nel CMS:

```ts
actions: {
  addFavorite: "Aggiungi ai preferiti",
  removeFavorite: "Rimuovi dai preferiti",
  learnMore: "Approfondisci",
}
```

Requisiti:

- contrasto testo WCAG AA;
- focus visibile indipendente dal FireGlow;
- FireGlow `aria-hidden`;
- nessun significato affidato solo al colore;
- touch target minimo 44px, target raccomandato 48–52px;
- `prefers-reduced-motion`: glow statico, niente pulse;
- `prefers-contrast: more`: ridurre trasparenza e aumentare bordi.

```css
@media (prefers-contrast: more) {
  :root {
    --editorial-glass-bg: var(--container-page);
    --container-border-subtle: var(--outline);
  }
}
```

## 12. File da modificare

1. `src/styles/theme.css`
   - nuovi T1/T2/T3;
   - composite hero, pill, dock, attention;
   - override `.dark`.
2. `src/styles/layout.css`
   - griglie per `data-theme="editorial-fire"`;
   - layout mobile/desktop per le quattro pagine.
3. `src/app/features/attention/attention-types.ts`
4. `src/app/features/attention/attention-glow.tsx`
5. `src/app/features/cooking/fire-glow.tsx`
   - deprecazione layer ambientali.
6. `src/app/components/shared/vulcan-hero.tsx`
   - nessun cambio geometrico; solo eventuale passaggio token.
7. `src/app/components/ds/EditorialHeroMedia.tsx`
8. `src/app/components/ds/ActionPill.tsx`
9. `src/app/components/ds/StageDock.tsx`
10. Home, Explore, Learn, Recipe
    - `data-page` / `data-region`;
    - mount semantico di `AttentionGlow`.
11. CMS
    - azioni favorite e approfondimento.

## 13. Piano di implementazione

### Fase 1 — Fondazioni

- introdurre token;
- aggiungere `AttentionGlow` e test;
- creare hero/pill/dock T4;
- nessun cambio pagina.

### Fase 2 — Ricetta pilota

- hero netta, favorite, shoulder, CTA pill, dock mobile;
- migrare MATCH a glow semantico;
- validare light/dark e breakpoint.

### Fase 3 — Scopri

- feature north star;
- collezione responsive;
- glow solo feature/filtro attivo.

### Fase 4 — Crea e Impara

- Crea: strip slot + recommended attention;
- Impara: progress rail + current-step attention;
- confermare invariante blob.

### Fase 5 — Rimozione legacy

- eliminare FireGlow page-level;
- rimuovere token morti;
- aggiornare baseline solo se il debito diminuisce.

## 14. Test richiesti

### Unit

```ts
it("does not render attention when inactive", () => {
  const { container } = render(
    <AttentionGlow reason="recommended-choice" active={false} />,
  );
  expect(container).toBeEmptyDOMElement();
});

it("marks semantic reason", () => {
  render(<AttentionGlow reason="recipe-mismatch" level="warning" active />);
  expect(screen.getByTestId("attention-glow")).toHaveAttribute(
    "data-attention-reason",
    "recipe-mismatch",
  );
});
```

### Visual regression

Snapshot obbligatori:

- 390×844, 430×932;
- 768×1024;
- 1280×800, 1440×1000;
- light, dark, auto/light, auto/dark;
- reduced-motion e high-contrast.

### Guard esistenti

```bash
npm run verify
npm run check:tokens
npm run check:semantics
npm run check:css-tokens
```

Non aggiornare automaticamente le baseline per “far passare” il redesign.

## 15. Criteri di accettazione

- 16 riferimenti visuali riprodotti per struttura, non pixel-perfect AI artifacts.
- Nessuna nuova classe presentazionale nel JSX.
- Nessun colore o dimensione hardcoded nei consumer.
- CTA verdi senza FireGlow.
- Ogni glow è associato a `AttentionReason` verificabile.
- `VulcanHero` conserva silhouette, layer e motion correnti.
- Hero image sempre mascherata e con bordo inferiore deterministico.
- Ricetta desktop mantiene shoulder; mobile mantiene dock e `Approfondisci` inline.
- Dark mode leggibile, calda e priva di neon.
- `npm run verify` verde.

## 16. Artefatti visuali

Cartella: `output/playwright/vulcan-redesign/v7-system/`

- `home-{light|dark}-{desktop|mobile}.png`
- `explore-{light|dark}-{desktop|mobile}.png`
- `learn-{light|dark}-{desktop|mobile}.png`
- `recipe-{light|dark}-{desktop|mobile}.png`

## 17. Implementazione consegnata

Il tema è selezionabile in Profilo come **Vulcan Editorial** e continua a
usare il controllo light/dark/auto già presente. Non introduce un secondo
provider né duplica il sistema dei token.

File applicativi modificati:

- `src/app/features/dev-tools/theme-switcher.tsx`: registrazione del tema;
- `src/styles/theme.css`: palette light/dark, CTA, hero, favorite e attenzione;
- `src/styles/layout.css`: composizione responsive e desktop più aperto;
- `src/app/features/recipe/recipe-view.tsx`: cuore hero collegabile allo stato;
- `src/app/pages/{home,explore,learn,recipe}.tsx`: hook semantici e favorite reale.

La scelta implementativa finale evita un nuovo componente animato globale:
il `FireGlow` legacy page-level viene disattivato soltanto in questo tema e la
luce viene ancorata con selettori semantici agli elementi già responsabili
dello stato. In questo modo una CTA verde non può ereditare accidentalmente
la brace e `prefers-reduced-motion` non deve gestire animazioni decorative.

### Codice di attivazione

```ts
{
  id: "editorial-fire",
  preview: "editorial-fire",
  label: "Vulcan Editorial",
  note: "Materia, luce e fuoco · Playfair",
}
```

Il valore persistito resta quello previsto dal sistema esistente:

```ts
localStorage.setItem("vulcan_theme", "editorial-fire");
```

### Contratto di attenzione

```tsx
<Link
  className="learn-path__card"
  data-attention="recommended"
  to="/learn/neapolitan"
>
  {/* contenuto */}
</Link>
```

```css
[data-theme="editorial-fire"]
  .learn-path__card[data-attention="recommended"] {
  box-shadow:
    0 0 0 var(--border-width-thin)
      color-mix(in srgb, var(--forge-glow) 56%, transparent),
    0 var(--space-2) var(--space-6)
      color-mix(in srgb, var(--forge-glow) 18%, transparent);
}

[data-theme="editorial-fire"] .match-action-cta {
  background: var(--cta);
  color: var(--cta-foreground);
  box-shadow: var(--shadow-sm);
}
```

### Favorite hero

```tsx
<RecipeView
  favorite={Boolean(savedEntry)}
  onToggleFavorite={handleToggleSaveRecipe}
  {...recipeViewProps}
/>
```

L’azione usa quindi lo stesso salvataggio della match card; non esistono due
stati favorite divergenti.

## 18. Verifica eseguita

- TypeScript: superato;
- design token guard: 0 nuove violazioni;
- semantic guard: 0 nuove violazioni;
- CSS token guard: 0 nuovi valori hardcoded;
- test: 84/84 superati;
- QA browser: 390×844 e 1440×1000, light e dark, senza errori console.

Screenshot di verifica reali:

- `output/playwright/vulcan-redesign/editorial-fire-mobile-light.png`;
- `output/playwright/vulcan-redesign/editorial-fire-mobile-dark.png`;
- `output/playwright/vulcan-redesign/editorial-fire-desktop-light.png`;
- `output/playwright/vulcan-redesign/editorial-fire-explore-desktop-dark.png`.
