# Materiale da chiedere alla società: Longi 1969

Il sito è tecnicamente pronto ma corre oggi con **dati verificati da fonti
online pubbliche** (cronache sportive, Tuttocampo) più alcuni **segnaposto
onesti** dove le fonti online non bastano. Questo documento elenca, voce per
voce, cosa serve dal club per completare i contenuti.

Consegnare tutto a: sviluppatore (Gaetano). Formati preferiti indicati per
ogni voce.

---

## 1. Dati legali e contatti (bloccanti per andare online)

| Cosa | Dove finisce | Note |
|---|---|---|
| Denominazione sociale esatta | `src/data/societa.json` (`denominazione`), Footer, Contatti, Privacy | Oggi il campo è vuoto: il sito mostra "Longi 1969" come nome breve, ma la privacy policy resta incompleta finché manca la ragione sociale come da statuto |
| Codice fiscale / P.IVA | `src/data/societa.json` (`codiceFiscale`), Footer, Privacy | Oggi vuoto. **Verificabile poi in autonomia** su [registro.sportesalute.eu](https://registro.sportesalute.eu) una volta nota la denominazione esatta, ma va confermato col club perché il registro può contenere più affiliazioni con nomi simili |
| Matricola FIGC | `src/data/societa.json` (`matricolaFigc`) | Oggi vuota. Compare nel footer solo se il codice fiscale è già presente |
| Sede legale (via, civico, CAP) | `src/data/societa.json` (`indirizzo`) | Oggi vuoto: Footer e Contatti mostrano il comune (Longi, ME) come ripiego |
| Email ufficiale | `src/data/societa.json` (`email`) | Oggi vuota |
| PEC | `src/data/societa.json` (`pec`) | Se esiste |
| Telefono di riferimento | `src/data/societa.json` (`telefono`) | Numero che il club vuole rendere pubblico |
| Nominativo del referente privacy | Privacy (oggi si rimanda al titolare generico) | Chi risponde alle richieste sui dati, di solito il presidente |

## 2. Identità e persone

| Cosa | Dove finisce | Note |
|---|---|---|
| Stemma in formato vettoriale (AI/EPS/SVG/PDF) | Tutto il sito | Oggi si usano solo i PNG scaricati dalla scheda Tuttocampo (`assets/stemma-tuttocampo-150.png` e `-500.png`, bassa risoluzione): vedi `public/img/LEGGIMI.md`. Se il club non lo possiede, va rivettorializzato da un grafico partendo dal PNG e dalla descrizione ufficiale (scudo dimezzato rosso/blu, leone d'oro rampante, scritta LONGI 1969, bordo tricolore, Trinacria in basso) |
| Presidente e allenatore (nome e cognome) | Pagina Club, eventualmente Squadra | Non trovati nelle cronache consultate |
| Storia dettagliata 1969-2022 | Pagina Storia (`src/data/storia.json`, tappa "1970-2021"), Pagina Club (`src/data/pagina-club.json`) | **Oggi è il buco più grande**: si sa solo l'anno di fondazione (1969, dallo stemma) e il ritiro dalla Prima Categoria nel 2022. Mancano i cinquant'anni in mezzo: promozioni/retrocessioni, personaggi storici, palmarès, aneddoti. Anche appunti sparsi o un racconto a voce vanno benissimo, ci pensa lo sviluppatore a scriverli bene |

## 3. Rosa e staff (oggi solo 3 nomi dalle cronache, resto segnaposto)

| Cosa | Dove finisce | Note |
|---|---|---|
| Elenco giocatori completo: nome, ruolo, numero di maglia | Pagina Squadra | Dalle cronache si conoscono solo Antonino Pidalà (attaccante, gol promozione), Sirna e Arangio (portiere), senza numero di maglia né ruolo certo per tutti. Il resto della rosa è un unico segnaposto "Mario Rossi". Dal 06/09/2026 il muro della rosa compare anche in home: il segnaposto si vede quindi anche lì, va cancellato dal pannello appena arriva la rosa vera |
| Foto singole dei giocatori | Pagina Squadra | Ideale: mezzo busto su sfondo neutro, tutte uguali. Senza foto compare una sagoma (già prevista, `public/img/silhouette.svg`) |
| **Liberatorie firmate per le foto** | - | Obbligatorie per pubblicare i volti. Per i minorenni firma di **ENTRAMBI i genitori** o di chi esercita la responsabilità genitoriale (testo già in `src/pages/privacy.astro`). Senza liberatoria niente foto: la sagoma resta |
| Staff tecnico e dirigenza: nomi e incarichi | Pagina Squadra | Allenatore, vice, preparatori, dirigenti accompagnatori, presidente ecc. |

## 4. Sponsor (oggi 4 sponsor FITTIZI con loghi disegnati)

| Cosa | Dove finisce | Note |
|---|---|---|
| Elenco sponsor reali con livello | `SponsorStrip` in home | Livelli: main (il più grande), tecnico, partner. Decide il club la gerarchia |
| Logo di ogni sponsor | Fascia sponsor | Meglio se vettoriale o PNG grande su sfondo trasparente; in mancanza, foto nitida dell'insegna |
| Link al sito/pagina social di ogni sponsor | Fascia sponsor | Se esiste: il logo diventa cliccabile (campo già pronto nel CMS) |
| Ok scritto degli sponsor alla pubblicazione | - | Basta un messaggio: evita discussioni dopo |

## 5. Il campo e le foto

| Cosa | Dove finisce | Note |
|---|---|---|
| Nome ufficiale del campo di casa | `src/data/societa.json` (`campoNome`, `campoIndirizzo`) | Oggi vuoto: il sito mostra "campo comunale di Longi (nome da confermare)" in Club e Contatti. Le partite di campionato citate nelle cronache si sono giocate fuori casa (Sant'Agata Militello, Rocca di Caprileone): il campo di Longi non è mai comparso come sede di gara nelle fonti consultate |
| 15-25 foto belle e recenti | Home, News, Club, Storia | Partite, tifosi, campo, spogliatoio, festeggiamenti del double 2026. Più sono alte di risoluzione meglio è |
| Foto del campo di casa | Pagina Club | Un paio, anche panoramiche |
| Foto di squadra del double 2025/26 | Home, Club, Storia | Se esiste una foto ufficiale della squadra promossa |

## 6. Social e accessi (bloccanti per andare online)

| Cosa | Serve per | Note |
|---|---|---|
| Pagina Instagram e/o Facebook ufficiali | `src/data/societa.json` (`instagram`, `facebook`), Footer, Contatti | Non individuate con certezza nella ricerca online: da confermare col club per evitare di linkare profili sbagliati |
| Dominio (es. longi1969.it) | Indirizzo del sito | **Va registrato a nome del club**, non dello sviluppatore. Vedi `docs/HANDOFF.md` §2.2 |
| Chi gestirà le news dal pannello | Aggiornamenti | Nome ed email della persona (una o due) che pubblicherà le notizie: riceverà l'invito al pannello di gestione su GitHub |
| Account Tuttocampo | Widget classifica/risultati/marcatori automatici | Serve login (anche gratuito) per generare il GUID del girone su `/WidgetApi`. Procedura in `docs/HANDOFF.md` §2.3; la genera lo sviluppatore, ma serve sapere con quale account entrare |

## 7. Decisioni da prendere insieme

- **Settore giovanile sul sito**: sì o no? Se sì, servono liberatorie per TUTTI i minori fotografati. In dubbio: si parte senza e si aggiunge dopo.
- **Il riquadro "Diretta partita"** (`src/data/diretta.json`, già pronto nel pannello): chi lo attiva prima di ogni gara casalinga e lo spegne a fine partita?
- **Chi appare nei contatti**: il club vuole un modulo di contatto generico (già pronto) o anche nomi/numeri di persone specifiche?

---

## Stato attuale dei segnaposto nel codice

Per lo sviluppatore: non tutto il sito usa un'unica parola-marcatore come a
Galati. I punti da chiudere si trovano così:

```bash
# Dati società vuoti (denominazione, CF, indirizzo, contatti, campo, social)
grep -n '""' src/data/societa.json

# Punti del codice che segnalano esplicitamente il dato mancante
grep -rn "DATI-SOCIETA" src/

# Contenuti demo/fittizi da sostituire
grep -rln "FITTIZIO" src/content/ public/img/sponsor-demo/

# GUID Tuttocampo non ancora generato
grep -n "INSERIRE-GUID" src/lib/tuttocampo.ts

# Repository/dominio CMS non ancora collegati
grep -n "INSERIRE-" public/admin/config.yml
```

| Area | File |
|---|---|
| Rosa (1 segnaposto + 3 nomi dalle cronache senza foto/numero) | `src/content/giocatori/*.md` |
| Sponsor (4, fittizi con loghi disegnati) | `src/content/sponsor/*.md` + `public/img/sponsor-demo/*.svg` |
| Storia 1970-2021 (buco principale, vedi §2) | `src/data/storia.json`, `src/data/pagina-club.json` |
| Dati legali e contatti | `src/data/societa.json`, marker `DATI-SOCIETA` in `src/pages/privacy.astro` |
| Stemma (bassa qualità, da vettoriale) | `public/img/stemma.png`, `public/img/stemma-500.png`; vedi `public/img/LEGGIMI.md` |
| GUID widget Tuttocampo | `src/lib/tuttocampo.ts` |
| Repo/dominio CMS | `public/admin/config.yml` |
