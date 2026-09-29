import { describe, it, expect } from "vitest";
import { componiFormazione } from "../src/lib/formazione";

const rosa = [
  { nome: "Roberto Arangio", numero: 1, foto: "/img/uploads/roberto-arangio.webp" },
  { nome: "Ivan Pidalà" },
  { nome: "Diego Pidalà" },
  { nome: "Matias De Gregorio", numero: 9 },
  { nome: "Paolo Faranda" },
];

const quattroQuattroDue = {
  portiere: "Roberto Arangio",
  difensori: ["D1 Uno", "D2 Due", "D3 Tre", "Ivan Pidalà"],
  centrocampisti: ["C1 Cinque", "C2 Sei", "Diego Pidalà", "C4 Sette"],
  attaccanti: ["Matias De Gregorio", "A2 Otto"],
};

describe("componiFormazione", () => {
  it("ricava il modulo dai reparti compilati", () => {
    expect(componiFormazione(quattroQuattroDue, rosa)?.modulo).toBe("4-4-2");
  });

  it("i trequartisti aggiungono una linea: 4-2-3-1", () => {
    const f = componiFormazione(
      {
        portiere: "Roberto Arangio",
        difensori: ["a A", "b B", "c C", "d D"],
        centrocampisti: ["e E", "f F"],
        trequartisti: ["g G", "h H", "i I"],
        attaccanti: ["l L"],
      },
      rosa
    );
    expect(f?.modulo).toBe("4-2-3-1");
    expect(f?.linee.map((l) => l.length)).toEqual([1, 4, 2, 3, 1]);
  });

  it("la prima linea e' il portiere, poi dalla difesa all'attacco", () => {
    const f = componiFormazione(quattroQuattroDue, rosa)!;
    expect(f.linee[0].map((m) => m.nome)).toEqual(["Roberto Arangio"]);
    expect(f.linee.at(-1)!.map((m) => m.nome)).toEqual(["Matias De Gregorio", "A2 Otto"]);
  });

  it("numero e foto arrivano dalla rosa", () => {
    const portiere = componiFormazione(quattroQuattroDue, rosa)!.linee[0][0];
    expect(portiere.numero).toBe(1);
    expect(portiere.foto).toBe("/img/uploads/roberto-arangio.webp");
  });

  it("mostra il cognome, con l'iniziale del nome se il cognome e' condiviso in rosa", () => {
    const f = componiFormazione(quattroQuattroDue, rosa)!;
    const etichette = f.linee.flat().map((m) => m.etichetta);
    expect(etichette).toContain("Arangio");
    expect(etichette).toContain("De Gregorio");
    expect(etichette).toContain("I. Pidalà");
    expect(etichette).toContain("D. Pidalà");
  });

  it("un nome che non e' in rosa compare lo stesso, senza numero", () => {
    const m = componiFormazione(quattroQuattroDue, rosa)!.linee[1][0];
    expect(m.etichetta).toBe("Uno");
    expect(m.numero).toBeUndefined();
  });

  it("titolo predefinito quando il campo e' vuoto", () => {
    expect(componiFormazione({ ...quattroQuattroDue, titolo: "" }, rosa)?.titolo).toBe("Formazione titolare");
    expect(componiFormazione({ ...quattroQuattroDue, titolo: "Contro la Pro Tonnarella" }, rosa)?.titolo).toBe(
      "Contro la Pro Tonnarella"
    );
  });

  it("ignora le righe lasciate vuote dal pannello", () => {
    const f = componiFormazione({ ...quattroQuattroDue, trequartisti: ["", ""] }, rosa);
    expect(f?.modulo).toBe("4-4-2");
  });

  it("senza undici giocatori non c'e' formazione", () => {
    expect(componiFormazione({ ...quattroQuattroDue, attaccanti: ["Matias De Gregorio"] }, rosa)).toBeNull();
    expect(componiFormazione({}, rosa)).toBeNull();
  });

  it("senza portiere non c'e' formazione", () => {
    const { portiere: _, ...senza } = quattroQuattroDue;
    expect(componiFormazione({ ...senza, attaccanti: ["Matias De Gregorio", "A2 Otto", "A3 Nove"] }, rosa)).toBeNull();
  });

  it("lo stesso giocatore due volte non e' una formazione valida", () => {
    expect(
      componiFormazione({ ...quattroQuattroDue, attaccanti: ["Matias De Gregorio", "Matias De Gregorio"] }, rosa)
    ).toBeNull();
  });
});
