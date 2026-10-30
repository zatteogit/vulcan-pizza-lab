import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import { IconButton } from "../../components/ds/index";
import { useEscapeLayer } from "../../components/ds/escape-stack";
import { uiMessage } from "../../i18n/ui-messages";
import { formatOvenFuel, formatShortList } from "../../i18n/format";
import {
  OVEN_CATALOG_FILTERED,
  OVEN_MODELS,
  getOvenModel,
  ovenCatalogBrands,
  ovenSearchExamples,
  searchOvenModels,
  type OvenModel,
} from "../../data/oven-models";
import type { OvenType } from "../../domain/pizza-engine";

/* FW-15 (S18-A-03/B-04, S16-A-11): segnaposto e stato vuoto dal catalogo
   attivo. Con pochi modelli (edizione filtrata) la lista si apre al focus,
   senza dover indovinare cosa scrivere. */
const SMALL_CATALOG = OVEN_MODELS.length <= 6;

/* ═══ D-048 — «Qual è il tuo forno?» per marca e modello ═══
 * Si scrive marca o modello (es. «Koda 16»), si sceglie dalla lista e il
 * profilo prende tipo di forno e temperatura massima dichiarata dal
 * produttore. Chi non trova il suo forno sceglie il tipo dalla lista sotto.
 *
 * FW-12 (S16-B-09): pattern ARIA combobox. Il focus resta nel campo (anche
 * dopo la scelta), ↓/↑ scorrono i risultati, Invio sceglie, Esc chiude la
 * lista. La lista non è più una live region: lo stato annuncia solo il numero
 * di risultati e la conferma della scelta. */


export function OvenModelSearch({
  selectedId,
  onPick,
  onClear,
  formatTemp,
  currentTempC,
  onRestore,
  formatOvenType,
  initialQuery,
}: {
  selectedId: string | null;
  onPick: (model: OvenModel) => void;
  onClear: () => void;
  formatTemp: (celsius: number) => string;
  /** FW-07 (S16-A-02): temperatura impostata nel profilo, °C. */
  currentTempC?: number;
  /** FW-07: torna alla temperatura dichiarata dal produttore. */
  onRestore?: (model: OvenModel) => void;
  /** G5-WP-03: nome del tipo di forno per la riga «Usato come». */
  formatOvenType?: (type: OvenType) => string;
  /** G1a-WP-02 (D-G1a-02): testo già scritto, da un risultato «Forni» della
   *  ricerca. Il primo risultato è evidenziato, ma il forno cambia solo con un
   *  tocco o Invio (T10): qui non si sceglie niente. Vuoto (FW-10, «Cambia
   *  forno» da Scopri): solo il fuoco nel campo, senza testo. */
  initialQuery?: string;
}) {
  const inputId = useId();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery ?? "");
  const [activeIndex, setActiveIndex] = useState(() => (initialQuery && searchOvenModels(initialQuery).length > 0 ? 0 : -1));
  const [announcement, setAnnouncement] = useState("");
  const [focused, setFocused] = useState(false);
  const browsing = SMALL_CATALOG && focused && query.trim() === "";
  const results = useMemo(() => (browsing ? OVEN_MODELS : searchOvenModels(query)), [browsing, query]);
  const selected = getOvenModel(selectedId);
  const expanded = query.trim() !== "" || browsing;
  const optionId = (index: number) => `${listId}-option-${index}`;

  const close = () => {
    setQuery("");
    setActiveIndex(-1);
    setFocused(false);
  };
  useEscapeLayer(expanded, close);

  useEffect(() => {
    if (initialQuery === undefined) return;
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ block: "center" });
  }, [initialQuery]);

  const pick = (model: OvenModel) => {
    onPick(model);
    close();
    setAnnouncement(uiMessage("features.profile.oven-model-search.selected", [`${model.brand} ${model.model}`]));
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!expanded || results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      pick(results[activeIndex]);
    }
  };

  const noneText = OVEN_CATALOG_FILTERED
    ? uiMessage("features.profile.oven-model-search.noneEdition", [formatShortList(ovenCatalogBrands())])
    : uiMessage("features.profile.oven-model-search.none");
  const status = expanded
    ? results.length === 0
      ? noneText
      : uiMessage("features.profile.oven-model-search.count", [results.length])
    : announcement;

  return (
    <section className="oven-model-search" aria-labelledby={`${inputId}-label`}>
      <label id={`${inputId}-label`} htmlFor={inputId} className="type-label oven-model-search__label">
        {uiMessage("features.profile.oven-model-search.label")}
      </label>
      <p className="oven-model-search__field">
        <Search size={16} aria-hidden="true" className="oven-model-search__icon" />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={expanded && results.length > 0}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={expanded && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
            setAnnouncement("");
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={uiMessage("features.profile.oven-model-search.placeholderFrom", [formatShortList(ovenSearchExamples())])}
          autoComplete="off"
          className="oven-model-search__input"
        />
      </p>
      {/* G5-WP-03 (S15-A-02): la conferma del modello sta sotto il campo che
          l'ha prodotta e dice come lo usa il motore (tipo · temperatura). */}
      {selected && (
        <p className="oven-model-search__selected">
          <span data-region="selected-name">
            {uiMessage("features.profile.oven-model-search.selected", [`${selected.brand} ${selected.model}`])}
            {formatOvenType && (
              <small className="type-data-sm oven-model-search__mapped">
                {uiMessage("features.profile.oven-model-search.mapped", [formatOvenType(selected.ovenType), formatTemp(selected.maxTempC)])}
              </small>
            )}
          </span>
          <IconButton
            size="sm"
            variant="ghost"
            onClick={onClear}
            aria-label={uiMessage("features.profile.oven-model-search.clear")}
          >
            <X size={14} />
          </IconButton>
        </p>
      )}
      {/* FW-07 (S16-A-02): modello e cursore non si contraddicono in silenzio. */}
      {selected && currentTempC !== undefined && currentTempC !== selected.maxTempC && (
        <p className="type-data-sm oven-model-search__adjusted" role="status">
          <span data-region="adjusted-temp">
            {uiMessage("features.profile.oven-model-search.adjusted", [`${selected.brand} ${selected.model}`, formatTemp(currentTempC), formatTemp(selected.maxTempC)])}
          </span>
          {onRestore && (
            <button type="button" className="needs-oven-model__link" onClick={() => onRestore(selected)}>
              {uiMessage("features.profile.oven-model-search.restore")}
            </button>
          )}
        </p>
      )}
      <p className="sr-only" role="status">{status}</p>
      {expanded && results.length === 0 && (
        <p className="oven-model-search__empty" aria-hidden="true">
          {noneText}
        </p>
      )}
      {expanded && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={`${inputId}-label`}
          className="oven-model-search__results"
        >
          {results.map((model, index) => (
            <li
              key={model.id}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              className={`oven-model-search__result${index === activeIndex ? " oven-model-search__result--active" : ""}`}
              /* Il campo tiene il focus: il tocco sceglie senza toglierlo. */
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => pick(model)}
            >
              <strong className="oven-model-search__name">
                {model.brand} {model.model}
              </strong>
              <small className="oven-model-search__meta">
                {formatOvenFuel(model.fuel)} · {uiMessage("features.profile.oven-model-search.upTo", [formatTemp(model.maxTempC)])}
              </small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
