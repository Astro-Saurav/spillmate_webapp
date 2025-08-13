
import type { NextApiRequest, NextApiResponse } from 'next'; // Vercel uses Next.js types for API routes
import { GoogleGenerativeAI } from '@google/generative-ai';

// The 'Message' type is needed here too. Define it right in the file for simplicity.
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // --- Security: Only allow POST requests ---
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // --- Configuration ---
  const API_KEY = process.env.GEMINI_API_KEY;

  // This check confirms your API key is set on Vercel
  if (!API_KEY) {
    console.error("SERVER ERROR: GEMINI_API_KEY is not configured.");
    return res.status(500).json({ message: "Server is missing AI configuration." });
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  // --- Main Logic ---
  try {
    const { messages } = req.body as { messages: Message[] };

    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: 'No messages were provided.' });
    }

    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role !== 'user') { throw new Error("Invalid request payload."); }

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(latestMessage.content);
    
    // --- Success ---
    return res.status(200).json({ content: result.response.text() });

  } catch (error: any) {
    // --- Failure ---
    console.error("A fatal error occurred in the chat API:", error);
    return res.status(500).json({ message: error.message || "An unknown server error." });
  }
}
