import { describe, expect, it } from 'vitest';
import { STYLES_DB, generateRecipe, fermentationPhases, type UserConstraints } from './pizza-engine';
import { getDietaryWarnings } from '../data/dietary-data';
import { getTermById } from '../data/glossary-data';
import { handleMcpMessage } from '../agent/mcp-server';
const kitchen: UserConstraints = {oven_type:'wood',oven_max_temp_c:485,available_hours:48,meal_deadline:false,dough_balls:1,skill_level:3,has_mixer:true,has_baking_pan:true,has_pizza_stone:true,has_pizza_steel:false,pantry_flours:[],pantry_yeasts:[],dietary_filters:[],kitchen_temp_c:22};
function call(name:string,args:Record<string,unknown>={}) { const r=handleMcpMessage({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}});if(!r||!('result'in r))throw Error('missing result');return r.result as any; }
describe('secondo collaudo: expected behavior independent of parity',()=>{
 it('biga e poolish non crescono al 40% della finestra lunga',()=>{
  for(const hours of [24,48,72]) for(const [type,target] of [['biga',16],['poolish',14]] as const){
   const phases=fermentationPhases(hours,true,type);
   expect(phases.preferment).toBe(target);
   expect(phases.bulk+phases.proof+phases.preferment).toBeCloseTo(hours,8);
   const r=generateRecipe(STYLES_DB.napoletana_canotto,kitchen,{customFermentationHours:hours,usePreFerment:true,preFerment:{type}});
   expect(r.timeline.find(s=>s.id==='preferment')!.duration_minutes).toBe(target*60);
  }
 });
 it('nessuna percentuale FODMAP o garanzia medica dal tempo',()=>{
  for(const hours of [2,24,48,72]){
   const r=generateRecipe(STYLES_DB.napoletana_canotto,kitchen,{customFermentationHours:hours});
   expect(r.science.fodmap_reduction_pct).toBeNull();
   expect(r.scores.claims.some(c=>c.key.startsWith('dig.fodmap'))).toBe(false);
   const warnings=getDietaryWarnings(['low_fodmap','histamine'],{fermentHours:hours,fermentTemp:22,yeastType:'fresh',hydration:65,flourW:300});
   expect(warnings.map(w=>w.filterId)).toEqual(['low_fodmap','histamine']);
   expect(JSON.stringify(warnings)).not.toMatch(/\d+%|mg\/kg|IBS/);
  }
  expect(getTermById('d_score')!.formula).toBeUndefined();
  expect(getTermById('w_alveograph')!.formula).toContain('dV');
 });
 it('dodici pizze: stesura 60 min e condimento 36 min, cottura ancora in secondi reali',()=>{
  const r=call('generate_recipe',{style_id:'napoletana_stg',oven_model:'Ooni Koda 16',available_hours:8,dough_balls:12,skill_level:4,has_mixer:true}).structuredContent;
  const shape=r.steps.find((s:any)=>s.id==='shape');
  const top=r.steps.find((s:any)=>s.work_units===12&&s.minutes_per_unit===3);
  expect(shape.duration_minutes).toBe(60);expect(shape.work_units).toBe(12);
  expect(top.duration_minutes).toBe(36);
  expect(r.steps.find((s:any)=>s.id==='bake').duration_minutes).toBe(Math.ceil(12*r.cook_time_sec/60));
  expect(r.schedule.model).toBe('sequential_single_operator');
  expect(r.schedule.total_minutes).toBeLessThanOrEqual(480);
 });
 it('tempo insufficiente viene bloccato, mai mascherato da programma fattibile',()=>{
  for(const style of Object.values(STYLES_DB)) for(const dough_balls of [1,4,12]){
   const r=generateRecipe(style,{...kitchen,available_hours:4,meal_deadline:true,dough_balls});
   if(r.timeline.reduce((sum,s)=>sum+s.duration_minutes,0)>240){
    expect(r.verdict.outcome,style.id).toBe('not_feasible');
    expect(r.verdict.blockers.some(b=>b.kind==='time_window'),style.id).toBe(true);
   }
  }
 });
 it('teglia assente confermata e acquisto rifiutato bloccano Greek Pan',()=>{
  const r=call('generate_recipe',{style_id:'greek_pan',oven_type:'home',oven_max_temp_c:250,available_hours:24,dough_balls:1,has_baking_pan:false,equipment_inventory_complete:true,allow_equipment_purchase:false}).structuredContent;
  expect(r.conditions.some((c:any)=>c.kind==='pan'&&c.status==='missing')).toBe(true);
  expect(r.outcome).toBe('not_feasible');
  expect(r.blockers.some((b:any)=>b.kind==='resource_excluded'&&b.resource==='equipment')).toBe(true);
 });
 it('guida aggiornata e tipo di grasso esplicito',()=>{
  const guide=call('get_guide').content[0].text;
  expect(guide).not.toContain('No grams for toppings');expect(guide).not.toContain('No commercial flour');
  expect(guide).toContain('sequential_single_operator');
  expect(call('generate_recipe',{style_id:'ciaccino_senese',available_hours:24}).structuredContent.fat_type).toBe('lard');
 });
});
