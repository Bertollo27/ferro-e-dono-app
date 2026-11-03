/* Ferro & Dono — MOTORE DELLE REGOLE unico per Dono e Ingegno.
   Unisce i motori dei due simulatori (Visualizzatore del Dono e Ragnatela dell'Ingegno). Non contiene valori di bilanciamento:
   carte e nodi sono in dati-dono.js e dati-ingegno.js, le regole numeriche in RULES qui sotto.
   Ogni personaggio porta la sua Ragnatela (F.R) e la sua fazione (F.fz = 'dono' | 'ingegno'). */
const RETI={dono:DONO,ingegno:INGEGNO};
let N,EL,ORDER,WEAP,XB,BUILDS,PROF,UNIV,TYPES,TREE,LMAX=20,MODS,AIDESC,RETE=null;
function usaRete(R){RETE=R;({N,EL,ORDER,WEAP,XB,BUILDS,PROF,UNIV,TYPES,TREE,MODS,AIDESC}=R);LMAX=R.LMAX;}
function conRete(R,fn){const p=RETE;usaRete(R);try{return fn();}finally{if(p)usaRete(p);}}
usaRete(DONO);
const nomeStato=(F,k)=>(F.stxNomi&&F.stxNomi[k])||(F.R?F.R.ST_TXT[k]:k)||k;
let st=null, hist=[];
const regCount=(s,r)=>s.taken.filter(t=>N[t.id].reg===r).length;
const opened=s=>[s.el,s.second,s.third].filter(Boolean);
const nextLvl=()=>st?st.level+1:1;
function newState(el){
  const s={el,second:null,third:null,level:1,taken:[],deck:[],pending:null,uid:0,log:[]};
  EL[el].ingr.forEach(g=>{for(let i=0;i<g.q;i++)s.deck.push(inst(s,g.c,'Ingresso'));});
  UNIV.forEach(g=>{for(let i=0;i<g.q;i++)s.deck.push(inst(s,g.c,'Universale'));});
  return s;
}
function inst(s,c,src){return {u:++s.uid,c,src,mods:[]};}
function snapshot(){}
function check(id,s){ // requisiti: ritorna {ok, why[]} rispetto allo stato s (o null = solo descrizione)
  const n=N[id]; let why=[]; let ok=true;
  const L=s?s.level+1:null;
  if(s){
    if(L>LMAX)return{ok:false,why:['Hai già raggiunto il livello '+LMAX+'.']};
    const times=s.taken.filter(t=>t.id===id).length;
    if(times>=(n.rep||1)){return{ok:false,why:[n.rep?'Già preso 3 volte.':'Già preso.']};}
  }
  const need=(cond,txt)=>{why.push((s?(cond?'✓ ':'✗ '):'• ')+txt); if(s&&!cond)ok=false;};
  if(n.reg==='C'){
    if(id==='C4'){need(s?L>=5:true,'Livello 5 o superiore');if(TREE.top==='puri')need(s?!s.taken.some(t=>N[t.id].ring>=3):true,'Nessun nodo di Anello III o chiave di volta già preso (sono riservati ai puri)');}
    if(id==='C5'){need(s?L>=9:true,'Livello 9 o superiore');need(s?!!s.second:true,'Aver preso Secondo Risveglio');need(s?s.second&&regCount(s,s.second)>=3:true,'3 nodi nel secondo elemento'+(s&&s.second?` (${EL[s.second].name}: ${regCount(s,s.second)})`:''));}
    if(id==='C5'&&s&&!s.second)ok=false;
    if(!why.length)why.push(s?'✓ Sempre accessibile (centro)':'• Sempre accessibile a tutti i Risonanti');
  } else if(n.reg==='X'){
    const a=n.xa,b=n.xb,k=n.xn;
    need(s?regCount(s,a)>=k:true,`${k} nodi in ${EL[a].name}`+(s?` (hai ${regCount(s,a)})`:''));
    need(s?regCount(s,b)>=k:true,`${k} nodi in ${EL[b].name}`+(s?` (hai ${regCount(s,b)})`:''));
    if(!s)why.push('• Elementi vicini sull\'anello: con Secondo Risveglio servono circa 8 scelte, quindi dal livello 9');
  } else {
    const e=n.reg, cnt=s?regCount(s,e):0;
    if(s)need(opened(s).includes(e),`Elemento ${EL[e].name} aperto`+(opened(s).includes(e)?'':' (serve Secondo o Terzo Risveglio)'));
    else why.push(`• Elemento ${EL[e].name} aperto (Ingresso, oppure Secondo/Terzo Risveglio)`);
    if(n.ring===2)need(s?cnt>=3:true,`3 nodi già presi in ${EL[e].name}`+(s?` (hai ${cnt})`:''));
    if(n.ring>=3&&TREE.top==='ingresso')need(s?s.el===e:true,`Solo nell'elemento d'Ingresso`);
    if(n.ring>=3&&TREE.top==='puri')need(s?!s.second:true,`Solo per i puri: nessun secondo elemento aperto`);
    if(n.ring===3)need(s?cnt>=6:true,`6 nodi già presi in ${EL[e].name}`+(s?` (hai ${cnt})`:''));
    if(n.ring===4){need(s?cnt>=8:true,`8 nodi già presi in ${EL[e].name}`+(s?` (hai ${cnt})`:''));
      need(s?!s.taken.some(t=>N[t.id].type==='Chiave'):true,'Nessun\'altra chiave di volta');}
    if(n.ring===1&&!s)why.push('• Anello I: libero appena l\'elemento è aperto');
  }
  if(RETE.id!=='dono'){const v=RETE.voc;why=why.map(w=>w.replace(/Secondo Risveglio/g,v.secondo).replace(/Terzo Risveglio/g,v.terzo).replace(/Elementi/g,v.Elementi).replace(/Elemento/g,v.Elemento).replace(/elemento/g,v.elemento).replace(/Risveglio/g,'Mestiere'));}
  return{ok,why};
}
function nodeOptions(n,s){
  if(n.elOpen){const free=ORDER.filter(e=>!(s?opened(s):[]).includes(e));return free.map(e=>({label:EL[e].name,el:e,cards:[]}));}
  return n.opts||null;
}
function take(id,opt){
  const n=N[id], s=st; snapshot();
  s.level++;
  let label=n.name, cards=[...(n.cards||[])];
  const o=nodeOptions(n,s);
  if(o){const ch=o[opt]; label+=' → '+ch.label; cards=cards.concat(ch.cards||[]);
    if(n.elOpen===2)s.second=ch.el; if(n.elOpen===3)s.third=ch.el;}
  if(n.zav)cards=cards.concat(n.zav);
  s.taken.push({id,opt,lvl:s.level,label});
  s.queue=cards.map(c=>({c,src:id}));
  s.after=n.affina?{kind:'affina',left:2,filter:n.affina}:(id==='C6'?{kind:'maestria'}:null);
  flush();
}
function flush(){ // inserisce le carte; se il mazzo è a 24 chiede quale sostituire
  const s=st;
  while(s.queue&&s.queue.length){
    const q=s.queue[0];
    if(s.deck.length<24){s.deck.push(inst(s,q.c,q.src));s.queue.shift();}
    else{s.pending={kind:'replace',c:q.c,src:q.src};return;}
  }
  s.pending=s.after||null; s.after=null;
}
// segue la lista dei desideri e restituisce i passi davvero presi (con le regole correnti)
function planBuild(b,maxL){const s0=st,h0=hist;hist=[];st=newState(b.el);const out=[];
  for(const step of b.steps){if(st.level>=maxL)break;const [id,opt,target]=step;if(!N[id])continue;if(!check(id,st).ok)continue;
    if(id==='C6'&&target&&!st.deck.some(d=>d.c.n===target&&d.mods.length<3))continue;
    let o=opt;if(N[id].elOpen){o=nodeOptions(N[id],st).findIndex(x=>x.el===opt);if(o<0)continue;}
    take(id,o);if(st.pending&&st.pending.kind==='affina')st.pending=null;
    if(st.pending&&st.pending.kind==='maestria'){const d=st.deck.find(d=>d.c.n===target&&d.mods.length<3)||st.deck[0];d.mods.push(MODS[0]);st.taken[st.taken.length-1].label+=' → '+d.c.n+' (+1 Velocità)';st.pending=null;}
    while(st.pending&&st.pending.kind==='replace'){let i=st.deck.findIndex(d=>d.src==='Universale');if(i<0)i=st.deck.findIndex(d=>d.src==='Ingresso'&&d.c.s==='Jolly');if(i<0)i=st.deck.findIndex(d=>d.src==='Ingresso');if(i<0)i=0;
      const p=st.pending;st.deck.splice(i,1,inst(st,p.c,p.src));st.queue.shift();st.pending=null;flush();}
    if(st.pending&&st.pending.kind==='maestria'){const d=st.deck.find(d=>d.c.n===target&&d.mods.length<3)||st.deck[0];d.mods.push(MODS[0]);st.pending=null;}
    if(st.pending&&st.pending.kind==='affina')st.pending=null;
    out.push(step);}
  const r=st;st=s0;hist=h0;return{state:r,steps:out};}
const esc=t=>String(t??'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
const RPS={Sparo:['🎯','Sparo: Parata e Schivata Rette, Contrattacco Persa'],Colpo:['✊','sasso'],Schivata:['✊','sasso'],Aggiramento:['✋','carta'],Parata:['✋','carta'],Rottura:['✌️','forbici'],Contrattacco:['✌️','forbici']};
function rpsIco(t){const m=(t||'').match(/^(?:[^,;]*?\b)?(Sparo|Colpo|Rottura|Aggiramento|Parata|Schivata|Contrattacco)/);if(!m||/Vinta contro qualsiasi/.test(t))return '';const r=RPS[m[1]];return `<span class="rps" title="${m[1]} = ${r[1]}: ✊ batte ✌️, ✌️ batte ✋, ✋ batte ✊; stesso simbolo = Retta">${r[0]}</span>`;}
const W=14,H=9,CELL=36;
const MAPS={
 aperta:{name:'Campo aperto',obs:[]},
 casse:{name:'Casse sparse (coperture basse)',obs:[[4,2,'c'],[4,6,'c'],[6,4,'c'],[7,4,'c'],[9,2,'c'],[9,6,'c'],[6,0,'c'],[7,8,'c']]},
 vicolo:{name:'Vicolo con muri (bloccano la vista)',obs:[[5,0,'m'],[5,1,'m'],[5,2,'m'],[5,3,'m'],[8,5,'m'],[8,6,'m'],[8,7,'m'],[8,8,'m'],[3,6,'c'],[10,2,'c'],[6,6,'c'],[7,2,'c']]}};
/* REGOLE NUMERICHE COMUNI (dal simulatore dell'Ingegno, che include quelle del Dono; differenze per fazione in dati-*.js: sangue, HK) */
const RULES={guardShot:true,bTrat:true,provoke:true,guard:true,ff:true,logoT:2,jamAlch:false,warD:2,jamGun:2,aiH:5,aiR:6,mArm:0,corrOwn:false,tratD:2,k4:4,trCorr:true,turD:4,plates:false,trIron:true,integK:1.5,petHP:6,petW:10,petMv:2,m1:3,shotK:1.5,petD:4,shotPet:true,occhio:2,telaio:"ferro",interr:'piena2',spirNow:true,stati:true,counter:'risposta',stBase:10,stRec:2,ado:true,v4ado:false,healEng:'self',douse:true,burnFan:true,fanN:1,burnT:'dot3',pureSup:true,earthSmother:true,waterFlow:false,rdCap:5,scale:'both',spirCancel:true,noChain:false,slancio:true,spExp:true,protDmg:true};
const BURN={base:'2 danni per 2 scambi',dot3:'1d4 per 3 scambi',dot3b:'1d4+1 per 3 scambi'};
const canDebt=()=>false;
const stLose=(F,n)=>{F.st=Math.max(Math.min(F.st,0),F.st-n);};
const COUNTER={risposta:'Colpo di risposta (valore della carta)',sbilancia:'Sbilancia l\'attaccante',respinta:'Respinge di 1 casella',lega:'Lega l\'attaccante',nulla:'Solo Spiraglio'};
const INTERR={no:'Nessuna',leggera:'Leggera: se il primo colpo è Persa, la risposta è dimezzata',piena:'Piena: Persa annulla la risposta, Retta la dimezza',piena2:'Piena, ma solo con almeno +2 di Velocità'};
const TRI={Sparo:{Parata:'P',Schivata:'R',Contrattacco:'P'},Colpo:{Parata:'V',Schivata:'R',Contrattacco:'P'},Rottura:{Parata:'P',Schivata:'V',Contrattacco:'R'},
  Aggiramento:{Parata:'R',Schivata:'P',Contrattacco:'V'},Tecnica:{Parata:'R',Schivata:'R',Contrattacco:'P'}};
const OUT={V:'Vinta',R:'Retta',P:'Persa'};
const BCACHE={};
function buildAt(bi,L){const k=RETE.id+':'+bi+':'+L+':'+TREE.top;if(BCACHE[k])return BCACHE[k];const r=planBuild(BUILDS[bi],L).state;BCACHE[k]=r;return r;}
function rngF(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}}
let RND=Math.random;
const roll=(n,m)=>{let s=0;for(let i=0;i<n;i++)s+=1+Math.floor(RND()*m);return s;};
const key=(x,y)=>x+','+y;
const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
const nm=F=>`<b class="t${F.team}">${F.name}</b>`;

