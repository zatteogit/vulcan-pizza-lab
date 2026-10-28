import { useId, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { IconButton } from "../../components/ds/index";
import { uiMessage } from "../../i18n/ui-messages";
import { getOvenModel, searchOvenModels, type OvenFuel, type OvenModel } from "../../data/oven-models";

/* ═══ D-048 — «Qual è il tuo forno?» per marca e modello ═══
 * Si scrive marca o modello (es. «Koda 16»), si sceglie dalla lista e il
 * profilo prende tipo di forno e temperatura massima dichiarata dal
 * produttore. Chi non trova il suo forno sceglie il tipo dalla lista sotto. */

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
  currentTempC,
  onRestore,
}: {
  selectedId: string | null;
  onPick: (model: OvenModel) => void;
  onClear: () => void;
  formatTemp: (celsius: number) => string;
  /** FW-07 (S16-A-02): temperatura impostata nel profilo, °C. */
  currentTempC?: number;
  /** FW-07: torna alla temperatura dichiarata dal produttore. */
  onRestore?: (model: OvenModel) => void;
}) {
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchOvenModels(query), [query]);
  const selected = getOvenModel(selectedId);

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
      <label id={`${inputId}-label`} htmlFor={inputId} className="type-label oven-model-search__label">
        {uiMessage("features.profile.oven-model-search.label")}
      </label>
      <p className="oven-model-search__field">
        <Search size={16} aria-hidden="true" className="oven-model-search__icon" />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={uiMessage("features.profile.oven-model-search.placeholder")}
          autoComplete="off"
          aria-controls={listId}
          className="oven-model-search__input"
        />
      </p>
      {query.trim() !== "" && (
        <ul id={listId} className="oven-model-search__results" aria-live="polite">
          {results.length === 0 ? (
            <li className="oven-model-search__empty">{uiMessage("features.profile.oven-model-search.none")}</li>
          ) : (
            results.map((model) => (
              <li key={model.id}>
                <button
                  type="button"
                  className="oven-model-search__result"
                  onClick={() => {
                    onPick(model);
                    setQuery("");
                  }}
                >
                  <strong className="oven-model-search__name">
                    {model.brand} {model.model}
                  </strong>
                  <small className="oven-model-search__meta">
                    {fuelLabel(model.fuel)} · {uiMessage("features.profile.oven-model-search.upTo", [formatTemp(model.maxTempC)])}
                  </small>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}
