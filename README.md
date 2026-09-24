# Da Ohm a Karnaugh

Ripasso interattivo di **elettrotecnica** ed **elettronica digitale** per la 3ª e 4ª superiore (istituti tecnici, indirizzo elettronica ed elettrotecnica).

Ogni scheda ha un laboratorio da toccare a sinistra e gli appunti di teoria a destra. Missioni, giochi e quiz danno punti esperienza (XP) e si sale di livello: Principiante, Apprendista, Tecnico, Perito, Progettista, Ingegnere.

## Come si usa

Apri `index.html` con un browser qualsiasi (doppio clic). Non serve installare niente e funziona anche offline; senza connessione cambiano solo i caratteri tipografici.

Se vuoi un unico file da mandare ai compagni:

```sh
npm run build        # crea dist/da-ohm-a-karnaugh.html, tutto incluso
```

## Cosa contiene

| Scheda | Laboratorio | Teoria |
| --- | --- | --- |
| **01 Il circuito** | Generatore reale con interruttore, amperometro e voltmetro; cariche animate (verso convenzionale o elettroni); cortocircuito; resistore che si scalda e si brucia; grafico V–I con punto di lavoro; missioni | Carica e corrente, ddp, forza elettromotrice, generatore reale, 1ª legge di Ohm (triangolo), potenza ed effetto Joule, circuito aperto e cortocircuito, massimo trasferimento di potenza |
| **02 Resistori** | Codice colori a 4 e 5 fasce (anche al contrario: scrivi `4k7` e compaiono i colori); gioco "leggi il resistore"; seconda legge di Ohm con materiali, sezioni commerciali e temperatura | Resistività, conduttanza, coefficiente di temperatura, tabella dei colori, serie E12/E24, notazione da schema |
| **03 Serie e parallelo** | Rete serie, parallelo o mista con tensioni e correnti su ogni resistore; soluzione passo per passo; verifica di Kirchhoff e bilancio delle potenze; esercizi generati a caso | Nodi, rami, maglie; serie e parallelo; partitori di tensione e di corrente; principi di Kirchhoff; metodo per reti miste |
| **04 Numeri binari** | Registro a 4/8/16 bit cliccabile con decimale, C2, esadecimale, ottale e BCD; somma dei pesi; raggruppamenti hex/ottale; divisioni successive; somma e sottrazione a 8 bit con i riporti; gioco "accendi i bit" | Sistemi posizionali, bit/nibble/byte, conversioni, BCD, complemento a 2, overflow |
| **05 Porte e circuiti** | Simulatore di AND, OR, NOT, NAND, NOR, XOR, XNOR (2 o 3 ingressi, simboli ANSI o IEC) con tabella di verità; semisommatore, sommatore completo, multiplexer 2:1, maggioranza con segnali colorati | Porte fondamentali, porte universali, circuiti combinatori, procedimento di progetto |
| **06 Karnaugh** | Tabella di verità e mappa (2, 3, 4 variabili) sincronizzate, con indifferenze; forme canoniche SP e PS (espanse) e forme minime (ridotte) con gruppi colorati e spiegati; circuito AND-OR generato; allenamento con correzione automatica | Teoremi dell'algebra di Boole, mintermini e maxtermini, codice Gray, regole di raggruppamento, esempio svolto |
| **Sfide** | Quiz misto con domande generate a caso, spiegazione dopo ogni risposta, serie di risposte giuste, sfida a tempo di 90 secondi con record | — |
| **Formulario** | Tutte le formule con le unità di misura | — |

## Struttura

```
index.html          pagina con tutte le schede e gli appunti
css/style.css       tema chiaro "quaderno a quadretti", tema scuro "lavagna"
js/core.js          numeri all'italiana, prefissi SI, punti esperienza, schede
js/logic.js         motore booleano: forme canoniche, Quine–McCluskey, lettore di espressioni
js/circuit.js       scheda 01
js/resistors.js     scheda 02
js/networks.js      scheda 03
js/binary.js        scheda 04
js/gates.js         scheda 05 (e disegno dei circuiti AND-OR)
js/karnaugh.js      scheda 06
js/quiz.js          sfide
tests/              test del motore logico
tools/              script per il file unico
```

## Test

```sh
npm test
```

I test confrontano la forma minima calcolata con una ricerca esaustiva su tutte le 256 funzioni a 3 variabili e su 150 funzioni casuali a 4 variabili con indifferenze.
