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
