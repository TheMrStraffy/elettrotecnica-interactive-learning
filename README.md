# Da Ohm a Karnaugh

Ripasso interattivo di **elettrotecnica** ed **elettronica** per gli istituti tecnici, indirizzo Elettronica ed Elettrotecnica, organizzato come un percorso **dalla 1ª alla 5ª**.

Ogni lezione ha un laboratorio da toccare a sinistra e gli appunti di teoria a destra. Esercizi, missioni, giochi e quiz danno punti esperienza (XP) e si sale di livello: Principiante, Apprendista, Tecnico, Perito, Progettista, Ingegnere.

## Come si usa

### Come app (consigliato)

Apri **https://themrstraffy.github.io/elettrotecnica-interactive-learning/** e installala:

- **Android** (Chrome): tocca *Installa* nella barra in alto, oppure menu ⋮ → *Installa app*;
- **PC** (Chrome o Edge): l'icona di installazione nella barra degli indirizzi, oppure menu ⋮ → *Installa Da Ohm a Karnaugh*.

Si apre come le altre app, a schermo intero, e funziona **senza internet**. Quando esce una versione nuova la scarica da sola e chiede se aggiornare. Nella sezione **App** (in alto a destra) ci sono le istruzioni e il **backup dei progressi**: XP e livelli sono salvati sul dispositivo, e con il file di backup si ripristinano o si portano dal telefono al PC.

### Come file

Apri `index.html` con un browser qualsiasi (doppio clic): funziona anche offline, ma non si installa e non si aggiorna da sola. Se vuoi un unico file da mandare ai compagni:

```sh
npm run build        # aggiorna sw.js e crea dist/da-ohm-a-karnaugh.html, tutto incluso
```

### Pubblicazione

Il sito è servito da GitHub Pages direttamente dal ramo `main` (Settings → Pages → *Deploy from a branch* → `main`, cartella `/`). Il file `.nojekyll` evita l'elaborazione di Jekyll.

