Il StepHeader è il titolone editoriale che segna ogni macro-sezione del flusso. Composto da: step number (DM Sans uppercase, classe type-step-num), titolo principale (Playfair Display), sottotitolo (Playfair italic), e linea decorativa.

**Principi**
- Ingresso animato con whileInView (once: true, amount: 0.5)
- Step number: DM Sans (type-step-num), terracotta, tracking 0.18em — comunica progressione
- Titolo: Playfair Display con clamp() responsive

**Fai**
- Usare whileInView con once: true per l'animazione d'ingresso
- Step number sempre con DM Sans uppercase (type-step-num) e tracking-extreme
- Titolo con clamp() per responsive naturale senza breakpoint

**Non fare**
- Mai più di 3 StepHeader in una pagina — il flusso ha 3 sezioni
- Mai omettere la linea decorativa — è la firma visiva del pattern
- Mai usare DM Sans per il titolo — Playfair Display è obbligatorio
