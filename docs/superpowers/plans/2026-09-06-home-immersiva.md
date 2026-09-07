# Home immersiva + rosa mobile: piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** riempire la home di fclongi.netlify.app con sezioni legate allo scroll (niente blocchi statici), e correggere la rosa su telefono, senza contenuti inventati e senza spendere crediti.

**Architecture:** tre sezioni nuove alimentate SOLO da dati già verificati nel repo (`storia.json`, le 12 squadre del girone C, la data di inizio campionato), più tre rifiniture (freccia "scorri" nell'hero, entrata sfalsata delle news, muro rossoblù in home). Tutto scroll-driven in CSS (`animation-timeline`), JS solo dove il dato cambia nel tempo (conto alla rovescia, tabellone a palette). Ogni sezione degrada a statico con `prefers-reduced-motion` e nei browser senza `animation-timeline`.

**Tech Stack:** Astro ^7.1.3 statico, Vitest, CSS scroll-driven animations (`view()`, `view-timeline-name`), zero librerie nuove, zero generazioni AI.

## Stato di partenza (verificato in prod il 06/09/2026)

Home oggi, dopo l'hero (450vh di scrub del leone): `DirettaLive` (spenta) → `NextMatch` (due iframe Tuttocampo con "non disponibile") → `Spaccatura` → 3 news senza foto → `Spaccatura` → 4 sponsor fittizi. Circa 3 schermate desktop di testo su fondo scuro: la sensazione "spoglia" viene da qui.

Pagina Squadra su telefono (375px), due difetti reali misurati nel browser:

1. **Il Muro rossoblù è invisibile su mobile.** `.lastra` ha `flex: 1` (cioè `flex-basis: 0%`); in colonna la basis vince su `height: 3.4rem` e ogni lastra misura **0px** (il muro intero: 6px, solo i gap). Su desktop il muro si vede.
2. **La griglia dei ruoli lascia la card a sinistra.** `repeat(auto-fill, minmax(160px, 1fr))` a 375px fa 2 colonne (`161.6px 161.6px`); ogni ruolo oggi ha 1 giocatore, quindi la card occupa la metà sinistra e la destra resta vuota. È questo il "non centrata bene".

## Premesse messe in discussione (avvocato del diavolo, da leggere prima di eseguire)

- **La home è spoglia soprattutto perché mancano i contenuti del club** (foto, rosa vera, sponsor veri, storia 1970-2021: vedi `docs/RICHIESTE-SOCIETA.md`) e perché il campionato non è iniziato (i due widget partita si riempiono da soli dal 26-27/09/2026, data verificata su messinanelpallone 43295). Le animazioni non sostituiscono i contenuti: questo piano aggiunge solo sezioni fondate su dati veri già nel repo, costruite per arricchirsi da sole quando il club manda materiale (rosa → muro, tappe → rinascita, calendario → conto alla rovescia).
- **"Il meno statico possibile" contro la regola di DESIGN.md "tre momenti overdrive, non di più".** Con questo piano la regola cambia in "un solo effetto per schermata": ogni sezione ha il suo, nessuna ne ha due. Decisione dell'utente del 06/09/2026, va scritta in DESIGN.md (Task 9).
- **Prestazioni.** Tutto compositor-only (transform, opacity, clip-path), niente librerie, tre script piccoli. Il criterio Lighthouse mobile ≥ 90 resta e si verifica nel Task 10. La home diventa lunga (hero 450vh + palco 500vh su desktop): è il prezzo dell'immersione, ed è coerente col sito.
- **Costi: zero.** L'alternativa "fascia con foto del paese generata dall'AI" (~0,10-0,30 € su kie.ai) NON è nel piano: sarebbe una foto finta, la stessa trappola della foto tifosi fittizia di Galati. Se il club manda foto vere, si aggiunge una fascia con parallax in un task a parte.
- **Il segnaposto "Mario Rossi"** (`src/content/giocatori/giocatore-placeholder.md`) oggi compare in `/squadra`; col Task 8 comparirà anche in home. Va cancellato dal pannello appena arriva la rosa vera (già scritto in RICHIESTE-SOCIETA). Se l'utente preferisce, il Task 8 si salta: la home funziona anche senza.
- **Conto alla rovescia senza orario.** Del debutto si conosce il weekend, non ora e avversario. Il conto punta alla mezzanotte del giorno indicato e lo dice chiaro nel sottotitolo: niente precisione finta. Si rimane onesti come col tabellone stagione "non iniziata".

## Home finale (ordine delle sezioni)

```
Hero (invariato + freccia "scorri")
DirettaLive (invariato, da pannello)
Debutto            NUOVO  conto alla rovescia al 27/09, fondo rosso drenched, cifre d'oro vive
NextMatch (invariato)
Spaccatura
Ultime notizie     RIFINITA  le tre card entrano sfalsate con taglio diagonale allo scroll
Rinascita          NUOVO  palco fisso: 1969 → 2022 → 2024 → 2026, il taglio rossoblù attraversa il palco
Spaccatura inverti
Il girone C        NUOVO  tabellone a palette anni '70: le 12 squadre si compongono lettera per lettera
La rosa            NUOVO  Muro rossoblù (stesso componente di /squadra) + link
Spaccatura
SponsorStrip (invariato)
PlayerDialog (serve al muro)
```

Priorità se il tempo stringe: Task 1 (bug) → 2, 3, 4 (le tre sezioni che riempiono) → 5, 6, 7 (rifiniture) → 8, 9.

## Global Constraints

- Node >= 22.12; `NODE_VERSION=22` su Netlify. Ogni task chiude con `npm run build` e `npm test` verdi.
- Palette SOLO dai token di `src/styles/tokens.css`; `--rosso-fondo` solo come fondo di sezioni intere.
- Font SOLO Alfa Slab One (display) e Archivo (testo), già self-hosted.
- Animazioni scroll-driven: SOLO proprietà `animation-*` estese (`animation-name`, `-duration`, `-fill-mode`, `-timing-function`, `-timeline`, `-range`), MAI la scorciatoia `animation:`. Il minificatore fonde la scorciatoia con `animation-timeline` e il browser scarta tutto. Le regole possono finire inlinate in `dist/index.html`, non solo nei `.css`: verificare su entrambi (Task 10).
- Ogni animazione ha ripiego: `@supports (animation-timeline: view())` + reduced-motion; dove serve JS, l'elemento resta visibile senza JS.
- Testi in italiano, niente trattini lunghi, niente sezioni "in costruzione". Identificatori CSS/JS in italiano come il resto del repo (`.lastra`, `spezzaAnno`): si segue lo stile esistente.
- Nessuna richiesta verso host esterni senza consenso (le sezioni nuove non ne fanno nessuna).
- Modifiche chirurgiche: si toccano solo i file elencati per task. Niente refactoring di codice adiacente.
- Commit a fine di ogni task, messaggio in italiano, stile dei commit esistenti (`feat:`/`fix:`), con la riga `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Zero crediti spesi: nessuna generazione AI in questo piano.

## Mappa dei file

| File | Ruolo |
|---|---|
| `src/components/MuroRosa.astro` (modifica) | fix altezza lastre su mobile |
| `src/pages/squadra.astro` (modifica) | card orfana centrata su mobile; ordinamento rosa da `lib/rosa` |
| `src/data/stagione.json` (nuovo) | data del debutto, titolo, sottotitolo (pannello) |
| `src/lib/debutto.ts` + `tests/debutto.test.ts` (nuovi) | logica pura del conto alla rovescia |
| `src/components/Debutto.astro` (nuovo) | sezione conto alla rovescia |
| `src/components/Rinascita.astro` (nuovo) | palco sticky delle tappe (da `storia.json`) |
| `src/data/girone.json` (nuovo) | le 12 squadre del girone C (pannello) |
| `src/lib/palette.ts` + `tests/palette.test.ts` (nuovi) | sequenza delle lettere del tabellone |
| `src/components/TabelloneGirone.astro` (nuovo) | tabellone a palette |
| `src/components/NewsCard.astro` (modifica) | attributo `data-reveal` |
| `src/components/Hero.astro` (modifica) | freccia "scorri" |
| `src/lib/rosa.ts` + `tests/rosa.test.ts` (nuovi) | ordinamento rosa condiviso |
| `src/pages/index.astro` (modifica) | nuovo ordine, stagger news, sezione rosa |
| `public/admin/config.yml`, `docs/GUIDA-PANNELLO.md`, `DESIGN.md`, `docs/RICHIESTE-SOCIETA.md` (modifica) | pannello e documentazione |

---

### Task 1: Rosa su telefono: muro visibile e card centrata

**Files:**
- Modify: `src/components/MuroRosa.astro` (blocco `@media (max-width: 719px)`)
- Modify: `src/pages/squadra.astro` (stile `.roster-grid`)

**Interfaces:**
- Consumes: niente.
- Produces: niente di programmatico. Il muro su mobile diventa una pila di bande alte 3.4rem; la card unica o dispari in fondo alla griglia sta centrata a tutta riga.

- [ ] **Step 1: riprodurre il difetto nel browser**

Avviare l'anteprima (`.claude/launch.json`, configurazione `astro-dev`), viewport 375x812, pagina `/squadra`. Eseguire nella console:

```js
({
  lastra: document.querySelector(".lastra").getBoundingClientRect().height,
  muro: document.querySelector(".muro").getBoundingClientRect().height,
  card: (() => { const r = document.querySelector(".roster-grid .player-card").getBoundingClientRect(); return { centro: (r.left + r.right) / 2, viewport: innerWidth / 2 }; })(),
})
```

Atteso PRIMA del fix: `lastra: 0`, `muro: 6`, `card.centro` ≈ 96 (viewport 187.5).

- [ ] **Step 2: fix del muro (MuroRosa.astro)**

Nel blocco `@media (max-width: 719px)` sostituire le regole `.lastra` e `.lastra:hover, .lastra:focus-visible` con:

```css
    .lastra {
      /* `flex: 1` (basis 0%) in colonna azzera l'altezza: qui la basis e'
         l'altezza della banda, e non cresce. */
      flex: 0 0 3.4rem;
      height: 3.4rem;
      clip-path: polygon(0 0, 100% 6%, 100% 100%, 0 94%);
      border-inline: none;
    }
    .lastra:hover,
    .lastra:focus-visible {
      flex-grow: 0;
    }
```

- [ ] **Step 3: fix della griglia (squadra.astro)**

Dopo la regola `.roster-grid { ... }` aggiungere:

```css
  /* Telefono: due colonne fisse. La card orfana (unica del ruolo, o ultima
     dispari) prende tutta la riga e sta al centro, larga come una card:
     prima restava incollata a sinistra con la meta' destra vuota. */
  @media (max-width: 719px) {
    .roster-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .roster-grid > :global(.player-card:last-child:nth-child(odd)) {
      grid-column: 1 / -1;
      justify-self: center;
      width: min(100%, 220px);
    }
  }
```

- [ ] **Step 4: verificare nel browser**

Stessa console dello Step 1. Atteso: `lastra` ≈ 54 (3.4rem), `muro` > 220, `|card.centro - viewport| < 2`. Screenshot a 375px del muro (quattro bande rosso/blu con nome a sinistra, numero assente perché i dati non hanno numero) e di "01 Portieri" con la card al centro. Poi viewport desktop: il muro deve essere identico a prima (lastre affiancate inclinate, hover che allarga).

- [ ] **Step 5: build, test, commit**

```bash
npm run build && npm test
git add src/components/MuroRosa.astro src/pages/squadra.astro
git commit -m "fix: rosa su telefono, muro visibile e card orfana centrata"
```

---

### Task 2: Debutto, conto alla rovescia alla prima giornata

**Files:**
- Create: `src/data/stagione.json`
- Create: `src/lib/debutto.ts`
- Create: `tests/debutto.test.ts`
- Create: `src/components/Debutto.astro`
- Modify: `src/pages/index.astro` (import + posizione dopo `<DirettaLive />`)

**Interfaces:**
- Consumes: `src/data/stagione.json` `{ debutto: string ISO con fuso, titolo: string, sottotitolo: string }`.
- Produces: `spezzaTempo(msMancanti: number): { giorni: number; ore: number; minuti: number }` e `debuttoPassato(ora: number, debutto: number): boolean` in `src/lib/debutto.ts`; componente `<Debutto />` senza props.

- [ ] **Step 1: dati**

`src/data/stagione.json`:

```json
{
  "debutto": "2026-09-27T00:00:00+02:00",
  "titolo": "Il debutto in Seconda Categoria",
  "sottotitolo": "Girone C, prima giornata nel weekend del 26-27 settembre. Orario e avversario arrivano con il calendario ufficiale."
}
```

Fonte della data: messinanelpallone art. 43295 (Promozione, Prima e Seconda Categoria partono il 26-27 settembre 2026). Il conto punta alla mezzanotte del 27: non si conosce l'orario e il testo lo dice.

- [ ] **Step 2: test della logica pura (rosso)**

`tests/debutto.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { spezzaTempo, debuttoPassato } from "../src/lib/debutto";

const G = 86_400_000, O = 3_600_000, M = 60_000;

describe("spezzaTempo", () => {
  it("spezza giorni, ore e minuti", () => {
    expect(spezzaTempo(2 * G + 3 * O + 4 * M + 59_000)).toEqual({ giorni: 2, ore: 3, minuti: 4 });
  });
  it("sotto il minuto e' tutto zero", () => {
    expect(spezzaTempo(59_000)).toEqual({ giorni: 0, ore: 0, minuti: 0 });
  });
  it("tempo negativo non produce valori negativi", () => {
    expect(spezzaTempo(-5 * G)).toEqual({ giorni: 0, ore: 0, minuti: 0 });
  });
  it("ore e minuti restano sotto 24 e 60", () => {
    const t = spezzaTempo(30 * G + 23 * O + 59 * M);
    expect(t).toEqual({ giorni: 30, ore: 23, minuti: 59 });
  });
});

describe("debuttoPassato", () => {
  it("prima del debutto: falso", () => {
    expect(debuttoPassato(1000, 2000)).toBe(false);
  });
  it("all'istante del debutto e dopo: vero", () => {
    expect(debuttoPassato(2000, 2000)).toBe(true);
    expect(debuttoPassato(3000, 2000)).toBe(true);
  });
  it("data non valida (NaN) conta come passata: la sezione si spegne", () => {
    expect(debuttoPassato(1000, Number.NaN)).toBe(true);
  });
});
```

Run: `npm test`. Atteso: FAIL, `Cannot find module '../src/lib/debutto'`.

- [ ] **Step 3: implementazione**

`src/lib/debutto.ts`:

```ts
// Conto alla rovescia al debutto in campionato: logica pura, senza DOM.
// Il sito e' compilato in anticipo, quindi il conteggio vero gira nel
// browser (vedi Debutto.astro); qui solo l'aritmetica, testabile.

export function spezzaTempo(msMancanti: number): { giorni: number; ore: number; minuti: number } {
  const s = Math.max(0, Math.floor(msMancanti / 1000));
  return {
    giorni: Math.floor(s / 86400),
    ore: Math.floor((s % 86400) / 3600),
    minuti: Math.floor((s % 3600) / 60),
  };
}

// Una data non valida (campo del pannello vuoto o scritto male) conta come
// passata: meglio spegnere la sezione che mostrare "NaN giorni" a un tifoso.
export function debuttoPassato(ora: number, debutto: number): boolean {
  return !Number.isFinite(debutto) || ora >= debutto;
}
```

Run: `npm test`. Atteso: PASS (tutti i test, compresi quelli di `scrub`).

- [ ] **Step 4: componente**

`src/components/Debutto.astro`:

```astro
---
// Conto alla rovescia alla prima giornata. Vive nel browser per lo stesso
// motivo di DirettaLive: il sito e' statico e un conteggio fatto in build
// resterebbe fermo all'ora della pubblicazione. In build si decide solo se
// la sezione esiste: a debutto passato non viene nemmeno generata.
import stagione from "../data/stagione.json";
import { debuttoPassato } from "../lib/debutto";

const debutto = new Date(stagione.debutto);
const mostra = !debuttoPassato(Date.now(), debutto.getTime());
const quando = mostra
  ? debutto.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Rome" })
  : "";
---
{mostra && (
  <section class="debutto" data-debutto data-quando={stagione.debutto} aria-labelledby="debutto-title">
    <div class="inner" data-reveal>
      <p class="kicker font-display">
        <span class="spia" aria-hidden="true"></span>
        Stagione 2026/27
      </p>
      <h2 id="debutto-title" class="font-display">{stagione.titolo}</h2>

      <p class="conto" aria-live="off">
        <span class="sr-only">Mancano </span>
        <span class="blocco">
          <span class="cifra font-display" data-giorni>--</span>
          <span class="etichetta">giorni</span>
        </span>
        <span class="blocco">
          <span class="cifra font-display" data-ore>--</span>
          <span class="etichetta">ore</span>
        </span>
        <span class="blocco">
          <span class="cifra font-display" data-minuti>--</span>
          <span class="etichetta">minuti</span>
        </span>
      </p>

      <p class="quando font-display">{quando}</p>
      <p class="sotto">{stagione.sottotitolo}</p>
    </div>
  </section>
)}

<style>
  /* Sezione "drenched": rosso pieno dello scudo, bordi a taglio diagonale
     come la Spaccatura. Contrasto --text su --rosso-fondo: 11.1:1 (DESIGN.md). */
  .debutto {
    background: var(--rosso-fondo);
    clip-path: polygon(0 0, 100% 4%, 100% 100%, 0 96%);
    padding: clamp(3.5rem, 9vw, 6rem) clamp(1rem, 4vw, 2.5rem);
  }
  .inner {
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
  }
  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.5rem;
    font-size: 0.85rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--oro);
  }
  .spia {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--oro);
    box-shadow: 0 0 10px var(--oro);
    animation-name: spia-lampeggia;
    animation-duration: 2.4s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }
  @keyframes spia-lampeggia {
    0%, 100% { opacity: 0.35; }
    50% { opacity: 1; }
  }
  .debutto h2 {
    font-size: clamp(1.6rem, 4vw, 2.5rem);
    margin: 0 0 clamp(1.25rem, 4vw, 2rem);
  }
  .conto {
    display: flex;
    justify-content: center;
    gap: clamp(1rem, 5vw, 3rem);
    margin: 0;
    max-width: none;
  }
  .blocco {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 3.5ch;
  }
  .cifra {
    font-size: clamp(3rem, 12vw, 6.5rem);
    line-height: 1;
    color: var(--oro);
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 22px color-mix(in oklch, var(--oro) 45%, transparent);
  }
  .etichetta {
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: color-mix(in oklch, var(--text) 80%, transparent);
    margin-top: 0.3rem;
  }
  .quando {
    margin: clamp(1rem, 3vw, 1.5rem) 0 0.5rem;
    font-size: clamp(1.05rem, 2.6vw, 1.4rem);
    text-transform: capitalize;
    max-width: none;
  }
  .sotto {
    margin: 0 auto;
    max-width: 55ch;
    font-size: 0.95rem;
    color: color-mix(in oklch, var(--text) 82%, transparent);
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* Entrata legata allo scroll. SOLO proprieta' animation-* estese
     (vincolo del minificatore, vedi Global Constraints). */
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .inner {
        animation-name: debutto-entra;
        animation-duration: 1s;
        animation-fill-mode: both;
        animation-timing-function: var(--ease-out-quart);
        animation-timeline: view();
        animation-range: entry 0% cover 35%;
      }
    }
  }
  @keyframes debutto-entra {
    from { opacity: 0; transform: translateY(2rem); }
    to { opacity: 1; transform: none; }
  }
  /* Ripiego senza animation-timeline: Base.astro marca [data-reveal]. */
  .inner.reveal-js {
    opacity: 0;
    transform: translateY(2rem);
    transition: opacity 0.9s var(--ease-out-quart), transform 0.9s var(--ease-out-quart);
  }
  .inner.reveal-on {
    opacity: 1;
    transform: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .spia { animation-name: none; opacity: 0.8; }
  }
