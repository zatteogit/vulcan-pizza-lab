I bottoni di Vulcan seguono 4 varianti gerarchiche: Primary (CTA verde sage), Secondary (surface), Ghost (trasparente) e Destructive (rosso). Feedback tattile con active:scale-95.

**Principi**
- Primary per l'azione principale di ogni schermata — mai più di un Primary visibile
- active:scale-95 per feedback tattile immediato su tutti i bottoni
- Hover con CSS transition (non motion) per performance

**Fai**
- Un solo Primary visibile per schermata — gerarchia chiara
- active:scale-95 su tutti i bottoni per feedback tattile
- Hover con CSS transition per performance — non motion.button per hover

**Non fare**
- Mai due bottoni Primary affiancati — usare Primary + Secondary
- Mai rimuovere il feedback tattile (scale) per 'pulizia'
- Mai usare whileHover di motion per i bottoni — solo CSS transition
