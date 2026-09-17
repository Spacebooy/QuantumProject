import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { jsx, jsxs, Fragment } from '../src/i18n/jsx-runtime.js';
import { LanguageContext } from '../src/i18n/language.js';
import { catalog, translate } from '../src/i18n/translate.js';
import { lessons, gateInfo } from '../src/tutorial/tutorialLessons.js';
import { plainExplanations } from '../src/tutorial/tutorialPlainLanguage.js';
const unchanged=new Set(['CNOT','Hadamard','Qubit','Qubits','qubits','Pauli X','Pauli Y','Pauli Z','Deutsch-Jozsa','Bernstein-Vazirani','^x mod','mod','gcd(','a^x mod N','gcd(a^(r/2) ± 1, N)','student@university.edu']);
const covered=s=>assert.ok(Object.hasOwn(catalog,s.trim().replace(/\s+/g,' '))||unchanged.has(s),`Missing translation: ${s}`);
test('all tutorial lessons, detailed explanations, successes and hints have translations',()=>{
 for(const l of lessons){covered(l.title);covered(l.category);for(const s of l.steps){for(const k of ['title','message','successMessage'])if(s[k])covered(s[k]);for(const hint of s.hints||[])covered(hint);}}
 Object.values(gateInfo).forEach(covered);
 for(const steps of Object.values(plainExplanations))Object.values(steps).forEach(covered);
});
test('visible JSX text and accessibility attributes are covered across the app',()=>{
 function scan(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()&&e.name!=='i18n')scan(p);else if(e.isFile()&&p.endsWith('.jsx')){const ast=parse(fs.readFileSync(p,'utf8'),{sourceType:'module',plugins:['jsx']});function walk(n){if(!n||typeof n!=='object')return;if(n.type==='JSXText'||n.type==='JSXAttribute'&&['title','alt','aria-label','placeholder'].includes(n.name.name)&&n.value?.type==='StringLiteral'){const s=(n.type==='JSXText'?n.value:n.value.value).replace(/\s+/g,' ').trim();if(/[a-zA-Z]{2}/.test(s))covered(s);}for(const [k,v]of Object.entries(n))if(!['loc','start','end'].includes(k)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}walk(ast);}}}scan(new URL('../src',import.meta.url).pathname);
});
test('dynamic guidance, outcomes and errors preserve numbers and notation',()=>{
 assert.equal(translate('Set Qubits to 2.','vi'),'Đặt số qubit là 2.');
 assert.match(translate('Click the glowing square on q0 (the top wire) to place H.','vi'),/q0.*H/);
 assert.match(translate('17 is prime. No nontrivial factors exist.','vi'),/17 là số nguyên tố/);
 assert.match(translate('Measured A |01⟩. Every state maps to a corridor.','vi'),/^Đo được A \|01⟩/);
 for(const s of ['H','X','RX','CNOT','|01⟩','0.7854','q0','α|0⟩ + β|1⟩'])assert.equal(translate(s,'vi'),s);
 assert.equal(translate(' Run Circuit ','en'),' Run Circuit ');
 assert.equal(translate(' Run Circuit ','vi'),' Chạy mạch ');
});
test('presentation runtime translates fragments and attributes, protects user text and control values',()=>{
 const tree=jsxs('section',{children:[jsx(Fragment,{children:'Run Circuit'},'label'),jsx('input',{'aria-label':'Mode',value:'ideal',readOnly:true},'input'),jsx('span',{translate:'no',children:jsx('strong',{children:'Noise'})},'raw')]});
 const html=renderToStaticMarkup(createElement(LanguageContext.Provider,{value:{language:'vi'}},tree));
 assert.match(html,/Chạy mạch/);assert.match(html,/aria-label="Chế độ"/);assert.match(html,/value="ideal"/);assert.match(html,/<strong>Noise<\/strong>/);
});
