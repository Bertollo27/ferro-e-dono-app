# Graph Report - MY-GDR  (2026-11-19)

## Corpus Check
- Corpus is ~21,183 words - fits in a single context window. You may not need a graph.

## Summary
- 295 nodes · 674 edges · 8 communities (7 shown, 1 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.81)
- Token cost: 95,008 input · 0 output

## Community Hubs (Navigation)
- Motore: Ragnatela e API
- Regole del combattimento (guida)
- Dati, file app e test
- Interfaccia app.js
- Risoluzione dello Scambio
- Griglia e movimento
- Decisioni e artifact di design
- Service worker offline

## God Nodes (most connected - your core abstractions)
1. `Come si gioca · guida rapida` - 33 edges
2. `exchangeGen()` - 29 edges
3. `act()` - 22 edges
4. `dist()` - 21 edges
5. `Istruzioni per Kimi (Fase 1)` - 19 edges
6. `hit0()` - 17 edges
7. `MEMORY MY-GDR` - 17 edges
8. `choose()` - 16 edges
9. `muoviTutti()` - 15 edges
10. `enemies()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Guida nuovi giocatori (artifact)` --semantically_similar_to--> `Come si gioca · guida rapida`  [INFERRED] [semantically similar]
  memoria/MEMORY.md → app/guida.html
- `Preparare la Fase 2 (online Firebase)` --semantically_similar_to--> `Prossime fasi: online Firebase fino a 8`  [INFERRED] [semantically similar]
  condivisi/ISTRUZIONI-PER-KIMI.md → app/README.md
- `Architettura PWA + Firebase Spark` --semantically_similar_to--> `Preparare la Fase 2 (online Firebase)`  [INFERRED] [semantically similar]
  memoria/gdr-app-telefono.md → condivisi/ISTRUZIONI-PER-KIMI.md
- `Registro delle partite (localStorage, Esporta)` --semantically_similar_to--> `Partite giocate (export JSON)`  [INFERRED] [semantically similar]
  condivisi/ISTRUZIONI-PER-KIMI.md → app/README.md
- `Ambientazione Asia steampunk era Meiji` --semantically_similar_to--> `Stile steampunk giapponese (era Meiji)`  [INFERRED] [semantically similar]
  memoria/gdr-progetto.md → condivisi/ISTRUZIONI-PER-KIMI.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Caricamento app: dati, motore, interfaccia, stile** — app_index_doc, app_dati_dono, app_dati_ingegno, app_motore, app_app, app_readme_stile_css [EXTRACTED 1.00]
- **Vantaggi dal triangolo attacco/difesa** — app_guida_triangolo, app_guida_spiraglio, app_guida_impeto, app_guida_guardia_rotta, app_guida_interruzione [EXTRACTED 1.00]
- **Preparazione al multiplayer Fase 2** — condivisi_istruzioni_per_kimi_fase2, condivisi_istruzioni_per_kimi_piani_json, condivisi_istruzioni_per_kimi_istantanea, memoria_gdr_app_telefono_architettura [INFERRED 0.85]

## Communities (8 total, 1 thin omitted)

### Community 0 - "Motore: Ragnatela e API"
Cohesion: 0.06
Nodes (57): affinaFine(), affinaTogli(), allaPosizione(), avanzaScambio(), BCACHE, bersagliCarta(), buildAt(), BURN (+49 more)

### Community 1 - "Regole del combattimento (guida)"
Cohesion: 0.06
Nodes (52): Attacco di opportunità, Automa e torrette, La carta (metà alta / metà bassa), Catena di sigilli, Come si gioca · guida rapida, Esempio Drago vs Bastione, Flusso, Guardia rotta (Sbilanciato) (+44 more)

### Community 2 - "Dati, file app e test"
Cohesion: 0.06
Nodes (36): DONO, INGEGNO, Percorso consigliato, index.html Ferro & Dono, Aggiornare il bilanciamento, README app di combattimento, Kimi (grafica), Partite giocate (export JSON) (+28 more)

### Community 3 - "Interfaccia app.js"
Cohesion: 0.09
Nodes (34): apriReplay(), cartaDuello(), cartaMini(), costruisciFotogrammi(), crescPosto(), dopoPasso(), freccia(), infoPg() (+26 more)

### Community 4 - "Risoluzione dello Scambio"
Cohesion: 0.12
Nodes (37): act(), allies(), atkInfo(), attaccoOpportunita(), canDebt(), choose(), costOf(), defInfo() (+29 more)

### Community 5 - "Griglia e movimento"
Cohesion: 0.21
Nodes (28): applyMove(), bfs(), caselleRaggiungibili(), costoMovimento(), cover(), dist(), enemies(), free() (+20 more)

### Community 6 - "Decisioni e artifact di design"
Cohesion: 0.12
Nodes (15): App installabile (GitHub Pages), Dono v26 (RULES.ff), Alberi abilità (v0.2), Documento di design, MEMORY MY-GDR, Fuoco amico su tutti i danni ad area, Guida nuovi giocatori (artifact), Livello massimo 20 (+7 more)

## Knowledge Gaps
- **16 isolated node(s):** `Fase 1: PWA contro l'IA 1v1-4v4`, `Schermate (Home, Preparazione, Crescita, Scontro, Rivelazione, Fine)`, `Criteri di accettazione`, `Mappa del progetto (graphify-MY-GDR)`, `Nico` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 60 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `README app di combattimento` connect `Dati, file app e test` to `Motore: Ragnatela e API`, `Regole del combattimento (guida)`, `Interfaccia app.js`, `Decisioni e artifact di design`?**
  _High betweenness centrality (0.298) - this node is a cross-community bridge._
- **What connects `Fase 1: PWA contro l'IA 1v1-4v4`, `Schermate (Home, Preparazione, Crescita, Scontro, Rivelazione, Fine)`, `Criteri di accettazione` to the rest of the system?**
  _16 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Motore: Ragnatela e API` be split into smaller, more focused modules?**
  _Cohesion score 0.05780885780885781 - nodes in this community are weakly interconnected._
- **Why does `Come si gioca · guida rapida` connect `Regole del combattimento (guida)` to `Dati, file app e test`, `Interfaccia app.js`, `Decisioni e artifact di design`?**
  _High betweenness centrality (0.235) - this node is a cross-community bridge._
- **Should `Regole del combattimento (guida)` be split into smaller, more focused modules?**
  _Cohesion score 0.06168831168831169 - nodes in this community are weakly interconnected._
- **Why does `index.html Ferro & Dono` connect `Dati, file app e test` to `Motore: Ragnatela e API`, `Interfaccia app.js`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Should `Dati, file app e test` be split into smaller, more focused modules?**
  _Cohesion score 0.05735430157261795 - nodes in this community are weakly interconnected._