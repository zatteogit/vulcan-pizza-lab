/* === 10 DATABASE PARAMETRICI — Fase B === */
/* Dati da Notion · 10 tabelle parametriche per stile pizza */
/* Allineato 16 marzo 2026 */

/* ═══ 1. TEMPERATURE FORNO IDEALI ═══ */
export interface OvenTempParams {
  styleId: string;
  idealTemp_c: number;
  minTemp_c: number;
  maxTemp_c: number;
  ovenType: string;
  preheatingMin: number;
  note: string;
}

const OVEN_TEMPS_DB: OvenTempParams[] = [
  { styleId: "napoletana_stg", idealTemp_c: 485, minTemp_c: 430, maxTemp_c: 500, ovenType: "legna", preheatingMin: 60, note: "AVPN 2024: 430-485°C, 60-90 secondi cottura. Forno a cupola con piano refrattario." },
  { styleId: "napoletana_canotto", idealTemp_c: 450, minTemp_c: 400, maxTemp_c: 480, ovenType: "elettrico_alto", preheatingMin: 45, note: "Temp più bassa della STG per cornicione alto — evitare bruciature esterne." },
  { styleId: "teglia_romana", idealTemp_c: 280, minTemp_c: 250, maxTemp_c: 320, ovenType: "elettrico_std", preheatingMin: 30, note: "Teglia unta, temp media per cottura uniforme del fondo. Pietra refrattaria consigliata." },
  { styleId: "tonda_romana", idealTemp_c: 320, minTemp_c: 280, maxTemp_c: 350, ovenType: "elettrico_std", preheatingMin: 30, note: "Più alta della teglia per croccantezza. Scrocchiarella: sottile e friabile." },
  { styleId: "pinsa_romana", idealTemp_c: 380, minTemp_c: 330, maxTemp_c: 420, ovenType: "elettrico_alto", preheatingMin: 40, note: "Pinsa vuole temp alta per l'ovale allungato e gli alveoli aperti." },
  { styleId: "pala_romana", idealTemp_c: 350, minTemp_c: 300, maxTemp_c: 400, ovenType: "elettrico_alto", preheatingMin: 35, note: "Cotta su pala direttamente sulla pietra. Combinazione crunch/morbidezza." },
  { styleId: "new_york", idealTemp_c: 290, minTemp_c: 260, maxTemp_c: 320, ovenType: "elettrico_std", preheatingMin: 30, note: "Forno deck o domestico con acciaio/pietra. 8-12 min cottura." },
  { styleId: "detroit", idealTemp_c: 270, minTemp_c: 250, maxTemp_c: 290, ovenType: "elettrico_std", preheatingMin: 25, note: "Teglia blue steel, formaggio fino ai bordi. Caramellizzazione laterale richiede calore." },
  { styleId: "chicago_deep", idealTemp_c: 225, minTemp_c: 200, maxTemp_c: 235, ovenType: "elettrico_std", preheatingMin: 25, note: "Deep dish: temp media-bassa (425-450°F), cottura lunga 25-35 min per fondo burro." },
  { styleId: "grandma_style", idealTemp_c: 250, minTemp_c: 220, maxTemp_c: 280, ovenType: "elettrico_std", preheatingMin: 25, note: "Teglia oliata generosamente. Cottura media per fondo dorato." },
  { styleId: "bonci_teglia", idealTemp_c: 280, minTemp_c: 250, maxTemp_c: 300, ovenType: "elettrico_std", preheatingMin: 30, note: "Metodo Bonci: teglia con olio, doppia cottura (bianco + condita)." },
  { styleId: "focaccia_genovese", idealTemp_c: 230, minTemp_c: 210, maxTemp_c: 250, ovenType: "elettrico_std", preheatingMin: 25, note: "Teglia con fossette. 20-25 min per focaccia dorata. Serve calore per bolle." },
  { styleId: "sfincione", idealTemp_c: 220, minTemp_c: 200, maxTemp_c: 240, ovenType: "elettrico_std", preheatingMin: 25, note: "Teglia oliata, sugo di cipolla + pangrattato. Tradizione palermitana, temp media." },
  { styleId: "focaccia_recco", idealTemp_c: 320, minTemp_c: 280, maxTemp_c: 380, ovenType: "elettrico_alto", preheatingMin: 35, note: "Stracchino tra due sfoglie sottilissime. Cottura veloce 8-10 min." },
  { styleId: "padellino_torino", idealTemp_c: 250, minTemp_c: 220, maxTemp_c: 280, ovenType: "elettrico_std", preheatingMin: 25, note: "Tegamino individuale, bordo soffice alto. Tradizione torinese." },
];

/* ═══ 2. TEMPI COTTURA PER STILE ═══ */
export interface BakingTimeParams {
  styleId: string;
  minSeconds: number;
  maxSeconds: number;
  idealSeconds: number;
  turns: number;
  note: string;
}

