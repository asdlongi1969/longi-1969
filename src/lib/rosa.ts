// Ordine della rosa condiviso da /squadra e dalla home: per ruolo (dal
// portiere all'attaccante), poi per numero di maglia; chi non ha ancora un
// numero va in fondo al suo ruolo.
export const RUOLI = ["Portiere", "Difensore", "Centrocampista", "Attaccante"] as const;
export type Ruolo = (typeof RUOLI)[number];

export function ordinaRosa<T extends { data: { ruolo: Ruolo; numero?: number } }>(giocatori: T[]): T[] {
  return [...giocatori].sort(
    (a, b) =>
      RUOLI.indexOf(a.data.ruolo) - RUOLI.indexOf(b.data.ruolo) ||
      (a.data.numero ?? 999) - (b.data.numero ?? 999)
  );
}