/* ---- carte ---- */
const elemOf=(F,d)=>{const NN=F.R.N;return d.src==='Ingresso'?F.el:(d.src&&NN[d.src]?(F.R.ORDER.includes(NN[d.src].reg)?NN[d.src].reg:NN[d.src].fel||null):null);};
const isFire=(F,d)=>{const e=elemOf(F,d);return e==='F'||e==='G';};
const REV={G:'F',M:'J',K:'T',B:'A'};
function velOf(F,d){const c=d.c;if(c.zav)return c.v||0;let v=c.v;
  if(v==null){const m=(c.a||'').match(/Velocità (\d+)/);v=m?+m[1]:(c.lv==='Base'?6:c.lv==='Avanzata'?5:c.lv==='Suprema'?4:3);}
  v+=d.mods.filter(m=>m===MODS[0]).length;if(F.post.includes('Pelle di Roccia'))v-=1;if(F.post.includes('Corazza di Lava'))v-=1;if(F.has('V4')&&/^Schivata/.test(c.b||''))v+=1;if(F.post.includes('Blindatura'))v-=1;if(F.post.includes('Caldaia Rovente'))v-=1;if(F.has('M15'))v-=1;if(F.has('B15'))v-=2;return v;}
function costOf(d,F){const c=d.c;let k=c.c;if(k==null)k=c.lv==='Suprema'?3:c.lv?2:(c.post?1:0);k-=d.mods.filter(m=>m===MODS[2]).length;return Math.max(0,k);}
const sigOk=(h,n)=>h==='Jolly'||h===n;
function tecReady(F,d){const c=d.c;if(!c.lv)return true;
  if(F.has('F15')&&isFire(F,d)&&c.lv!=='Suprema')return true;
  if(c.lv==='Base')return F.chain.length>=1;
  if(c.lv==='Avanzata'){const pool=[...F.chain];return c.seq.split(' + ').every(n=>{const i=pool.findIndex(h=>sigOk(h,n));if(i<0)return false;pool.splice(i,1);return true;});}
  if(F.fl<3||F.chain.length<3)return false;if(RULES.pureSup&&!F.has('C4'))return true;if(RULES.supAny){const pool=[...F.chain];return c.seq.split(' → ').every(n=>{const i=pool.findIndex(h=>sigOk(h,n));if(i<0)return false;pool.splice(i,1);return true;});}return c.seq.split(' → ').every((n,i)=>sigOk(F.chain[i],n));}
const FXC=new Map();
function fxOf(c){if(FXC.has(c))return FXC.get(c);const A=c.a||'';const e={};let m;
  if(c.zav)e.cat='zav';else if(c.post)e.cat='post';
  else if(/^Ripari/.test(A))e.cat='repair';
  else if(/^Piazzi una torretta/.test(A))e.cat='summon';
  else if(/^Ordine all'automa/.test(A))e.cat='command';
  else if(/cur[aeo]|si rialza/.test(A))e.cat='heal';
  else if(/i nemici entro \d caselle devono attaccare te/i.test(A))e.cat='taunt';
  else if(/[Aa]lleati entro \d+ caselle \+2|smettono di essere Esausti|recupera 3 stamina/.test(A))e.cat='buff';
  else if((c.lv||c.tr)&&/\+(\d) riduzione del danno/.test(A))e.cat='self';
  else if(c.lv||c.tr?/\d+d\d+|Trattenut/.test(A):/Sparo|Colpo|Rottura|Aggiramento/.test(A))e.cat='atk';
  else e.cat='none';
  e.range=(m=A.match(/(?:^|\s)(?:distanza|a|cono di|linea di|entro|raggio di) (\d+)(?! PF)/i))?+m[1]:(c.lv&&!/^Colpo/.test(A)?4:1);
  if(e.cat==='heal'&&!/entro/.test(A))e.range=/0 PF|adiacente/.test(A)?(/0 PF/.test(A)?3:1):e.range;
  e.dash=(m=A.match(/movimento di (\d+)/))?+m[1]:0;
  e.ranged=e.range>1&&!e.dash;
  if((m=A.match(/[Aa]rea (\d)x\d/)))e.area={mode:'target',r:+m[1]>=4?2:1};
  else if((m=A.match(/[Tt]utti entro (\d+)/)))e.area={mode:'around',r:+m[1],allies:/alleati compresi/.test(A)};
  else if((m=A.match(/(\d) (?:bersagli|Colpi)/)))e.area={mode:'multi',n:+m[1]};
  else if(/cono|[Ll]inea|attraversi/.test(A))e.area={mode:'target',r:1};
  e.push=(m=A.match(/spinge di (\d)|spinti di (\d)/))?+(m[1]||m[2]):0;
  e.trat=/Trattenut/.test(A);e.provoke=/deve attaccare te/.test(A)&&e.cat==='atk';e.pull=(m=A.match(/tiri il bersaglio di (\d)/))?+m[1]:0;e.slancio=(m=A.match(/Slancio (\d)/))?+m[1]:0;e.attr=/Attraversa/.test(A);e.prono=/Pron/.test(A);e.burn=/Brucia|Sanguina/.test(A);e.slow=/Rallentat/.test(A);e.jam=/Inceppat/.test(A);
  e.rdSelf=(m=A.match(/\+(\d) riduzione del danno/))?+m[1]:0;
  if(e.cat==='repair'){m=A.match(/(\d+)d(\d+)/);e.hd=m?[+m[1],+m[2]]:[0,0];e.hsag='INT';e.hall=/a tutti/.test(A);}
  if(e.cat==='summon')e.range=(m=A.match(/entro (\d)/))?+m[1]:2;
  if(e.cat==='heal'){m=A.match(/(\d+)d(\d+)/);e.hd=m?[+m[1],+m[2]]:[0,0];e.hsag=(m=A.match(/\+ (SAG|INT|FOR|DES)/))?m[1]:null;e.revive=/0 PF/.test(A);e.hall=/[Tt]utti gli alleati|divise/.test(A);e.regen=/per 3 Scambi/.test(A);e.hcost=/perde 2 stamina/.test(A);}
  if(e.cat==='buff'){e.bdmg=/\+2 danno/.test(A);e.bvel=/\+2 Velocità/.test(A);e.bst=(m=A.match(/recupera(?:no)? (\d) stamina/))?+m[1]:0;}
  FXC.set(c,e);return e;}
function atkInfo(F,d){const c=d.c;const A=c.a||'';
  if(c.lv||c.tr){const dm=A.match(/(\d+)d(\d+)(?: \+ (SAG|INT|DES|FOR))?/),fl=A.match(/(?<![d\d])(\d+) \+ (SAG|INT|DES|FOR)/);if(dm&&dm[3]&&!fl)return{type:'Tecnica',dice:[+dm[1],+dm[2]],flat:F.mod[dm[3]]||0,flatTxt:`${dm[3]} ${F.mod[dm[3]]||0}`,fire:isFire(F,d)};
    return{type:'Tecnica',dice:dm?[+dm[1],+dm[2]]:[0,0],flat:fl?+fl[1]+(F.mod[fl[2]]||0):0,flatTxt:fl?`${fl[1]} + ${fl[2]} ${F.mod[fl[2]]||0}`:'',fire:isFire(F,d)};}
  const m=A.match(/Sparo|Colpo|Rottura|Aggiramento/);if(!m)return null;
  const fs=A.match(/(\d+) \+ (SAG|DES|FOR|INT)/),ds=A.match(/(\d+)d(\d+) \+ (SAG|DES|FOR|INT)/);let flat=0,dice=[0,0],ft='';
  if(ds){dice=[+ds[1],+ds[2]];flat=F.mod[ds[3]];ft=`${ds[3]} ${flat}`;}else if(fs){flat=+fs[1]+F.mod[fs[2]];ft=`${fs[1]} + ${fs[2]} ${F.mod[fs[2]]}`;}
  return{type:m[0],flat,flatTxt:ft,dice,base:/tecnica Base|completi una Base/.test(A),burn:/Brucia|Sanguina/.test(A),fire:isFire(F,d)};}
function defInfo(d){if(!d||!d.c.b)return null;if(/Vinta contro qualsiasi/.test(d.c.b))return{type:'Sost'};const m=d.c.b.match(/Parata|Schivata|Contrattacco/);return m?{type:m[0],antiShot:/contro lo Sparo/.test(d.c.b)}:null;}

/* ---- griglia ---- */
function free(G,x,y,self){if(x<0||y<0||x>=W||y>=H)return false;if(G.obs.has(key(x,y)))return false;return !G.fs.some(f=>f!==self&&f.pf>0&&f.x===x&&f.y===y);}
function los(G,a,b){let x0=a.x,y0=a.y;const x1=b.x,y1=b.y,dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;
  for(;;){if(!(x0===a.x&&y0===a.y)&&!(x0===x1&&y0===y1)&&G.obs.get(key(x0,y0))==='m')return false;if(x0===x1&&y0===y1)return true;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx;}if(e2<=dx){err+=dx;y0+=sy;}}}
function cover(G,d,a){if(dist(d,a)<=1)return false;for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){if(!dx&&!dy)continue;if(G.obs.has(key(d.x+dx,d.y+dy))&&(dx*(a.x-d.x)+dy*(a.y-d.y))>0)return true;}return false;}
function bfs(G,F,budget){const res=new Map([[key(F.x,F.y),0]]);if(F.trat>0)return res;let fr=[[F.x,F.y]];
  for(let s=1;s<=budget;s++){const nf=[];for(const[x,y]of fr)for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(res.has(k)||!free(G,nx,ny,F))continue;res.set(k,s);nf.push([nx,ny]);}fr=nf;}return res;}
const DIRS=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
function pushBest(G,F,T,n,arrows,straightOnly){
  const sx=Math.sign(T.x-F.x),sy=Math.sign(T.y-F.y),si=DIRS.findIndex(d=>d[0]===sx&&d[1]===sy);let best=null;
  DIRS.forEach((d,i)=>{const off=Math.min((i-si+8)%8,(si-i+8)%8);if(off>2||(straightOnly&&off))return;const len=n-off;if(len<=0)return;
    let x=T.x,y=T.y,m=0,hitW=false;for(let k=0;k<len;k++){const nx=x+d[0],ny=y+d[1];if(!free(G,nx,ny,T)){hitW=true;break;}x=nx;y=ny;m++;}
    const allyAdj=G.fs.filter(o=>o.team===F.team&&o!==F&&o.pf>0&&Math.max(Math.abs(o.x-x),Math.abs(o.y-y))<=1).length;
    const sc=(hitW?10:0)+allyAdj*3+m+(off?0:0.5);if(!best||sc>best.sc)best={sc,x,y,m,hitW,off};});
  if(!best)return 'Spinta impossibile';const from=[T.x,T.y];T.x=best.x;T.y=best.y;
  if(best.m)arrows.push({a:from,b:[T.x,T.y],team:F.team,kind:'push'});
  const dirTxt=best.off===0?'in linea retta':best.off===1?'in diagonale (una casella in meno)':'di lato (due caselle in meno)';
  if(best.hitW){const x=roll(1,6);T.pf-=x;return best.m?`Spinto ${dirTxt} di ${best.m} fino a sbattere contro un ostacolo: +${x} danni`:`Spinto contro un ostacolo alle sue spalle, senza spazio per arretrare: +${x} danni`;}
  return `Spinto ${dirTxt} di ${best.m}`;}
function reposition(G,M,O,r,mode,arrows){ // M si sposta di al massimo r caselle (gratis)
  const tr=M.trat;M.trat=0;const R=bfs(G,M,r);M.trat=tr;let best=null,bs=-1e9;const foes=G.fs.filter(o=>o.team!==M.team&&o.pf>0),mates=G.fs.filter(o=>o.team===M.team&&o.pf>0&&o!==M);
  for(const [k,steps] of R){const[x,y]=k.split(',').map(Number),p={x,y};if(!steps)continue;const adjF=foes.filter(o=>o!==O&&dist(p,o)<=1).length;let sc;
    if(mode==='cover'){sc=(cover(G,p,O)?6:0)-adjF*4-steps*0.2;}
    else if(mode==='disengage'){if(dist(p,O)<=1)continue;sc=(cover(G,p,O)?4:0)-adjF*6+dist(p,O)-steps*0.2;}
    else{if(dist(p,O)!==1)continue;const oMates=G.fs.filter(o=>o.team===O.team&&o!==O&&o.pf>0);
      const behind=oMates.length?Math.min(...oMates.map(o=>dist(p,o))):(Math.abs(x-M.x)+Math.abs(y-M.y));
      const flank=mates.some(o=>dist(o,O)<=1&&(o.x-O.x)*(x-O.x)+(o.y-O.y)*(y-O.y)<0)?4:0;
      sc=-adjF*4+(mode==='flank'?behind*1+flank:-adjF)+(M.P.ai==='ranged'?-2:0)-steps*0.2;}
    if(sc>bs){bs=sc;best={x,y,steps};}}
  if(!best||bs<-3)return '';const from=[M.x,M.y];M.x=best.x;M.y=best.y;arrows.push({a:from,b:[M.x,M.y],team:M.team,kind:'move'});
  return `di ${best.steps} ${best.steps===1?'casella':'caselle'}`+(mode==='cover'&&cover(G,M,O)?' dietro una copertura':'');}
