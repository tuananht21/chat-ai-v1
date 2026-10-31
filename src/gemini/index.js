import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });
async function run(prompt, chatHistory = []) {
  const history = chatHistory.map((item) => {
    return {
      role: item.isBot ? 'model' : 'user',
      parts: [{ text: item.text }],
    }
  });
  const chat = ai.chats.create({
    model: "gemini-3.5-flash-lite",
    history: history,
    config: {
      tools: [{ codeExecution: {} }],
    }
  });

  const response = await chat.sendMessage({
    message: prompt
  });
  return response.text;
}

export default run;