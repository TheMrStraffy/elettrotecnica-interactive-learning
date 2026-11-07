# Da Ohm a Karnaugh

Ripasso interattivo di **elettrotecnica** ed **elettronica** per gli istituti tecnici, indirizzo Elettronica ed Elettrotecnica, organizzato come un percorso **dalla 1ª alla 5ª**.

Ogni lezione ha un laboratorio da toccare a sinistra e gli appunti di teoria a destra. Esercizi, missioni, giochi e quiz danno punti esperienza (XP) e si sale di livello: Principiante, Apprendista, Tecnico, Perito, Progettista, Ingegnere.

## Come si usa

Apri `index.html` con un browser qualsiasi (doppio clic). Non serve installare niente e funziona anche offline; senza connessione cambiano solo i caratteri tipografici.

Se vuoi un unico file da mandare ai compagni:

```sh
npm run build        # crea dist/da-ohm-a-karnaugh.html, tutto incluso
```

## Il percorso

La pagina iniziale è una mappa per anno. Le unità pronte si aprono; le altre sono segnate "in arrivo" con la fase in cui verranno aggiunte.

| Anno | Unità pronte | In arrivo |
| --- | --- | --- |
| 1ª–2ª | Il circuito elementare, Resistori e resistività, **Grandezze, unità e notazione scientifica**, **Formule inverse, equazioni e sistemi**, **Carica, campo e potenziale** | — |
| 3ª | **Reti in corrente continua** (15 lezioni), **Condensatori e transitori RC**, **Magnetismo e induttori**, Sistemi di numerazione, Porte logiche e circuiti, Algebra di Boole e Karnaugh, **Circuiti combinatori integrati** | — |
| 4ª | — | Corrente alternata, RLC, potenze, diodi, transistor, operazionali, logica sequenziale, filtri |
| 5ª | — | Applicazioni degli operazionali, filtri attivi, oscillatori, conversione A/D e D/A, trasduttori, alimentatori, microcontrollori, controlli |

### Reti in corrente continua

L'unità nasce dal documento "Circuiti in corrente continua — piano ed esercizi svolti". Ogni modulo ha un elemento interattivo, l'esempio del documento (con il pulsante "Altri numeri") e più tipi di esercizio con correzione automatica. Il pulsante "Altro esercizio" genera sempre un circuito nuovo con numeri puliti.

| Lezione | Interattivo | Esercizi |
| --- | --- | --- |
| 1 · Legge di Ohm | Caratteristica V–I con cursori | Trova I, V, R; dati di targa; problema rovesciato; scelta della potenza del resistore |
| 2 · Serie | Scala dei potenziali | Serie completa, potenziali dei nodi, partitore, progetto del partitore, resistore per un LED |
| 3 · Parallelo | Ripartizione della corrente tra i rami | Parallelo completo, partitore di corrente, resistori uguali, resistore da aggiungere, trova l'errore |
| 4 · Misto | Riduzione e risalita passo per passo | Tre circuiti misti diversi, riconoscere i collegamenti |
| Laboratorio | Serie, parallelo e misto con Kirchhoff | Esercizio lampo |
| 5 · Kirchhoff | Gira la freccia di una corrente e guarda il segno | Correnti di ramo, numero di equazioni |
| 6 · Maglie | Il sistema scritto "a vista" | Correnti di maglia, coefficienti del sistema |
| 7 · Millman | V_A come media pesata | Millman, tre rami tra due nodi, trova l'errore nel numeratore |
| 8 · Sovrapposizione | Accendi e spegni i generatori | Casi parziali, perché le potenze non si sommano |
| 9 · Thevenin e Norton | Un equivalente, tanti carichi | Thevenin, Norton, cambio del carico, generatore reale, partitore sotto carico |
| ★ · Cinque metodi | Lo stesso circuito risolto in cinque modi, con i valori modificabili | — |
| 10 · Stella-triangolo | Ponte di Wheatstone con galvanometro da azzerare | Triangolo → stella, stella → triangolo, ponte non bilanciato, ponte da bilanciare |
| 11 · Potenza | Curve di potenza e rendimento al variare del carico | Bilancio delle potenze, energia e costo, massimo trasferimento |
| ✓ · Verifica | — | I sette esercizi di verifica del documento, poi varianti casuali |
| Σ · Metodo | Guida alla scelta del metodo | Formulario e checklist |

### Biennio

Tre unità da 4 lezioni, con lo stesso schema delle reti: un elemento interattivo per lezione, un esempio con "Altri numeri" ed esercizi autocorretti.

| Unità | Lezioni e interattivi |
| --- | --- |
| Grandezze, unità e notazione scientifica | Unità SI (calcolatrice delle unità: V × A = W), prefissi (scala da giga a pico), notazione scientifica (valori reali su scala logaritmica e convertitore), cifre significative ed errori (arrotondamento e tolleranza di un resistore) |
| Formule inverse, equazioni e sistemi | Formule inverse (la formula rigirata un passo alla volta), proporzionalità (diretta, inversa, quadratica con il grafico e il tasto "raddoppia"), equazioni di primo grado (soluzione passo per passo), sistemi 2×2 (due rette con Cramer in diretta e il sistema di un circuito) |
| Carica, campo e potenziale | Carica (quanti elettroni passano), legge di Coulomb (due cariche con le forze e la curva 1/r²), campo elettrico (mappa da toccare per leggere intensità e direzione), potenziale (la collina tra due armature, con carica positiva o elettrone) |