function stepToward(G,T,F,n){let m=0;for(let i=0;i<n;i++){let best=null,bd=dist(T,F);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const p={x:T.x+dx,y:T.y+dy};if(!free(G,p.x,p.y,T))continue;const d=dist(p,F);if(d<bd&&d>=1){bd=d;best=p;}}if(!best)break;T.x=best.x;T.y=best.y;m++;}return m;}

/* ---- combattente ---- */
const pfAt=(L,cos)=>RULES.scale==='pf'||RULES.scale==='both'?10+cos+(4+cos)*(Math.min(L,10)-1)+Math.max(0,L-10)*2:10+cos+(4+cos)*(L-1);
const tierD=L=>(RULES.scale==='danno'||RULES.scale==='both')?(L>=17?2:L>=11?1:0):0;
function mkF(fz,bi,team,idx,L,scheda){const R=RETI[fz];return conRete(R,()=>{
  const P=PROF[bi],s=scheda||buildAt(bi,L),HKm=R.HK,ids=new Set(s.taken.map(t=>t.id)),cos=P.cos;
  const deck=s.deck.map(d=>({c:d.c,mods:d.mods,src:d.src}));shuffle(deck,RND);
  const F={id:team+idx,team,bi,P,name:P.short,el:BUILDS[bi].el,L,mod:P.mods(L),pfMax:pfAt(L,cos),stMax:RULES.stBase+cos,
    fl:2+Math.floor(L/3)+(ids.has('C2')?3:0),draw:deck,hand:[],disc:[],chain:[],post:[],spir:{},spirNext:{},sbil:false,sbilNext:false,burn:0,stx:{},stxNext:{},
    sov:false,has:id=>ids.has(HKm[id]||id),R,fz,stxNomi:{},taken:s.taken,deckList:s.deck,trat:0,prono:0,taunt:null,tauntNext:null,regen:0,rd5:0,bDmg:0,bDmgNext:0,bVel:0,bVelNext:0,first:true,
    forge:ids.has(R.FORGE)&&s.taken.find(t=>t.id===R.FORGE).opt===1,ammo:6+(ids.has('G3')?2:0),ammoMax:6+(ids.has('G3')?2:0),logo:0,press:0,pressMax:ids.has('B15')?7:5,hotUntil:0,protBroken:false,hasPro:s.deck.some(d=>d.c.pr),m10:ids.has('M10')?s.taken.find(t=>t.id==='M10').opt:null,m6:ids.has('M6')?s.taken.find(t=>t.id==='M6').opt:null,b10A:ids.has('B10')&&s.taken.find(t=>t.id==='B10').opt===0,k7A:ids.has('K7')&&s.taken.find(t=>t.id==='K7').opt===0,k7B:ids.has('K7')&&s.taken.find(t=>t.id==='K7').opt===1,gun:s.deck.some(d=>/Sparo/.test(d.c.a||'')),stats:{dmg:0,heal:0,tec:0,spir:0,vinte:0,interr:0,turns:0,low:0,stSum:0,exh:0,moved:0,debt:0}};
  F.integMax=F.hasPro?3+Math.round(L*(RULES.integK||1)):(F.el==='M'&&RULES.mArm?Math.round(RULES.mArm*(3+L)):0);F.integ=F.integMax;F.pf=F.pfMax;F.st=F.stMax;F.flMax=F.fl;for(let i=0;i<5;i++)F.hand.push(F.draw.pop());return F;});}
function drawCard(F,L){if(!F.draw.length){if(!F.disc.length)return;F.draw=F.disc;F.disc=[];shuffle(F.draw,RND);stLose(F,2);L.push(`${nm(F)} ha finito il mazzo: rimescola gli scarti (−2 stamina).`);}F.hand.push(F.draw.pop());}
const enemies=(G,F)=>G.fs.filter(o=>o.team!==F.team&&o.pf>0);
const allies=(G,F)=>G.fs.filter(o=>o.team===F.team&&o.pf>0);
function targetsFor(G,F,e){return enemies(G,F).filter(o=>{const r=dist(F,o);if(e.dash)return r<=e.dash+1;if(r>e.range)return false;if(r>1&&!los(G,F,o))return false;return true;});}

/* ---- IA ---- */
let curN=1;
function moveAI(G,F){
  F.lastCost=0;if(F.trat>0||F.lega>0)return 0;const freeV=(F.el==='V'?2:0),scat=false,avail=Math.max(0,F.st-2);
  const en=enemies(G,F);if(!en.length)return 0;const adj0=en.filter(o=>dist(F,o)<=1),guard=adj0.some(o=>o.has('T6'));
  let budget=Math.min(4+freeV,avail+freeV);if(guard)budget=Math.min(budget,1);if(!budget)return 0;const freeDis=F.has('V4');const al=allies(G,F);
  let role=F.P.ai;const maxR=Math.max(1,...F.hand.map(d=>fxOf(d.c)).filter(e=>e.cat==='atk'&&e.ranged).map(e=>e.range));
  if(role==='ranged'&&maxR<=1)role='melee';
  const slMax=Math.max(0,...F.hand.map(d=>fxOf(d.c).slancio||0));
  const dw=o=>dist(F,o)+(o.isPet?RULES.petMv:0);const tgt=(F.taunt&&en.find(o=>o.id===F.taunt))||en.reduce((a,b)=>dw(a)<=dw(b)?a:b);
  let best=null,bs=-1e9;
  for(const [k,steps] of bfs(G,F,budget)){const[x,y]=k.split(',').map(Number),p={x,y},adjE=en.filter(o=>dist(p,o)<=1).length;let s;
    const dash=scat&&steps>1&&en.some(o=>dist(F,o)-dist(p,o)===steps),cost=dash?Math.ceil(steps/2):Math.max(0,steps-freeV);if(cost>avail)continue;
    if(role==='ranged'){const d=dist(p,tgt);s=(d<=maxR&&los(G,p,tgt)?10:-Math.abs(d-maxR)*2)-adjE*(F.gun?1:8)+(cover(G,p,tgt)?4:0)+Math.min(d,maxR)*0.5;}
    else if(role==='healer'){const w=al.reduce((a,b)=>b.pf/b.pfMax<a.pf/a.pfMax?b:a);const dA=dist(p,w),dE=Math.min(...en.map(o=>dist(p,o)));
      s=(dA<=3?6:-dA)-adjE*8+(cover(G,p,tgt)?3:0)+Math.min(dE,4)+(en.some(o=>dist(p,o)>1&&dist(p,o)<=maxR&&los(G,p,o))?3:0);}
    else{const d=dist(p,tgt);s=-d*3+(d<=1?10:0)-(role==='tank'?0:Math.max(0,adjE-1)*2);if(d<=1&&slMax)s+=Math.min(slMax,Math.floor(steps/2))*1.5;}
    if(RULES.ado&&!freeDis){const lv=adj0.filter(o=>dist(p,o)>1&&!(o.trat>0||o.prono>0||o.sbil)).length;s-=lv*(F.fz==='dono'?(role==='ranged'||role==='healer'?2:4):(role==='healer'?RULES.aiH:role==='ranged'?RULES.aiR:4));}
    s-=cost*0.3+steps*0.05;if(s>bs){bs=s;best={x,y,steps,cost,dash};}}
  if(best&&best.steps>0){F.st-=best.cost;F.lastCost=best.cost;F.lastDash=best.dash;F.x=best.x;F.y=best.y;return best.steps;}return 0;}
function choose(G,F){
  let best={d:null,t:null,s:-1e9};const en=enemies(G,F),al=allies(G,F);
  const dmax=canDebt(F)?3:0;
  for(const d of F.hand){const k=costOf(d,F);if(k>F.st+dmax)continue;if(!proOk(F,d,curN))continue;const over=Math.max(0,k-Math.max(0,F.st));const c=d.c,e=fxOf(c),df=defInfo(d);
    const threat=en.some(o=>dist(F,o)<=1)||en.length>0;
    const defS=df?(df.type==='Sost'?(F.pf<F.pfMax*.5?10:2):3):0;let s,t=null;
    const weak=()=>defS+velOf(F,d)*0.3-k*0.8-2;
    if(e.cat==='zav')s=-50;
    else if(e.cat==='post')s=F.post.includes(c.n)?-30:Math.max(0,13-3*curN)+defS;
    else if(e.cat==='self')s=F.rd5>0?-10:(en.some(o=>dist(F,o)<=2)&&tecReady(F,d)?14:-5);
    else if(e.cat==='taunt'){const n=en.filter(o=>dist(F,o)<=2).length;s=n?6+n*3+defS:weak();}
    else if(e.cat==='buff'){const n=al.filter(o=>dist(F,o)<=3).length;s=(e.bst?al.filter(o=>o.st<o.stMax/2).length*3:n*3)+defS-k*0.8;}
    else if(e.cat==='repair'){const cap=o=>o.integMax||(RULES.plates?o.L:0);const cand=G.fs.filter(o=>o.team===F.team&&o.pf>0&&dist(F,o)<=e.range&&(o.isPet?o.pf<o.pfMax*0.75:(cap(o)>0&&o.integ<cap(o)*0.75)));
      if(cand.length){const fr=o=>o.isPet?o.pf/o.pfMax:o.integ/cap(o);t=cand.reduce((a,b)=>fr(b)<fr(a)?b:a);s=6+(1-fr(t))*16+(e.hall?cand.length*2:0);}else s=weak();}
    else if(e.cat==='summon'){const n=petsOf(G,F,'torretta').length,mx=F.has('M8')?2:1;s=n<mx?(n?10:14)+defS-k*0.8:weak();}
    else if(e.cat==='command'){const A=petsOf(G,F,'automa')[0];if(c.lv&&!tecReady(F,d))s=-40;else if(A&&!(c.lv&&A.war)){const r=enemies(G,A).some(o=>dist(A,o)<=3);s=r?(c.lv?22:7)+defS-k*0.8:weak();}else s=weak();}
    else if(e.cat==='heal'){const cand=G.fs.filter(o=>o.team===F.team&&!o.isPet&&dist(F,o)<=e.range&&(o.pf>0?o.pf<o.pfMax*0.7:e.revive));
      if(cand.length){t=cand.reduce((a,b)=>(b.pf/b.pfMax<a.pf/a.pfMax?b:a));s=8+(1-Math.max(0,t.pf)/t.pfMax)*20+(e.hall?cand.length*2:0);}else s=weak();}
    else if(e.cat==='atk'){if(c.lv&&!tecReady(F,d))s=-40;else if(c.n==='Batteria di Cannoni'&&!petsOf(G,F,'torretta').length)s=-40;else{const ts=targetsFor(G,F,e);
      if(ts.length){const w=o=>o.pf+(o.integ||0)+(o.isPet?RULES.petW:0);t=ts.find(o=>F.spir[o.id])||(F.taunt&&ts.find(o=>o.id===F.taunt))||ts.reduce((a,b)=>w(b)<w(a)?b:a);var ffS=1;if(F.fz!=='dono'&&RULES.ff&&e.area&&e.area.mode!=='multi'){const ar=o=>e.area.mode==='around'?G.fs.filter(x=>x.pf>0&&x!==F&&dist(x,F)<=e.area.r):G.fs.filter(x=>x.pf>0&&dist(x,o)<=e.area.r);const sc=o=>ar(o).reduce((z,x)=>z+(x.team===F.team?(x.isPet?-0.5:-1.5):(x.isPet?0.5:1)),0);t=ts.reduce((a,b)=>sc(b)>sc(a)?b:a);ffS=sc(t);}
        const a=atkInfo(F,d);const exp=a?a.flat+a.dice[0]*(a.dice[1]+1)/2:1;
        if(F.fz==='dono'){s=exp*(e.area?1.5:1)+velOf(F,d)*0.6+defS-k*0.8+(F.spir[t.id]?5:0)+(e.trat?4:0);if(e.area&&(RULES.ff||e.area.allies)&&e.area.mode!=='multi'){const ff=G.fs.filter(o=>o.pf>0&&o!==F&&o.team===F.team&&(e.area.mode==='around'?dist(o,F)<=e.area.r:dist(o,t)<=e.area.r)).length;s-=ff*exp*1.2;}}else s=exp*(e.area?(RULES.ff&&e.area.mode!=='multi'?Math.max(-1,ffS):1.5):1)+velOf(F,d)*0.6+defS-k*0.8+(F.spir[t.id]?5:0)+(e.trat?4:0);
        if(c.lv)s+=c.lv==='Suprema'?20:c.lv==='Avanzata'?10:4;if(F.fz!=='dono'&&RULES.ff&&e.area&&e.area.mode!=='multi'&&ffS<=0.5)s=-30;if(e.provoke&&RULES.provoke&&F.P.ai==='tank'&&!t.isPet)s+=4;if(F.taunt&&t.id!==F.taunt)s-=8;if(t.isPet&&(c.tr||c.lv))s-=8;}else s=weak();}}
    else s=defS-3;
    if(RULES.guard&&/Guardiano per/.test(c.b||'')&&(F.guard||0)<curN+1&&al.some(o=>o!==F&&!o.isPet&&o.pf>0&&dist(F,o)<=2))s+=4;
    if(over){const kill=e.cat==='atk'&&t&&(()=>{const a=atkInfo(F,d);return a&&a.flat+a.dice[0]*(a.dice[1]+1)/2>=t.pf;})();s-=kill?0:over*(RULES.debtAI==='audace'?1:3.5);}
    if(/^Ricarica/.test(c.b||'')&&F.ammo<=2)s+=5;if(/Sparo/.test(c.a||'')&&F.ammo<shotNeed(e))s=Math.min(s,weak()+(/^Ricarica/.test(c.b||'')?6:0));if(c.tr&&e.cat==='atk')s+=F.logo>=3?-6:8;
    s+=RND()*4;if(s>best.s)best={d,t,s};}
  return best;}