const BAKING_TIMES_DB: BakingTimeParams[] = [
  { styleId: "napoletana_stg", minSeconds: 60, maxSeconds: 90, idealSeconds: 75, turns: 3, note: "60-90s a 485°C. 3 rotazioni con pala per cottura uniforme." },
  { styleId: "napoletana_canotto", minSeconds: 90, maxSeconds: 150, idealSeconds: 120, turns: 2, note: "Poco più lunga per sviluppare il cornicione." },
  { styleId: "teglia_romana", minSeconds: 900, maxSeconds: 1200, idealSeconds: 1020, turns: 1, note: "15-20 min. Rotazione teglia a metà cottura." },
  { styleId: "tonda_romana", minSeconds: 300, maxSeconds: 480, idealSeconds: 360, turns: 1, note: "5-8 min su pietra refrattaria." },
  { styleId: "pinsa_romana", minSeconds: 180, maxSeconds: 360, idealSeconds: 240, turns: 1, note: "3-6 min. Forma ovale irregolare." },
  { styleId: "pala_romana", minSeconds: 240, maxSeconds: 420, idealSeconds: 300, turns: 1, note: "4-7 min direttamente su pala/pietra." },
  { styleId: "new_york", minSeconds: 480, maxSeconds: 720, idealSeconds: 600, turns: 1, note: "8-12 min. Fondo deve risultare dorato e rigido." },
  { styleId: "detroit", minSeconds: 660, maxSeconds: 900, idealSeconds: 780, turns: 1, note: "11-15 min a 270°C. Formaggio caramellato ai bordi." },
  { styleId: "chicago_deep", minSeconds: 1500, maxSeconds: 2100, idealSeconds: 1800, turns: 0, note: "25-35 min. Non girare! Cottura lenta per fondo burro." },
  { styleId: "grandma_style", minSeconds: 720, maxSeconds: 1080, idealSeconds: 900, turns: 1, note: "12-18 min. Fondo oliato dorato." },
  { styleId: "bonci_teglia", minSeconds: 900, maxSeconds: 1200, idealSeconds: 1020, turns: 1, note: "15-20 min prima cottura + 5-8 min con condimento." },
  { styleId: "focaccia_genovese", minSeconds: 1200, maxSeconds: 1500, idealSeconds: 1320, turns: 1, note: "20-25 min. Fossette devono raccogliere olio." },
  { styleId: "sfincione", minSeconds: 1200, maxSeconds: 1500, idealSeconds: 1380, turns: 1, note: "20-25 min. Pangrattato deve essere dorato." },
  { styleId: "focaccia_recco", minSeconds: 480, maxSeconds: 600, idealSeconds: 540, turns: 0, note: "8-10 min. Sfoglia superiore deve blistare." },
  { styleId: "padellino_torino", minSeconds: 720, maxSeconds: 1080, idealSeconds: 900, turns: 0, note: "12-18 min nel tegamino. Non girare." },
];

/* ═══ 3. PARAMETRI IMPASTO BASE ═══ */
export interface DoughBaseParams {
  styleId: string;
  ballWeight_g: number;
  panSize_cm?: number;
  panShape?: "round" | "rectangular";
  thickness_mm: number;
  stretchMethod: string;
  restAfterBall_min: number;
}

const DOUGH_BASE_DB: DoughBaseParams[] = [
  { styleId: "napoletana_stg", ballWeight_g: 250, thickness_mm: 3, stretchMethod: "Stesura a mano (schiaffo napoletano)", restAfterBall_min: 120 },
  { styleId: "napoletana_canotto", ballWeight_g: 280, thickness_mm: 4, stretchMethod: "Stesura a mano delicata, bordo alto", restAfterBall_min: 180 },
  { styleId: "teglia_romana", ballWeight_g: 800, panSize_cm: 40, panShape: "rectangular", thickness_mm: 15, stretchMethod: "Stesura in teglia con olio (3 stesure)", restAfterBall_min: 0 },
  { styleId: "tonda_romana", ballWeight_g: 200, thickness_mm: 2, stretchMethod: "Mattarello + stesura a mano", restAfterBall_min: 60 },
  { styleId: "pinsa_romana", ballWeight_g: 280, thickness_mm: 8, stretchMethod: "Stesura a mano ovale, bordo irregolare", restAfterBall_min: 120 },
  { styleId: "pala_romana", ballWeight_g: 350, thickness_mm: 6, stretchMethod: "Stesura rettangolare su pala", restAfterBall_min: 90 },
  { styleId: "new_york", ballWeight_g: 300, thickness_mm: 4, stretchMethod: "Toss & stretch (lancio in aria)", restAfterBall_min: 120 },
  { styleId: "detroit", ballWeight_g: 500, panSize_cm: 25, panShape: "rectangular", thickness_mm: 20, stretchMethod: "Stesura in teglia blue steel oliata", restAfterBall_min: 0 },
  { styleId: "chicago_deep", ballWeight_g: 450, panSize_cm: 25, panShape: "round", thickness_mm: 30, stretchMethod: "Pressatura in teglia profonda imburrata", restAfterBall_min: 0 },
  { styleId: "grandma_style", ballWeight_g: 600, panSize_cm: 35, panShape: "rectangular", thickness_mm: 12, stretchMethod: "Stesura in teglia con olio", restAfterBall_min: 0 },
  { styleId: "bonci_teglia", ballWeight_g: 700, panSize_cm: 40, panShape: "rectangular", thickness_mm: 18, stretchMethod: "Stesura delicata in teglia (3+ stesure con riposi)", restAfterBall_min: 0 },
  { styleId: "focaccia_genovese", ballWeight_g: 600, panSize_cm: 30, panShape: "round", thickness_mm: 20, stretchMethod: "Stesura con dita (fossette)", restAfterBall_min: 30 },
  { styleId: "sfincione", ballWeight_g: 500, panSize_cm: 30, panShape: "rectangular", thickness_mm: 20, stretchMethod: "Stesura in teglia oliata", restAfterBall_min: 30 },
  { styleId: "focaccia_recco", ballWeight_g: 300, panSize_cm: 35, panShape: "round", thickness_mm: 1, stretchMethod: "Sfoglia sottilissima tirata a mano (2 dischi)", restAfterBall_min: 30 },
  { styleId: "padellino_torino", ballWeight_g: 200, panSize_cm: 18, panShape: "round", thickness_mm: 15, stretchMethod: "Stesura nel tegamino individuale", restAfterBall_min: 60 },
];