</style>

<script>
  import { spezzaTempo, debuttoPassato } from "../lib/debutto";

  const box = document.querySelector<HTMLElement>("[data-debutto]");
  if (box) {
    const quando = new Date(box.dataset.quando ?? "").getTime();
    const giorni = box.querySelector<HTMLElement>("[data-giorni]");
    const ore = box.querySelector<HTMLElement>("[data-ore]");
    const minuti = box.querySelector<HTMLElement>("[data-minuti]");
    const pad = (n: number) => String(n).padStart(2, "0");

    const aggiorna = () => {
      if (debuttoPassato(Date.now(), quando)) {
        // Il giorno e' arrivato (o la data e' rotta): la sezione sparisce,
        // il tabellone della prossima partita prende il suo posto.
        box.hidden = true;
        return false;
      }
      const t = spezzaTempo(quando - Date.now());
      if (giorni) giorni.textContent = String(t.giorni);
      if (ore) ore.textContent = pad(t.ore);
      if (minuti) minuti.textContent = pad(t.minuti);
      return true;
    };

    if (aggiorna()) {
      const timer = setInterval(() => {
        if (!aggiorna()) clearInterval(timer);
      }, 30_000);
    }
  }
</script>
```

- [ ] **Step 5: innesto in home**

In `src/pages/index.astro`, aggiungere l'import e la sezione subito dopo `<DirettaLive />`:

```astro
import Debutto from "../components/Debutto.astro";
```

```astro
    <DirettaLive />

    <Debutto />

    <NextMatch />
