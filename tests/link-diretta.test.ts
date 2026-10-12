import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import worker from "../worker/index.mjs";
import { testoCondivisione, linkWhatsApp } from "../src/lib/diretta";

const env = { ASSETS: { fetch: async () => new Response("pagina") } };
const ctx = { waitUntil: () => {} };
const chiedi = (url: string) => worker.fetch(new Request(url), env, ctx);

describe("link corto /diretta", () => {
  it("porta al riquadro della diretta in home", async () => {
    const r = await chiedi("https://asdlongi.it/diretta");
    expect(r.status).toBe(302);
    expect(r.headers.get("location")).toBe("https://asdlongi.it/#diretta");
  });
  it("anche con la barra finale", async () => {
    const r = await chiedi("https://asdlongi.it/diretta/");
    expect(r.headers.get("location")).toBe("https://asdlongi.it/#diretta");
  });
  it("anche scritto con la maiuscola e per le richieste HEAD", async () => {
    expect((await chiedi("https://asdlongi.it/Diretta")).headers.get("location")).toBe("https://asdlongi.it/#diretta");
    const head = await worker.fetch(new Request("https://asdlongi.it/diretta", { method: "HEAD" }), env, ctx);
    expect(head.status).toBe(302);
  });
  it("il riquadro della diretta ha l'ancora #diretta", () => {
    expect(readFileSync("src/components/DirettaLive.astro", "utf8")).toMatch(/id="diretta"/);
  });
});

describe("Condividi la diretta", () => {
  const URL_DIRETTA = "https://asdlongi.it/diretta";
  it("in onda: partita in diretta, col titolo", () => {
    expect(testoCondivisione("Longi - Tusa", "in-onda")).toBe("Partita in diretta: Longi - Tusa");
    expect(testoCondivisione("Longi - Tusa", "libera")).toBe("Partita in diretta: Longi - Tusa");
  });
  it("prima del fischio e in replica il testo dice la verita'", () => {
    expect(testoCondivisione("Longi - Tusa", "attesa")).toBe("Prossima diretta: Longi - Tusa");
    expect(testoCondivisione("Longi - Tusa", "replica")).toBe("Rivedi la partita: Longi - Tusa");
  });
  it("senza titolo resta un testo sensato", () => {
    expect(testoCondivisione("  ", "in-onda")).toBe("Partita in diretta");
  });
  it("link di WhatsApp col testo e il link, codificati", () => {
    expect(linkWhatsApp("a b & c", URL_DIRETTA)).toBe(`https://wa.me/?text=${encodeURIComponent("a b & c 👉 https://asdlongi.it/diretta")}`);
  });
});
