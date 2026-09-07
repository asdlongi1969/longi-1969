# Design

Sistema visivo del sito Longi 1969. Fonte di verità per colori, tipografia,
componenti. I valori colore derivano dallo stemma del club (scudo dimezzato
rosso/blu, leone d'oro rampante): vedi `assets/stemma-tuttocampo-500.png` e
`public/img/stemma.png`.

## Color Palette

Strategia: **due metà, un cuore**. Fondo base blu notte da stadio, ma a
differenza del sito gemello Città di Galati (che resta sempre sul fondo
scuro) qui **intere sezioni si tingono di rosso pieno** (`--rosso-fondo`,
"drenched") nei momenti che contano, è lo stesso taglio dello scudo che
divide il campo in due metà, applicato alla pagina. Il divisore
`Spaccatura` (taglio diagonale scroll-driven, si chiude come lo scudo) è la
grammatica visiva dei bordi tra sezioni.

I valori sono in `src/styles/tokens.css`, in OKLCH, mai bianco/nero puri:

```css
--bg: oklch(0.2 0.04 262);           /* blu notte, meta' destra dello scudo */
--surface: oklch(0.25 0.05 262);
--text: oklch(0.96 0.008 75);        /* bianco caldo, mai puro */
--rosso: oklch(0.55 0.21 27);        /* meta' sinistra dello scudo */
--rosso-fondo: oklch(0.34 0.13 27);  /* rosso profondo per sezioni drenched */
--blu: oklch(0.32 0.12 265);
--oro: oklch(0.82 0.15 92);          /* leone */
```

### Ruoli

- `--bg`: fondo dominante del sito.
- `--surface`: superfici sopraelevate (fasce alternate, riquadri, card
  giocatore).
- `--text`: testo principale, bianco caldo.
- `--rosso`: accento vivo, spia in diretta, pulsante diretta, metà dello
  scudo nella `Spaccatura`. Non è un colore di sfondo grande.
- `--rosso-fondo`: rosso profondo usato SOLO come sfondo di sezioni intere
  ("drenched"), oggi la sezione finale-double della pagina Storia. Contrasto
  verificato col testo (vedi Accessibilità).
- `--blu`: l'altra metà dello scudo, superficie e accenti scuri.
- `--oro`: accento primario del sito, usato per CTA, link, numeri, bordi, titoli di
  stato ("in corso", "non ancora disponibile"). Fa il lavoro che sul sito
  gemello fa il giallo: qui viene dal leone, non dalla scritta LONGI 1969.

Regole: `--oro` su `--bg`/`--surface` è la combinazione firma per testo
interattivo e numeri. `--rosso` resta un accento piccolo (spie, bordi,
pulsanti diretta), mai un blocco di testo lungo. Sulla fascia sponsor
(fondo chiaro `oklch(0.95 0.008 75)`, unica eccezione al fondo scuro nel
sito) il titolo torna al colore `--bg`.

## Typography

Voce del brand in tre parole fisiche: **massiccio, d'annata, ruggente**
(manifesto anni '70, non brochure sportiva).

- **Display / titoli**: **Alfa Slab One** (self-hosted via Fontsource,
  `@fontsource/alfa-slab-one`), slab pesante da manifesto, eco diretta del
  "1969" sullo stemma. Scelto apposta per non sovrapporsi al font di Città
  di Galati (Anton SC, condensato da stadio): Alfa Slab One è più tozzo e
  d'annata, coerente con un'identità che racconta sessant'anni di storia
  invece dello spettacolo del campo. Niente maiuscolo forzato a livello
  globale: il font è già massiccio da solo, il maiuscolo si decide caso per
  caso (kicker, etichette di stato).
- **Testo**: **Archivo** (self-hosted, `@fontsource/archivo`, pesi 400/700),
  corpo `max-width: 70ch`, `line-height: 1.6`.
- Numeri (risultati, classifica, conto alla rovescia, tabellone stagione):
  `font-variant-numeric: tabular-nums`, per non far "ballare" la larghezza
  quando cambiano cifra.

## Momenti overdrive

Fino al 06/09/2026 la regola era "tre, non di più". Su richiesta del
cliente la home è diventata un percorso continuo: la regola nuova è **un
solo effetto per schermata**, tutto legato allo scroll, niente animazioni
che girano da sole (eccetto spie e frecce di servizio). I tre momenti
originali restano quelli principali; i momenti della home (sotto) li
accompagnano senza sovrapporsi.

1. **Hero "il leone si sveglia"** (in arrivo, Task 6, gated su
   riautorizzazione Higgsfield e conferma crediti). Leone d'oro come statua
   di bronzo nel buio, la luce lo accende, la camera arretra e le due metà
   rossoblù dello scudo si chiudono attorno a lui. Pipeline: 2 frame (nano
   banana) → video Seedance 2.0 5s 1080p → reframe 9:16 mobile → frame WebP
   estratti con ffmpeg → scrub su canvas legato allo scroll. **Oggi la home
   usa `HeroProvvisorio.astro`**: sezione statica con lo stemma su fondo
   `--bg`, nessuna animazione: non un placeholder rotto, una versione
   onesta e funzionante finché l'hero definitivo non è pronto (dettagli in
   `docs/HANDOFF.md` §2.4).
2. **Spaccatura rossoblù** (`src/components/Spaccatura.astro`, già
   implementata): le due metà dello scudo si chiudono da entrambi i lati
   dello schermo, legate allo scroll con `animation-timeline: view()`.
   Segna i passaggi tra blocchi in home e nella pagina Storia (dove separa
   la timeline dalla sezione finale del double).
3. **Timeline 1969-oggi con coro** (pagina Storia, già implementata): anni
   giganti in Alfa Slab (`clamp(4rem, 18vw, 12rem)`, alternati rosso/blu, il
   2026 sempre in oro) che entrano cifra per cifra quando la tappa arriva in
   vista: stesso meccanismo "coro" del sito gemello (lì sulle parole,
   `parola-coro`), qui applicato alle singole cifre dell'anno via
   `data-coro`/`--i`/delay 90ms. Il finale del double riusa lo stesso
   pattern sulle tre righe di punteggio (0-2 → 2-2 → 6-5 dcr), delay 300ms,
   l'ultima riga in oro, dentro una sezione `--rosso-fondo` drenched.

Niente cursore-pallone (firma di Città di Galati, non si replica). View
Transitions cross-documento riusate (tecnica invisibile condivisa, non
identitaria): la testata resta ferma, la copertina di una news si trasforma
nell'immagine dell'articolo.

### Momenti della home (06/09/2026)

Tutti scroll-driven in CSS, tutti con ripiego statico, zero contenuti
inventati: i dati vengono da `storia.json`, `girone.json`, `stagione.json`.

- **Debutto** (`src/components/Debutto.astro`): conto alla rovescia alla
  prima giornata, sezione drenched `--rosso-fondo` con bordi obliqui, cifre
  d'oro tabulari con glow. Si spegne da sola il giorno del debutto (in
  build non viene generata, nel browser si nasconde).