```

- [ ] **Step 6: verifica nel browser**

Home, desktop e 375px. Attesi: le tre cifre passano da `--` ai numeri entro un secondo; `document.querySelector("[data-debutto] [data-giorni]").textContent` è un intero tra 0 e 30; la riga "domenica 27 settembre" compare (con `text-transform: capitalize` la D è maiuscola); i bordi della sezione sono obliqui. Prova di spegnimento: in console `document.querySelector("[data-debutto]").dataset.quando = "2020-01-01T00:00:00+01:00"` non serve (lo script ha già letto); usare invece un build con `stagione.json` a data passata → la sezione NON deve comparire nel `dist/index.html` (`grep -c "data-debutto" dist/index.html` → 0). Ripristinare la data.

- [ ] **Step 7: build, test, commit**

```bash
npm run build && npm test
git add src/data/stagione.json src/lib/debutto.ts tests/debutto.test.ts src/components/Debutto.astro src/pages/index.astro
git commit -m "feat: conto alla rovescia al debutto in Seconda Categoria in home"
```

---

### Task 3: Rinascita, il palco fisso delle tappe

**Files:**
- Create: `src/components/Rinascita.astro`
- Modify: `src/pages/index.astro` (import + posizione dopo la sezione news)

**Interfaces:**
- Consumes: `src/data/storia.json` (`tappe[].anno/titolo/testo`), già gestito dal pannello.
- Produces: componente `<Rinascita />` senza props. Usa SOLO le tappe con anno secco a quattro cifre (1969, 2022, 2024, 2026): fuori i periodi ("1970-2021") e la stagione in corso ("2026/27"), raccontata dal conto alla rovescia. Con meno di due tappe la sezione non viene generata.

- [ ] **Step 1: componente**

`src/components/Rinascita.astro`:

```astro
---
// "Dal 1969 a oggi": le tappe della rinascita passano una alla volta su un
// palco fermo mentre lo scroll scorre; intanto il taglio rossoblu' dello
// scudo attraversa il palco da sinistra a destra. E' l'anteprima della
// pagina Storia, con gli stessi dati (storia.json) e la stessa voce (anni
// giganti in slab).
//
// Meccanica: la pista e' alta (n + 1) schermate e porta una view-timeline
// con nome; il palco e' sticky. Ogni quadro si accende nella sua fetta
// della corsa "contain" (quando la pista copre tutto lo schermo). Senza
// animation-timeline, o con reduced-motion, la pista si srotola: quadri
// impilati, tutti visibili, niente sticky. E' il layout di base, il palco
// e' il progressive enhancement.
import storia from "../data/storia.json";