/* ═══ 4. PARAMETRI SALE PER STILE ═══ */
export interface SaltParams {
  styleId: string;
  saltPct: number;
  saltType: string;
  additionTiming: string;
  note: string;
}

const SALT_DB: SaltParams[] = [
  { styleId: "napoletana_stg", saltPct: 3.0, saltType: "Marino fino", additionTiming: "Dopo farina+acqua (5 min mixing)", note: "AVPN: 3% su farina. Aggiungere dopo idratazione iniziale." },
  { styleId: "napoletana_canotto", saltPct: 2.8, saltType: "Marino fino", additionTiming: "Dopo farina+acqua", note: "Leggermente meno per non frenare la lievitazione del canotto." },
  { styleId: "teglia_romana", saltPct: 2.5, saltType: "Fino", additionTiming: "Con farina", note: "Sale standard. Puoi aggiungerlo all'inizio senza problemi." },
  { styleId: "tonda_romana", saltPct: 2.5, saltType: "Fino", additionTiming: "Con farina", note: "Standard romano." },
  { styleId: "pinsa_romana", saltPct: 2.5, saltType: "Fino", additionTiming: "Dopo idratazione", note: "Mix di farine richiede sale dopo per assorbimento corretto." },
  { styleId: "pala_romana", saltPct: 2.5, saltType: "Fino", additionTiming: "Dopo farina+acqua", note: "Standard." },
  { styleId: "new_york", saltPct: 2.0, saltType: "Kosher/Fino", additionTiming: "Con farina", note: "Tradizione americana: sale meno dominante." },
  { styleId: "detroit", saltPct: 2.0, saltType: "Kosher", additionTiming: "Con farina", note: "Sale ridotto perché il formaggio ai bordi aggiunge sapidità." },
  { styleId: "chicago_deep", saltPct: 1.5, saltType: "Fino", additionTiming: "Con farina", note: "Poco sale nell'impasto: il ripieno è già molto saporito." },
  { styleId: "grandma_style", saltPct: 2.0, saltType: "Fino", additionTiming: "Con farina", note: "Standard americano." },
  { styleId: "bonci_teglia", saltPct: 2.5, saltType: "Fino", additionTiming: "Dopo idratazione", note: "Aggiungere dopo per controllare assorbimento in alta idratazione." },
  { styleId: "focaccia_genovese", saltPct: 2.0, saltType: "Grosso + fino", additionTiming: "Fino nell'impasto + grosso in superficie", note: "Sale grosso in salamoia superficiale (acqua+olio+sale)." },
  { styleId: "sfincione", saltPct: 2.5, saltType: "Fino", additionTiming: "Con farina", note: "Standard siciliano." },
  { styleId: "focaccia_recco", saltPct: 2.0, saltType: "Fino", additionTiming: "Con farina", note: "Sale ridotto: lo stracchino è già salato." },
  { styleId: "padellino_torino", saltPct: 2.5, saltType: "Fino", additionTiming: "Con farina", note: "Standard piemontese." },
];

/* ═══ 5. PARAMETRI ACQUA ═══ */
export interface WaterParams {
  styleId: string;
  idealTempC: number;
  minTempC: number;
  maxTempC: number;
  phIdeal: number;
  hardnessNote: string;
}

