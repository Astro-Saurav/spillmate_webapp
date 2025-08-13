import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message } from 'src/shared/types'; // Correct relative path

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("CRITICAL SERVER ERROR: The GEMINI_API_KEY is not configured.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Define the AI's persona and instructions
const systemInstruction = {
  parts: [{ text: `
    You are Spillmate, a friendly and empathetic AI companion. Your goal is to be a supportive friend.
    - Keep responses concise and conversational.
    - Ask thoughtful follow-up questions to encourage the user to explore their feelings.
    - Never give medical advice.
  `}],
};

export async function getGeminiResponse(history: Message[]): Promise<string> {
  // This correctly initializes the model with the persona AND safety settings.
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction, // Sets the persona for the AI
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ]
  });

  const conversationHistory = history.slice(0, -1);
  const latestMessage = history[history.length - 1];

  if (latestMessage.role !== 'user') {
    throw new Error("API Logic Error: The last message sent must be from the user.");
  }

  try {
    const chat = model.startChat({
      // This correctly formats the conversation history, which solves the "role is missing" error.
      history: conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(latestMessage.content);
    return result.response.text();
  } catch (error) {
    console.error("Fatal Gemini API request failed:", error);
    throw new Error("The AI service could not respond.");
  }
}