### Terzo anno: condensatori, magnetismo, combinatori integrati

Tre unità da 4 lezioni, ognuna con almeno un elemento interattivo. Ogni lezione propone lo stesso problema in più modi (dati diretti, problema rovesciato, lettura da un grafico o da una tabella) e domande concettuali.

| Unità | Lezioni e interattivi |
| --- | --- |
| Condensatori e transitori RC | Capacità (condensatore piano con area, distanza, dielettrico e tensione), serie e parallelo (rete di condensatori con cariche e tensioni), carica (deviatore, curva di v<sub>C</sub> e i con il pulsante "Avvia"), scarica (tangente iniziale che incontra l'asse a τ) |
| Magnetismo e induttori | Campo di un filo e di un solenoide (bussola e nucleo di ferro), forza su un filo e tra due fili, induzione (spira che ruota tra due poli: flusso e f.e.m.), induttori e transitorio RL |
| Circuiti combinatori integrati | Decoder 3 → 8 (enable, uscite attive basse) ed encoder a priorità, multiplexer 4:1 (con la selezione che scorre: parallelo → seriale), sommatore-sottrattore a 4 bit con riporti e overflow, comparatore a 4 bit e decoder BCD → 7 segmenti con la mappa di Karnaugh di ogni segmento |

Negli esercizi dei combinatori si risponde anche con sequenze di bit (`0110`), insiemi di segmenti (`a, b, g`) ed espressioni booleane, che vengono controllate: devono essere equivalenti e, dove richiesto, in forma minima.

### Le altre unità

| Unità | Laboratorio |
| --- | --- |
| Il circuito elementare | Generatore reale con interruttore, amperometro e voltmetro; cariche animate; cortocircuito; resistore che si scalda; grafico V–I; missioni |
| Resistori | Codice colori a 4 e 5 fasce (anche al contrario: scrivi `4k7`); gioco "leggi il resistore"; seconda legge di Ohm |
| Numeri binari | Registro a 4/8/16 bit, conversioni, divisioni successive, somma e sottrazione in complemento a 2, gioco "accendi i bit" |
| Porte e circuiti | Le 7 porte con simboli ANSI e IEC, semisommatore, sommatore completo, multiplexer, maggioranza |
| Karnaugh | Tabella di verità e mappa sincronizzate, forme canoniche e minime, gruppi spiegati, circuito AND-OR, allenamento |
| Sfide | Quiz misto con domande generate a caso e sfida a tempo |
| Formulario | Tutte le formule con le unità di misura |

## Struttura

```
index.html            pagina con le sezioni e gli appunti
css/style.css         tema chiaro "quaderno a quadretti", tema scuro "lavagna"
js/core.js            numeri all'italiana, prefissi SI, punti esperienza
js/path.js            percorso dalla 1ª alla 5ª, navigazione, vista delle unità
js/lessons.js         motore delle lezioni: esercizi con correzione, esempi svolti, tabelle R-I-V-P
js/dc.js              risolutore di reti in corrente continua e metodi delle lezioni
js/schematics.js      schemi SVG dei circuiti
js/units/cc-*.js      unità "Reti in corrente continua"
js/units/b-*.js       unità del biennio (grandezze, algebra, elettrostatica)
js/units/t-*.js       unità del terzo anno (condensatori, magnetismo, combinatori integrati)
js/phys.js            analisi dimensionale, notazione scientifica, sistemi 2×2, Coulomb e campo, condensatori, magnetismo
js/logic.js           motore booleano: forme canoniche, Quine–McCluskey, lettore di espressioni, sommatori, decoder, display
js/circuit.js …       laboratori (circuito, resistori, reti, binario, porte, Karnaugh, sfide)
tests/                test dei motori di calcolo
tools/                script per il file unico
```

Per aggiungere un'unità: un file in `js/units/` che registra le sue lezioni in `App.unitsData`, e una voce nell'elenco `YEARS` di `js/path.js`.

## Test

```sh
npm test
```

- Logica: la forma minima calcolata coincide con una ricerca esaustiva su tutte le 256 funzioni a 3 variabili e su 150 funzioni casuali a 4 variabili con indifferenze.
- Biennio: analisi dimensionale delle unità SI, notazione scientifica e ingegneristica su 2000 valori casuali, cifre significative, sistemi 2×2 contro soluzioni note, Coulomb e campo di un dipolo.
- Terzo anno: condensatore piano, serie e parallelo, carica e scarica con le formule inverse del tempo su 200 casi casuali; campo di filo e solenoide, induttanza, forze, flusso; sommatore a 4 bit su tutte le 512 combinazioni (somma, riporto, overflow = C4 ⊕ C3, sottrazione), decoder, multiplexer, encoder a priorità, segmenti del display.
- Reti: il risolutore riproduce i risultati del documento; correnti di ramo, maglie, Millman, sovrapposizione e Thevenin danno lo stesso risultato del risolutore su 2000 circuiti casuali; stella-triangolo, Millman a tre rami e reti miste sono verificati allo stesso modo.