/* ---- Meccanica: automi e torrette ---- */
function mkPet(G,O,kind,x,y){G.petN=(G.petN||0)+1;const L=O.L,turret=kind==='torretta';
  const P={id:O.id+(turret?'t':'a')+G.petN,team:O.team,owner:O,R:O.R,fz:O.fz,stxNomi:{},isPet:true,kind,name:(turret?'Torretta':'Automa')+' di '+O.name,el:'M',L,mod:{SAG:0,INT:0,DES:0,FOR:0},has:()=>false,P:{ai:'melee',short:''},x,y,
    stx:{},stxNext:{},spir:{},spirNext:{},post:[],stats:{dmg:0,heal:0,tec:0,spir:0,vinte:0,interr:0,turns:0,low:0,stSum:0,exh:0,moved:0,debt:0},trat:0,prono:0,burn:0,rd5:0,rdTmp:0,hasPro:false,chain:[],hand:[],draw:[],disc:[],taken:[],deckList:[],
    st:0,stMax:0,fl:0,flMax:0,integ:0,integMax:0,ammo:0,gun:false,born:curN};
  if(turret){P.pfMax=4+L+(O.m10===0?4:0);P.rdT=O.m10===0?2:0;P.pvel=4+(O.m10===1?2:0);P.range=5;}
  else{P.pfMax=RULES.petHP+L+(O.has('M1')?RULES.m1:0);P.pvel=5;P.range=1;}
  P.pf=P.pfMax;G.fs.push(P);return P;}
const petsOf=(G,O,k)=>G.fs.filter(p=>p.isPet&&p.owner===O&&p.pf>0&&(!k||p.kind===k));
function spawnAutomi(G){G.fs.filter(F=>!F.isPet&&F.el==='M').forEach(F=>{let c=null;for(const[dx,dy]of DIRS){if(free(G,F.x+dx,F.y+dy)){c=[F.x+dx,F.y+dy];break;}}if(c)mkPet(G,F,'automa',c[0],c[1]);});}
function petTarget(G,P){const en=enemies(G,P).filter(o=>dist(P,o)<=P.range&&(dist(P,o)<=1||los(G,P,o)));if(!en.length)return null;
  return (P.taunt&&en.find(o=>o.id===P.taunt))||en.reduce((a,b)=>(b.isPet?50:0)+b.pf+(b.integ||0)<(a.isPet?50:0)+a.pf+(a.integ||0)?b:a);}
function petMove(G,P){if(P.kind!=='automa'||P.trat>0)return 0;const en=enemies(G,P);if(!en.length)return 0;
  const pc=en.filter(o=>!o.isPet),pool=pc.length?pc:en;const own=P.owner;
  const T=pool.reduce((a,b)=>dist(P,a)+(own.pf>0?dist(own,a)*0.5:0)<=dist(P,b)+(own.pf>0?dist(own,b)*0.5:0)?a:b);if(dist(P,T)<=1)return 0;return stepToward(G,P,T,3);}
function petAttack(G,P,L,arrows,why){if(P.pf<=0)return;if((P.jam||0)>=curN){L.push(`${nm(P)} è inceppato e resta fermo.`);return;}
  if(P.kind==='automa'&&why){const en=enemies(G,P);if(en.length&&!en.some(o=>dist(P,o)<=1)){const pc=en.filter(o=>!o.isPet);const T=(pc.length?pc:en).reduce((a,b)=>dist(P,a)<=dist(P,b)?a:b);const fr=[P.x,P.y];if(stepToward(G,P,T,2))arrows.push({a:fr,b:[P.x,P.y],team:P.team,kind:'move'});}}
  const T=petTarget(G,P);if(!T){if(!why)return;L.push(`${nm(P)} non ha nessuno a portata.`);return;}
  const O=P.owner,turret=P.kind==='torretta',a={type:turret?'Sparo':['Colpo','Rottura','Aggiramento'][Math.floor(RND()*3)],flat:Math.floor((O.mod.INT||0)/2),flatTxt:'',dice:[1,6],base:false,burn:false,fire:false};
  const pd=turret?(RULES.turD||RULES.petD):RULES.petD;a.dice=[1,pd];let dmg=a.flat+roll(1,pd);const parts=[`1d${pd} + ${a.flat}`];
  if(RULES.shotPet&&a.type){}
  if(turret&&O.has('M3')){const x=roll(1,4);dmg+=x;parts.push(`Calibro Maggiore ${x}`);}
  if(!turret&&O.m6===1){const x=roll(1,4);dmg+=x;parts.push(`Artigli ${x}`);}
  if(!turret&&P.war){const x=roll(RULES.warD,6);dmg+=x;parts.push(`da guerra ${x}`);}
  if(tierD(P.L)){const x=roll(tierD(P.L),6);dmg+=x;parts.push(`livello +${tierD(P.L)}d6`);}
  if(why){dmg+=0;}
  L.push(`${nm(P)} ${turret?'spara':'attacca'}${why?' ('+why+')':''}: ${dmg} danni potenziali [${parts.join(', ')}].`);
  hit(G,P,T,{c:{n:P.name},src:null},a,{},dmg,{half:P.interr==='half',burn:false,baseEl:null},L,arrows);}
function jam(T){if(T.isPet){T.jam=curN+1;return ` ${T.name} è <b>Inceppato</b>: si ferma per uno scambio.`;}
  const r=[];if(T.gun&&T.ammo>0&&RULES.jamGun){if(RULES.jamGun==='empty'){T.ammo=0;r.push('il tamburo si svuota');}else{T.ammo=Math.max(0,T.ammo-RULES.jamGun);r.push(`perde ${RULES.jamGun} colpi`);}}if(T.hasPro&&!T.protBroken){T.hotUntil=Math.max(T.hotUntil,curN+1);r.push('la protesi si blocca per uno scambio');}
  if(RULES.jamAlch&&T.deckList&&T.deckList.some(d=>d.c.tr)){T.logo=(T.logo||0)+1;r.push(`gli strumenti alchemici si guastano: Logoramento ${T.logo}`);}if(!r.length){T.stxNext.A=1;r.push('è Rallentato');}return ` ${T.name} è <b>Inceppato</b>: ${r.join(' e ')}.`;}
function turretCell(G,F,e){const R=e.range+(F.m10===1?2:0);let best=null,bs=-1e9;const en=enemies(G,F).filter(o=>!o.isPet);
  for(let x=F.x-R;x<=F.x+R;x++)for(let y=F.y-R;y<=F.y+R;y++){if(!free(G,x,y))continue;const p={x,y};if(dist(p,F)>R)continue;
    const dE=en.length?Math.min(...en.map(o=>dist(p,o))):5;const sh=en.some(o=>dist(p,o)<=5&&los(G,p,o));const sc=(sh?6:0)-(dE<=1?6:0)+Math.min(dE,4)*0.5+(cover(G,p,en[0]||F)?1:0);if(sc>bs){bs=sc;best=p;}}
  return best;}
/* ---- Ingegno: munizioni, Trasmutazioni, Pressione ---- */
const shotNeed=e=>e.area&&e.area.mode==='multi'?e.area.n:1;
const proOk=(F,d,nx)=>!d.c.pr||(!F.protBroken&&nx>F.hotUntil);
function ingEnd(G,F,L){const c=F.card.c;
  if(c.tr&&!F.exh&&F.k7A&&!F.k7used){F.k7used=true;L.push(`${nm(F)} aveva preparato il cerchio: questa Trasmutazione non dà Logoramento.`);}
  else if(c.tr&&!F.exh){F.logo++;let x=0;if(F.has('K15'))x+=roll(1,6);else if(F.logo>RULES.logoT)x+=roll(1,6);if(x)F.pf-=x;F.stats.logo=(F.stats.logo||0)+1;
    L.push(`${nm(F)} paga la Trasmutazione: Logoramento ${F.logo}${x?`, −${x} PF`:''}${F.has('K15')?'':', la carta si consuma'}.`);}
  if(/^Ricarica/.test(c.b||'')&&F.ammo<F.ammoMax){F.ammo=F.ammoMax;L.push(`${nm(F)} ricarica: ${F.ammo} colpi.`);}
  if(c.pr&&!F.exh){F.press+=Math.max(0,c.pr-(F.b10A&&fxOf(c).cat==='heal'?1:0));if(F.press>=F.pressMax){F.press=0;F.hotUntil=curN+1;F.stats.hot=(F.stats.hot||0)+1;L.push(`La protesi di ${nm(F)} si <b>surriscalda</b>: le sue carte di protesi restano bloccate nel prossimo scambio.`);}}}
