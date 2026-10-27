import { useId, useRef, useState } from "react";
import { Check, Link, Share2, X } from "lucide-react";
import { CtaButton, Heading, IconButton, ModalSheet } from "../../components/ds/index";
import { copyRecipeLink, shareRecipeLink } from "../../adapters/browser/recipe-sharing";
import { useCms } from "../cms/cms-context";
import { uiMessage } from "../../i18n/ui-messages";

export function RecipeShare({ url, title }: { url: string; title: string }) {
  const { cms } = useCms();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shareState, setShareState] = useState<"copied" | "manual" | "unavailable" | null>(null);
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const close = () => { generation.current++; setOpen(false); };
  const nativeAvailable = typeof navigator.share === "function";
  const messages = {
    copied: uiMessage("recipe.share.copied"),
    manual: uiMessage("recipe.share.manual"),
    unavailable: uiMessage("recipe.share.unavailable"),
  };
  return <div className="recipe-share">
    <button type="button" className="recipe-share__trigger" onClick={event => {
      event.currentTarget.focus({ preventScroll: true });
      generation.current++; setBusy(false); setShareState(null); setOpen(true);
    }} aria-haspopup="dialog">
      <Share2 size={16} aria-hidden="true" />{cms.ui.share}
    </button>
    <ModalSheet open={open} onClose={close} size="sm" entry="pop" surface="solid"
      ariaLabel={uiMessage("recipe.share.title")} panelClassName="recipe-share-dialog">
      <div className="recipe-share-dialog__heading">
        <Heading level="sm">{uiMessage("recipe.share.title")}</Heading>
        <IconButton onClick={close} aria-label={cms.ui.close}><X size={18} aria-hidden="true" /></IconButton>
      </div>
      <label className="recipe-share-dialog__label" htmlFor={inputId}>{uiMessage("recipe.share.link")}</label>
      <input ref={input} id={inputId} className="recipe-share-dialog__url" value={url} readOnly
        onFocus={event => event.target.select()} />
      <div className="recipe-share-dialog__actions">
        {nativeAvailable && <CtaButton disabled={busy} onClick={async () => {
          const attempt = generation.current; setBusy(true); setShareState(null);
          const result = await shareRecipeLink(url, title);
          if (attempt !== generation.current) return;
          setBusy(false);
          if (result === "opened") close();
          else if (result === "unavailable") setShareState("unavailable");
        }}><Share2 size={17} aria-hidden="true" />{uiMessage("recipe.share.native")}</CtaButton>}
        <CtaButton variant={nativeAvailable ? "secondary" : "primary"} disabled={busy} onClick={async () => {
          const attempt = generation.current; setBusy(true); setShareState(null);
          const copied = await copyRecipeLink(url);
          if (attempt !== generation.current) return;
          setBusy(false); setShareState(copied ? "copied" : "manual");
          if (!copied) { input.current?.focus(); input.current?.select(); }
        }}>{shareState === "copied" ? <Check size={17} aria-hidden="true" /> : <Link size={17} aria-hidden="true" />}
          {uiMessage("recipe.share.copy")}
        </CtaButton>
      </div>
      <p role="status" className="recipe-share-dialog__feedback">{shareState ? messages[shareState] : ""}</p>
    </ModalSheet>
  </div>;
}
