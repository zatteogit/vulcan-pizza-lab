# Linee guida editoriali per stile (C-1)

Data: 24/10/2026. Questo documento è la fonte di verità per i contenuti di
ogni stile: parametri, condimenti, testi, foto. Le voci C-2 (condimenti
regionali) e ogni nuovo stile partono da qui. Le regole che una macchina può
controllare stanno in `src/app/data/style-editorial.test.ts` (in `npm run verify`).

## 1. Regole

1. **Ogni dato ha una fonte**, registrata in `docs/fonti-dati.md` con uno dei
   quattro stati (verificato, plausibile, da verificare, errato). Un commento
   nel codice non è una fonte.
2. **Il disciplinare viene prima.** Se lo stile ha un testo di regole (STG,
   AVPN, IGP, disciplinare di associazione), i parametri canonici sono quelli;
   le varianti diventano «versioni» o «ispirazioni», non lo stile.
3. **Il condimento predefinito è quello tipico dello stile**, con una fonte che
   lo leghi allo stile. Deve portare a una ricetta assegnata allo stile
   (controllato dal test). Un condimento «di scuola» (margherita, diavola) va
   bene solo se è davvero il classico di quello stile, nella sua variante.
4. **Ogni stile ha i suoi condimenti.** Niente cataloghi copiati da uno stile
   vicino: una ricetta compare in uno stile solo se è assegnata a quello
   stile (`preferred_for_styles`), con dosi e passi adatti al formato.
5. **Etichette d'autenticità oneste.** «Da disciplinare» (`canonical`) solo se
   il disciplinare la prevede *per quello stile*. «Specialità» (`signature`)
   per le firme moderne, sempre col nome del locale o della persona e una fonte.
6. **Persone e locali (C-5).** Ricostruzioni da fonti pubbliche, mai la ricetta
   di qualcuno: «Ispirata a…» nel nome (D-027).
7. **Confini con gli stili vicini.** Ogni scheda dice che cosa lo stile *non*
   è (es. baciata ≠ spaccata, sfincione bianco di Bagheria ≠ sfincione in
   bianco), perché è lì che nascono gli errori.
8. **Testi nel CMS in 7 lingue**, con `{brand}` al posto del nome del prodotto.
   Descrizione e caratteristiche dello stile sono obbligatorie (test di parità).
9. **Foto vera dello stile giusto** (U-9): niente foto visibilmente generate,
   niente foto di un altro stile.
10. **Tono**: fatti e numeri con la loro fonte; niente superlativi, classifiche
    o «il migliore» senza una fonte con data.

## 2. Scheda di uno stile (modello)

```md
### <Nome> (`<id>`)
- Famiglia · origine (luogo, epoca) · fonte dell'origine
- Testo di regole: <disciplinare / nessuno> — link
- Parametri canonici: W, P/L, idratazione, sale, grassi, lievitazione
  (ore e temperatura), panetto, misure, forno (tipo, temperatura, tempo).
  Per ognuno: valore · fonte · stato.
- Condimento predefinito: <ricetta> · perché è il classico · fonte
- Condimenti dello stile: tradizionali / specialità / alternative, con fonte
- Che cosa non è: <stili vicini e differenze>
- Versioni e ispirazioni collegate
- Foto: file · stato (vera, da verificare, da sostituire)
- Testi CMS: descrizione e caratteristiche ✓ in 7 lingue
- Aperti: <dati senza fonte, domande per Matteo>
```

Le schede compilate vivono nel registro delle fonti (`docs/fonti-dati.md` §1)
per gli stili già verificati (napoletana STG, pinsa, Recco, fritte); per gli
altri si compilano quando si lavora sullo stile.

## 3. Stato degli stili (24/10/2026)

«Parametri» riassume `docs/fonti-dati.md`: **con fonte** se c'è un testo di
regole o una fonte scritta verificata, **senza fonte** se oggi i valori vengono
solo dal codice. Il numero di condimenti è quello mostrato nella scheda.

