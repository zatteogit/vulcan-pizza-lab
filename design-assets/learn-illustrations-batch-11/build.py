"""Build review plates; no generated scientific imagery and no application edits."""
from pathlib import Path
import base64, hashlib, json, math, re, shutil
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
ASSETS=HERE/'assets'
OUT=Path('/Users/matteo/dev/Vulcan/output/learn-illustration-batch-11-2026-11-01')
FACTS=json.loads((HERE/'engine-facts.json').read_text())
INK='#b66c48'; TERRA='#cd7047'; CREAM='#f9e7c5'; PALE='#edc9a5'
used={}
def bitmap(name,x,y,w,h):
    p=ROOT/'src/assets/learn'/f'{name}.webp'
    used[name]=hashlib.sha256(p.read_bytes()).hexdigest()
    data=base64.b64encode(p.read_bytes()).decode()
    return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:image/webp;base64,{data}"/>'
def plate(name,body):
    (ASSETS/f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="672" height="448" viewBox="0 0 672 448"><g stroke="{INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>')
def arrow(x1,y1,x2,y2):
    # Arrowheads follow direction, including oblique input paths.
    a=math.atan2(y2-y1,x2-x1); r=8
    p=[(x2-r*math.cos(a-.5),y2-r*math.sin(a-.5)),(x2,y2),(x2-r*math.cos(a+.5),y2-r*math.sin(a+.5))]
    return f'<path d="M{x1},{y1} L{x2},{y2} M{p[0][0]},{p[0][1]} L{x2},{y2} L{p[2][0]},{p[2][1]}" fill="none"/>'

# Conventional linearized Arrhenius plot, positive Ea; no observed values or ticks.
plt.rcParams.update({'svg.hashsalt':'vulcan-batch11','font.family':'DejaVu Sans'})
fig=plt.figure(figsize=(672/72,448/72),dpi=72)
ax=fig.add_axes([.15,.23,.72,.60])
ax.plot([.08,.92],[.9,.12],color=INK,linewidth=2.4,solid_capstyle='round')
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.set_xticks([]); ax.set_yticks([])
for side in ['top','right']: ax.spines[side].set_visible(False)
for side in ['bottom','left']:
    ax.spines[side].set_color(INK); ax.spines[side].set_linewidth(1.5)
ax.patch.set_alpha(0); fig.patch.set_alpha(0)
fig.savefig(ASSETS/'arrhenius.svg',transparent=True,metadata={'Date':None})
plt.close(fig)
arrhenius_path=ASSETS/'arrhenius.svg'
arrhenius_path.write_text('\n'.join(line.rstrip() for line in arrhenius_path.read_text().splitlines())+'\n')

# Nine symbolic residues, conserved in order through two hydrolysis events.
colors=[CREAM,PALE,TERRA,CREAM,PALE,TERRA,CREAM,PALE,TERRA]
body=''
for i in range(8): body+=f'<path d="M{96+i*60},116 H{156+i*60}" fill="none"/>'
for i,c in enumerate(colors): body+=f'<circle cx="{96+i*60}" cy="116" r="17" fill="{c}"/>'
body+=arrow(336,163,336,238)
positions=[72,122,172,222,310,360,410,460,574]
for i in range(8):
    if i not in [3,7]: body+=f'<path d="M{positions[i]},294 H{positions[i+1]}" fill="none"/>'
for x,c in zip(positions,colors): body+=f'<circle cx="{x}" cy="294" r="17" fill="{c}"/>'
plate('proteolysis',body)

# Axis diagrams: artwork is illustrative; bar lengths are engine criterion weights.
for name,axes,weights in [
 ('a_score',['manitoba-flour','bench-fold','home-oven'],FACTS['model']['authenticityWeights']),
 ('f_score',['home-oven','manitoba-flour','windowpane'],FACTS['model']['feasibilityWeights'])]:
    body=''
    for i,img in enumerate(axes): body+=bitmap(img,28+i*214,42,190,156)
    x=48
    for i,w in enumerate(weights.values()):
        body+=f'<rect x="{x}" y="292" width="{576*w}" height="32" fill="{[PALE,TERRA,CREAM][i]}"/>'
        x+=576*w
    plate(name,body)

# Input map: no fabricated D score or quantitative input contributions.
body=''
for x,y in [(40,32),(40,212),(235,32),(235,212)]:
    body+=f'<rect x="{x}" y="{y}" width="166" height="138" rx="16" fill="{CREAM}" fill-opacity=".3" stroke-opacity=".35"/>'
# Clock represents duration, no invented elapsed time.
body+=f'<circle cx="123" cy="89" r="31" fill="{CREAM}"/><path d="M123,68 V89 L141,99" fill="none"/>'
body+=bitmap('dough-temperature',45,218,154,98)
body+=bitmap('yeast',242,36,152,100)
body+=bitmap('biga',242,216,152,100)
body+=f'<rect x="22" y="14" width="395" height="356" rx="22" fill="none" stroke-dasharray="5 7" stroke-opacity=".6"/>'
body+=arrow(423,211,476,211)
body+=f'<rect x="484" y="170" width="132" height="82" rx="18" fill="{PALE}"/>'
body+=arrow(550,260,550,307)
body+=f'<rect x="474" y="318" width="152" height="65" rx="18" fill="{CREAM}"/>'
plate('d_score',body)

sources={
'arrhenius':[
 ['IUPAC · equazione di Arrhenius','https://goldbook.iupac.org/terms/view/A00446'],
 ['Purdue · costante di velocità ed energia di attivazione','https://chemed.chem.purdue.edu/genchem/topicreview/bp/ch22/activate.php']],
'proteolysis':[
 ['Gene Ontology · proteolisi','https://amigo.geneontology.org/amigo/term/GO%3A0006508?relation=regulates'],
 ['Thiele et al., 2004 · idrolisi del glutine in pasta acida','https://pubmed.ncbi.nlm.nih.gov/14995138/']],
'a_score':[['Vulcan · pesi e calcolo A-Score',f"https://github.com/zatteogit/vulcan-pizza-lab/blob/{FACTS['commit']}/src/app/domain/pizza-engine.ts#L1145"]],
'f_score':[['Vulcan · calcolo F-Score',f"https://github.com/zatteogit/vulcan-pizza-lab/blob/{FACTS['commit']}/src/app/domain/pizza-engine.ts#L1340"]],
'd_score':[['Vulcan · modello di maturazione',f"https://github.com/zatteogit/vulcan-pizza-lab/blob/{FACTS['commit']}/src/app/domain/pizza-engine.ts#L1440"]],
}
credits={
'manitoba-flour':['Molino Magri · farina Manitoba','https://www.molinomagri.com/it/prodotti/112-180-manitoba'],
'bench-fold':['King Arthur Baking · lavorazione di un impasto idratato','https://www.kingarthurbaking.com/blog/2017/06/19/kneading-wet-dough-by-hand'],
'home-oven':['King Arthur Baking · cottura nel forno domestico','https://www.kingarthurbaking.com/blog/2015/01/05/best-pizza-youll-ever-make'],
'windowpane':['King Arthur Baking · prova del velo','https://www.kingarthurbaking.com/blog/2022/10/14/what-is-the-windowpane-test-for-bread-dough'],
'dough-temperature':['King Arthur Baking · temperatura dell’impasto','https://www.kingarthurbaking.com/blog/2018/05/29/desired-dough-temperature'],
'yeast':['Liz Neily / Kristin Teig, King Arthur Baking · lievito fresco','https://www.kingarthurbaking.com/blog/2023/04/24/how-to-bake-with-fresh-yeast'],
'biga':['Rebecca Siegel · Biga, riferimento fotografico CC BY 2.0','https://www.flickr.com/photos/grongar/3683817769/'],
}
entries=[
 ('arrhenius','Arrhenius','Come varia una costante di velocità',
  'Forma linearizzata ideale: ln k = ln A − (Eₐ/R) · (1/T). Per Eₐ positivo e parametri costanti, la pendenza è negativa. T è la temperatura assoluta in kelvin.',
  'Schema teorico senza dati sperimentali o scale numeriche. Vulcan usa un modello Q₁₀ a tratti per la fermentazione: questa curva non rappresenta il suo calcolo.',[]),
 ('proteolysis','Proteolisi','Una catena, frammenti più corti',
  'La proteolisi rompe legami peptidici per idrolisi. Lo schema conserva tutti i nove elementi: una catena diventa due frammenti e un elemento libero.',
  'Elementi convenzionali, non atomi né una sequenza reale di glutine. Nell’impasto l’attività dipende da enzimi e condizioni: lo schema non misura la maturazione e non indica assenza di glutine.',[]),
 ('a_score','A-Score','Quanto ci avviciniamo al riferimento dello stile',
  'Ingredienti, processo e attrezzatura contribuiscono con i pesi indicati. Le lunghezze della barra rappresentano i pesi dei criteri, non un risultato di ricetta.',
  'Il motore applica anche regole e limiti legati a combustibile e adeguatezza termica. Questo è lo schema della ponderazione iniziale, non una certificazione di autenticità.', ['manitoba-flour','bench-fold','home-oven']),
 ('f_score','F-Score','Quanto è accessibile nella propria cucina',
  'Forno, farina ed esperienza contribuiscono con i pesi indicati. Il gesto della prova del velo richiama l’esperienza; non serve a misurarla.',
  'La barra mostra la ponderazione dei criteri, non un punteggio reale. Il verdetto di fattibilità viene valutato separatamente: un F-Score non garantisce che il piano sia fattibile.', ['home-oven','manitoba-flour','windowpane']),
 ('d_score','D-Score','Una stima della maturazione',
  'Tempo, temperatura, tipo e dose di lievito, presenza di un prefermento entrano nel modello di Vulcan. La biga è un esempio di prefermento, non l’unico.',
  'Vista sintetica per impasti lievitati, senza formula completa o pesi inventati. È una stima del modello, non una misura clinica della digeribilità personale né dei FODMAP.', ['dough-temperature','yeast','biga']),
]
# All educational copy remains selectable HTML, never baked into the artwork.
def label(text,x,y,cls=''):
    return f'<span class="label {cls}" style="left:{x}%;top:{y}%">{text}</span>'
labels={
'arrhenius':label('ln k',12,14)+label('1/T',88,81)+label('Eₐ > 0 · A costante',57,18,'small'),
'proteolysis':label('Catena proteica',50,13)+label('Idrolisi catalizzata<br>da proteasi',70,46,'small')+label('Frammenti più corti',50,80),
'd_score':label('Durata',18.3,34)+label('Temperatura',18.3,74)+label('Tipo e dose<br>di lievito',47.3,34,'small')+label('Prefermento',47.3,74)+label('Modello<br>Vulcan',81.8,47,'solid')+label('Indice<br>stimato',81.8,78,'solid'),
}
for key,names,wkey in [('a_score',['Ingredienti','Processo','Attrezzatura'],'authenticityWeights'),('f_score',['Forno','Farina','Esperienza'],'feasibilityWeights')]:
    weights=list(FACTS['model'][wkey].values())
    labels[key]=''.join(label(name,18.3+i*31.85,50) for i,name in enumerate(names))
    acc=48/672*100
    for w in weights:
        width=576*w/672*100
        labels[key]+=label(f'{round(w*100)}%',acc+width/2,69,'percent')
        acc+=width
    labels[key]+=label('Pesi dei criteri · prima delle ulteriori regole del motore',50,86,'small')

cards=[]
for key,title,sub,caption,limit,reused in entries:
    links=sources[key]+[credits[a] for a in reused]
    linkhtml=' · '.join(f'<a href="{url}" target="_blank" rel="noreferrer">{name}</a>' for name,url in links)
    if 'biga' in reused: linkhtml+=' · <a href="https://creativecommons.org/licenses/by/2.0/">Licenza del riferimento fotografico della biga</a>'
    cards.append(f'<article id="{key}"><header><span class="eyebrow">{title}</span><h2>{sub}</h2></header><div class="art"><img src="assets/{key}.svg" alt="{title}: schema descritto nella didascalia seguente"/>{labels[key]}</div><div class="copy"><p>{caption}</p><p class="limit">{limit}</p><details><summary>Fonti e riferimenti</summary><p>{linkhtml}</p></details><a class="download" href="assets/{key}.svg">Apri lo schema SVG</a></div></article>')
html='''<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vulcan · Illustrazioni 11</title><style>
*{box-sizing:border-box}body{margin:0;background:#f4ede3;color:#462b20;font:16px/1.6 system-ui,sans-serif}main{max-width:1392px;margin:auto;padding:48px 28px}.intro{max-width:850px;margin-bottom:36px}.eyebrow{font-size:12px;font-weight:750;letter-spacing:.13em;text-transform:uppercase;color:#9c4f32}h1{font:600 clamp(28px,4vw,44px)/1.15 Georgia,serif;margin:10px 0 18px}h2{font:600 25px/1.25 Georgia,serif;margin:8px 0 0}.status{font-size:14px;color:#795d4d}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:26px}article{border:1px solid #dfcdbb;background:#fffaf2;border-radius:20px;overflow:hidden}header{padding:26px 26px 0}.art{position:relative;aspect-ratio:672/448;color:#77422e;container-type:inline-size}.art img{width:100%;height:100%;display:block}.label{position:absolute;transform:translate(-50%,-50%);font-size:clamp(11px,2.3cqw,15px);font-weight:650;text-align:center;line-height:1.3;white-space:nowrap}.small{font-size:clamp(10px,1.8cqw,12px);font-weight:500}.percent{font-size:clamp(11px,2.4cqw,16px)}.copy{padding:0 26px 26px}.copy p{margin:0 0 16px}.limit{font-size:14px;color:#795d4d;border-left:2px solid #cc9870;padding-left:12px}details{font-size:13px}summary{cursor:pointer;font-weight:650}details p{padding-top:10px}a{color:#934627;text-underline-offset:3px}.download{display:inline-block;margin-top:14px;font-size:13px}button{border:1px solid #b38362;color:inherit;background:transparent;border-radius:20px;padding:8px 14px;cursor:pointer;font:inherit;font-size:13px}.dark .art{background:#2d2926;color:#eed7b4}.dark .label{color:#eed7b4}.dark .percent,.dark .solid{color:#77422e}footer{margin:30px 0;font-size:13px;color:#795d4d}@media(max-width:750px){main{padding:30px 16px}.grid{grid-template-columns:1fr;gap:22px}header{padding:22px 20px 0}h2{font-size:23px}.copy{padding:0 20px 22px}}
</style><main><div class="intro"><span class="eyebrow">Vulcan · Impara · Lotto 11</span><h1>Capire i meccanismi e leggere gli indici</h1><p>Cinque proposte per le ultime voci del glossario. Geometrie originali e illustrazioni già approvate, basate sui riferimenti fotografici citati. Nessuna nuova immagine scientifica generata.</p><p class="status">Revisione locale · Non ancora inserite nell’app né pubblicate online.</p><button id="theme" type="button" aria-pressed="false">Controlla su fondo scuro</button></div><div class="grid">'''+''.join(cards)+'''</div><footer>Diagrammi senza texture sovrapposte. Didascalie, formule e crediti sono HTML separato, da localizzare in fase di integrazione.</footer></main><script>document.getElementById('theme').onclick=function(){const on=document.body.classList.toggle('dark');this.setAttribute('aria-pressed',String(on));this.textContent=on?'Torna al fondo chiaro':'Controlla su fondo scuro'};</script></html>'''
(HERE/'review.html').write_text(html)
manifest={
 'status':'local-review-only','baseCommit':FACTS['commit'],
 'method':'Original SVG diagrams; Arrhenius plotted with Matplotlib; reused approved photo-grounded raster cutouts. No new image generation.',
 'sources':sources,'reusedArtworkReferences':credits,
 'reusedArtworkSha256':used,
 'plates':[{'id':key,'caption':caption,'limitation':limit,'reused':reused,'sha256':hashlib.sha256((ASSETS/f'{key}.svg').read_bytes()).hexdigest()} for key,title,sub,caption,limit,reused in entries],
 'checks':{'arrhenius':'Schematic constant negative slope for positive Ea, fixed A/Ea, no numerical ticks or sampled physical rates.','proteolysis':{'before':9,'after':[4,4,1],'orderedColorsConserved':True},'weightsFrom':'engine-facts.json captured from scoreModelFacts()','d':'Inputs only; no score, weights or clinical outcome invented.'},
 'integrationNote':'Review SVGs embed existing cutouts for portability. App integration should reuse cached assets, avoiding duplicate base64 payloads. Localize HTML labels/captions/credits. No source art overwritten.'
}
(HERE/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
OUT.mkdir(parents=True,exist_ok=True)
shutil.copytree(ASSETS,OUT/'assets',dirs_exist_ok=True)
for p in ['review.html','manifest.json','engine-facts.json']: shutil.copy2(HERE/p,OUT/p)
print(f'Built 5 review plates: {OUT}/review.html')
