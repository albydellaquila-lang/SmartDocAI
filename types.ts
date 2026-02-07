
export interface KeyData {
  etichetta: string;
  valore: string;
}

export interface BillData {
  tipo: string;
  riassunto: string;
  dati_chiave: KeyData[];
  azione_consigliata: string;
}

export interface AnalysisState {
  loading: boolean;
  error: string | null;
  data: BillData | null;
}
