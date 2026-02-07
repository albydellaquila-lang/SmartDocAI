
import React, { useState, useRef } from 'react';
import { Camera, Upload, FileText, AlertCircle, CheckCircle2, RefreshCcw, Loader2, Sparkles } from 'lucide-react';
import { analyzeBill } from './services/geminiService';
import { AnalysisState, BillData } from './types';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisState>({
    loading: false,
    error: null,
    data: null,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setImage(reader.result as string);
        setMimeType(file.type);
        setAnalysis({ loading: false, error: null, data: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!image) return;

    setAnalysis(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const base64Data = image.split(',')[1];
      const result = await analyzeBill(base64Data, mimeType);
      setAnalysis({
        loading: false,
        error: null,
        data: result,
      });
    } catch (err: any) {
      setAnalysis({
        loading: false,
        error: err.message || "Si è verificato un errore durante l'analisi.",
        data: null,
      });
    }
  };

  const reset = () => {
    setImage(null);
    setMimeType('');
    setAnalysis({ loading: false, error: null, data: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Bill Scanner AI
            </h1>
          </div>
          {image && (
            <button 
              onClick={reset}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Ricomincia
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {!image ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all hover:border-indigo-300 group">
            <div className="bg-indigo-50 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-800">Carica una bolletta</h2>
            <p className="text-slate-500 mb-8 max-w-sm">
              Trascina qui l'immagine della tua bolletta o clicca il pulsante sotto per selezionarla dal tuo dispositivo.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              Scegli file
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Image Preview */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border p-2">
                <img 
                  src={image} 
                  alt="Bolletta caricata" 
                  className="w-full h-auto rounded-xl object-contain max-h-[600px]" 
                />
              </div>
              {!analysis.data && !analysis.loading && (
                <button 
                  onClick={handleProcess}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Analizza Documento
                </button>
              )}
            </div>

            {/* Analysis Results */}
            <div className="space-y-6">
              {analysis.loading && (
                <div className="bg-white rounded-2xl p-8 border shadow-sm flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800">Analisi in corso...</h3>
                  <p className="text-slate-500">L'IA sta estraendo le informazioni dalla tua bolletta.</p>
                </div>
              )}

              {analysis.error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800">Si è verificato un errore</h3>
                    <p className="text-red-700 text-sm mt-1">{analysis.error}</p>
                    <button 
                      onClick={handleProcess}
                      className="mt-4 text-sm font-semibold text-red-800 underline hover:no-underline"
                    >
                      Riprova
                    </button>
                  </div>
                </div>
              )}

              {analysis.data && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white rounded-2xl p-6 border shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="bg-green-100 p-1 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-slate-800">Dati Estratti</h3>
                    </div>
                    
                    <div className="grid gap-4">
                      <ResultItem 
                        label="Tipo Documento" 
                        value={analysis.data.tipo_documento} 
                        icon={<FileText className="w-4 h-4" />} 
                      />
                      <ResultItem 
                        label="Data di Scadenza" 
                        value={analysis.data.scadenza} 
                        icon={<AlertCircle className="w-4 h-4 text-orange-500" />} 
                        isHighlight
                      />
                      <ResultItem 
                        label="Importo Totale" 
                        value={analysis.data.importo} 
                        icon={<span className="font-bold text-xs">€</span>} 
                        isLarge
                      />
                    </div>
                  </div>

                  <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
                    <h4 className="text-indigo-100 text-sm font-medium mb-1">Azione Consigliata</h4>
                    <p className="text-xl font-bold">{analysis.data.azione_consigliata}</p>
                  </div>
                </div>
              )}

              {!analysis.data && !analysis.loading && !analysis.error && (
                <div className="bg-slate-100 rounded-2xl p-8 text-center border border-dashed border-slate-200">
                  <p className="text-slate-400 italic">Clicca su "Analizza Documento" per vedere i risultati qui.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

interface ResultItemProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isHighlight?: boolean;
  isLarge?: boolean;
}

const ResultItem: React.FC<ResultItemProps> = ({ label, value, icon, isHighlight, isLarge }) => (
  <div className={`p-4 rounded-xl border transition-colors ${isHighlight ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}>
    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
      {icon}
      {label}
    </div>
    <div className={`font-bold text-slate-800 ${isLarge ? 'text-2xl' : 'text-lg'}`}>
      {value}
    </div>
  </div>
);

export default App;