const WATER_DB: WaterParams[] = [
  { styleId: "napoletana_stg", idealTempC: 18, minTempC: 14, maxTempC: 22, phIdeal: 7.0, hardnessNote: "Media durezza (150-250 ppm). Napoli: acqua del Serino ideale." },
  { styleId: "napoletana_canotto", idealTempC: 16, minTempC: 12, maxTempC: 20, phIdeal: 7.0, hardnessNote: "Acqua fredda per impasti ad alta idratazione." },
  { styleId: "teglia_romana", idealTempC: 16, minTempC: 12, maxTempC: 20, phIdeal: 7.0, hardnessNote: "Acqua fredda: impasto idratato scalda durante mixing." },
  { styleId: "tonda_romana", idealTempC: 18, minTempC: 14, maxTempC: 22, phIdeal: 7.0, hardnessNote: "Temperatura standard. Impasto a bassa idratazione." },
  { styleId: "pinsa_romana", idealTempC: 14, minTempC: 10, maxTempC: 18, phIdeal: 7.0, hardnessNote: "Acqua fredda per controllare impasto ad alta idratazione." },
  { styleId: "pala_romana", idealTempC: 16, minTempC: 12, maxTempC: 20, phIdeal: 7.0, hardnessNote: "Acqua fredda per idratazione medio-alta." },
  { styleId: "bonci_teglia", idealTempC: 14, minTempC: 10, maxTempC: 18, phIdeal: 7.0, hardnessNote: "Molto fredda per controllare fermentazione in alta idratazione." },
  { styleId: "new_york", idealTempC: 18, minTempC: 14, maxTempC: 22, phIdeal: 7.2, hardnessNote: "Acqua NYC: bassa durezza. Contribuisce alla texture unica." },
  { styleId: "detroit", idealTempC: 20, minTempC: 16, maxTempC: 24, phIdeal: 7.0, hardnessNote: "Temperatura ambiente OK." },
  { styleId: "chicago_deep", idealTempC: 20, minTempC: 16, maxTempC: 24, phIdeal: 7.0, hardnessNote: "Temperatura ambiente." },
  { styleId: "grandma_style", idealTempC: 20, minTempC: 16, maxTempC: 24, phIdeal: 7.0, hardnessNote: "Temperatura ambiente. Impasto semplice." },
  { styleId: "focaccia_genovese", idealTempC: 20, minTempC: 16, maxTempC: 24, phIdeal: 7.0, hardnessNote: "Temperatura ambiente. Parte dell'acqua nella salamoia." },
  { styleId: "sfincione", idealTempC: 20, minTempC: 16, maxTempC: 24, phIdeal: 7.0, hardnessNote: "Temperatura ambiente." },
  { styleId: "focaccia_recco", idealTempC: 18, minTempC: 14, maxTempC: 22, phIdeal: 7.0, hardnessNote: "Temperatura standard per sfoglia sottile." },
  { styleId: "padellino_torino", idealTempC: 18, minTempC: 14, maxTempC: 22, phIdeal: 7.0, hardnessNote: "Temperatura standard." },
];

/* ═══ 6. PARAMETRI MATURAZIONE ═══ */
export interface MaturationParams {
  styleId: string;
  bulkHours: [number, number];
  bulkTempC: number;
  ballHours: [number, number];
  ballTempC: number;
  totalHoursMin: number;
  totalHoursMax: number;
  method: "diretto" | "indiretto_biga" | "indiretto_poolish" | "autolisi_diretto";
  note: string;
}

const MATURATION_DB: MaturationParams[] = [
  { styleId: "napoletana_stg", bulkHours: [0.5, 2], bulkTempC: 22, ballHours: [4, 8], ballTempC: 22, totalHoursMin: 6, totalHoursMax: 24, method: "diretto", note: "AVPN: 6-24h a temp ambiente. No frigo per STG classica." },
  { styleId: "napoletana_canotto", bulkHours: [1, 4], bulkTempC: 22, ballHours: [12, 24], ballTempC: 4, totalHoursMin: 18, totalHoursMax: 72, method: "diretto", note: "Lunga maturazione a freddo per alveolatura canotto." },
  { styleId: "teglia_romana", bulkHours: [12, 24], bulkTempC: 4, ballHours: [2, 4], ballTempC: 22, totalHoursMin: 24, totalHoursMax: 72, method: "diretto", note: "Bulk lungo a freddo, poi stesura in teglia e lievitazione finale." },
  { styleId: "bonci_teglia", bulkHours: [18, 36], bulkTempC: 4, ballHours: [2, 6], ballTempC: 22, totalHoursMin: 24, totalHoursMax: 72, method: "autolisi_diretto", note: "Metodo Bonci: autolisi 1h, bulk lungo a freddo, pieghe ogni 8h." },
  { styleId: "new_york", bulkHours: [1, 2], bulkTempC: 22, ballHours: [24, 72], ballTempC: 4, totalHoursMin: 24, totalHoursMax: 72, method: "diretto", note: "Cold ferment 24-72h per sapore complesso." },
  { styleId: "detroit", bulkHours: [1, 2], bulkTempC: 22, ballHours: [24, 48], ballTempC: 4, totalHoursMin: 24, totalHoursMax: 48, method: "diretto", note: "24-48h a freddo. Stesura in teglia il giorno dopo." },
  { styleId: "chicago_deep", bulkHours: [0.5, 1], bulkTempC: 22, ballHours: [24, 48], ballTempC: 4, totalHoursMin: 24, totalHoursMax: 48, method: "diretto", note: "Impasto con burro — non serve maturazione eccessiva." },
  { styleId: "focaccia_genovese", bulkHours: [1, 3], bulkTempC: 22, ballHours: [2, 4], ballTempC: 22, totalHoursMin: 4, totalHoursMax: 24, method: "diretto", note: "Lievitazione diretta, lievitazione finale in teglia con fossette." },
  { styleId: "tonda_romana", bulkHours: [0.5, 2], bulkTempC: 22, ballHours: [4, 12], ballTempC: 22, totalHoursMin: 6, totalHoursMax: 24, method: "diretto", note: "Maturazione breve, impasto a bassa idratazione. Temp ambiente." },
  { styleId: "pinsa_romana", bulkHours: [12, 24], bulkTempC: 4, ballHours: [4, 8], ballTempC: 22, totalHoursMin: 24, totalHoursMax: 72, method: "diretto", note: "Maturazione lunga a freddo per mix di farine (grano, soia, riso)." },
  { styleId: "pala_romana", bulkHours: [12, 24], bulkTempC: 4, ballHours: [2, 6], ballTempC: 22, totalHoursMin: 18, totalHoursMax: 72, method: "diretto", note: "Bulk a freddo, poi stesura su pala e lievitazione finale." },
  { styleId: "grandma_style", bulkHours: [1, 2], bulkTempC: 22, ballHours: [2, 6], ballTempC: 22, totalHoursMin: 4, totalHoursMax: 24, method: "diretto", note: "Semplice lievitazione diretta in teglia oliata." },
  { styleId: "sfincione", bulkHours: [1, 3], bulkTempC: 22, ballHours: [2, 6], ballTempC: 22, totalHoursMin: 4, totalHoursMax: 24, method: "diretto", note: "Lievitazione diretta. Tradizione palermitana." },
  { styleId: "focaccia_recco", bulkHours: [0.5, 1], bulkTempC: 22, ballHours: [0.5, 2], ballTempC: 22, totalHoursMin: 1, totalHoursMax: 4, method: "diretto", note: "Sfoglia senza lievito — riposo breve per rilassare il glutine." },
  { styleId: "padellino_torino", bulkHours: [1, 3], bulkTempC: 22, ballHours: [4, 12], ballTempC: 22, totalHoursMin: 6, totalHoursMax: 24, method: "diretto", note: "Lievitazione nel tegamino individuale." },
];

