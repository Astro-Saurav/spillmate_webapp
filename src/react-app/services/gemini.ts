
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message } from 'src/shared/types';

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("SERVER ERROR: GEMINI_API_KEY is not configured.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const systemInstruction = {
  parts: [{ text: `
    You are Spillmate, an empathetic AI companion. Keep responses concise and supportive.
    Ask follow-up questions. Never give medical advice.
  `}],
};

export async function getGeminiResponse(history: Message[]): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction,
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ]
  });

  const conversationHistory = history.slice(0, -1);
  const latestMessage = history[history.length - 1];

  if (latestMessage.role !== 'user') { throw new Error("API Logic Error."); }

  const chat = model.startChat({
    history: conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
  });

  const result = await chat.sendMessage(latestMessage.content);
  return result.response.text();
}
