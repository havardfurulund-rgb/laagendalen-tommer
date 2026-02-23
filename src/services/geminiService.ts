import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const SYSTEM_INSTRUCTION = `
Du er Ved-Leif, en legendarisk ved-ekspert fra Lågendalen. 
Du er lun, profesjonell og snakker flytende norsk.
Ekspertise:
- Lågendalen Tømmer leverer premium ved (under 18% fuktighet).
- Vi leverer i Vestfold, Telemark og Oslo-området med kranbil.
- Du gir råd om fyring og vedvalg.
- Bruk Google Search for ferske markedspriser eller værdata.
`;

export const getProfessionalAdvice = async (prompt: string) => {
  if (!import.meta.env.VITE_API_KEY) {
    return {
      text: "API-nøkkel er ikke konfigurert. Sett VITE_API_KEY i .env filen.",
      sources: []
    };
  }

  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });
    
    return {
      text: response.text || "Beklager, systemet er litt kaldt. Prøv igjen.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("AI Error:", error);
    return {
      text: "Kunne ikke hente råd akkurat nå. Sjekk at API-nøkkelen er riktig.",
      sources: []
    };
  }
};

export const generateHighQualityImage = async (prompt: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-001',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });
    
    const part = response.candidates?.[0]?.content?.parts.find(p => 'inlineData' in p);
    return part && 'inlineData' in part ? `data:image/png;base64,${part.inlineData.data}` : null;
  } catch (e) {
    console.error("High quality image generation failed:", e);
    return null;
  }
};

export const editWoodImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-001',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/png',
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => 'inlineData' in p);
    return part && 'inlineData' in part ? `data:image/png;base64,${part.inlineData.data}` : null;
  } catch (error) {
    console.error("Image edit failed:", error);
    return null;
  }
};

export const generateWoodVideo = async (base64Image: string, prompt: string): Promise<string | null> => {
  // Placeholder for video generation - requires special handling
  console.warn("Video generation not yet implemented");
  return null;
};