/* ---- risoluzione ---- */
function degrade(o){return o==='V'?'R':'P';}
function act(G,F,L,arrows){
  if(F.exh){L.push(`${nm(F)} è <b>Esausto</b> (stamina ${F.st}): gioca <i>${esc(F.card.c.n)}</i> senza pagarla, ma solo per difendersi.`);return;}
  const d=F.card,c=d.c,e=fxOf(c),half=F.interr==='half';const ally=allies(G,F),en=enemies(G,F);
  if(e.cat==='zav'){L.push(`${nm(F)} gioca la zavorra <i>${esc(c.n)}</i>: non fa nulla.`);return;}
  if(e.cat==='none'){L.push(`${nm(F)} gioca <i>${esc(c.n)}</i>: effetto non ancora simulato (${esc(c.a)}).`);return;}
  if(e.cat==='post'){F.post.push(c.n);L.push(`${nm(F)} assume la postura <i>${esc(c.n)}</i>: ${esc(c.a.replace('Postura: ',''))}.`);return;}
  if(e.cat==='self'){if(c.lv==='Suprema'){F.fl-=3;F.chain=[];}F.rd5=3;F.rdSV=e.rdSelf;L.push(`${nm(F)} ${c.tr?'trasmuta':'lancia'} <i>${esc(c.n)}</i>: +${e.rdSelf} riduzione del danno per 3 scambi.`);return;}
  if(e.cat==='taunt'){const t=en.filter(o=>dist(F,o)<=2);t.forEach(o=>o.tauntNext=F.id);L.push(`${nm(F)} lancia la sfida: ${t.map(nm).join(', ')||'nessuno'} dovr${t.length>1?'anno':'à'} attaccare lui nel prossimo scambio.`);return;}
  if(e.cat==='buff'){const t=ally.filter(o=>dist(F,o)<=3);t.forEach(o=>{if(e.bdmg)o.bDmgNext+=2;if(e.bvel)o.bVelNext+=2;if(e.bst)o.st=Math.min(o.stMax,o.st+e.bst);});
    L.push(`${nm(F)} gioca <i>${esc(c.n)}</i> su ${t.map(nm).join(', ')}: ${e.bdmg?'+2 danno':e.bvel?'+2 Velocità':'+'+e.bst+' stamina'}${e.bst?'':' nel prossimo scambio'}.`);arrows.push(...t.filter(o=>o!==F).map(o=>({a:[F.x,F.y],b:[o.x,o.y],team:F.team,kind:'heal'})));return;}
  if(e.cat==='repair'){if(c.lv){if(!tecReady(F,d)){L.push(`${nm(F)} prova <i>${esc(c.n)}</i> ma i pezzi sul banco non bastano.`);return;}F.chain=[];}
    const ts=e.hall?G.fs.filter(o=>o.team===F.team&&o.pf>0&&dist(F,o)<=e.range&&(o.isPet||o.integMax>0||RULES.plates)):[F.tgt].filter(o=>o&&o.pf>0&&dist(F,o)<=e.range);
    if(!ts.length){L.push(`${nm(F)} voleva riparare ma non ha niente a portata.`);return;}
    ts.forEach(o=>{let h=roll(...e.hd)+(F.mod.INT||0)+(F.has('M11')?roll(1,6):0);if(half)h=Math.floor(h/2);let got;
      if(o.isPet){got=Math.min(o.pfMax,o.pf+h)-o.pf;o.pf+=got;}else{if(!o.integMax&&RULES.plates){o.integMax=o.L;o.plate=true;}got=Math.min(o.integMax,o.integ+h)-o.integ;o.integ+=got;}F.stats.heal+=got;
      L.push(`${nm(F)} ${o.plate&&!o.isPet?'imbullona piastre su':'ripara'} ${nm(o)} con <i>${esc(c.n)}</i>: +${got} Integrità.`);if(o!==F)arrows.push({a:[F.x,F.y],b:[o.x,o.y],team:F.team,kind:'heal'});});return;}
  if(e.cat==='summon'){const mx=F.has('M8')?2:1,old=petsOf(G,F,'torretta');if(old.length>=mx){old[0].pf=0;L.push(`${nm(F)} smonta la torretta più vecchia.`);}
    const p=turretCell(G,F,e);if(!p){L.push(`${nm(F)} non trova spazio per la torretta.`);return;}const P=mkPet(G,F,'torretta',p.x,p.y);
    if(typeof PX!=='undefined'&&PX.G===G){PX.ai[P.id]=true;PX.plan[P.id]={move:null,ci:null,t:null};}
    arrows.push({a:[F.x,F.y],b:[p.x,p.y],team:F.team,kind:'heal'});L.push(`${nm(F)} piazza una <b>torretta</b> (Integrità ${P.pfMax}): sparerà da sola a ogni scambio.`);return;}
  if(e.cat==='command'){const A=petsOf(G,F,'automa')[0];if(!A){L.push(`${nm(F)} dà un ordine, ma il suo automa è a terra.`);return;}
    if(c.lv){if(!tecReady(F,d)){L.push(`${nm(F)} prova <i>${esc(c.n)}</i> ma i pezzi sul banco non bastano.`);return;}F.fl-=3;F.chain=[];A.war=true;A.pfMax+=8;A.pf+=8;F.stats.tec++;L.push(`${nm(F)} lancia <i>${esc(c.n)}</i>: ${nm(A)} si trasforma in automa da guerra (+8 Integrità, +2d6 danni).`);}
    petAttack(G,A,L,arrows,'ordine');return;}
  if(e.cat==='heal'){let ts=e.hall?G.fs.filter(o=>o.team===F.team&&!o.isPet&&dist(F,o)<=e.range&&(o.pf>0||e.revive)):[F.tgt].filter(o=>o&&dist(F,o)<=e.range&&(o.pf>0||e.revive));
    if(!ts.length){L.push(`${nm(F)} voleva curare ma non ha più nessuno a portata.`);return;}
    ts.forEach(o=>{let h=roll(...e.hd)+(e.hsag?F.mod[e.hsag]||0:0)+(F.has('A9')?roll(1,6):0);if(half)h=Math.floor(h/2);const eng=RULES.healEng&&(RULES.healEng!=='self'||o===F)&&o.pf>0&&G.fs.some(x=>x.team!==o.team&&x.pf>0&&dist(x,o)<=1);if(eng)h=Math.floor(h/2);const brn=RULES.douse&&o.burn>0&&(['A','B'].includes(elemOf(F,d))||['A','B'].includes(F.el));if(brn)o.burn=0;
      const was=o.pf;if(o.pf<=0){if(!e.revive)return;o.pf=0;}o.pf=Math.min(o.pfMax,o.pf+h);F.stats.heal+=o.pf-Math.max(0,was);if(e.regen)o.regen=3;if(e.hcost)stLose(o,2);if(F.has('X9')&&o.pf>0)o.rdTmp=2;
      L.push(`${nm(F)} ${was<=0?'rialza':'cura'} ${nm(o)} con <i>${esc(c.n)}</i>: +${o.pf-Math.max(0,was)} PF${half?' (dimezzata dall\'Interruzione)':''}${eng?' (dimezzata: è in mischia)':''}${brn?' '+F.R.txt.douse:''}${e.regen?', e cura 1d6 per altri 3 scambi':''}${e.hcost?', ma gli costa 2 stamina':''}.`);
      if(o!==F)arrows.push({a:[F.x,F.y],b:[o.x,o.y],team:F.team,kind:'heal'});});return;}
  // attacco
  if(c.lv&&!tecReady(F,d)){L.push(`${nm(F)} prova <i>${esc(c.n)}</i> ${F.R.txt.noCatena}: nessun effetto.`);return;}
  let T=F.tgt;const valid=targetsFor(G,F,e);if(!T||T.pf<=0||!valid.includes(T))T=valid[0];
  if(T&&RULES.guard&&!e.area&&!T.isPet&&!c.tr&&(RULES.guardShot||!/Sparo/.test(c.a||''))){const g=G.fs.find(o=>o.team===T.team&&o!==T&&!o.isPet&&o.pf>0&&(o.guard||0)>=curN&&dist(o,T)<=1);if(g){L.push(`${nm(g)} fa da Guardiano e si mette davanti a ${nm(T)}.`);T=g;}}
  if(!T){L.push(`${nm(F)} non ha più nessuno a portata: la metà alta di <i>${esc(c.n)}</i> va a vuoto.`);return;}
  if(e.dash&&dist(F,T)>1){let best=null,bd=99;for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const p={x:T.x+dx,y:T.y+dy};if(!free(G,p.x,p.y,F))continue;const dd=dist(F,p);if(dd<bd){bd=dd;best=p;}}
    if(best){arrows.push({a:[F.x,F.y],b:[best.x,best.y],team:F.team,kind:'move'});F.x=best.x;F.y=best.y;L.push(`${nm(F)} scatta di ${bd} caselle fino a ${nm(T)} con lo stesso colpo.`);}}
  const a=atkInfo(F,d)||{type:'Tecnica',dice:[0,0],flat:0,flatTxt:'',fire:false};
  if(/Sparo/.test(c.a||'')){const need=shotNeed(e);if(F.ammo<need){L.push(`${nm(F)} preme il grilletto di <i>${esc(c.n)}</i> ma il tamburo è vuoto: clic.`);return;}F.ammo-=need;}
  let parts=[],notes=[],dmg=a.flat,tec=false,burn=false,baseEl=null;if(a.flatTxt)parts.push(a.flatTxt);
  if(a.dice[0]){const x=roll(...a.dice);dmg+=x;parts.push(`${a.dice[0]}d${a.dice[1]}: ${x}`);}
  if(c.lv){tec=true;F.stats.tec++;const vulc=F.has('F15')&&a.fire&&c.lv!=='Suprema';notes.push(`tecnica ${c.lv} (${c.seq})${vulc?' '+F.R.txt.senzaSigilli:''}`);
    if(c.lv==='Suprema'){F.fl-=3;F.chain=[];notes.push(F.R.txt.suprema);}else if(c.lv==='Avanzata'&&!vulc)F.chain=[];
    if(c.lv==='Avanzata'&&F.has('F7')){F.st=Math.min(F.stMax,F.st+2);notes.push(F.R.txt.danza);}}
  else if(a.base&&(F.chain.length||(F.has('F15')&&a.fire))){tec=true;F.stats.tec++;const x=roll(1,6);dmg+=x;parts.push(`tecnica Base +1d6: ${x}`);burn=a.burn;if(RULES.stati)baseEl=REV[elemOf(F,d)]||elemOf(F,d);}
  if(tec&&a.fire&&F.has('F9')){const x=roll(1,6);dmg+=x;parts.push(`${F.R.txt.combustione}: ${x}`);}
  if(tec&&a.fire&&F.has('F15')){const x=roll(1,4);F.pf-=x;notes.push(`${F.R.txt.cuore}: −${x} PF`);}
  if(!c.lv&&a.type==='Rottura'&&F.has('T9')){const x=roll(1,8);dmg+=x;parts.push(`${F.R.txt.peso}: ${x}`);}
  if(!c.lv&&a.type==='Rottura'&&F.has('X12')){dmg+=2;parts.push(`${F.R.txt.pugno}: 2`);}
  if(e.slancio&&F.movedNow>=2){const x=Math.min(e.slancio,Math.floor(F.movedNow/2));dmg+=x;parts.push(`Slancio (${F.movedNow} caselle): +${x}`);}
  if(F.has('X3')&&F.movedNow>=3&&!F.x3){F.x3=true;burn=true;notes.push('Vento che Attizza: Brucia');}
  if(!c.lv&&ally.some(o=>o.forge)){const x=roll(1,6);dmg+=x;parts.push(`${F.R.txt.forgia}: ${x}`);}
  if(F.fz==='dono'){if(F.R.sangue&&F.el==='F'&&a.fire&&(tec||c.lv||a.base)){dmg+=F.R.sangue;parts.push('Sangue Caldo +'+F.R.sangue);}}else if(F.el==='G'&&a.fire&&(tec||c.lv||a.base||(a.type==='Sparo'&&RULES.occhio))){const x=(tec||c.lv||a.base?F.R.sangue:0)+(a.type==='Sparo'?(F.L>=5?RULES.occhio:RULES.occhio-1):0);if(x){dmg+=x;parts.push('Occhio Freddo +'+x);}}
  if(c.tr&&F.has('K4')){const x=roll(1,RULES.k4);dmg+=x;parts.push(`Reagenti Puri: ${x}`);}
  if(c.tr&&F.has('K9')){const x=roll(1,4);dmg+=x;parts.push(`Reagenti Instabili: ${x}`);}
  if(tierD(F.L)&&!c.lv){const x=roll(tierD(F.L),6);dmg+=x;parts.push(`livello ${F.L}: +${tierD(F.L)}d6: ${x}`);}
  if(F.bDmg){dmg+=F.bDmg;parts.push(`${F.R.txt.fiamma} +${F.bDmg}`);}
  // bersagli
  let ts=[T];
  if(e.area){if(e.area.mode==='target')ts=F.fz==='dono'?G.fs.filter(o=>o.pf>0&&o!==F&&((RULES.ff&&!/alleati dentro/.test(c.a||''))||o.team!==F.team)&&dist(o,T)<=e.area.r):G.fs.filter(o=>o.pf>0&&(RULES.ff||o.team!==F.team)&&dist(o,T)<=e.area.r);
    else if(e.area.mode==='around')ts=G.fs.filter(o=>o.pf>0&&o!==F&&dist(o,F)<=e.area.r&&(RULES.ff||e.area.allies||o.team!==F.team));
    else ts=[T,...en.filter(o=>o!==T&&dist(o,T)<=3)].slice(0,e.area.n);
    if(RULES.ff&&F.fz!=='dono'){const fr=ts.filter(o=>o.team===F.team);if(fr.length)notes.push('fuoco amico su '+fr.map(o=>o.name).join(', '));}}
  L.push(`${nm(F)} ${c.lv?'lancia la tecnica':'attacca con la metà alta di'} <i>${esc(c.n)}</i>${c.lv?'':' ('+a.type+(dist(F,T)>1?' a distanza':'')+')'}: ${dmg} danni potenziali [${parts.join(', ')||'—'}]${notes.length?' · '+notes.join(' · '):''}${half?' · è stato colpito prima e attacca a metà forza':''}${ts.length>1?' · colpisce '+ts.length+' bersagli':''}.`);
  ts.forEach(t=>hit(G,F,t,d,a,e,dmg,{half,burn,baseEl},L,arrows));
}
function hurt(T,x,k=1){const ab=Math.min(T.integ||0,x*k);if(ab)T.integ-=ab;T.pf-=x-Math.ceil(ab/k);return ab;}
function rdOf(T){const r=(T.post.includes('Pelle di Roccia')?2:0)+(T.post.includes('Corazza di Lava')?2:0)+(T.post.includes('Blindatura')?2:0)+(T.post.includes('Caldaia Rovente')?2:0)+(T.rd5>0?(T.rdSV||5):0)+(T.has('T15')&&!(T.fz==='dono'&&(T.softUntil||0)>=curN)?4:0)+(T.has('K8')&&T.logo>=2?2:0)+(T.rdT||0)+(T.rdTmp||0);return RULES.rdCap?Math.min(RULES.rdCap,r):r;}
function hit(G,F,T,d,a,e,dmg,o,L,arrows){const b0=new Set(Object.keys(T.stxNext||{}));hit0(G,F,T,d,a,e,dmg,o,L,arrows);T.stxNomi=T.stxNomi||{};for(const k in (T.stxNext||{}))if(!b0.has(k))T.stxNomi[k]=(F.R||T.R).ST_TXT[k]||k;}
function hit0(G,F,T,d,a,e,dmg,o,L,arrows){
  const ranged=dist(F,T)>1;let out,dtxt,extra='',defType=null;
  let triP=false;const spU=!!F.spir[T.id];if(spU){delete F.spir[T.id];F.stats.spir++;F.spUsed=true;}
  {let ok=true;if(T.sbil){T.sbil=false;if(T.st>=3){T.st-=3;extra+=` ${T.name} è Sbilanciato e paga 3 stamina per difendersi.`;}else ok=false;}
    const dd=ok&&T.card?defInfo(T.card):null;defType=dd?dd.type:null;
    if(!ok){out='P';dtxt='è Sbilanciato e senza stamina: nessuna difesa';}
    else if(!dd){out='P';dtxt=T.card?`la sua carta <i>${esc(T.card.c.n)}</i> non ha difesa`:'non ha giocato carte'; }
    else if(dd.type==='Sost'){out='V';dtxt='usa <i>${esc(T.card.c.n)}</i>: l\'attacco non lo raggiunge';}
    else if(a.type==='Sparo'){const anti=T.fz==='dono'&&T.has('V10')&&(T.taken.find(t=>t.id==='V10')||{}).opt===0;
      if(dd.type==='Parata'){const ok=dd.antiShot||(T.el==='B'&&(RULES.telaio===true||(RULES.telaio==='ferro'&&T.integ>0)));out=ok?'V':'R';dtxt=`para uno Sparo (${esc(T.card.c.n)}): <b>${OUT[out]}</b>${ok?(dd.antiShot?'':' (Telaio d’Acciaio)'):' (la Parata attutisce ma non ferma i proiettili)'}`;}
      else if(dd.type==='Schivata'){const cv=ranged&&cover(G,T,F);out=cv||anti?'V':'R';dtxt=`schiva lo Sparo (${esc(T.card.c.n)})${cv?' dietro una copertura':anti?' '+T.R.txt.scia:''}: <b>${OUT[out]}</b>`;}
      else{out='P';dtxt='non può contrattaccare uno Sparo: <b>Persa</b>';}}
    else if(ranged){
      if(dd.type==='Parata'){out=dd.antiShot?'V':'R';dtxt=`para da lontano (${esc(T.card.c.n)}): <b>${OUT[out]}</b>`;}
      else if(dd.type==='Schivata'){const cv=cover(G,T,F);out=cv?'V':TRI[a.type].Schivata;dtxt=`schiva (${esc(T.card.c.n)})${cv?' dietro una copertura':''}: <b>${OUT[out]}</b>`;}
      else{out='R';const m=stepToward(G,T,F,2);dtxt=`non può contrattaccare da lontano: <b>Retta</b>, e avanza di ${m} caselle verso ${F.name}`;}}
    else{out=TRI[a.type][dd.type];dtxt=`difende con ${dd.type} (<i>${esc(T.card.c.n)}</i>): <b>${OUT[out]}</b>`;if(RULES.waterFlow&&(T.el==='A'||T.el==='K')&&dd.type==='Schivata'&&out==='P'){out='R';dtxt+=', ma l\'acqua scorre via (Scorrere): <b>Retta</b>';}}
    triP=!!dd&&out==='P';
    if(dd&&dd.type==='Schivata'&&T.has('A15')&&!ranged&&(a.type==='Colpo'||a.type==='Rottura')&&out!=='V'){out='V';dtxt+=', ma Corpo d\'Acqua la rende <b>Vinta</b>';}
    if(dd&&dd.type==='Schivata'&&T.trat>0&&out!=='P'){out='P';dtxt+=', ma è Trattenuto e non può schivare: <b>Persa</b>';}
    if(dd&&ranged&&(F.fz!=='dono'||T.fz!=='dono')&&T.movedNow>=3&&out==='P'&&dd.type!=='Sost'){out='R';dtxt+=`, ma si è mosso di ${T.movedNow} caselle (bersaglio in movimento): <b>Retta</b>`;}
    if(dd&&!F.isPet&&T.defCount>0&&out!=='P'){out=degrade(out);dtxt+=`, ma è già la sua ${T.defCount+1}ª difesa dello scambio (fianco scoperto): scende a <b>${OUT[out]}</b>`;}
    if(dd&&!F.isPet)T.defCount++;
    if(RULES.stati&&T.stx.T&&(T.stx.T===1||T.stx.T===F.id)&&out!=='P'){out=degrade(out);T.stx.T=0;dtxt+=`, ma è ${nomeStato(T,'T')}: scende a <b>${OUT[out]}</b>`;}}
  if(spU){const o0=out;out=degrade(out);dtxt+=o0==='P'?` · ${F.name} sfrutta lo Spiraglio, ma la difesa era già Persa`:`, ma ${F.name} sfrutta lo <b>Spiraglio</b>: scende a <b>${OUT[out]}</b>`;}
  if(out!=='V'&&T.fz==='dono'&&elemOf(F,d)==='A'&&T.has('T15')&&!((T.softUntil||0)>=curN)){T.softUntil=curN+2;T.stxNext.A=1;extra+=' La terra bagnata si ammorbidisce: Pelle di Pietra spenta per 2 scambi.';}if(F.has('M4')&&(T.isPet||T.gun||T.integMax>0)){dmg+=3;extra+=' Sabotatore: +3 contro il ferro.';}
  if(F.has('X6')&&(T.stx.A||T.stx.L)){dmg+=3;if(T.stx.A)T.stxNext.L=1;extra+=` ${F.R.txt.corrente}: +3${T.stx.A?' e '+T.name+' resta Elettrizzato':''}.`;}
  if(T.has('A15')&&elemOf(F,d)==='L'){dmg*=2;extra+=' Corpo d\'Acqua: il fulmine fa danno doppio.';}
  if(RULES.stati&&T.stx.A&&elemOf(F,d)==='L'){const x=roll(1,6);dmg+=x;extra+=` Bagnato: il fulmine conduce +${x}.`;}
  let fin=out==='V'?0:out==='R'?Math.floor(dmg/2):dmg;if(o.half)fin=Math.floor(fin/2);
  const rd=(F.has('V7')&&(a.type==='Aggiramento'||e.slancio))?(T.rdTmp||0)+(T.rd5>0?5:0):rdOf(T);if(rd&&fin>0){fin=Math.max(0,fin-rd);extra+=` Riduzione del danno ${rd}.`;}
  if(RULES.shotPet&&T.isPet&&a.type==='Sparo'&&!F.isPet&&fin>0){fin=Math.floor(fin*RULES.shotK);extra+=' I proiettili perforano le lamiere: danno x'+RULES.shotK+'.';}
  {const ab=hurt(T,fin,d.c&&d.c.tr&&RULES.trIron?2:1);if(ab)extra+=` ${ab} li assorbe il ferro (Integrità ${T.integ}/${T.integMax}).`;}F.stats.dmg+=fin;
  if(out==='P'&&T.hasPro&&!T.protBroken&&RULES.protDmg&&T.pf>0&&roll(1,6)===1){T.protBroken=true;extra+=` La protesi di ${T.name} è <b>danneggiata</b>: le sue carte di protesi non si usano più in questo scontro.`;}
  if(out==='V'){T.stats.vinte++;if(F.vel!==T.vel&&T.spUsed&&RULES.noChain)extra+=` ${nm(T)} ha già usato uno Spiraglio in questo scambio: non ne ottiene un altro.`;else if(F.vel!==T.vel){if(RULES.spirNow||T.acted)T.spir[F.id]=true;else T.spirNext[F.id]=true;T.spAge=T.spAge||{};T.spAge[F.id]=curN;extra+=` ${nm(T)} ottiene lo <b>Spiraglio</b> contro ${F.name}${!RULES.spirNow&&!T.acted?' dal prossimo scambio':''}.`;}}
  if(RULES.slancio&&triP&&out==='P'&&T.pf>0&&!(RULES.noChain&&F.spUsed)){F.slanNext=2;F.stats.slan=(F.stats.slan||0)+1;extra+=` ${nm(F)} ha letto la difesa: <b>Impeto</b> (+2 Velocità nel prossimo scambio).`;}
  if(out!=='V'){
    if(out==='P'&&a.type==='Rottura'&&T.card&&defInfo(T.card)?.type==='Parata'){T.sbilNext=true;extra+=` Guardia rotta: ${T.name} sarà <b>Sbilanciato</b>.`;}
    if(e.push&&T.pf>0){const ep=e.push+(F.has('T9')?1:0);let n=(T.el==='T'||T.el==='B')?Math.min(1,ep):ep;const parr=defType==='Parata'&&out==='R';if(parr)n=Math.floor(n/2);
      if(n<=0)extra+=` La Parata regge: niente spinta.`;else{const r=pushBest(G,F,T,n,arrows);extra+=` ${r}${parr?' (spinta dimezzata dalla Parata)':''}${(T.el==='T'||T.el==='B')&&e.push>1?(T.el==='T'?' (Piedi Radicati: massimo 1)':' (Telaio d\'Acciaio: massimo 1)'):''}.`;}}
    if(e.pull&&T.pf>0&&dist(F,T)>1){const fr=[T.x,T.y],m=stepToward(G,T,F,(T.el==='T'||T.el==='B')?1:e.pull);if(m){arrows.push({a:fr,b:[T.x,T.y],team:F.team,kind:'push'});extra+=` ${T.name} è tirato di ${m} verso ${F.name}.`;}}
    if(e.trat){T.trat=T.el==='B'&&RULES.bTrat?1:RULES.tratD;if(F.has('X9')){const x=roll(1,4);F.pf=Math.min(F.pfMax,F.pf+x);extra+=` ${F.R.txt.linfa}: ${F.name} cura ${x}.`;}extra+=` ${T.name} è <b>Trattenuto</b>: non si muove, non schiva, −2 Velocità.`;}
    if(e.provoke&&T.pf>0&&!T.isPet&&RULES.provoke){T.tauntNext=F.id;extra+=` ${T.name} è <b>Provocato</b>: nel prossimo scambio deve attaccare ${F.name}.`;}
    if(e.prono){T.prono=2;extra+=` ${T.name} cade <b>Prono</b>.`;}
    if(e.slow&&RULES.stati){T.stxNext.A=1;extra+=` ${T.name} è Rallentato.`;}
    if(e.jam&&d.c.lv)extra+=jam(T);
    if(d.c.tr&&F.el==='K'&&RULES.stati&&RULES.trCorr&&T.pf>0){T.stxNext.T=RULES.corrOwn&&T.stxNext.T!==1?F.id:1;extra+=` ${T.name} è Corroso.`;}
    if(d.c.tr&&F.k7B){F.st=Math.min(F.stMax,F.st+2);extra+=` Riflusso: ${F.name} recupera 2 stamina.`;}
    if(F.has('B4')&&!ranged&&T.pf>0&&RULES.stati){T.stxNext.A=1;extra+=` Anestetico: ${T.name} è Rallentato.`;}
    if(o.baseEl&&RULES.stati){if(o.baseEl==='J')extra+=jam(T);else if(o.baseEl==='F')o.burn=true;else if(o.baseEl==='V'){F.stxNext.V=1;extra+=` ${F.name} ${F.R.txt.sospinto}.`;}else{T.stxNext[o.baseEl]=1;extra+=` ${T.name} è ${F.R.ST_TXT[o.baseEl]}.`;}}
    if((o.burn||(e.burn&&d.c.lv))&&!T.isPet){T.burn=(RULES.burnT==='base'?2:3);if((T.el==='T'||T.el==='B')&&RULES.earthSmother)T.burn=1;T.burnHot=F.el==='F';T.burnNome=F.R.txt.brucia;extra+=` ${T.name} ${F.R.txt.brucia}.`;}
    if(!ranged&&T.post.includes('Manto di Brace')){const x=roll(1,6);F.pf-=x;extra+=` Il Manto di Brace scotta ${F.name}: −${x}.`;}if(!ranged&&T.post.includes('Corazza di Lava')){const x=roll(1,4);F.pf-=x;extra+=` La Corazza di Lava scotta ${F.name}: −${x}.`;}if(!ranged&&T.post.includes('Baionetta Innestata')){const x=roll(1,6);F.pf-=x;extra+=` La Baionetta ferisce ${F.name}: −${x}.`;}
    if(!ranged&&T.post.includes('Caldaia Rovente')){const x=roll(1,4);F.pf-=x;extra+=` La Caldaia Rovente scotta ${F.name}: −${x}.`;}
    // interruzione
    const I=RULES.interr,diff=F.vel-T.vel;
    if(!T.acted&&T.card&&diff>0&&I!=='no'&&(I!=='piena2'||diff>=2)&&T.pf>0){let k=null;
      if(I==='leggera'){if(out==='P')k='half';}else{if(out==='P')k='skip';else if(out==='R')k='half';}
      if(k&&T.interr!=='skip'){T.interr=k;F.stats.interr++;extra+=` <b>Interruzione</b>: ${T.name} ${k==='skip'?'perde il tempo e non attaccherà':'risponderà a metà forza'}.`;}}
  }
  arrows.push({a:[F.x,F.y],b:[T.x,T.y],team:F.team,kind:'atk',out});
  // movimento dinamico
  if(T.pf>0&&F.pf>0){
    if(out==='V'&&e.push&&defType==='Parata')extra+=` La Parata Vinta blocca anche la spinta.`;
    if(out==='V'&&defType==='Schivata'&&T.trat<=0&&!(T.lega>0)){const r=((T.el==='A'||T.el==='K')?3:2)+(T.fz==='dono'&&T.has('V10')&&T.taken.find(t=>t.id==='V10').opt===1?2:0);const back=T.P.ai==='ranged'||T.P.ai==='healer';
      if(ranged&&!back){const fr=[T.x,T.y];const m=stepToward(G,T,F,r);if(m){extra+=` Schivata riuscita: ${T.name} ne approfitta per avvicinarsi di ${m} a chi ha tirato.`;arrows.push({a:fr,b:[T.x,T.y],team:T.team,kind:'move'});}}
      else{const m=reposition(G,T,F,ranged?Math.min(r,1)+0:r,back?'disengage':'orbit',arrows);if(m)extra+=back?` Schivata riuscita: ${T.name} si disingaggia ${m}.`:` Schivata riuscita: ${T.name} si riposiziona attorno a ${F.name} ${m}.`;}}
    if(!ranged&&e.attr&&out!=='V'&&F.trat<=0&&(out==='R'||F.pf<F.pfMax*0.4||a.type!=='Aggiramento')&&reposition(G,F,T,3,'disengage',arrows)){
      extra+=` Attraversa: ${F.name} passa oltre ${T.name} ed esce dall'ingaggio senza attacco di opportunità (niente Spiraglio).`;}
    else if(!ranged&&a.type==='Aggiramento'&&out!=='V'&&F.trat<=0){const m=reposition(G,F,T,2,'flank',arrows);
      if(m){extra+=` Aggiramento riuscito: ${F.name} sceglie di girare attorno a ${T.name} ${m}`;if(out==='P'&&!RULES.slancio&&!(RULES.noChain&&F.spUsed)){F.spir[T.id]=true;extra+=' e, essendosi spostato alle sue spalle, ottiene lo <b>Spiraglio</b>';}else if(out==='P')extra+=' (ha già usato uno Spiraglio in questo scambio: niente Spiraglio nuovo)';extra+='.';}
      else extra+=` ${F.name} non trova caselle libere attorno a ${T.name}: resta dov'è e niente Spiraglio.`;}
    if(!ranged&&out==='V'&&defType==='Contrattacco'){const K=RULES.counter;
      if(K==='respinta'&&F.el!=='T'){const r=pushBest(G,T,F,1,arrows,true);extra+=` Contrattacco riuscito: ${F.name} è ${r.replace(/^Spinto/,'respinto')}.`;}
      else if(K==='risposta'){const m=(T.card.c.b||'').match(/Contrattacco (\d+)(?: \+ (SAG|DES|FOR|INT))?/);const v=m?+m[1]+(m[2]?T.mod[m[2]]:0):2;const rd=rdOf(F);const x=Math.max(0,v-rd);hurt(F,x);T.stats.dmg+=x;extra+=` Colpo di risposta: ${T.name} incontra il colpo col suo e infligge subito ${x} a ${F.name}${F.pf<=0?', che va a terra':''}.`;}
      else if(K==='sbilancia'){F.sbilNext=true;extra+=` Contrattacco riuscito: ${F.name} perde l'equilibrio e sarà <b>Sbilanciato</b>.`;}
      else if(K==='lega'){F.lega=2;extra+=` Contrattacco riuscito: ${F.name} è <b>legato</b> a ${T.name}: nel prossimo scambio non può allontanarsi.`;}}
  }
  L.push(`→ ${nm(T)} ${dtxt} → <b>${fin} ${fin===1?'danno':'danni'}</b>${T.pf<=0?' · <b>'+T.name+' è a terra</b>':''}.${extra}`);
}
function exchange(G,n,manual){const man=F=>manual&&manual[F.id]&&!manual[F.id].ai?manual[F.id]:null;
  const L=[],arrows=[];curN=n;const alive=()=>G.fs.filter(f=>f.pf>0);
  alive().forEach(F=>{F.spUsed=false;F.slan=F.slanNext||0;F.slanNext=0;if(RULES.spExp&&F.spAge)for(const k in F.spir)if(F.spAge[k]<n-1){delete F.spir[k];}if(n>1){if(F.noRec){F.noRec=false;if(RULES.fulm==='mezzo')F.st+=1;}else F.st=Math.min(F.stMax,F.st+RULES.stRec);}F.debtNow=false;F.exh=false;if(F.adoUsed&&F.adoUsed<n)F.adoUsed=0;F.sbil=F.sbilNext;F.sbilNext=false;Object.assign(F.spir,F.spirNext);F.spirNext={};
    F.stx=F.stxNext;F.stxNext={};F.bDmg=F.bDmgNext;F.bDmgNext=0;F.bVel=F.bVelNext;F.bVelNext=0;F.taunt=F.tauntNext;F.tauntNext=null;
    F.defCount=0;F.rdTmp=0;F.movedNow=0;F.x3=false;F.acted=false;F.interr=null;F.card=null;F.tgt=null;F.vel=0;});
  const moves=[];const sp0=new Map(G.fs.map(F=>[F.id,{...F.spir,...F.spirNext}]));
  alive().sort((a,b)=>b.mod.DES-a.mod.DES).forEach(F=>{const fx=F.x,fy=F.y;if(F.isPet){const m=petMove(G,F);if(m){moves.push({a:[fx,fy],b:[F.x,F.y],team:F.team});L.push(`${nm(F)} avanza di ${m}.`);}return;}if(F.trat>0){L.push(`${nm(F)} è Trattenuto e non si muove.`);return;}
    const adj0=enemies(G,F).filter(o=>dist(F,o)<=1);const s=man(F)?applyMove(G,F,man(F).move,L):moveAI(G,F);F.stats.moved+=s;F.movedNow=s;
    if(s&&RULES.ado&&!(RULES.v4ado&&F.has('V4')))adj0.filter(o=>o.pf>0&&dist(F,o)>1&&!(o.trat>0||o.prono>0||o.sbil)&&!o.adoUsed).forEach(o=>{o.adoUsed=n;const v=3+Math.max(o.mod.SAG,o.mod.DES,o.mod.FOR,o.mod.INT||0),x=Math.max(0,v-rdOf(F));hurt(F,x);o.stats.dmg+=x;o.stats.ado=(o.stats.ado||0)+1;L.push(`${nm(o)} colpisce ${nm(F)} che si disimpegna senza Schivata né Aggiramento: <b>attacco di opportunità</b>, ${x} danni.`);arrows.push({a:[o.x,o.y],b:[F.x,F.y],team:o.team,kind:'atk',out:'P'});});
    if(s){moves.push({a:[fx,fy],b:[F.x,F.y],team:F.team});L.push(`${nm(F)} ${F.lastDash?'scatta':'si muove'} di ${s} ${s===1?'casella':'caselle'} (−${F.lastCost} stamina${F.lastCost<s?(F.el==='V'?', passi leggeri del vento':F.el==='M'?', molle ai piedi':(F.fz==='dono'?', Vento che Attizza':'')):''}).`);}});
  const acts=alive();
  acts.forEach(F=>{if(F.isPet){F.card=null;F.adj=[];F.vel=F.pvel-(F.stx.A?1:0)-(F.trat>0?2:0);return;}F.stats.turns++;F.stats.stSum+=F.st;if(F.st<=2)F.stats.low++;let ch=man(F)?pickManual(G,F,man(F)):choose(G,F);
    if(!ch.d&&F.hand.length){const d=F.hand.filter(x=>defInfo(x)).sort((a,b)=>velOf(F,b)-velOf(F,a))[0]||F.hand[0];ch={d,t:null};F.exh=true;F.stats.exh++;}
    if(ch.d){F.hand.splice(F.hand.indexOf(ch.d),1);if(!F.exh){const k=costOf(ch.d,F);if(k>F.st){F.stats.debt++;F.debtNow=true;if(RULES.fulm==='scarica'){const x=2*(k-Math.max(0,F.st));F.pf-=x;F.stats.selfDmg=(F.stats.selfDmg||0)+x;L.push(`${nm(F)} va in Sovraccarico: la scarica gli costa ${x} PF.`);}}F.st-=k;if(F.st<0&&(RULES.fulm==='pieno'||RULES.fulm==='mezzo'))F.noRec=true;}F.card=ch.d;F.tgt=ch.t;F.vel=velOf(F,ch.d);{const gm=(ch.d.c.b||'').match(/Guardiano per (\d)/);if(gm&&RULES.guard){F.guard=n+(+gm[1])-1;L.push(`${nm(F)} si mette di Guardia: per ${gm[1]} scambi difende gli alleati adiacenti.`);}}
      const adj=[];if(RULES.stati){if(F.stx.L){F.vel--;adj.push('Elettrizzato −1');}if(F.stx.A){F.vel--;adj.push(nomeStato(F,'A')+' −1');}if(F.stx.V){F.vel++;adj.push(nomeStato(F,'V')+' +1');}}
      if(F.trat>0){F.vel-=2;adj.push('Trattenuto −2');}if(F.prono>0){F.vel-=2;adj.push('Prono −2');}if(F.bVel){F.vel+=F.bVel;adj.push('Riflessi +'+F.bVel);}if(F.slan){F.vel+=F.slan;adj.push('Impeto +'+F.slan);}
      F.adj=adj;}else F.adj=[];});
  const cards=acts.filter(F=>!F.isPet).map(F=>({id:F.id,name:F.name,team:F.team,card:F.card,vel:F.vel,adj:F.exh?[...F.adj,'Esausto: solo difesa']:F.debtNow?[...F.adj,'Sovraccarico: va in debito']:F.adj,tgt:F.tgt?F.tgt.name:null,cost:F.card&&!F.exh?costOf(F.card,F):0}));
  const pos=snap(G);
  acts.sort((a,b)=>b.vel-a.vel);
  const groups=[];acts.forEach(F=>{const g=groups[groups.length-1];if(g&&g[0].vel===F.vel)g.push(F);else groups.push([F]);});
  groups.forEach(g=>{if(g.length>1&&g.filter(f=>f.card).length>1)L.push(`Velocità ${g[0].vel} per ${g.map(nm).join(' e ')}: agiscono insieme.`);
    g.forEach(F=>{if(F.pf<=0){F.acted=true;return;}if(F.isPet){petAttack(G,F,L,arrows);F.acted=true;return;}if(!F.card){L.push(`${nm(F)} non ha stamina per nessuna carta e resta scoperto.`);F.acted=true;return;}
      if(F.interr==='skip'){L.push(`${nm(F)} è stato interrotto: la sua <i>${esc(F.card.c.n)}</i> serve solo a difendersi.`);F.acted=true;return;}
      act(G,F,L,arrows);});
    g.forEach(F=>F.acted=true);});
  // Spiragli incrociati nello stesso scambio (ancora non usati) si annullano
  if(RULES.spirCancel)G.fs.forEach(F=>G.fs.forEach(O=>{if(F.id>=O.id||F.team===O.team)return;const fNew=(F.spir[O.id]||F.spirNext[O.id])&&!sp0.get(F.id)[O.id],oNew=(O.spir[F.id]||O.spirNext[F.id])&&!sp0.get(O.id)[F.id];
    if(fNew&&oNew){delete F.spir[O.id];delete F.spirNext[O.id];delete O.spir[F.id];delete O.spirNext[F.id];L.push(`${nm(F)} e ${nm(O)} si sono aperti un varco a vicenda nello stesso scambio: i due <b>Spiragli si annullano</b>.`);}}));
  G.fs.forEach(F=>{if(F.card){if(!F.card.c.post&&!(F.card.c.tr&&!F.has('K15')&&!F.exh))F.disc.push(F.card);ingEnd(G,F,L);if(F.card.c.s&&!F.card.c.lv){F.chain.push(F.card.c.s==='del tuo elemento'?'Jolly':F.card.c.s);if(F.chain.length>3)F.chain.shift();}
      if(F.has('C7')&&fxOf(F.card.c).cat!=='atk')F.fl=Math.min(F.flMax,F.fl+1);}
    if(F.isPet){if(F.pf<=0&&F.owner.has('M15')&&!F.rebuilt&&F.owner.pf>0){F.rebuilt=true;F.pf=Math.floor(F.pfMax/2);L.push(`Fabbrica da Campo: ${nm(F)} si ricostruisce (${F.pf}).`);}
      if(F.pf>0&&F.kind==='automa'&&F.owner.m6===0)enemies(G,F).filter(o=>dist(o,F)<=1&&!o.isPet).forEach(o=>o.tauntNext=F.id);
      F.burn=0;if(F.trat>0)F.trat--;if(F.prono>0)F.prono--;return;}
    if(F.pf<=0)return;
    if(F.burn>0){const fan=RULES.burnFan&&F.movedNow>=2,x=(RULES.burnT==='base'?2:RULES.burnT==='dot3'?roll(1,4):roll(1,4)+1)+(F.burnHot?1:0)+(fan?RULES.fanN:0);F.pf-=x;F.burn--;L.push(`${nm(F)} ${F.burnNome||'Brucia'}: −${x} PF${F.burnHot?' (Sangue Caldo)':''}${fan?((F.burnNome||'Brucia')==='Brucia'?' (si è mosso e ha alimentato le fiamme)':' (si è mosso e la ferita si è riaperta)'):''}.`);}
    if(F.regen>0){const x=roll(1,6);F.pf=Math.min(F.pfMax,F.pf+x);F.regen--;L.push(`${nm(F)} è curato dalle Radici: +${x}.`);}
    if(F.trat>0)F.trat--;if(F.lega>0)F.lega--;if(F.prono>0)F.prono--;if(F.rd5>0)F.rd5--;
    const z=F.hand.find(d=>d.c.zav);if(z&&F.st>=1){F.hand.splice(F.hand.indexOf(z),1);F.disc.push(z);F.st-=1;L.push(`${nm(F)} scarta la zavorra <i>${esc(z.c.n)}</i> (−1 stamina).`);}
    drawCard(F,L);});
  return{n,lines:L,moves,arrows,cards,pos,end:snap(G)};
}
function ingTxt(F){const r=[];if(F.integMax)r.push(`Integrità ${F.integ}/${F.integMax}`);if(F.isPet)r.push(F.kind==='torretta'?'torretta, spara da sola':'automa, attacca da solo');if(F.deckList.some(d=>/Sparo/.test(d.c.a||'')))r.push(`Colpi ${F.ammo}/${F.ammoMax}`);if(F.deckList.some(d=>d.c.tr))r.push(`Logoramento ${F.logo}`);if(F.hasPro)r.push(F.protBroken?'Protesi danneggiata':`Pressione ${F.press}/${F.pressMax}${F.hotUntil>=curN?' (surriscaldata)':''}`);return r.join(' · ');}
function snap(G){return G.fs.map(F=>({pet:F.isPet?F.kind:null,id:F.id,name:F.name,team:F.team,el:F.el,x:F.x,y:F.y,pf:F.pf,pfMax:F.pfMax,st:F.st,fl:F.fl,ing:ingTxt(F),chain:[...F.chain],post:[...F.post],
  stati:[...Object.keys(F.stxNext).map(k=>nomeStato(F,k)),...(F.burn?[F.burnNome||'Brucia']:[]),...(F.trat?['Trattenuto']:[]),...(F.prono?['Prono']:[]),...(F.sbilNext?['Sbilanciato']:[]),...(Object.keys(F.spir).length||Object.keys(F.spirNext).length?['Spiraglio']:[])]}));}
