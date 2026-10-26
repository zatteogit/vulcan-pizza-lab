import { describe, expect, it } from 'vitest';
import { createFormatter } from './i18n';
import { CMS_DEFAULTS } from './cms-context';
import { EN_LOCALE } from './locales/en';
import { DE_LOCALE } from './locales/de';
import { ES_LOCALE } from './locales/es';
import { FR_LOCALE } from './locales/fr';
import { PT_LOCALE } from './locales/pt';
import { JA_LOCALE } from './locales/ja';
import { getDietaryWarnings } from '../../data/dietary-data';
import { getTermById } from '../../data/glossary-data';

describe('contenuto scientifico: tutte le sette lingue',()=>{
 for(const [lang,cms] of Object.entries({it:CMS_DEFAULTS,en:EN_LOCALE,de:DE_LOCALE,es:ES_LOCALE,fr:FR_LOCALE,pt:PT_LOCALE,ja:JA_LOCALE})){
  it(lang+': nessuna percentuale sanitaria dalle ore, nota bilancia e modello di lavoro tradotti',()=>{
   expect(createFormatter(cms.ui!,lang).durationMinutes(24*60+8)).toContain('8');
   const fodmap=getTermById('fodmap',cms)!;
   expect(fodmap.whyImportant).not.toMatch(/\d+\s*%/);
   expect(getTermById('d_score',cms)!.formula).toBeUndefined();
   expect(getTermById('w_alveograph',cms)!.formula).not.toContain('dt');
   const warnings=getDietaryWarnings(['low_fodmap','histamine'],[{name:'Farina di grano',gluten:true}]);
   expect(warnings).toHaveLength(2);
   for(const warning of warnings) expect(cms.engineMessages![warning.message.key], `${lang}: ${warning.message.key}`).toBeTruthy();
   for(const key of Object.keys(CMS_DEFAULTS.engineMessages).filter(k => /^(diet\.|learn\.|range\.|timeline\.preheat\.includes|card\.ready$|change\.topping$)/.test(k))) {
    expect(cms.engineMessages![key], `${lang}: ${key}`).toBeTruthy();
   }
   expect(JSON.stringify(warnings)).not.toMatch(/\d+\s*%|mg\/kg|IBS/);
   expect(cms.engineMessages!['hint.yeastPrecisionScale']).toBeTruthy();
   expect(cms.engineMessages!['timeline.batchModel']).toBeTruthy();
   expect(cms.timelineLabels!.bulk_cold!.tipNerd).toContain('FODMAP');
   expect(cms.timelineLabels!.bulk_cold!.tipNerd).toContain('{factor}');
   if(lang!=='it') expect(cms.timelineLabels!.bulk_cold!.tipNerd).not.toBe(CMS_DEFAULTS.timelineLabels.bulk_cold.tipNerd);
   expect(cms.timelineLabels!.rest!.tipNerd).not.toContain('{factor}');
  });
 }
});
