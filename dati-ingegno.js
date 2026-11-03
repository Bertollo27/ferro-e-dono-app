/* Ferro & Dono — DATI INGEGNO: carte, nodi della Ragnatela, build consigliate, profili.
   Per aggiornare il bilanciamento basta sostituire questo file. */
const INGEGNO=(()=>{
const ORDER=['G','M','K','B']; // anello: Armi da fuoco – Meccanica – Alchimia – Bionico; ogni mestiere tocca i due vicini
const card=(n,v,c,a,b,s,x={})=>Object.assign({n,v,c,a,b,s},x);
const tec=(n,lv,seq,a,x={})=>Object.assign({n,v:null,c:null,a,b:null,s:null,lv,seq},x);
const zav=(n,v,a)=>({n,v,c:0,a,b:null,s:null,zav:true});
const trs=(n,v,c,a,b)=>card(n,v,c,a,b,null,{tr:true}); // Trasmutazione: ignora il triangolo, si consuma, +1 Logoramento
const pro=(n,v,c,a,b,s,p=1)=>card(n,v,c,a,b,s,{pr:p}); // carta di protesi: accumula Pressione
const UNIV=[
  {q:2,c:card('Passo Rapido',8,1,'Aggiramento 2 + DES','Schivata di 1 casella','Molla',{prov:true})},
  {q:2,c:card('Guardia',5,1,'Colpo 2 + FOR','Parata 3 + COS','Bullone',{prov:true})}];

const EL={
 G:{name:'Armi da fuoco',role:'Danno a distanza: spara più forte e più lontano di tutti, ma mentre ricarica è scoperto',branches:['Revolver','Artiglieria','Squadra'],
  bdesc:{Revolver:'duello ravvicinato, colpi rapidi',Artiglieria:'area e lunga distanza',Squadra:'il danno del gruppo'},
  ingr:[{q:2,c:card('Colpo di Revolver',7,2,'Sparo a distanza 4, 3 + DES; tecnica Base, +1d6 e il bersaglio Sanguina','Ricarica','Grilletto')},
   {q:2,c:card('Calcio del Fucile',5,2,'Colpo 4 + DES','Parata 3 + DES','Leva')},
   {q:2,c:card('Doppio Colpo',6,2,'Sparo a distanza 4, 2 + DES, 2 bersagli','Ricarica','Grilletto')},
   {q:1,c:card('Sparare in Corsa',8,1,'Sparo a distanza 3, 2 + DES, Slancio 2','Schivata','Molla')},
   {q:1,c:card('Mira',6,1,'Sparo a distanza 5, 2 + DES','Contrattacco 2 + DES','Jolly')}],
  tal:'Occhio Freddo: +1 a ogni danno dei tuoi colpi tecnici (Base, Avanzati, Supremi). Tamburo da 6 colpi. Fuori: vantaggio su Percezione per notare armi nascoste.'},
 M:{name:'Meccanica',role:'Supporto e controllo: un automa compagno, torrette, riparazioni del ferro e sabotaggio dei congegni nemici; si muove poco',branches:['Automa','Torrette','Officina'],
  bdesc:{Automa:'il compagno meccanico, come un famiglio',Torrette:'postazioni di tiro piazzate sul campo',Officina:'riparare il ferro degli alleati e sabotare quello nemico'},
  ingr:[{q:1,c:card('Chiave Inglese',6,2,'Colpo 4 + INT','Parata 3 + INT','Ingranaggio')},
   {q:1,c:card('Sparachiodi',6,2,'Colpo a distanza 3, 3 + INT','Parata 3 + INT','Ingranaggio')},
   {q:2,c:card('Saldatrice',6,1,'Ripari 1d8 + INT di Integrità a un alleato, a un automa o a una torretta entro 3','Schivata','Valvola')},
   {q:2,c:card('Ordine all\'Automa',8,1,'Ordine all\'automa: attacca subito il bersaglio più vicino','Parata 2','Leva')},
   {q:1,c:card('Torretta da Campo',5,2,'Piazzi una torretta entro 2 caselle','Schivata','Ingranaggio')},
   {q:1,c:card('Sabotaggio',7,1,'Colpo 2 + INT; tecnica Base, +1d6 e il bersaglio è Inceppato','Schivata','Jolly')}],
  tal:'Automa da Tasca: parti con un automa compagno che ti segue e attacca da solo (Integrità 6 + livello, Velocità 5, Colpo 1d6 + metà INT). Solo la Meccanica ripara il ferro: automi, torrette, protesi e corazze. Fuori: ripari qualsiasi congegno in metà tempo.'},
 K:{name:'Alchimia',role:'Controllo e danno a raffica: piega la materia del campo con le Trasmutazioni, le carte più potenti del gioco, pagate col proprio corpo (Logoramento)',branches:['Trasmutare','Cerchio','Carne di Ferro'],
  bdesc:{Trasmutare:'danno: lance, schegge, piogge di ferro',Cerchio:'controllo: muri, gabbie, respingere',['Carne di Ferro']:'trasmutare il proprio corpo per reggere i colpi'},
  ingr:[{q:2,c:card('Cerchio di Ferro',5,2,'Rottura 4 + INT, spinge di 1','Parata 5 + INT, Vinta anche contro lo Sparo','Valvola')},
   {q:2,c:card('Fiala Corrosiva',6,2,'Colpo a distanza 3, 3 + INT','Parata 3 + INT','Lente')},
   {q:2,c:card('Passo Trasmutato',8,1,'Aggiramento 2 + INT, Attraversa','Schivata','Molla')},
   {q:1,c:trs('Lancia dal Suolo',4,2,'Trasmutazione: distanza 3, 1d6 + INT','Parata 2')},
   {q:1,c:trs('Mano di Pietra',5,2,'Trasmutazione: distanza 3, 1d4 + INT e il bersaglio è Trattenuto','Parata 2')}],
  tal:'Scambio Equivalente: ogni Trasmutazione ti costa 1 Logoramento e, dalla terza dello scontro, anche 1d6 PF; in cambio le tue Schivate Vinte ti riposizionano fino a 3 caselle e le tue Trasmutazioni d\'attacco lasciano il bersaglio Corroso. Fuori: riconosci qualsiasi sostanza e materiale.'},
 B:{name:'Bionico',role:'Tank e cura della carne: protesi pesanti che reggono più di tutti e macchinari medici montati nel corpo; le cure scaldano le protesi e il suo ferro lo ripara solo un meccanico',branches:['Blindatura','Ambulatorio','Siringhe'],
  bdesc:{Blindatura:'tank, provocazioni, Guardiano',Ambulatorio:'curare la carne con i macchinari',Siringhe:'il rovescio: veleni e anestetici'},
  ingr:[{q:2,c:pro('Pugno a Pistone',3,3,'Rottura 7 + FOR','Parata 5 + FOR','Bullone')},
   {q:2,c:card('Spallata',4,2,'Rottura 4 + FOR, spinge di 2','Parata 3 + FOR, Vinta anche contro lo Sparo; Guardiano per 1 Scambio','Bullone')},
   {q:2,c:pro('Iniettore',6,1,'Tecnica Base, cura 1d8 + FOR a un alleato entro 2','Parata 3 + FOR','Lente')},
   {q:1,c:card('Ago Sedativo',6,1,'Colpo 2 + FOR; tecnica Base, +1d6 e il bersaglio è Rallentato','Schivata','Molla')},
   {q:1,c:pro('Rampino a Pistone',6,2,'Colpo a distanza 2, 2 + FOR, tiri il bersaglio di 2 e deve attaccare te nel prossimo Scambio','Parata 2','Leva')}],
  tal:'Telaio d\'Acciaio: parti con protesi che danno Integrità (3 + livello) e assorbono i danni prima della carne; solo la Meccanica le ripara. Non puoi essere spinto di più di 1 casella, Sanguina ti dura 1 Scambio e le tue Parate contro lo Sparo sono Vinte. Le carte di protesi, cure comprese, accumulano Pressione: a 5 si surriscaldano e restano bloccate per uno Scambio. Le tue cure fermano Sanguina. Fuori: sollevi il doppio.'}
};

const WEAP={
 katana:[card('Katana a Ingranaggi',7,2,'Colpo 5 + DES','Contrattacco 3 + DES','Jolly',{prov:true}),card('Estrazione Vibrante',9,2,'Colpo 4 + DES','Schivata','Jolly',{prov:true})],
 naginata:[card('Naginata Telescopica',5,2,'Rottura 5 + FOR, portata 2','Parata 4 + FOR','Jolly',{prov:true}),card('Affondo a Molla',6,2,'Colpo 4 + FOR, portata 2','Contrattacco 3 + FOR','Jolly',{prov:true})],
 tessen:[card('Tessen a Lamelle',7,1,'Aggiramento 3 + DES','Parata 3 + DES','Jolly',{prov:true}),card('Chiusura di Tessen',6,2,'Rottura 4 + DES','Parata 4','Jolly',{prov:true})],
 pistola:[card('Pistola da Manica',9,1,'Sparo a distanza 4, 3 + DES','Schivata','Jolly',{prov:true}),card('Colpo di Calcio',8,2,'Aggiramento 4 + DES','Contrattacco 3 + DES','Jolly',{prov:true})],
 kusarigama:[card('Catena a Molla',6,2,'Aggiramento 3 + DES, il bersaglio è Trattenuto','Schivata','Jolly',{prov:true}),card('Falce Rotante',5,2,'Colpo 4 + DES, portata 3','Parata 3','Jolly',{prov:true})]
};

const N={}; // nodi
function add(id,o){o.id=id;o.reg=o.reg||id[0];N[id]=o;}
// ---- centro: il Mestiere
add('C1',{reg:'C',name:'Arsenale',type:'Scuola',text:"Scegli un'arma e ricevi le sue 2 carte; i loro pezzi valgono come jolly. (Carte delle armi provvisorie.)",
  opts:Object.keys(WEAP).map(k=>({label:k[0].toUpperCase()+k.slice(1),cards:WEAP[k]}))});
add('C2',{reg:'C',name:'Caldaia Maggiore',type:'Talento',text:'+3 Vapore massimo. Fuori: le tue macchine lavorano il doppio prima della manutenzione.'});
add('C3',{reg:'C',name:'Pezzi di Ricambio',type:'Carta',text:'Ricevi 2 copie di Bullone di Scorta.',cards:[card('Bullone di Scorta',10,0,'Nessun attacco, conta come pezzo jolly','Schivata di 1 casella','Jolly'),card('Bullone di Scorta',10,0,'Nessun attacco, conta come pezzo jolly','Schivata di 1 casella','Jolly')]});
add('C4',{reg:'C',name:'Secondo Mestiere',type:'Talento',text:"Dal livello 5: apri l'Anello I di un secondo mestiere.",elOpen:2});
add('C5',{reg:'C',name:'Terzo Mestiere',type:'Talento',text:'Dal livello 9, con 3 nodi nel secondo mestiere: apri un terzo mestiere.',elOpen:3});
add('C6',{reg:'C',name:'Messa a Punto',type:'Talento',rep:3,text:'Ripetibile 3 volte. Ogni volta scegli una carta del mazzo e le dai un potenziamento: +1 Velocità, +1d6 danno, −1 stamina, una riga di Risposta, oppure cambio di tipo d\'attacco. Max 3 potenziamenti sulla stessa carta.'});
add('C7',{reg:'C',name:'Manutenzione',type:'Talento',text:'+1 Vapore a ogni Scambio in cui non attacchi. Fuori: un riposo breve ripara una protesi.'});
add('C8',{reg:'C',name:'Cintura del Mercenario',type:'Talento',text:'Cintura a 5 consumabili: fumogeni, granate a frammentazione (Vel 8, 2d6 in area 2x2), bende, stimolanti. I consumabili non entrano nel mazzo. Fuori: vantaggio su Raggirare nei mercati.'});
add('C9',{reg:'C',name:'Trucchi di Strada',type:'Scuola',text:'Scegli 1 carta di riposizionamento.',
  opts:[{label:'Fumogeno',cards:[card('Fumogeno',10,3,'Nessuna','Sparisci nel fumo e riappari entro 3: difesa Vinta contro qualsiasi attacco','Molla')]},
   {label:'Scambio di Posto',cards:[card('Scambio di Posto',8,2,'Nessuna','Tu e un alleato adiacente vi scambiate di posto; lui usa la tua difesa','Leva',{prov:true})]},
   {label:'Ritirata Coperta',cards:[card('Ritirata Coperta',6,1,'Nessuna','Arretri di 3; un alleato ottiene lo Spiraglio contro chi ti era ingaggiato','Molla',{prov:true})]},
   {label:'Balzo sul Tetto',cards:[card('Balzo sul Tetto',7,2,'Sali su un punto rialzato entro 3: da lì i tuoi attacchi hanno +1 Velocità','Schivata','Leva',{prov:true})]}]});

// ---- Armi da fuoco (danno)
add('G1',{ring:1,br:'Revolver',name:'Colpo al Cuore',type:'Carta',cards:[card('Colpo al Cuore',7,2,'Sparo a distanza 3, 4 + DES, +1d6 se completi una Base','Ricarica','Grilletto')]});
add('G2',{ring:1,br:'Artiglieria',name:'Munizioni Speciali',type:'Scuola',text:'1 colpo tecnico Base a scelta.',opts:[
  {label:'Proiettile Esplosivo',cards:[tec('Proiettile Esplosivo','Base','1 pezzo','Sparo a distanza 5, 2d6')]},
  {label:'Granata Fumogena',cards:[tec('Granata Fumogena','Base','1 pezzo','Area 2x2 di fumo: blocca la vista per 2 Scambi')]},
  {label:'Pallettoni',cards:[tec('Pallettoni','Base','1 pezzo','Cono di 3 caselle, 1d6 a tutti')]}]});
add('G3',{ring:1,br:'Squadra',name:'Cartucciera',type:'Talento',text:'+2 stamina massima e tamburo +2 colpi. Fuori: porti il doppio delle munizioni.'});
add('G4',{ring:1,br:'Revolver',name:'Estrazione',type:'Scelta',opts:[
  {label:'A) Estrazione Rapida',cards:[card('Estrazione Rapida',9,2,'Sparo a distanza 3, 3 + DES','Contrattacco 3 + DES','Grilletto')]},
  {label:'B) Baionetta',cards:[card('Baionetta',5,2,'Rottura 5 + DES','Parata 4 + DES; infligge 2 a chi attacca','Leva')]}]});
add('G5',{ring:1,br:'—',name:'Canna Pulita',type:'Affinamento',text:'Togli fino a 2 carte universali o zavorre.',affina:'univ'});
add('G6',{ring:2,br:'Revolver',name:'Baionetta Innestata',type:'Carta',text:'Punisce chi ti viene addosso, non ti protegge.',cards:[card('Baionetta Innestata',null,null,'Postura: chi ti colpisce in mischia subisce 1d6',null,null,{post:true})]});
add('G7',{ring:2,br:'Revolver',name:'Ritmo del Tamburo',type:'Talento',text:'Ogni colpo tecnico Avanzato completato ti restituisce 2 stamina.'});
add('G8',{ring:2,br:'Artiglieria',name:'Fuoco di Sbarramento',type:'Carta',cards:[tec('Fuoco di Sbarramento','Avanzata','Grilletto + Lente','Linea di 4 caselle per 2 Scambi, 3d6 a chi la attraversa')]});
add('G9',{ring:2,br:'Artiglieria',name:'Polvere Nera',type:'Obbligo',text:'+1d6 a tutti i colpi tecnici d\'arma, ma aggiungi 2 Canna Sporca.',zav:[zav('Canna Sporca',null,'Zavorra: quando la scarti perdi 1 stamina'),zav('Canna Sporca',null,'Zavorra: quando la scarti perdi 1 stamina')]});
add('G10',{ring:2,br:'Squadra',name:'Segnalare il Bersaglio',type:'Carta',cards:[card('Segnalare il Bersaglio',6,2,'Sparo a distanza 4, 3 + DES; un alleato che colpisce lo stesso bersaglio in questo Scambio fa +1d6','Parata 3','Lente')]});
add('G11',{ring:2,br:'Squadra',name:'Ordine di Fuoco',type:'Carta',cards:[card('Ordine di Fuoco',6,1,'Alleati entro 3 caselle +2 danno nel prossimo Scambio','Schivata','Leva')]});
add('G12',{ring:3,br:'Artiglieria',name:'Cannone a Vapore',type:'Carta',cards:[tec('Cannone a Vapore','Suprema','Lente → Grilletto → Valvola','Cono di 6 caselle, 6d6, 3 Vapore')]});
add('G13',{ring:3,br:'Revolver',name:'Sei Colpi',type:'Carta',cards:[tec('Sei Colpi','Suprema','Grilletto → Grilletto → Leva','Sparo con Velocità 10, 8 + DES + 4d6, il bersaglio Sanguina, 3 Vapore')]});
add('G14',{ring:3,br:'Squadra',name:'Ultimo Caricatore',type:'Scelta',opts:[
  {label:'A) Duro a Morire',text:'Una volta per scontro, a 0 PF torni a 1 e scarichi il tamburo: 3d6 attorno a te.',cards:[]},
  {label:'B) Armaiolo',text:'Le armi degli alleati fanno +1d6 per tutto lo scontro.',cards:[]}]});
add('G15',{ring:4,br:'—',name:'Canna Rovente',type:'Chiave',text:'I colpi tecnici Base e Avanzati d\'arma non richiedono pezzi, ma ognuno ti infligge 1d4 danni.'});
// ---- Meccanica (automa, torrette, riparare e sabotare)
add('M1',{ring:1,br:'Automa',name:'Corazza dell\'Automa',type:'Talento',text:'Il tuo automa ha +6 Integrità. Fuori: l\'automa porta pesi e fa la guardia mentre dormi.'});
add('M2',{ring:1,br:'Officina',name:'Saldatrice Rapida',type:'Carta',cards:[card('Saldatrice Rapida',8,1,'Ripari 2d6 + INT di Integrità a un alleato, a un automa o a una torretta entro 3','Schivata','Valvola')]});
add('M3',{ring:1,br:'Torrette',name:'Calibro Maggiore',type:'Talento',text:'Le tue torrette fanno +1d4 danni. Fuori: monti una torretta di guardia durante il riposo.'});
add('M4',{ring:1,br:'Officina',name:'Sabotatore',type:'Talento',text:'I tuoi attacchi fanno +3 contro chi ha ferro: protesi, armi da fuoco, automi e torrette. Fuori: scassini qualsiasi serratura meccanica.'});
add('M5',{ring:1,br:'—',name:'Smontare',type:'Affinamento',text:'Togli fino a 2 carte.',affina:'all'});
add('M6',{ring:2,br:'Automa',name:'Indole dell\'Automa',type:'Scelta',opts:[
  {label:'A) Guardiano',text:'I nemici adiacenti al tuo automa devono attaccare lui nel prossimo scambio.',cards:[]},
  {label:'B) Artigli',text:'Il tuo automa fa +1d4 danni.',cards:[]}]});
add('M7',{ring:2,br:'Automa',name:'Esca Meccanica',type:'Carta',cards:[card('Esca Meccanica',10,3,'Nessuna','Scambi posto con la tua esca entro 3: difesa Vinta contro qualsiasi attacco, senza attacchi di opportunità','Molla')]});
add('M8',{ring:2,br:'Torrette',name:'Seconda Torretta',type:'Talento',text:'Puoi tenere in campo 2 torrette invece di una.'});
add('M9',{ring:2,br:'Officina',name:'Revisione Generale',type:'Carta',cards:[tec('Revisione Generale','Avanzata','Ingranaggio + Valvola','Ripari 3d6 + INT di Integrità a tutti gli alleati, automi e torrette entro 3')]});
add('M10',{ring:2,br:'Torrette',name:'Modello di Torretta',type:'Scelta',opts:[
  {label:'A) Blindata',text:'Le tue torrette hanno +4 Integrità e 2 di riduzione del danno.',cards:[]},
  {label:'B) Leggera',text:'Le tue torrette si piazzano fino a 4 caselle e sparano con +2 Velocità.',cards:[]}]});
add('M11',{ring:2,br:'Officina',name:'Attrezzi Improvvisati',type:'Obbligo',text:'Tutte le tue riparazioni +1d6, ma aggiungi 2 Molla Rotta.',zav:[zav('Molla Rotta',1,'Zavorra: Velocità 1, nessun effetto'),zav('Molla Rotta',1,'Zavorra: Velocità 1, nessun effetto')]});
add('M12',{ring:3,br:'Automa',name:'Automa da Guerra',type:'Carta',cards:[tec('Automa da Guerra','Suprema','Leva → Ingranaggio → Bullone','Ordine all\'automa: si trasforma per il resto dello scontro, +2d6 danni e +8 Integrità, 3 Vapore')]});
add('M13',{ring:3,br:'Officina',name:'Blackout',type:'Carta',cards:[tec('Blackout','Suprema','Ingranaggio → Leva → Valvola','A distanza 5, area 3x3: 4d6 e tutti sono Inceppati, 3 Vapore')]});
add('M14',{ring:3,br:'Torrette',name:'Batteria di Cannoni',type:'Carta',cards:[tec('Batteria di Cannoni','Suprema','Ingranaggio → Grilletto → Ingranaggio','Le torrette fanno fuoco insieme: a distanza 6, area 3x3, 5d6, 3 Vapore')]});
add('M15',{ring:4,br:'—',name:'Fabbrica da Campo',type:'Chiave',text:'Quando il tuo automa o una tua torretta cade, si ricostruisce a metà Integrità a fine scambio (una volta per scontro ciascuno), ma tutte le tue carte hanno −1 Velocità.'});
// ---- Alchimia (controllo e danno a raffica)
add('K1',{ring:1,br:'Cerchio',name:'Muro Respingente',type:'Carta',cards:[card('Muro Respingente',5,2,'Rottura 4 + INT, spinge di 2',"Parata 5 + INT; se Vinta spingi l'attaccante di 1",'Valvola')]});
add('K2',{ring:1,br:'Trasmutare',name:'Lance Gemelle',type:'Carta',cards:[trs('Lance Gemelle',5,2,'Trasmutazione: distanza 4, 1d6 + INT, 2 bersagli','Parata 2')]});
add('K3',{ring:1,br:'Carne di Ferro',name:'Pelle di Ferro',type:'Carta',cards:[trs('Pelle di Ferro',7,1,'Trasmutazione su di te: +3 riduzione del danno per 3 Scambi','Parata 3 + INT')]});
add('K4',{ring:1,br:'Trasmutare',name:'Reagenti Puri',type:'Talento',text:'Le tue Trasmutazioni d\'attacco fanno +1d4. Fuori: distilli un reagente raro con metà degli ingredienti.'});
add('K5',{ring:1,br:'—',name:'Distillare',type:'Affinamento',text:'Togli fino a 2 carte.',affina:'all'});
add('K6',{ring:2,br:'Cerchio',name:'Muro di Ferro',type:'Carta',text:'Trasmutazione difensiva.',cards:[trs('Muro di Ferro',6,2,'Nessuna','Muro di Ferro: difesa Vinta contro qualsiasi attacco')]});
add('K7',{ring:2,br:'Trasmutare',name:'Cerchio Tracciato',type:'Scelta',opts:[
  {label:'A) Cerchio Preparato',text:'La prima Trasmutazione di ogni scontro non dà Logoramento.',cards:[]},
  {label:'B) Riflusso',text:'Quando una tua Trasmutazione d\'attacco va a segno recuperi 2 stamina.',cards:[]}]});
add('K8',{ring:2,br:'Carne di Ferro',name:'Ossa d\'Acciaio',type:'Talento',text:'Con almeno 2 Logoramento il tuo corpo si indurisce: +2 riduzione del danno. Fuori: vantaggio su Tempra.'});
add('K9',{ring:2,br:'Trasmutare',name:'Reagenti Instabili',type:'Obbligo',text:'Le tue Trasmutazioni d\'attacco fanno +1d4, ma aggiungi 2 Residuo Tossico.',zav:[zav('Residuo Tossico',1,'Zavorra: Velocità 1, nessun effetto'),zav('Residuo Tossico',1,'Zavorra: Velocità 1, nessun effetto')]});
add('K10',{ring:2,br:'Cerchio',name:'Gabbia di Ferro',type:'Carta',cards:[trs('Gabbia di Ferro',5,2,'Trasmutazione: a distanza 4, 1d6 + INT e il bersaglio è Trattenuto','Parata 3 + INT')]});
add('K11',{ring:2,br:'Carne di Ferro',name:'Braccio di Pietra',type:'Carta',cards:[card('Braccio di Pietra',5,2,'Rottura 5 + INT','Parata 4 + INT, Vinta anche contro lo Sparo','Bullone')]});
add('K12',{ring:3,br:'Cerchio',name:'Prigione di Ferro',type:'Carta',cards:[tec('Prigione di Ferro','Suprema','Valvola → Lente → Bullone','A distanza 5, area 3x3: 3d6 e tutti sono Trattenuti, 3 Vapore')]});
add('K13',{ring:3,br:'Carne di Ferro',name:'Colosso Alchemico',type:'Carta',cards:[tec('Colosso Alchemico','Suprema','Bullone → Valvola → Bullone','Trasmuti tutto il corpo: +5 riduzione del danno per 3 Scambi, 3 Vapore')]});
add('K14',{ring:3,br:'Trasmutare',name:'Pioggia di Lance',type:'Carta',cards:[trs('Pioggia di Lance',4,3,'Trasmutazione: a distanza 5, area 3x3, 3d6 + INT','Parata 3')]});
add('K15',{ring:4,br:'—',name:'Pietra Filosofale Incompleta',type:'Chiave',text:'Le tue Trasmutazioni non si consumano più e ognuna ti costa sempre 1d6 PF (al posto del costo in PF del Logoramento).'});
// ---- Bionico (tank e cura della carne)
add('B1',{ring:1,br:'Blindatura',name:'Blindatura',type:'Carta',cards:[card('Blindatura',null,null,'Postura: +2 riduzione del danno, −1 Velocità a tutte le tue carte finché resta attiva',null,null,{post:true})]});
add('B2',{ring:1,br:'Ambulatorio',name:'Suturatrice',type:'Carta',cards:[pro('Suturatrice',5,2,'Tecnica Base, cura 2d6 + FOR a un alleato entro 3','Parata 3 + FOR','Lente',2)]});
add('B3',{ring:1,br:'Siringhe',name:'Siringa al Veleno',type:'Carta',cards:[card('Siringa al Veleno',7,1,'Colpo 3 + FOR; tecnica Base, +1d6 e il bersaglio Sanguina','Schivata','Lente')]});
add('B4',{ring:1,br:'Siringhe',name:'Anestetico',type:'Talento',text:'I tuoi attacchi in mischia che vanno a segno lasciano il bersaglio Rallentato (−1 Velocità). Fuori: addormenti una persona in pochi secondi.'});
add('B5',{ring:1,br:'—',name:'Revisione',type:'Affinamento',text:'Togli fino a 2 carte.',affina:'all'});
add('B6',{ring:2,br:'Blindatura',name:'Ancora Magnetica',type:'Talento',text:'Chi parte adiacente a te e si allontana si ferma dopo 1 casella e subisce il tuo attacco di opportunità. Fuori: nessuno ti sposta di peso.'});
add('B7',{ring:2,br:'Blindatura',name:'Sirena da Battaglia',type:'Carta',cards:[card('Sirena da Battaglia',4,2,'Colpo a distanza 4, 1 + FOR, area 2x2; chi è colpito deve attaccare te nel prossimo Scambio','Parata 6 + FOR; Guardiano per 2 Scambi','Bullone')]});
add('B8',{ring:2,br:'Ambulatorio',name:'Defibrillatore',type:'Carta',cards:[tec('Defibrillatore','Avanzata','Lente + Valvola','Cura 3d6 + FOR a un alleato entro 2; se è a 0 PF si rialza',{pr:1})]});
add('B9',{ring:2,br:'Ambulatorio',name:'Dosi Forti',type:'Obbligo',text:'Tutte le tue cure +1d6, ma aggiungi 2 Residuo Tossico.',zav:[zav('Residuo Tossico',1,'Zavorra: Velocità 1, nessun effetto'),zav('Residuo Tossico',1,'Zavorra: Velocità 1, nessun effetto')]});
add('B10',{ring:2,br:'Ambulatorio',name:'Valvola di Sfogo',type:'Scelta',opts:[
  {label:'A) Raffreddamento',text:'Le tue carte di cura accumulano 1 Pressione in meno.',cards:[]},
  {label:'B) Sfiato',text:'Quando una protesi si surriscalda, i nemici adiacenti subiscono 1d6.',cards:[]}]});
add('B11',{ring:2,br:'Siringhe',name:'Paralizzante',type:'Carta',cards:[pro('Paralizzante',6,2,'Colpo 3 + FOR, il bersaglio è Trattenuto','Parata 3 + FOR','Lente')]});
add('B12',{ring:3,br:'Blindatura',name:'Corazza Totale',type:'Carta',cards:[tec('Corazza Totale','Suprema','Bullone → Bullone → Valvola','Per 3 Scambi +5 riduzione del danno e Parate Vinte anche contro le Rotture, 3 Vapore')]});
add('B13',{ring:3,br:'Siringhe',name:'Nube Anestetica',type:'Carta',cards:[tec('Nube Anestetica','Suprema','Lente → Molla → Lente','Tutti entro 2 caselle subiscono 4d6 e sono Rallentati, 3 Vapore')]});
add('B14',{ring:3,br:'Ambulatorio',name:'Sala Operatoria',type:'Carta',cards:[tec('Sala Operatoria','Suprema','Lente → Valvola → Lente','Tutti gli alleati entro 4 curano 4d6 + FOR; chi è a 0 PF si rialza, 3 Vapore')]});
add('B15',{ring:4,br:'—',name:'Corpo di Ferro',type:'Chiave',text:'+4 riduzione del danno permanente e soglia di Pressione 7, ma −2 Velocità a tutte le tue carte.'});
// ---- Incroci: 3 nodi per confine (due carte e un talento), ciascuno richiede 3 nodi in entrambi i mestieri
const XB=[ // [nome, mestiere a, mestiere b, mestiere dello stato/danno, ruolo]
 ['Tattica','G','M','G','Torrette e mira al tiratore, danno al meccanico'],
 ['Esplosivi','M','K','G','Danno ad area alla Meccanica e all\'Alchimia'],
 ['Medicina','K','B','B','Cure che induriscono: il Bionico cura, l\'Alchimia protegge'],
 ['Protesi','B','G','B','Danno al Bionico, difesa alle Armi']];
const XR=[
 ['X1',0,'Fuoco in Movimento','Carta',[card('Fuoco in Movimento',7,2,'Sparo a distanza 4, 2 + DES, Slancio 2; tecnica Base, +1d6 e il bersaglio Sanguina','Schivata 3','Grilletto')]],
 ['X2',0,'Torretta a Vapore','Carta',[tec('Torretta a Vapore','Avanzata','Ingranaggio + Grilletto','Torretta: distanza 5, 2d6, 2 bersagli')]],
 ['X3',0,'Fuoco di Copertura','Talento',null,'Le prime 2 caselle di movimento di ogni Scambio sono gratis se finisci in copertura; i tuoi Spari contro chi si è appena mosso hanno +2.'],
 ['X4',1,'Bomba a Orologeria','Carta',[card('Bomba a Orologeria',4,2,'Colpo a distanza 3, 2 + INT, area 2x2; tecnica Base, +1d6 e Sanguina','Schivata','Valvola')]],
 ['X5',1,'Carica Alchemica','Carta',[tec('Carica Alchemica','Avanzata','Valvola + Ingranaggio','Distanza 4, area 3x3, 3d6')]],
 ['X6',1,'Carica Sagomata','Talento',null,'I tuoi attacchi contro chi è Impigliato o Elettrizzato fanno +3.'],
 ['X7',2,'Trasfusione','Carta',[tec('Trasfusione','Avanzata','Lente + Bullone','Un alleato entro 3 cura 3d6 + FOR e ha +2 riduzione del danno per 1 Scambio')]],
 ['X8',2,'Bendaggio Rinforzato','Carta',[card('Bendaggio Rinforzato',5,2,'Tecnica Base, un alleato entro 4 cura 1d6 + FOR e ha +3 riduzione del danno fino alla fine del prossimo Scambio','Parata 4 + FOR','Bullone')]],
 ['X9',2,'Medico da Campo','Talento',null,'Le tue cure danno anche +2 riduzione del danno fino alla fine dello Scambio; quando Trattieni un nemico curi 1d4.'],
 ['X10',3,'Braccio Cannone','Carta',[pro('Braccio Cannone',5,2,'Sparo a distanza 3, 4 + FOR, spinge di 1','Ricarica','Grilletto')]],
 ['X11',3,'Caldaia Rovente','Carta',[card('Caldaia Rovente',null,null,'Postura: +2 riduzione del danno e chi ti colpisce in mischia subisce 1d4; −1 Velocità finché resta attiva',null,null,{post:true})]],
 ['X12',3,'Pistone Pesante','Talento',null,'Le tue Rotture fanno +2.']];
XR.forEach(([id,b,name,kind,cards,text],i)=>{const B=XB[b];
  add(id,{reg:'X',name,type:'Incrocio',kind,xname:B[0],xa:B[1],xb:B[2],xn:3,fel:B[3],xi:i%3,xb_i:b,
    text:(text?text+' ':'')+'('+B[0]+': '+B[4].toLowerCase()+'.)',cards:cards||[]});});

const LMAX=20; // livello massimo
const TREE={top:'puri'}; // Anello III e chiave di volta: 'libero' | 'ingresso' | 'puri'

const BUILDS=[
 {name:'Pistolero (Armi da fuoco, danno)',el:'G',steps:[['G1'],['G2',0],['G4',0],['G3'],['G10'],['G11'],['G7'],['G8'],['G13'],['G14',0],['G12'],['G15'],['G6'],['G9'],['C1',3],['G3'],['G10'],['G11'],['G14',0],['C2'],['C6',null,'Colpo al Cuore'],['C6',null,'Colpo di Revolver'],['C7'],['G5'],['C8']]},
 {name:'Chirurgo di Ferro (Bionico + Alchimia, Medicina)',el:'B',steps:[['B2'],['B1'],['B3'],['C4','K'],['K1'],['K3'],['K2'],['X7'],['X8'],['X9'],['B8'],['B9'],['B10',0],['K11'],['K8'],['K10'],['B6'],['B7'],['K6'],['C2'],['C6',null,'Suturatrice'],['C7'],['B5'],['K5'],['C8']]},
 {name:'Alchimista di Ferro (Alchimia, controllo e danno)',el:'K',steps:[['K2'],['K1'],['K4'],['K10'],['K7',0],['K6'],['K14'],['K9'],['K3'],['K8'],['K11'],['K12'],['K15'],['K13'],['C1',2],['C6',null,'Lancia dal Suolo'],['C2'],['C7'],['K5'],['C8']]},
 {name:'Ingegnere (Meccanica, automa e torrette)',el:'M',steps:[['M1'],['M3'],['M2'],['M6',1],['M10',0],['M8'],['M12'],['M4'],['M9'],['M14'],['M7'],['M11'],['M13'],['M15'],['C1',2],['C6',null,'Torretta da Campo'],['C2'],['C7'],['M5'],['C8']]},
 {name:'Colosso a Vapore (Bionico, tank e cure)',el:'B',steps:[['B1'],['B2'],['B4'],['B6'],['B7'],['B8'],['B10',0],['B12'],['B9'],['B14'],['B3'],['B11'],['B13'],['B15'],['C1',1],['C6',null,'Pugno a Pistone'],['C2'],['B5'],['C7'],['C8']]},
 {name:'Bombarolo (Meccanica + Alchimia, Esplosivi)',el:'M',steps:[['M3'],['M4'],['M2'],['C4','K'],['K2'],['K1'],['K4'],['X4'],['X5'],['X6'],['M1'],['M6',1],['M10',1],['K10'],['K7',0],['M8'],['K9'],['M9'],['C6',null,'Bomba a Orologeria'],['C6',null,'Torretta da Campo'],['C2'],['C7'],['M5'],['K5'],['C8']]},
 {name:'Tiratore Tattico (Armi + Meccanica, Tattica)',el:'G',steps:[['G1'],['G2',0],['G4',0],['C4','M'],['M3'],['M4'],['M2'],['X1'],['X2'],['X3'],['G6'],['G7'],['G8'],['M10',1],['M8'],['M1'],['G9'],['G3'],['C1',3],['C6',null,'Fuoco in Movimento'],['C2'],['C7'],['G5'],['M5'],['C8']]},
 {name:'Braccio Cannone (Bionico + Armi, Protesi)',el:'B',steps:[['B1'],['B3'],['B4'],['C4','G'],['G1'],['G2',1],['G3'],['X10'],['X11'],['X12'],['B2'],['B6'],['B7'],['G6'],['G7'],['G8'],['B11'],['C1',1],['C6',null,'Pugno a Pistone'],['C2'],['C7'],['B5'],['G5'],['C8']]}];

const MODS=['+1 Velocità','+1d6 danno','−1 stamina','Riga di Risposta','Cambio tipo d\'attacco'];
const TYPES={Carta:'Dà una carta precisa, che entra obbligatoriamente nel mazzo',Scuola:'Scegli 1 carta da un elenco',Talento:'Effetto permanente, spesso con un vantaggio fuori dal combattimento',Scelta:'Due opzioni, ne prendi una sola per sempre',Obbligo:'Potenziamento forte che aggiunge carte zavorra',Affinamento:'Togli carte (facoltativo) per snellire il mazzo',Chiave:'Chiave di volta: cambia una regola, con un costo. Una sola per personaggio',Incrocio:'Il nodo più forte: richiede nodi in due mestieri'};
const s358=L=>L>=8?5:L>=4?4:3;
// Caratteristiche uguali per tutti, per confrontare gli elementi e non le schede: principale +3/+4/+5 (livelli 1, 4, 8), secondaria fino a +3, COS +2
const sec=L=>L>=12?4:L>=4?3:2;
const PROF=[
 {short:'Pistolero',ai:'ranged',cos:2,mods:L=>({SAG:0,INT:0,DES:s358(L),FOR:1}),ab:L=>`DES +${s358(L)}, FOR +1, COS +2`},
 {short:'Chirurgo',ai:'tank',cos:2,mods:L=>({SAG:0,INT:sec(L),DES:0,FOR:s358(L)}),ab:L=>`FOR +${s358(L)}, INT +${sec(L)}, COS +2`},
 {short:'Alchimista',ai:'ranged',cos:2,mods:L=>({SAG:0,INT:s358(L),DES:1,FOR:0}),ab:L=>`INT +${s358(L)}, DES +1, COS +2`},
 {short:'Ingegnere',ai:'ranged',cos:2,mods:L=>({SAG:0,INT:s358(L),DES:sec(L),FOR:0}),ab:L=>`INT +${s358(L)}, DES +${sec(L)}, COS +2`},
 {short:'Colosso',ai:'tank',cos:2,mods:L=>({SAG:0,INT:0,DES:0,FOR:s358(L)}),ab:L=>`FOR +${s358(L)}, COS +2`},
 {short:'Bombarolo',ai:'ranged',cos:2,mods:L=>({SAG:0,INT:s358(L),DES:2,FOR:0}),ab:L=>`INT +${s358(L)}, DES +2, COS +2`},
 {short:'Tiratore',ai:'ranged',cos:2,mods:L=>({SAG:0,INT:sec(L),DES:s358(L),FOR:0}),ab:L=>`DES +${s358(L)}, INT +${sec(L)}, COS +2`},
 {short:'Cannone',ai:'tank',cos:2,mods:L=>({SAG:0,INT:0,DES:sec(L),FOR:s358(L)}),ab:L=>`FOR +${s358(L)}, DES +${sec(L)}, COS +2`}];
const AIDESC={melee:'mischia',support:'supporto in mischia',healer:'cura da dietro',ranged:'distanza e coperture',tank:'tank, attira i colpi'};
return {ORDER,EL,WEAP,N,XB,LMAX,TREE,BUILDS,PROF,UNIV,TYPES,MODS,AIDESC,id:'ingegno',nome:'Ingegno',sangue:1,FORGE:'G14',HK:{F15:'G15',F7:'G7',F9:'G9',F14:'G14',V4:'_',V7:'_',V10:'_',T6:'B6',T9:'_',T15:'B15',A9:'B9',A15:'_',X3:'_'},
 ST_TXT:{F:'Sanguina',A:'Rallentato',T:'Corroso',L:'Elettrizzato',V:'Pompato',J:'Inceppato'},
 txt:{noCatena:'ma i pezzi sul banco non bastano',senzaSigilli:'senza pezzi, Canna Rovente',suprema:'3 Vapore, banco svuotato',danza:'Ritmo del Tamburo +2 stamina',
  combustione:'Polvere Nera',cuore:'Canna Rovente lo brucia',peso:'Pistoni Sovraccarichi',pugno:'Pistone Pesante',forgia:'Armaiolo',fiamma:'Ordine di Fuoco',
  corrente:'Carica Sagomata',linfa:'Medico da Campo',sospinto:'è Pompato dalla caldaia (+1 Velocità)',brucia:'Sanguina',douse:"e ferma l'emorragia",scia:'con lo Scudo a Lamelle',
  flusso:'Vapore',sigilli:'pezzi'},
 voc:{elemento:'mestiere',Elemento:'Mestiere',Elementi:'Mestieri',secondo:'Secondo Mestiere',terzo:'Terzo Mestiere'}};
})();
