/* FW-16 — la riga «cosa cambia» sotto ogni impostazione della cucina.
 * Il tipo di effetto (use-cases/setting-effects.ts) decide il tono, il testo
 * viene dal CMS (cms.settingEffects.<id>): nessuna promessa scritta nel codice. */
import { useCms } from "../cms/cms-context";
import { settingEffect, type SettingId } from "../../use-cases/setting-effects";

export function SettingEffectNote({ settingId, className }: { settingId: SettingId; className?: string }) {
  const { cms } = useCms();
  const text = cms.settingEffects?.[settingId];
  if (!text) return null;
  return (
    <p
      className={className ? `setting-effect ${className}` : "setting-effect"}
      data-region="setting-effect"
      data-effect={settingEffect(settingId).effect}
    >
      {text}
    </p>
  );
}