function runFight(cfg,seed,lvl){
  RND=rngF(seed*7919+13);
  const G={obs:new Map(MAPS[cfg.map].obs.map(([x,y,t])=>[key(x,y),t])),fs:[]},ys=[4,2,6,0,8];
  const sl=b=>typeof b==='number'?{fz:cfg.fz||'dono',bi:b}:b;cfg.A.map(sl).forEach((b,i)=>{const F=mkF(b.fz,b.bi,'A',i,lvl);F.x=1;F.y=ys[i];G.fs.push(F);});
  cfg.B.map(sl).forEach((b,i)=>{const F=mkF(b.fz,b.bi,'B',i,lvl);F.x=W-2;F.y=ys[i];G.fs.push(F);});
  const cnt={};G.fs.forEach(F=>cnt[F.name]=(cnt[F.name]||0)+1);const seen={};
  G.fs.forEach(F=>{if(cnt[F.name]>1){seen[F.name]=(seen[F.name]||0)+1;F.name+=' '+seen[F.name];}});
  spawnAutomi(G);const start=snap(G),ex=[];const up=t=>G.fs.some(F=>F.team===t&&F.pf>0&&!F.isPet);
  for(let n=1;n<=25&&up('A')&&up('B');n++)ex.push(exchange(G,n));
  RND=Math.random;
  const a=up('A'),b=up('B');const res=a&&!b?'A':b&&!a?'B':'pari';
  return{G,ex,start,res};}