// Solo gli anni secchi a quattro cifre: i periodi ("1970-2021") e la
// stagione in corso ("2026/27") restano alla pagina Storia.
const tappe = storia.tappe.filter((t) => /^\d{4}$/.test(t.anno));
const n = tappe.length;
---
{n > 1 && (
  <section class="rinascita" aria-labelledby="rinascita-title" style={`--n:${n}`}>
    <div class="pista">
      <div class="palco">
        <span class="taglio" aria-hidden="true"></span>
        <h2 id="rinascita-title" class="font-display">Dal 1969 a oggi</h2>
        <div class="quadri">
          {tappe.map((t, i) => (
            <article class="quadro" style={`--i:${i}`}>
              <span class="anno font-display">{t.anno}</span>
              <h3 class="font-display">{t.titolo}</h3>
              <p>{t.testo}</p>
            </article>
          ))}
        </div>
        <ol class="tacche" aria-hidden="true">
          {tappe.map((t, i) => (
            <li class="tacca font-display" style={`--i:${i}`}>{t.anno}</li>
          ))}
        </ol>
        <p class="rimando"><a class="cta" href="/storia">La storia completa</a></p>
      </div>
    </div>
  </section>
)}

<style>
  /* LAYOUT DI BASE (tutti i browser, reduced-motion): pista srotolata. */
  .palco {
    display: grid;
    gap: clamp(2rem, 5vw, 3rem);
    max-width: 1100px;
    margin: 0 auto;
    padding: clamp(3rem, 8vw, 5rem) clamp(1rem, 4vw, 2.5rem);
    text-align: center;
  }
  .palco h2 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    margin: 0;
  }
  .quadri {
    display: grid;
    gap: clamp(2rem, 6vw, 4rem);
  }
  .quadro {
    max-width: 900px;
    margin: 0 auto;
  }
  .anno {
    display: block;
    font-size: clamp(4rem, 18vw, 12rem);
    line-height: 0.85;
    color: var(--oro);
    font-variant-numeric: tabular-nums;
  }
  .quadro h3 {
    font-size: clamp(1.4rem, 3.5vw, 2.25rem);
    margin: 0.5rem 0;
  }
  .quadro p {
    margin: 0 auto;
    max-width: 60ch;
  }
  .taglio,
  .tacche {
    display: none;
  }
  .rimando {
    margin: 0;
    max-width: none;
  }
  .cta {
    display: inline-block;
    padding: 0.8rem 2rem;
    background: var(--oro);
    color: var(--bg);
    font-family: var(--font-display);
    text-decoration: none;
    font-size: 1.1rem;
  }

  /* PALCO FISSO: solo dove esistono le animazioni scroll-driven e il
     movimento e' gradito. SOLO proprieta' animation-* estese (vincolo del
     minificatore, vedi Global Constraints). */
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .pista {
        height: calc((var(--n) + 1) * 100vh);
        view-timeline-name: --rinascita;
        view-timeline-axis: block;
      }
      .palco {
        position: sticky;
        top: 0;
        height: 100vh;
        overflow: hidden;
        isolation: isolate;
        max-width: none;
        gap: 0;
        grid-template-rows: auto 1fr auto auto;
        padding: clamp(4.5rem, 12vh, 7rem) clamp(1rem, 4vw, 2.5rem) clamp(2rem, 6vh, 3rem);
      }
      /* Il taglio dello scudo: un pannello largo 220vw con la diagonale al
         centro. Da -25% a +25% della sua larghezza la diagonale attraversa
         tutto lo schermo: si parte nel blu notte, si finisce nel rosso. */
      .taglio {
        display: block;
        position: absolute;
        inset: 0 -60vw 0 -60vw;
        z-index: -1;
        background: linear-gradient(102deg, var(--rosso-fondo) 0 50%, var(--bg) 50% 100%);
        animation-name: taglio-passa;
        animation-duration: 1s;
        animation-fill-mode: both;
        animation-timing-function: linear;
        animation-timeline: --rinascita;
        animation-range: contain 0% contain 100%;
      }
      .quadri {
        align-content: center;
        gap: 0;
      }
      .quadro {
        grid-area: 1 / 1;
        animation-name: quadro-passa;
        animation-duration: 1s;
        animation-fill-mode: both;
        animation-timing-function: linear;
        animation-timeline: --rinascita;
        animation-range: contain calc(var(--i) * 100% / var(--n)) contain calc((var(--i) + 1) * 100% / var(--n));
      }
      /* L'ultimo quadro resta acceso: e' quello che si vede quando il palco
         si sgancia e la pagina riprende a scorrere. */
      .quadro:last-child {
        animation-name: quadro-resta;
      }
      .tacche {
        display: flex;
        justify-content: center;
        gap: clamp(0.75rem, 3vw, 1.5rem);
        list-style: none;
        margin: 0 0 1.25rem;
        padding: 0;
        font-size: 0.85rem;
        color: var(--oro);
      }
      .tacca {
        opacity: 0.35;
        animation-name: tacca-accesa;
        animation-duration: 1s;
        animation-fill-mode: both;
        animation-timing-function: linear;
        animation-timeline: --rinascita;
        animation-range: contain calc(var(--i) * 100% / var(--n)) contain calc(var(--i) * 100% / var(--n) + 4%);
      }
      /* Telefoni bassi: il testo della tappa 2026 e' lungo, si taglia a
         cinque righe per non sfondare il palco. */
      @media (max-height: 700px) {
        .quadro p {
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }
  }
  @keyframes taglio-passa {
    from { transform: translateX(-25%); }
    to { transform: translateX(25%); }
  }
  @keyframes quadro-passa {
    0% { opacity: 0; transform: translateY(2rem); }
    20% { opacity: 1; transform: none; }
    80% { opacity: 1; transform: none; }
    100% { opacity: 0; transform: translateY(-2rem); }
  }
  @keyframes quadro-resta {
    0% { opacity: 0; transform: translateY(2rem); }
    20%, 100% { opacity: 1; transform: none; }
  }
  @keyframes tacca-accesa {
    from { opacity: 0.35; }
    to { opacity: 1; }
  }
</style>
```

- [ ] **Step 2: innesto in home**

In `src/pages/index.astro`: import e sezione subito dopo la `news-section` (prima della `<Spaccatura inverti />`):

```astro
import Rinascita from "../components/Rinascita.astro";
```

```astro
    </section>

    <Rinascita />

    <Spaccatura inverti />
```

- [ ] **Step 3: verifica nel browser (Chrome, desktop)**

Scorrere fino alla sezione. Attesi: il palco si blocca; i quadri passano nell'ordine 1969 → 2022 → 2024 → 2026, uno solo visibile alla volta; le tacche in basso si accendono in sequenza; il fondo passa da blu a rosso da sinistra a destra; l'ultimo quadro (2026, il double) resta visibile quando il palco si sgancia. In console, a palco agganciato: `getComputedStyle(document.querySelector(".pista")).viewTimelineName` → `"--rinascita"`; `[...document.querySelectorAll(".quadro")].map(q => getComputedStyle(q).opacity)` → un solo valore vicino a 1.

- [ ] **Step 4: verifica ripieghi**

Firefox (o Chrome con `chrome://flags` scroll-driven animations disattivate): i quattro quadri stanno impilati, tutti leggibili, nessuno sticky, niente taglio. Chrome con reduced-motion (DevTools → Rendering → Emulate CSS prefers-reduced-motion): stesso layout impilato. 375x667: palco agganciato, testo della tappa 2026 tagliato a cinque righe senza uscire dallo schermo.

- [ ] **Step 5: build, controllo del CSS compilato, test, commit**

```bash
npm run build && npm test
grep -o "view-timeline-name:[^;}]*" dist/index.html dist/_astro/*.css | sort -u
grep -o "animation-timeline:[^;}]*" dist/index.html dist/_astro/*.css | sort | uniq -c
```

Atteso: compare `view-timeline-name:--rinascita` e almeno tre `animation-timeline:--rinascita`; nessuna riga `animation:` che contenga `--rinascita` o `view()` (sarebbe la fusione del minificatore).

```bash
git add src/components/Rinascita.astro src/pages/index.astro
git commit -m "feat: palco fisso della rinascita 1969-2026 in home"
```

---

### Task 4: Il girone C, tabellone a palette

