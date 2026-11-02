"""Export preserved generated masters and build a caption-only review gallery."""
from pathlib import Path
from PIL import Image, ImageDraw
from html import escape
import hashlib,json,shutil
root=Path(__file__).resolve().parents[2];folder=root/'design-assets/learn-illustrations-batch-16'
out=Path('/Users/matteo/dev/Vulcan/output/learn-illustration-batch-16-2026-11-02')
items=json.loads((folder/'prompts.json').read_text());(out/'assets').mkdir(exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
records=[]
for a in items:
 master=out/'masters'/(a['id']+'.png');im=Image.open(master).convert('RGBA');assert im.size==(1536,1024);assert im.getchannel('A').getextrema()[0]==0
 asset=folder/'assets'/(a['id']+'.webp');im.resize((672,448),Image.Resampling.LANCZOS).save(asset,quality=88,method=6);shutil.copy2(asset,out/'assets'/asset.name)
 sources=[]
 for source in a['sources']:
  source=dict(source);source['sha256']=sha(Path(source['local_reference']));sources.append(source)
 records.append({'id':a['id'],'title':a['title'],'target':a['target'],'asset':'assets/'+asset.name,'dimensions':[672,448],'bytes':asset.stat().st_size,'sha256':sha(asset),'master':str(master),'master_sha256':sha(master),'caption_it':a['caption_it'],'sources':sources,'recomposition_and_limits':a['limits']})
manifest={'batch':16,'date':'2026-11-02','base_commit':'37c88d0c66ba029d467eb7d2cc37d1918ee52107','status':'Four review proposals, not integrated or published','mode':'built-in Imagegen, one distinct call per asset','export':'Pillow resize/format conversion only; generated alpha preserved','edits':'edits.json','style_reference':{'path':'src/assets/learn/bench-fold.webp','sha256':sha(root/'src/assets/learn/bench-fold.webp'),'role':'approved style only'},'assets':records}
for p in [folder/'manifest.json',out/'manifest.json']:p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
for theme,bg,ink in [('light','#faf6ef','#362c25'),('dark','#211e1a','#f8eddd')]:
 contact=Image.new('RGB',(1200,820),bg);d=ImageDraw.Draw(contact)
 for i,a in enumerate(records):
  im=Image.open(folder/a['asset']);im.thumbnail((570,380));plate=Image.new('RGBA',im.size,bg);plate.alpha_composite(im);contact.paste(plate.convert('RGB'),((i%2)*600,(i//2)*410));d.text(((i%2)*600+14,(i//2)*410+382),f'{i+1}. {a["id"]}',fill=ink)
 contact.save(out/f'contact-{theme}.jpg')
cards=''.join(f'<article id="{a["id"]}"><p class="eyebrow">{i+1:02} · {escape(a["target"])}</p><h2>{escape(a["title"])}</h2><figure><img src="{a["asset"]}" width="672" height="448" alt="{escape(a["title"])}"><figcaption>{escape(a["caption_it"])}</figcaption></figure></article>' for i,a in enumerate(records))
page='''<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vulcan · Illustrazioni 16</title><style>
:root{color-scheme:light;--bg:#faf6ef;--panel:#fffdf8;--ink:#362c25;--muted:#756659;--line:#dfd1c2}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif}body:has(#theme:checked){color-scheme:dark;--bg:#1f1d19;--panel:#28251f;--ink:#f8eddd;--muted:#c2b39f;--line:#55493b}main{max-width:1200px;margin:auto;padding:28px 24px 48px}header{max-width:850px;margin-bottom:28px}h1{font-size:clamp(27px,4vw,40px);line-height:1.1;margin:10px 0 16px}h2{font-size:22px;line-height:1.25;margin:10px 0}.eyebrow{font-size:12px;color:var(--muted);margin:0}.switch{display:inline-block;padding:8px 14px;border:1px solid var(--line);border-radius:20px;background:var(--panel)}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}article{min-width:0;background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:20px}figure{margin:0}figure img{display:block;width:100%;height:auto;margin:14px 0}figcaption{font-size:15px}footer{margin-top:24px;font-size:14px;color:var(--muted)}@media(max-width:620px){main{padding:24px 16px 40px}.grid{grid-template-columns:1fr}}</style><main><header><p class="eyebrow">VULCAN · IMPARA · LOTTO 16 · PROPOSTE LOCALI</p><h1>Gesti utili, dalla stesura al fritto.</h1><p>Quattro nuove tavole per i gesti ancora poco illustrati in Problemi e soluzioni.</p><label class="switch"><input type="checkbox" id="theme"> Sfondo scuro</label></header><div class="grid">'''+cards+'''</div><footer>Lotto 16 · proposte in revisione, ancora da inserire in Impara.</footer></main></html>'''
for p in [folder/'review.html',out/'review.html']:p.write_text(page)
print(json.dumps({'count':len(records),'bytes':sum(a['bytes'] for a in records)}))
