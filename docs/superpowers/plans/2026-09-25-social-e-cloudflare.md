# Social al posto delle news + pronti per Cloudflare — piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** sui siti Longi 1969 e Città di Galati le news spariscono e al loro posto arrivano i post social incollati come link nel pannello; in più entrambi i repo diventano pronti per Cloudflare Pages senza rompere Netlify.

**Architecture:** una funzione pura (`src/lib/social.ts`) trasforma il link in indirizzo del riquadro ufficiale (Instagram/Facebook/TikTok), un componente (`SocialPost.astro`) lo mostra dentro `EmbedConsenso` (consenso privacy già esistente). La logica di accesso al pannello passa in `oauth/*.mjs`, condivisa da due contenitori sottili: `netlify/functions/` (oggi) e `functions/` (Cloudflare Pages). Redirect e header passano da `netlify.toml` a `public/_redirects` e `public/_headers`, formato letto da entrambi gli host.

**Tech Stack:** Astro 5 (content collections con `glob`), Decap/Sveltia CMS (`public/admin/config.yml`), vitest 4, Netlify Functions v2, Cloudflare Pages Functions.

**Spec:** `docs/superpowers/specs/2026-09-25-social-design.md` (repo Longi).

**Repo:**
- LONGI = `C:\Users\tigno\Desktop\longi-1969`
- GALATI = `C:\Users\tigno\Desktop\città di galati`

## Global Constraints

- Piattaforme: solo Instagram, Facebook, TikTok (niente YouTube).
- Nessun riquadro esterno entra nel DOM senza consenso: sempre `EmbedConsenso`.
- Un link sbagliato non deve MAI far fallire `npm run build`.
- Date nelle etichette con `timeZone: "Europe/Rome"` (i build girano in UTC).
- CSS: solo proprietà `animation-*` estese, mai lo shorthand `animation` insieme a `animation-timeline` (vincolo del minificatore, vedi memoria progetto).
- Regola DESIGN.md Longi: un effetto per schermata.
- Messaggi di commit in italiano, formato `tipo: descrizione`, con riga `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Niente push: tutto resta in locale fino al trasloco (ogni deploy Netlify costa 15 crediti).
- `.playwright-cli/` non va committato.

---

## Parte A — Longi

### Task 1: dal link al riquadro (`src/lib/social.ts`)

**Files:**
- Create: `LONGI/src/lib/social.ts`
- Test: `LONGI/tests/social.test.ts`

**Interfaces:**
- Produces:
  - `type Piattaforma = "instagram" | "facebook" | "tiktok"`
  - `type Post = { piattaforma: Piattaforma | "altro"; link: string; src: string | null }`
  - `riconosci(link: string): Post`
  - `eCorto(link: string): boolean`
  - `risolvi(link: string, fetchFn?: typeof fetch): Promise<string>`
  - `preparaPost(link: string, fetchFn?: typeof fetch): Promise<Post>` (con cache per link)
  - `ALTEZZA: Record<Piattaforma, number>` (px del riquadro)
  - `NOME: Record<Piattaforma | "altro", string>` (nome leggibile)

- [ ] **Step 1: test che falliscono** — `tests/social.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { riconosci, eCorto, risolvi, preparaPost } from "../src/lib/social";

const IG = "https://www.instagram.com/p/DAbc12_-xY/embed/captioned/";

describe("riconosci: Instagram", () => {
  it("post con parametro dell'app", () => {
    expect(riconosci("https://www.instagram.com/p/DAbc12_-xY/?igsh=MTZ4").src).toBe(IG);
  });
  it("reel diventa lo stesso riquadro /p/", () => {
    expect(riconosci("https://www.instagram.com/reel/DAbc12_-xY/").src).toBe(IG);
  });
  it("link col nome utente davanti", () => {
    expect(riconosci("https://instagram.com/longi1969/p/DAbc12_-xY/").src).toBe(IG);
  });
  it("profilo senza post: niente riquadro", () => {
    const p = riconosci("https://www.instagram.com/longi1969/");
    expect(p).toEqual({ piattaforma: "instagram", link: "https://www.instagram.com/longi1969/", src: null });
  });
});

describe("riconosci: TikTok", () => {
  it("video completo", () => {
    expect(riconosci("https://www.tiktok.com/@tifoso/video/7412345678901234567?lang=it").src)
      .toBe("https://www.tiktok.com/embed/v2/7412345678901234567");
  });
  it("link corto: piattaforma nota, riquadro no", () => {
    expect(riconosci("https://vm.tiktok.com/ZMabc123/")).toMatchObject({ piattaforma: "tiktok", src: null });
  });
});

describe("riconosci: Facebook", () => {
  const post = "https://www.facebook.com/longi1969/posts/pfbid02abc";
  it("post", () => {
    expect(riconosci(post).src).toBe(
      `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(post)}&show_text=true&width=500`
    );
  });
  it("permalink.php e' un post", () => {
    expect(riconosci("https://m.facebook.com/permalink.php?story_fbid=1&id=2").src)
      .toContain("/plugins/post.php?href=");
  });
  it.each([
    "https://www.facebook.com/longi1969/videos/123456/",
    "https://www.facebook.com/reel/123456",
    "https://www.facebook.com/watch/?v=123456",
  ])("video: %s", (link) => {
    expect(riconosci(link).src).toContain("/plugins/video.php?href=");
  });
  it("post nei gruppi: non incorporabile", () => {
    expect(riconosci("https://www.facebook.com/groups/99/posts/1/").src).toBeNull();
  });
  it("link di condivisione: si risolve prima, qui niente riquadro", () => {
    expect(riconosci("https://www.facebook.com/share/p/1AbCdE/")).toMatchObject({ piattaforma: "facebook", src: null });
  });
});

describe("riconosci: il resto", () => {
  it("testo che non e' un indirizzo", () => {
    expect(riconosci("ciao")).toEqual({ piattaforma: "altro", link: "ciao", src: null });
  });
  it("piattaforma non gestita", () => {
    expect(riconosci("https://youtu.be/abc").piattaforma).toBe("altro");
  });
});

describe("eCorto", () => {
  it.each([
    ["https://vm.tiktok.com/ZMabc/", true],
    ["https://vt.tiktok.com/ZSabc/", true],
    ["https://fb.watch/abc/", true],
    ["https://www.facebook.com/share/p/1AbC/", true],
    ["https://www.facebook.com/share/r/1AbC/", true],
    ["https://www.facebook.com/longi1969/posts/1", false],
    ["https://www.instagram.com/p/X/", false],
    ["non un link", false],
  ])("%s -> %s", (link, atteso) => {
    expect(eCorto(link)).toBe(atteso);
  });
});

