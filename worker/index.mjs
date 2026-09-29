// Cloudflare Workers: il sito sono i file statici di dist/ (serviti da
// Cloudflare, con _headers e _redirects). Il Worker entra in gioco solo per
// /auth e /callback, l'accesso al pannello (vedi run_worker_first in
// wrangler.jsonc). La logica e' la stessa di oauth/, usata anche da functions/.
import { avvia } from "../oauth/auth.mjs";
import { completa } from "../oauth/callback.mjs";

export default {
  fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (request.method === "GET" && pathname === "/auth") return avvia(request, env);
    if (request.method === "GET" && pathname === "/callback") return completa(request, env);
    return env.ASSETS.fetch(request);
  },
};
