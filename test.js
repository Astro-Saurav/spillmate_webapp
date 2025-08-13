// File: test.js (Corrected for ES Modules)
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize dotenv to load the .env file
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

console.log("--- Starting Test ---");
console.log("Is API Key loaded from .env file?", !!API_KEY);

if (!API_KEY) {
  console.error("CRITICAL: API Key was not found in the .env file! Please check the file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function runTest() {
  try {
    console.log("Sending a simple request to the Gemini API...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const prompt = "Hello, what is your name?";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("-------------------");
    console.log("✅ SUCCESS! Gemini responded:");
    console.log(text);
    console.log("-------------------");
    console.log("This proves your API key and Google Cloud project are configured correctly.");

  } catch (error) {
    console.error("\n--- ❌ TEST FAILED ---");
    console.error("This is the REAL error message directly from Google's server:");
    console.error(error);
    console.error("--------------------");
    console.error("\nThe problem is NOT in your application code. The solution is to fix the issue shown above in your Google Cloud Console (e.g., enable billing).");
  }
}

runTest();