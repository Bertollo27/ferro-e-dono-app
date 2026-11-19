# NAVIGAZIONE — MY-GDR (Ferro & Dono)

Complemento scritto a mano di `GRAPH_REPORT.md` (che è generato da graphify): qui ci sono i **numeri di riga** e "dove guardare per cosa", che il report di graphify non dà. Apri solo il pezzo che serve (con `sed -n 'A,Bp'` sulle righe indicate).

- Aggiornata: 2026-11-19, commit di riferimento `17e83a3` (branch main).
- **Regola fissa:** quando cambia un documento coperto dalla mappa, aggiorna `GRAPH_REPORT.md`/`graph.json` (rilanciando graphify) e questo file nello stesso commit.

## 1. Corpus

| Dove | Cosa | Note |
|---|---|---|
| Repo `Bertollo27/ferro-e-dono-app` | L'app di combattimento (PWA) online su https://bertollo27.github.io/ferro-e-dono-app/ | **Fonte di verità del codice.** 2.300 righe, righe molto lunghe (codice compatto): non leggere i file interi. |
| `/mnt/project-files/app-telefono/` | Copia **vecchia** dell'app (un solo `dati.js`, motore 51 KB) + `ISTRUZIONI-PER-KIMI.md` + `pacchetto-kimi.zip` | Diversa dal repo: usarla solo per le istruzioni a Kimi. |
| Artifact (claude.ai) | Design doc, alberi, visualizzatori e simulatori | Elenco al §5. Sono la fonte delle regole e dei dati di bilanciamento. |
| Memoria di progetto | Decisioni di Nico (regole, bilanciamento, ruoli) | `gdr-progetto.md`, `gdr-regole-combattimento.md`, `gdr-app-telefono.md`, indice `MEMORY.md`. |

## 2. Nodi centrali (i più collegati)

1. **`motore.js`** (711 righe) — regole del combattimento per Dono e Ingegno, IA, crescita. Tutto passa da qui.
2. **`dati-dono.js` / `dati-ingegno.js`** — carte, nodi della Ragnatela, build consigliate, profili IA. Stessa struttura, un oggetto globale ciascuno (`DONO`, `INGEGNO`).
3. **`app.js`** (591 righe) — schermate e comandi touch; usa solo l'API del motore.
4. **Scambio** (concetto) — un round: una carta a testa, rivelate insieme, risolte per Velocità. Codice: `exchangeGen` in motore.js:468.
5. **Ragnatela** (concetto) — l'albero a ragnatela di ogni fazione; nel motore è `F.R` (via `RETI`, motore.js:5).

## 3. Comunità (gruppi di file e funzioni)

### A. Dati di bilanciamento — `dati-dono.js` (207 righe), `dati-ingegno.js` (213 righe)
Stessa forma nei due file (numeri di riga Dono / Ingegno):
- `ORDER` r.4/4 — anello: Dono `F V A T` (Fuoco–Vento–Acqua–Terra), Ingegno `G M K B` (Armi–Meccanica–Alchimia–Bionico).
- helper `card`, `tec`, `zav` r.5-7 (Ingegno anche `trs` Trasmutazioni, `pro` protesi r.8-9).
- `UNIV` r.8/10 carte universali · `EL` r.12/14 elementi/mestieri con ruolo, rami e carte · `WEAP` r.47/50 armi.
- `N` + `add()` r.55/58 — i **nodi** della Ragnatela (71 nodi aggiunti per file; centro, regioni, anelli).
- `XB`/`XR` r.151-156 / 156-161 — incroci (Cenere F+V, Fulmine V+A, Legno A+T, Magma T+F / Tattica, Esplosivi, Medicina, Protesi).
- `LMAX=20` r.173/178 · `TREE.top` r.174/179 (`'puri'`: Anello III e chiave solo ai puri).
- `BUILDS` r.176/181 — 8 build per fazione = le **16 basi** dell'app:
  - Dono: Drago di Brace, Custode del Legno, Sacerdotessa della Marea, Kaze, Bastione di Pietra, Lama della Tempesta, Fiamma Errante, Pugno di Magma.
  - Ingegno: Pistolero, Chirurgo di Ferro, Alchimista di Ferro, Ingegnere, Colosso a Vapore, Bombarolo, Tiratore Tattico, Braccio Cannone.