const redirect = (location: string | null) =>
  new Response(null, { status: location ? 301 : 200, headers: location ? { location } : {} });

describe("risolvi", () => {
  it("segue i redirect finche' il link non e' piu' corto", async () => {
    const f = vi.fn()
      .mockResolvedValueOnce(redirect("https://www.tiktok.com/@a/video/7412345678901234567?x=1"));
    expect(await risolvi("https://vm.tiktok.com/ZMabc/", f as unknown as typeof fetch))
      .toBe("https://www.tiktok.com/@a/video/7412345678901234567?x=1");
    expect(f).toHaveBeenCalledTimes(1);
  });
  it("location relativa", async () => {
    const f = vi.fn().mockResolvedValueOnce(redirect("/longi1969/posts/pfbid1"));
    expect(await risolvi("https://www.facebook.com/share/p/1Ab/", f as unknown as typeof fetch))
      .toBe("https://www.facebook.com/longi1969/posts/pfbid1");
  });
  it("link non corto: nessuna richiesta", async () => {
    const f = vi.fn();
    expect(await risolvi("https://www.instagram.com/p/X/", f as unknown as typeof fetch)).toBe("https://www.instagram.com/p/X/");
    expect(f).not.toHaveBeenCalled();
  });
  it("rete giu': resta il link originale", async () => {
    const f = vi.fn().mockRejectedValue(new Error("rete"));
    expect(await risolvi("https://vm.tiktok.com/ZMabc/", f as unknown as typeof fetch)).toBe("https://vm.tiktok.com/ZMabc/");
  });
  it("rimandato al login: resta il link originale", async () => {
    const f = vi.fn().mockResolvedValueOnce(redirect("https://www.facebook.com/login/?next=x"));
    expect(await risolvi("https://www.facebook.com/share/p/1Ab/", f as unknown as typeof fetch))
      .toBe("https://www.facebook.com/share/p/1Ab/");
  });
  it("si ferma dopo 4 salti", async () => {
    const f = vi.fn().mockResolvedValue(redirect("https://vm.tiktok.com/ZMancora/"));
    await risolvi("https://vm.tiktok.com/ZMabc/", f as unknown as typeof fetch);
    expect(f).toHaveBeenCalledTimes(4);
  });
});

describe("preparaPost", () => {
  it("risolve e riconosce, tenendo il link incollato", async () => {
    const f = vi.fn().mockResolvedValueOnce(redirect("https://www.tiktok.com/@a/video/7400000000000000001"));
    expect(await preparaPost("https://vm.tiktok.com/ZMprep/", f as unknown as typeof fetch)).toEqual({
      piattaforma: "tiktok",
      link: "https://vm.tiktok.com/ZMprep/",
      src: "https://www.tiktok.com/embed/v2/7400000000000000001",
    });
  });
});
```

- [ ] **Step 2: verifica che falliscano**

Run (in LONGI): `npx vitest run tests/social.test.ts`
Expected: FAIL, `Failed to resolve import "../src/lib/social"`.

- [ ] **Step 3: implementazione** — `src/lib/social.ts`:

```ts
// Dal link di un post social al riquadro ufficiale da incorporare.
//
// Perche' esiste: chi gestisce il sito incolla nel pannello il link di un
// post fatto da chiunque (club, giocatori, tifosi). Il sito deve capire da
// solo di che piattaforma si tratta e quale indirizzo di incorporamento
// usare, senza chiavi o account sviluppatore. Un link che non si riesce a
// trasformare non rompe nulla: diventa una semplice scheda "Apri il post".

export type Piattaforma = "instagram" | "facebook" | "tiktok";
export type Post = { piattaforma: Piattaforma | "altro"; link: string; src: string | null };

// Altezze fisse dei riquadri: gli iframe non si adattano da soli al
// contenuto. Tarate sui riquadri reali a larghezza colonna (~370px).
export const ALTEZZA: Record<Piattaforma, number> = { instagram: 720, facebook: 620, tiktok: 760 };

export const NOME: Record<Piattaforma | "altro", string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  altro: "social",
};

const dominio = (u: URL) => u.hostname.replace(/^(www|m|mobile|web)\./, "");

const plugin = (tipo: "post" | "video", link: string) =>
  `https://www.facebook.com/plugins/${tipo}.php?href=${encodeURIComponent(link)}&show_text=true&width=500`;

export function riconosci(link: string): Post {
  let u: URL;
  try {
    u = new URL(link.trim());
  } catch {
    return { piattaforma: "altro", link, src: null };
  }
  const h = dominio(u);

  if (h === "instagram.com") {
    // /p/, /reel/, /tv/ usano lo stesso codice: il riquadro /p/ li mostra tutti.
    const m = u.pathname.match(/\/(?:p|reels?|tv)\/([A-Za-z0-9_-]+)/);
    return { piattaforma: "instagram", link, src: m ? `https://www.instagram.com/p/${m[1]}/embed/captioned/` : null };
  }

  if (h === "tiktok.com") {
    const m = u.pathname.match(/\/video\/(\d+)/);
    return { piattaforma: "tiktok", link, src: m ? `https://www.tiktok.com/embed/v2/${m[1]}` : null };
  }
  if (h === "vm.tiktok.com" || h === "vt.tiktok.com") return { piattaforma: "tiktok", link, src: null };

  if (h === "fb.watch") return { piattaforma: "facebook", link, src: null };
  if (h === "facebook.com") {
    const p = u.pathname;
    // Gruppi: Facebook non permette di incorporarli. Share: vanno risolti prima.
    if (p.startsWith("/groups/") || p.startsWith("/share/")) return { piattaforma: "facebook", link, src: null };
    const video = /\/videos\/|\/reel\/|^\/watch/.test(p);
    return { piattaforma: "facebook", link, src: plugin(video ? "video" : "post", link) };
  }

  return { piattaforma: "altro", link, src: null };
}

export function eCorto(link: string): boolean {
  try {
    const u = new URL(link);
    const h = dominio(u);
    return (
      h === "vm.tiktok.com" ||
      h === "vt.tiktok.com" ||
      h === "fb.watch" ||
      (h === "facebook.com" && u.pathname.startsWith("/share/"))
    );
  } catch {
    return false;
  }
}

// I link corti (quelli che le app danno con "Condividi") non contengono
// l'identificativo del post: si segue il redirect al momento del build.
// Se la piattaforma blocca il server o manda al login, resta il link
// originale e il post diventa una scheda-link.
export async function risolvi(link: string, fetchFn: typeof fetch = fetch): Promise<string> {
  let attuale = link;
  for (let salto = 0; salto < 4 && eCorto(attuale); salto++) {
    try {
      const r = await fetchFn(attuale, {
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
        headers: { "user-agent": "Mozilla/5.0 (compatible; sito-squadra/1.0)" },
      });
      const dove = r.headers.get("location");
      if (!dove) return attuale;
      const prossimo = new URL(dove, attuale).toString();
      if (/\/login/.test(new URL(prossimo).pathname)) return link;
      attuale = prossimo;
    } catch {
      return link;
    }
  }
  return attuale;
}

