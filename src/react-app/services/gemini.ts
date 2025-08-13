import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message } from 'src/shared/types'; // Make sure this path is correct

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("CRITICAL: GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// System instruction defines the AI's personality and goals
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
  
  // <-- FIX 1: Pass the systemInstruction during model initialization.
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    systemInstruction, // This is the correct way to set the persona
  });

  // <-- FIX 2: Separate the chat history from the user's latest message.
  const conversationHistory = history.slice(0, -1); // All messages EXCEPT the last one
  const latestMessage = history[history.length - 1]; // The very last message

  if (latestMessage.role !== 'user') {
    throw new Error("The last message in the history must be from the user.");
  }

  try {
    const chat = model.startChat({
      // Initialize the chat with the conversation leading UP TO the last message
      history: conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user', // Gemini expects 'model' role
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.9,
        topP: 1,
        maxOutputTokens: 2048,
      },
       safetySettings: [ // Safety settings remain the same
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    // <-- FIX 3: Send only the content of the latest message.
    const result = await chat.sendMessage(latestMessage.content);
    return result.response.text();

  } catch (error: any) {
    // This error handling is good and will give you detailed logs.
    console.error("Gemini API Error Details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.text ? await error.response.text() : "No response body."
    });
    
    throw new Error("The AI service failed to respond. Please check the server logs.");
  }
}