/* ===================== API PER L'APP: partita manuale =====================
   const G = nuovaPartita({map:'casse', A:[{fz:'dono',bi:0,L:5,scheda?}, {fz:'ingegno',bi:3,L:5}], B:[...]});
   piani[F.id] = {move:[x,y]|null, ci:indice in F.hand|null, t:id bersaglio|null}  oppure {ai:true}
   (automi e torrette, F.isPet, giocano sempre da soli: non servono piani)
   const ris = risolviScambio(G, piani);  -> {lines, cards, moves, arrows, pos, end};  G.over = null|'A'|'B'|'pari'
*/
const freeVOf=F=>F.el==='V'?2:0;
function stPlan(G,F){return G.n>0&&!F.noRec?Math.min(F.stMax,F.st+RULES.stRec):F.st;}
function reachFor(G,F,st){if(F.trat>0||F.lega>0)return new Map([[key(F.x,F.y),0]]);const fv=freeVOf(F);let b=Math.min(4+fv,Math.max(0,st)+fv);
  if(enemies(G,F).some(o=>dist(F,o)<=1&&o.has('T6')))b=Math.min(b,1);return bfs(G,F,b);}
function applyMove(G,F,mv,L){F.lastCost=0;F.lastDash=false;if(!mv||F.trat>0||F.lega>0)return 0;
  const R=reachFor(G,F,F.st),steps=R.get(key(mv[0],mv[1]));
  if(steps==null){L.push(`${nm(F)} non riesce più a raggiungere la casella scelta (occupata o fuori portata) e resta fermo.`);return 0;}
  const cost=Math.max(0,steps-freeVOf(F));if(!steps||cost>F.st)return 0;F.st-=cost;F.lastCost=cost;F.x=mv[0];F.y=mv[1];return steps;}