// Home e /social mostrano gli stessi post: la cache evita di risolvere due
// volte lo stesso link nello stesso build.
const cache = new Map<string, Promise<Post>>();

export function preparaPost(link: string, fetchFn: typeof fetch = fetch): Promise<Post> {
  let p = cache.get(link);
  if (!p) {
    p = risolvi(link, fetchFn).then((finale) => ({ ...riconosci(finale), link }));
    cache.set(link, p);
  }
  return p;
}
```

- [ ] **Step 4: verifica che passino**

Run: `npx vitest run tests/social.test.ts` → PASS. Poi `npm test` → tutti PASS (anche i test esistenti).

- [ ] **Step 5: commit**

```bash
git add src/lib/social.ts tests/social.test.ts
git commit -m "feat: riconoscimento dei link social e risoluzione dei link corti"
```

---

### Task 2: collezione `social` nel pannello e nello schema

**Files:**
- Modify: `LONGI/src/content.config.ts` (aggiunta collezione `social`; la collezione `news` si toglie nel Task 5)
- Modify: `LONGI/public/admin/config.yml` (nuova collezione in cima a `collections`, prima di `news`)
- Create: `LONGI/src/content/social/.gitkeep`

**Interfaces:**
- Produces: collezione `social`, voci con `data: { link: string; date: Date }`.

- [ ] **Step 1:** in `content.config.ts`, dopo `sponsor`:

```ts
// Post dei social incollati come link dal pannello (vedi src/lib/social.ts).
const social = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/social" }),
  schema: z.object({
    link: z.string().url(),
    date: z.coerce.date(),
  }),
});
export const collections = { news, giocatori, staff, sponsor, social };
```

(sostituisce la riga `export const collections = { news, giocatori, staff, sponsor };`)

- [ ] **Step 2:** in `config.yml`, subito sotto `collections:`:

```yaml
  - name: "social"
    label: "Social"
    label_singular: "Post"
    description: "Incolla il link di un post pubblico di Instagram, Facebook o TikTok: sul sito compare da solo, in home e nella pagina Social."
    folder: "src/content/social"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{hour}}{{minute}}{{second}}"
    identifier_field: "link"
    summary: "{{date | date('DD/MM/YYYY')}} · {{link}}"
    sortable_fields: ["date"]
    format: "frontmatter"
    fields:
      - label: "Link al post"
        name: "link"
        widget: "string"
        required: true
        hint: "Dal social: tocca Condividi (o i tre puntini) e poi Copia link, e incollalo qui. Il post deve essere pubblico: i profili privati e i post dentro i gruppi Facebook non si vedono."
        pattern: ["^https://([a-z]+\\.)?(instagram\\.com|facebook\\.com|fb\\.watch|tiktok\\.com)/\\S+$", "Serve un link di Instagram, Facebook o TikTok che inizi con https://"]
      - label: "Data"
        name: "date"
        widget: "datetime"
        required: true
        default: "{{now}}"
        hint: "Si compila da sola. Cambiala solo se aggiungi un post vecchio: i post sono in ordine dal piu' recente."
```

Il `pattern` accetta anche `vm.tiktok.com`/`vt.tiktok.com` (sottodominio) e `m.facebook.com`.

- [ ] **Step 3:** `mkdir -p src/content/social && touch src/content/social/.gitkeep`

- [ ] **Step 4: verifica** — `npm run build` → completa (collezione vuota: al massimo un avviso come per `staff`). Controlla con un validatore YAML: `node -e "require('js-yaml')"` non c'è di sicuro, quindi `python -c "import yaml,sys; yaml.safe_load(open('public/admin/config.yml',encoding='utf-8')); print('ok')"` → `ok`.

- [ ] **Step 5: commit**

```bash
git add src/content.config.ts public/admin/config.yml src/content/social/.gitkeep
git commit -m "feat: collezione Social nel pannello, un post = un link"
```

---

### Task 3: componente del post e link "Apri su" nel riquadro di consenso

**Files:**
- Modify: `LONGI/src/components/EmbedConsenso.astro` (prop facoltativa `apri`)
- Create: `LONGI/src/components/SocialPost.astro`

**Interfaces:**
- Consumes: `preparaPost`, `ALTEZZA`, `NOME` dal Task 1.
- Produces: `<SocialPost link={string} date={Date} />` → `<article class="social-card" data-reveal>`.
- `EmbedConsenso` Props: aggiunta `apri?: string`.

- [ ] **Step 1: `EmbedConsenso.astro`** — interfaccia e destrutturazione:

```ts
interface Props {
  src: string;
  title: string;
  servizio: string; // nome leggibile, es. "OpenStreetMap"
  altezza?: string;
  nota?: string;
  apri?: string; // link al contenuto originale, per chi non vuole caricarlo qui
}
const { src, title, servizio, altezza = "100%", nota, apri } = Astro.props;
```

e la riga `<p class="embed-link"><a href="/privacy">Come trattiamo i dati</a></p>` diventa:

```astro
    <p class="embed-link">
      {apri && (
        <>
          <a href={apri} target="_blank" rel="noopener noreferrer">Apri su {servizio}</a>
          {" · "}
        </>
      )}
      <a href="/privacy">Come trattiamo i dati</a>
    </p>
```

- [ ] **Step 2: `SocialPost.astro`**:

```astro
---
// Un post social dentro la cornice del sito. Il riquadro ufficiale della
// piattaforma sta in EmbedConsenso: senza consenso resta un segnaposto
// leggero, con il link per aprire il post sul social.
import EmbedConsenso from "./EmbedConsenso.astro";
import { preparaPost, ALTEZZA, NOME } from "../lib/social";

interface Props {
  link: string;
  date: Date;
}
const { link, date } = Astro.props;
const post = await preparaPost(link);
const nome = NOME[post.piattaforma];
const quando = date.toLocaleDateString("it-IT", { day: "numeric", month: "short", timeZone: "Europe/Rome" });
---
<article class="social-card" data-reveal>
  <p class="etichetta font-display">
    <span>{nome}</span> · <time datetime={date.toISOString()}>{quando}</time>
  </p>
  {post.src && post.piattaforma !== "altro" ? (
    <EmbedConsenso
      src={post.src}
      title={`Post ${nome} del ${quando}`}
      servizio={nome}
      altezza={`${ALTEZZA[post.piattaforma]}px`}
      apri={link}
      nota={`Il post è ospitato da ${nome}: per mostrarlo qui il browser deve collegarsi ai loro server, che possono registrare il tuo indirizzo IP e impostare cookie propri.`}
    />
  ) : (
    <a class="solo-link" href={link} target="_blank" rel="noopener noreferrer">
      Apri il post su {nome}
    </a>
  )}
