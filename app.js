/* ============================================================
   Ferro & Dono — INTERFACCIA DELL'APP (fase 1: contro l'IA)
   Usa solo le funzioni pubbliche di motore.js (nuovaPartita, risolviScambio,
   nuovaScheda, prendiNodo, ...). L'aspetto grafico sta tutto in stile.css:
   qui si usano solo le classi elencate lì.
   ============================================================ */
(()=>{
'use strict';
const VERSIONE='0.2 · fase 1';
const $app=document.getElementById('app');
const E=t=>String(t??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ---------- memoria del telefono (sempre protetta: può mancare) ---------- */
const mem={get(k,def){try{const v=localStorage.getItem(k);return v==null?def:JSON.parse(v);}catch(e){return def;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}};

/* ---------- dati di base ---------- */
const BASI=basi();
const chiaveBase=b=>b.fz+':'+b.bi;
const baseDa=k=>BASI.find(b=>chiaveBase(b)===k);
const MAPPE=Object.entries(MAPS).map(([id,m])=>({id,nome:m.name}));
const rete=fz=>RETI[fz];
const parola=(fz,k)=>rete(fz).txt[k]||k;
const casuale=a=>a[Math.floor(Math.random()*a.length)];

/* ---------- stato dell'app ---------- */
const S={
  schermo:'home',
  cfg:mem.get('fd-cfg',null)||{n:2,L:5,map:'casse',A:['dono:0','ingegno:3','dono:2','ingegno:1'],B:['ingegno:0','dono:4','ingegno:2','dono:1']},
  cresc:{},          // per posto della squadra A: {modo, s, storia, vista}
  attivoC:0,         // personaggio mostrato nella crescita
  G:null, piani:{}, ia:{}, attivo:null, ultimo:null, foglio:null, errore:'', registroSalvato:false,
};
if(S.cfg.mov==null)S.cfg.mov='insieme';
S.cfg.A=(S.cfg.A||[]).filter(baseDa);S.cfg.B=(S.cfg.B||[]).filter(baseDa);
while(S.cfg.A.length<4)S.cfg.A.push(chiaveBase(casuale(BASI)));while(S.cfg.B.length<4)S.cfg.B.push(chiaveBase(casuale(BASI)));
const salvaCfg=()=>mem.set('fd-cfg',S.cfg);

/* ============================================================
   RENDER
   ============================================================ */
function render(){
  const mano=$app.querySelector('.mano'),sx=mano?mano.scrollLeft:0,sy=window.scrollY,stesso=$app.dataset.schermo===S.schermo;
  const f={home:vHome,prep:vPrep,cresc:vCresc,scontro:vScontro,fine:vFine,registro:vRegistro}[S.schermo];
  $app.dataset.schermo=S.schermo;
  $app.innerHTML=f()+(S.foglio?vFoglio():'');
  if(stesso){window.scrollTo(0,sy);const m2=$app.querySelector('.mano');if(m2)m2.scrollLeft=sx;}else window.scrollTo(0,0);
}
const barra=html=>`<div class="barra-fondo"><div class="dentro">${html}</div></div>`;
const btn=(act,txt,cls='',extra='')=>`<button class="btn ${cls}" data-act="${act}" ${extra}>${txt}</button>`;
const avviso=()=>S.errore?`<p class="avviso male" role="alert">${E(S.errore)}</p>`:'';

/* ---------- HOME ---------- */
function vHome(){
  const n=mem.get('fd-registro',[]).length;
  return `<div class="pila">
  <header class="home-testa pila">
    <span class="sigillo">Combattimento a carte</span>
    <h1>Ferro &amp; Dono</h1>
    <p class="tenue">Scegli i personaggi, falli crescere fino al livello della partita e sfida l'IA su una griglia. Dono e Ingegno possono stare nella stessa squadra.</p>
  </header>
  ${btn('vai-prep','Nuova partita contro l\'IA','primario grande')}
  <a class="btn grande" style="display:flex;align-items:center;justify-content:center;text-decoration:none" href="guida.html">Come si gioca</a>
  ${btn('vai-registro',`Partite giocate${n?` (${n})`:''}`,'grande')}
  <div class="riquadro pila piccolo">
    <h3>In arrivo</h3>
    <p>Partite online tra amici fino a 8 giocatori, un personaggio a testa.</p>
  </div>
  <p class="versione">Versione ${VERSIONE} · regole: Dono e Ingegno, bilanciamento incrociato ancora da fare</p>
  </div>`;
}

/* ---------- PREPARAZIONE ---------- */
function selectBase(lato,i){
  const cur=S.cfg[lato][i];
  const gruppi=Object.values(RETI).map(R=>`<optgroup label="${E(R.nome)}">${BASI.filter(b=>b.fz===R.id).map(b=>`<option value="${chiaveBase(b)}"${chiaveBase(b)===cur?' selected':''}>${E(b.breve)} · ${E(b.elemento)}</option>`).join('')}</optgroup>`).join('');
  const b=baseDa(cur);
  return `<div class="posto"><span class="n">${i+1}</span><div class="pila" style="gap:4px">
    <select data-act="base" data-lato="${lato}" data-i="${i}" aria-label="Personaggio ${i+1} squadra ${lato}">${gruppi}</select>
    <span class="piccolo tenue">${E(b.fazione)} · ${E(b.nome)}</span></div></div>`;
}
function vPrep(){
  const c=S.cfg;
  return `<div class="pila">
  <div class="riga">${btn('vai-home','‹ Indietro','piccolo')}<h2>Nuova partita</h2></div>
  <div class="riquadro pila">
    <h3>Formato</h3>
    <div class="segmenti" role="group" aria-label="Formato">${[1,2,3,4].map(n=>`<button data-act="formato" data-n="${n}" aria-pressed="${c.n===n}">${n} contro ${n}</button>`).join('')}</div>
    <h3>Livello dei personaggi (uguale per tutti)</h3>
    <div class="riga"><div class="passo"><button data-act="liv" data-d="-1" aria-label="Livello meno">−</button><span class="num">${c.L}</span><button data-act="liv" data-d="1" aria-label="Livello più">+</button></div>
      <span class="piccolo tenue">da 1 a 20</span></div>
    <h3>Movimento (regola in prova)</h3>
    <div class="segmenti" role="group" aria-label="Regola di movimento"><button data-act="movimento" data-m="insieme" aria-pressed="${c.mov==='insieme'}">Tutti insieme</button><button data-act="movimento" data-m="turni" aria-pressed="${c.mov==='turni'}">Uno alla volta</button></div>
    <p class="piccolo tenue">${c.mov==='insieme'?'Ci si muove tutti insieme: chi si incontra sceglie se proseguire o restare ingaggiato. Scavalcare una cassa costa 1 stamina.':'Regola precedente: ci si muove uno dopo l\'altro, prima chi ha più Destrezza; le casse non si scavalcano.'}</p>
    <h3>Mappa</h3>
    <select data-act="mappa" aria-label="Mappa">${MAPPE.map(m=>`<option value="${m.id}"${m.id===c.map?' selected':''}>${E(m.nome)}</option>`).join('')}</select>
  </div>
  <div class="riquadro pila">
    <div class="riga"><h3 class="squadra-A">La tua squadra</h3><span class="spazio"></span>${btn('casuale','Casuale','piccolo','data-lato="A"')}</div>
    ${Array.from({length:c.n},(_,i)=>selectBase('A',i)).join('')}
  </div>
  <div class="riquadro pila">
    <div class="riga"><h3 class="squadra-B">Squadra dell'IA</h3><span class="spazio"></span>${btn('casuale','Casuale','piccolo','data-lato="B"')}</div>
    ${Array.from({length:c.n},(_,i)=>selectBase('B',i)).join('')}
    <p class="piccolo tenue">I personaggi dell'IA crescono sempre con il percorso consigliato.</p>
  </div>
  </div>${barra(btn('vai-cresc','Avanti: crescita dei personaggi','primario'))}`;
}

/* ---------- CRESCITA ---------- */
const chiaveScheda=(k,L)=>k+':'+L;
function crescPosto(i){const k=S.cfg.A[i],L=S.cfg.L,id=chiaveScheda(k,L)+':'+i;
  if(!S.cresc[i]||S.cresc[i].id!==id){const b=baseDa(k);S.cresc[i]={id,modo:'consigliato',s:schedaConsigliata(b.fz,b.bi,L),storia:[],vista:'nodi',pot:POTENZIAMENTI[0]};}
  return S.cresc[i];}
const prontaC=c=>schedaPronta(c.s,S.cfg.L);
function salvate(){return mem.get('fd-schede',{});}
function salvaScheda(c){if(c.modo!=='manuale'||!prontaC(c))return;const all=salvate(),b=baseDa(S.cfg.A[S.attivoC]);all[chiaveScheda(chiaveBase(b),S.cfg.L)]=c.s;mem.set('fd-schede',all);}

function cartaMini(c){return `<span><strong>${E(c.n)}</strong>${c.zav?' (zavorra)':''} — ${E(c.a||'')}${c.b?' / '+E(c.b):''}</span>`;}
function vNodo(n){
  const corpo=`<div class="tipo">${E(n.tipo)}${n.ramo?' · '+E(n.ramo):''}${n.anello?' · anello '+n.anello:''}</div>
    <b>${E(n.nome)}</b>
    ${n.testo?`<div class="testo">${E(n.testo)}</div>`:''}
    ${n.carte.length?`<div class="testo pila" style="gap:2px">${n.carte.map(cartaMini).join('')}</div>`:''}
    ${n.zavorre.length?`<div class="testo tenue">Zavorre: ${n.zavorre.map(z=>E(z.n||z)).join(', ')}</div>`:''}`;
  const col=`border-left-color:var(--el-${n.regione})`;
  if(!n.opzioni)return `<button class="nodo" style="${col}" data-act="prendi" data-id="${E(n.id)}">${corpo}</button>`;
  return `<div class="nodo" style="${col}">${corpo}<div class="pila" style="gap:6px;margin-top:6px">${n.opzioni.map((o,k)=>`<button class="btn piccolo opzione" style="text-align:left" data-act="prendi" data-id="${E(n.id)}" data-opt="${k}"><b>${E(o.nome)}</b>${o.testo?' — '+E(o.testo):''}${o.carte.length?'<br>'+o.carte.map(cartaMini).join('<br>'):''}</button>`).join('')}</div></div>`;
}
function vMazzo(s,act,motivo){
  const R=riepilogoScheda(s);
  return `<div class="mazzo-lista">${R.mazzo.map(m=>{const no=motivo?motivo(m):'';
    return `<button class="mazzo-voce${no?' no':''}" ${act?`data-act="${act}" data-u="${m.u}"`:'disabled'} ${no?`title="${E(no)}"`:''}><span><b>${E(m.carta.n)}</b>${m.potenziamenti.length?` <span class="tenue piccolo">(${E(m.potenziamenti.join(', '))})</span>`:''}<br><span class="piccolo tenue">${E(m.carta.a||'')}${m.carta.b?' / '+E(m.carta.b):''}</span></span><span class="piccolo tenue">${E(m.origine)}</span></button>`;}).join('')}</div>`;
}
function vScelta(c){
  const p=sceltaInSospeso(c.s);if(!p)return '';
  if(p.tipo==='sostituisci')return `<div class="riquadro pila"><p class="avviso">${E(p.testo)}</p><p>Nuova carta: ${cartaMini(p.carta)}</p>${vMazzo(c.s,'sost')}</div>`;
  if(p.tipo==='affina')return `<div class="riquadro pila"><p class="avviso">${E(p.testo)}</p>${btn('affina-fine','Ho finito di togliere','primario')}${vMazzo(c.s,'affina',m=>cartaTogliibile(c.s,m.u))}</div>`;
  if(p.tipo==='maestria')return `<div class="riquadro pila"><p class="avviso">${E(p.testo)}</p>
    <div class="segmenti">${p.potenziamenti.map(x=>`<button data-act="pot" data-p="${E(x)}" aria-pressed="${c.pot===x}">${E(x)}</button>`).join('')}</div>
    ${vMazzo(c.s,'maestria',m=>m.potenziamenti.length>=3?'già 3 potenziamenti':'')}</div>`;
  return '';
}
function vCresc(){
  const n=S.cfg.n,L=S.cfg.L;for(let i=0;i<n;i++)crescPosto(i);
  if(S.attivoC>=n)S.attivoC=0;
  const c=S.cresc[S.attivoC],b=baseDa(S.cfg.A[S.attivoC]),tutti=Array.from({length:n},(_,i)=>prontaC(S.cresc[i])).every(Boolean);
  const chips=Array.from({length:n},(_,i)=>{const ci=S.cresc[i],bi=baseDa(S.cfg.A[i]);
    return `<button class="chip${i===S.attivoC?' attivo':''}${prontaC(ci)?' pronto':''}" data-act="pg-c" data-i="${i}">${E(bi.breve)} <span class="st">${prontaC(ci)?'pronto ✓':'liv. '+ci.s.level+'/'+L}</span></button>`;}).join('');
  let corpo='';
  const salvata=salvate()[chiaveScheda(chiaveBase(b),L)];
  if(c.modo==='consigliato'){
    const R=riepilogoScheda(c.s);
    corpo=`<div class="riquadro pila"><p>Percorso consigliato fino al livello ${L}: è quello che usa anche l'IA.</p>
      <ol class="registro">${R.nodi.map(x=>`<li>Liv. ${x.livello}: ${E(x.nome)}</li>`).join('')||'<li>Livello 1: solo le carte d\'ingresso</li>'}</ol>
      ${btn('mazzo','Vedi il mazzo ('+R.mazzo.length+' carte)','piccolo')}</div>`;
  }else{
    const p=sceltaInSospeso(c.s),pronto=prontaC(c);
    corpo=`<div class="riquadro pila">
      <div class="riga"><b>Livello ${c.s.level} di ${L}</b><span class="spazio"></span>${pronto?'<span class="stato-pronto">Pronto ✓</span>':''}</div>
      <div class="riga">${btn('indietro-nodo','↶ Torna indietro','piccolo',c.storia.length?'':'disabled')}${btn('ricomincia','Ricomincia','piccolo')}${btn('mazzo','Mazzo ('+c.s.deck.length+')','piccolo')}</div>
      ${c.s.taken.length?`<p class="piccolo tenue">Presi: ${c.s.taken.map(t=>E(t.label)).join(' · ')}</p>`:''}</div>
      ${avviso()}${p?vScelta(c):''}
      ${!p&&!pronto?vNodiDisponibili(c.s):''}`;
  }
  return `<div class="pila">
  <div class="riga">${btn('vai-prep','‹ Indietro','piccolo')}<h2>Crescita · livello ${L}</h2></div>
  <div class="squadra-chips">${chips}</div>
  <div class="riquadro pila">
    <div><b>${E(b.nome)}</b><br><span class="piccolo tenue">${E(b.fazione)} · ${E(rete(b.fz).PROF[b.bi].short)}</span></div>
    <div class="segmenti" role="group" aria-label="Come crescere">
      <button data-act="modo" data-m="consigliato" aria-pressed="${c.modo==='consigliato'}">Percorso consigliato</button>
      <button data-act="modo" data-m="manuale" aria-pressed="${c.modo==='manuale'}">Scelgo io</button></div>
    ${c.modo==='manuale'&&salvata&&JSON.stringify(salvata)!==JSON.stringify(c.s)?btn('riprendi','Usa la mia ultima crescita salvata','piccolo'):''}
  </div>
  ${corpo}
  </div>${barra(btn('inizia',tutti?'Inizia lo scontro':'Finisci la crescita di tutti','primario',tutti?'':'disabled'))}`;
}
function vNodiDisponibili(s){
  const L=nodiDisponibili(s);if(!L.length)return `<p class="avviso male">Nessun nodo disponibile.</p>`;
  const per={};L.forEach(n=>(per[n.nomeRegione]=per[n.nomeRegione]||[]).push(n));
  return `<p class="piccolo tenue">Scegli il nodo per il livello ${s.level+1}.</p>`+Object.entries(per).map(([r,ns])=>`<section class="gruppo-nodi"><h3>${E(r)}</h3>${ns.map(vNodo).join('')}</section>`).join('');
}

/* ---------- SCONTRO ---------- */
const miei=()=>S.G.fs.filter(F=>F.team==='A'&&!F.isPet&&F.pf>0);
const piano=id=>S.piani[id]||(S.piani[id]={move:null,ci:null,t:null});
const deciso=F=>S.ia[F.id]||piano(F.id).ci!=null;
const sigle=F=>F.isPet?(F.kind==='torretta'?'T':'⚙'):F.name.replace(/[^A-Za-zÀ-ú0-9 ]/g,'').split(' ').map((w,i)=>i?w.replace(/\D/g,''):w.slice(0,2)).join('');
const colSq=t=>`var(--squadra-${t})`;

function vGriglia(opt={}){
  const G=S.G,C=36,Wd=W*C,Hd=H*C,F=opt.F,p=F?piano(F.id):null,parts=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const o=G.obs.get(key(x,y));
    parts.push(`<rect class="g-cella" x="${x*C}" y="${y*C}" width="${C}" height="${C}" data-act="cella" data-x="${x}" data-y="${y}"/>`);
    if(o)parts.push(`<rect class="${o==='m'?'g-muro':'g-cassa'}" x="${x*C+(o==='m'?0:4)}" y="${y*C+(o==='m'?0:4)}" width="${o==='m'?C:C-8}" height="${o==='m'?C:C-8}" rx="${o==='m'?0:3}" pointer-events="none"/>`);}
  let tgtIds=new Set(),cura=false;
  if(opt.raggiungibili)for(const k of opt.raggiungibili.keys()){const[x,y]=k.split(',').map(Number);parts.push(`<rect class="g-raggiungibile" x="${x*C+2}" y="${y*C+2}" width="${C-4}" height="${C-4}" rx="4" pointer-events="none"/>`);}
  if(opt.bersagli){opt.bersagli.list.forEach(o=>tgtIds.add(o.id));cura=opt.bersagli.kind==='heal';}
  if(p&&p.move&&RULES.movSim){const pts=[[F.x,F.y],...percorso(G,F,p.move)];if(pts.length>1)parts.push(`<polyline class="g-freccia" points="${pts.map(([x,y])=>`${x*C+C/2},${y*C+C/2}`).join(' ')}" stroke="var(--ottone)" stroke-dasharray="2 4" pointer-events="none"/>`);}
  if(p&&p.move)parts.push(`<rect class="g-meta" x="${p.move[0]*C+2}" y="${p.move[1]*C+2}" width="${C-4}" height="${C-4}" rx="5" pointer-events="none"/>`);
  // frecce dell'ultimo scambio
  if(opt.frecce){(opt.mosse||[]).forEach(m=>parts.push(freccia(m.a,m.b,colSq(m.team),C,'4 4')));opt.frecce.forEach(a=>parts.push(freccia(a.a,a.b,a.kind==='heal'||a.kind==='repair'?'var(--vinta)':colSq(a.team),C,'')));}
  G.fs.filter(o=>o.pf>0).forEach(o=>{const cx=o.x*C+C/2,cy=o.y*C+C/2,r=o.isPet?11:14,fr=o.pf/o.pfMax;
    const sel=(F&&o.id===F.id)||(opt.collisione&&opt.collisione.some(c=>c.id===o.id)),tg=tgtIds.has(o.id),tsel=tg&&p&&p.t===o.id;
    parts.push(`<g class="g-pedina toccabile" data-act="pedina" data-id="${o.id}" role="button" aria-label="${E(o.name)}">
      ${sel?`<circle class="g-scelto" cx="${cx}" cy="${cy}" r="${r+3}"/>`:''}
      ${tg?`<circle class="g-bersaglio${cura?' cura':''}${tsel?' scelto':''}" cx="${cx}" cy="${cy}" r="${r+4}"/>`:''}
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${colSq(o.team)}" stroke="var(--el-${o.el})" stroke-width="3"/>
      <text x="${cx}" y="${cy-1}">${E(sigle(o))}</text>
      <rect class="g-pf-fondo" x="${o.x*C+4}" y="${o.y*C+C-6}" width="${C-8}" height="4" rx="2"/>
      <rect x="${o.x*C+4}" y="${o.y*C+C-6}" width="${Math.max(0,(C-8)*fr)}" height="4" rx="2" fill="${fr>.5?'var(--vinta)':fr>.25?'var(--retta)':'var(--persa)'}"/></g>`);});
  // fantasmi dei movimenti pianificati
  if(!opt.frecce)miei().forEach(o=>{const q=S.piani[o.id];if(q&&q.move&&!S.ia[o.id])parts.push(`<circle class="g-fantasma" cx="${q.move[0]*C+C/2}" cy="${q.move[1]*C+C/2}" r="14" fill="${colSq('A')}" pointer-events="none"/>`);});
  return `<svg class="griglia" viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="Campo di battaglia">
    <defs>${['A','B'].map(t=>`<marker id="pt${t}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${colSq(t)}"/></marker>`).join('')}<marker id="ptC" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--vinta)"/></marker></defs>
    ${parts.join('')}</svg>`;
}
function freccia(a,b,col,C,dash){if(a[0]===b[0]&&a[1]===b[1])return '';const m=col.includes('vinta')?'C':col.includes('-A')?'A':'B';
  return `<line class="g-freccia" x1="${a[0]*C+C/2}" y1="${a[1]*C+C/2}" x2="${b[0]*C+C/2}" y2="${b[1]*C+C/2}" stroke="${col}" ${dash?`stroke-dasharray="${dash}"`:''} marker-end="url(#pt${m})" pointer-events="none"/>`;}

function vCarta(F,d,i,p){
  const c=d.c,mot=motivoCartaNonGiocabile(S.G,F,d,p.move),scelta=p.ci===i,fz=F.fz;
  let piede='';
  if(c.zav)piede='Zavorra';
  else if(c.lv)piede=`Tecnica ${E(c.lv)}${c.seq?' · '+E(c.seq):''}${c.lv==='Suprema'?' · 3 '+E(parola(fz,'flusso')):''}`;
  else if(c.post)piede='Postura';
  else if(c.s)piede=`${fz==='dono'?'Sigillo':'Pezzo'}: ${E(c.s)}`;
  if(c.tr)piede+=' · Trasmutazione';
  if(d.mods.length)piede+=' · '+E(d.mods.join(', '));
  return `<button class="carta${c.zav?' zavorra':''}${scelta?' scelta':''}${mot?' no':''}" data-act="carta" data-i="${i}" aria-pressed="${scelta}">
    <div class="testa"><b>${E(c.n)}</b><span class="num">⚡${velOf(F,d)} · ${costOf(d,F)}st</span></div>
    ${c.a?`<div class="meta"><small>${c.b?'Attacco':'Effetto'}</small>${rpsIco(c.a)} ${E(c.a)}</div>`:''}
    ${c.b?`<div class="meta"><small>Difesa</small>${rpsIco(c.b)} ${E(c.b)}</div>`:''}
    <div class="piede">${piede}</div>${mot?`<div class="perche">${E(mot)}</div>`:''}</button>`;
}
function infoPg(F,breve){
  const sn=istantanea(S.G).find(x=>x.id===F.id)||{stati:[]};const fr=Math.max(0,F.pf)/F.pfMax;
  const ing=ingTxt(F);
  return `<div class="pila" style="gap:6px">
    <div class="riga"><b class="t${F.team}">${E(F.name)}</b><span class="etichetta" style="color:var(--el-${F.el})">${E(F.R.EL[F.el]?F.R.EL[F.el].name:F.el)}</span><span class="spazio"></span><span class="num piccolo">${Math.max(0,F.pf)}/${F.pfMax} PF</span></div>
    <div class="barra-pf"><i style="width:${fr*100}%;background:${fr>.5?'var(--vinta)':fr>.25?'var(--retta)':'var(--persa)'}"></i></div>
    ${F.isPet?`<p class="statline">${E(ing)}</p>`:`<p class="statline">Stamina ${F.st}/${F.stMax}${breve?'':` (questo scambio ${stPlan(S.G,F)})`} · ${E(parola(F.fz,'flusso'))} ${F.fl}/${F.flMax} · ${F.fz==='dono'?'Catena':'Banco'}: ${F.chain.length?E(F.chain.join(', ')):'vuoto'}</p>
    ${ing?`<p class="statline">${E(ing)}</p>`:''}`}
    ${sn.stati.length||F.post.length?`<div class="stati">${F.post.map(x=>`<span>Postura: ${E(x)}</span>`).join('')}${sn.stati.map(x=>`<span>${E(x)}</span>`).join('')}</div>`:''}
  </div>`;
}
function vScontro(){
  const G=S.G,M=miei();
  if(!S.attivo||!M.find(F=>F.id===S.attivo))S.attivo=M[0]?M[0].id:null;
  const F=M.find(F=>F.id===S.attivo),p=F?piano(F.id):null,ia=F&&S.ia[F.id];
  let ragg=null,bers=null,pannello='';
  if(F&&!ia){
    ragg=caselleRaggiungibili(G,F);
    const d=p.ci!=null?F.hand[p.ci]:null;
    if(d)bers=bersagliCarta(G,F,d,p.move);
    const resto=stPlan(G,F)-costoMovimento(G,F,p.move)-(d?costOf(d,F):0);
    let riga='';
    if(d&&bers){if(bers.kind==='auto')riga=`<p class="piccolo tenue">Bersaglio: ${E(bers.txt)}</p>`;
      else if(!bers.list.length)riga=`<p class="avviso">Nessun ${bers.kind==='atk'?'nemico':'alleato'} a portata ${p.move?'dalla casella scelta':'da qui'}: la carta servirà solo a difenderti.</p>`;
      else riga=`<div class="riga"><span class="piccolo tenue">Bersaglio:</span>${bers.list.map(o=>`<button class="btn piccolo${p.t===o.id?' scelto':''}" data-act="bersaglio" data-id="${o.id}"><span class="t${o.team}">${E(o.name)}</span> ${Math.max(0,o.pf)}PF</button>`).join('')}</div>`;}
    pannello=`${infoPg(F)}
      <div class="riga piccolo"><span>${p.move?`Movimento: ${costoMovimento(G,F,p.move)} stamina`:'Tocca una casella verde per muoverti (o resta fermo)'}</span><span class="spazio"></span><span class="num">resta ${resto}</span></div>
      <div class="mano" role="listbox" aria-label="Carte in mano">${F.hand.map((d,i)=>vCarta(F,d,i,p)).join('')}</div>
      ${riga}`;
  }else if(F&&ia){pannello=`${infoPg(F)}<p class="avviso">Questo personaggio lo muove l'IA. Togli la spunta per tornare a comandarlo.</p>`;}
  const chips=M.map(o=>`<button class="chip${o.id===S.attivo?' attivo':''}${deciso(o)?' pronto':''}" data-act="pg" data-id="${o.id}">${E(o.name)} <span class="st">${S.ia[o.id]?'IA':deciso(o)?'pronto':'da decidere'}</span></button>`).join('');
  const nonDecisi=M.filter(o=>!deciso(o));
  return `<div class="pila" style="gap:10px">
    <div class="riga"><b>Scambio ${G.n+1}</b><span class="tenue piccolo">${E(MAPS[G.map].name)}</span><span class="spazio"></span>${S.ultimo?btn('rivedi','Ultimo scambio','piccolo'):''}${btn('menu-scontro','Menu','piccolo')}</div>
    ${vGriglia({F:ia?null:F,raggiungibili:ragg,bersagli:bers&&bers.list?bers:null})}
    <div class="squadra-chips">${chips}</div>
    ${F?`<div class="riquadro pila" style="gap:8px">${pannello}
      <label class="riga piccolo"><input type="checkbox" data-act="ia" ${ia?'checked':''}> Lascia decidere all'IA per ${E(F.name)}</label></div>`:''}
    <p class="piccolo tenue">Tocca una pedina per vedere com'è messa. La linea tratteggiata è il percorso che farai.</p>
  </div>${barra(btn('risolvi',nonDecisi.length?`Risolvi (${nonDecisi.map(o=>E(o.name)).join(', ')}: decide l'IA)`:'Risolvi lo Scambio','primario'))}`;
}

/* ---------- FOGLI (pannelli dal basso) ---------- */
function vFoglio(){
  const f=S.foglio;let html='';
  if(f.tipo==='scambio'){const r=f.ris;
    const cs=[...r.cards].sort((a,b)=>b.vel-a.vel);
    html=`<h2>Scambio ${r.n}</h2>
      <div class="rivelate">${cs.map(c=>`<div class="rivelata"><span class="vel">${c.vel}</span><div><b class="t${c.team}">${E(c.name)}</b> ${c.card?`gioca <i>${E(c.card.c.n)}</i>`:'nessuna carta'}${c.tgt?` → ${E(c.tgt)}`:''}${c.cost?` <span class="tenue piccolo">(−${c.cost} st)</span>`:''}${c.adj&&c.adj.length?`<br><span class="piccolo tenue">${E(c.adj.join(' · '))}</span>`:''}</div></div>`).join('')}</div>
      ${vGriglia({frecce:r.arrows,mosse:r.moves})}
      <h3>Cosa è successo</h3><ol class="registro">${r.lines.map(l=>`<li>${l}</li>`).join('')}</ol>
      ${btn('chiudi-foglio',S.G.over?'Vedi il risultato':'Prossimo Scambio','primario grande')}`;}
  else if(f.tipo==='collisione'){const G=S.G;
    html=`<h2>Collisione!</h2><p class="piccolo">Durante il movimento ${f.chi.length>1?'questi personaggi hanno':'il tuo personaggio ha'} incontrato un avversario. Nessuno sa cosa sceglie l'altro.</p>
      <ul class="registro piccolo"><li><b>Prosegui</b>: se l'altro resta, ti fa un attacco di opportunità; se prosegue anche lui, vi scansate pagando 1 stamina a testa.</li><li><b>Resta</b>: se l'altro prosegue gli fai un attacco di opportunità (costa 1 stamina) e poi completate il movimento; se resta anche lui, vi fermate qui ingaggiati.</li></ul>
      ${vGriglia({collisione:f.chi})}
      ${f.chi.map(c=>`<div class="riquadro pila" style="gap:8px"><div><b class="tA">${E(c.nome)}</b> incontra ${c.contro.map(id=>{const o=personaggio(G,id);return `<b class="t${o.team}">${E(o.name)}</b>`;}).join(' e ')} <span class="piccolo tenue">· stamina ${c.stamina}</span></div>
        <div class="segmenti" role="group"><button data-act="scelta-coll" data-id="${c.id}" data-v="prosegui" aria-pressed="${f.scelte[c.id]==='prosegui'}" ${c.stamina<1?'disabled':''}>Prosegui</button><button data-act="scelta-coll" data-id="${c.id}" data-v="resta" aria-pressed="${f.scelte[c.id]==='resta'}">Resta</button></div></div>`).join('')}
      ${btn('continua-coll',f.chi.every(c=>f.scelte[c.id])?'Continua il movimento':'Scegli per tutti','primario grande',f.chi.every(c=>f.scelte[c.id])?'':'disabled')}`;}
  else if(f.tipo==='info'){const o=S.G.fs.find(x=>x.id===f.id);
    html=`${infoPg(o,true)}${o.isPet?'':`<p class="piccolo tenue">${o.team==='A'?'Tuo personaggio':'Avversario'} · ${E(o.R.nome)} · ${E(o.P.short)} · livello ${o.L}</p>`}${btn('chiudi-foglio','Chiudi','grande')}`;}
  else if(f.tipo==='menu'){html=`<h2>Menu</h2>${btn('tutti-ia','Fai giocare l\'IA per tutta la mia squadra','grande')}${btn('arrenditi','Abbandona la partita','grande')}<a class="btn grande" style="display:flex;align-items:center;justify-content:center;text-decoration:none" href="guida.html" target="_blank" rel="noopener">Apri la guida</a>${btn('chiudi-foglio','Torna allo scontro','primario grande')}`;}
  else if(f.tipo==='mazzo'){const c=S.cresc[S.attivoC],R=riepilogoScheda(c.s);
    html=`<h2>Mazzo · ${R.mazzo.length} carte</h2><p class="piccolo tenue">${E(R.base)}${R.secondo?' · '+E(R.secondo):''}${R.terzo?' · '+E(R.terzo):''}</p>${vMazzo(c.s,null)}${btn('chiudi-foglio','Chiudi','primario grande')}`;}
  return `<div class="foglio" data-act="sfondo-foglio"><div class="dentro" role="dialog" aria-modal="true">${html}</div></div>`;
}

/* ---------- FINE ---------- */
function vFine(){
  const G=S.G,v=G.over,tit=v==='A'?'Hai vinto':v==='B'?'Ha vinto l\'IA':'Pareggio';
  const righe=G.fs.filter(F=>!F.isPet).map(F=>`<tr><td><b class="t${F.team}">${E(F.name)}</b></td><td class="num">${Math.max(0,F.pf)}/${F.pfMax}</td><td class="num">${F.stats.dmg}</td><td class="num">${F.stats.heal}</td></tr>`).join('');
  return `<div class="pila">
    <div class="home-testa pila"><span class="sigillo">Fine dopo ${G.n} scambi</span><h1>${tit}</h1></div>
    <div class="riquadro" style="overflow-x:auto"><table class="tabella"><thead><tr><th>Personaggio</th><th>PF</th><th>Danni</th><th>Cure</th></tr></thead><tbody>${righe}</tbody></table></div>
    <p class="piccolo tenue">La partita è salvata in “Partite giocate”: da lì puoi esportarla per il bilanciamento.</p>
    ${btn('rivincita','Rivincita (stesse squadre)','primario grande')}${btn('vai-prep','Nuova partita','grande')}${btn('vai-home','Torna all\'inizio','grande')}
  </div>`;
}
function salvaRegistro(){
  if(S.registroSalvato)return;S.registroSalvato=true;const G=S.G;
  const voce={data:new Date().toISOString(),versione:VERSIONE,formato:S.cfg.n+'v'+S.cfg.n,movimento:S.cfg.mov,livello:S.cfg.L,mappa:G.map,esito:G.over,scambi:G.n,
    squadre:G.fs.filter(F=>!F.isPet).map(F=>({squadra:F.team,fazione:F.fz,base:F.R.BUILDS[F.bi].name,nodi:F.taken.map(t=>t.id),pf:Math.max(0,F.pf),pfMax:F.pfMax,danni:F.stats.dmg,cure:F.stats.heal,ia:F.team==='B'||!!S.ia[F.id]}))};
  const r=mem.get('fd-registro',[]);r.unshift(voce);mem.set('fd-registro',r.slice(0,300));
}

/* ---------- REGISTRO ---------- */
function vRegistro(){
  const r=mem.get('fd-registro',[]);
  return `<div class="pila">
    <div class="riga">${btn('vai-home','‹ Indietro','piccolo')}<h2>Partite giocate</h2></div>
    ${r.length?`<div class="riga">${btn('esporta','Scarica il file (JSON)','piccolo')}${btn('copia','Copia negli appunti','piccolo')}</div>
      <p class="piccolo tenue">Manda il file a Nico: serve per il bilanciamento.</p>${avviso()}
      <div class="riquadro" style="overflow-x:auto"><table class="tabella"><thead><tr><th>Data</th><th>Formato</th><th>Esito</th><th>Squadre</th></tr></thead><tbody>
      ${r.map(v=>`<tr><td class="num">${E(v.data.slice(0,10))}</td><td>${E(v.formato)} · L${v.livello}</td><td>${v.esito==='A'?'vinta':v.esito==='B'?'persa':'pari'} in ${v.scambi}</td><td class="piccolo">${['A','B'].map(t=>`<span class="t${t}">${v.squadre.filter(s=>s.squadra===t).map(s=>E(s.base.split(' (')[0])).join(', ')}</span>`).join(' vs ')}</td></tr>`).join('')}
      </tbody></table></div>`:'<p class="tenue">Ancora nessuna partita.</p>'}
  </div>`;
}

/* ============================================================
   AZIONI
   ============================================================ */
function avviaPartita(){
  const n=S.cfg.n,L=S.cfg.L;
  const A=Array.from({length:n},(_,i)=>{const b=baseDa(S.cfg.A[i]);return{fz:b.fz,bi:b.bi,L,scheda:JSON.parse(JSON.stringify(S.cresc[i].s))};});
  const B=Array.from({length:n},(_,i)=>{const b=baseDa(S.cfg.B[i]);return{fz:b.fz,bi:b.bi,L};});
  RULES.movSim=S.cfg.mov!=='turni';
  S.G=nuovaPartita({map:S.cfg.map,A,B});S.piani={};S.ia={};S.attivo=null;S.ultimo=null;S.foglio=null;S.registroSalvato=false;S.schermo='scontro';
}
function risolvi(){
  const G=S.G,piani={};
  G.fs.forEach(F=>{if(F.isPet||F.pf<=0)return;
    if(F.team==='B'||S.ia[F.id]){piani[F.id]={ai:true};return;}
    const p=S.piani[F.id];piani[F.id]=p&&p.ci!=null?{move:p.move,ci:p.ci,t:p.t}:{ai:true};});
  S.piani={};dopoPasso(risolviScambio(G,piani));
}
function dopoPasso(r){
  if(r.attesa){S.foglio={tipo:'collisione',chi:r.attesa.chi,scelte:{}};return;}
  S.ultimo=r;S.foglio={tipo:'scambio',ris:r};if(S.G.over)salvaRegistro();
}
function rivalidaCarta(F){const p=piano(F.id);if(p.ci==null)return;const d=F.hand[p.ci];
  if(!d||motivoCartaNonGiocabile(S.G,F,d,p.move)){p.ci=null;p.t=null;return;}
  const b=bersagliCarta(S.G,F,d,p.move);if(!b.list){p.t=null;return;}
  if(!b.list.some(o=>o.id===p.t))p.t=b.list.length===1?b.list[0].id:null;}
function scaricaFile(nome,testo){
  try{const u=URL.createObjectURL(new Blob([testo],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=nome;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);}
  catch(e){S.errore='Non riesco a scaricare il file: usa "Copia negli appunti".';}
}
function prova(fn){S.errore='';try{fn();}catch(e){S.errore=e.message||String(e);}}

const AZ={
  'vai-home':()=>{S.schermo='home';S.foglio=null;},
  'vai-prep':()=>{S.schermo='prep';S.foglio=null;},
  'vai-registro':()=>{S.errore='';S.schermo='registro';},
  formato:el=>{S.cfg.n=+el.dataset.n;salvaCfg();},
  movimento:el=>{S.cfg.mov=el.dataset.m;salvaCfg();},
  liv:el=>{S.cfg.L=Math.max(1,Math.min(20,S.cfg.L+(+el.dataset.d)));salvaCfg();},
  casuale:el=>{const l=el.dataset.lato;for(let i=0;i<4;i++)S.cfg[l][i]=chiaveBase(casuale(BASI));salvaCfg();},
  'vai-cresc':()=>{S.schermo='cresc';S.attivoC=0;S.errore='';},
  'pg-c':el=>{S.attivoC=+el.dataset.i;S.errore='';},
  modo:el=>{const c=S.cresc[S.attivoC],m=el.dataset.m;if(c.modo===m)return;const b=baseDa(S.cfg.A[S.attivoC]);c.modo=m;c.storia=[];S.errore='';
    c.s=m==='consigliato'?schedaConsigliata(b.fz,b.bi,S.cfg.L):nuovaScheda(b.fz,b.bi);},
  riprendi:()=>{const c=S.cresc[S.attivoC],b=baseDa(S.cfg.A[S.attivoC]),s=salvate()[chiaveScheda(chiaveBase(b),S.cfg.L)];if(s){c.storia.push(JSON.stringify(c.s));c.s=JSON.parse(JSON.stringify(s));}},
  prendi:el=>{const c=S.cresc[S.attivoC],prima=JSON.stringify(c.s);prova(()=>{prendiNodo(c.s,el.dataset.id,el.dataset.opt!=null?+el.dataset.opt:undefined);c.storia.push(prima);salvaScheda(c);});},
  sost:el=>{const c=S.cresc[S.attivoC];prova(()=>{sostituisciCarta(c.s,+el.dataset.u);salvaScheda(c);});},
  affina:el=>{const c=S.cresc[S.attivoC];prova(()=>{affinaTogli(c.s,+el.dataset.u);salvaScheda(c);});},
  'affina-fine':()=>{const c=S.cresc[S.attivoC];affinaFine(c.s);salvaScheda(c);},
  pot:el=>{S.cresc[S.attivoC].pot=el.dataset.p;},
  maestria:el=>{const c=S.cresc[S.attivoC];prova(()=>{maestriaApplica(c.s,+el.dataset.u,c.pot);salvaScheda(c);});},
  'indietro-nodo':()=>{const c=S.cresc[S.attivoC];if(c.storia.length)c.s=JSON.parse(c.storia.pop());S.errore='';},
  ricomincia:()=>{const c=S.cresc[S.attivoC],b=baseDa(S.cfg.A[S.attivoC]);c.storia.push(JSON.stringify(c.s));c.s=nuovaScheda(b.fz,b.bi);S.errore='';},
  mazzo:()=>{S.foglio={tipo:'mazzo'};},
  inizia:()=>{if(Array.from({length:S.cfg.n},(_,i)=>prontaC(S.cresc[i])).every(Boolean))avviaPartita();},
  pg:el=>{S.attivo=el.dataset.id;},
  carta:el=>{const F=personaggio(S.G,S.attivo),p=piano(F.id),i=+el.dataset.i;
    if(p.ci===i){p.ci=null;p.t=null;return;}const d=F.hand[i];if(motivoCartaNonGiocabile(S.G,F,d,p.move))return;
    p.ci=i;p.t=null;const b=bersagliCarta(S.G,F,d,p.move);if(b.list&&b.list.length===1)p.t=b.list[0].id;},
  bersaglio:el=>{const p=piano(S.attivo);p.t=p.t===el.dataset.id?null:el.dataset.id;},
  cella:el=>{const F=personaggio(S.G,S.attivo);if(!F||S.ia[F.id]||F.pf<=0)return;const x=+el.dataset.x,y=+el.dataset.y,p=piano(F.id);
    if(x===F.x&&y===F.y){p.move=null;rivalidaCarta(F);return;}
    if(!caselleRaggiungibili(S.G,F).has(key(x,y)))return;p.move=(p.move&&p.move[0]===x&&p.move[1]===y)?null:[x,y];rivalidaCarta(F);},
  pedina:el=>{const id=el.dataset.id,G=S.G,F=personaggio(G,S.attivo),o=personaggio(G,id);
    if(F&&!S.ia[F.id]){const p=piano(F.id);
      if(id===F.id){p.move=null;rivalidaCarta(F);return;}
      if(p.ci!=null){const b=bersagliCarta(G,F,F.hand[p.ci],p.move);if(b.list&&b.list.some(x=>x.id===id)){p.t=id;return;}}}
    if(o.team==='A'&&!o.isPet&&o.pf>0&&id!==S.attivo){S.attivo=id;return;}
    S.foglio={tipo:'info',id};},
  ia:el=>{const F=personaggio(S.G,S.attivo);if(!F)return;S.ia[F.id]=!S.ia[F.id];},
  risolvi:()=>risolvi(),
  'scelta-coll':el=>{S.foglio.scelte[el.dataset.id]=el.dataset.v;},
  'continua-coll':()=>{dopoPasso(continuaScambio(S.G,S.foglio.scelte));},
  rivedi:()=>{S.foglio={tipo:'scambio',ris:S.ultimo};},
  'menu-scontro':()=>{S.foglio={tipo:'menu'};},
  'tutti-ia':()=>{miei().forEach(F=>S.ia[F.id]=true);S.foglio=null;},
  arrenditi:()=>{S.G.over='B';salvaRegistro();S.foglio=null;S.schermo='fine';},
  'chiudi-foglio':()=>{const f=S.foglio;S.foglio=null;if(f&&f.tipo==='scambio'&&S.G&&S.G.over)S.schermo='fine';},
  'sfondo-foglio':(el,ev)=>{if(ev.target===el&&S.foglio&&S.foglio.tipo!=='collisione'&&!(S.foglio.tipo==='scambio'&&S.G.over))S.foglio=null;else return false;},
  rivincita:()=>avviaPartita(),
  esporta:()=>scaricaFile('ferro-e-dono-partite.json',JSON.stringify(mem.get('fd-registro',[]),null,1)),
  copia:()=>{const t=JSON.stringify(mem.get('fd-registro',[]));
    if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>{S.errore='';alertBene('Copiato.');},()=>{S.errore='Non riesco a copiare: usa "Scarica il file".';render();});},
};
function alertBene(t){const el=document.createElement('p');el.className='avviso bene';el.textContent=t;$app.querySelector('.pila')?.prepend(el);setTimeout(()=>el.remove(),2500);}

$app.addEventListener('click',ev=>{
  const el=ev.target.closest('[data-act]');if(!el||el.tagName==='SELECT'||el.tagName==='INPUT')return;
  const f=AZ[el.dataset.act];if(!f)return;
  if(f(el,ev)===false)return;render();
});
$app.addEventListener('change',ev=>{
  const el=ev.target;
  if(el.dataset.act==='base'){S.cfg[el.dataset.lato][+el.dataset.i]=el.value;salvaCfg();render();}
  else if(el.dataset.act==='mappa'){S.cfg.map=el.value;salvaCfg();}
  else if(el.dataset.act==='ia'){AZ.ia();render();}
});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&S.foglio&&S.foglio.tipo!=='collisione'&&!(S.foglio.tipo==='scambio'&&S.G&&S.G.over)){S.foglio=null;render();}});
window.addEventListener('beforeunload',ev=>{if(S.schermo==='scontro'&&S.G&&!S.G.over){ev.preventDefault();ev.returnValue='';}});

if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
render();
})();
