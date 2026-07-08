/* Foto curate locali — canoniche per stile, niente sorprese da stock remoto */
import photoVerace from "../../assets/pizzas/verace.png";
import photoCanotto from "../../assets/pizzas/canotto.png";
import photoTegliaRomana from "../../assets/pizzas/tegliaromana.png";
import photoRomanaTonda from "../../assets/pizzas/romanatonda.png";
import photoPinsa from "../../assets/pizzas/pinsa.png";

// Nuove foto locali importate da temp/
import photoNewYork from "../../assets/pizzas/new_york.png";
import photoDetroit from "../../assets/pizzas/detroit.png";
import photoChicagoDeep from "../../assets/pizzas/chicagodeepdish.png";
import photoFocacciaGenovese from "../../assets/pizzas/focgenovese.png";
import photoSfincione from "../../assets/pizzas/sfincione.png";
import photoPalaRomana from "../../assets/pizzas/palaromana.png";
import photoGrandmaStyle from "../../assets/pizzas/grandma.png";
import photoFocacciaRecco from "../../assets/pizzas/focacciarecco.png";
import photoPadellinoTorino from "../../assets/pizzas/padellino.png";
import photoPizzaBaciata from "../../assets/pizzas/baciata.png";
import photoCiaccinoSenese from "../../assets/pizzas/ciaccino.png";
import photoPizzaPatatePorchetta from "../../assets/pizzas/patateporchetta.png";
import photoTrancioMilanese from "../../assets/pizzas/tranciomilanese.png";
import photoChicagoTavern from "../../assets/pizzas/chicagotavern.png";
import photoFocacciaBarese from "../../assets/pizzas/focacciabarese.png";
import photoPizzaFritta from "../../assets/pizzas/fritta.png";
import photoMontanara from "../../assets/pizzas/montanara.png";
import photoCalzoneNapoletano from "../../assets/pizzas/calzonenapoletano.png";
import photoPizzaAlMetro from "../../assets/pizzas/almetro.png";
import photoNewHavenApizza from "../../assets/pizzas/newhavenapizza.png";
import photoFugazzeta from "../../assets/pizzas/fugazzeta.png";
import photoCaliforniaStyle from "../../assets/pizzas/california.png";
import photoGreekPan from "../../assets/pizzas/greekpan.png";

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
 * stili con un video curato; gli altri restano sulla foto. */
export const STYLE_VIDEOS: Record<string, string> = {
  napoletana_stg: "/videos/napoletana_stg.mp4",
  chicago_deep: "/videos/chicago_deep.mp4",
  detroit: "/videos/detroit.mp4",
  new_york: "/videos/new_york.mp4",
  focaccia_genovese: "/videos/focaccia_genovese.mp4",
  focaccia_barese: "/videos/focaccia_barese.mp4",
};