</article>
<style>
  /* Cornice rossoblu': filo superiore dimezzato come lo scudo, cartellino
     d'oro inclinato come quello delle vecchie card news. */
  .social-card {
    position: relative;
    background: var(--surface);
    padding: 1.6rem 0.6rem 0.6rem;
    border-top: 4px solid transparent;
    border-image: linear-gradient(90deg, var(--rosso) 0 50%, var(--blu) 50% 100%) 1;
  }
  .etichetta {
    position: absolute;
    top: -0.9rem;
    left: 1rem;
    margin: 0;
    background: var(--oro);
    color: var(--bg);
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    padding: 0.28rem 0.7rem;
    transform: skewX(-8deg);
  }
  .solo-link {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 10rem;
    color: var(--oro);
    border: 1px dashed color-mix(in oklch, var(--oro) 55%, transparent);
  }
</style>
```

- [ ] **Step 3: prova con post reali (locale, NON committare le voci)** — trova con una ricerca web un post pubblico recente per piattaforma (Instagram post, Instagram reel, Facebook post di una pagina, Facebook video/reel, TikTok video, un link `facebook.com/share/...` e un `vm.tiktok.com/...`). Crea voci temporanee in `src/content/social/` (`prova-1.md` ... con `link:` e `date:`), poi `npm run build` e `npx astro preview --port 4322` (in background). Con playwright-cli su `http://localhost:4322/social` (la pagina nasce nel Task 4: questo step si può fare alla fine del Task 4) verifica per ciascuna:
  1. dopo "Carica ...", il riquadro mostra il post (non un errore della piattaforma);
  2. altezza: il post si vede intero senza grandi vuoti. Se no, correggi `ALTEZZA` (e i test non cambiano);
  3. Instagram: `playwright-cli eval "() => new Promise(r => { const m=[]; addEventListener('message', e => m.push([e.origin, String(e.data).slice(0,120)])); setTimeout(() => r(m), 4000) })"` dopo il caricamento: se arrivano messaggi `MEASURE` con l'altezza, aggiungi in `SocialPost.astro` lo script qui sotto; altrimenti niente.

```astro
<script>
  // Instagram comunica l'altezza vera del post: il riquadro si adatta
  // invece di restare all'altezza fissa di ALTEZZA.instagram.
  addEventListener("message", (e) => {
    if (e.origin !== "https://www.instagram.com" || typeof e.data !== "string") return;
    let dati: { type?: string; details?: { height?: number } };
    try { dati = JSON.parse(e.data); } catch { return; }
    if (dati.type !== "MEASURE" || !dati.details?.height) return;
    for (const f of document.querySelectorAll<HTMLIFrameElement>("iframe[src*='instagram.com']")) {
      if (f.contentWindow === e.source) {
        f.style.height = `${dati.details.height}px`;
        f.closest<HTMLElement>("[data-embed]")?.style.setProperty("--embed-h", `${dati.details.height}px`);
      }
    }
  });
</script>
```

  4. link di condivisione Facebook: se al build `risolvi` torna il link originale (bloccato) prova se `plugin("post", <link share>)` funziona direttamente nel browser. Se funziona, in `riconosci` togli `p.startsWith("/share/")` dal ramo `src: null` e aggiorna il test "link di condivisione" perché si aspetti `src` con `/plugins/post.php?href=`. Se non funziona, lascia com'è (scheda-link).
  5. Annota nel messaggio di commit quali forme sono state verificate.

  Alla fine: `rm src/content/social/prova-*.md`.

- [ ] **Step 4:** `npx vitest run` → PASS; `npm run build` → ok.

- [ ] **Step 5: commit**

```bash
git add src/components/EmbedConsenso.astro src/components/SocialPost.astro src/lib/social.ts tests/social.test.ts
git commit -m "feat: post social nella cornice del sito, riquadro ufficiale dietro consenso"
```

---

### Task 4: sezione "Dai social" in home e pagina `/social`

**Files:**
- Modify: `LONGI/src/pages/index.astro` (sezione news → social, stili)
- Create: `LONGI/src/pages/social.astro`
- Modify: `LONGI/src/components/Header.astro:4` (`["/news", "News"]` → `["/social", "Social"]`)

**Interfaces:**
- Consumes: `SocialPost` (Task 3), collezione `social` (Task 2).

- [ ] **Step 1: home** — in `index.astro`:
  - import: `NewsCard` → `import SocialPost from "../components/SocialPost.astro";`
  - frontmatter: sostituisci il blocco `const news = ...slice(0, 3);` con

```ts
const social = (await getCollection("social"))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 3);
```

  - commento iniziale: `poi le notizie a mosaico` → `poi i post social a mosaico`.
  - markup: la `<section class="news-section" ...>...</section>` diventa

```astro
    {social.length > 0 && (
      <section class="social-section" aria-labelledby="social-title">
        <div class="section-inner">
          <h2 id="social-title" class="font-display">Dai social</h2>
          <div class="social-grid">
            {social.map((p) => <SocialPost link={p.data.link} date={p.data.date} />)}
          </div>
          <p class="all-news"><a href="/social">Tutti i post</a></p>
        </div>
      </section>
    )}
```

  - stili: rinomina `.news-section` → `.social-section`, `.news-grid` → `.social-grid`, `:global(a:nth-child(3n + 2))` → `:global(.social-card:nth-child(3n + 2))`, `:global(.news-card...)` → `:global(.social-card...)` (tutte le occorrenze, anche `.reveal-js`/`.reveal-on`), `@keyframes notizia-entra` e `animation-name: notizia-entra` → `post-entra`. `.all-news` resta com'è (la usa anche la sezione rosa). Aggiungi in `@media (min-width: 720px)`: niente; aggiungi fuori: `.social-grid { align-items: start; }` è già nel media query, ok. Aggiungi sotto `.social-section h2 {...}` il margine per il cartellino: `.social-grid { row-gap: 2.5rem; }` (il cartellino sporge di 0.9rem sopra la card).

- [ ] **Step 2: `/social`** — `src/pages/social.astro`:

