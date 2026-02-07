
import { GoogleGenAI, Type } from "@google/genai";
import { BillData } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";

export const analyzeBill = async (base64Image: string, mimeType: string): Promise<BillData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: "Analizza questa bolletta. Estrai i dati richiesti seguendo esattamente lo schema JSON fornito. Assicurati che l'importo includa il simbolo della valuta (€) e la scadenza sia in formato leggibile (es. GG/MM/AAAA).",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tipo_documento: {
            type: Type.STRING,
            description: "Il tipo di documento (es. Bolletta Luce, Fattura Gas).",
          },
          scadenza: {
            type: Type.STRING,
            description: "La data di scadenza del pagamento.",
          },
          importo: {
            type: Type.STRING,
            description: "L'importo totale da pagare.",
          },
          azione_consigliata: {
            type: Type.STRING,
            description: "Un'azione suggerita basata sulla scadenza (es. 'Paga entro lunedì').",
          },
        },
        required: ["tipo_documento", "scadenza", "importo", "azione_consigliata"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Nessuna risposta ricevuta dal modello.");
  }

  try {
    return JSON.parse(text) as BillData;
  } catch (e) {
    console.error("Errore nel parsing del JSON:", text);
    throw new Error("Errore durante l'elaborazione dei dati della bolletta.");
  }
};