**Files:**
- Create: `src/data/girone.json`
- Create: `src/lib/palette.ts`
- Create: `tests/palette.test.ts`
- Create: `src/components/TabelloneGirone.astro`
- Modify: `src/pages/index.astro` (import + posizione dopo `<Spaccatura inverti />`)

**Interfaces:**
- Consumes: `src/data/girone.json` `{ nome: string, stagione: string, squadre: string[] }`; `src/data/societa.json` `denominazioneBreve` per riconoscere la riga del Longi.
- Produces: `ALFABETO: string` e `sequenza(target: string, da?: string): string[]` in `src/lib/palette.ts`; componente `<TabelloneGirone />` senza props.

- [ ] **Step 1: dati**

`src/data/girone.json` (ordine alfabetico, fonte: news del 20/08/2026 "Si riparte", a sua volta da Tuttocampo):

```json
{
  "nome": "Il girone C",
  "stagione": "2026/27",
  "squadre": [
    "Ficarra",
    "Fitalese 1981",
    "Fondachelli",
    "Furnari",
    "Lipari I.C.",
    "Longi 1969",
    "Mirto",
    "Patti Calcio",
    "Pro Tonnarella",
    "S.P. Torregrotta",
    "Sfarandina",
    "Tusa"
  ]
}
```

- [ ] **Step 2: test della logica pura (rosso)**

`tests/palette.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ALFABETO, sequenza } from "../src/lib/palette";

describe("sequenza", () => {
  it("dallo spazio alla A: due scatti", () => {
    expect(sequenza("A")).toEqual([" ", "A"]);
  });
  it("target uguale alla partenza: nessuno scatto", () => {
    expect(sequenza(" ")).toEqual([" "]);
    expect(sequenza("C", "C")).toEqual(["C"]);
  });
  it("avanza di uno alla volta", () => {
    expect(sequenza("C", "A")).toEqual(["A", "B", "C"]);
  });
  it("dopo l'ultimo carattere riparte dal primo", () => {
    const ultimo = ALFABETO[ALFABETO.length - 1];
    expect(sequenza("A", ultimo)).toEqual([ultimo, " ", "A"]);
  });
  it("un carattere fuori alfabeto compare subito, senza scorrere", () => {
    expect(sequenza("É")).toEqual(["É"]);
    expect(sequenza("A", "É")).toEqual(["A"]);
  });
  it("finisce sempre sul target e non supera un giro", () => {
    for (const c of ALFABETO) {
      const s = sequenza(c);
      expect(s[s.length - 1]).toBe(c);
      expect(s.length).toBeLessThanOrEqual(ALFABETO.length);
    }
  });
});
```

Run: `npm test`. Atteso: FAIL, `Cannot find module '../src/lib/palette'`.

- [ ] **Step 3: implementazione**

`src/lib/palette.ts`:

```ts
// Tabellone a palette (split-flap): ogni lettera scorre l'alfabeto in avanti
// fino a fermarsi su quella giusta, come i vecchi tabelloni delle stazioni.
// Logica pura, senza DOM: il componente TabelloneGirone la mette in scena.

export const ALFABETO = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.'-";

// Caratteri che una palletta mostra partendo da `da` fino a `target`
// compreso, avanzando di uno nell'alfabeto e ripartendo da capo dopo
// l'ultimo. Un carattere fuori alfabeto (accenti, simboli) non scorre:
// compare subito, da solo.
export function sequenza(target: string, da = " "): string[] {
  const fine = ALFABETO.indexOf(target);
  const inizio = ALFABETO.indexOf(da);
  if (fine === -1 || inizio === -1) return [target];
  const passi = [da];
  let i = inizio;
  while (i !== fine) {
    i = (i + 1) % ALFABETO.length;
    passi.push(ALFABETO[i]);
  }
  return passi;
}
```

Run: `npm test`. Atteso: PASS.

- [ ] **Step 4: componente**

`src/components/TabelloneGirone.astro`:

```astro
---
// Le dodici squadre del girone come tabellone a palette anni '70: quando
// la sezione entra in vista, ogni lettera scorre l'alfabeto e si ferma su
// quella giusta, una riga dopo l'altra. Voce "d'annata" del brand
// (DESIGN.md), nessun parente sul sito gemello (che ha il nastro cinetico).
// Senza JS o con reduced-motion i nomi sono scritti da subito.
import girone from "../data/girone.json";
import societa from "../data/societa.json";

const noi = societa.denominazioneBreve;
const pad = (n: number) => String(n).padStart(2, "0");
---
<section class="girone" aria-labelledby="girone-title">
  <div class="inner">
    <p class="kicker">Stagione {girone.stagione}</p>
    <h2 id="girone-title" class="font-display">{girone.nome}</h2>

    <ol class="tabellone" data-tabellone>
      {girone.squadre.map((squadra, i) => (
        <li class:list={["riga", { noi: squadra === noi }]}>
          <span class="pos font-display" aria-hidden="true">{pad(i + 1)}</span>
          <span class="nome">
            <span class="sr-only">{squadra}</span>
            <span class="lettere font-display" aria-hidden="true">
              {[...squadra.toUpperCase()].map((c) => (
                <span class="palletta" data-target={c}>{c}</span>
              ))}
            </span>
          </span>
        </li>
      ))}
    </ol>

    <p class="rimando"><a href="/stagione">Classifica e risultati</a></p>
  </div>
</section>

<style>
  .girone {
    padding: clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2.5rem);
  }
  .inner {
    max-width: 1100px;
    margin: 0 auto;
  }
  .kicker {
    color: var(--oro);
    font-size: 0.85rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin: 0 0 0.35rem;
  }
  .girone h2 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    margin: 0 0 1.5rem;
  }
  .tabellone {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.4rem 2.5rem;
  }
  @media (min-width: 720px) {
    .tabellone {
      grid-template-columns: 1fr 1fr;
    }
  }
  .riga {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0;
    border-bottom: 1px solid color-mix(in oklch, var(--oro) 18%, transparent);
  }
  .pos {
    color: var(--oro);
    font-size: 0.95rem;
    min-width: 2ch;
    font-variant-numeric: tabular-nums;
  }
  .lettere {
    display: inline-flex;
    gap: 2px;
    white-space: nowrap;
    font-size: clamp(1rem, 2.6vw, 1.45rem);
    line-height: 1.4;
  }
  /* Ogni palletta e' una targhetta scura con la cerniera orizzontale al
     centro, come le palette vere. Larghezza fissa: le lettere che scorrono
     non devono far ballare la riga. */
  .palletta {
    display: inline-block;
    min-width: 0.78em;
    text-align: center;
    padding: 0 0.06em;
    border-radius: 2px;
    background: linear-gradient(
      to bottom,
      var(--surface) 0 48%,
      var(--bg) 48% 52%,
      var(--surface) 52% 100%
    );
  }
  .riga.noi .palletta {
    color: var(--bg);
    background: linear-gradient(
      to bottom,
      var(--oro) 0 48%,
      color-mix(in oklch, var(--oro) 70%, var(--bg)) 48% 52%,
      var(--oro) 52% 100%
    );
  }
  .riga.noi .pos {
    color: var(--text);
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .rimando {
    margin: 1.5rem 0 0;
  }
  .rimando a {
    color: var(--oro);
    text-decoration: none;
  }
  .rimando a:hover,
  .rimando a:focus-visible {
    text-decoration: underline;
  }
</style>

<script>
  import { sequenza } from "../lib/palette";

  const tabellone = document.querySelector<HTMLElement>("[data-tabellone]");
  if (tabellone && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const righe = [...tabellone.querySelectorAll<HTMLElement>(".riga")];

    // Una riga alla volta: un solo timer per riga fa scorrere tutte le sue
    // pallette insieme; ognuna si ferma quando arriva alla sua lettera.
    const gira = (riga: HTMLElement) => {
      const pallette = [...riga.querySelectorAll<HTMLElement>(".palletta")].map((el) => ({
        el,
        passi: sequenza(el.dataset.target ?? " "),
      }));
      let k = 0;
      const timer = setInterval(() => {
        let vive = false;
        for (const { el, passi } of pallette) {
          if (k < passi.length) {
            el.textContent = passi[k];
            vive = true;
          }
        }
        if (!vive) clearInterval(timer);
        k++;
      }, 45);
    };

    // Pallette in bianco SOLO a script attivo: senza JS i nomi restano
    // leggibili da subito (stesso principio del coro in storia.astro).
    for (const p of tabellone.querySelectorAll<HTMLElement>(".palletta")) p.textContent = " ";

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        righe.forEach((riga, i) => setTimeout(() => gira(riga), i * 120));
      },
      { threshold: 0.25 }
    );
    io.observe(tabellone);
  }
</script>
```

