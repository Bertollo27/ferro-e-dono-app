// Test del motore: node test-motore.mjs
import fs from 'fs';
const u=f=>new URL('./'+f,import.meta.url);
const src=['dati-dono.js','dati-ingegno.js','motore.js'].map(f=>fs.readFileSync(u(f),'utf8')).join('\n');
const api=new Function(src+';return {runFight,nuovaPartita,caselleRaggiungibili,bersagliCarta,motivoCartaNonGiocabile,risolviScambio,continuaScambio,nuovaScheda,schedaConsigliata,nodiDisponibili,prendiNodo,sostituisciCarta,cartaTogliibile,affinaTogli,affinaFine,maestriaApplica,schedaPronta,POTENZIAMENTI,basi,istantanea,RETI};')();
let ok=true;const fail=m=>{ok=false;console.error('ERRORE:',m);};
const B=api.basi();if(B.length!==16)fail('basi '+B.length);
// 1) scontri automatici: Dono, Ingegno e misti, 1v1..4v4
const pick=(n,k)=>Array.from({length:n},(_,i)=>B[(i*5+k)%16]);let w={A:0,B:0,pari:0};
for(const n of [1,2,3,4])for(const L of [1,5,12,20])for(let s=1;s<=6;s++){const A=pick(n,s),Bt=pick(n,s+7);const r=api.runFight({A,B:Bt,map:['aperta','casse','vicolo'][s%3]},s,L);w[r.res]++;}
// 2) partita manuale mista: A gioca a mano, B è IA
let coll=0;const log=[];
const G=api.nuovaPartita({map:'casse',A:[{fz:'dono',bi:0,L:6},{fz:'ingegno',bi:3,L:6}],B:[{fz:'ingegno',bi:0,L:6},{fz:'dono',bi:4,L:6}]});
while(!G.over){const p={};for(const F of G.fs){if(F.pf<=0||F.isPet)continue;if(F.team==='B'){p[F.id]={ai:true};continue;}
  const R=[...api.caselleRaggiungibili(G,F).keys()];const mv=R[R.length-1].split(',').map(Number);
  const ci=F.hand.findIndex(d=>!api.motivoCartaNonGiocabile(G,F,d,mv));let t=null;
  if(ci>=0){const bt=api.bersagliCarta(G,F,F.hand[ci],mv);t=bt.list&&bt.list[0]?bt.list[0].id:null;}p[F.id]={move:mv,ci:ci>=0?ci:null,t};}
  let r=api.risolviScambio(G,p);while(r.attesa){coll++;const ans={};r.attesa.chi.forEach(c=>ans[c.id]=Math.random()<.5?'prosegui':'resta');r=api.continuaScambio(G,ans);}
  if(!r.lines.length)fail('scambio vuoto');log.push(...r.lines);}
if(!api.istantanea(G).some(f=>f.pet))fail('l\'automa dell\'Ingegnere non è comparso');
// 3) crescita manuale casuale fino al 20 per tutte le 16 basi, poi 4v4 misti con quelle schede
const schede=[];
for(const b of B){const s=api.nuovaScheda(b.fz,b.bi);
  while(s.level<20){const L=api.nodiDisponibili(s);if(!L.length){fail(b.nome+': nessun nodo al livello '+s.level);break;}
    const n=L[Math.floor(Math.random()*L.length)];let p=api.prendiNodo(s,n.id,n.opzioni?Math.floor(Math.random()*n.opzioni.length):undefined);
    let g=0;while(p&&g++<10){if(p.tipo==='sostituisci')p=api.sostituisciCarta(s,s.deck[Math.floor(Math.random()*s.deck.length)].u);
      else if(p.tipo==='affina'){const d=s.deck.find(d=>!api.cartaTogliibile(s,d.u));p=d&&Math.random()<.7?api.affinaTogli(s,d.u):api.affinaFine(s);}
      else p=api.maestriaApplica(s,s.deck.find(d=>d.mods.length<3).u,api.POTENZIAMENTI[0]);}}
  if(!api.schedaPronta(s,20))fail('scheda non pronta '+b.nome);schede.push({...b,L:20,scheda:JSON.parse(JSON.stringify(s))});}
for(let k=0;k<6;k++){const G2=api.nuovaPartita({map:'vicolo',A:[0,1,2,3].map(i=>schede[(i*3+k)%16]),B:[4,5,6,7].map(i=>schede[(i*3+k)%16])});
  while(!G2.over){const p={};G2.fs.forEach(F=>p[F.id]={ai:true});api.risolviScambio(G2,p);}}
if(api.schedaConsigliata('ingegno',3,12).level!==12)fail('schedaConsigliata');
console.log(`collisioni chieste: ${coll}, casse scavalcate: ${log.filter(l=>/scavalca/.test(l)).length}, si scansano: ${log.filter(l=>/si scansano/.test(l)).length}, ingaggiati: ${log.filter(l=>/ingaggiati/.test(l)).length}`);
console.log(`96 scontri automatici (misti) ok: A ${w.A}, B ${w.B}, pari ${w.pari} · partita manuale mista finita in ${G.n} scambi · 16 crescite manuali + 6 partite 4v4 con schede ok`);
process.exit(ok?0:1);
