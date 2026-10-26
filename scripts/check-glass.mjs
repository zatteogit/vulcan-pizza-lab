/** The emitted CSS must retain both backdrop-filter spellings. Lightning CSS
 *  coalesces aliases: putting the prefixed declaration LAST can erase the
 *  standard property in production while dev still looks correct. */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function inspectGlass(css) {
  const issues=[];
  let surfaces=0;
  // Only innermost declaration blocks. No assumptions about class names,
  // whitespace, nesting/media/layer wrappers or minifier rule grouping.
  for(const [,selector,body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const declarations=[...body.matchAll(/(?:^|;)\s*((?:-webkit-)?backdrop-filter)\s*:\s*([^;{}]+)/g)];
    if(!declarations.length)continue;
    const values=new Map(declarations.map(([,key,value])=>[key,value.trim()]));
    if([...values.values()].every(value=>value==='none'))continue;
    surfaces++;
    const standard=values.get('backdrop-filter'),webkit=values.get('-webkit-backdrop-filter');
    if(!standard||!webkit)issues.push(`${selector.trim()}: missing ${!standard?'standard':'WebKit'} backdrop-filter`);
  }
  if(surfaces===0)issues.push('No glass surfaces found in build output');
  return {surfaces,issues};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const dir='dist/assets';
  const css=readdirSync(dir).filter(file=>file.endsWith('.css')).map(file=>readFileSync(join(dir,file),'utf8')).join('\n');
  const result=inspectGlass(css);
  if(result.issues.length){console.error(result.issues.join('\n'));process.exitCode=1;}
  else console.log(`✓ Glass build: ${result.surfaces} rules preserve standard and WebKit filters`);
}
