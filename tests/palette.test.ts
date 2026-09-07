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
