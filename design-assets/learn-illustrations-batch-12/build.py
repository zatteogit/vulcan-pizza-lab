"""Export selected Imagegen masters without changing their artwork or alpha."""
import hashlib
import html
import json
import shutil
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = Path('/Users/matteo/dev/Vulcan/output/learn-illustration-batch-12-2026-11-01')
GEN = Path('/Users/matteo/.codex/generated_images/01a18731-7935-7200-926e-9ff6059f2798')
SELECTED = {
    'flour-weighing': 'exec-2d129217-9f67-46a6-8219-8b872028061b.png',
    'biga-hand-mixing': 'exec-f496ca65-73b5-4e5e-9017-deb1cec87de8.png',
    'poolish-stirring': 'exec-b7a803ff-6327-48c7-9307-ea4d30422e7c.png',
    'biga-in-water': 'exec-9272b9c9-c558-4315-85d3-35bdaa8f4057.png',
    'autolyse-initial-mix': 'exec-58983061-18f5-4a3a-bebc-3be6c81095ed.png',
}
SOURCES = {
    'scale': {'author': 'PJ Hamel / King Arthur Baking', 'url': 'https://www.kingarthurbaking.com/blog/2022/02/18/digital-kitchen-scale', 'image': 'https://www.kingarthurbaking.com/sites/default/files/styles/scaled_small/public/2022-02/Baking%20with%20a%20scale-5.jpg?itok=hAYZliS9', 'local': 'scale-bowl-photo.jpg'},
    'hand': {'author': 'Chef Billy Parisi', 'url': 'https://www.billyparisi.com/biga-recipe/', 'image': 'https://www.billyparisi.com/wp-content/uploads/2025/10/biga-process-1-1024x560.jpg', 'local': 'hand-mix-photo.jpg'},
    'biga': {'author': 'Rosemary Molloy / An Italian in my Kitchen', 'url': 'https://anitalianinmykitchen.com/italian-bread/', 'image': 'https://anitalianinmykitchen.com/wp-content/uploads/2020/01/bread-1-1-of-1.jpg', 'local': 'biga-mixing-photo.jpg'},
    'water': {'author': 'Rosemary Molloy / An Italian in my Kitchen', 'url': 'https://anitalianinmykitchen.com/italian-bread/', 'image': 'https://anitalianinmykitchen.com/wp-content/uploads/2020/01/bread-3-1-of-1.jpg', 'local': 'biga-water-photo.jpg'},
    'poolish': {'author': 'Tatiana Kamakura / Milk and Pop', 'url': 'https://milkandpop.com/homemade-french-baguette/', 'image': 'https://milkandpop.com/wp-content/uploads/2023/10/how-to-make-poolish-starter-3.jpg', 'local': 'poolish-mixing-photo.jpg'},
    'autolyse': {'author': 'Maurizio Leo / The Perfect Loaf', 'url': 'https://www.theperfectloaf.com/guides/how-to-autolyse/', 'role': 'Procedural description, not a photographic input'},
}
ASSIGN = [['scale'], ['hand', 'biga'], ['poolish'], ['water', 'biga'], ['hand', 'biga', 'autolyse']]
REUSE = [
    ('dough-temperature.webp', 'Metodo · temperatura reale dell’impasto', 'Collegare al termometro, senza attribuire una lettura al disegno.'),
    ('covered-rest.webp', 'Prefermenti · riposo coperto', 'Riutilizzo nei passaggi di riposo; tempi e condizioni restano nel testo.'),
    ('alveograph-bubble.webp', 'Metodo / Farine · prove di laboratorio', 'Spiegazione generica della prova; nessun risultato sperimentale attribuito alla singola farina.'),
    ('oven-floor-dome.webp', 'Metodo · calore e forno', 'Usare nella spiegazione termica, senza suggerire un modello commerciale.'),
    ('a-score-diagram.svg', 'Metodo · criteri di valutazione', 'Riutilizzare il renderer HTML localizzato già esistente; non trasformare lo schema in una fotografia.'),
    ('portion-weighing.webp', 'Metodo · massa e porzioni', 'Richiamo utile alle quantità; nessun peso leggibile inventato.'),
]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    (HERE / 'assets').mkdir(exist_ok=True)
    (OUT / 'masters').mkdir(exist_ok=True)
    items = json.loads((HERE / 'prompts.json').read_text())
    records, cards = [], []
    for i, item in enumerate(items):
        master = GEN / SELECTED[item['id']]
        shutil.copy2(master, OUT / 'masters' / (item['id'] + '.png'))
        im = Image.open(master).convert('RGBA')
        assert im.size == (1536, 1024)
        im.resize((672, 448), Image.Resampling.LANCZOS).save(HERE / 'assets' / (item['id'] + '.webp'), quality=88, method=6)
        asset = HERE / 'assets' / (item['id'] + '.webp')
        refs = []
        for key in ASSIGN[i]:
            source = dict(SOURCES[key])
            if source.get('local'):
                source['research_photo_sha256'] = sha(OUT / 'references' / source['local'])
            refs.append(source)
        records.append({'id': item['id'], 'asset': str(asset.relative_to(ROOT)), 'sha256': sha(asset), 'master': str(OUT / 'masters' / (item['id'] + '.png')), 'master_sha256': sha(master), 'dimensions': [672, 448], 'sources': refs, 'recomposition_and_limits': item['limits'], 'caption_it': item['caption_it'], 'target': item['target']})
        links = ' · '.join(f'<a href="{html.escape(s["url"])}">{html.escape(s["author"])}</a>' for s in refs)
        cards.append(f'<article id="{item["id"]}"><p class="eyebrow">{i+1:02d} · {html.escape(item["target"])}</p><h2>{html.escape(item["title"])}</h2><figure><div class="art"><img src="assets/{item["id"]}.webp" width="672" height="448" alt="{html.escape(item["title"])}"></div><figcaption>{html.escape(item["caption_it"])}</figcaption></figure><details><summary>Riferimenti reali e ricomposizione</summary><p>{links}</p><p>{html.escape(item["limits"])}</p></details></article>')
    reuse_html = ''.join(f'<li><strong>{html.escape(t)}</strong><p>{html.escape(d)}</p><code>{name}</code></li>' for name,t,d in REUSE)
    page = '''<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vulcan · Illustrazioni 12</title><style>
    :root{color-scheme:light;--bg:#faf6ef;--panel:#fffdf8;--ink:#362c25;--muted:#756659;--line:#dfd1c2;--accent:#a44426}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,sans-serif}body:has(#theme:checked){color-scheme:dark;--bg:#1f1d19;--panel:#28251f;--ink:#f8eddd;--muted:#c2b39f;--line:#55493b;--accent:#f6ad85}main{max-width:1160px;margin:auto;padding:32px 24px 64px}header{max-width:760px;margin:0 0 32px}h1{font-size:clamp(28px,5vw,44px);line-height:1.1;margin:12px 0}h2{font-size:23px;line-height:1.25;margin:10px 0}.eyebrow{font-size:12px;letter-spacing:.04em;color:var(--muted);margin:0}.switch{display:inline-block;padding:10px 16px;border:1px solid var(--line);border-radius:20px;background:var(--panel);color:var(--ink);cursor:pointer}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}article{min-width:0;background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:24px}figure{margin:0}.art{margin:16px -8px 8px}.art img{display:block;width:100%;height:auto}figcaption{font-size:15px}details{border-top:1px solid var(--line);margin-top:20px;padding-top:14px;font-size:13px;color:var(--muted)}summary{cursor:pointer}a{color:var(--accent);overflow-wrap:anywhere}section{margin-top:40px}li{margin:18px 0}li p{margin:4px 0}code{font-size:12px;overflow-wrap:anywhere}.notice{color:var(--muted)}@media(max-width:680px){main{padding:24px 16px 48px}.grid{grid-template-columns:1fr}article{padding:20px}}
    </style><main><header><p class="eyebrow">VULCAN · IMPARA · LOTTO 12 · PROPOSTE LOCALI</p><h1>Gesti chiari, riferimenti reali.</h1><p>Cinque nuove tavole per i passaggi pratici dei prefermenti e la pesatura. Lo stato dell’impasto è indicativo: dosi, tempi e istruzioni restano nella guida.</p><label class="switch"><input id="theme" type="checkbox"> Sfondo scuro</label><p class="notice">In revisione: queste proposte non sono ancora nell’app online. Le fotografie sono riferimenti di ricerca; qui mostriamo soltanto le nuove illustrazioni.</p></header><div class="grid">'''
    page += ''.join(cards) + f'</div><section><h2>Altre sezioni: riuso mirato</h2><p>Per Metodo e fonti e per le spiegazioni sulle farine, questi contenuti già approvati possono chiarire il testo senza moltiplicare le immagini.</p><ul>{reuse_html}</ul><p class="notice">I punti su gusto e odore restano testuali: una tavola non può stabilire una diagnosi. Nessun sacco o tracciato inventato per una specifica farina.</p></section></main></html>'
    (HERE / 'review.html').write_text(page)
    manifest = {'batch':12, 'date':'2026-11-01', 'state':'local-review-only', 'base_commit':'20632adeb6d04c95d99385295eefa8a29a634d3c', 'mode':'built-in image_gen; one call per asset; scale regenerated as a static weighing setup', 'export':'Pillow resize/format conversion only; generated alpha preserved; no background removal or creative postprocessing', 'source_photo_policy':'Research references only, not published product assets or gallery images', 'assets':records, 'reuse':REUSE}
    (HERE / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
    for name in ['review.html', 'manifest.json', 'prompts.json']:
        shutil.copy2(HERE/name, OUT/name)
    shutil.copytree(HERE/'assets', OUT/'assets', dirs_exist_ok=True)
    print(json.dumps({'assets':len(records),'webp_bytes':sum((HERE/'assets'/(x['id']+'.webp')).stat().st_size for x in records),'output':str(OUT)}))

if __name__ == '__main__':
    main()
