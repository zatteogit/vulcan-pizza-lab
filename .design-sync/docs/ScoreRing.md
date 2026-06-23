Lo ScoreRing è un anello SVG animato che visualizza un punteggio 0–100. L'animazione strokeDashoffset parte con whileInView. Usato nei 5 assi del composite score e nelle card stile.

**Principi**
- Animazione: strokeDashoffset con ease emphasized [0.16, 1, 0.3, 1]
- Hover: scale 1.08 via spring — feedback interattivo
- Colore dinamico per tier: cta (≥80), tertiary (≥60), sienna (≥40), destructive (<40)

**Fai**
- Usare whileInView per triggerare l'animazione al primo scroll
- Colore semantico per tier: cta ≥80, tertiary ≥60, sienna ≥40, destructive <40
- Hover scale 1.08 per feedback — l'utente capisce che è interattivo

**Non fare**
- Mai animare il ring senza once: true — evitare ri-animazioni
- Mai usare più di 5 ring in una riga — wrappare con flex-wrap
- Mai rimuovere la label sotto il ring — il numero da solo non comunica il contesto
