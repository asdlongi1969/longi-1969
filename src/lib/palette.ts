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
