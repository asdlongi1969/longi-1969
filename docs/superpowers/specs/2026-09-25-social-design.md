# Pagina Social al posto delle news — documento di design

Data: 25/09/2026. Stato: approvato a sezioni dall'utente in conversazione,
in attesa di revisione di questo documento.
Vale per **due siti**: Longi 1969 (questo repo) e ASD Città di Galati
(`C:\Users\tigno\Desktop\città di galati`). Si fa prima il Longi, poi si
porta sul Galati cambiando solo lo stile.

## Obiettivo

Le news scritte a mano non piacciono e nessuno le scriverà: i contenuti del
club nascono sui social, fatti da chiunque (club, giocatori, tifosi, giornali
locali). Chi gestisce il sito riceve il link di un post, lo incolla nel
pannello e il post compare da solo sul sito. Le news spariscono del tutto:
"se devono caricare una news lo fanno sui social" (utente).

Fuori obiettivo: prendere in automatico i post dall'account del club
(richiede account sviluppatore Meta e token da rinnovare ogni 60 giorni, e
non coprirebbe i post di altri); YouTube (escluso dall'utente); schede con
foto/testo estratti dal link (Instagram e Facebook bloccano la lettura dai
server, come il 403 di Tuttocampo, e ripubblicare foto altrui pone un tema di
diritti); controllo automatico dei post cancellati.

## Decisioni

| Tema | Scelta |
|---|---|
| Piattaforme | Instagram, Facebook, TikTok |
| Resa del post | Riquadro ufficiale della piattaforma (iframe) dentro una cornice del sito |
| Privacy | Riquadri dietro il consenso esistente (`EmbedConsenso` + `lib/consenso.ts`) |
| News | Eliminate ovunque (pagine, menu, pannello, contenuti, card) |
| Home | Sezione "Dai social" con gli ultimi 3 post al posto di "Ultime notizie" |
| Link vecchi | `/news` e `/news/*` → `/social` con redirect 301 |
| Messa online | Insieme al trasloco su Cloudflare (ogni salvataggio su Netlify costa 15 crediti) |

## 1. Pannello e dati

Nuova collezione cartella `social` (`src/content/social/*.md`), al posto di
`news` in `public/admin/config.yml` e `src/content.config.ts`.

Campi:
- `link` (stringa, obbligatorio). Validazione nel pannello con `pattern` che
  accetta solo indirizzi `https://` di instagram.com, facebook.com, fb.watch,
  tiktok.com, vm.tiktok.com, vt.tiktok.com. Suggerimento sotto il campo: il
  post deve essere pubblico; i post dentro i gruppi Facebook non si vedono;
  dal telefono va bene il link di "Copia link"/"Condividi".
- `date` (datetime, default `{{now}}` = ora del salvataggio; etichetta "Data").
  Ordina i post, più recenti prima. Correggibile per inserire un post vecchio.

Niente titolo o testo: il post porta il suo. Nel pannello la lista mostra
`{{date | date('DD/MM/YYYY')}} · {{link}}` (`summary`); nome file da data e ora
(`slug: "{{year}}-{{month}}-{{day}}-{{hour}}{{minute}}{{second}}"`).

Schema Astro: `link: z.string().url()`, `date: z.coerce.date()`. Un link che
passa lo schema ma non è riconosciuto NON rompe il build (vedi §2).

## 2. Dal link al riquadro (`src/lib/social.ts`)

Funzione pura, testata con vitest su link reali di ogni forma:

```ts
type Post =
  | { piattaforma: "instagram" | "facebook" | "tiktok"; src: string; link: string }
  | { piattaforma: "instagram" | "facebook" | "tiktok" | "altro"; src: null; link: string };
function riconosci(link: string): Post
```

| Link | Riquadro (`src`) |
|---|---|
| `instagram.com/p/<code>/`, `/reel/<code>/`, `/tv/<code>/`, anche con `?igsh=`, `?img_index=` e prefisso `/<utente>/` | `https://www.instagram.com/p/<code>/embed/captioned/` (anche per reel e tv: stesso codice) |
| `facebook.com/.../posts/...`, `permalink.php?...`, `photo...` | `https://www.facebook.com/plugins/post.php?href=<link>&show_text=true&width=500` |
| `facebook.com/.../videos/...`, `/reel/...`, `/watch/?v=`, `fb.watch/...` | `https://www.facebook.com/plugins/video.php?href=<link>&show_text=true&width=500` |
| `tiktok.com/@<utente>/video/<id>` | `https://www.tiktok.com/embed/v2/<id>` |

Link corti (`facebook.com/share/...`, `vm.tiktok.com/...`, `vt.tiktok.com/...`,
`fb.watch/...` se il plugin non lo accetta): risolti **al build** seguendo il
redirect (`fetch` con `redirect: "manual"`, timeout breve) e poi passati a
`riconosci`. Se la piattaforma blocca il server o non risponde, il post esce
con `src: null`. Da verificare in sviluppo con link reali quali forme il
plugin accetta direttamente e quali vanno risolte.

`src: null` = scheda-link: cornice del sito con piattaforma, data e
"Apri su <piattaforma>". Nessun errore di build per colpa di un link.

## 3. Resa sul sito

**Componente `SocialPost.astro`**: cornice nello stile del sito (Longi
rossoblù, Galati gialloblù), etichetta in alto "Instagram · 21 set", sotto
`EmbedConsenso` con il riquadro ufficiale. Altezze: Instagram e TikTok
verticali, Facebook post più basso; valori fissi per piattaforma, da tarare
sui riquadri reali (se Instagram manda l'altezza via `postMessage`, si usa).

**Senza consenso**: segnaposto di `EmbedConsenso` (già leggero, nessuna
richiesta esterna) con testo per i social, pulsante esistente "Carica <piattaforma>" e link
"Apri su <piattaforma>" (nuova prop facoltativa `apri` di `EmbedConsenso`) per chi non vuole acconsentire. "Ricorda la scelta"
è spuntato di default, quindi un clic sblocca tutti i post della pagina e dei
caricamenti successivi (comportamento esistente). Nessun codice di consenso
nuovo.

**Home**: sezione "Dai social" al posto di "Ultime notizie", ultimi 3 post,
pulsante "Tutti i post" → `/social`. Stesso effetto d'ingresso delle news di
oggi (Longi: sfalsate con taglio diagonale; Galati: griglia attuale). Resta
la regola di DESIGN.md "un effetto per schermata". Se non ci sono post la
sezione non compare.

**Pagina `/social`**: tutti i post dal più recente, griglia a colonne, una
colonna su telefono. Iframe `loading="lazy"`: si caricano solo avvicinandosi.
Nessuna paginazione finché non servirà (oltre ~50-100 post).

**Diretta**: `DirettaLive` in home resta com'è, non toccata.

## 4. Rimozione news

In entrambi i repo: `src/pages/news/`, `src/components/NewsCard.astro`,
collezione `news` (config Astro e pannello), `src/content/news/`, voce
"News" del menu (`Header.astro`) → "Social", stili `.news-*` in
`index.astro`, link a `/news` nella 404 del Galati. Immagini in
`public/img/uploads` usate solo dalle news: rimosse (verifica con grep prima
di cancellare). Il Longi perde 3 articoli veri: scelta dell'utente.

`public/_redirects` (formato comune a Netlify e Cloudflare Pages):

```
/news    /social  301
/news/*  /social  301
```

## 5. Privacy

Informativa (`src/pages/privacy.astro`): aggiungere Instagram e Facebook
(Meta Platforms Ireland) e TikTok (TikTok Technology Limited) fra i servizi
di terze parti caricati solo dopo consenso, stesso stile delle voci
esistenti (OpenStreetMap, Tuttocampo, Facebook per la diretta).

## 6. Verifiche

- vitest su `riconosci` e sulla risoluzione dei link corti (con fetch finto).
- `npm run build` pulito in entrambi i repo.
- Foto con playwright-cli di home e `/social`, desktop e telefono, senza
  consenso (segnaposti) e con consenso (riquadri veri da post pubblici reali
  delle tre piattaforme).
- Senza consenso: zero richieste verso domini Meta e TikTok (lettura delle
  richieste di rete).
- `/news/qualunque` → `/social` (su `astro preview` i redirect di
  `_redirects` non valgono: si verifica sul deploy di anteprima).

## Rischi

- **Link corti bloccati al build** → scheda-link invece del riquadro.
  Accettato; il pannello suggerisce il link completo quando possibile.
- **Post privati, nei gruppi o con incorporamento disattivato dall'autore** →
  il riquadro ufficiale mostra "non disponibile". Chi gestisce lo toglie.
- **Peso**: ogni riquadro 0,5-1,5 MB, contenuto da lazy loading e 3 post in
  home.
- **Crediti Netlify**: ogni post salvato = 1 deploy (15 crediti). Per questo
  si va online dopo il trasloco su Cloudflare.
