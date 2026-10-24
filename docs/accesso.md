# Accesso e ruoli (D-046, D-047)

## Come funziona

- **Accedi con Google**: Google conferma l'email. Il Worker verifica il
  token (firma, emittente, destinatario, scadenza, email verificata) e apre
  una sessione di 30 giorni in un cookie `HttpOnly`, `Secure`, `SameSite=Lax`.
- **Ruoli**: `admin`, `editor` e `tester` si assegnano per email; `user` vale
  per tutti gli altri; `demo` per chi prova senza account. Il ruolo si
  ricalcola a ogni accesso: per revocarlo basta togliere un'impronta dalla
  configurazione.
- **Demo** (D-047): sessione di 4 ore senza account. Si usa tutta l'app; alla
  chiusura i dati locali tornano com'erano prima della demo.
- **Privacy**: il repository è pubblico, quindi le email dei ruoli non ci
  sono in chiaro. `wrangler.toml` contiene solo l'impronta SHA-256 dell'email
  normalizzata (minuscole, senza spazi). In D1 finiscono id del provider,
  email, nome, ruolo e l'impronta dei token di sessione, mai il token.

Oggi l'unico admin è l'email di Matteo (registrata solo come impronta). Le
passkey arrivano dopo, come modo rapido per rientrare in un account già
verificato: da sole non provano l'email, quindi non possono assegnare un ruolo.

## Da fare una volta (Matteo)

1. **Client ID di Google** (gratuito): Google Cloud Console → «API e
   servizi» → «Credenziali» → «Crea credenziali» → «ID client OAuth» → tipo
   «Applicazione web». In «Origini JavaScript autorizzate» aggiungere:
   - `https://vulcan-pizza-lab.zatteo.workers.dev`
   - l'indirizzo di vulcan-test, se attivo
   - `http://localhost:8799` (sviluppo con `wrangler dev`)

   Lo schermo di consenso va configurato come «Esterno», con i soli ambiti
   `openid`, `email` e `profile`.
2. Incollare il Client ID in `wrangler.toml`, nella variabile
   `GOOGLE_CLIENT_ID`, sia in `[vars]` sia in `[env.test.vars]`. Non è un
   segreto: lo vede ogni browser.
3. **Tabelle su D1**: non serve nulla, il Worker crea `users` e `sessions`
   alla prima richiesta di accesso. Lo stesso schema è in `schema.sql`.
4. **Altri ruoli**: calcolare l'impronta di un'email con
   `printf '%s' "nome@esempio.it" | sha256sum`, poi aggiungerla (separata da
   virgole) a `ADMIN_EMAIL_SHA256`, `EDITOR_EMAIL_SHA256` o
   `TESTER_EMAIL_SHA256`.

## Rotte

| Rotta | Cosa fa |
|---|---|
| `GET /api/auth/config` | dice quali accessi sono attivi |
| `POST /api/auth/google` | riceve `{ credential }` e apre una sessione |
| `POST /api/auth/demo` | apre una sessione demo |
| `GET /api/auth/me` | restituisce la sessione corrente, oppure 401 |
| `POST /api/auth/logout` | chiude la sessione |

## Dove sta il codice

- `src/server/auth/`: verifica del token, ruoli e rotte (testato)
- `worker/index.ts`: archivio su D1
- `src/app/adapters/browser/auth-client.ts`: client nel browser
- `src/app/features/account/`: pannello Account nel profilo
