Le card sono i container principali per raggruppare contenuti. 3 varianti: Flat (base), Elevated (con ombra), Filled (sfondo denso). La Media Card aggiunge un'immagine hero con badge overlay.

**Principi**
- Radius: rounded-2xl (1rem) per tutte le varianti
- Border: 1px solid outline-variant — sempre presente, anche su Elevated
- Hover: whileHover con y: -2 e shadow upgrade via spring

**Fai**
- Sempre border 1px outline-variant — anche su Elevated con ombra
- Hover con spring (stiffness: 400, damping: 25) per y: -2
- Media Card: immagine con aspect-ratio 16/9 e object-fit cover

**Non fare**
- Mai box-shadow senza border — l'ombra da sola non basta in dark mode
- Mai card senza padding — minimo p-4
- Mai nesting card dentro card — usare section dividers
