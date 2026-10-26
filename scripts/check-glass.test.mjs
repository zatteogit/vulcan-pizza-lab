import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectGlass } from './check-glass.mjs';

test('prefixed-only output fails (observed production regression)',()=>{
 assert.match(inspectGlass('.panel{-webkit-backdrop-filter:blur(24px)}').issues[0],/standard/);
});
test('standard-only output fails the supported WebKit contract',()=>{
 assert.match(inspectGlass('.panel{backdrop-filter:blur(24px)}').issues[0],/WebKit/);
});
test('matching declarations survive nested/media/minified CSS',()=>{
 const result=inspectGlass('@layer app{@media(min-width:1px){.a,.b{background:red;-webkit-backdrop-filter:blur(24px) saturate(1.4);backdrop-filter:blur(24px)saturate(1.4)}}}');
 assert.deepEqual(result,{surfaces:1,issues:[]});
});
test('platform-specific variables and deliberate none overrides are allowed',()=>{
 assert.deepEqual(inspectGlass('.a{-webkit-backdrop-filter:var(--webkit-material);backdrop-filter:var(--material)}').issues,[]);
 assert.deepEqual(inspectGlass('.a{-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}.reduced{backdrop-filter:none}').issues,[]);
});
test('empty output and custom properties alone cannot silently pass',()=>{
 assert.ok(inspectGlass('').issues.length);
 assert.ok(inspectGlass(':root{--backdrop-filter:blur(24px)}').issues.length);
});