Nota sullo spazio: lo script scrive ` ` (spazio non separabile) al posto dello spazio vuoto, altrimenti una `inline-block` con solo uno spazio normale collassa. La `sequenza` produce `" "` per gli spazi dei nomi (es. "PATTI CALCIO"): a fine corsa la palletta dello spazio mostra `" "` e la `min-width` tiene la distanza.

- [ ] **Step 5: innesto in home**

In `src/pages/index.astro`: import e sezione subito dopo `<Spaccatura inverti />`:

```astro
import TabelloneGirone from "../components/TabelloneGirone.astro";
```

```astro
    <Spaccatura inverti />

    <TabelloneGirone />
```

- [ ] **Step 6: verifica nel browser**

Desktop: due colonne di sei righe; scorrendo fino al tabellone le lettere scorrono e si fermano, una riga dopo l'altra, tutto entro circa 3 secondi; la riga "06 LONGI 1969" ha pallette d'oro. In console a fine corsa: `[...document.querySelectorAll(".riga")].map(r => [...r.querySelectorAll(".palletta")].map(p => p.textContent).join(""))` → i 12 nomi in maiuscolo, identici a `girone.json`. 375px: una colonna, "S.P. TORREGROTTA" sta su una riga senza scroll orizzontale (`document.documentElement.scrollWidth === innerWidth`). Lettore di schermo: i nomi sono nel `.sr-only`, le pallette sono `aria-hidden`.

- [ ] **Step 7: build, test, commit**

```bash
npm run build && npm test
git add src/data/girone.json src/lib/palette.ts tests/palette.test.ts src/components/TabelloneGirone.astro src/pages/index.astro
git commit -m "feat: tabellone a palette del girone C in home"
```

---

### Task 5: Le news entrano sfalsate con taglio diagonale

**Files:**
- Modify: `src/components/NewsCard.astro` (attributo `data-reveal` sulla radice)
- Modify: `src/pages/index.astro` (stile scoped della `news-grid`)

**Interfaces:**
- Consumes: lo script generico di `Base.astro` che marca `main [data-reveal]` con `reveal-js`/`reveal-on` nei browser senza `animation-timeline`.
- Produces: niente di programmatico. Su `/news` l'attributo è innocuo: nessuno stile `.news-card.reveal-js` esiste lì, quindi le card restano visibili.

- [ ] **Step 1: attributo sulla card**

In `src/components/NewsCard.astro`, sulla radice:

```astro
<a href={`/news/${post.id}/`} class="news-card" class:list={{ "no-cover": !cover }} data-reveal>
```

- [ ] **Step 2: stagger in home**

In `src/pages/index.astro`, nello `<style>`, dopo le regole `.news-grid`:

```css
  /* Le tre card entrano una dopo l'altra col taglio obliquo dello scudo,
     legate allo scroll: lo sfalsamento e' dato da tre finestre diverse
     della stessa corsa. Si anima SOLO opacity e clip-path: il transform
     resta libero per il sollevamento su hover della card.
     SOLO proprieta' animation-* estese (vincolo del minificatore). */
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .news-grid > :global(.news-card) {
        animation-name: notizia-entra;
        animation-duration: 1s;
        animation-fill-mode: both;
        animation-timing-function: var(--ease-out-quart);
        animation-timeline: view();
        animation-range: entry 0% entry 70%;
      }
      .news-grid > :global(.news-card:nth-child(2)) {
        animation-range: entry 15% entry 85%;
      }
      .news-grid > :global(.news-card:nth-child(3)) {
        animation-range: entry 30% entry 100%;
      }
    }
  }
  @keyframes notizia-entra {
    from {
      opacity: 0;
      clip-path: polygon(-5% -10%, 12% -10%, -8% 110%, -5% 110%);
    }
    to {
      opacity: 1;
      clip-path: polygon(-5% -10%, 130% -10%, 115% 110%, -5% 110%);
    }
  }
  /* Ripiego senza animation-timeline (script in Base.astro). */
  .news-grid > :global(.news-card.reveal-js) {
    opacity: 0;
    clip-path: polygon(-5% -10%, 12% -10%, -8% 110%, -5% 110%);
    transition: opacity 0.9s var(--ease-out-quart), clip-path 0.9s var(--ease-out-quart);
  }
  .news-grid > :global(.news-card:nth-child(2).reveal-js) { transition-delay: 0.12s; }
  .news-grid > :global(.news-card:nth-child(3).reveal-js) { transition-delay: 0.24s; }
  .news-grid > :global(.news-card.reveal-on) {
    opacity: 1;
    clip-path: polygon(-5% -10%, 130% -10%, 115% 110%, -5% 110%);
  }
```

- [ ] **Step 3: verifica nel browser**

Home desktop: scendendo verso le notizie, la prima card si rivela per prima, la terza per ultima, con la lama obliqua. A entrata finita, passando col mouse la card si solleva ancora di 2px (`getComputedStyle(card).transform` cambia su hover). `/news`: le card sono visibili al caricamento, nessun effetto. Reduced-motion: card visibili da subito.

- [ ] **Step 4: build, test, commit**

```bash
npm run build && npm test
git add src/components/NewsCard.astro src/pages/index.astro
git commit -m "feat: le news in home entrano sfalsate con taglio diagonale"
```

---

### Task 6: Freccia "scorri" nell'hero

**Files:**
- Modify: `src/components/Hero.astro`

**Interfaces:**
- Consumes: lo script esistente dell'hero (`setup()`, `draw()`, variabile `target`).
- Produces: niente di programmatico. Il primo frame del leone è quasi nero: chi apre il sito vede una schermata scura e non sa che deve scorrere. La freccia compare quando il canvas è pronto e sparisce dopo i primi frame.

- [ ] **Step 1: markup**

In `src/components/Hero.astro`, dentro `.stage`, dopo `</div>` dell'overlay:

```astro
    <p class="scorri font-display" id="hero-scorri" aria-hidden="true">
      Scorri
      <span class="freccia"></span>
    </p>
```

- [ ] **Step 2: stile**

Nel blocco `<style>` dell'hero, prima della regola `@media (prefers-reduced-motion: reduce)`:

```css
  .scorri { position: absolute; inset: auto 0 5vh 0; margin: 0; text-align: center; color: var(--oro); font-size: 0.8rem; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0; transition: opacity 0.5s var(--ease-out-quart); pointer-events: none; max-width: none; }
  .scorri.on { opacity: 1; }
  .freccia { display: block; width: 0.75rem; height: 0.75rem; margin: 0.5rem auto 0; border-right: 2px solid var(--oro); border-bottom: 2px solid var(--oro); animation-name: freccia-batte; animation-duration: 1.6s; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
  @keyframes freccia-batte { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(0.4rem) rotate(45deg); } }
```

e nella regola reduced-motion esistente aggiungere `.scorri { display: none; }`:

```css
  @media (prefers-reduced-motion: reduce) { .hero { height: 100vh; } .overlay { opacity: 1; transform: none; } .scorri { display: none; } }
```

- [ ] **Step 3: script**

Nello script dell'hero, dopo `const overlay = document.getElementById("hero-overlay")!;`:

```ts
  const scorri = document.getElementById("hero-scorri")!;
```

Dopo `fallback.style.display = "none";` (canvas pronto):

```ts
    scorri.classList.add("on");
```

In `draw()`, subito dopo la riga `overlay.classList.toggle("on", target >= count - 2);`:

```ts
      scorri.classList.toggle("on", target < 4);
```

- [ ] **Step 4: verifica nel browser**

Home appena caricata (Chrome, motion normale): "SCORRI" con la freccia che batte in basso, in oro. Dopo un paio di tacche di rotellina sparisce. Reduced-motion: mai visibile. `document.getElementById("hero-scorri").classList.contains("on")` → `true` a scroll 0, `false` a scroll 400.

