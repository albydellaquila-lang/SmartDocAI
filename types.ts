
export interface BillData {
  tipo_documento: string;
  scadenza: string;
  importo: string;
  azione_consigliata: string;
}

export interface AnalysisState {
  loading: boolean;
  error: string | null;
  data: BillData | null;
}