```astro
---
// Tutti i post social incollati dal pannello, dal piu' recente. I riquadri
// si caricano solo avvicinandosi (iframe lazy), quindi la pagina resta
// leggera anche con molti post. Paginazione solo se un giorno servira'.
import { getCollection } from "astro:content";
import Base from "../layouts/Base.astro";
import SocialPost from "../components/SocialPost.astro";

const social = (await getCollection("social")).sort(
  (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
);
---
<Base title="Social" description="I post sul Longi 1969 da Instagram, Facebook e TikTok">
  <main id="main" tabindex="-1">
    <section class="social-page" aria-labelledby="social-title">
      <div class="section-inner">
        <h1 id="social-title" class="font-display">Social</h1>
        <p class="kicker">I post sulla squadra: del club, dei giocatori, dei tifosi.</p>
        {social.length > 0 ? (
          <div class="social-grid">
            {social.map((p) => <SocialPost link={p.data.link} date={p.data.date} />)}
          </div>
        ) : (
          <p class="vuoto">I primi post arrivano a breve.</p>
        )}
      </div>
    </section>
  </main>
</Base>
<style>
  .social-page {
    padding: clamp(6rem, 12vw, 8rem) clamp(1rem, 4vw, 2.5rem) clamp(3rem, 8vw, 5rem);
  }
  .section-inner {
    max-width: 1200px;
    margin: 0 auto;
  }
  h1 {
    font-size: clamp(2.25rem, 6vw, 3.5rem);
    margin: 0 0 0.5rem;
  }
  .kicker {
    margin: 0 0 2.5rem;
    opacity: 0.85;
  }
  .social-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2.5rem 1.5rem;
    align-items: start;
  }
  @media (min-width: 720px) {
    .social-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1080px) {
    .social-grid { grid-template-columns: repeat(3, 1fr); }
  }
</style>
```

  Prima di scrivere il padding, copia quello di `.news-section` in `src/pages/news/[...page].astro` (header fisso: il valore reale va preso da lì, non inventato) e usa quello.

- [ ] **Step 3: menu** — `Header.astro` riga 4: `["/news", "News"]` → `["/social", "Social"]`.

- [ ] **Step 4: verifica** — esegui lo Step 3 del Task 3 (post reali). Poi senza consenso (profilo pulito: `playwright-cli delete-data`): home e `/social` a 1440×900 e 390×844, foto della sezione dopo `window.scrollTo` (come per gli sponsor: lo screenshot per selettore sulla home scrolla male). Con consenso: clic su un "Carica ..." (con "Ricorda" spuntato) → tutti i riquadri della pagina si caricano. Nessuno scorrimento orizzontale: `document.documentElement.scrollWidth === innerWidth`.

- [ ] **Step 5: commit** (senza le voci di prova)

```bash
git add src/pages/index.astro src/pages/social.astro src/components/Header.astro
git commit -m "feat: sezione Dai social in home e pagina Social al posto delle news"
```

---

### Task 5: via le news, redirect

