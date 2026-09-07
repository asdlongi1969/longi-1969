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
