import { Search, X } from "lucide-react";
import { useEffect, type KeyboardEvent, type RefObject } from "react";
import { useCms } from "../../features/cms/cms-context";

/* ═══ U-5 — campo della ricerca a tutta pagina ═══
 * Lo stesso campo vive nel dock (mobile, dove i tab gli lasciano posto) o in
 * cima alla pagina dei risultati (desktop e pagine senza dock). Invio apre il
 * primo risultato, freccia giù entra nella lista (gestiti dalla vista). */

export const SEARCH_INPUT_ID = "app-search-input";
export const SEARCH_RESULTS_ID = "search-results";

export function SearchField({
  value,
  onChange,
  inputRef,
  onKeyDown,
  variant,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  variant: "dock" | "page";
}) {
  const { cms } = useCms();
  return (
    <div className={variant === "page" ? "search-field search-field--page" : "search-field"}>
      <Search size={20} aria-hidden="true" className="search-field__icon" />
      <input
        ref={inputRef}
        id={SEARCH_INPUT_ID}
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={cms.pages.searchPlaceholder}
        aria-label={cms.pages.searchFieldLabel}
        className="search-field__input"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-controls={SEARCH_RESULTS_ID}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="search-field__clear"
          aria-label={cms.pages.searchClearLabel}
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/** Campo + «Annulla» in testa alla pagina dei risultati, dove il dock non c'è. */
export function PageSearchBar({
  onCancel,
  ...field
}: Omit<Parameters<typeof SearchField>[0], "variant"> & { onCancel: () => void }) {
  const { cms } = useCms();
  /* Arriva col chunk dei risultati, dopo il focus della shell: lo prende qui. */
  const { inputRef } = field;
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, [inputRef]);
  return (
    <section role="search" className="search-page-bar">
      <SearchField variant="page" {...field} />
      <button type="button" onClick={onCancel} className="search-page-bar__cancel">
        {cms.ui.cancel}
      </button>
    </section>
  );
}
