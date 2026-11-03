# Ferro & Dono · app di combattimento

Il gioco a carte di Ferro & Dono da giocare sul telefono contro l'IA, da 1 contro 1 a 4 contro 4. Dono e Ingegno possono stare nella stessa squadra.

**Per giocare:** https://bertollo27.github.io/ferro-e-dono-app/

## Installarla sul telefono

- **Android (Chrome):** apri il link, menu ⋮ → *Installa app* (o *Aggiungi a schermata Home*).
- **iPhone (Safari):** apri il link, tasto Condividi → *Aggiungi alla schermata Home*.

Dopo la prima apertura funziona anche senza rete. La guida per i nuovi giocatori è nell'app (*Come si gioca*) e in `guida.html`.

## Come sono fatti i file

| File | Cosa contiene | Chi lo modifica |
|---|---|---|
| `dati-dono.js` | Ragnatela, carte e percorsi consigliati del Dono | si rigenera dal Visualizzatore del Dono |
| `dati-ingegno.js` | Ragnatela, carte e percorsi consigliati dell'Ingegno | si rigenera dalla Ragnatela dell'Ingegno |
| `motore.js` | Regole del combattimento, IA, crescita dei personaggi | Claude |
| `app.js` | Schermate e comandi touch | Claude |
| `stile.css` | Solo l'aspetto grafico: colori, caratteri, forme | **Kimi** (grafica) |
| `guida.html` | Guida rapida con schemi ed esempi | Claude |
| `sw.js`, `manifest.webmanifest`, `icone/` | Installazione e funzionamento offline | — |
| `test-motore.mjs` | Prova automatica del motore: `node test-motore.mjs` | — |

### Aggiornare il bilanciamento

Si sostituiscono `dati-dono.js` e/o `dati-ingegno.js` (e `motore.js` se cambiano le regole), si lancia `node test-motore.mjs` e si carica su GitHub. I telefoni prendono la versione nuova alla prossima apertura con la rete.

### Regole per chi cambia la grafica

`stile.css` si può riscrivere liberamente, mantenendo i nomi delle classi elencati nel file: `app.js` usa quelli. Non serve toccare gli altri file. Le immagini nuove vanno in una cartella `immagini/`.

## Partite giocate

Ogni partita finita viene salvata sul telefono. Da *Partite giocate* si può scaricare il file JSON (o copiarlo) e mandarlo per il bilanciamento.

## Prossime fasi

1. Partite online tra amici fino a 8 giocatori (Firebase, piano gratuito).
2. Raccolta automatica delle partite per il bilanciamento.