/* ═══ 7. PARAMETRI CONDIMENTO PER STILE ═══ */
export interface ToppingParams {
  styleId: string;
  toppingOrder: string[];
  saucePosition: "sotto" | "sopra" | "integrata" | "nessuna";
  cheeseType: string;
  cheesePosition: "sotto_salsa" | "sopra_salsa" | "bordi" | "interno";
  note: string;
}

const TOPPING_DB: ToppingParams[] = [
  { styleId: "napoletana_stg", toppingOrder: ["salsa", "mozzarella", "basilico", "olio"], saucePosition: "sotto", cheeseType: "Mozzarella di bufala / Fior di latte", cheesePosition: "sopra_salsa", note: "AVPN: pomodoro San Marzano, mozzarella a pezzi, basilico fresco." },
  { styleId: "napoletana_canotto", toppingOrder: ["salsa", "mozzarella", "basilico", "olio"], saucePosition: "sotto", cheeseType: "Fior di latte / Bufala", cheesePosition: "sopra_salsa", note: "Come STG ma formaggio meno abbondante per non schiacciare il cornicione." },
  { styleId: "teglia_romana", toppingOrder: ["olio", "salsa", "condimento"], saucePosition: "sotto", cheeseType: "Mozzarella a cubetti", cheesePosition: "sopra_salsa", note: "Condire dopo prima cottura (metodo in bianco + condimento)." },
  { styleId: "tonda_romana", toppingOrder: ["salsa", "mozzarella", "condimento"], saucePosition: "sotto", cheeseType: "Mozzarella a cubetti / grattugiata", cheesePosition: "sopra_salsa", note: "Condimento leggero — pizza sottile non regge troppo peso." },
  { styleId: "pinsa_romana", toppingOrder: ["salsa", "mozzarella", "condimento"], saucePosition: "sotto", cheeseType: "Fior di latte a dadini", cheesePosition: "sopra_salsa", note: "Forma ovale, condimento leggero. Base alveolata non va sovraccaricata." },
  { styleId: "pala_romana", toppingOrder: ["salsa", "mozzarella", "condimento"], saucePosition: "sotto", cheeseType: "Fior di latte / Mozzarella filata", cheesePosition: "sopra_salsa", note: "Condimento pre-cottura o post, a seconda della pezzatura." },
  { styleId: "new_york", toppingOrder: ["salsa", "mozzarella_grattugiata"], saucePosition: "sotto", cheeseType: "Low-moisture mozzarella grattugiata", cheesePosition: "sopra_salsa", note: "Mozzarella grattugiata, non a pezzi. Bordo visibile." },
  { styleId: "detroit", toppingOrder: ["formaggio_bordi", "pepperoni", "salsa_strisce"], saucePosition: "sopra", cheeseType: "Brick cheese / Wisconsin", cheesePosition: "bordi", note: "Formaggio fino ai bordi per caramellizzazione. Salsa a strisce sopra." },
  { styleId: "chicago_deep", toppingOrder: ["mozzarella", "ripieno", "salsa_sopra"], saucePosition: "sopra", cheeseType: "Mozzarella a fette", cheesePosition: "sotto_salsa", note: "Ordine invertito: formaggio, ripieno (salsiccia), salsa sopra." },
  { styleId: "grandma_style", toppingOrder: ["olio", "mozzarella", "salsa_sopra"], saucePosition: "sopra", cheeseType: "Low-moisture mozzarella a dadini", cheesePosition: "sotto_salsa", note: "Tradizione italo-americana: formaggio sotto, salsa a cucchiaiate sopra." },
  { styleId: "bonci_teglia", toppingOrder: ["olio", "condimento_post_cottura"], saucePosition: "sotto", cheeseType: "Vario (post-cottura)", cheesePosition: "sopra_salsa", note: "Metodo Bonci: prima cottura in bianco (solo olio), condimento dopo. Stile 'al taglio'." },
  { styleId: "focaccia_genovese", toppingOrder: ["salamoia", "olio"], saucePosition: "nessuna", cheeseType: "Nessuno", cheesePosition: "sopra_salsa", note: "Solo salamoia (acqua+sale+olio) nella fossette. Variante: cipolle." },
  { styleId: "sfincione", toppingOrder: ["cipolla_cotta", "salsa", "caciocavallo", "pangrattato", "olio"], saucePosition: "integrata", cheeseType: "Caciocavallo grattugiato", cheesePosition: "sopra_salsa", note: "Tradizione: sugo cipolla + acciughe + caciocavallo + pangrattato tostato." },
  { styleId: "focaccia_recco", toppingOrder: ["stracchino_interno"], saucePosition: "nessuna", cheeseType: "Stracchino/Crescenza", cheesePosition: "interno", note: "Formaggio tra due sfoglie sottilissime. Solo stracchino, nient'altro." },
  { styleId: "padellino_torino", toppingOrder: ["salsa", "mozzarella", "condimento"], saucePosition: "sotto", cheeseType: "Mozzarella Fior di latte", cheesePosition: "sopra_salsa", note: "Come napoletana classica ma nel tegamino. Bordo alto soffice raccoglie condimento." },
];

