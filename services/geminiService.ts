import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generatePostContent = async (topic: string): Promise<string> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini");
    return `منشور تلقائي بواسطة الذكاء الاصطناعي عن: ${topic}. (يرجى تفعيل مفتاح API)`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `اكتب منشوراً قصيراً وجذاباً لمواقع التواصل الاجتماعي باللهجة العربية أو العربية الفصحى البسيطة حول: "${topic}". استخدم الإيموجي المناسب. اجعله أقل من 280 حرفاً.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "عذراً، لا أستطيع التفكير في شيء الآن! 🤖";
  }
};