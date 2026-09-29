// Formazione titolare della home, compilata dal pannello per reparti
// (src/data/formazione.json). Il modulo non si sceglie: si ricava da quanti
// giocatori ci sono in ogni reparto, cosi' non puo' mai contraddire i nomi.
// Una formazione incompleta o sbagliata non rompe il sito: la funzione
// restituisce null e la home torna a mostrare il muro della rosa.

export interface DatiFormazione {
  titolo?: string;
  portiere?: string;
  difensori?: string[];
  centrocampisti?: string[];
  trequartisti?: string[];
  attaccanti?: string[];
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

  // Piu' Pidala' o Lazzara in rosa: il solo cognome non basta a distinguerli.
  const conteggio = new Map<string, number>();
  for (const nome of new Set([...rosa.map((g) => g.nome), ...nomi])) {
    const c = cognome(nome);
    conteggio.set(c, (conteggio.get(c) ?? 0) + 1);
  }

  const maglia = (nome: string): Maglia => {
    const g = rosa.find((x) => x.nome === nome);
    const c = cognome(nome);
    const etichetta = (conteggio.get(c) ?? 0) > 1 && c !== nome ? `${nome[0]}. ${c}` : c;
    return { nome, etichetta, ruolo: g?.ruolo, numero: g?.numero, foto: g?.foto };
  };

  return {
    titolo: dati.titolo?.trim() || "Formazione titolare",
    modulo: reparti.map((r) => r.length).join("-"),
    linee: [[maglia(portiere)], ...reparti.map((r) => r.map(maglia))],
  };
}
