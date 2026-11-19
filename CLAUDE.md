# Ferro & Dono — istruzioni per Claude

Nico scrive in italiano: rispondi in italiano.

## Mappa del progetto (regole fisse)

1. **Prima di leggere file per capire il progetto, consulta la mappa** in `graphify-MY-GDR/`:
   - `GRAPH_REPORT.md` — report di graphify (nodi centrali, comunità, collegamenti);
   - `NAVIGAZIONE.md` — numeri di riga e "dove guardare per cosa";
   - `graph.json` (grafo, interrogabile con `graphify query "<domanda>" --graph graphify-MY-GDR/graph.json`) e `graph.html` (vista interattiva).
   Apri poi solo le righe indicate: i file `.js` hanno righe molto lunghe.
2. **La mappa va aggiornata a ogni modifica dei documenti che contiene**, nello stesso commit, con data e commit di riferimento in `NAVIGAZIONE.md`. Se lavori in un progetto con la cartella condivisa, ricopia la cartella in `/mnt/project-files/graphify-MY-GDR/`.
   Come rigenerarla: graphify si lancia su una cartella "corpus" che contiene `app/` (i file del repo, senza `graphify-MY-GDR/`, `icone/`, `CLAUDE.md`), `condivisi/ISTRUZIONI-PER-KIMI.md` (da `/mnt/project-files/app-telefono/`) e `memoria/` (i file `.md` della memoria di progetto); poi si copiano `GRAPH_REPORT.md`, `graph.json`, `graph.html`, `manifest.json`, `cost.json` e `.graphify_labels.json` qui.
3. Niente installazioni (pip, npm, ecc.) senza l'ok di Nico. Eccezione già approvata da Nico (2026-11-19): nelle sessioni cloud si può installare graphify (`pip install graphifyy`) per aggiornare la mappa. Sul PC di Nico graphify è già installato.