- [ ] **Step 5: build, test, commit**

```bash
npm run build && npm test
git add src/components/Hero.astro
git commit -m "feat: freccia scorri nell'hero, sparisce dopo i primi frame"
```

---

### Task 7: Il Muro rossoblù anche in home

**Files:**
- Create: `src/lib/rosa.ts`
- Create: `tests/rosa.test.ts`
- Modify: `src/pages/squadra.astro` (usa `RUOLI` e `ordinaRosa` dalla lib)
- Modify: `src/pages/index.astro` (sezione "La rosa" + `PlayerDialog`)

**Interfaces:**
- Consumes: collezione `giocatori` (`nome`, `ruolo`, `numero?`, `foto?`), componenti `MuroRosa` (prop `players`) e `PlayerDialog` (un solo `<dialog>` per pagina, delega il click su `[data-player]`).
- Produces: `RUOLI` (tupla dei quattro ruoli in ordine) e `ordinaRosa<T extends { data: { ruolo: Ruolo; numero?: number } }>(giocatori: T[]): T[]` in `src/lib/rosa.ts`. L'ordinamento oggi vive in `squadra.astro`: si sposta nella lib perché serve anche alla home, e la lib è testabile.

- [ ] **Step 1: test (rosso)**

`tests/rosa.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ordinaRosa, RUOLI } from "../src/lib/rosa";

const g = (nome: string, ruolo: (typeof RUOLI)[number], numero?: number) => ({ data: { nome, ruolo, numero } });

describe("ordinaRosa", () => {
  it("ordina per ruolo: portieri, difensori, centrocampisti, attaccanti", () => {
    const rosa = [g("A", "Attaccante"), g("C", "Centrocampista"), g("P", "Portiere"), g("D", "Difensore")];
    expect(ordinaRosa(rosa).map((x) => x.data.nome)).toEqual(["P", "D", "C", "A"]);
  });
  it("a parita' di ruolo ordina per numero, chi non ha numero va in fondo", () => {
    const rosa = [g("senza", "Difensore"), g("dieci", "Difensore", 10), g("due", "Difensore", 2)];
    expect(ordinaRosa(rosa).map((x) => x.data.nome)).toEqual(["due", "dieci", "senza"]);
  });
  it("non modifica l'array di partenza", () => {
    const rosa = [g("A", "Attaccante"), g("P", "Portiere")];
    ordinaRosa(rosa);
    expect(rosa[0].data.nome).toBe("A");
  });
});
```

Run: `npm test`. Atteso: FAIL, `Cannot find module '../src/lib/rosa'`.

- [ ] **Step 2: lib**

`src/lib/rosa.ts`:

```ts
// Ordine della rosa condiviso da /squadra e dalla home: per ruolo (dal
// portiere all'attaccante), poi per numero di maglia; chi non ha ancora un
// numero va in fondo al suo ruolo.
export const RUOLI = ["Portiere", "Difensore", "Centrocampista", "Attaccante"] as const;
export type Ruolo = (typeof RUOLI)[number];

export function ordinaRosa<T extends { data: { ruolo: Ruolo; numero?: number } }>(giocatori: T[]): T[] {
  return [...giocatori].sort(
    (a, b) =>
      RUOLI.indexOf(a.data.ruolo) - RUOLI.indexOf(b.data.ruolo) ||
      (a.data.numero ?? 999) - (b.data.numero ?? 999)
  );
}
```

Run: `npm test`. Atteso: PASS.

- [ ] **Step 3: squadra.astro usa la lib**

Sostituire in cima a `src/pages/squadra.astro`:

```ts
const ROLE_ORDER = ["Portiere", "Difensore", "Centrocampista", "Attaccante"] as const;
const ROLE_LABELS: Record<(typeof ROLE_ORDER)[number], string> = {
```

con:

```ts
import { RUOLI, ordinaRosa } from "../lib/rosa";

const ROLE_LABELS: Record<(typeof RUOLI)[number], string> = {
```

`const gruppi = ROLE_ORDER.map(` diventa `const gruppi = RUOLI.map(`. Il blocco `rosaOrdinata` (dal commento "Il muro rossoblu' mostra..." fino alla chiusura `);`) diventa:

```ts
// Il muro rossoblu' mostra tutta la rosa in ordine di ruolo e numero: e' il
// colpo d'occhio. La griglia raggruppata sotto resta la consultazione vera.
const rosaOrdinata = ordinaRosa(giocatori);
```

- [ ] **Step 4: sezione in home**

In `src/pages/index.astro`, import:

```astro
import MuroRosa from "../components/MuroRosa.astro";
import PlayerDialog from "../components/PlayerDialog.astro";
import { ordinaRosa } from "../lib/rosa";
```

nel frontmatter, dopo `const news = ...`:

```ts
const rosa = ordinaRosa(await getCollection("giocatori"));
```

nel markup, dopo `<TabelloneGirone />` e prima dell'ultima `<Spaccatura />`:

```astro
    {rosa.length > 0 && (
      <section class="rosa-home" aria-labelledby="rosa-title">
        <div class="section-inner">
          <h2 id="rosa-title" class="font-display">La rosa</h2>
        </div>
        <MuroRosa players={rosa} />
        <div class="section-inner">
          <p class="all-news"><a href="/squadra">Tutta la squadra e lo staff</a></p>
        </div>
      </section>
    )}
```

e in fondo a `<main>`, dopo `<SponsorStrip />`:

```astro
    <PlayerDialog />
```

Stile (nello `<style>` di index.astro):

```css
  .rosa-home {
    padding: clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2.5rem) clamp(2rem, 6vw, 4rem);
  }
  .rosa-home h2 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    margin: 0 0 0.5rem;
  }
```

- [ ] **Step 5: verifica nel browser**

Home desktop: sotto il tabellone, quattro lastre inclinate; hover allarga la lastra e mostra la sagoma a colori; click apre la scheda (dialog) e Esc la chiude. 375px: quattro bande alte 3.4rem (fix del Task 1), tocco apre la scheda. `/squadra` identica a prima (stesso ordine).

- [ ] **Step 6: build, test, commit**

```bash
npm run build && npm test
git add src/lib/rosa.ts tests/rosa.test.ts src/pages/squadra.astro src/pages/index.astro
git commit -m "feat: muro rossoblu' della rosa anche in home, ordinamento condiviso"
```

---

### Task 8: Pannello e documentazione

**Files:**
- Modify: `public/admin/config.yml` (due file nella collezione `impostazioni`)
- Modify: `docs/GUIDA-PANNELLO.md` (due voci)
- Modify: `DESIGN.md` (momenti overdrive, componenti)
- Modify: `docs/RICHIESTE-SOCIETA.md` (nota sul segnaposto in home)

- [ ] **Step 1: config.yml**

Nella collezione `impostazioni`, dopo il file `storia`, aggiungere:

```yaml
      - name: "stagione"
        label: "Conto alla rovescia al debutto"
        file: "src/data/stagione.json"
        description: "Il riquadro rosso in home che conta i giorni alla prima giornata. Si spegne da solo quando il giorno arriva."
        fields:
          - label: "Giorno del debutto"
            name: "debutto"
            widget: "datetime"
            hint: "Il giorno della prima partita di campionato. Se l'orario non si conosce, lascia mezzanotte: il conto e' ai giorni."
          - { label: "Titolo", name: "titolo", widget: "string" }
          - { label: "Sottotitolo", name: "sottotitolo", widget: "text", hint: "Una riga sotto i numeri: girone, avversario se noto, dove si gioca." }

      - name: "girone"
        label: "Il girone"
        file: "src/data/girone.json"
        description: "Le squadre del girone mostrate sul tabellone in home. Si aggiorna a ogni nuova stagione."
        fields:
          - { label: "Titolo", name: "nome", widget: "string", hint: "Per esempio: Il girone C." }
          - { label: "Stagione", name: "stagione", widget: "string", hint: "Per esempio: 2026/27." }
          - label: "Squadre"
            name: "squadre"
            widget: "list"
            field: { label: "Squadra", name: "squadra", widget: "string" }
            hint: "Una per riga, nell'ordine in cui devono comparire. Scrivi il Longi con lo stesso nome breve dei Dati della societa', cosi' la sua riga viene evidenziata in oro."
```

