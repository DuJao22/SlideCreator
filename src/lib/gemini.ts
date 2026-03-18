import { GoogleGenAI, Type } from "@google/genai";

export interface SlideData {
  title: string;
  content: string[];
  script: string;
  iconCategory: string;
  layout?: 'split' | 'grid';
  gridItems?: {
    title: string;
    description: string;
  }[];
  imageUrl?: string;
}

export interface PresentationData {
  slides: SlideData[];
  instagramCaption: string;
}

// Helper to get key from localStorage
function getApiKey(): string | null {
  return localStorage.getItem("gemini_api_key");
}

// Helper to get AI instance
function getAiInstance(): GoogleGenAI {
  const key = getApiKey();
  if (!key) throw new Error("API Key não configurada. Por favor, configure sua chave nas configurações.");
  return new GoogleGenAI({ apiKey: key });
}

// Validation function
export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "hi",
    });
    return true;
  } catch (e) {
    console.error("API Key validation failed", e);
    return false;
  }
}

export async function generatePresentation(theme: string, type: string, count: number, retries = 3): Promise<PresentationData> {
  const ai = getAiInstance();
  const prompt = `Crie uma apresentação profissional sobre o tema "${theme}".
Tipo de conteúdo: ${type}.
Quantidade de slides: ${count}.
O conteúdo deve ser rico, informativo e estruturado.

MANDATÓRIO: Você DEVE preencher todo o conteúdo. NÃO deixe campos vazios.

Para cada slide, forneça:
- Um título impactante.
- 'layout': Use 'split' para slides normais (tópicos + imagem). Use 'grid' para slides que apresentam conceitos, recursos, passos ou benefícios distintos.
- 'content': O conteúdo resumido em tópicos (bullet points). Use para slides do tipo 'split'. DEVE ter pelo menos 3 tópicos.
- 'gridItems': Uma lista de itens (título e descrição curta). Use para slides do tipo 'grid'. DEVE ter pelo menos 3 itens, cada um com título e descrição detalhada.
- 'script': Um roteiro de fala detalhado para o apresentador.
- 'iconCategory': Uma categoria de ícone em inglês (ex: 'technology', 'business', 'growth').
- 'imagePrompt': (APENAS PARA O PRIMEIRO SLIDE) Um prompt detalhado para gerar uma imagem profissional que represente o tema do primeiro slide.

Além disso, crie uma legenda para Instagram baseada no conteúdo geral da apresentação, incluindo hashtags.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  layout: { type: Type.STRING, description: "Either 'split' or 'grid'" },
                  content: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Bullet points for 'split' layout"
                  },
                  gridItems: {
                    type: Type.ARRAY,
                    description: "Items for the 'grid' layout",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                      },
                      required: ["title", "description"]
                    }
                  },
                  script: { type: Type.STRING },
                  iconCategory: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING, description: "Prompt for image generation for the first slide" }
                },
                required: ["title", "layout", "script"]
              }
            },
            instagramCaption: { type: Type.STRING }
          },
          required: ["slides", "instagramCaption"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}") as PresentationData;

    // Generate image for the first slide if imagePrompt exists
    if (data.slides[0] && (data.slides[0] as any).imagePrompt) {
      const imagePrompt = (data.slides[0] as any).imagePrompt;
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
      });
      
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          data.slides[0].imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    return data;
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`Presentation generation failed, retrying... (${retries} retries left)`, error);
      const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
      const delay = isRateLimit ? 15000 : 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return generatePresentation(theme, type, count, retries - 1);
    }
    throw error;
  }
}

export async function generatePresentationFromText(text: string, retries = 3): Promise<PresentationData> {
  const ai = getAiInstance();
  const prompt = `O usuário forneceu o seguinte texto base para uma apresentação:

"${text}"

Você deve preservar a estrutura original (ex: se o usuário dividiu em "Slide 1", "Slide 2", mantenha essa divisão e quantidade).
Extraia e formate o conteúdo para cada slide, preservando o texto original o máximo possível.

MANDATÓRIO: Você DEVE preencher todo o conteúdo. NÃO deixe campos vazios.

Para cada slide, forneça:
- Um título impactante (baseado no texto).
- 'layout': Use 'split' para slides normais (tópicos + imagem). Use 'grid' para slides que apresentam conceitos, recursos, passos ou benefícios distintos.
- 'content': O conteúdo resumido em tópicos (bullet points) fiéis ao texto original. Use para slides do tipo 'split'. DEVE ter pelo menos 3 tópicos.
- 'gridItems': Uma lista de itens (título e descrição curta). Use para slides do tipo 'grid'. DEVE ter pelo menos 3 itens, cada um com título e descrição detalhada.
- 'script': Um roteiro de fala detalhado para o apresentador.
- 'iconCategory': Uma categoria de ícone em inglês (ex: 'technology', 'business', 'growth').
- 'imagePrompt': (APENAS PARA O PRIMEIRO SLIDE) Um prompt detalhado para gerar uma imagem profissional que represente o tema do primeiro slide.

Além disso, crie uma legenda para Instagram baseada no conteúdo geral da apresentação, incluindo hashtags.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  layout: { type: Type.STRING, description: "Either 'split' or 'grid'" },
                  content: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Bullet points for 'split' layout"
                  },
                  gridItems: {
                    type: Type.ARRAY,
                    description: "Items for the 'grid' layout",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                      },
                      required: ["title", "description"]
                    }
                  },
                  script: { type: Type.STRING },
                  iconCategory: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING, description: "Prompt for image generation for the first slide" }
                },
                required: ["title", "layout", "script"]
              }
            },
            instagramCaption: { type: Type.STRING }
          },
          required: ["slides", "instagramCaption"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}") as PresentationData;

    // Generate image for the first slide if imagePrompt exists
    if (data.slides[0] && (data.slides[0] as any).imagePrompt) {
      const imagePrompt = (data.slides[0] as any).imagePrompt;
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
      });
      
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          data.slides[0].imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    return data;
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`Presentation generation failed, retrying... (${retries} retries left)`, error);
      const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
      const delay = isRateLimit ? 15000 : 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return generatePresentationFromText(text, retries - 1);
    }
    throw error;
  }
}
