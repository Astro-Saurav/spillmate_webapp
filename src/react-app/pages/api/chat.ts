import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message } from 'src/shared/types'; // This path to your types must be correct

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // --- 1. Security & Request Validation ---
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `This route only accepts POST requests.` });
  }

  // --- 2. AI Server-Side Configuration ---
  const MODEL_NAME = "gemini-1.5-pro-latest";
  const API_KEY = process.env.GEMINI_API_KEY;

  // This check is the most important part. It confirms your server has the key.
  if (!API_KEY) {
    console.error("SERVER CONFIGURATION ERROR: The GEMINI_API_KEY is not available on the server.");
    return res.status(500).json({ message: "The server is missing its AI API key." });
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  const systemInstruction = {
    parts: [{ text: `
      You are Spillmate, a friendly, empathetic AI companion. Keep your responses concise and supportive. Never give medical advice.
    `}],
  };

  // --- 3. Execute Chat Logic ---
  try {
    const { messages } = req.body as { messages: Message[] };

    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: 'Your request did not contain any messages.' });
    }
    
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ]
    });

    // We get the chat history from the frontend, then send the newest message.
    const conversationHistory = messages.slice(0, -1);
    const latestMessage = messages[messages.length - 1];

    if (latestMessage.role !== 'user') {
      throw new Error("Invalid chat history: The final message must be from the user.");
    }

    const chat = model.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(latestMessage.content);
    const aiResponseText = result.response.text();
    
    // --- 4. Send Successful Response ---
    return res.status(200).json({ content: aiResponseText });

  } catch (error: any) {
    // --- 5. Universal Error Handler ---
    // This makes sure you ALWAYS get a clean JSON error on the frontend.
    console.error("A fatal error occurred in the chat API:", error);
    return res.status(500).json({ message: error.message || "An unknown server error happened." });
  }
}