Verifica: `npm run dev`, aprire `/admin`: la barra laterale mostra le due voci nuove sotto "Dati della società"; aprendo "Il girone" si vedono le 12 squadre. (Il salvataggio passa da GitHub: non serve provarlo qui.)

- [ ] **Step 2: GUIDA-PANNELLO.md**

Prima della sezione `## Cose da sapere` aggiungere:

```markdown
## Il conto alla rovescia in home

**Dati della società → Conto alla rovescia al debutto**.

È il riquadro rosso in home che conta giorni, ore e minuti alla prima
partita di campionato. Basta mettere il **giorno del debutto**: se l'orario
non si conosce lascia mezzanotte, il conto è ai giorni. Quando il giorno
arriva il riquadro sparisce da solo, non c'è niente da spegnere. Alla
stagione successiva si rimette la data nuova e torna.

## Il girone in home

**Dati della società → Il girone**.

Il tabellone in home con tutte le squadre del girone. Le squadre si
scrivono una per riga, nell'ordine in cui devono comparire (di solito
alfabetico). La riga del Longi si colora d'oro da sola, purché il nome sia
scritto come il **Nome breve** nei Dati della società (oggi "Longi 1969").
Da aggiornare a ogni nuova stagione, quando esce la composizione del girone.

---
```

- [ ] **Step 3: DESIGN.md**

Nella sezione `## Momenti overdrive`, sostituire la prima frase ("Tre, non di più, stesso principio del sito gemello: pochi momenti di spettacolo, il resto veloce e sobrio per farli risaltare.") con:

```markdown
Fino al 06/09/2026 la regola era "tre, non di più". Su richiesta del
cliente la home è diventata un percorso continuo: la regola nuova è **un
solo effetto per schermata**, tutto legato allo scroll, niente animazioni
che girano da sole (eccetto spie e frecce di servizio). I tre momenti
originali restano quelli principali; i momenti della home (sotto) li
accompagnano senza sovrapporsi.
```

Dopo l'elenco dei tre momenti, aggiungere:

```markdown
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
```

Nella sezione `## Componenti chiave`, aggiungere tre righe:

```markdown
- **Debutto**: conto alla rovescia alla prima giornata (dati in
  `src/data/stagione.json`, logica in `src/lib/debutto.ts`).
- **Rinascita**: palco sticky delle tappe di `storia.json` (solo anni a
  quattro cifre).
- **TabelloneGirone**: tabellone a palette delle squadre del girone (dati in
  `src/data/girone.json`, logica in `src/lib/palette.ts`).
```

- [ ] **Step 4: RICHIESTE-SOCIETA.md**

Nella tabella §3, riga "Elenco giocatori completo", aggiungere in fondo alla colonna Note: `Dal 06/09/2026 il muro della rosa compare anche in home: il segnaposto "Mario Rossi" si vede quindi anche lì, va cancellato dal pannello appena arriva la rosa vera.`

- [ ] **Step 5: build, commit**

```bash
npm run build && npm test
git add public/admin/config.yml docs/GUIDA-PANNELLO.md DESIGN.md docs/RICHIESTE-SOCIETA.md
git commit -m "docs: pannello e design per le sezioni nuove della home"
```

---

### Task 9: QA finale della home

**Files:** nessuna modifica prevista; eventuali fix sono commit separati con messaggio `fix:`.

- [ ] **Step 1: ordine e contenuto del DOM**

`npm run build`, poi:

```bash
grep -o 'class="[a-z-]*"' dist/index.html | grep -E 'hero|diretta|debutto|match-strip|spaccatura|news-section|rinascita|girone|rosa-home|sponsor-strip' | head -20
```

Atteso (nell'ordine): `hero`, `debutto`, `match-strip`, `spaccatura`, `news-section`, `rinascita`, `spaccatura inverti` (compare come `spaccatura`), `girone`, `rosa-home`, `spaccatura`, `sponsor-strip`. `diretta` assente (spenta nel pannello).

- [ ] **Step 2: trappola del minificatore su ENTRAMBI html e css**

```bash
grep -oE "animation:[^;}]*(view\(|--rinascita)" dist/index.html dist/_astro/*.css
```

Atteso: nessun risultato. Poi:

```bash
grep -oE "animation-timeline:[^;}]*" dist/index.html dist/_astro/*.css | sort | uniq -c
```

Atteso: voci `view()` (h2 globale, Spaccatura, NextMatch, Debutto, news) e `--rinascita` (taglio, quadro, tacca).

- [ ] **Step 3: zero richieste esterne**

Chrome, home, DevTools → Network, ricaricare senza aver dato consenso: nessuna richiesta verso host diversi dal sito (Tuttocampo compare solo dopo il consenso, come prima).

- [ ] **Step 4: mobile**

375x812 e 375x667: tutta la home senza scroll orizzontale (`document.documentElement.scrollWidth === innerWidth` in ogni sezione); palco della Rinascita leggibile a 667px di altezza; tabellone su una colonna; muro a bande; conto alla rovescia su una riga (tre blocchi).

- [ ] **Step 5: reduced-motion e Firefox**

Chrome con reduced-motion emulato: hero fermo sul frame finale, nessuna freccia, Debutto e news visibili subito, Rinascita impilata, tabellone con i nomi scritti, muro senza transizioni. Firefox: stessa resa della Rinascita impilata; news e Debutto entrano via IntersectionObserver.

- [ ] **Step 6: Lighthouse mobile**

Chrome DevTools → Lighthouse → Mobile, sulla home in `npm run preview`. Criterio: Performance ≥ 90. Se scende sotto, il primo sospetto è il costo di layout della pista alta (`(n+1) * 100vh`): non tocca il LCP (l'hero) ma va verificato nel pannello Performance che lo scroll resti a 60fps sul palco.

- [ ] **Step 7: pubblicazione**

`git push` su `main` (deploy automatico Netlify). Controllare fclongi.netlify.app entro 2 minuti: home nuova, `/squadra` da telefono col muro visibile e la card centrata.

---

## Autoverifica del piano

**Copertura della richiesta.** "Riempire la home": Task 2, 3, 4, 7 (quattro sezioni nuove, tre delle quali con dati verificati e una col muro). "Il meno statico possibile": ogni sezione nuova è legata allo scroll o al tempo; le news (Task 5) e l'hero (Task 6) guadagnano movimento. "Più immersiva": il palco sticky (Task 3) è il momento di immersione vero, il tabellone (Task 4) è il momento di carattere. "Lista giocatori non centrata da mobile": Task 1, con la scoperta aggiuntiva del muro invisibile.

**Segnaposto.** Nessun "TBD"; ogni step ha codice o comando con risultato atteso. Le verifiche visive hanno un controllo in console con valore atteso.

**Coerenza dei nomi.** `spezzaTempo`/`debuttoPassato` (Task 2, usati nel componente e nei test); `sequenza`/`ALFABETO` (Task 4); `RUOLI`/`ordinaRosa` (Task 7, usati in `squadra.astro` e `index.astro`); `--rinascita` (view-timeline e animation-timeline, Task 3 e QA); `data-reveal` (NewsCard, Debutto: lo script di `Base.astro` li marca entrambi).

**Rischi noti da tenere d'occhio in esecuzione.**
- `animation-range: contain calc(var(--i) * 100% / var(--n))`: percentuali in `calc()` con custom property. Se un browser le rifiuta, ripiego: generare in Astro le percentuali già calcolate (`style={`--da:${i*100/n}%; --a:${(i+1)*100/n}%`}`) e usare `animation-range: contain var(--da) contain var(--a)`.
- `DirettaLive` attiva nei giorni prima del debutto: due riquadri con conto alla rovescia uno sopra l'altro. Accettato (caso di pochi giorni, una volta a stagione); se disturba, `Debutto.astro` può leggere `diretta.json` e cedere il passo con `mostra = !diretta.attiva && ...`.
- Segnaposto "Mario Rossi" visibile in home dal Task 7: decisione dell'utente (vedi premesse).
