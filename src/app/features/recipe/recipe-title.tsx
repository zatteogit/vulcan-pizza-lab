import { useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Heading, IconButton } from "../../components/ds/index";
import { MAX_RECIPE_NAME_LENGTH, normalizeRecipeName } from "../../data/saved-recipes";
import { useCms } from "../cms/cms-context";

export function RecipeTitle({ styleName, name, onRename }: {
  styleName: string;
  name?: string;
  onRename?: (name: string) => boolean;
}) {
  const { cms } = useCms();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLSpanElement>(null);
  const close = () => { setEditing(false); requestAnimationFrame(() => editRef.current?.querySelector("button")?.focus()); };
  useEffect(() => { if (editing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [editing]);
  return (
    <div className="recipe-title-content">
      {editing ? (
        <form className="recipe-title-editor" onSubmit={event => {
          event.preventDefault();
          if (onRename?.(normalizeRecipeName(draft) ?? "") !== false) close();
        }}>
          <input ref={inputRef} value={draft} onChange={event => setDraft(event.target.value)}
            onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); close(); } }}
            aria-label={cms.ui.recipeNameLabel} placeholder={cms.ui.recipeNamePlaceholder}
            maxLength={MAX_RECIPE_NAME_LENGTH} className="recipe-title-editor__input" />
          <IconButton type="submit" variant="ghost" aria-label={cms.ui.recipeNameConfirm}><Check size={19} /></IconButton>
          <IconButton type="button" variant="ghost" aria-label={cms.ui.cancel} onClick={close}><X size={19} /></IconButton>
        </form>
      ) : (
        <div className="recipe-title-content__row">
          <Heading level="page" className="recipe-view-title">{name || styleName}</Heading>
          {onRename && <span ref={editRef} className="recipe-title-content__edit"><IconButton type="button" variant="ghost" aria-label={cms.ui.recipeNameEdit}
            title={cms.ui.recipeNameEdit} onClick={() => { setDraft(name ?? ""); setEditing(true); }}><Pencil size={18} /></IconButton></span>}
        </div>
      )}
      {name && name !== styleName && <p className="recipe-title-content__style">{styleName}</p>}
    </div>
  );
}
