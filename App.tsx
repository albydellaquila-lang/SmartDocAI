
import React, { useState, useRef } from 'react';
import { Camera, Upload, FileText, AlertCircle, CheckCircle2, RefreshCcw, Loader2, Sparkles, Info, ArrowRight } from 'lucide-react';
import { analyzeBill } from './services/geminiService';
import { AnalysisState, BillData, KeyData } from './types';

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
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              SmartDoc AI
            </h1>
          </div>
          {image && (
            <button 
              onClick={reset}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        {!image ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center transition-all hover:border-indigo-300 group shadow-sm">
            <div className="bg-indigo-50 p-5 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-slate-800">Analizza i tuoi documenti</h2>
            <p className="text-slate-500 mb-8 max-w-sm leading-relaxed">
              Carica una bolletta, un referto o un contratto. L'IA estrarrà per te le informazioni più importanti.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              Scegli Immagine
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Image Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 p-2">
                <img 
                  src={image} 
                  alt="Documento caricato" 
                  className="w-full h-auto rounded-2xl object-contain max-h-[700px]" 
                />
              </div>
              {!analysis.data && !analysis.loading && (
                <button 
                  onClick={handleProcess}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                >
                  <FileText className="w-6 h-6" />
                  Inizia Analisi
                </button>
              )}
            </div>

            {/* Analysis Results */}
            <div className="lg:col-span-7 space-y-6">
              {analysis.loading && (
                <div className="bg-white rounded-3xl p-12 border shadow-sm flex flex-col items-center justify-center text-center animate-pulse">
                  <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
                  <h3 className="text-xl font-bold text-slate-800">Analisi Intelligente...</h3>
                  <p className="text-slate-500 mt-2">L'IA sta leggendo e categorizzando il tuo documento.</p>
                </div>
              )}

              {analysis.error && (
                <div className="bg-red-50 border border-red-100 rounded-3xl p-8 flex gap-5">
                  <div className="bg-red-100 p-3 rounded-2xl h-fit">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900 text-lg">Qualcosa è andato storto</h3>
                    <p className="text-red-700 mt-1">{analysis.error}</p>
                    <button 
                      onClick={handleProcess}
                      className="mt-6 px-6 py-2 bg-white border border-red-200 rounded-xl text-sm font-bold text-red-800 hover:bg-red-50 transition-colors"
                    >
                      Riprova Analisi
                    </button>
                  </div>
                </div>
              )}

              {analysis.data && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  {/* Category & Summary */}
                  <div className="bg-white rounded-3xl p-8 border shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
                        {analysis.data.tipo}
                      </div>
                      <div className="bg-green-100 p-1.5 rounded-full">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Riassunto</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {analysis.data.riassunto}
                    </p>
                  </div>

                  {/* Key Data List */}
                  <div className="bg-white rounded-3xl p-8 border shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <Info className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-slate-900 text-xl tracking-tight">Dati Chiave Estratti</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {analysis.data.dati_chiave.map((item, index) => (
                        <KeyDataItem 
                          key={index}
                          label={item.etichetta}
                          value={item.valore}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action Banner */}
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                    <div className="space-y-1">
                      <h4 className="text-indigo-100 text-sm font-bold uppercase tracking-widest opacity-80">Azione Consigliata</h4>
                      <p className="text-2xl font-bold leading-tight">{analysis.data.azione_consigliata}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {!analysis.data && !analysis.loading && !analysis.error && (
                <div className="bg-slate-50 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-medium max-w-xs mx-auto">
                    I dettagli dell'analisi appariranno qui dopo aver elaborato il documento.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const KeyDataItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300">
    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
      <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
      {label}
    </div>
    <div className="font-bold text-slate-900 text-lg break-words">
      {value}
    </div>
  </div>
);

export default App;