/* ═══ 8. PIEGHE E MANIPOLAZIONE ═══ */
export interface FoldingParams {
  styleId: string;
  foldType: "stretch_fold" | "coil_fold" | "french_fold" | "slap_fold" | "none";
  foldCount: number;
  foldInterval_min: number;
  note: string;
}

const FOLDING_DB: FoldingParams[] = [
  { styleId: "napoletana_stg", foldType: "none", foldCount: 0, foldInterval_min: 0, note: "Impasto a bassa idratazione — mixing standard sufficiente, no pieghe." },
  { styleId: "napoletana_canotto", foldType: "stretch_fold", foldCount: 2, foldInterval_min: 30, note: "2 pieghe durante bulk per sviluppare struttura canotto." },
  { styleId: "teglia_romana", foldType: "stretch_fold", foldCount: 3, foldInterval_min: 45, note: "3 pieghe durante bulk lungo. Sviluppo glutine senza mixing intensivo." },
  { styleId: "bonci_teglia", foldType: "coil_fold", foldCount: 4, foldInterval_min: 60, note: "Metodo Bonci: coil fold ogni ora per le prime 4h, poi frigo." },
  { styleId: "new_york", foldType: "none", foldCount: 0, foldInterval_min: 0, note: "Mixing standard con planetaria. Finestra del glutine visibile." },
  { styleId: "detroit", foldType: "stretch_fold", foldCount: 2, foldInterval_min: 30, note: "2 pieghe leggere prima di stendere in teglia." },
  { styleId: "chicago_deep", foldType: "french_fold", foldCount: 1, foldInterval_min: 0, note: "1 french fold per incorporare il burro. Sfogliatura leggera." },
  { styleId: "focaccia_genovese", foldType: "stretch_fold", foldCount: 2, foldInterval_min: 30, note: "2 pieghe delicate. L'olio rende l'impasto scivoloso." },
  { styleId: "tonda_romana", foldType: "none", foldCount: 0, foldInterval_min: 0, note: "Impasto a bassa idratazione, mixing standard." },
  { styleId: "pinsa_romana", foldType: "stretch_fold", foldCount: 3, foldInterval_min: 45, note: "3 pieghe per sviluppare glutine nel mix di farine." },
  { styleId: "pala_romana", foldType: "stretch_fold", foldCount: 2, foldInterval_min: 30, note: "2 pieghe durante bulk per struttura alveolata." },
  { styleId: "grandma_style", foldType: "none", foldCount: 0, foldInterval_min: 0, note: "Impasto semplice steso direttamente in teglia." },
  { styleId: "sfincione", foldType: "stretch_fold", foldCount: 1, foldInterval_min: 0, note: "1 piega leggera prima della stesura in teglia." },
  { styleId: "focaccia_recco", foldType: "none", foldCount: 0, foldInterval_min: 0, note: "Sfoglia senza lievito — no pieghe, solo riposo." },
  { styleId: "padellino_torino", foldType: "none", foldCount: 0, foldInterval_min: 0, note: "Impasto classico, no pieghe necessarie." },
];

/* ═══ 9. PARAMETRI SCORING (TAGLIO) ═══ */
export interface ScoringParams {
  styleId: string;
  scoringRequired: boolean;
  scoringType: string;
  scoringDepth_mm: number;
  scoringTiming: string;
  note: string;
}

