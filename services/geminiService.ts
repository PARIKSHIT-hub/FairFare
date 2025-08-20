import { GoogleGenAI, Type } from "@google/genai";
import { Tip, Coordinates } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gets geographic coordinates for a given address string.
 * @param address The address to geocode.
 * @returns A promise that resolves to a Coordinates object or null if not found.
 */
export const getCoordinatesForAddress = async (address: string): Promise<Coordinates | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find the geographic coordinates (latitude and longitude) for this location in India: ${address}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        lat: { type: Type.NUMBER, description: "Latitude" },
                        lng: { type: Type.NUMBER, description: "Longitude" },
                    },
                    required: ["lat", "lng"],
                },
            },
        });
        
        const jsonString = response.text.trim();
        const coordinates = JSON.parse(jsonString);
        
        if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
            return coordinates;
        }
        console.warn("Failed to parse coordinates from Gemini response:", jsonString);
        return null;
    } catch (error) {
        console.error("Error fetching coordinates from Gemini API:", error);
        return null;
    }
};

/**
 * Generates a streaming chat response from the Gemini API.
 * @param message The user's message.
 * @param contextTips A list of tips to provide as context.
 * @returns An async generator that yields response chunks.
 */
export async function* getAiChatResponseStream(message: string, contextTips: Tip[]): AsyncGenerator<string> {
    const systemInstruction = `You are FareGuide, an expert AI travel assistant for India. 
    Your goal is to provide helpful, safe, and budget-conscious travel advice.
    - Be friendly, clear, and encouraging.
    - Use the provided "Community Tips" as your primary source of information when relevant. Reference them directly if a user's question is about a specific trip shown.
    - If the user asks a general question, use your own knowledge but keep the advice grounded and practical for a traveler in India.
    - Do not make up fares or routes; if you don't know, say so.
    - Format responses with simple markdown (bolding with **text**).`;

    const tipsContext = contextTips.length > 0 ? `
---
**Community Tips on Screen:**
${contextTips.map(tip => `
- **From:** ${tip.origin}
  **To:** ${tip.destination}
  **Mode:** ${tip.transportMode}
  **Cost:** ${tip.estimatedCost}
  **Advice:** ${tip.advice}
`).join('\n')}
---
` : "There are no specific tips on the screen right now.";

    const contents = `${tipsContext}\n\n**User's Question:** ${message}`;

    try {
        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        for await (const chunk of response) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error streaming chat response from Gemini API:", error);
        yield "I'm sorry, I encountered an error while trying to respond. Please check the connection and try again.";
    }
}
