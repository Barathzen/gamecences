import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";

// The API key is securely accessed from Netlify's environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Constants from the original project
const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
const IMAGEN_MODEL = "imagen-3.0-generate-001";

function parseJsonFromResponse(response: GenerateContentResponse): any {
  let jsonStr = response.text?.trim() || '';
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }
  return JSON.parse(jsonStr);
}

const handler: Handler = async (event: HandlerEvent) => {
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers
    };
  }

  try {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable is not set on the server.");
    }

    const { action, payload } = JSON.parse(event.body || '{}');
    if (!action || !payload) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing action or payload' }), headers };
    }
    
    let data;

    switch (action) {
      case 'generateAdventureStep': {
        const { promptContent, systemInstruction } = payload;
        const response = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: promptContent,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
            },
        });
        data = parseJsonFromResponse(response);
        break;
      }
      
      case 'generateAdventureImage': {
        const { prompt } = payload;
        const HF_API_URL = "https://router.huggingface.co/hyperbolic/v1/images/generations";
        const HF_API_KEY = process.env.HF_API_KEY || process.env.HF_TOKEN; // Use either env var

        const hfResponse = await fetch(HF_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${HF_API_KEY}`,
          },
          body: JSON.stringify({
            prompt,
            model_name: "SD2"
          }),
        });

        if (!hfResponse.ok) {
          throw new Error(`Hugging Face Hyperbolic API error: ${hfResponse.statusText}`);
        }

        const arrayBuffer = await hfResponse.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString('base64');
        data = { imageUrl: `data:image/png;base64,${base64Image}` };
        break;
      }

      case 'generateNewStoryCategory': {
        const { existingTitles } = payload;
        const systemInstruction = `You are a creative engine for a text-based adventure game platform. Your task is to invent a new, unique, and exciting story category. Do not use any of the following titles: ${existingTitles.join(', ')}. The category must have a compelling title, a short description, an engaging starting prompt, and a detailed system instruction for another AI (the Game Master). The system instruction MUST tell the GM to reply only with a JSON object with keys "sceneDescription", "imagePrompt", and "choices". Respond ONLY with a single JSON object adhering to this exact structure: { "id": "string (a unique, single-word lowercase identifier, e.g., 'hauntedship' or 'desertkingdom')", "title": "string", "description": "string", "initialPrompt": "string", "systemInstruction": "string" }`;

        const response = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: "Generate a new story category.",
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                temperature: 0.9,
            },
        });
        data = parseJsonFromResponse(response);
        break;
      }

      default:
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action specified' }), headers };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers
    };

  } catch (error) {
    console.error(`Error in proxy function:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
      headers
    };
  }
};

export { handler };
