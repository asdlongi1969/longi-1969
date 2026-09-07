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
