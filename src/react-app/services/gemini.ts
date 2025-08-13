
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message } from 'src/shared/types'; // Using relative path is crucial

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("SERVER ERROR: The GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Your AI's persona and instructions
const systemInstruction = {
  parts: [{ text: `
    You are Spillmate, a friendly and empathetic AI companion. Your goal is to be a supportive friend.
    - Keep responses concise and conversational.
    - Ask thoughtful follow-up questions.
    - Never give medical advice.
  `}],
};

export async function getGeminiResponse(history: Message[]): Promise<string> {
  // ✅ FIX: The model is initialized WITH the system instructions.
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction,
    safetySettings: [ // ✅ FIX: This uses the HarmCategory imports
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ]
  });

  // Separate the history from the new message
  const conversationHistory = history.slice(0, -1);
  const latestMessage = history[history.length - 1];

  if (latestMessage.role !== 'user') {
    throw new Error("Logic Error: Last message must be from user.");
  }

  try {
    const chat = model.startChat({
      // ✅ FIX: Correctly maps history, which satisfies the `role` property requirement.
      history: conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(latestMessage.content);
    return result.response.text();
  } catch (error) {
    console.error("FATAL: Gemini API request failed:", error);
    throw new Error("The AI service failed to respond.");
  }
}
