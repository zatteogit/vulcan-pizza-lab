/* Budget D-059 (30/10/2026): nell'app l'italiano è un bundle lazy che
 * main.tsx carica prima del primo render. Nei test lo si mette in cache
 * subito, con il suo catalogo uiMessage, così i componenti fuori dal
 * CmsProvider leggono l'italiano come prima. */
import { primeLocaleBundle } from "./app/features/cms/locales/index";
import { IT_LOCALE } from "./app/features/cms/locales/it";

primeLocaleBundle(IT_LOCALE);
