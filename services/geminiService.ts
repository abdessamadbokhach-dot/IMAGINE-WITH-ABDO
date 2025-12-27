
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Using gemini-2.5-flash-image for image editing tasks as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Gemini Image Editing Error:", error);
    throw error;
  }
};
