// Cloudflare Workers: il sito sono i file statici di dist/ (serviti da
// Cloudflare, con _headers e _redirects). Il Worker entra in gioco solo per
// /auth e /callback, l'accesso al pannello, e per /api/classifica (vedi
// run_worker_first in wrangler.jsonc). La logica OAuth e' quella di oauth/.
import { avvia } from "../oauth/auth.mjs";
import { completa } from "../oauth/callback.mjs";
import { leggiClassifica } from "../src/lib/classifica.ts";
import { WIDGET_URLS } from "../src/lib/tuttocampo.ts";

// La classifica si chiede a Tuttocampo al massimo ogni 10 minuti: la risposta
// resta nella cache di Cloudflare e nel browser. Il visitatore parla solo con
// questo sito, mai con Tuttocampo: niente consenso da chiedere.
const DURATA = 600;

async function classifica(request, ctx) {
  const cache = caches.default;
  const chiave = new Request(new URL("/api/classifica", request.url));
  const inCache = await cache.match(chiave);
  if (inCache) return inCache;

  let squadre = [];
  try {
    const r = await fetch(WIDGET_URLS.classifica, { signal: AbortSignal.timeout(8000) });
    if (r.ok) squadre = leggiClassifica(await r.text());
  } catch {
    // Tuttocampo irraggiungibile: sotto si risponde 502, il tabellone resta con i nomi.
  }
  if (squadre.length === 0) {
    return Response.json({ errore: "classifica non disponibile" }, { status: 502, headers: { "cache-control": "no-store" } });
  }

  const risposta = Response.json(
    { aggiornata: new Date().toISOString(), squadre },
    { headers: { "cache-control": `public, max-age=${DURATA}` } }
  );
  ctx.waitUntil(cache.put(chiave, risposta.clone()));
  return risposta;
}

export default {
  fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (request.method === "GET" && pathname === "/auth") return avvia(request, env);
    if (request.method === "GET" && pathname === "/callback") return completa(request, env);
    if (request.method === "GET" && pathname === "/api/classifica") return classifica(request, ctx);
    return env.ASSETS.fetch(request);
  },
};
