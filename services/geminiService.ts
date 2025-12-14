
import { GoogleGenAI } from "@google/genai";
import { UserData } from "../types";

export const generateSlimmingPlan = async (userData: UserData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Como um consultor de elite em bio-hacking e emagrecimento do sistema Rhuan Forms, gere um diagnóstico curto e impactante para:
    Nome: ${userData.name} | Idade: ${userData.age} | Peso: ${userData.weight}kg | Altura: ${userData.height}cm | Objetivo: ${userData.goal} | Atividade: ${userData.activityLevel} | Restrição: ${userData.dietPreference}

    ESTRUTURA DA RESPOSTA:
    1. ANALISE BIOMÉTRICA (Use tom sério e científico).
    2. O PLANO DE ATAQUE (3 passos práticos para o metabolismo dela).
    3. INSIGHT EXCLUSIVO (Algo que ela nunca ouviu sobre emagrecer).
    4. CHAMADA (Diga que o plano IA Especial automatiza tudo isso).

    Mantenha o tom motivador, tecnológico e focado em resultados rápidos. Use emojis modernos.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.9,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Erro ao gerar plano com IA:", error);
    return "Ops! Nosso servidor de IA está sobrecarregado de tantos resultados. Tente novamente em 1 minuto.";
  }
};
