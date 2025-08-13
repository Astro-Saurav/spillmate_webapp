import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message } from 'src/shared/types'; // Ensure this path is correct

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // --- 1. SETUP & SECURITY ---
  // Only allow POST requests, reject everything else.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // --- 2. AI CONFIGURATION (MERGED) ---
  const MODEL_NAME = "gemini-1.5-pro-latest";
  const API_KEY = process.env.GEMINI_API_KEY;

  // CRITICAL CHECK: If the API key is not configured on the server, fail immediately.
  if (!API_KEY) {
    console.error("FATAL: GEMINI_API_KEY environment variable is not set on the server.");
    return res.status(500).json({ message: "Server AI configuration is missing." });
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  const systemInstruction = {
    parts: [{ text: `
      You are Spillmate, an empathetic AI companion. Your goal is to be a supportive friend.
      - Keep responses concise and conversational.
      - Ask thoughtful follow-up questions.
      - Never give medical advice.
    `}],
  };

  // --- 3. CORE LOGIC (MERGED) ---
  try {
    const { messages } = req.body as { messages: Message[] };
    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: 'No messages were provided in the request.' });
    }

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ]
    });

    const conversationHistory = messages.slice(0, -1);
    const latestMessage = messages[messages.length - 1];

    if (latestMessage.role !== 'user') {
      throw new Error("The last message must be from the user.");
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
      throw new Error("AI returned an empty response, possibly due to a safety filter.");
    }
    
    // --- 4. SUCCESS RESPONSE ---
    // Send the AI's final text back to the frontend.
    return res.status(200).json({ content: aiResponseText });

  } catch (error: any) {
    // --- 5. ERROR HANDLING ---
    // If anything fails above, this will catch it and send a clean error.
    console.error("An error occurred in the chat API endpoint:", error);
    return res.status(500).json({ message: error.message || "An unknown error occurred on the server." });
  }
}
