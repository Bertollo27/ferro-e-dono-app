/* Ferro & Dono — DATI DONO: carte, nodi della Ragnatela, build consigliate, profili.
   Per aggiornare il bilanciamento basta sostituire questo file. */
const DONO=(()=>{
const ORDER=['F','V','A','T']; // anello: Fuoco – Vento – Acqua – Terra; ogni elemento tocca i due vicini
const card=(n,v,c,a,b,s,x={})=>Object.assign({n,v,c,a,b,s},x);
const tec=(n,lv,seq,a,x={})=>Object.assign({n,v:null,c:null,a,b:null,s:null,lv,seq},x);
const zav=(n,v,a)=>({n,v,c:0,a,b:null,s:null,zav:true});
const UNIV=[
  {q:2,c:card('Passo Rapido',8,1,'Aggiramento 2 + DES','Schivata di 1 casella','Topo',{prov:true})},
  {q:2,c:card('Guardia',5,1,'Colpo 2 + FOR','Parata 3 + COS','Bue',{prov:true})}];

const EL={
 F:{name:'Fuoco',role:'Danno puro: non sposta nessuno e non scappa, chiude le vie di fuga con le aree',branches:['Lama','Inferno','Focolare'],
  bdesc:{Lama:'mischia con l\'arma',Inferno:'area e distanza',Focolare:'il danno del gruppo'},
  ingr:[{q:2,c:card('Palmo di Brace',6,2,'Colpo 4 + SAG; tecnica Base, +1d6 fuoco e il bersaglio Brucia','Parata 3 + SAG','Tigre')},
   {q:2,c:card('Taglio Infuocato',7,2,'Colpo 4 + SAG','Contrattacco 3 + SAG','Serpente')},
   {q:2,c:card('Guardia di Brace',5,1,'Rottura 3 + SAG','Parata 4 + SAG','Drago')},
   {q:1,c:card('Passo del Fumo',8,1,'Aggiramento 2 + DES','Schivata','Uccello')},
   {q:1,c:card('Respiro Caldo',6,1,'Colpo 2 + SAG','Parata 2','Jolly')}],
  tal:'Sangue Caldo: il Brucia che infliggi fa +1 danno. Fuori: accendi fuochi senza attrezzi, vantaggio contro il freddo.'},
 V:{name:'Vento',role:'Mobilità: corre, colpisce in corsa, esce dall\'ingaggio; sposta sé e gli altri, ma meno di Acqua e Terra',branches:['Raffica','Corrente','Vuoto'],
  bdesc:{Raffica:'colpire in corsa: Slancio e Attraversa',Corrente:'movimento e stamina agli alleati',Vuoto:'evasione, sostituzioni, disingaggio'},
  ingr:[{q:2,c:card('Lama di Vento',5,2,'Aggiramento a distanza 3, 2 + SAG','Schivata','Uccello')},
   {q:2,c:card("Ventaglio d'Acciaio",6,2,'Aggiramento 4 + DES','Parata 3 + DES','Serpente')},
   {q:2,c:card('Raffica in Corsa',7,2,'Colpo 3 + DES, Slancio 3','Parata 2 + DES','Topo')},
   {q:1,c:card('Raffica',7,1,'Colpo a distanza 3, 1 + SAG, spinge di 2; tecnica Base. In alternativa tiri un alleato di 2 verso di te','Schivata','Tigre')},
   {q:1,c:card('Brezza',7,1,'Aggiramento 2 + DES','Schivata','Jolly')}],
  tal:'Piede Leggero: le prime 2 caselle di movimento di ogni Scambio sono gratis, i danni da caduta sono dimezzati. Fuori: salti il doppio, vantaggio su Acrobazia.'},
 A:{name:'Acqua',role:'Cura e si riposiziona meglio di tutti: scivola tra i nemici e porta via gli alleati',branches:['Sorgente','Onda','Marea'],
  bdesc:{Sorgente:'cure',Onda:'riposizionarsi e spostare gli alleati',Marea:'proteggere, respingere, trattenere'},
  ingr:[{q:2,c:card("Frusta d'Acqua",6,2,'Colpo a distanza 2, 3 + SAG','Schivata','Serpente')},
   {q:2,c:card('Scudo di Marea',5,2,'Rottura 4 + SAG, spinge di 2','Parata 5 + SAG','Bue')},
   {q:2,c:card("Passo dell'Onda",8,1,'Aggiramento 2 + SAG, Attraversa','Schivata','Topo')},
   {q:1,c:card('Goccia che Cura',5,1,'Tecnica Base, cura 1d8 + SAG entro 3','Schivata','Uccello')},
   {q:1,c:card('Rugiada',6,1,'Rottura 2 + SAG, spinge di 2','Parata 2','Jolly')}],
  tal:"Scorrere: le tue Schivate Vinte ti riposizionano fino a 3 caselle, e passi tra due nemici adiacenti senza attacchi di opportunità. Fuori: trattieni il fiato 10 minuti, vantaggio su Nuotare e Medicina."},
 T:{name:'Terra',role:'Difesa: regge più di tutti e sposta gli altri meglio di tutti; lenta e inamovibile',branches:['Montagna','Frana','Radici'],
  bdesc:{Montagna:'tank, provocazioni, Guardiano',Frana:'spinte, prese, terreno',Radici:'proteggere il gruppo: muri, coperture, ancoraggio'},
  ingr:[{q:2,c:card('Pugno di Roccia',4,3,'Rottura 7 + SAG','Parata 5 + SAG','Bue')},
   {q:2,c:card('Lancia di Pietra',5,2,'Colpo a distanza 3, 4 + SAG','Contrattacco 3 + SAG','Drago')},
   {q:2,c:card('Muro Basso',4,2,'Rottura 4 + SAG, spinge di 2','Parata 3 + SAG, Vinta anche contro lo Sparo','Bue')},
   {q:1,c:card('Passo Sicuro',6,1,'Colpo 2 + SAG','Schivata','Topo')},
   {q:1,c:card('Polvere',5,1,'Colpo 2 + SAG','Parata 2','Jolly')}],
  tal:'Piedi Radicati: non puoi essere spinto di più di 1 casella e le tue Parate hanno +1. Fuori: senti i passi attraverso il suolo entro 10 caselle.'}
};

const WEAP={
 katana:[card('Fendente di Katana',7,2,'Colpo 5 + DES','Contrattacco 3 + DES','del tuo elemento',{prov:true}),card('Iaido',9,2,'Colpo 4 + DES','Schivata','del tuo elemento',{prov:true})],
 naginata:[card('Spazzata di Naginata',5,2,'Rottura 5 + FOR, portata 2','Parata 4 + FOR','del tuo elemento',{prov:true}),card('Affondo Lungo',6,2,'Colpo 4 + FOR, portata 2','Contrattacco 3 + FOR','del tuo elemento',{prov:true})],
 tessen:[card('Ventaglio Tagliente',7,1,'Aggiramento 3 + DES','Parata 3 + DES','del tuo elemento',{prov:true}),card('Chiusura di Tessen',6,2,'Rottura 4 + DES','Parata 4','del tuo elemento',{prov:true})],
 kunai:[card('Lancio di Kunai',9,1,'Colpo a distanza 4, 3 + DES','Schivata','del tuo elemento',{prov:true}),card('Kunai Rovescio',8,2,'Aggiramento 4 + DES','Contrattacco 3 + DES','del tuo elemento',{prov:true})],
 kusarigama:[card('Catena Avvolgente',6,2,'Aggiramento 3 + DES, il bersaglio è Trattenuto','Schivata','del tuo elemento',{prov:true}),card('Falce Rotante',5,2,'Colpo 4 + DES, portata 3','Parata 3','del tuo elemento',{prov:true})]
};

const N={}; // nodi
function add(id,o){o.id=id;o.reg=o.reg||id[0];N[id]=o;}
// ---- centro
add('C1',{reg:'C',name:'Arma Incanalata',type:'Scuola',text:"Scegli un'arma e ricevi le sue 2 carte; i loro sigilli seguono il tuo elemento. (Le carte delle armi non sono ancora scritte nel documento: qui sono provvisorie.)",
  opts:Object.keys(WEAP).map(k=>({label:k[0].toUpperCase()+k.slice(1),cards:WEAP[k]}))});
add('C2',{reg:'C',name:'Flusso Profondo',type:'Talento',text:'+3 Flusso massimo. Fuori: percepisci Risonanti e varchi del Velo entro 30 metri.'});
add('C3',{reg:'C',name:'Sigilli Rapidi',type:'Carta',text:'Ricevi 2 copie di Sigillo Fulmineo.',cards:[card('Sigillo Fulmineo',10,0,'Nessun attacco, conta come sigillo jolly','Schivata di 1 casella','Jolly'),card('Sigillo Fulmineo',10,0,'Nessun attacco, conta come sigillo jolly','Schivata di 1 casella','Jolly')]});
add('C4',{reg:'C',name:'Secondo Risveglio',type:'Talento',text:"Dal livello 5: apri l'Anello I di un secondo elemento.",elOpen:2});
add('C5',{reg:'C',name:'Terzo Risveglio',type:'Talento',text:'Dal livello 9, con 3 nodi nel secondo elemento: apri un terzo elemento.',elOpen:3});
add('C6',{reg:'C',name:'Maestria',type:'Talento',rep:3,text:'Ripetibile 3 volte. Ogni volta scegli una carta del mazzo e le dai un potenziamento: +1 Velocità, +1d6 danno, −1 stamina, una riga di Risposta, oppure cambio di tipo d\'attacco. Max 3 potenziamenti sulla stessa carta.'});
add('C7',{reg:'C',name:'Meditazione',type:'Talento',text:'+1 Flusso a ogni Scambio in cui non attacchi. Fuori: un riposo breve ricarica tutto il Flusso, vantaggio su Intuizione.'});
add('C8',{reg:'C',name:'Borsa dello Shinobi',type:'Talento',text:'Cintura a 5 consumabili e accesso a fumogeni, polvere accecante, triboli e Kunai Esplosivo (Vel 8, 2d6 in area 2x2). I consumabili non entrano nel mazzo. Fuori: vantaggio su Furtività.'});
add('C9',{reg:'C',name:'Passi del Clan',type:'Scuola',text:'Scegli 1 carta di riposizionamento.',
  opts:[{label:'Sostituzione',cards:[card('Sostituzione',10,3,'Nessuna','Scambi posto con un oggetto entro 3: difesa Vinta contro qualsiasi attacco','Topo')]},
   {label:'Scambio di Posto',cards:[card('Scambio di Posto',8,2,'Nessuna','Tu e un alleato adiacente vi scambiate di posto; lui usa la tua difesa','Uccello',{prov:true})]},
   {label:'Ritirata Coperta',cards:[card('Ritirata Coperta',6,1,'Nessuna','Arretri di 3; un alleato ottiene lo Spiraglio contro chi ti era ingaggiato','Topo',{prov:true})]},
   {label:'Balzo sul Tetto',cards:[card('Balzo sul Tetto',7,2,'Sali su un punto rialzato entro 3: da lì i tuoi attacchi hanno +1 Velocità','Schivata','Uccello',{prov:true})]}]});

// ---- Fuoco
add('F1',{ring:1,br:'Lama',name:'Lama Ardente',type:'Carta',cards:[card('Taglio di Brace',7,2,'Colpo 4 + SAG, +1d6 fuoco se completi una Base','Parata 3 + SAG','Tigre')]});
add('F2',{ring:1,br:'Inferno',name:'Fiamma Viva',type:'Scuola',text:'1 tecnica Base a scelta.',opts:[
  {label:'Scintilla Lanciata',cards:[tec('Scintilla Lanciata','Base','1 sigillo','Distanza 4, 2d6 fuoco')]},
  {label:'Brace sul Terreno',cards:[tec('Brace sul Terreno','Base','1 sigillo','Area 2x2 In fiamme')]},
  {label:'Lingua di Fuoco',cards:[tec('Lingua di Fuoco','Base','1 sigillo','Linea di 3 caselle, 1d6 a tutti')]}]});
add('F3',{ring:1,br:'Focolare',name:'Calore Interiore',type:'Talento',text:'+2 stamina massima. Fuori: resisti a fame e freddo per un giorno.'});
add('F4',{ring:1,br:'Lama',name:'Scintilla',type:'Scelta',opts:[
  {label:'A) Iai di Brace',cards:[card('Iai di Brace',9,2,'Colpo 4 + SAG','Schivata','Tigre')]},
  {label:'B) Guardia Rovente',cards:[card('Guardia Rovente',5,2,'Rottura 5 + SAG','Parata 4 + SAG; infligge 2 fuoco a chi attacca','Drago')]}]});
add('F5',{ring:1,br:'—',name:'Brace Pura',type:'Affinamento',text:'Togli fino a 2 carte universali o zavorre.',affina:'univ'});
add('F6',{ring:2,br:'Lama',name:'Manto di Brace',type:'Carta',text:'Punisce chi ti attacca, non ti protegge.',cards:[card('Manto di Brace',null,null,'Postura: chi ti colpisce in mischia subisce 1d6 fuoco',null,null,{post:true})]});
add('F7',{ring:2,br:'Lama',name:'Danza delle Braci',type:'Talento',text:'Ogni tecnica Avanzata completata ti restituisce 2 stamina.'});
add('F8',{ring:2,br:'Inferno',name:'Muro di Fiamme',type:'Carta',cards:[tec('Muro di Fiamme','Avanzata','Tigre + Drago','Linea di 4 caselle per 2 Scambi, 3d6 a chi la attraversa')]});
add('F9',{ring:2,br:'Inferno',name:'Combustione',type:'Obbligo',text:'+1d6 a tutte le tecniche di fuoco, ma aggiungi 2 Fumo negli Occhi.',zav:[zav('Fumo negli Occhi',null,'Zavorra: quando la scarti perdi 1 stamina'),zav('Fumo negli Occhi',null,'Zavorra: quando la scarti perdi 1 stamina')]});
add('F10',{ring:2,br:'Focolare',name:'Fiamma Guida',type:'Carta',cards:[card('Fiamma Guida',6,2,'Colpo a distanza 3, 3 + SAG; un alleato che colpisce lo stesso bersaglio in questo Scambio fa +1d6 fuoco','Parata 3','Uccello')]});
add('F11',{ring:2,br:'Focolare',name:'Fiamma Interiore',type:'Carta',cards:[card('Fiamma Interiore',6,1,'Alleati entro 3 caselle +2 danno nel prossimo Scambio','Schivata','Drago')]});
add('F12',{ring:3,br:'Inferno',name:'Respiro del Drago',type:'Carta',cards:[tec('Respiro del Drago','Suprema','Serpente → Tigre → Drago','Cono di 6 caselle, 6d6 fuoco, 3 Flusso')]});
add('F13',{ring:3,br:'Lama',name:'Spada del Sole',type:'Carta',cards:[tec('Spada del Sole','Suprema','Tigre → Tigre → Drago','Colpo con Velocità 10, 8 + SAG + 4d6 fuoco, il bersaglio Brucia, 3 Flusso')]});
add('F14',{ring:3,br:'Focolare',name:'Sole Nero',type:'Scelta',opts:[
  {label:'A) Fenice',text:'Una volta per scontro, a 0 PF torni a 1 e infliggi 3d6 attorno a te.',cards:[]},
  {label:'B) Forgia del Clan',text:'Le armi degli alleati fanno +1d6 fuoco per tutto lo scontro.',cards:[]}]});
add('F15',{ring:4,br:'—',name:'Cuore di Vulcano',type:'Chiave',text:'Le tecniche Base e Avanzate di fuoco non richiedono sigilli, ma ogni tecnica che usi ti infligge 1d4 danni.'});
// ---- Vento
add('V1',{ring:1,br:'Raffica',name:'Taglio che Attraversa',type:'Carta',cards:[card('Taglio che Attraversa',8,2,'Aggiramento 2 + DES, Attraversa (3 caselle): passi accanto al bersaglio e finisci non ingaggiato, senza Spiraglio','Schivata','Topo')]});
add('V2',{ring:1,br:'Corrente',name:'Vento in Poppa',type:'Carta',cards:[card('Vento in Poppa',7,1,'Tecnica Base, un alleato recupera 3 stamina e si muove gratis di 2','Schivata','Uccello')]});
add('V3',{ring:1,br:'Vuoto',name:'Sostituzione',type:'Carta',cards:[card('Sostituzione',10,3,'Nessuna','Scambi posto con un oggetto entro 3: difesa Vinta contro qualsiasi attacco, senza attacchi di opportunità','Topo')]});
add('V4',{ring:1,br:'Vuoto',name:'Passo nel Vento',type:'Talento',text:"+1 Velocità alle carte giocate come Schivata. Fuori: vantaggio su Percezione grazie a suoni e odori portati dal vento."});
add('V5',{ring:1,br:'—',name:'Aria Sottile',type:'Affinamento',text:'Togli fino a 2 carte.',affina:'all'});
add('V6',{ring:2,br:'Raffica',name:'Turbine in Corsa',type:'Carta',cards:[tec('Turbine in Corsa','Avanzata','Tigre + Uccello','Movimento di 4 caselle, Attraversa: colpisci fino a 2 bersagli accanto a cui passi, 3d6')]});
add('V7',{ring:2,br:'Raffica',name:'Taglio Sottovuoto',type:'Talento',text:'I tuoi Aggiramenti e le tue carte con Slancio ignorano la riduzione del danno delle armature.'});
add('V8',{ring:2,br:'Corrente',name:'Corrente Ascensionale',type:'Carta',cards:[tec('Corrente Ascensionale','Avanzata','Uccello + Topo','Tu e 2 alleati saltate fino a 5 caselle e ottenete la posizione elevata')]});
add('V9',{ring:2,br:'Corrente',name:'Scambio di Vento',type:'Carta',cards:[card('Scambio di Vento',9,2,'Scambi di posto con un alleato entro 4 caselle, e lui non è più ingaggiato','Schivata','Uccello')]});
add('V10',{ring:2,br:'Vuoto',name:'Velo di Vento',type:'Scelta',opts:[
  {label:'A) Contro gli Spari',text:'La tua Schivata contro uno Sparo è sempre Vinta.',cards:[]},
  {label:'B) Scia',text:'Dopo una Schivata Vinta ti muovi gratis di altre 2 caselle.',cards:[]}]});
add('V11',{ring:2,br:'Vuoto',name:'Sentiero Vuoto',type:'Obbligo',text:'Sostituzione costa 1 stamina invece di 3, ma aggiungi 2 Folata Persa.',zav:[zav('Folata Persa',1,'Zavorra: Velocità 1, nessun effetto'),zav('Folata Persa',1,'Zavorra: Velocità 1, nessun effetto')]});
add('V12',{ring:3,br:'Raffica',name:'Tifone',type:'Carta',cards:[tec('Tifone','Suprema','Tigre → Uccello → Drago',"Area 4x4, 5d6, tutti spinti di 3 caselle verso l'esterno")]});
add('V13',{ring:3,br:'Corrente',name:'Ali del Clan',type:'Carta',cards:[tec('Ali del Clan','Suprema','Uccello → Uccello → Topo','Per 3 Scambi tutti gli alleati hanno +2 Velocità e movimento gratuito, 3 Flusso')]});
add('V14',{ring:3,br:'Vuoto',name:'Passo nel Vuoto',type:'Carta',cards:[tec('Passo nel Vuoto','Suprema','Topo → Serpente → Topo','Per uno Scambio sei intangibile (ogni difesa è Vinta), poi riappari entro 8 caselle con lo Spiraglio')]});
add('V15',{ring:4,br:'—',name:'Senza Peso',type:'Chiave',text:'Ti muovi gratis e puoi restare sospeso in aria per uno Scambio, ma non puoi più usare Parate.'});
// ---- Acqua
add('A1',{ring:1,br:'Marea',name:'Onda Respingente',type:'Carta',cards:[card('Onda Respingente',5,2,'Colpo 4 + SAG, spinge di 2',"Parata 5 + SAG; se Vinta spingi l'attaccante di 1",'Bue')]});
add('A2',{ring:1,br:'Sorgente',name:'Acqua che Risana',type:'Carta',cards:[card('Acqua che Risana',5,2,'Tecnica Base, cura 2d6 + SAG a un alleato entro 4','Parata 3 + SAG','Uccello')]});
add('A3',{ring:1,br:'Onda',name:'Scivolare',type:'Carta',cards:[card('Scivolare',8,1,'Aggiramento 2 + SAG, Attraversa; se passi accanto a un alleato, anche lui si sposta di 2 con te','Schivata','Topo')]});
add('A4',{ring:1,br:'Sorgente',name:'Flusso Calmo',type:'Talento',text:'+1 Flusso a fine di ogni scontro vinto senza cadute nel gruppo. Fuori: le tue cure durante un riposo breve curano +1 dado vita.'});
add('A5',{ring:1,br:'—',name:'Acqua Limpida',type:'Affinamento',text:"Togli fino a 2 carte, o trasforma una carta in una carta d'Acqua dello stesso tipo (la trasformazione qui non è simulata).",affina:'all'});
add('A6',{ring:2,br:'Marea',name:'Fortezza di Marea',type:'Carta',cards:[card('Fortezza di Marea',null,null,'Postura: le tue Parate proteggono anche un alleato adiacente dallo stesso attacco',null,null,{post:true})]});
add('A7',{ring:2,br:'Onda',name:'Risacca',type:'Scelta',opts:[
  {label:'A) Riflusso',text:'Dopo una tua Schivata Vinta, anche un alleato adiacente si sposta di 2.',cards:[]},
  {label:'B) Onda Benefica',text:'Le tue carte con Attraversa curano 1d6 un alleato accanto a cui passi.',cards:[]}]});
add('A8',{ring:2,br:'Sorgente',name:'Sorgente Viva',type:'Carta',cards:[tec('Sorgente Viva','Avanzata','Uccello + Serpente','3d6 + SAG di cure divise tra alleati entro 3, rimuove Brucia e Veleno')]});
add('A9',{ring:2,br:'Sorgente',name:'Voto della Sorgente',type:'Obbligo',text:'Tutte le tue cure +1d6, ma aggiungi 2 Acqua Stagnante.',zav:[zav('Acqua Stagnante',1,'Zavorra: Velocità 1, nessun effetto'),zav('Acqua Stagnante',1,'Zavorra: Velocità 1, nessun effetto')]});
add('A10',{ring:2,br:'Marea',name:"Prigione d'Acqua",type:'Carta',cards:[tec("Prigione d'Acqua",'Avanzata','Bue + Serpente','Il bersaglio è Trattenuto per 1 Scambio')]});
add('A11',{ring:2,br:'Onda',name:'Corrente Amica',type:'Carta',cards:[card('Corrente Amica',7,1,'Un alleato entro 4 si sposta di 3 caselle senza attacchi di opportunità e cura 1d6','Schivata','Uccello')]});
add('A12',{ring:3,br:'Marea',name:'Grande Cascata',type:'Carta',cards:[tec('Grande Cascata','Suprema','Bue → Serpente → Drago',"Muro d'acqua di 5 caselle per 3 Scambi; blocca gli Spari, chi lo tocca è spinto di 3")]});
add('A13',{ring:3,br:'Sorgente',name:'Pioggia di Vita',type:'Carta',cards:[tec('Pioggia di Vita','Suprema','Uccello → Serpente → Uccello','Alleati entro 6 curano 4d6 + SAG, chi è a 0 si rialza con 1 PF, 3 Flusso')]});
add('A14',{ring:3,br:'Onda',name:'Alta Marea',type:'Carta',cards:[tec('Alta Marea','Suprema','Topo → Serpente → Uccello','Ti sposti fino a 6 caselle e tutti gli alleati entro 6 fino a 4, senza attacchi di opportunità; tutti curano 2d6, 3 Flusso')]});
add('A15',{ring:4,br:'—',name:"Corpo d'Acqua",type:'Chiave',text:'Le tue Schivate sono sempre Vinte contro Colpo e Rottura, ma le tecniche di fulmine ti fanno danno doppio e non puoi indossare armature.'});
// ---- Terra
add('T1',{ring:1,br:'Montagna',name:'Pelle di Roccia',type:'Carta',cards:[card('Pelle di Roccia',null,null,'Postura: +2 riduzione del danno, −1 Velocità a tutte le tue carte finché resta attiva',null,null,{post:true})]});
add('T2',{ring:1,br:'Frana',name:'Frana',type:'Carta',cards:[card('Frana',3,3,'Rottura in linea di 3 caselle, 3 + SAG a tutti, spinti di 1','Parata 4 + SAG','Bue')]});
add('T3',{ring:1,br:'Radici',name:'Radici',type:'Carta',cards:[card('Radici',4,1,'Tecnica Base, un alleato entro 3 non può essere spostato né Trattenuto per 3 Scambi e ha +1 riduzione del danno','Parata 3','Topo')]});
add('T4',{ring:1,br:'Frana',name:'Terreno Amico',type:'Talento',text:'Una volta per Scambio crei o togli 1 casella di terreno difficile. Fuori: lavori la pietra come un artigiano esperto.'});
add('T5',{ring:1,br:'—',name:'Setaccio',type:'Affinamento',text:'Togli fino a 2 carte.',affina:'all'});
add('T6',{ring:2,br:'Montagna',name:'Guardiano',type:'Talento',text:'Chi parte adiacente a te e si allontana si ferma dopo 1 casella e subisce il tuo attacco di opportunità. Il Vento lo supera solo con una Schivata Vinta. Fuori: nessuno ti sposta di peso.'});
add('T7',{ring:2,br:'Montagna',name:'Sfida della Montagna',type:'Carta',cards:[card('Sfida della Montagna',4,2,'I nemici entro 2 caselle devono attaccare te nel prossimo Scambio','Parata 6 + SAG','Bue')]});
add('T8',{ring:2,br:'Frana',name:'Catena di Pietra',type:'Carta',cards:[card('Catena di Pietra',5,2,'Colpo a distanza 3, 2 + SAG, e tiri il bersaglio di 3 caselle verso di te','Parata 3 + SAG','Serpente')]});
add('T9',{ring:2,br:'Frana',name:'Peso della Montagna',type:'Obbligo',text:'Le tue Rotture +1d8 e le tue spinte +1 casella, ma aggiungi 2 Masso.',zav:[zav('Masso',null,'Zavorra: scartarla costa 2 stamina'),zav('Masso',null,'Zavorra: scartarla costa 2 stamina')]});
add('T10',{ring:2,br:'Radici',name:'Bosco Sacro',type:'Scelta',opts:[
  {label:'A) Radici condivise',text:'Radici protegge anche tutti gli alleati adiacenti al bersaglio.',cards:[]},
  {label:'B) Terreno benedetto',text:'Gli alleati sul terreno che hai creato hanno +1 riduzione del danno.',cards:[]}]});
add('T11',{ring:2,br:'Radici',name:'Muro di Pietra',type:'Carta',cards:[tec('Muro di Pietra','Avanzata','Bue + Topo','Muro di 3 caselle, copertura completa per 2 Scambi')]});
add('T12',{ring:3,br:'Montagna',name:'Armatura della Montagna',type:'Carta',cards:[tec('Armatura della Montagna','Suprema','Bue → Bue → Drago','Per 3 Scambi +5 riduzione del danno e Parate Vinte anche contro le Rotture, 3 Flusso')]});
add('T13',{ring:3,br:'Frana',name:'Terremoto',type:'Carta',cards:[tec('Terremoto','Suprema','Drago → Bue → Tigre','Tutti entro 4 caselle cadono Proni e subiscono 5d6, alleati compresi')]});
add('T14',{ring:3,br:'Radici',name:'Fortezza Vivente',type:'Carta',cards:[tec('Fortezza Vivente','Suprema','Topo → Bue → Uccello','Per 3 Scambi un cerchio di pietra di raggio 2; gli alleati dentro hanno copertura completa dagli attacchi a distanza e non possono essere spostati, 3 Flusso')]});
add('T15',{ring:4,br:'—',name:'Pelle di Pietra',type:'Chiave',text:'+4 riduzione del danno permanente. Ma la terra bagnata si ammorbidisce: ogni attacco d’Acqua che ti colpisce la spegne per 2 scambi.'});
// ---- Incroci: 3 nodi per confine (due carte e un talento), ciascuno richiede 3 nodi in entrambe le regioni
const XB=[ // [nome, elemento a, elemento b, elemento dello stato/danno, ruolo]
 ['Cenere','F','V','F','Un po\' di mobilità al Fuoco e un po\' di danno al Vento'],
 ['Fulmine','V','A','L','Danno al Vento e all\'Acqua, sempre sotto il Fuoco puro'],
 ['Legno','A','T','A','Cura e controllo alla Terra, difesa all\'Acqua'],
 ['Magma','T','F','F','Danno alla Terra, difesa al Fuoco']];
const XR=[
 ['X1',0,'Carica Ardente','Carta',[card('Carica Ardente',7,2,'Colpo 2 + SAG, Slancio 2; tecnica Base, movimento di 4 caselle anche attraverso i nemici, e il bersaglio Brucia','Schivata 3','Tigre')]],
 ['X2',0,'Nube di Cenere','Carta',[tec('Nube di Cenere','Avanzata','Tigre + Uccello','Cenere ardente: area 2x2 per 3 Scambi, 2d6 a chi ci entra o ci inizia lo Scambio; ogni Scambio la sposti di 2 caselle')]],
 ['X3',0,'Vento che Attizza','Talento',null,'Se in questo Scambio ti sei mosso di almeno 3 caselle, il tuo primo attacco infligge Brucia.'],
 ['X4',1,'Fendente Elettrico','Carta',[card('Fendente Elettrico',8,2,'Colpo 4 + SAG; tecnica Base, +1d6 fulmine e il bersaglio è Elettrizzato','Contrattacco 3 + SAG','Tigre')]],
 ['X5',1,'Catena di Fulmini','Carta',[tec('Catena di Fulmini','Avanzata','Drago + Tigre','Un bersaglio entro 4 subisce 3d6, poi la scarica salta su ogni nemico Bagnato entro 3 da lui per 2d6')]],
 ['X6',1,'Corrente Viva','Talento',null,'I tuoi attacchi contro chi è Bagnato o Elettrizzato fanno +3, e chi è Bagnato resta Elettrizzato.'],
 ['X7',2,'Legno Vivo','Carta',[tec('Legno Vivo','Avanzata','Serpente + Bue','Boschetto: area 3x3 per 3 Scambi, 1d6 e i nemici dentro sono Trattenuti; gli alleati dentro hanno copertura e recuperano 1d6 PF a inizio Scambio')]],
 ['X8',2,'Corteccia','Carta',[card('Corteccia',5,2,'Tecnica Base, un alleato entro 4 cura 1d6 + SAG e ha +3 riduzione del danno fino alla fine del prossimo Scambio','Parata 4 + SAG','Bue')]],
 ['X9',2,'Linfa','Talento',null,'Le tue cure danno anche +2 riduzione del danno fino alla fine dello Scambio; quando Trattieni un nemico curi 1d4.'],
 ['X10',3,'Colata','Carta',[tec('Colata','Avanzata','Bue + Tigre','Zona di magma: area 3x3 per 3 Scambi, 2d6 a chi ci entra o ci inizia lo Scambio')]],
 ['X11',3,'Corazza di Lava','Carta',[card('Corazza di Lava',null,null,'Postura: +2 riduzione del danno e chi ti colpisce in mischia subisce 1d4 fuoco; −1 Velocità finché resta attiva',null,null,{post:true})]],
 ['X12',3,'Pugno di Lava','Talento',null,'Le tue Rotture fanno +2 fuoco.']];
XR.forEach(([id,b,name,kind,cards,text],i)=>{const B=XB[b];
  add(id,{reg:'X',name,type:'Incrocio',kind,xname:B[0],xa:B[1],xb:B[2],xn:3,fel:B[3],xi:i%3,xb_i:b,
    text:(text?text+' ':'')+'('+B[0]+': '+B[4].toLowerCase()+'.)',cards:cards||[]});});

const LMAX=20; // livello massimo
const TREE={top:'puri'}; // Anello III e chiave di volta: 'libero' | 'ingresso' | 'puri'
// Ogni build è una lista di desideri in ordine: si prende il primo nodo permesso a ogni livello, i nodi non permessi si saltano
const BUILDS=[
 {name:'Drago di Brace (Fuoco, danno)',el:'F',steps:[['F1'],['F2',0],['F4',0],['F6'],['F7'],['F8'],['F9'],['F12'],['F15'],['F13'],['C1',0],['F3'],['F10'],['F11'],['F14',0],['C2'],['C6',null,'Taglio di Brace'],['C6',null,'Palmo di Brace'],['C7'],['F5'],['C8']]},
 {name:'Custode del Legno (Terra + Acqua, difesa e cura)',el:'T',steps:[['T3'],['T1'],['T4'],['C4','A'],['T10',0],['A2'],['A4'],['A1'],['X7'],['X8'],['X9'],['T2'],['T6'],['T7'],['T12'],['A8'],['A9'],['A13'],['T14'],['T11'],['A6'],['C2'],['C6',null,'Pugno di Roccia'],['C7'],['T5'],['A5'],['C8']]},
 {name:'Sacerdotessa della Marea (Acqua, cura)',el:'A',steps:[['A2'],['A4'],['A1'],['A8'],['A9'],['A6'],['A13'],['A11'],['A3'],['A7',0],['C1',2],['A10'],['A12'],['A14'],['A15'],['C6',null,'Onda Respingente'],['C2'],['C7'],['A5'],['C8']]},
 {name:'Kaze, il Vento che Passa (Vento, mobilità)',el:'V',steps:[['V1'],['V4'],['V2'],['V7'],['V6'],['V10',1],['V12'],['C1',3],['C6',null,'Taglio che Attraversa'],['C6',null,'Raffica in Corsa'],['V14'],['V3'],['V9'],['V13'],['V8'],['C2'],['C6',null,'Lama di Vento'],['V5'],['C7'],['C8']]},
 {name:'Bastione di Pietra (Terra, tank)',el:'T',steps:[['T1'],['T2'],['T4'],['T6'],['T7'],['T9'],['T8'],['T12'],['C1',1],['T13'],['C9',2],['T3'],['T10',0],['T11'],['T14'],['T15'],['C6',null,'Pugno di Roccia'],['C2'],['T5'],['C7'],['C8']]},
 {name:'Lama della Tempesta (Vento + Acqua, Fulmine)',el:'V',steps:[['V1'],['V4'],['V2'],['C4','A'],['A3'],['A1'],['A4'],['X4'],['X5'],['X6'],['V7'],['V6'],['V10',1],['V12'],['A2'],['A11'],['A8'],['A14'],['V9'],['V14'],['C6',null,'Fendente Elettrico'],['C6',null,'Taglio che Attraversa'],['C2'],['C7'],['V5'],['A5'],['C8']]},
 {name:'Fiamma Errante (Fuoco + Vento, Cenere)',el:'F',steps:[['F1'],['F2',0],['F4',0],['C4','V'],['V1'],['V4'],['V2'],['X1'],['X2'],['X3'],['F6'],['F7'],['F8'],['F13'],['V7'],['V6'],['V10',1],['V12'],['F9'],['F12'],['C1',0],['C6',null,'Carica Ardente'],['C2'],['C7'],['F5'],['V5'],['C8']]},
 {name:'Pugno di Magma (Terra + Fuoco, Magma)',el:'T',steps:[['T1'],['T2'],['T4'],['C4','F'],['F1'],['F2',1],['F3'],['X10'],['X11'],['X12'],['T9'],['T6'],['T7'],['T13'],['F6'],['F7'],['F8'],['F13'],['T12'],['C1',1],['C6',null,'Pugno di Roccia'],['C2'],['C7'],['T5'],['F5'],['C8']]}];
const MODS=['+1 Velocità','+1d6 danno','−1 stamina','Riga di Risposta','Cambio tipo d\'attacco'];
const TYPES={Carta:'Dà una carta precisa, che entra obbligatoriamente nel mazzo',Scuola:'Scegli 1 carta da un elenco',Talento:'Effetto permanente, spesso con un vantaggio fuori dal combattimento',Scelta:'Due opzioni, ne prendi una sola per sempre',Obbligo:'Potenziamento forte che aggiunge carte zavorra',Affinamento:'Togli carte (facoltativo) per snellire il mazzo',Chiave:'Chiave di volta: cambia una regola, con un costo. Una sola per personaggio',Incrocio:'Il nodo più forte: richiede nodi in due elementi'};
const s358=L=>L>=8?5:L>=4?4:3;
// Caratteristiche uguali per tutti, per confrontare gli elementi e non le schede: principale +3/+4/+5 (livelli 1, 4, 8), secondaria fino a +3, COS +2
const sec=L=>L>=12?4:L>=4?3:2;
const PROF=[
 {short:'Drago',ai:'melee',cos:2,mods:L=>({SAG:s358(L),DES:1,FOR:1}),ab:L=>`SAG +${s358(L)}, COS +2`},
 {short:'Custode',ai:'support',cos:2,mods:L=>({SAG:s358(L),DES:0,FOR:1}),ab:L=>`SAG +${s358(L)}, FOR +1, COS +2`},
 {short:'Sacerdotessa',ai:'support',cos:2,mods:L=>({SAG:s358(L),DES:1,FOR:0}),ab:L=>`SAG +${s358(L)}, COS +2`},
 {short:'Kaze',ai:'melee',cos:2,mods:L=>({SAG:sec(L),DES:s358(L),FOR:0}),ab:L=>`DES +${s358(L)}, SAG +${sec(L)}, COS +2`},
 {short:'Bastione',ai:'tank',cos:2,mods:L=>({SAG:s358(L),DES:0,FOR:2}),ab:L=>`SAG +${s358(L)}, FOR +2, COS +2`},
 {short:'Lama',ai:'melee',cos:2,mods:L=>({SAG:sec(L),DES:s358(L),FOR:0}),ab:L=>`DES +${s358(L)}, SAG +${sec(L)}, COS +2`},
 {short:'Fiamma',ai:'melee',cos:2,mods:L=>({SAG:s358(L),DES:2,FOR:0}),ab:L=>`SAG +${s358(L)}, DES +2, COS +2`},
 {short:'Magma',ai:'tank',cos:2,mods:L=>({SAG:s358(L),DES:0,FOR:2}),ab:L=>`SAG +${s358(L)}, FOR +2, COS +2`}];
const AIDESC={melee:'mischia',support:'supporto in mischia',healer:'cura da dietro',ranged:'distanza e coperture',tank:'tank, attira i colpi'};
return {ORDER,EL,WEAP,N,XB,LMAX,TREE,BUILDS,PROF,UNIV,TYPES,MODS,AIDESC,id:'dono',nome:'Dono',sangue:0,FORGE:'F14',HK:{},
 ST_TXT:{F:'Brucia',A:'Bagnato',T:'Scosso',L:'Elettrizzato',V:'Sospinto',J:'Inceppato'},
 txt:{noCatena:'ma la Catena non è pronta',senzaSigilli:'senza sigilli, Cuore di Vulcano',suprema:'3 Flusso, Catena svuotata',danza:'Danza delle Braci +2 stamina',
  combustione:'Combustione',cuore:'Cuore di Vulcano lo brucia',peso:'Peso della Montagna',pugno:'Pugno di Lava',forgia:'Forgia del Clan',fiamma:'Fiamma Interiore',
  corrente:'Corrente Viva',linfa:'Linfa',sospinto:'è Sospinto dal vento (+1 Velocità)',brucia:'Brucia',douse:"e l'acqua spegne le fiamme",scia:'con il Velo di Vento',
  flusso:'Flusso',sigilli:'sigilli'},
 voc:{elemento:'elemento',Elemento:'Elemento',Elementi:'Elementi',secondo:'Secondo Risveglio',terzo:'Terzo Risveglio'}};
})();
