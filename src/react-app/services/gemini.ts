import type { NextApiRequest, NextApiResponse } from 'next';
import { getGeminiResponse } from 'src/server/gemini'; // Adjust this path if your gemini.ts file is elsewhere
import { Message } from 'src/shared/types'; // Adjust this path if your types file is elsewhere

// Define the shape of incoming and outgoing data for type safety
interface ChatRequestBody {
  messages: Message[];
}

interface ChatResponseBody {
  content: string;
}

interface ErrorResponseBody {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponseBody | ErrorResponseBody>
) {
  // --- This line is our critical diagnostic tool ---
  // It checks if the server is actually seeing your API key.
  if (!process.env.GEMINI_API_KEY) {
      console.error("CRITICAL SERVER ERROR: The GEMINI_API_KEY environment variable is missing!");
      // Send a specific JSON error back to the frontend.
      return res.status(500).json({ message: "Server is missing its API Key configuration." });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed. Please use POST.' });
  }

  try {
    const { messages } = req.body as ChatRequestBody;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: 'No messages provided.' });
    }
    
    // Call your actual Gemini service function
    const aiResponseContent = await getGeminiResponse(messages);

    // Send the successful response from the AI
    res.status(200).json({ content: aiResponseContent });

  } catch (error: any) {
    console.error('Error in /api/chat handler:', error);
    
    // If anything goes wrong inside getGeminiResponse, send a clear JSON error.
    res.status(500).json({ message: error.message || "An unexpected error occurred." });
  }
}
