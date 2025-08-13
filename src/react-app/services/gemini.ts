import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message } from 'src/shared/types.ts'; // Assuming types are in `src/shared/types.ts`

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  // This is a server-side check; the app will fail to build if this is not set.
  throw new Error("CRITICAL: GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Define the persona for your AI. This is a constant instruction.
const systemInstruction = {
  // NOTE: This role is for organization; it's applied in getGenerativeModel.
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
  
  // --- FIX #1: The model must be initialized WITH the system instruction. ---
  // This sets the AI's persona for the entire conversation.
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    systemInstruction, 
  });

  // --- FIX #2: Separate the previous conversation from the new message. ---
  const conversationHistory = history.slice(0, -1); // Get all messages EXCEPT the very last one.
  const latestMessage = history[history.length - 1];   // Get the NEW message that needs a response.

  // A safety check to ensure your logic is correct.
  if (!latestMessage || latestMessage.role !== 'user') {
      throw new Error("Logic Error: The last message in the history must be from the user.");
  }

  try {
    const chat = model.startChat({
      // Initialize the chat with ONLY the previous messages.
      history: conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user', // Gemini uses 'model' for the assistant role.
        parts: [{ text: msg.content }],
      })),
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

    // --- FIX #3: Send ONLY the content of the new message. ---
    // The chat already has the history; now it just needs the new prompt.
    const result = await chat.sendMessage(latestMessage.content);
    return result.response.text();

  } catch (error: any) {
    // This is good, detailed error logging for your server console.
    console.error("Gemini API Error Details:", error);
    throw new Error("The AI service failed to respond. Please check the server logs.");
  }
}