- **Rinascita** (`src/components/Rinascita.astro`): palco sticky alto
  (n+1) schermate, le tappe con anno a quattro cifre passano una alla volta
  (`view-timeline-name: --rinascita`, `animation-range: contain` a fette),
  il taglio rossoblù dello scudo attraversa il palco da sinistra a destra.
  Senza `animation-timeline` o con reduced-motion: quadri impilati.
- **Tabellone a palette** (`src/components/TabelloneGirone.astro`): le
  squadre del girone come tabellone da stazione anni '70, ogni lettera
  scorre l'alfabeto (`src/lib/palette.ts`) e si ferma su quella giusta,
  riga dopo riga; la riga del Longi in oro. Voce "d'annata" del brand; il
  gemello ha il nastro cinetico, che qui resta assente.
- **News sfalsate**: le tre card entrano col taglio obliquo in tre finestre
  diverse della stessa corsa (`entry 0/15/30%`); si anima solo opacity e
  clip-path, il transform resta all'hover.
- **Freccia "scorri"** nell'hero: il primo frame è quasi nero, la freccia
  dice che si deve scorrere e sparisce dopo i primi frame.
- **Muro rossoblù in home**: stesso componente di `/squadra`, ordinamento
  condiviso in `src/lib/rosa.ts`.


