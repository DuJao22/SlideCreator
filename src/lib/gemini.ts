import { GoogleGenAI, Type } from "@google/genai";

// Use the default free key for text generation
const defaultAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
}

export interface PresentationData {
  slides: SlideData[];
  instagramCaption: string;
}

export async function generatePresentation(theme: string, type: string, count: number, retries = 3): Promise<PresentationData> {
  const prompt = `Crie uma apresentação sobre o tema "${theme}".
Tipo de conteúdo: ${type}.
Quantidade de slides: ${count}.
O conteúdo deve ser profissional, direto e estruturado.

MANDATÓRIO: Você DEVE gerar um 'iconCategory' (em inglês) para TODOS os slides, sem exceção (incluindo o slide 1 / título).

Para cada slide, escolha um layout ('split' ou 'grid') e forneça:
- Um título impactante.
- 'layout': Use 'split' para slides normais (tópicos + imagem). Use 'grid' para slides que apresentam 3 a 6 conceitos, recursos, passos ou benefícios distintos (como um painel de cards).
- 'content': O conteúdo resumido em tópicos (bullet points). Use apenas se o layout for 'split'.
- 'gridItems': Uma lista de itens (título e descrição curta). Use apenas se o layout for 'grid'.
- 'script': Um roteiro de fala detalhado para o apresentador.
- 'iconCategory': Uma categoria de ícone em inglês que represente o slide (ex: 'technology', 'business', 'education', 'health', 'finance', 'art', 'science', 'communication', 'data', 'security', 'people', 'growth', 'idea', 'target', 'success'). É OBRIGATÓRIO PARA TODOS OS SLIDES.

Além disso, crie uma legenda para Instagram baseada no conteúdo geral da apresentação, incluindo hashtags.`;

  try {
    const response = await defaultAi.models.generateContent({
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
                  iconCategory: { type: Type.STRING, description: "MANDATORY: An icon category for this slide in English. Must be provided for ALL slides." }
                },
                required: ["title", "layout", "script", "iconCategory"]
              }
            },
            instagramCaption: { type: Type.STRING }
          },
          required: ["slides", "instagramCaption"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
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
  const prompt = `O usuário forneceu o seguinte texto base para uma apresentação:

"${text}"

Você deve preservar a estrutura original (ex: se o usuário dividiu em "Slide 1", "Slide 2", mantenha essa divisão e quantidade).
Extraia e formate o conteúdo para cada slide, preservando o texto original o máximo possível.

MANDATÓRIO: Você DEVE gerar um 'iconCategory' (em inglês) para TODOS os slides, sem exceção (incluindo o slide 1 / título).

Para cada slide, escolha um layout ('split' ou 'grid') e forneça:
- Um título impactante (baseado no texto).
- 'layout': Use 'split' para slides normais (tópicos + imagem). Use 'grid' para slides que apresentam 3 a 6 conceitos, recursos, passos ou benefícios distintos (como um painel de cards).
- 'content': O conteúdo resumido em tópicos (bullet points) fiéis ao texto original. Use apenas se o layout for 'split'.
- 'gridItems': Uma lista de itens (título e descrição curta). Use apenas se o layout for 'grid'.
- 'script': Um roteiro de fala detalhado para o apresentador.
- 'iconCategory': Uma categoria de ícone em inglês que represente o slide (ex: 'technology', 'business', 'education', 'health', 'finance', 'art', 'science', 'communication', 'data', 'security', 'people', 'growth', 'idea', 'target', 'success'). É OBRIGATÓRIO PARA TODOS OS SLIDES.

Além disso, crie uma legenda para Instagram baseada no conteúdo geral da apresentação, incluindo hashtags.`;

  try {
    const response = await defaultAi.models.generateContent({
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
                  iconCategory: { type: Type.STRING, description: "MANDATORY: An icon category for this slide in English. Must be provided for ALL slides." }
                },
                required: ["title", "layout", "script", "iconCategory"]
              }
            },
            instagramCaption: { type: Type.STRING }
          },
          required: ["slides", "instagramCaption"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
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
