/* Foto curate locali — canoniche per stile, niente sorprese da stock remoto */
import photoVerace from "../../assets/verace.png";
import photoCanotto from "../../assets/canotto.png";
import photoTegliaRomana from "../../assets/tegliaromana.png";
import photoRomanaTonda from "../../assets/romanatonda.png";
import photoPinsa from "../../assets/pinsa.png";
import photoBonci from "../../assets/bonci.png";

// Nuove foto locali importate da temp/
import photoNewYork from "../../assets/new_york.png";
import photoDetroit from "../../assets/detroit.png";
import photoChicagoDeep from "../../assets/chicagodeepdish.png";
import photoFocacciaGenovese from "../../assets/focgenovese.png";
import photoSfincione from "../../assets/sfincione.png";
import photoPalaRomana from "../../assets/palaromana.png";
import photoGrandmaStyle from "../../assets/grandma.png";
import photoFocacciaRecco from "../../assets/focacciarecco.png";
import photoPadellinoTorino from "../../assets/padellino.png";
import photoPizzaBaciata from "../../assets/baciata.png";
import photoCiaccinoSenese from "../../assets/ciaccino.png";
import photoPizzaPatatePorchetta from "../../assets/patateporchetta.png";
import photoTrancioMilanese from "../../assets/tranciomilanese.png";
import photoChicagoTavern from "../../assets/chicagotavern.png";
import photoFocacciaBarese from "../../assets/focacciabarese.png";
import photoPizzaFritta from "../../assets/fritta.png";
import photoCalzoneNapoletano from "../../assets/calzonenapoletano.png";
import photoPizzaAlMetro from "../../assets/almetro.png";
import photoNewHavenApizza from "../../assets/newhavenapizza.png";
import photoFugazzeta from "../../assets/fugazzeta.png";
import photoCaliforniaStyle from "../../assets/california.png";
import photoGreekPan from "../../assets/greekpan.png";

export const STYLE_PHOTOS: Record<string, string> = {
  napoletana_stg: photoVerace,
  napoletana_canotto: photoCanotto,
  teglia_romana: photoTegliaRomana,
  tonda_romana: photoRomanaTonda,
  pinsa_romana: photoPinsa,
  new_york: photoNewYork,
  detroit: photoDetroit,
  chicago_deep: photoChicagoDeep,
  bonci_teglia: photoBonci,
  focaccia_genovese: photoFocacciaGenovese,
  sfincione: photoSfincione,
  pala_romana: photoPalaRomana,
  grandma_style: photoGrandmaStyle,
  focaccia_recco: photoFocacciaRecco,
  padellino_torino: photoPadellinoTorino,
  pizza_baciata: photoPizzaBaciata,
  ciaccino_senese: photoCiaccinoSenese,
  pizza_patate_porchetta: photoPizzaPatatePorchetta,
  trancio_milanese: photoTrancioMilanese,
  chicago_tavern: photoChicagoTavern,
  focaccia_barese: photoFocacciaBarese,
  pizza_fritta: photoPizzaFritta,
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
