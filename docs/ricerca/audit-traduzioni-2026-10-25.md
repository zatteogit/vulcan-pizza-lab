# Verifica delle traduzioni degli aggiornamenti recenti

Ambito: aggiornamenti #61–#82, confrontando `63caee3` con `2c71471`.
Lingue: inglese, tedesco, spagnolo, francese, portoghese e giapponese; italiano come fonte.

## Cataloghi

Confronto delle foglie testuali dei cataloghi CMS, non soltanto dei tipi TypeScript:

| Gruppo | Voci nuove o modificate |
| --- | ---: |
| UI: dispensa, punteggio, Su misura, azioni, About | 73 |
| Primo uso | 4 |
| Preset forno, inclusi metadati | 2 |
| Esperienza | 4 |
| Esiti di fattibilità | 6 |
| Assi del punteggio | 9 |
| Messaggi del motore, condizioni e adattamenti | 55 |
| Deviazioni | 1 |
| Ricettario vuoto | 1 |
| Totale CMS | 155 |

Tutte le 155 voci risultano esplicite in ciascuna delle sei lingue; nessun segnaposto mancante o diverso. Il testo giapponese del livello intermedio era già equivalente al nuovo italiano e non richiedeva una riscrittura.

Le 17 nuove stringhe `recipe.reference.*` (STG) sono presenti nei sei cataloghi `uiMessage`, con le stesse chiavi e gli stessi segnaposto. Anche i controlli dell'intero catalogo UI e delle traduzioni degli ingredienti dei condimenti passano.

## Difetti trovati nell'uso dei testi

1. La dispensa completa mostrava i nomi sorgente italiani dei condimenti e quattro ingredienti dell'impasto invece delle etichette tradotte. Ora riusa le traduzioni del catalogo condimenti e le etichette UI; ordinamento e ricerca seguono i nomi visualizzati.
2. I messaggi `need.ingredient` e `need.excludedIngredient` traducevano la frase ma lasciavano il nome dell'ingrediente in italiano (o l'identificativo del lievito). Ora localizzano anche questi parametri.
3. Il confronto “Cosa cambia” usava `fat_label` del motore, in italiano. Ora sceglie l'etichetta UI tradotta di olio, burro o strutto.
4. La revisione degli snapshot delle lingue era ancora 5: un browser che aveva già scelto una lingua poteva conservare testi vecchi, nonostante i cataloghi aggiornati. La revisione 6 attiva il meccanismo esistente di aggiornamento al caricamento.

Gli identificativi salvati degli ingredienti non cambiano. Marchi e nomi personalizzati non vengono tradotti.

## Verifica

- Test su tutte le sei lingue: etichette, parametri nei messaggi, identità degli ingredienti e cambio di catalogo.
- Controllo aggiunto per presenza esplicita e segnaposto dei testi CMS di Crea, Scopri, dispensa, livelli ed esiti.
- Test degli snapshot precedenti e correnti per tutte le lingue.
- Browser: aggiornamento di una copia salvata alla revisione 5, apertura della dispensa, ingredienti e condimenti tradotti; selezione dell'acqua conservata cambiando lingua.