**Files:**
- Delete: `LONGI/src/pages/news/` (`[...page].astro`, `[slug].astro`), `LONGI/src/components/NewsCard.astro`, `LONGI/src/content/news/`
- Modify: `LONGI/src/content.config.ts` (via `news` e l'export), `LONGI/public/admin/config.yml` (via la collezione `news`)
- Create: `LONGI/public/_redirects`

- [ ] **Step 1: controlla che nessun altro usi le news**

Run: `grep -rn "news\|NewsCard" src public/admin --include=*.astro --include=*.ts --include=*.yml --include=*.json | grep -v "^src/pages/news/\|^src/components/NewsCard\|^src/content/news/"`
Expected: solo le righe di `content.config.ts` e `config.yml` da togliere, e l'eventuale classe `all-news` in `index.astro` (resta). Qualunque altro riferimento: correggilo nello stesso task.

- [ ] **Step 2: cancella**

```bash
git rm -r -q src/pages/news src/components/NewsCard.astro src/content/news
```

- [ ] **Step 3:** in `content.config.ts` rimuovi il blocco `const news = defineCollection({...});` e aggiorna l'export in `export const collections = { giocatori, staff, sponsor, social };`. L'helper `empty` resta (lo usano le altre collezioni). In `config.yml` rimuovi il blocco `- name: "news"` fino alla riga vuota prima di `- name: "giocatori"`.

- [ ] **Step 4: `public/_redirects`**

```
# Le news sono state sostituite dalla pagina Social (25/09/2026): i link
# vecchi gia' condivisi portano li' invece che alla pagina di errore.
# Stesso formato per Netlify e Cloudflare Pages.
/news    /social  301
/news/*  /social  301
```

- [ ] **Step 5: verifica** — `npm run build` → ok, `ls dist/news` → non esiste, `cat dist/_redirects` → presente. `npm test` → PASS.

- [ ] **Step 6: commit**

```bash
git add -A src/pages src/components src/content src/content.config.ts public/admin/config.yml public/_redirects
git commit -m "feat: via le news, i vecchi indirizzi portano alla pagina Social"
```

---

### Task 6: informativa privacy

**Files:**
- Modify: `LONGI/src/pages/privacy.astro` (lista dei contenuti di altri siti, sezione "Cookie e contenuti di altri siti")

- [ ] **Step 1:** dopo il `<li>` di Facebook per la diretta, aggiungi:

```astro
          <li>
            <strong>Instagram</strong> e <strong>Facebook</strong> (Meta Platforms Ireland
            Limited) e <strong>TikTok</strong> (TikTok Technology Limited), i post
            mostrati in home e nella pagina <a href="/social">Social</a>, soggetti
            alle rispettive informative.
          </li>
```

- [ ] **Step 2:** `grep -n "news\|notizie" src/pages/privacy.astro` → se l'informativa cita le news come contenuto, sostituisci con i post social. `npm run build` → ok.

- [ ] **Step 3: commit**

```bash
git add src/pages/privacy.astro
git commit -m "docs: informativa con Instagram, Facebook e TikTok per i post social"
```

---

### Task 7: pronti per Cloudflare Pages

**Files:**
- Create: `LONGI/oauth/auth.mjs`, `LONGI/oauth/callback.mjs` (logica spostata da `netlify/functions/`)
- Modify: `LONGI/netlify/functions/auth.mjs`, `LONGI/netlify/functions/callback.mjs` (diventano contenitori sottili)
- Create: `LONGI/functions/auth.js`, `LONGI/functions/callback.js` (contenitori Cloudflare)
- Test: `LONGI/tests/oauth.test.ts`
- Create: `LONGI/public/_headers`, `LONGI/.node-version`
- Modify: `LONGI/netlify.toml` (via i blocchi `[[headers]]`, spostati in `_headers`)
- Create: `LONGI/docs/MESSA-ONLINE-CLOUDFLARE.md`

**Interfaces:**
- Produces: `avvia(request: Request, env: { GITHUB_CLIENT_ID?: string }): Response` in `oauth/auth.mjs`; `completa(request: Request, env: { GITHUB_CLIENT_ID?: string; GITHUB_CLIENT_SECRET?: string }, fetchFn?: typeof fetch): Promise<Response>` in `oauth/callback.mjs`.

- [ ] **Step 1: test che falliscono** — `tests/oauth.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { avvia } from "../oauth/auth.mjs";
import { completa } from "../oauth/callback.mjs";

describe("avvia", () => {
  it("senza client id: errore leggibile", async () => {
    const r = avvia(new Request("https://sito.it/auth"), {});
    expect(r.status).toBe(500);
    expect(await r.text()).toContain("GITHUB_CLIENT_ID");
  });
  it("manda su GitHub con callback sullo stesso dominio e state nel cookie", () => {
    const r = avvia(new Request("https://sito.it/auth"), { GITHUB_CLIENT_ID: "abc" });
    expect(r.status).toBe(302);
    const dove = new URL(r.headers.get("location")!);
    expect(dove.origin + dove.pathname).toBe("https://github.com/login/oauth/authorize");
    expect(dove.searchParams.get("client_id")).toBe("abc");
    expect(dove.searchParams.get("redirect_uri")).toBe("https://sito.it/callback");
    expect(dove.searchParams.get("scope")).toBe("public_repo,user");
    const state = dove.searchParams.get("state")!;
    expect(r.headers.get("set-cookie")).toContain(`cms_state=${state}`);
  });
});

const richiesta = (qs: string, cookie?: string) =>
  new Request(`https://sito.it/callback?${qs}`, { headers: cookie ? { cookie } : {} });
const env = { GITHUB_CLIENT_ID: "abc", GITHUB_CLIENT_SECRET: "segreto" };

describe("completa", () => {
  it("senza credenziali", async () => {
    expect((await completa(richiesta("code=1&state=s", "cms_state=s"), {})).status).toBe(400);
  });
  it("senza codice", async () => {
    expect((await completa(richiesta("state=s", "cms_state=s"), env)).status).toBe(400);
  });
  it("state diverso dal cookie: rifiutato senza chiamare GitHub", async () => {
    const f = vi.fn();
    const r = await completa(richiesta("code=1&state=s", "cms_state=altro"), env, f as unknown as typeof fetch);
    expect(r.status).toBe(400);
    expect(f).not.toHaveBeenCalled();
  });
  it("tutto ok: pagina che passa il permesso al pannello del sito", async () => {
    const f = vi.fn().mockResolvedValue(Response.json({ access_token: "tok123" }));
    const r = await completa(richiesta("code=1&state=s", "cms_state=s"), env, f as unknown as typeof fetch);
    expect(r.status).toBe(200);
    const html = await r.text();
    expect(html).toContain("authorization:github:success:");
    expect(html).toContain("tok123");
    expect(html).toContain('"https://sito.it"');
    expect(r.headers.get("set-cookie")).toContain("Max-Age=0");
  });
  it("GitHub rifiuta", async () => {
    const f = vi.fn().mockResolvedValue(Response.json({ error: "bad_verification_code" }));
    const r = await completa(richiesta("code=1&state=s", "cms_state=s"), env, f as unknown as typeof fetch);
    expect(r.status).toBe(400);
    expect(await r.text()).toContain("bad_verification_code");
  });
});
```

Run: `npx vitest run tests/oauth.test.ts` → FAIL (import non risolto).

- [ ] **Step 2: sposta la logica** — `git mv netlify/functions/auth.mjs oauth/auth.mjs` e `git mv netlify/functions/callback.mjs oauth/callback.mjs`. Poi in `oauth/auth.mjs`:
  - `export default async (request) => {` → `export function avvia(request, env) {` (non serve `async`: nessun `await` dentro; chiudi con `}` invece di `};`)
  - `const clientId = process.env.GITHUB_CLIENT_ID;` → `const clientId = env.GITHUB_CLIENT_ID;`
  - rimuovi `export const config = { path: "/auth" };`
  - in cima, dopo il commento esistente, aggiungi: `// Logica condivisa: la usano sia netlify/functions/auth.mjs sia functions/auth.js (Cloudflare Pages).`

  In `oauth/callback.mjs`:
  - `export default async (request) => {` → `export async function completa(request, env, fetchFn = fetch) {` (chiusura `}`)
  - `process.env.GITHUB_CLIENT_ID` → `env.GITHUB_CLIENT_ID`, `process.env.GITHUB_CLIENT_SECRET` → `env.GITHUB_CLIENT_SECRET`
  - `await fetch("https://github.com/login/oauth/access_token", {` → `await fetchFn("https://github.com/login/oauth/access_token", {`
  - rimuovi `export const config = { path: "/callback" };`
  - stesso commento "Logica condivisa" in cima.

- [ ] **Step 3: contenitori**

`netlify/functions/auth.mjs`:

```js
// Contenitore Netlify dell'accesso al pannello: la logica sta in oauth/auth.mjs,
// condivisa con Cloudflare Pages (functions/auth.js).
import { avvia } from "../../oauth/auth.mjs";

export default async (request) => avvia(request, process.env);

export const config = { path: "/auth" };
```

`netlify/functions/callback.mjs`:

```js
// Contenitore Netlify: la logica sta in oauth/callback.mjs.
import { completa } from "../../oauth/callback.mjs";

export default async (request) => completa(request, process.env);

export const config = { path: "/callback" };
```

`functions/auth.js`:

```js
// Cloudflare Pages: la cartella functions/ diventa l'indirizzo /auth.
// Le variabili d'ambiente arrivano in context.env, non in process.env.
import { avvia } from "../oauth/auth.mjs";

export const onRequestGet = ({ request, env }) => avvia(request, env);
```

`functions/callback.js`:

```js
// Cloudflare Pages: indirizzo /callback.
import { completa } from "../oauth/callback.mjs";

export const onRequestGet = ({ request, env }) => completa(request, env);
```

- [ ] **Step 4:** `npx vitest run` → PASS (tutti).

- [ ] **Step 5: header e versione di Node**
  - `public/_headers` (contenuto dei due `[[headers]]` di `netlify.toml`, commenti compresi):

```
# ANTEPRIMA: nessuna indicizzazione finche' i contenuti sono fittizi.
# Rimuovere questo blocco alla messa online (vedi docs/MESSA-ONLINE-CLOUDFLARE.md).
/*
  X-Robots-Tag: noindex, nofollow

# I frame dell'hero hanno nomi fissi (f-000.webp...), quindi "immutable" li
# congelerebbe nel browser anche dopo una rigenerazione: e' successo davvero il
# 27/07/2026. Cache breve finche' i contenuti cambiano; per la cache lunga va
# versionata la cartella (es. /hero-frames/v2/).
/hero-frames/*
  Cache-Control: public, max-age=3600, must-revalidate
```

  - `netlify.toml`: rimuovi i due blocchi `[[headers]]` con i loro commenti, al loro posto: `# Header e redirect stanno in public/_headers e public/_redirects: stesso formato per Netlify e Cloudflare Pages.`
  - `.node-version`: una riga `22` (Cloudflare Pages legge questo file; su Netlify vale ancora `NODE_VERSION` del toml).

- [ ] **Step 6: verifica** — `npm run build` → `dist/_headers` e `dist/_redirects` presenti. Netlify non si prova in locale: la verifica vera (login al pannello) avviene al primo deploy, elencata nella checklist.

- [ ] **Step 7: checklist** — `docs/MESSA-ONLINE-CLOUDFLARE.md`:

```markdown
# Giorno del dominio: trasloco su Cloudflare Pages

Il codice e' gia' pronto (accesso al pannello in functions/, header e
redirect in public/_headers e public/_redirects). Restano questi passi.

## Chi fa cosa

| # | Passo | Chi |
|---|---|---|
| 1 | Account Cloudflare gratuito con l'email di servizio del club | Utente (Claude non crea account) |
| 2 | Workers & Pages → Create → Pages → Connect to Git → repo del sito. Build command `npm run build`, output `dist`, root vuota | Utente o Claude sulla sessione dell'utente |
| 3 | Settings → Variables and secrets: `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` (gli stessi di Netlify, tipo "Secret") | Utente (il segreto non passa da Claude) |
| 4 | Primo deploy su `<progetto>.pages.dev`: controllo home, /social, /news → /social | Claude |
| 5 | Custom domains → aggiungi il dominio. Se il dominio e' comprato altrove: nameserver su Cloudflare (gratis) oppure CNAME verso `<progetto>.pages.dev` | Utente + Claude |
| 6 | Nel codice: `site: "https://<dominio>"` in `astro.config.mjs`, `base_url: https://<dominio>` in `public/admin/config.yml`, via il blocco `X-Robots-Tag` da `public/_headers` | Claude |
| 7 | App OAuth su GitHub (Settings → Developer settings → OAuth Apps): Homepage `https://<dominio>`, callback `https://<dominio>/callback` | Utente o Claude sulla sessione dell'utente |
| 8 | Collaudo: login su `/admin`, modifica di prova, il sito si aggiorna da solo | Utente + Claude |
| 9 | Netlify: scollegare il repo dal sito vecchio (niente build doppie), cancellarlo dopo qualche giorno | Utente |
```

  (Per il Galati il passo 6 include anche `public/robots.txt`: `Disallow: /` → `Allow: /`.)

- [ ] **Step 8: commit**

```bash
git add oauth functions netlify tests/oauth.test.ts public/_headers .node-version netlify.toml docs/MESSA-ONLINE-CLOUDFLARE.md
git commit -m "chore: accesso al pannello pronto anche per Cloudflare Pages, header nel formato comune"
```

---

### Task 8: verifica finale Longi

- [ ] **Step 1:** `npm test` → PASS; `npm run build` → ok, nessun errore nuovo (l'avviso su `staff` vuoto c'era gia').
- [ ] **Step 2: privacy senza consenso** — profilo pulito, `/social` con 2 voci di prova (una IG, una TikTok) e home: `playwright-cli network-requests` (o `eval` su `performance.getEntriesByType("resource")`) → **nessuna** richiesta verso `instagram.com`, `facebook.com`, `fbcdn.net`, `cdninstagram.com`, `tiktok.com`, `tiktokcdn`. Poi rimuovi le voci di prova.
- [ ] **Step 3:** `git status` pulito (a parte `.playwright-cli/`), nessuna voce `prova-*` committata: `git log --stat -5 | grep -c prova` → `0`.

---

## Parte B — Galati

Stessa sostanza, stile gialloblu'. I file condivisi si COPIANO dal Longi gia' finito (Parte A completata e verificata).

### Task 9: libreria, test, collezione, componente

**Files:**
- Create (copia): `GALATI/src/lib/social.ts`, `GALATI/tests/social.test.ts`, `GALATI/src/components/SocialPost.astro`, `GALATI/src/content/social/.gitkeep`
- Modify: `GALATI/src/components/EmbedConsenso.astro` (stessa modifica `apri` del Task 3 Step 1), `GALATI/src/content.config.ts`, `GALATI/public/admin/config.yml`

- [ ] **Step 1: copia**

```bash
L="/c/Users/tigno/Desktop/longi-1969"; G="/c/Users/tigno/Desktop/città di galati"
cp "$L/src/lib/social.ts" "$G/src/lib/social.ts"
cp "$L/tests/social.test.ts" "$G/tests/social.test.ts"
cp "$L/src/components/SocialPost.astro" "$G/src/components/SocialPost.astro"
mkdir -p "$G/src/content/social" && touch "$G/src/content/social/.gitkeep"
```

- [ ] **Step 2: stile gialloblu' in `SocialPost.astro`** — nel blocco `<style>`:
  - commento: `Cornice rossoblu': filo superiore dimezzato come lo scudo...` → `Cornice gialloblu': filo superiore coi colori sociali, cartellino giallo.`
  - `linear-gradient(90deg, var(--rosso) 0 50%, var(--blu) 50% 100%)` → `linear-gradient(90deg, var(--giallo) 0 50%, var(--blu) 50% 100%)`
  - `.etichetta { ... background: var(--oro); ... transform: skewX(-8deg); }` → `background: var(--giallo);` e rimuovi la riga `transform: skewX(-8deg);` (il Galati non usa cartellini inclinati)
  - `.solo-link`: `var(--oro)` → `var(--giallo)` (entrambe le occorrenze)

- [ ] **Step 3: `EmbedConsenso.astro`** — stessa modifica del Task 3 Step 1 (interfaccia `apri?: string`, destrutturazione, paragrafo `embed-link`). Il resto del file del Galati resta com'e' (colori `--giallo`).

- [ ] **Step 4: collezione** — in `GALATI/src/content.config.ts` e `GALATI/public/admin/config.yml` stesse aggiunte del Task 2 Step 1 e Step 2 (codice identico, incluso `export const collections = { news, giocatori, staff, sponsor, social };`: prima di scriverlo leggi l'export attuale del Galati e aggiungi solo `social`).

- [ ] **Step 5:** `npx vitest run` → PASS; `npm run build` → ok.

- [ ] **Step 6: commit** (in GALATI)

```bash
git add src/lib/social.ts tests/social.test.ts src/components/SocialPost.astro src/components/EmbedConsenso.astro src/content/social/.gitkeep src/content.config.ts public/admin/config.yml
git commit -m "feat: post social dal pannello con riquadro ufficiale dietro consenso"
```

### Task 10: home, pagina `/social`, menu, 404

**Files:**
- Modify: `GALATI/src/pages/index.astro`, `GALATI/src/components/Header.astro:4`, `GALATI/src/pages/404.astro:9`
- Create: `GALATI/src/pages/social.astro`

- [ ] **Step 1: home** — in `index.astro`:
  - import `NewsCard` → `SocialPost` (come Task 4 Step 1);
  - frontmatter: il blocco `const news = (await getCollection("news"))...` → il blocco `const social = ...slice(0, 3);` del Task 4 Step 1;
  - markup: la sezione news → la sezione `social-section` del Task 4 Step 1 (identica);
  - stili: `.news-section` → `.social-section`, `.news-grid` → `.social-grid`. La regola `@media (min-width: 720px) { .news-grid { grid-template-columns: repeat(2, 1fr); } .news-grid > :global(a:first-child) { grid-column: span 2; } }` diventa

```css
  @media (min-width: 720px) {
    .social-grid {
      grid-template-columns: repeat(3, 1fr);
      align-items: start;
    }
  }
```

    (un riquadro social largo due colonne resterebbe stretto al centro: tre colonne uguali) e aggiungi `.social-grid { row-gap: 2.5rem; }` fuori dal media query.

- [ ] **Step 2: `/social`** — copia `LONGI/src/pages/social.astro` in `GALATI/src/pages/social.astro`, poi: `description="I post sul Longi 1969 da Instagram, Facebook e TikTok"` → `description="I post sul Città di Galati da Instagram, Facebook e TikTok"`; padding di `.social-page` preso da `.news-section` di `GALATI/src/pages/news/[...page].astro` (header del Galati diverso).
- [ ] **Step 3:** `Header.astro` riga 4 `["/news", "News"]` → `["/social", "Social"]`; `404.astro` riga 9 `["/news", "Ultime notizie"]` → `["/social", "Dai social"]`.
- [ ] **Step 4: verifica** — come Task 4 Step 4 (porta 4323 per non scontrarsi col Longi), con 2-3 voci di prova poi rimosse.
- [ ] **Step 5: commit**

```bash
git add src/pages/index.astro src/pages/social.astro src/components/Header.astro src/pages/404.astro
git commit -m "feat: sezione Dai social in home e pagina Social al posto delle news"
```

### Task 11: via le news, immagini orfane, redirect, privacy

**Files:**
- Delete: `GALATI/src/pages/news/`, `GALATI/src/components/NewsCard.astro`, `GALATI/src/content/news/` (6 news fittizie)
- Delete (se orfane): `GALATI/public/img/foto/{dettaglio-pallone,allenamento,campo-dallalto,maglia,spogliatoio}.webp`
- Modify: `GALATI/src/content.config.ts`, `GALATI/public/admin/config.yml`, `GALATI/src/pages/privacy.astro`
- Create: `GALATI/public/_redirects` (contenuto identico al Task 5 Step 4)

- [ ] **Step 1:** stesso controllo del Task 5 Step 1 (grep sui riferimenti news).
- [ ] **Step 2: immagini** — per ciascuna delle 5 foto: `grep -rn "<nome>" src public --include=*.astro --include=*.css --include=*.ts --include=*.json --include=*.md --include=*.yml | grep -v "src/content/news/"` → se vuoto, `git rm public/img/foto/<nome>.webp`. `tifosi.webp` resta (usata in home). Se `public/img/LEGGIMI.md` le elenca, aggiorna l'elenco.
- [ ] **Step 3:** cancellazioni e modifiche a `content.config.ts`/`config.yml` come Task 5 Step 2-3; `public/_redirects` come Task 5 Step 4.
- [ ] **Step 4: privacy** — come Task 6 Step 1-2, sulla lista del Galati (`src/pages/privacy.astro`, dopo la voce Facebook della diretta se presente, altrimenti dopo Tuttocampo).
- [ ] **Step 5:** `npm run build` → ok, `ls dist/news` → non esiste; `npm test` → PASS.
- [ ] **Step 6: commit**

```bash
git add -A src public/_redirects public/img public/admin/config.yml
git commit -m "feat: via le news fittizie e le foto usate solo da loro, redirect a Social"
```

### Task 12: pronti per Cloudflare (Galati)

Stessi file e stesso contenuto del Task 7, nel repo GALATI. Le funzioni del Galati sono identiche a quelle del Longi (differiscono solo i fine riga).

- [ ] **Step 1: copia** (dal Longi dopo il Task 7)

```bash
L="/c/Users/tigno/Desktop/longi-1969"; G="/c/Users/tigno/Desktop/città di galati"
cd "$G"
git rm -q netlify/functions/auth.mjs netlify/functions/callback.mjs
mkdir -p oauth functions netlify/functions
cp "$L/oauth/auth.mjs" "$L/oauth/callback.mjs" oauth/
cp "$L/functions/auth.js" "$L/functions/callback.js" functions/
cp "$L/netlify/functions/auth.mjs" "$L/netlify/functions/callback.mjs" netlify/functions/
cp "$L/tests/oauth.test.ts" tests/
cp "$L/public/_headers" public/_headers
cp "$L/.node-version" .node-version
```

- [ ] **Step 2:** `oauth/callback.mjs` del Galati: il colore di sfondo della pagina di accesso (`background:#12203f`) era uguale nei due repo, niente da cambiare. `diff` fra i due `netlify.toml` era vuoto: stessa modifica del Task 7 Step 5.
- [ ] **Step 3: checklist** — copia `docs/MESSA-ONLINE-CLOUDFLARE.md` e nel passo 6 aggiungi: `public/robots.txt`: `Disallow: /` → `Allow: /` (e aggiorna il commento).
- [ ] **Step 4:** `npx vitest run` → PASS; `npm run build` → `dist/_headers`, `dist/_redirects` presenti.
- [ ] **Step 5: commit**

```bash
git add oauth functions netlify tests/oauth.test.ts public/_headers .node-version netlify.toml docs/MESSA-ONLINE-CLOUDFLARE.md
git commit -m "chore: accesso al pannello pronto anche per Cloudflare Pages, header nel formato comune"
```

### Task 13: verifica finale Galati + memoria

- [ ] **Step 1:** come Task 8 (test, build, zero richieste Meta/TikTok senza consenso, nessuna voce di prova committata).
- [ ] **Step 2:** aggiorna la memoria di progetto (`citta-di-galati-sito.md`, `longi-1969-sito.md`): news eliminate, Social attivo, codice pronto per Cloudflare, checklist in `docs/MESSA-ONLINE-CLOUDFLARE.md`, niente push fino al trasloco.
