from pathlib import Path
from PIL import Image,ImageDraw
import json,shutil,hashlib
root=Path(__file__).resolve().parents[2];out=Path('/Users/matteo/dev/Vulcan/output/learn-illustration-batch-13-2026-11-01');folder=root/'design-assets/learn-illustrations-batch-13';gen=Path('/Users/matteo/.codex/generated_images/01a18731-7935-7200-926e-9ff6059f2798')
files={'room-air-temperature':'exec-4d09b90e-2bd8-4bca-b1ed-b10bcdebc26e.png','fridge-shelf-temperature':'exec-a56dfb33-1a4f-44d0-b0c0-7ae486987bc1.png','flour-temperature':'exec-dbe6b088-a9b3-44bc-8de6-bed277fe9bc7.png','yeast-freshness-check':'exec-6ffbc540-fc5a-4d69-91ad-09cb18b71edd.png','dough-volume-comparison':'exec-fef19f97-761e-440b-a32c-02683bc0df86.png'}
(out/'masters').mkdir(exist_ok=True);(out/'assets').mkdir(exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
a=json.loads((folder/'prompts.json').read_text());records=[]
for item in a:
 if item['id']=='dough-volume-comparison':item['target']='Problemi · P03/P05, osservazione dello sviluppo; Metodo · stime dei tempi'
 p=gen/files[item['id']];master=out/'masters'/(item['id']+'.png');shutil.copy2(p,master)
 im=Image.open(master).convert('RGBA');assert im.size==(1536,1024);assert im.getchannel('A').getextrema()[0]==0
 im.resize((672,448),Image.Resampling.LANCZOS).save(folder/'assets'/(item['id']+'.webp'),quality=88,method=6)
 asset=folder/'assets'/(item['id']+'.webp');shutil.copy2(asset,out/'assets'/asset.name)
 sources=[]
 for source in item['sources']:
  source=dict(source)
  if source['local_reference']:source['sha256']=sha(Path(source['local_reference']))
  sources.append(source)
 records.append({'id':item['id'],'title':item['title'],'target':item['target'],'asset':'assets/'+asset.name,'dimensions':[672,448],'bytes':asset.stat().st_size,'sha256':sha(asset),'original_png':str(master),'master_sha256':sha(master),'sources':sources,'caption_it':item['caption_it'],'recomposition_and_limits':item['limits']})
for p in [folder/'prompts.json',out/'prompts.json']:p.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n')
manifest={'batch':13,'date':'2026-11-01','base_commit':'bd3ceed2a39dda3361e4cc6dae406afcee935063','status':'Prepared for local visual review; not integrated or published','mode':'built-in image_gen; one call per distinct asset','export':'Pillow resize/format conversion only; original alpha preserved; no creative postprocessing','style_reference':{'path':'src/assets/learn/bench-fold.webp','sha256':sha(root/'src/assets/learn/bench-fold.webp'),'role':'approved style only'},'assets':records}
for p in [folder/'manifest.json',out/'manifest.json']:p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
for theme,col in [('light','#faf6ef'),('dark','#211e1a')]:
 contact=Image.new('RGB',(1200,600),col)
 for i,x in enumerate(records):
  im=Image.open(folder/x['asset']);im.thumbnail((390,260));bg=Image.new('RGBA',im.size,col);bg.alpha_composite(im);contact.paste(bg.convert('RGB'),((i%3)*400,(i//3)*300))
  ImageDraw.Draw(contact).text(((i%3)*400+8,(i//3)*300+265),f"{i+1}. {x['id']}",fill='#362c25' if theme=='light' else '#f8eddd')
 contact.save(out/f'contact-{theme}.jpg')
print(json.dumps({'count':len(records),'bytes':sum(x['bytes'] for x in records)}))

# The gallery distributes only our new illustrations, never the research photos.
from html import escape
places = [
 'Metodo e fonti · temperatura della cucina',
 'Problemi e soluzioni · fermentazione in frigo',
 'Metodo e fonti · temperatura dell’acqua',
 'Problemi e soluzioni · impasto che non cresce',
 'Problemi e soluzioni · sviluppo della lievitazione',
]
cards=[]
for i,x in enumerate(records):
 links=''.join('<li><a href="'+escape(s['page'])+'">'+escape(s['author'])+'</a>' + (' <small>· procedura, non fotografia</small>' if s['role']!='physical photo' else '')+'</li>' for s in x['sources'])
 cards.append(f'<article id="{x["id"]}"><p class="eyebrow">{i+1:02d} · {escape(places[i])}</p><h2>{escape(x["title"])}</h2><figure><img src="{x["asset"]}" width="672" height="448" alt="{escape(x["title"])}"><figcaption>{escape(x["caption_it"])}</figcaption></figure><details><summary>Fonti reali e ricomposizione</summary><ul>{links}</ul><p>{escape(x["recomposition_and_limits"])}</p></details></article>')
page='''<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vulcan · Illustrazioni 13</title><style>
:root{color-scheme:light;--bg:#faf6ef;--panel:#fffdf8;--ink:#362c25;--muted:#756659;--line:#dfd1c2;--accent:#a44426}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif}body:has(#theme:checked){color-scheme:dark;--bg:#1f1d19;--panel:#28251f;--ink:#f8eddd;--muted:#c2b39f;--line:#55493b;--accent:#f6ad85}main{max-width:1200px;margin:auto;padding:28px 24px 48px}header{max-width:840px;margin-bottom:28px}h1{font-size:clamp(27px,4vw,40px);line-height:1.1;margin:10px 0 16px}h2{font-size:21px;line-height:1.25;margin:10px 0}.eyebrow{font-size:12px;letter-spacing:.03em;color:var(--muted);margin:0}.switch{display:inline-block;padding:8px 14px;border:1px solid var(--line);border-radius:20px;background:var(--panel)}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}article{min-width:0;background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:20px}figure{margin:0}figure img{display:block;width:100%;height:auto;margin:14px 0}figcaption{font-size:14px}details{border-top:1px solid var(--line);margin-top:18px;padding-top:12px;font-size:13px;color:var(--muted)}summary{cursor:pointer}details ul{padding-left:18px}details li{margin:8px 0}a{color:var(--accent);overflow-wrap:anywhere}footer{margin-top:24px;font-size:14px;color:var(--muted)}@media(max-width:1000px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){main{padding:24px 16px 40px}.grid{grid-template-columns:1fr}}
</style><main><header><p class="eyebrow">VULCAN · IMPARA · LOTTO 13 · PROPOSTE LOCALI</p><h1>Cinque controlli da capire a colpo d’occhio.</h1><p>Temperature, lievito e sviluppo dell’impasto. Fotografie reali come riferimento, strumenti generici e nessuna lettura inventata.</p><label class="switch"><input type="checkbox" id="theme"> Sfondo scuro</label></header><div class="grid">'''+''.join(cards)+'''</div><footer>Nuove proposte in revisione, non ancora inserite nell’app online. Le fotografie restano riferimenti di ricerca; qui sono pubblicate soltanto le nuove illustrazioni. Il glossario è già coperto: questo lotto approfondisce i controlli pratici.</footer></main></html>'''
for p in [folder/'review.html',out/'review.html']:p.write_text(page)