const SCORING_DB: ScoringParams[] = [
  { styleId: "napoletana_stg", scoringRequired: false, scoringType: "nessuno", scoringDepth_mm: 0, scoringTiming: "", note: "Nessun taglio. La pizza napoletana non viene incisa." },
  { styleId: "napoletana_canotto", scoringRequired: false, scoringType: "nessuno", scoringDepth_mm: 0, scoringTiming: "", note: "Come STG: nessun taglio." },
  { styleId: "teglia_romana", scoringRequired: false, scoringType: "nessuno", scoringDepth_mm: 0, scoringTiming: "", note: "Nessun taglio prima della cottura." },
  { styleId: "tonda_romana", scoringRequired: false, scoringType: "nessuno", scoringDepth_mm: 0, scoringTiming: "", note: "Nessun taglio." },
  { styleId: "pinsa_romana", scoringRequired: false, scoringType: "nessuno", scoringDepth_mm: 0, scoringTiming: "", note: "Forma irregolare, nessun taglio pre-cottura." },
  { styleId: "pala_romana", scoringRequired: false, scoringType: "nessuno", scoringDepth_mm: 0, scoringTiming: "", note: "Nessun taglio. Taglio porzioni dopo cottura." },
  { styleId: "new_york", scoringRequired: false, scoringType: "nessuno", scoringDepth_mm: 0, scoringTiming: "", note: "Taglio a spicchi dopo cottura con rotella." },
  { styleId: "detroit", scoringRequired: false, scoringType: "nessuno", scoringDepth_mm: 0, scoringTiming: "", note: "Nessun taglio pre-cottura. Porzioni quadrate dopo." },
  { styleId: "chicago_deep", scoringRequired: false, scoringType: "nessuno", scoringDepth_mm: 0, scoringTiming: "", note: "Nessun taglio pre-cottura. Taglio a spicchi dopo." },
  { styleId: "grandma_style", scoringRequired: false, scoringType: "nessuno", scoringDepth_mm: 0, scoringTiming: "", note: "Taglio a quadretti dopo cottura." },
  { styleId: "bonci_teglia", scoringRequired: false, scoringType: "taglio_porzioni", scoringDepth_mm: 0, scoringTiming: "Dopo cottura", note: "Taglio in porzioni rettangolari solo dopo la cottura. Forbici da cucina." },
  { styleId: "focaccia_genovese", scoringRequired: true, scoringType: "fossette", scoringDepth_mm: 10, scoringTiming: "Prima della salamoia", note: "Fossette profonde con le dita unte d'olio. Raccolgono olio e salamoia." },
  { styleId: "sfincione", scoringRequired: false, scoringType: "nessuno", scoringDepth_mm: 0, scoringTiming: "", note: "Nessun taglio. Taglio porzioni quadrate dopo cottura." },
  { styleId: "focaccia_recco", scoringRequired: true, scoringType: "fori", scoringDepth_mm: 0, scoringTiming: "Prima della cottura", note: "Piccoli fori nella sfoglia superiore per far uscire il vapore." },
  { styleId: "padellino_torino", scoringRequired: false, scoringType: "nessuno", scoringDepth_mm: 0, scoringTiming: "", note: "Nessun taglio. Servita intera nel tegamino." },
];

/* ═══ 10. COMPATIBILITA ATTREZZATURA ═══ */
export interface EquipmentCompat {
  styleId: string;
  mixerRequired: boolean;
  mixerType: "planetaria" | "spirale" | "manuale" | "qualsiasi";
  mixingTime_min: number;
  surfaceType: "pietra_refrattaria" | "acciaio" | "teglia" | "padella" | "pala";
  specialEquipment: string[];
  note: string;
}