### Firma di differenziazione dal gemello Galati (27/08/2026)

Grammatica propria: "tutto taglia in diagonale, la tana respira braci d'oro".

- **Atmosfera tana** (`src/styles/tana.css`): braci dorate che salgono + vignetta calda che respira. Galati ha riflettori freddi e nebbia: qui il clima e' l'opposto termico.
- **Titoli di sezione**: reveal a taglio diagonale scroll-driven (Galati taglia orizzontale).
- **Tabelloni partita**: wipe diagonale con clip-path (il tunnel prospettico resta a Galati).
- **Fascia sponsor**: banda inclinata di -2 gradi che taglia la pagina scura.
- **Card giocatori**: lama di luce dorata obliqua su hover/focus (il colpo del leone).
- **Muro rossoblu'** (`src/components/MuroRosa.astro`): la rosa come fisarmonica di lastre diagonali (hover: la lastra si allarga, foto a colori, numero d'oro; mobile: pila di bande). Ha SOSTITUITO la parete curva 3D, che resta al gemello.
- **News "banda dimezzata"**: titolo su banda rosso/blu tagliata in diagonale, data su cartellino d'oro inclinato, griglia a mosaico sfalsato su 3 colonne (il gemello: titolo in sovraimpressione sulla foto, prima notizia doppia).
- **Home riordinata**: hero -> partite -> news (il gemello mette le news prima).
- **Scheda giocatore**: si rivela con taglio diagonale, bordo alto dimezzato rosso/blu.
- **Articoli**: barra di lettura IN BASSO con le due meta' rossoblu' che si chiudono verso il centro; titolo ridotto che sale dal fondo con taglio obliquo.
- **Transizioni pagina**: sipario diagonale (il gemello scorre in verticale).
- **Barra cookie**: taglio diagonale in alto, filo rossoblu', bottone a parallelogramma.
- **Header**: tacca a parallelogramma oro sotto la voce attiva, "1969" in oro nel brand.

## Componenti chiave

- **HeroProvvisorio**: sezione 100vh, stemma centrato su fondo `--bg`,
  titolo "LONGI 1969" e sottotitolo. Sostituito dall'hero Seedance quando
  pronto (stesso punto di innesto in `index.astro`).
- **Spaccatura**: divisore a taglio diagonale scroll-driven, prop `inverti`
  per alternare quale metà è rossa e quale blu.
- **Debutto**: conto alla rovescia alla prima giornata (dati in
  `src/data/stagione.json`, logica in `src/lib/debutto.ts`).
- **Rinascita**: palco sticky delle tappe di `storia.json` (solo anni a
  quattro cifre).
- **TabelloneGirone**: tabellone a palette delle squadre del girone (dati in
  `src/data/girone.json`, logica in `src/lib/palette.ts`).
- **PlayerWall**: parete curva 3D per la rosa, fila orizzontale, le schede
  ai bordi si inclinano verso l'interno via `rotateY`/`translateZ`/
  `brightness` calcolati sullo scroll, quella al centro resta dritta e a
  fuoco. Frecce visibili solo `pointer: fine`; con `reduced-motion` resta
  una fila piana scorribile col dito.
- **PlayerCard / PlayerDialog**: scheda giocatore nel muro, dialog di
  dettaglio all'apertura.
- **NewsCard**: foto full-bleed, titolo sovrapposto, transizione verso
  l'articolo tramite View Transitions.
- **NextMatch**: coppia di tabelloni (ultima partita / prossima partita) con
  ingresso "dal tunnel" (`translateX` + `rotateY` legati allo scroll,
  prospettiva sul contenitore); consuma i widget Tuttocampo `partita` e
  `prossimaPartita`.
- **Scoreboard**: tabellone stagione in stile display da bordo campo,
  pannello scuro rigato, cifre tabulari in oro con glow, spia rossa
  lampeggiante quando "in corso". A zero e dichiarato spento finché il
  campionato non è iniziato: mai numeri inventati su partite mai giocate.
- **DirettaLive**: riquadro attivabile dal CMS (`src/data/diretta.json`),
  countdown al fischio d'inizio calcolato nel browser (statico non basta:
  il sito è compilato in anticipo), passa da solo alla diretta Facebook
  embeddata (dietro consenso) all'ora indicata.