| Stile | Parametri | Condimento predefinito | Condimenti | Note per C-2 |
|---|---|---|---|---|
| `napoletana_stg` | con fonte (STG, AVPN) | `margherita_napoletana_avpn` | 14 | — |
| `napoletana_canotto` | senza fonte | `margherita_napoletana_avpn` | 16 | Etichetta «Da disciplinare» tolta per questo stile (24/10) |
| `teglia_romana` | con fonte (APITER, D-029) | `margherita_romana` | 12 | Il classico al taglio è rossa/bianca: valutare |
| `tonda_romana` | con fonte (D-030) | `margherita_romana` | 11 | — |
| `pinsa_romana` | con fonte (OPR 2020) | `margherita_romana` | 9 | — |
| `pala_romana` | senza fonte | `bianca_mortazza_romana` | 12 | — |
| `pizza_baciata` | senza fonte | `bianca_mortazza_romana` | 2 | Predefinito corretto il 24/10 (prima non portava a nessuna ricetta) |
| `pizza_spaccata` | senza fonte | `bianca_mortazza_romana` | 3 | — |
| `new_york` | senza fonte | `margherita_new_york` | 6 | Il classico è la cheese pizza: valutare |
| `detroit` | senza fonte | `detroit_brick` | 5 | — |
| `chicago_deep` | senza fonte | `chicago_deep_classic` | 5 | — |
| `chicago_tavern` | senza fonte | `italian_sausage_tavern` | 4 | Salsiccia al finocchio a crudo, predefinita dal 24/10 (Wikipedia, «Tavern-style pizza») |
| `grandma_style` | senza fonte | `margherita_grandma` | 4 | — |
| `new_haven_apizza` | senza fonte | `white_clam_new_haven` | 2 | — |
| `california_style` | senza fonte | `smoked_salmon_california` (`signature`) | 4 | Predefinito corretto il 24/10; attribuzione della BBQ chicken corretta (Ed LaDou, California Pizza Kitchen 1985) |
| `greek_pan` | senza fonte | `greek_cheese_pan` | 3 | Predefinito corretto il 24/10 |
| `fugazzeta` | senza fonte | `fugazzeta_rellena` | 2 | — |
| `focaccia_genovese` | senza fonte | `focaccia_genovese_classica` | 4 | Olio, sale grosso e salamoia, predefinita dal 24/10 (Città dell'Olio 2016); sardenaira non più «Da disciplinare» qui |
| `focaccia_recco` | con fonte (IGP) | `crescenza_recco` | 5 | — |
| `focaccia_barese` | senza fonte | `focaccia_barese_classica` | 4 | — |
| `sfincione` | senza fonte | `sfincione_palermitano` | 2 | — |
| `padellino_torino` | senza fonte | `margherita_padellino` | 5 | — |
| `trancio_milanese` | senza fonte | `margherita_trancio` | 5 | — |
| `ciaccino_senese` | senza fonte | `ciaccino_senese_farcito` | 1 | — |
| `pizza_al_metro` | con fonte (D-028) | `margherita_napoletana_avpn` | 9 | Condimenti dal menù di Gigino, marinara con scarole; dosi ×3,7 |
| `pizza_fritta` | con fonte (AVPN) | `pizza_fritta_ripiena` | 1 | — |
| `pizza_fritta_tonda` | con fonte (AVPN) | `pizza_fritta_tonda_ripiena` | 1 | Manca una foto vera |
| `pizza_montanara` | con fonte (AVPN, parziale) | `montanara_classica` | 1 | — |
| `calzone_napoletano` | senza fonte | `calzone_napoletano_classico` | 3 | — |

## 4. Priorità per C-2

1. ~~**Etichette sbagliate**~~ fatto il 24/10: `authenticity_by_style` e test
   «Da disciplinare solo negli stili con un disciplinare».
2. ~~**Predefiniti non tipici**~~ fatto il 24/10: Chicago tavern (salsiccia),
   focaccia genovese (salamoia, senza rosmarino).
3. ~~**Pizza al metro**~~ fatto il 24/10 (D-028).
4. **Fonti dei parametri**: teglia, tonda (D-029, D-030) fatte; New York e
   Detroit solo gli errori evidenti (D-031), servono fonti di pizzeria.