const EQUIPMENT_DB: EquipmentCompat[] = [
  { styleId: "napoletana_stg", mixerRequired: false, mixerType: "manuale", mixingTime_min: 20, surfaceType: "pietra_refrattaria", specialEquipment: ["Forno a legna/gas >430°C", "Pala da forno", "Piano refrattario"], note: "Tradizione: impasto a mano. Planetaria accettabile ma non necessaria." },
  { styleId: "napoletana_canotto", mixerRequired: false, mixerType: "planetaria", mixingTime_min: 15, surfaceType: "pietra_refrattaria", specialEquipment: ["Forno elettrico >400°C", "Pietra/acciaio refrattario"], note: "Planetaria consigliata per alta idratazione." },
  { styleId: "teglia_romana", mixerRequired: true, mixerType: "planetaria", mixingTime_min: 25, surfaceType: "teglia", specialEquipment: ["Teglia alluminio/acciaio", "Pietra refrattaria (opzionale)"], note: "Alta idratazione richiede planetaria o spirale." },
  { styleId: "tonda_romana", mixerRequired: false, mixerType: "manuale", mixingTime_min: 15, surfaceType: "pietra_refrattaria", specialEquipment: ["Pietra refrattaria o acciaio", "Mattarello"], note: "Bassa idratazione, facile a mano. Mattarello per stesura sottile." },
  { styleId: "pinsa_romana", mixerRequired: true, mixerType: "planetaria", mixingTime_min: 20, surfaceType: "pietra_refrattaria", specialEquipment: ["Pietra refrattaria", "Pala da forno"], note: "Mix di farine ad alta idratazione — planetaria necessaria." },
  { styleId: "pala_romana", mixerRequired: true, mixerType: "planetaria", mixingTime_min: 18, surfaceType: "pala", specialEquipment: ["Pala da forno", "Pietra refrattaria"], note: "Impasto ad alta idratazione, cottura su pala." },
  { styleId: "bonci_teglia", mixerRequired: true, mixerType: "planetaria", mixingTime_min: 20, surfaceType: "teglia", specialEquipment: ["Teglia alluminio blu", "Spatola da pasticceria"], note: "Impasto >85% idratazione — impossibile a mano." },
  { styleId: "new_york", mixerRequired: false, mixerType: "qualsiasi", mixingTime_min: 12, surfaceType: "acciaio", specialEquipment: ["Baking steel o pietra", "Pala da forno"], note: "Funziona anche a mano. Baking steel migliora il fondo." },
  { styleId: "detroit", mixerRequired: false, mixerType: "qualsiasi", mixingTime_min: 10, surfaceType: "teglia", specialEquipment: ["Teglia blue steel Detroit-style", "Brick cheese"], note: "Teglia speciale con bordi alti. Blue steel per caramellizzazione." },
  { styleId: "chicago_deep", mixerRequired: false, mixerType: "qualsiasi", mixingTime_min: 8, surfaceType: "teglia", specialEquipment: ["Teglia profonda rotonda (deep dish pan)", "Burro abbondante"], note: "Teglia profonda 5-7 cm. Impasto bassa idratazione — facile a mano." },
  { styleId: "grandma_style", mixerRequired: false, mixerType: "qualsiasi", mixingTime_min: 10, surfaceType: "teglia", specialEquipment: ["Teglia rettangolare", "Olio abbondante"], note: "Semplice, funziona a mano. Teglia oliata generosamente." },
  { styleId: "focaccia_genovese", mixerRequired: false, mixerType: "qualsiasi", mixingTime_min: 10, surfaceType: "teglia", specialEquipment: ["Teglia rotonda bassa", "Olio EVO ligure"], note: "Semplice, funziona a mano. Olio abbondante è l'ingrediente chiave." },
  { styleId: "sfincione", mixerRequired: false, mixerType: "qualsiasi", mixingTime_min: 12, surfaceType: "teglia", specialEquipment: ["Teglia rettangolare", "Pangrattato"], note: "Impasto semplice, funziona a mano." },
  { styleId: "focaccia_recco", mixerRequired: false, mixerType: "manuale", mixingTime_min: 15, surfaceType: "teglia", specialEquipment: ["Teglia rotonda larga", "Mattarello sottile"], note: "Sfoglia a mano, serve pratica per la sottigliezza." },
  { styleId: "padellino_torino", mixerRequired: false, mixerType: "qualsiasi", mixingTime_min: 10, surfaceType: "padella", specialEquipment: ["Tegamino individuale 18cm", "Forno domestico"], note: "Tegamino specifico, impasto semplice." },
];

/* ═══ LOOKUP HELPERS ═══ */

export function getOvenTempByStyle(styleId: string): OvenTempParams | undefined {
  return OVEN_TEMPS_DB.find((p) => p.styleId === styleId);
}

export function getBakingTimeByStyle(styleId: string): BakingTimeParams | undefined {
  return BAKING_TIMES_DB.find((p) => p.styleId === styleId);
}

export function getDoughBaseByStyle(styleId: string): DoughBaseParams | undefined {
  return DOUGH_BASE_DB.find((p) => p.styleId === styleId);
}

export function getSaltByStyle(styleId: string): SaltParams | undefined {
  return SALT_DB.find((p) => p.styleId === styleId);
}

export function getWaterByStyle(styleId: string): WaterParams | undefined {
  return WATER_DB.find((p) => p.styleId === styleId);
}

export function getMaturationByStyle(styleId: string): MaturationParams | undefined {
  return MATURATION_DB.find((p) => p.styleId === styleId);
}

export function getToppingByStyle(styleId: string): ToppingParams | undefined {
  return TOPPING_DB.find((p) => p.styleId === styleId);
}

export function getFoldingByStyle(styleId: string): FoldingParams | undefined {
  return FOLDING_DB.find((p) => p.styleId === styleId);
}

export function getScoringByStyle(styleId: string): ScoringParams | undefined {
  return SCORING_DB.find((p) => p.styleId === styleId);
}

export function getEquipmentByStyle(styleId: string): EquipmentCompat | undefined {
  return EQUIPMENT_DB.find((p) => p.styleId === styleId);
}

/** Get all parametric data for a style in one call */
export function getStyleParametrics(styleId: string) {
  return {
    ovenTemp: getOvenTempByStyle(styleId),
    bakingTime: getBakingTimeByStyle(styleId),
    doughBase: getDoughBaseByStyle(styleId),
    salt: getSaltByStyle(styleId),
    water: getWaterByStyle(styleId),
    maturation: getMaturationByStyle(styleId),
    topping: getToppingByStyle(styleId),
    folding: getFoldingByStyle(styleId),
    scoring: getScoringByStyle(styleId),
    equipment: getEquipmentByStyle(styleId),
  };
}