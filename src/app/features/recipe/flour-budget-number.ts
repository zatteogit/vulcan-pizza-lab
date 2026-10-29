/** Revisione G2 (lingue): i grammi di farina scritti a mano, letti secondo la
 * lingua. Blocchi di 3 cifre dopo il separatore delle migliaia della lingua
 * sono migliaia («1.500» in italiano, «1,500» in inglese; più blocchi lo sono
 * sempre); altrimenti un solo separatore è la virgola decimale («1500,5»).
 * Se resta ambiguo («1,500» in italiano) il risultato è NaN: meglio chiedere
 * di nuovo che calcolare su 1,5 g. */
export function parseLocaleGrams(text: string, bcp47: string): number {
  const raw = text.replace(/[\s']/g, "");
  const grouped = /^\d{1,3}([.,])\d{3}(\1\d{3})*$/.exec(raw);
  if (grouped) return grouped[2] || (12345).toLocaleString(bcp47).includes(grouped[1]) ? Number(raw.replace(/\D/g, "")) : NaN;
  return /^\d*[.,]?\d+$/.test(raw) ? Number(raw.replace(",", ".")) : NaN;
}
