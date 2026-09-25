# Documento di consegna: Sito Longi 1969

Questo documento serve a due lettori diversi. La prima parte è per il
**club** (chi aggiorna il sito da `/admin` e chi deve fornire i materiali
mancanti). La seconda è per lo **sviluppatore** che fa il deploy e la
manutenzione tecnica.

Stato del progetto a questa consegna: 8 pagine (`/`, `/squadra`, `/stagione`,
`/social`, `/storia`, `/club`, `/contatti`, `/privacy`), pannello di gestione
contenuti su `/admin`, `npm run build` e `npm test` verdi. Il sito **non è
ancora online**: il repository non è nemmeno ancora su GitHub (vedi parte
sviluppatore), l'hero definitivo non è ancora stato generato e mancano
diversi contenuti reali (vedi sotto).

---

## Parte 1: Per il club

### 1.1 Materiali che mancano ancora

L'elenco completo, voce per voce, è in
**[RICHIESTE-SOCIETA.md](RICHIESTE-SOCIETA.md)**: dati legali, stemma
vettoriale, storia 1969-2022, rosa e liberatorie, sponsor, campo di casa,
social. Il sito è pensato per restare onesto e pulito anche senza questi
contenuti: nessuna sezione è rotta o "in costruzione", i dati mancanti
mostrano un segnaposto dichiarato (es. "campo comunale di Longi, nome da
confermare") invece di un'informazione inventata.

### 1.2 Come si usa `/admin`

Il sito ha un pannello di gestione contenuti (Sveltia CMS) all'indirizzo
`https://<dominio-del-sito>/admin`. Serve per aggiungere i post social, aggiornare
rosa, staff, sponsor, i dati della società, la storia e il riquadro diretta,
**senza toccare codice**.

> **Per chi userà il pannello c'è una guida dedicata e più semplice:
> [GUIDA-PANNELLO.md](GUIDA-PANNELLO.md)** (anche in PDF:
> `Guida-pannello-Longi-1969.pdf`). È scritta per il volontario, non per lo
> sviluppatore: stampala o mandagliela.

**Primo accesso**: serve un account GitHub gratuito, e lo sviluppatore deve
invitare quel nome utente come collaboratore del repository (punto 2.1).
Poi si entra da `/admin` con *Sign In with GitHub*.

**Cosa si può gestire, e come**:

- **Social**: link di un post pubblico di Instagram, Facebook o TikTok e
  data (si compila da sola). Il post appare da solo in home (gli ultimi 3) e
  in `/social`; senza consenso privacy al suo posto c'è un segnaposto.
- **Rosa**: nome, ruolo (Portiere / Difensore / Centrocampista /
  Attaccante), numero di maglia, foto. I giocatori compaiono in `/squadra`.
- **Staff**: nome, incarico, foto, ordine di visualizzazione.
- **Sponsor**: nome, livello (`main` = logo grande, `tecnico` = medio,
  `partner` = piccolo), logo (obbligatorio), sito web (opzionale: se
  presente il logo diventa cliccabile).
- **Dati della società**: denominazione, codice fiscale, matricola FIGC,
  indirizzo, contatti, PEC, nome e indirizzo del campo, social, frase grande
  in home. Alimentano footer, Contatti e informativa privacy. I campi vuoti
  spariscono dal sito invece di lasciare righe a metà.
- **Pagina Club**: la storia della società (un paragrafo per riquadro). La
  linea del tempo con le tappe si modifica dalla voce "Pagina Storia" qui sotto.
- **Pagina Storia**: le tappe della timeline dedicata (1969-oggi) e il
  riquadro finale con il punteggio del Trofeo delle Province.
- **Diretta partita**: un interruttore che attiva in home un riquadro con
  countdown al fischio d'inizio e, a partita iniziata, il link alla diretta
  Facebook. **Da spegnere a fine partita**, altrimenti resta in home.

**Voci di esempio da sostituire**: rosa, staff e sponsor hanno oggi voci
segnaposto o dati fittizi (marcati `FITTIZIO` nel codice) usati per
collaudare il sito. Vanno **modificate con i dati veri o cancellate** dal
pannello non appena si inserisce il primo contenuto reale.

**Caricamento immagini**: dal pannello si caricano direttamente (bottone
"Choose an image" nei campi Foto/Logo/Copertina); finiscono in
`public/img/uploads/` e vengono pubblicate al prossimo deploy automatico
(Netlify ricostruisce il sito a ogni salvataggio dal CMS, in genere entro
1-2 minuti).

**Regola sulle dimensioni delle immagini (importante)**: le foto caricate
dal pannello vengono pubblicate **così come sono**, senza ridimensionamento
automatico. Una foto scattata col telefono pesa in genere 3-5 MB: venti foto
così sulla pagina Squadra rendono il sito lentissimo per chi lo apre in 4G,
che è il caso normale dei tifosi. Prima di caricare, ridimensionare ogni
immagine a **massimo 1200 pixel di lato lungo** e **sotto i 300 KB**. Va
bene qualunque strumento gratuito (su telefono l'app Foto in "Modifica →
Ridimensiona", su computer un sito come squoosh.app). Nel dubbio, meglio una
foto più piccola: sullo schermo di un telefono la differenza non si vede,
sul tempo di caricamento sì.

---

## Parte 2: Per lo sviluppatore

### 2.1 Deploy su Netlify e accesso al pannello

**Perché GitHub è obbligatorio e non un dettaglio**: il pannello `/admin`
salva i contenuti facendo commit sul repository. Senza repository il
pannello non funziona e il club non è autonomo.

#### Com'è messo oggi (27/08/2026)

| Pezzo | Valore |
|---|---|
| Repository | **non ancora creato**: il progetto è un repository git locale (`C:\Users\tigno\Desktop\longi-1969`), branch `feat/sito-v1`, nessun remote configurato |
| Sito | non ancora deployato |
| Build | da collegare (punto Task 12: crea account Netlify NUOVO e separato da quello del sito Città di Galati) |
| Accesso al pannello | funzioni già pronte nel codice: `netlify/functions/auth.mjs`, `netlify/functions/callback.mjs` (identiche nell'impianto a quelle del sito Città di Galati) |
| Variabili da impostare sul sito | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (quest'ultima segreta; entrambe con scope *functions*), da una nuova applicazione OAuth GitHub creata per QUESTO repository |

Tutto il punto 2 del piano di deploy (Task 12 in
`docs/superpowers/plans/2026-08-26-sito-longi-1969.md`) resta da fare, con
passi manuali dell'utente confermati uno a uno in chat: creazione
dell'account Netlify separato, del repository GitHub pubblico, della
applicazione OAuth, l'inserimento delle variabili d'ambiente.

#### Perché il repository deve essere pubblico e non deve mai diventare privato

Sul piano gratuito Netlify **rifiuta di compilare un repository privato se
l'autore del commit non è un membro verificato dell'account**
(*"Build blocked: Unrecognized Git contributor"*). Il pannello firma i
commit con l'account GitHub di chi sta scrivendo: con il repository privato,
ogni articolo pubblicato dal club bloccherebbe la pubblicazione del sito.

**Questo è già successo davvero sul sito Città di Galati** (verificato il
28/07/2026, deploy `0f0c2d5`): è la ragione per cui questo secondo sito
adotta la stessa scelta fin dall'inizio, invece di scoprirlo in produzione.

Le alternative sono: piano Netlify a pagamento (~19 $/mese a postazione)
oppure compilare su GitHub Actions e caricare su Netlify il sito già pronto.
Per un club dilettantistico non hanno senso: il repository non contiene
segreti (le chiavi stanno solo fra le variabili d'ambiente di Netlify) e il
sito è pubblico comunque.

Effetto collaterale positivo: il permesso chiesto a chi entra nel pannello è
`public_repo` invece di `repo`, cioè **non** dà accesso agli altri
repository privati di quell'account GitHub.

#### Perché l'account Netlify è separato da quello di Città di Galati

Scelta dell'utente, non solo prudenza teorica: un blocco crediti
sull'account Netlify condiviso fermerebbe deploy e pubblicazioni CMS di
**entrambi** i siti insieme. È già successo (blocco crediti di agosto 2026,
3 giorni di stop su Città di Galati). Con account separati, un problema di
credito o di configurazione su un sito non tocca l'altro. Costo: due stack
da tenere a mente invece di uno, ma per due clienti diversi è la scelta
corretta.

#### Quel che resta da fare (Task 12 del piano)

1. **Push del repository**: creare il repository GitHub pubblico
   `longi-1969` (o nome equivalente), collegarlo come remote, push del
   branch `feat/sito-v1` (o merge su `main` prima del push, a scelta
   dell'utente).
2. **Collegare Netlify**: nuovo account Netlify, sito collegato al
   repository, `NODE_VERSION=22` già impostato in `netlify.toml`.
3. **Applicazione OAuth GitHub nuova**: callback
   `https://<sito>.netlify.app/callback`, variabili `GITHUB_CLIENT_ID` e
   `GITHUB_CLIENT_SECRET` inserite nelle env Netlify (il secret non passa
   mai in chat).
4. **Invitare il redattore**: sul repository GitHub, Settings →
   Collaborators → Add people. Serve il suo nome utente GitHub. Deve
   accettare l'invito che riceve via email.
5. **Consegnare la guida**: `docs/GUIDA-PANNELLO.md` /
   `docs/Guida-pannello-Longi-1969.pdf`, scritta per il volontario.
6. **E2E**: login `/admin`, modifica di prova, commit del CMS arrivato,
   build automatica, sito aggiornato.

#### Provare il pannello senza repository (modalità locale)

Sveltia sa lavorare direttamente sui file del computer, senza GitHub e senza
servizi: utile per provare il pannello prima di pubblicare il repository, o
per sistemare contenuti in locale.

1. Avviare il sito: `npm run dev`
2. Aprire **`http://localhost:4321/admin/index.html`**
   (in sviluppo `/admin/` da solo restituisce 404: il server di Astro non
   genera l'indice delle cartelle per i file statici. Online funziona
   normalmente `/admin/`.)
3. Premere **Work with Local Repository** e selezionare la cartella del
   progetto quando il browser la chiede.

Le modifiche vengono scritte subito sui file del progetto e si vedono nel
sito in tempo reale. Non finiscono online finché non si ricompila e si
pubblica. Serve Chrome o Edge: Firefox e Safari non supportano ancora
l'accesso alle cartelle richiesto da questa modalità. Se qualcosa va storto,
`git checkout .` riporta i contenuti all'ultimo commit.

### 2.2 Dominio e `site` in `astro.config.mjs`

Il dominio di produzione **non è ancora stato scelto** e **deve essere
registrato a nome del club**, non dello sviluppatore.

Finché non c'è un dominio, `astro.config.mjs` non imposta `site`, e i tag
`og:url` / `og:image` in `src/layouts/Base.astro` risolvono automaticamente
contro l'origine corrente (in pratica il dominio `*.netlify.app` assegnato
al deploy).

**Quando il dominio è pronto**, le modifiche necessarie sono:

1. **`astro.config.mjs`**:
   ```js
   export default defineConfig({
     site: "https://il-dominio-scelto.it",
   });
   ```
2. **`public/admin/config.yml`**: sostituire `INSERIRE-UTENTE/INSERIRE-REPO`
   con il repository reale e `INSERIRE-BASE-URL` con il dominio definitivo
   (o l'URL Netlify, se il pannello resta lì).
3. **Callback dell'applicazione OAuth GitHub**: aggiornare l'*Authorization
   callback URL* col nuovo dominio. Se uno di questi tre punti resta
   puntato al vecchio indirizzo, l'accesso al pannello smette di
   funzionare.
4. Collegare il dominio in Netlify: Site settings → Domain management →
   Add custom domain.
5. Rimuovere il blocco `X-Robots-Tag: noindex, nofollow` in `public/_headers`
   (oggi presente perché i contenuti sono ancora in parte segnaposto) e
   sistemare `public/robots.txt`.

**Una cosa va fatta insieme al dominio**, perché dipende da `site` e prima
genererebbe indirizzi su `localhost`: la sitemap (`@astrojs/sitemap`). Feed
RSS e anteprima per singolo articolo non servono più: le news sono state
sostituite dalla pagina Social (25/09/2026).

### 2.3 Widget Tuttocampo: generare il GUID del girone

Il girone è noto: **Seconda Categoria, Girone C Sicilia**, stagione
2026/27. `src/lib/tuttocampo.ts` ha già `TEAM_ID = "1043634"` e `TEAM_PAGE`
corretti (scheda squadra:
`https://www.tuttocampo.it/Sicilia/SecondaCategoria/GironeC/Squadra/Longi/1043634/Scheda`),
ma la costante `GIRONE` è ancora il segnaposto `"INSERIRE-GUID"`. Finché
resta così, `TuttocampoWidget.astro` salta il fetch in fase di build e
mostra il fallback on-brand ("non ancora disponibile perché la stagione non
è iniziata") con link alla scheda squadra: **il codice del fallback e dei
widget è già pronto, non va toccato nulla oltre al file sotto**.

**Generare il GUID richiede l'accesso all'account Tuttocampo del club** (o
un account gratuito equivalente): lo sviluppatore non può farlo da solo
senza sapere con quale account entrare (vedi `RICHIESTE-SOCIETA.md` §6).
Passo-passo, tipicamente all'inizio del campionato:

1. Accedere a `https://www.tuttocampo.it/WidgetApi` con l'account
   Tuttocampo del club (o quello deciso col club).
2. Navigare **Sicilia → Seconda Categoria → Girone C** e generare il
   widget: Tuttocampo rilascia un codice che identifica il **girone**, non
   la singola stagione (a differenza di quanto si potrebbe pensare, è già
   documentato nel commento sopra `GIRONE` in `tuttocampo.ts`). Senza
   parametri il widget mostra sempre la stagione in corso, quindi si
   aggiornerà da solo a settembre 2027.
3. Aprire `src/lib/tuttocampo.ts` e sostituire:
   ```ts
   const GIRONE = "INSERIRE-GUID";
   ```
   con il codice ricevuto. I cinque `WIDGET_URLS` (classifica, risultati,
   marcatori, partita, prossimaPartita) si costruiscono da soli a partire da
   `GIRONE`: non serve toccare altro in quel file.
4. **Verificare con `curl` che i cinque URL rispondano** prima di fare
   commit.
5. **Rimisurare le altezze**: `MIN_HEIGHT` in
   `src/components/TuttocampoWidget.astro` contiene oggi valori **ereditati
   dal sito Città di Galati** (girone diverso, numero di squadre diverso),
   marcati nel codice con il commento `/* altezze da rimisurare col GUID
   reale */`. Vanno rimisurate sul contenuto vero del girone C prima di
   considerarle definitive: un girone con più squadre in classifica ha
   bisogno di un riquadro più alto, altrimenti scrolla dentro se stesso.
6. Salvare, fare commit, lasciare che Netlify rifaccia il build (o eseguire
   `npm run build` in locale per verificare prima).
7. **Verifica visiva**: aprire `/stagione`. Ogni sezione con URL configurato
   deve mostrare l'iframe di Tuttocampo dentro un riquadro con intestazione
   propria del sito (non più il testo "non ancora disponibile"); se un
   iframe non carica entro 10 secondi, il codice esistente nasconde
   l'iframe e torna al fallback con link alla scheda squadra; se poi il
   widget carica comunque, il riquadro riappare da solo (comportamento già
   implementato, nessuna azione necessaria).
8. La stessa configurazione alimenta anche `NextMatch.astro` in home (usa il
   widget `prossimaPartita`): si attiva da sola appena `GIRONE` è
   valorizzato.

### 2.4 Hero "il leone si sveglia" (Task 6, in arrivo)

La home usa oggi `HeroProvvisorio.astro`: sezione statica a piena altezza
con lo stemma (`public/img/stemma.png`) su fondo `--bg`, titolo "LONGI 1969"
e sottotitolo. Nessuna animazione, nessuna dipendenza da video: è pensata
per reggere il sito finché l'hero definitivo non è pronto.

L'hero definitivo (**Task 6** del piano,
`docs/superpowers/plans/2026-08-26-sito-longi-1969.md`) è **gated sulla
riautorizzazione del connettore Higgsfield** e sulla conferma dei crediti
prima di ogni generazione (stima: ~50-70 crediti Higgsfield per l'intera
sequenza). Concetto: un leone d'oro statua di bronzo nel buio che si
risveglia, la camera arretra, le due metà rossoblù dello scudo si chiudono
attorno a lui, scroll-driven con la stessa pipeline collaudata su Città di
Galati (2 frame → video Seedance 2.0 5s → reframe 9:16 → frame WebP estratti
con ffmpeg → scrub su canvas).

**Quando l'hero sarà pronto**, sostituirà `HeroProvvisorio` in
`src/pages/index.astro` con un nuovo componente `Hero.astro` (stesso punto
di innesto, stessa sezione). Fino ad allora `HeroProvvisorio` resta il
componente in produzione: non è un placeholder rotto, è una versione
onesta e funzionante della home.

### 2.5 Comandi e struttura

```bash
npm install       # dipendenze (Node >= 22.12.0)
npm run dev        # sviluppo, http://localhost:4321
npm run build       # build di produzione in dist/
npm run preview     # serve dist/ per test locali pre-deploy
npm test           # vitest --passWithNoTests (nessun test finche' non arriva scrub.ts nel Task 6)
npm run guida-pdf     # rigenera docs/Guida-pannello-Longi-1969.pdf da GUIDA-PANNELLO.md
```

Struttura principale:
- `src/pages/`: le 8 pagine del sito.
- `src/components/`: HeroProvvisorio, Header, Footer, Spaccatura (divisore
  scroll-driven), card post social/giocatore, parete rosa (`PlayerWall`), fascia
  sponsor, widget Tuttocampo, DirettaLive, consenso GDPR.
- `src/content/` + `src/content.config.ts`: le 4 collezioni CMS (social,
  giocatori, staff, sponsor), lette da Astro Content Collections.
- `src/data/`: `societa.json`, `pagina-club.json`, `storia.json`,
  `diretta.json`, contenuti modificabili dal pannello senza toccare codice.
- `src/lib/tuttocampo.ts`: costanti e GUID widget Tuttocampo (punto 2.3).
- `src/lib/consenso.ts`: logica di consenso GDPR per gli embed di terze
  parti (Tuttocampo, eventuale mappa).
- `public/admin/`: pannello Sveltia CMS (`config.yml` definisce le
  collezioni, deve restare coerente con `src/content.config.ts`).
- `netlify/functions/`: `auth.mjs`/`callback.mjs`, OAuth GitHub per il
  pannello.

### 2.6 Checklist prima di andare online

- [ ] Repository creato su GitHub, **pubblico**, push effettuato
- [ ] Account Netlify separato collegato, build automatica verde
- [ ] Dominio registrato **a nome del club**, non dello sviluppatore
- [ ] `site` valorizzato in `astro.config.mjs` col dominio reale (punto 2.2)
- [ ] `public/admin/config.yml` e callback OAuth aggiornati col dominio
      reale (punto 2.2)
- [ ] Blocco `noindex` rimosso da `netlify.toml`
- [ ] Dati societari reali inseriti in `src/data/societa.json` dal pannello
      (o a mano): denominazione, CF, indirizzo, contatti, PEC
- [ ] Storia 1969-2022 completata in `src/data/storia.json` e
      `src/data/pagina-club.json`
- [ ] Stemma vettoriale ricevuto o commissionato, sostituito ai PNG
      Tuttocampo (vedi `public/img/LEGGIMI.md`)
- [ ] Loghi sponsor reali caricati con il livello corretto
- [ ] Rosa e staff inseriti, con liberatorie raccolte per le foto
- [ ] GUID Tuttocampo generato, inserito, altezze rimisurate (punto 2.3), a
      campionato iniziato
- [ ] Hero Seedance completato e collegato in `index.astro` (punto 2.4),
      oppure decisione esplicita di andare online con `HeroProvvisorio`
- [ ] Redattore del club invitato su GitHub e messo alla prova su `/admin`:
      deve riuscire ad aggiungere un post social da solo
- [ ] `npm test` e `npm run build` verdi
