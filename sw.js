/* Service worker: fa funzionare l'app anche senza rete.
   Regole e dati (dati-*.js, motore.js, app.js) si prendono prima dalla rete,
   così un aggiornamento del bilanciamento arriva subito; il resto dalla cache.
   Cambia VERSIONE quando cambi l'elenco dei file. */
const VERSIONE='fd-v1';
const FILE=['./','index.html','guida.html','stile.css','app.js','motore.js','dati-dono.js','dati-ingegno.js','manifest.webmanifest','icone/icona-192.png','icone/icona-512.png'];
const PRIMA_RETE=/(dati-[a-z]+|motore|app)\.js$|\/$|index\.html$/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSIONE).then(c=>c.addAll(FILE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSIONE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(PRIMA_RETE.test(u.pathname)){
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VERSIONE).then(x=>x.put(r,c));return res;}).catch(()=>caches.match(r,{ignoreSearch:true})));
  }else{
    e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{const c=res.clone();caches.open(VERSIONE).then(x=>x.put(r,c));return res;})));
  }
});
