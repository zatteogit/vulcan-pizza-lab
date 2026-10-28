import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import { IconButton } from "../../components/ds/index";
import { useEscapeLayer } from "../../components/ds/escape-stack";
import { uiMessage } from "../../i18n/ui-messages";
import { getOvenModel, searchOvenModels, type OvenFuel, type OvenModel } from "../../data/oven-models";

/* ═══ D-048 — «Qual è il tuo forno?» per marca e modello ═══
 * Si scrive marca o modello (es. «Koda 16»), si sceglie dalla lista e il
 * profilo prende tipo di forno e temperatura massima dichiarata dal
 * produttore. Chi non trova il suo forno sceglie il tipo dalla lista sotto.
 *
 * FW-12 (S16-B-09): pattern ARIA combobox. Il focus resta nel campo (anche
 * dopo la scelta), ↓/↑ scorrono i risultati, Invio sceglie, Esc chiude la
 * lista. La lista non è più una live region: lo stato annuncia solo il numero
 * di risultati e la conferma della scelta. */

function fuelLabel(fuel: OvenFuel): string {
  switch (fuel) {
    case "wood":
      return uiMessage("features.profile.oven-model-search.fuelWood");
    case "gas":
      return uiMessage("features.profile.oven-model-search.fuelGas");
    case "pellet":
      return uiMessage("features.profile.oven-model-search.fuelPellet");
    default:
      return uiMessage("features.profile.oven-model-search.fuelElectric");
  }
}

export function OvenModelSearch({
  selectedId,
  onPick,
  onClear,
  formatTemp,
}: {
  selectedId: string | null;
  onPick: (model: OvenModel) => void;
  onClear: () => void;
  formatTemp: (celsius: number) => string;
}) {
  const inputId = useId();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [announcement, setAnnouncement] = useState("");
  const results = useMemo(() => searchOvenModels(query), [query]);
  const selected = getOvenModel(selectedId);
  const expanded = query.trim() !== "";
  const optionId = (index: number) => `${listId}-option-${index}`;

  const close = () => {
    setQuery("");
    setActiveIndex(-1);
  };
  useEscapeLayer(expanded, close);

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

  const status = expanded
    ? results.length === 0
      ? uiMessage("features.profile.oven-model-search.none")
      : uiMessage("features.profile.oven-model-search.count", [results.length])
    : announcement;

  return (
    <section className="oven-model-search" aria-labelledby={`${inputId}-label`}>
      {selected && (
        <p className="oven-model-search__selected">
          <span data-region="selected-name">
            {uiMessage("features.profile.oven-model-search.selected", [`${selected.brand} ${selected.model}`])}
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
          placeholder={uiMessage("features.profile.oven-model-search.placeholder")}
          autoComplete="off"
          className="oven-model-search__input"
        />
      </p>
      <p className="sr-only" role="status">{status}</p>
      {expanded && results.length === 0 && (
        <p className="oven-model-search__empty" aria-hidden="true">
          {uiMessage("features.profile.oven-model-search.none")}
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
                {fuelLabel(model.fuel)} · {uiMessage("features.profile.oven-model-search.upTo", [formatTemp(model.maxTempC)])}
              </small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