function pickManual(G,F,p){if(p.ci==null)return{d:null,t:null};const d=F.hand[p.ci];if(!d||costOf(d,F)>F.st||!proOk(F,d,curN))return{d:null,t:null};
  let t=p.t?G.fs.find(o=>o.id===p.t)||null:null;const e=fxOf(d.c);if(e.cat==='heal'&&!t)t=F;return{d,t};}
const umani=G=>G.fs.filter(F=>!F.isPet);
function nuovaPartita(cfg){RND=Math.random;curN=1;const G={obs:new Map(MAPS[cfg.map].obs.map(([x,y,t])=>[key(x,y),t])),fs:[],map:cfg.map,n:0,over:null},ys=[4,2,6,0,8];
  ['A','B'].forEach(side=>cfg[side].forEach((c,i)=>{const F=mkF(c.fz||'dono',c.bi,side,i,c.L,c.scheda||null);F.x=side==='A'?1:W-2;F.y=ys[i];G.fs.push(F);}));
  const cnt={};G.fs.forEach(F=>cnt[F.name]=(cnt[F.name]||0)+1);const seen={};
  G.fs.forEach(F=>{if(cnt[F.name]>1){seen[F.name]=(seen[F.name]||0)+1;F.name+=' '+seen[F.name];}});
  spawnAutomi(G);return G;}
const personaggio=(G,id)=>G.fs.find(f=>f.id===id);
function caselleRaggiungibili(G,F){const sp=stPlan(G,F),R=reachFor(G,F,sp),out=new Map();for(const[k,s]of R){if(Math.max(0,s-freeVOf(F))<=sp)out.set(k,s);}return out;}
function costoMovimento(G,F,move){if(!move)return 0;const s=reachFor(G,F,stPlan(G,F)).get(key(...move));return s==null?0:Math.max(0,s-freeVOf(F));}
function allaPosizione(F,move,fn){const ox=F.x,oy=F.y;if(move){F.x=move[0];F.y=move[1];}try{return fn();}finally{F.x=ox;F.y=oy;}}
function bersagliCarta(G,F,d,move){const e=fxOf(d.c);
  return allaPosizione(F,move,()=>{if(e.cat==='atk')return{kind:'atk',list:targetsFor(G,F,e)};
    if(e.cat==='heal'){if(e.hall)return{kind:'auto',txt:'cura tutti gli alleati entro '+e.range};return{kind:'heal',list:G.fs.filter(o=>o.team===F.team&&!o.isPet&&dist(F,o)<=e.range&&(o.pf>0||e.revive))};}
    if(e.cat==='repair'){if(e.hall)return{kind:'auto',txt:'ripara tutti entro '+e.range};return{kind:'heal',list:G.fs.filter(o=>o.team===F.team&&o.pf>0&&dist(F,o)<=e.range&&(o.isPet||o.integMax>0))};}
    return{kind:'auto',txt:{buff:'alleati entro 3',taunt:'nemici entro 2',self:'su di sé',post:'postura su di sé',zav:'zavorra: non fa nulla',summon:'piazza una torretta vicino a te',command:'ordine al tuo automa',none:'effetto non simulato'}[e.cat]||''};});}
function motivoCartaNonGiocabile(G,F,d,move){const k=costOf(d,F),avail=stPlan(G,F)-costoMovimento(G,F,move);if(k>avail)return `servono ${k} stamina, ne hai ${avail} dopo il movimento`;
  if(d.c.lv&&!tecReady(F,d))return F.fz==='dono'?'la catena di sigilli non è pronta':'i pezzi sul banco non bastano';
  if(!proOk(F,d,G.n+1))return 'protesi surriscaldata o danneggiata';
  if(/Sparo/.test(d.c.a||'')&&F.ammo<shotNeed(fxOf(d.c)))return 'tamburo vuoto: serve una carta con Ricarica';return '';}
function risolviScambio(G,piani){G.n++;RND=Math.random;const ris=exchange(G,G.n,piani);
  const up=t=>G.fs.some(F=>F.team===t&&F.pf>0&&!F.isPet),a=up('A'),b=up('B');if(!a||!b)G.over=a?'A':b?'B':'pari';else if(G.n>=60)G.over='pari';return ris;}
const istantanea=snap;
const testoSemplice=h=>String(h).replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&amp;/g,'&');

/* ===================== API PER L'APP: crescita del personaggio =====================
   La scheda è JSON puro: {fz, bi, el, level, taken, deck, ...}. Si copia con JSON.parse(JSON.stringify(s)) per "torna indietro". */
const reteDi=s=>RETI[s.fz];
function nuovaScheda(fz,bi){return conRete(RETI[fz],()=>{const s=newState(BUILDS[bi].el);s.bi=bi;s.fz=fz;return s;});}
function schedaConsigliata(fz,bi,L){return conRete(RETI[fz],()=>{const s=JSON.parse(JSON.stringify(buildAt(bi,L)));s.bi=bi;s.fz=fz;s.pending=null;return s;});}
const nomeRegione=(R,r)=>r==='C'?'Centro':r==='X'?'Incrocio':R.EL[r].name;
function requisitiNodo(s,id){return conRete(reteDi(s),()=>check(id,s).why);}
function nodiDisponibili(s){if(s.pending||s.level>=LMAX)return [];const R=reteDi(s);return conRete(R,()=>
  Object.values(N).filter(n=>check(n.id,s).ok).map(n=>{const o=nodeOptions(n,s);return{id:n.id,nome:n.name,tipo:n.type,descrizioneTipo:TYPES[n.type]||'',
    regione:n.reg,nomeRegione:nomeRegione(R,n.reg),anello:n.ring||0,ramo:n.br&&n.br!=='—'?n.br:'',testo:n.text||'',
    carte:n.cards||[],zavorre:n.zav||[],opzioni:o?o.map(x=>({nome:x.label,testo:x.text||'',carte:x.cards||[]})):null};}));}
function prendiNodo(s,id,opt){return conRete(reteDi(s),()=>{if(s.pending)throw new Error('Prima risolvi la scelta in sospeso');
  const c=check(id,s);if(!c.ok)throw new Error('Nodo non disponibile: '+c.why.join(' '));
  const o=nodeOptions(N[id],s);if(o&&(opt==null||!o[opt]))throw new Error('Scegli una delle opzioni del nodo');
  const p=st;st=s;try{take(id,o?opt:undefined);}finally{st=p;}return sceltaInSospeso(s);});}
const POTENZIAMENTI=['+1 Velocità','−1 stamina'];
function sceltaInSospeso(s){const p=s.pending;if(!p)return null;
  if(p.kind==='replace')return{tipo:'sostituisci',testo:'Il mazzo è pieno (24 carte): scegli quale carta sostituire con la nuova.',carta:p.c};
  if(p.kind==='affina')return{tipo:'affina',testo:p.filter==='univ'?'Puoi togliere fino a '+p.left+' carte universali o zavorre (facoltativo).':'Puoi togliere fino a '+p.left+' carte (facoltativo).',restano:p.left,soloUniversaliOZavorre:p.filter==='univ',minimoMazzo:10};
  if(p.kind==='maestria')return{tipo:'maestria',testo:'Scegli una carta del mazzo (max 3 potenziamenti per carta) e un potenziamento.',potenziamenti:POTENZIAMENTI};
  return null;}
function sostituisciCarta(s,u){const p=s.pending;if(!p||p.kind!=='replace')throw new Error('Nessuna sostituzione in sospeso');
  const i=s.deck.findIndex(d=>d.u===u);if(i<0)throw new Error('Carta non trovata');
  conRete(reteDi(s),()=>{const q=st;st=s;try{s.deck.splice(i,1,inst(s,p.c,p.src));s.queue.shift();s.pending=null;flush();}finally{st=q;}});return sceltaInSospeso(s);}
function cartaTogliibile(s,u){const p=s.pending,d=s.deck.find(d=>d.u===u);if(!p||p.kind!=='affina'||!d)return 'nessun affinamento in corso';
  if(s.deck.length<=10)return 'il mazzo non può scendere sotto 10 carte';if(p.filter==='univ'&&!(d.src==='Universale'||d.c.zav))return 'questo nodo toglie solo carte universali o zavorre';return '';}
function affinaTogli(s,u){const w=cartaTogliibile(s,u);if(w)throw new Error(w);const p=s.pending;s.deck.splice(s.deck.findIndex(d=>d.u===u),1);p.left--;if(p.left<=0)s.pending=null;return sceltaInSospeso(s);}
function affinaFine(s){if(s.pending&&s.pending.kind==='affina')s.pending=null;return sceltaInSospeso(s);}
function maestriaApplica(s,u,pot){const p=s.pending,d=s.deck.find(d=>d.u===u);if(!p||p.kind!=='maestria')throw new Error('Nessuna Maestria in sospeso');
  if(!d)throw new Error('Carta non trovata');if(d.mods.length>=3)throw new Error('Questa carta ha già 3 potenziamenti');if(!POTENZIAMENTI.includes(pot))throw new Error('Potenziamento non valido');
  d.mods.push(pot);s.taken[s.taken.length-1].label+=' → '+d.c.n+' ('+pot+')';s.pending=null;return null;}
const schedaPronta=(s,L)=>s.level===L&&!s.pending;
function riepilogoScheda(s){const R=reteDi(s);return{fazione:R.nome,base:R.BUILDS[s.bi]?.name,elemento:R.EL[s.el].name,secondo:s.second?R.EL[s.second].name:null,terzo:s.third?R.EL[s.third].name:null,livello:s.level,
  nodi:s.taken.map(t=>({livello:t.lvl,id:t.id,nome:t.label})),mazzo:s.deck.map(d=>({u:d.u,carta:d.c,potenziamenti:d.mods,origine:d.src==='Ingresso'||d.src==='Universale'?d.src:(R.N[d.src]?.name||d.src)}))};}
// elenco delle basi per la preparazione
const basi=()=>Object.values(RETI).flatMap(R=>R.BUILDS.map((b,bi)=>({fz:R.id,fazione:R.nome,bi,nome:b.name,breve:R.PROF[bi].short,el:b.el,elemento:R.EL[b.el].name})));