- `MODS` r.185/191 potenziamenti Maestria · `TYPES` tipi di nodo · `PROF` r.190/196 profili IA · `AIDESC` · vocabolario finale (`voc`: elemento/mestiere, Flusso/Vapore, sigilli/pezzi).
- Si rigenerano dal Visualizzatore del Dono e dalla Ragnatela dell'Ingegno (artifact).

### B. Motore delle regole — `motore.js`
| Righe | Cosa |
|---|---|
| 1-95 | Ragnatela e crescita interna: `RETI`, `usaRete/conRete`, `newState`, `take`, `planBuild` (segue una build) |
| 96-103 | `RPS` icone sasso-carta-forbici, griglia `W=14,H=9`, `MAPS` (aperta, casse, vicolo) |
| 104-113 | **Regole numeriche**: `RULES` (r.105: parametri bilanciamento, pet, sparo, fuoco amico…), `BURN`, `COUNTER`, `INTERR`, `TRI` (triangolo attacco/difesa → Vinta/Retta/Persa), `OUT` |
| 114-137 | dadi e utilità; `velOf` (Velocità), `costOf` (costo stamina/simboli), `tecReady` (tecniche pronte: sigilli) |
| 138-175 | `fxOf` (r.139: legge il testo della carta e ne ricava l'effetto), `atkInfo`, `defInfo` |
| 176-210 | griglia: `los`, `cover`, `bfs`, spinte `pushBest`, `reposition`, `stepToward` |
| 211-275 | `mkF` (crea un combattente), `drawCard`, `targetsFor`, **IA**: `moveAI` r.226, `choose` r.244 |
| 276-319 | Ingegno: pet/automa/torrette (`mkPet`, `spawnAutomi`, `petMove`), `jam` (Inceppato), `ingEnd` |
| 320-385 | `act` r.321 — esegue la carta giocata (zavorra, posture, cure, buff, sfida, aree…) |
| 386-467 | danni: `hurt`, `rdOf` (riduzione danno, Pelle di Pietra ecc.), `hit`/`hit0` (attacco contro difesa, Spiraglio/Impeto) |
| 468-512 | **`exchangeGen`** r.468 — lo Scambio completo; `runFight` r.513 (partita automatica, usata dal test) |
| 525-611 | **Movimento simultaneo con collisioni** (regola Nico 2026-11-03): `reach`, `iaCollisione`, `attaccoOpportunita` r.561, `exchange` |
| 612-628 | spostamenti scelti dal giocatore dopo Schivata/Aggiramento; `registroPassi` (replay passo per passo) |
| 629-675 | **API partita manuale**: `nuovaPartita`, `caselleRaggiungibili`, `bersagliCarta`, `motivoCartaNonGiocabile`, `risolviScambio`, `continuaScambio`, `istantanea` |
| 676-711 | **API crescita**: `nuovaScheda`, `schedaConsigliata`, `nodiDisponibili`, `prendiNodo`, `sostituisciCarta`, `affinaTogli/affinaFine`, `maestriaApplica`, `schedaPronta`, `basi` |

### C. Interfaccia — `app.js`, `index.html`, `stile.css`
- `app.js`: memoria telefono `mem` r.14 (localStorage: `fd-cfg`, `fd-registro`), stato `S` r.27, `render` r.42; schermate `vHome` r.55, `vPrep` r.90, crescita `vCresc` r.152 / `vNodo` / `vMazzo`, scontro `vGriglia` r.200, `vCarta` r.286, `vScontro` r.314, replay r.348-420, fogli r.421, fine r.451, registro partite r.461-480; azioni `AZ` r.512.
- `index.html`: ordine di caricamento **dati-dono → dati-ingegno → motore → app** (obbligatorio).
- `stile.css`: solo grafica (tema "notte di fucina"), **file di Kimi**; tenere i nomi delle classi usati da app.js.

### D. Supporto
- `sw.js` service worker offline (`VERSIONE='fd-v7'`: cambiarla se cambia l'elenco file). `manifest.webmanifest`, `icone/`.
- `test-motore.mjs`: `node test-motore.mjs` — 96 scontri automatici 1v1-4v4, partita manuale mista, 16 crescite fino al 20, 6 partite 4v4.
- `guida.html`: guida giocatori in 10 sezioni (Scambio, incontri, carta, attacco/difesa, esempio, stamina e tecniche, vantaggi, crescita, Ingegno, uso app). Versione artifact: https://claude.ai/artifact/KvDwUjvqA3wowpjqRD4gFc
- `README.md`: tabella file e chi li modifica.

## 4. Collegamenti da tenere a mente

- Una regola di gioco nuova tocca **tre posti**: `motore.js` (codice), `guida.html` (spiegazione), design doc (artifact) + memoria di progetto.
- Un valore di bilanciamento tocca `dati-*.js` **e** il simulatore artifact da cui il file si rigenera: cambiarlo solo nel repo lo perde alla rigenerazione.
- `RULES` (motore.js:105) contiene parametri numerici comuni (non solo regole): è il primo posto dove cercare un numero che non è in una carta.
- Attacco di opportunità nell'app = 3 + caratteristica migliore (motore.js:561); il design doc dice arma + caratteristica: da rivedere (nota di Nico).
- Bug noto in memoria: nei simulatori Ingegno le carte multi-bersaglio colpivano un solo bersaglio; nell'app 1v1 il Dono vince solo ~32% vs Ingegno.
- La copia in `/mnt/project-files/app-telefono/` non è allineata al repo.

## 5. Documenti fuori dal repo (artifact)

| Documento | Link | Contiene |
|---|---|---|
| Design doc (Claude Doc) | https://claude.ai/artifact/TaQyGhxEZ1yc9Y2jUWJzt7 | Regole complete, ambientazione, movimento, stati |
| Alberi abilità v0.2 | https://claude.ai/artifact/75TKbcqE68SjNFCwASayyg | Ragnatela del Dono: 81 nodi, incroci, listino carte |
| Visualizzatore Dono | https://claude.ai/artifact/WzNtKummbDhSNngVVhdvi7 | Simulatore + "Gioca tu"; genera `dati-dono.js` |
| Ragnatela Ingegno | https://claude.ai/artifact/B3fnBaGvo616vBqjad5LDB | Simulatore Ingegno; genera `dati-ingegno.js` |
| Varianti del mazzo | https://claude.ai/artifact/81UvSkN3hFwcAzaYADQ9Tp | Simulazioni sulle dimensioni del mazzo |
| Ruoli Ingegno (superato) | https://claude.ai/artifact/Mpkxekg86CxUFfmtZhggGK | Spiegazione ruoli, superata dal giro 1 |
| Guida nuovi giocatori | https://claude.ai/artifact/KvDwUjvqA3wowpjqRD4gFc | Come `guida.html` |

## 6. Domande frequenti → dove guardare

| Domanda | Apri |
|---|---|
| Cosa fa la carta X? | `grep -n "'X'" dati-*.js`, poi `fxOf` motore.js:139 se l'effetto sembra sbagliato |
| Perché l'IA fa Y? | `moveAI`/`choose` motore.js:226-275, `PROF` in dati-*.js |
| Come si risolve uno Scambio? | `exchangeGen` motore.js:468, `act` r.321, `hit` r.388 |
| Movimento, collisioni, opportunità | motore.js:525-611 |
| Danno, riduzione, cure | `hurt`/`rdOf` motore.js:386-387, `act` |
| Crescita/livelli/nodi | dati-*.js `N`/`BUILDS`, motore.js:676-711 |
| Schermata dell'app | app.js (§3C) |
| Colori/grafica | stile.css (Kimi) |
| Regole decise da Nico | memoria di progetto, poi design doc |
