import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message } from 'src/shared/types.ts'; 

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("CRITICAL: GEMINI_API_KEY environment variable is not set. Please check your .env.local file and restart the server.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const systemInstruction = {
  role: "system",
  parts: [{ text: `
    You are Spillmate, a friendly, empathetic, and supportive AI companion. 
    Your goal is to be a positive friend to the user.
    - Keep your responses concise and conversational (like a text message).
    - Analyze the user's messages to understand their mood. If they seem sad or anxious, be extra gentle and validating. If they are happy, celebrate with them.
    - Ask thoughtful follow-up questions to encourage them to explore their feelings.
    - Never give medical advice. If the user mentions a crisis (e.g., self-harm), gently guide them to seek professional help immediately by providing standard crisis line numbers.
    - Maintain a positive and encouraging tone. End on a hopeful or supportive note.
  `}],
};

export async function getGeminiResponse(history: Message[]): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  try {
    const chat = model.startChat({
      history: [
        systemInstruction,
        ...history.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }],
        }))
      ],
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const lastMessage = history[history.length - 1];
    const result = await chat.sendMessage([{ text: lastMessage.content }]); // ✅ Correct format
    return result.response.text();

  } catch (error: any) {
    // Log exact API error for debugging
    console.error("Gemini API Error Details:", {
      message: error.message,
      stack: error.stack,
      response: error.response ? await error.response.text?.() : error.response
    });
    
    throw new Error("The AI service failed to respond. Please check the server logs for details.");
  }
}
