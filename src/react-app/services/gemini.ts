//
// ➡️ LOCATION: /src/pages/api/chat.ts
//    (All-in-one API Route)
//
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message } from 'src/shared/types.ts';  // This path must be correct

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // --- 1. Basic API Setup ---
  // We only allow POST requests. Any other method will be rejected.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // --- 2. Gemini AI Configuration (MERGED) ---
  const MODEL_NAME = "gemini-1.5-pro-latest";
  const API_KEY = process.env.GEMINI_API_KEY;

  // The MOST CRITICAL check: Is the API key available to the server?
  if (!API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY environment variable is not set on the server.");
    return res.status(500).json({ message: "The server is missing its AI configuration. Please contact the administrator." });
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  const systemInstruction = {
    parts: [{ text: `
      You are Spillmate, a friendly, empathetic, and supportive AI companion.
      Your goal is to be a positive friend to the user.
      - Keep your responses concise and conversational (like a text message).
      - Ask thoughtful follow-up questions to encourage them to explore their feelings.
      - Never give medical advice. If the user mentions a crisis, gently guide them to seek professional help immediately.
    `}],
  };

  // --- 3. The Main Logic in a try...catch block ---
  try {
    const { messages } = req.body as { messages: Message[] };

    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: 'Bad Request: No messages were provided.' });
    }
    
    // --- Gemini Logic (MERGED) ---
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction,
    });

    // Separate the past conversation from the brand new message.
    const conversationHistory = messages.slice(0, -1);
    const latestMessage = messages[messages.length - 1];

    if (!latestMessage || latestMessage.role !== 'user') {
      throw new Error("API Logic Error: The last message must be from the user.");
    }

    const chat = model.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(latestMessage.content);
    const aiResponseText = result.response.text();

    if (!aiResponseText) {
      throw new Error("The AI returned an empty response. This can happen if a safety filter was triggered.");
    }
    
    // --- 4. Success Response ---
    // Send the AI's response text back to the frontend.
    return res.status(200).json({ content: aiResponseText });

  } catch (error: any) {
    // --- 5. Error Handling ---
    // If anything in the try block fails, this will catch it.
    console.error("FATAL ERROR IN /api/chat ENDPOINT:", error);
    // Send back a clean, JSON-formatted error.
    return res.status(500).json({ message: error.message || "An unexpected error occurred on the server." });
  }
}
