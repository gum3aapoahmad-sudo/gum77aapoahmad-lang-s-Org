import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { APP_MODELS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateMockup = async (
  logoBase64: string,
  productPrompt: string,
  userEditPrompt?: string
): Promise<string> => {
  const prompt = `
    Transform this image into a high-end luxury fashion campaign for the brand "AMNA" (أمنة).
    Product/Target: ${productPrompt}.
    
    CRITICAL REQUIREMENTS:
    - Reveal and enhance the model’s face naturally while preserving her real facial features, expression, and identity with no distortion.
    - Preserve the exact body proportions, pose, and dress design without any modification.
    - Replace the background with an ultra-luxurious, elegant setting inspired by international luxury brands (e.g., Parisian architectural elements, neutral tones, cinematic soft lighting).
    - Add the luxury brand logo "AMNA" in an elegant, refined style. Place it in the top-left corner or a prestigious, well-balanced position.
    - Add the Arabic name "أمنة" subtly underneath the English logo in a smaller minimalist font.
    - Apply professional editorial retouching: natural high-end skin retouch (no plastic effect), enhanced fabric shine/texture, and luxury color grading.
    - Subtle gold or champagne accents.
    - Output & Print Requirements: Optimized for print (23.5 x 29.5 cm), ultra-high resolution (4K upscale), sharp details, no noise, no artifacts.
    - No distortion. Ultra-realistic, premium, international brand quality.
    
    User refinement: ${userEditPrompt || 'Professional luxury fashion photography.'}
  `;

  const response = await ai.models.generateContent({
    model: APP_MODELS.IMAGE,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: logoBase64.split(',')[1],
          },
        },
        { text: prompt },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error('Image generation failed.');
};

export const refineMockup = async (
  baseImageBase64: string,
  editPrompt: string
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: APP_MODELS.IMAGE,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: baseImageBase64.split(',')[1],
          },
        },
        { text: `Refine this "AMNA" luxury campaign: ${editPrompt}. 
          Maintain model's exact facial features and identity. 
          Enhance fabric textures, lace, and clarity. 
          Professional editorial retouching, natural skin tones, and cinematic depth. 
          Maintain high-res 4K upscale quality.` },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error('Refinement failed.');
};