- **SponsorStrip**: nastro scorrevole continuo (lista duplicata per il giro
  senza vuoti), livelli main/tecnico/partner in altezza decrescente, scala
  di grigi con colore su hover/focus, si ferma su hover e con
  `reduced-motion`. Unica sezione a fondo chiaro del sito.
- **TuttocampoWidget**: iframe dietro `EmbedConsenso`, con fallback on-brand
  quando il widget non ha ancora dati (stagione non iniziata) o non
  risponde entro 10s; per tipo (classifica/risultati/marcatori/partita/
  prossimaPartita).
- **EmbedConsenso / CookieNotice**: gate GDPR per ogni contenuto di terze
  parti (Tuttocampo, eventuale mappa, video Facebook): zero richieste verso
  host esterni finché non c'è consenso esplicito.

## Layout

- Griglia 12 colonne desktop, 4 mobile; contenuto max 1200px tranne hero e
  foto full-bleed.
- Ritmo: sezioni alternano fondo `--bg` e `--surface` (pagina Storia:
  `.tappa:nth-of-type(even)`), con `--rosso-fondo` riservato ai momenti
  drenched.
- Niente card grid identiche: news in griglia asimmetrica (prima notizia
  doppia, come sul sito gemello), rosa in parete curva invece che in griglia.

## Motion

- Easing condiviso: `--ease-out-quart` = `cubic-bezier(0.25, 1, 0.5, 1)` per
  ogni entrata.
- **Vincolo tecnico non negoziabile**: le animazioni scroll-driven usano
  SOLO proprietà `animation-*` estese (`animation-name`,
  `animation-duration`, `animation-fill-mode`, `animation-timing-function`,
  `animation-timeline`, `animation-range`), mai la scorciatoia `animation:`.
  Il minificatore di produzione fonde la scorciatoia con
  `animation-timeline` in un unico valore che il browser scarta per intero:
  bug reale, documentato per la prima volta sul sito Città di Galati
  (`GALATI/src/styles/atmosphere.css`) e rispettato qui fin dal primo
  commit (vedi `docs/superpowers/plans/2026-08-26-sito-longi-1969.md`,
  Global Constraints).
- Ogni animazione scroll-driven ha un ripiego `@supports` +
  `IntersectionObserver` (classi `reveal-js`/`reveal-on`, script generico in
  `Base.astro` per `[data-reveal]`; script dedicato in `storia.astro` per
  `[data-coro]`) per i browser senza `animation-timeline: view()`.
- Tutto dietro `prefers-reduced-motion: reduce`: spia e pallino smettono di
  pulsare, coro e reveal mostrano il contenuto finale subito, marquee
  sponsor si ferma e va a capo, View Transitions diventano uno scambio
  istantaneo.

## Accessibility

Contrasti calcolati sui valori OKLCH reali dei token (conversione
OKLCH → sRGB → luminanza relativa → rapporto WCAG), non stimati:

| Coppia | Rapporto | Soglia |
|---|---|---|
| `--text` su `--bg` | **16.1:1** | AAA (≥ 7:1) |
| `--text` su `--surface` | **14.3:1** | AAA (≥ 7:1) |
| `--text` su `--rosso-fondo` | **11.1:1** | AAA (≥ 7:1) |

Tutte e tre le coppie usate per testo esteso superano AAA con ampio margine,
compresa la sezione drenched del double (`--rosso-fondo`), il caso più
sfavorevole perché è il fondo più chiaro tra i tre.

## Assets

- `assets/stemma-tuttocampo-150.png` / `-500.png`: stemma raster scaricato
  dalla scheda squadra Tuttocampo, bassa qualità: da sostituire con
  vettoriale del club (vedi `public/img/LEGGIMI.md` e
  `docs/RICHIESTE-SOCIETA.md`).
- `assets/hero-video-16x9.mp4` / `hero-video-9x16.mp4`: video hero
  definitivi, **non ancora generati** (Task 6).
- Frame per lo scrub dell'hero, da estrarre con ffmpeg quando il video
  arriva: stessa pipeline collaudata su Città di Galati (WebP, budget di
  peso decrescente, manifest con conteggio e peso di ciascun set).