Dopo ogni modifica ai file dell'app esegui `npm run build`: aggiorna in `sw.js` l'elenco dei file da salvare offline e la versione (un'impronta del loro contenuto). Se ci si dimentica, `npm test` lo segnala. È la versione nuova a far comparire l'avviso di aggiornamento sui dispositivi.

## Il percorso

La pagina iniziale è una mappa per anno. Le unità pronte si aprono; le altre sono segnate "in arrivo" con la fase in cui verranno aggiunte.

| Anno | Unità pronte | In arrivo |
| --- | --- | --- |
| 1ª | **Grandezze, unità e notazione scientifica**, **Formule inverse, equazioni e sistemi**, **Lavoro, energia e potenza** | — |
| 2ª | **Carica, campo e potenziale**, **Il circuito elementare**, **Resistori e resistività**, **Misure elettriche e sicurezza**, più i laboratori del circuito elementare e dei resistori | — |
| 3ª | **Reti in corrente continua** (16 lezioni, con il generatore di esercizi), **Condensatori e transitori RC**, **Magnetismo e induttori**, Sistemi di numerazione, Porte logiche e circuiti, Algebra di Boole e Karnaugh, **Circuiti combinatori integrati** | — |
| 4ª | **Corrente alternata e fasori**, **Impedenza, RLC e risonanza**, **Potenze e rifasamento**, **Filtri passivi e Bode**, **Diodi e raddrizzatori**, **Transistor BJT e MOSFET**, **Amplificatori operazionali**, **Logica sequenziale** | — |
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
| 🎲 · Generatore | Scegli i circuiti (Ohm, serie, parallelo, misto, due generatori, Thevenin) e la difficoltà | Esercizi infiniti in cui cambiano valori **e incognite**, con lo svolgimento passo per passo |
| Σ · Metodo | Guida alla scelta del metodo | Formulario e checklist |

### Primo e secondo anno

Sette unità da 4 lezioni, con lo stesso schema delle reti: un elemento interattivo per lezione, un esempio con "Altri numeri" ed esercizi autocorretti su tre livelli. In 1ª gli attrezzi (misure, calcolo, energia), in 2ª l'elettricità vera e propria, fino alle misure in laboratorio e alla sicurezza.

| Anno | Unità | Lezioni e interattivi |
| --- | --- | --- |
| 1ª | Grandezze, unità e notazione scientifica | Unità SI (calcolatrice delle unità: V × A = W), prefissi (scala da giga a pico), notazione scientifica (valori reali su scala logaritmica e convertitore), cifre significative ed errori (arrotondamento e tolleranza di un resistore) |
| 1ª | Formule inverse, equazioni e sistemi | Formule inverse (la formula rigirata un passo alla volta), proporzionalità (diretta, inversa, quadratica con il grafico e il tasto "raddoppia"), equazioni di primo grado (soluzione passo per passo), sistemi 2×2 (due rette con Cramer in diretta e il sistema di un circuito) |
| 1ª | Lavoro, energia e potenza | Lavoro e angolo (forza inclinata con la componente utile), montagne russe (energia potenziale, cinetica e calore, con o senza attrito), bilancio delle potenze di un motore (diagramma a nastro con il rendimento), bolletta di casa (apparecchi da accendere, kWh e costo) |
| 2ª | Carica, campo e potenziale | Carica (quanti elettroni passano), legge di Coulomb (due cariche con le forze e la curva 1/r²), campo elettrico (mappa da toccare per leggere intensità e direzione), potenziale (la collina tra due armature, con carica positiva o elettrone) |
| 2ª | Il circuito elementare | Cariche che scorrono nel filo (verso convenzionale ed elettroni, durata di una batteria), generatore reale con amperometro, voltmetro e interruttore e il punto di lavoro sul grafico, misure da annotare su resistore, lampadina e LED (ohmico o no), resistore che si scalda fino a bruciarsi secondo la sua potenza |
| 2ª | Resistori e resistività | Codice colori a 4 e 5 fasce (dai colori al valore e viceversa), serie E12 ed E24 con le tolleranze che si toccano, filo di materiale, lunghezza e sezione a scelta, resistenza in funzione della temperatura per rame, tungsteno, costantana e NTC |
| 2ª | Misure elettriche e sicurezza | Dove mettere amperometro e voltmetro (anche sbagliando: fusibile bruciato, lampada spenta), multimetro digitale con le portate e l'errore, effetto di carico di tester, oscilloscopio e strumento analogico, guasto in casa con messa a terra, differenziale e tipo di pavimento |

Le unità della 2ª rimandano ai due laboratori storici (circuito elementare e resistori), che restano nel percorso.

### Il generatore di esercizi

Nelle lezioni da Ohm a Thevenin c'è un tipo di esercizio in più, "🎲 Incognite a sorpresa", e nell'unità c'è una lezione "Generatore" dove si scelgono i circuiti e la difficoltà:

- **Dati classici**: conosci il generatore e le resistenze, cambiano le domande;
- **Problema rovesciato**: una resistenza (o la f.e.m.) diventa incognita e al suo posto conosci un'altra grandezza (una corrente, una tensione, una potenza);
- **Tutto a sorpresa**: i dati sono scelti a caso fra tutte le grandezze del circuito.

Il motore (`js/gen.js`) conosce le relazioni di ogni circuito (Ohm, serie, parallelo, Kirchhoff, potenze, Millman, Thevenin) e risolve "a catena": usa ogni volta una relazione con una sola incognita e tiene solo i passaggi che servono. Scarta gli esercizi in cui un arrotondamento a 4 cifre sposterebbe la risposta di più dello 0,5%.

### Terzo anno: condensatori, magnetismo, combinatori integrati

Tre unità da 4 lezioni, ognuna con almeno un elemento interattivo. Ogni lezione propone lo stesso problema in più modi (dati diretti, problema rovesciato, lettura da un grafico o da una tabella) e domande concettuali.

| Unità | Lezioni e interattivi |
| --- | --- |
| Condensatori e transitori RC | Capacità (condensatore piano con area, distanza, dielettrico e tensione), serie e parallelo (rete di condensatori con cariche e tensioni), carica (deviatore, curva di v<sub>C</sub> e i con il pulsante "Avvia"), scarica (tangente iniziale che incontra l'asse a τ) |
| Magnetismo e induttori | Campo di un filo e di un solenoide (bussola e nucleo di ferro), forza su un filo e tra due fili, induzione (spira che ruota tra due poli: flusso e f.e.m.), induttori e transitorio RL |
| Circuiti combinatori integrati | Decoder 3 → 8 (enable, uscite attive basse) ed encoder a priorità, multiplexer 4:1 (con la selezione che scorre: parallelo → seriale), sommatore-sottrattore a 4 bit con riporti e overflow, comparatore a 4 bit e decoder BCD → 7 segmenti con la mappa di Karnaugh di ogni segmento |

Negli esercizi dei combinatori si risponde anche con sequenze di bit (`0110`), insiemi di segmenti (`a, b, g`) ed espressioni booleane, che vengono controllate: devono essere equivalenti e, dove richiesto, in forma minima.

### Quarto anno: elettrotecnica in alternata

Quattro unità da 4 lezioni, ciascuna con un elemento interattivo.

| Unità | Lezioni e interattivi |
| --- | --- |
| Corrente alternata e fasori | Sinusoide (ampiezza, frequenza, fase su 20 ms), oscilloscopio da leggere, piano complesso con le quattro operazioni, fasori che ruotano e disegnano le sinusoidi, R, L e C con tensione e corrente nel tempo |
| Impedenza, RLC e risonanza | Triangolo delle impedenze e fasori delle tensioni (RL e RC), RLC serie con le sovratensioni, curva di risonanza con banda e fattore di merito, correnti in un parallelo R, L, C e antirisonanza |
| Potenze e rifasamento | Potenza istantanea con le parti negative, triangolo delle potenze, Boucherot "in casa" (accendi gli apparecchi), rifasamento con capacità e risparmio di corrente |
| Filtri passivi e Bode | Decibel su scala logaritmica, passa-basso RC (Bode di modulo e fase e segnali nel tempo), i quattro filtri RC e RL, passa-banda con diagramma esatto e asintotico |

### Quarto anno: elettronica

Altre quattro unità da 4 lezioni, con i circuiti disegnati e animati (diodi che conducono, transistor in saturazione o in zona attiva, LED che si accendono).

| Unità | Lezioni e interattivi |
| --- | --- |
| Diodi e raddrizzatori | Caratteristica del diodo e retta di carico con tre modelli (vero, a soglia, ideale) e polarizzazione inversa; raddrizzatore a una semionda e a ponte di Graetz con i diodi che conducono nelle due semionde; condensatore di livellamento con il ripple simulato e quello della formula; stabilizzatore con Zener (quando smette di stabilizzare) |
| Transistor BJT e MOSFET | Caratteristiche d'uscita con la retta di carico e le tre zone; BJT e MOSFET che accendono un LED da un'uscita a 5 V; polarizzazione a partitore (quanto poco cambia IC se cambia β); amplificatore a emettitore comune che taglia l'uscita se l'ingresso è troppo grande |
| Amplificatori operazionali | Comparatore su una sinusoide (il principio del PWM); invertente, non invertente e inseguitore con la saturazione; DAC a 4 bit con il sommatore a resistori pesati e la sua scala; slew rate di 741, TL081, LM358 e NE5532 |
| Logica sequenziale | Latch SR con porte NOR o NAND e la storia degli ingressi; flip-flop D, JK e T con il colpo di clock (anche automatico) e il diagramma temporale; contatore asincrono a 4 bit con modulo regolabile, NAND di reset e diagramma di Q₀…Q₃; registro a scorrimento con ingresso seriale (invio di una parola come in una UART), contatore ad anello e Johnson |

Negli esercizi della logica sequenziale si leggono e si completano i diagrammi temporali: impulsi tra un fronte e l'altro da ignorare, clear asincrono, contatori da riconoscere dalle forme d'onda.

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
js/units/b-*.js       unità di 1ª e 2ª (grandezze, algebra, energia, elettrostatica, circuito, resistori, misure)
js/units/t-*.js       unità del terzo anno (condensatori, magnetismo, combinatori integrati)
js/units/q-*.js       unità del quarto anno (alternata, RLC, potenze, filtri, diodi, transistor, operazionali, sequenziale) e strumenti comuni (fasori, scala logaritmica, oscilloscopio)
js/units/cc-gen.js    generatore di esercizi sulle reti in continua
js/gen.js             motore del generatore: relazioni dei circuiti e soluzione a catena
js/ac.js              numeri complessi, impedenze, risonanza, potenze, rifasamento, filtri, Bode
js/semi.js            diodi, raddrizzatori, ripple, Zener, BJT, MOSFET, operazionali
js/seq.js             latch, flip-flop, contatori, registri a scorrimento
js/phys.js            analisi dimensionale, notazione scientifica, sistemi 2×2, Coulomb e campo, condensatori, magnetismo
js/basi.js            lavoro ed energia, generatore reale, codice colori e serie E, resistività, strumenti, sicurezza
js/logic.js           motore booleano: forme canoniche, Quine–McCluskey, lettore di espressioni, sommatori, decoder, display
js/circuit.js …       laboratori (circuito, resistori, reti, binario, porte, Karnaugh, sfide)
tests/                test dei motori di calcolo
manifest.webmanifest  descrizione dell'app installabile (nome, colori, icone, scorciatoie)
sw.js                 service worker: uso offline e aggiornamenti (l'elenco dei file è generato)
js/pwa.js             installazione, avviso di aggiornamento, pannello App, backup dei progressi
icons/                icone dell'app (sorgente SVG e PNG)
tools/                file unico (build-single), elenco offline (build-sw), icone (icons)
```

Per aggiungere un'unità: un file in `js/units/` che registra le sue lezioni in `App.unitsData`, e una voce nell'elenco `YEARS` di `js/path.js`.

## Test

```sh
npm test
```

- Logica: la forma minima calcolata coincide con una ricerca esaustiva su tutte le 256 funzioni a 3 variabili e su 150 funzioni casuali a 4 variabili con indifferenze.
- 1ª e 2ª: analisi dimensionale delle unità SI, notazione scientifica e ingegneristica su 2000 valori casuali, cifre significative, sistemi 2×2 contro soluzioni note, Coulomb e campo di un dipolo; conservazione dell'energia, bilancio delle potenze del generatore reale, codice colori avanti e indietro su tutta la serie E24 da 1 Ω a 10 MΩ (4 e 5 fasce), serie normalizzate e sigle, seconda legge di Ohm e temperatura, effetto di carico e precisione del multimetro, differenziale e guasto a terra.
- Schemi: nessun nome di schema ripetuto (un nome doppio sostituirebbe in silenzio quello di prima).
- App: `sw.js` è aggiornato con i file e la versione attuali; il manifest ha le icone richieste da Chrome (192, 512, maskable) e le PNG hanno davvero quelle dimensioni.
- Generatore: ogni formula di ogni circuito è coerente con lo stato calcolato; per ogni circuito e livello si generano 60 esercizi e si verifica che i dati siano puliti, che i passaggi rifatti dai soli dati portino alle risposte e che le risposte reggano gli arrotondamenti.
- Alternata: identità dei numeri complessi su 500 coppie casuali, sinusoidi, risonanza (X_L = X_C e accordo) su 200 circuiti, potenze e Boucherot, rifasamento (il cos φ ottenuto è quello voluto), decibel, filtri e asintoti di Bode.
- Elettronica: diodo (Shockley e modello a soglia), raddrizzatori e ripple, Zener dentro e fuori regolazione, BJT nelle tre zone, partitore di base esatto e approssimato, MOSFET, operazionali (invertente, non invertente, sommatore, differenziale, DAC, slew rate); latch SR confrontato con le due NOR retroazionate su tutte le combinazioni, tabelle dei flip-flop (il JK che fa da D e da T), contatori modulo 2…16 con la NAND di reset, registri, anello e Johnson fino a 8 flip-flop.
- Terzo anno: condensatore piano, serie e parallelo, carica e scarica con le formule inverse del tempo su 200 casi casuali; campo di filo e solenoide, induttanza, forze, flusso; sommatore a 4 bit su tutte le 512 combinazioni (somma, riporto, overflow = C4 ⊕ C3, sottrazione), decoder, multiplexer, encoder a priorità, segmenti del display.
- Reti: il risolutore riproduce i risultati del documento; correnti di ramo, maglie, Millman, sovrapposizione e Thevenin danno lo stesso risultato del risolutore su 2000 circuiti casuali; stella-triangolo, Millman a tre rami e reti miste sono verificati allo stesso modo.

## Licenza

Distribuito con licenza [Apache License 2.0](LICENSE).
