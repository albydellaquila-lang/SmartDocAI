
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
          text: "Analizza questo documento. Estrai le seguenti informazioni in formato JSON: 'tipo' (la categoria del documento, es. Bolletta Luce, Referto Medico), 'riassunto' (una breve descrizione del contenuto), 'dati_chiave' (un array di oggetti con 'etichetta' e 'valore' per le informazioni più importanti come importi, date, codici) e 'azione_consigliata' (un suggerimento pratico su cosa fare ora).",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tipo: {
            type: Type.STRING,
            description: "La categoria del documento.",
          },
          riassunto: {
            type: Type.STRING,
            description: "Breve riassunto del documento.",
          },
          dati_chiave: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                etichetta: {
                  type: Type.STRING,
                  description: "Nome del dato (es. Totale, Scadenza, Codice Cliente).",
                },
                valore: {
                  type: Type.STRING,
                  description: "Il valore del dato.",
                },
              },
              required: ["etichetta", "valore"],
            },
            description: "Elenco flessibile di dati importanti estratti.",
          },
          azione_consigliata: {
            type: Type.STRING,
            description: "Un'azione suggerita basata sul contenuto.",
          },
        },
        required: ["tipo", "riassunto", "dati_chiave", "azione_consigliata"],
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
    throw new Error("Errore durante l'elaborazione dei dati del documento.");
  }
};
