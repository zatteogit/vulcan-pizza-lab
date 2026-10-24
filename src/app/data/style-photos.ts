/* Foto curate locali — canoniche per stile, niente sorprese da stock remoto */
import photoVerace from "../../assets/pizzas/verace.webp";
import photoCanotto from "../../assets/pizzas/canotto.webp";
import photoTegliaRomana from "../../assets/pizzas/tegliaromana.webp";
import photoRomanaTonda from "../../assets/pizzas/romanatonda.webp";
import photoPinsa from "../../assets/pizzas/pinsa.webp";

// Nuove foto locali importate da temp/
import photoNewYork from "../../assets/pizzas/new_york.webp";
import photoDetroit from "../../assets/pizzas/detroit.webp";
import photoChicagoDeep from "../../assets/pizzas/chicagodeepdish.webp";
import photoFocacciaGenovese from "../../assets/pizzas/focgenovese.webp";
import photoSfincione from "../../assets/pizzas/sfincione.webp";
import photoPalaRomana from "../../assets/pizzas/palaromana.webp";
import photoGrandmaStyle from "../../assets/pizzas/grandma.webp";
import photoFocacciaRecco from "../../assets/pizzas/focacciarecco.webp";
import photoPadellinoTorino from "../../assets/pizzas/padellino.webp";
import photoPizzaBaciata from "../../assets/pizzas/baciata.webp";
import photoCiaccinoSenese from "../../assets/pizzas/ciaccino.webp";
import photoPizzaPatatePorchetta from "../../assets/pizzas/patateporchetta.webp";
import photoTrancioMilanese from "../../assets/pizzas/tranciomilanese.webp";
import photoChicagoTavern from "../../assets/pizzas/chicagotavern.webp";
import photoFocacciaBarese from "../../assets/pizzas/focacciabarese.webp";
import photoPizzaFritta from "../../assets/pizzas/fritta.webp";
import photoPizzaFrittaTonda from "../../assets/pizzas/frittatonda.webp";
import photoMontanara from "../../assets/pizzas/montanara.webp";
import photoCalzoneNapoletano from "../../assets/pizzas/calzonenapoletano.webp";
import photoPizzaAlMetro from "../../assets/pizzas/almetro.webp";
import photoNewHavenApizza from "../../assets/pizzas/newhavenapizza.webp";
import photoFugazzeta from "../../assets/pizzas/fugazzeta.webp";
import photoCaliforniaStyle from "../../assets/pizzas/california.webp";
import photoGreekPan from "../../assets/pizzas/greekpan.webp";

export const STYLE_PHOTOS: Record<string, string> = {
  napoletana_stg: photoVerace,
  napoletana_canotto: photoCanotto,
  teglia_romana: photoTegliaRomana,
  tonda_romana: photoRomanaTonda,
  pinsa_romana: photoPinsa,
  new_york: photoNewYork,
  detroit: photoDetroit,
  chicago_deep: photoChicagoDeep,
  focaccia_genovese: photoFocacciaGenovese,
  sfincione: photoSfincione,
  pala_romana: photoPalaRomana,
  grandma_style: photoGrandmaStyle,
  focaccia_recco: photoFocacciaRecco,
  padellino_torino: photoPadellinoTorino,
  pizza_baciata: photoPizzaBaciata,
  ciaccino_senese: photoCiaccinoSenese,
  pizza_spaccata: photoPizzaPatatePorchetta,
  trancio_milanese: photoTrancioMilanese,
  chicago_tavern: photoChicagoTavern,
  focaccia_barese: photoFocacciaBarese,
  pizza_fritta: photoPizzaFritta,
  pizza_fritta_tonda: photoPizzaFrittaTonda,
  pizza_montanara: photoMontanara,
  calzone_napoletano: photoCalzoneNapoletano,
  pizza_al_metro: photoPizzaAlMetro,
  new_haven_apizza: photoNewHavenApizza,
  fugazzeta: photoFugazzeta,
  california_style: photoCaliforniaStyle,
  greek_pan: photoGreekPan,
};

/* VPL-D/C: video di cottura per-stile (serviti da public/videos, lazy dal tag
 * <video>). Usati nel detail sheet con transizione foto→video sfocata. Solo gli
 * stili con un video curato; gli altri restano sulla foto.
 * BUN-1: il poster è il primo fotogramma in WebP (scripts/build-responsive-images.py
 * --posters), così il tag non deve scaricare il video per mostrare un'immagine. */
export interface StyleVideo {
  src: string;
  poster: string;
}

export const STYLE_VIDEOS: Record<string, StyleVideo> = {
  napoletana_stg: { src: "/videos/napoletana_stg.mp4", poster: "/videos/napoletana_stg-poster.webp" },
  chicago_deep: { src: "/videos/chicago_deep.mp4", poster: "/videos/chicago_deep-poster.webp" },
  detroit: { src: "/videos/detroit.mp4", poster: "/videos/detroit-poster.webp" },
  new_york: { src: "/videos/new_york.mp4", poster: "/videos/new_york-poster.webp" },
  focaccia_genovese: { src: "/videos/focaccia_genovese.mp4", poster: "/videos/focaccia_genovese-poster.webp" },
  focaccia_barese: { src: "/videos/focaccia_barese.mp4", poster: "/videos/focaccia_barese-poster.webp" },
};
