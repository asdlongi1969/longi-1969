// Formazione titolare della home, compilata dal pannello per reparti
// (src/data/formazione.json). Il modulo non si sceglie: si ricava da quanti
// giocatori ci sono in ogni reparto, cosi' non puo' mai contraddire i nomi.
// Una formazione incompleta o sbagliata non rompe il sito: la funzione
// restituisce null e la home torna a mostrare il muro della rosa.

export interface DatiFormazione {
  titolo?: string;
  modulo?: string; // "4-3-3", "4-2-3-1"...; "auto" o vuoto = dai reparti
  portiere?: string;
  difensori?: string[];
  centrocampisti?: string[];
  trequartisti?: string[];
  attaccanti?: string[];
  panchina?: string[];
}

export interface GiocatoreRosa {
  nome: string;
  ruolo?: string;
  numero?: number;
  foto?: string;
}

export interface Maglia {
  nome: string;
  etichetta: string; // quello che si legge sotto la maglia
  ruolo?: string;
  numero?: number;
  foto?: string;
}

export interface Formazione {
  titolo: string;
  modulo: string; // es. "4-4-2", portiere escluso
  linee: Maglia[][]; // linee[0] e' il portiere, poi dalla difesa all'attacco
  panchina: Maglia[]; // riserve, nell'ordine del pannello
}

const pulisci = (nomi?: string[]) => (nomi ?? []).map((n) => n.trim()).filter(Boolean);

// "Matias De Gregorio" -> "De Gregorio": il nome e' la prima parola.
const cognome = (nome: string) => nome.split(/\s+/).slice(1).join(" ") || nome;

export function componiFormazione(dati: DatiFormazione, rosa: GiocatoreRosa[]): Formazione | null {
  const portiere = dati.portiere?.trim();
  if (!portiere) return null;

  const reparti = [dati.difensori, dati.centrocampisti, dati.trequartisti, dati.attaccanti]
    .map(pulisci)
    .filter((r) => r.length > 0);
  const nomi = [portiere, ...reparti.flat()];
  if (nomi.length !== 11 || new Set(nomi).size !== 11) return null;

  // Piu' Pidala' o Lazzara in rosa: il solo cognome non basta a distinguerli,
  // si aggiunge l'iniziale del nome come nelle app di fantacalcio ("Pidala' I.").
  const conteggio = new Map<string, number>();
  const panchina = [...new Set(pulisci(dati.panchina))].filter((n) => !nomi.includes(n));
  for (const nome of new Set([...rosa.map((g) => g.nome), ...nomi, ...panchina])) {
    const c = cognome(nome);
    conteggio.set(c, (conteggio.get(c) ?? 0) + 1);
  }

  const maglia = (nome: string): Maglia => {
    const g = rosa.find((x) => x.nome === nome);
    const c = cognome(nome);
    const etichetta = (conteggio.get(c) ?? 0) > 1 && c !== nome ? `${c} ${nome[0]}.` : c;
    return { nome, etichetta, ruolo: g?.ruolo, numero: g?.numero, foto: g?.foto };
  };

  // Modulo scelto nel pannello: decide lui quante maglie per linea, prendendo
  // i giocatori nell'ordine dei reparti (difesa, centrocampo, trequarti,
  // attacco). Cosi' passare da 4-4-2 a 4-3-3 non obbliga a spostare nomi.
  const scelto = /^\d(-\d)+$/.test(dati.modulo ?? "") ? dati.modulo!.split("-").map(Number) : null;
  let linee = reparti;
  if (scelto && scelto.reduce((a, b) => a + b, 0) === 10) {
    const fila = reparti.flat();
    let k = 0;
    linee = scelto.map((n) => fila.slice(k, (k += n)));
  }

  return {
    titolo: dati.titolo?.trim() || "Formazione titolare",
    modulo: linee.map((r) => r.length).join("-"),
    linee: [[maglia(portiere)], ...linee.map((r) => r.map(maglia))],
    panchina: panchina.map(maglia),
  };
}
