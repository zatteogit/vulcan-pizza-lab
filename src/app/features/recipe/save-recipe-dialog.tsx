import { useCallback, useEffect, useId, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Bookmark } from "lucide-react";
import { CtaButton, Heading, ModalSheet } from "../../components/ds/index";
import { MAX_RECIPE_NAME_LENGTH, normalizeRecipeName } from "../../data/saved-recipes";
import { useCms } from "../cms/cms-context";
import { uiMessage } from "../../i18n/ui-messages";

/** Opening a naming dialog is not a completed save. Exit navigation waits
 * for the successful write; cancellation never touches the recipe book. */
export function useRecipeSave({ personalized, saved, onCommit }: {
  personalized: boolean;
  saved: boolean;
  onCommit: (name?: string) => boolean;
}) {
  const [pending, setPending] = useState<{ afterSave?: () => void } | null>(null);
  const requestSave = useCallback((afterSave?: () => void): boolean => {
    if (personalized && !saved) { setPending({ afterSave }); return false; }
    const ok = onCommit();
    if (ok) afterSave?.();
    return ok;
  }, [personalized, saved, onCommit]);
  const confirm = (name: string): boolean => {
    if (!onCommit(name)) return false;
    setPending(null);
    pending?.afterSave?.();
    return true;
  };
  return { open: pending !== null, requestSave, confirm, cancel: () => setPending(null) };
}

export function SaveRecipeDialog({ open, defaultName, source, onConfirm, onClose }: {
  open: boolean;
  defaultName: string;
  source: { href: string; name: string };
  onConfirm: (name: string) => boolean;
  onClose: () => void;
}) {
  const { cms } = useCms();
  const inputId = useId();
  const [draft, setDraft] = useState(defaultName);
  const [failed, setFailed] = useState(false);
  useEffect(() => { if (open) { setDraft(defaultName); setFailed(false); } }, [open, defaultName]);
  return <ModalSheet open={open} onClose={onClose} size="sm" entry="pop" surface="solid"
    ariaLabel={uiMessage("recipe.save.title")} panelClassName="recipe-save-dialog">
    <div className="recipe-save-dialog__heading">
      <Bookmark size={21} aria-hidden="true" />
      <Heading level="sm">{uiMessage("recipe.save.title")}</Heading>
    </div>
    <form onSubmit={event => {
      event.preventDefault();
      setFailed(!onConfirm(normalizeRecipeName(draft) ?? defaultName));
    }}>
      <label className="recipe-save-dialog__label" htmlFor={inputId}>{cms.ui.recipeNameLabel}</label>
      <input id={inputId} className="recipe-save-dialog__input" value={draft}
        maxLength={MAX_RECIPE_NAME_LENGTH} placeholder={cms.ui.recipeNamePlaceholder}
        autoComplete="off" onChange={event => setDraft(event.target.value)} onFocus={event => event.target.select()} />
      <Link className="recipe-save-dialog__source" to={source.href} target="_blank" rel="noreferrer">
        {uiMessage("recipe.save.source", [source.name])}<ArrowUpRight size={15} aria-hidden="true" />
      </Link>
      {failed && <p role="alert" className="recipe-save-dialog__error">{cms.ui.saveFailedStorage}</p>}
      <div className="recipe-save-dialog__actions">
        <CtaButton type="button" variant="secondary" elevated={false} onClick={onClose}>{cms.ui.cancel}</CtaButton>
        <CtaButton type="submit">{uiMessage("recipe.save.confirm")}</CtaButton>
      </div>
    </form>
  </ModalSheet>;
}
