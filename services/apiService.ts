import { Tip, GoogleUser, TransportMode } from '../types';
import { getCoordinatesForAddress, getAiChatResponseStream } from './geminiService';

// This function retrieves the session token for making authenticated requests.
const getAuthToken = (): string | null => {
    return localStorage.getItem('session-token');
};

/**
 * Fetches the initial list of tips.
 * In a real app, this would be a GET /api/tips call.
 */
export const getTips = async (): Promise<Tip[]> => {
    console.log("Fetching initial tips...");
    // This mock data represents what the backend would fetch from its database.
    return [
        {
          id: 1,
          origin: "Indira Gandhi International Airport (DEL)",
          destination: "New Delhi Metro Station",
          transportMode: TransportMode.Metro,
          estimatedCost: "₹60",
          estimatedTime: "25 minutes",
          advice: "Use the Airport Express Line (Orange Line) for a fast and cheap ride to the city center. It's much better than dealing with taxi or auto-rickshaw touts at the airport.",
          user: { username: "MetroManMohan", score: 180, badges: ["Metro Master", "Top Contributor"] },
          rating: 32,
          coordinates: { lat: 28.5562, lng: 77.1000 }
        },
        {
          id: 2,
          origin: "Connaught Place",
          destination: "Chandni Chowk",
          transportMode: TransportMode.AutoRickshaw,
          estimatedCost: "₹80-120",
          estimatedTime: "15-20 minutes",
          advice: "Negotiate the fare *before* getting into an auto-rickshaw, or use a ride-hailing app like Uber or Ola to book one for a fixed price. The traffic can be heavy, but it's a classic Delhi experience.",
          user: { username: "DelhiExplorerPriya", score: 110, badges: ["Bargain Hunter"] },
          rating: 25,
          coordinates: { lat: 28.6304, lng: 77.2177 }
        },
        {
          id: 3,
          origin: "Central Delhi",
          destination: "Various Locations",
          transportMode: TransportMode.Bus,
          estimatedCost: "₹5-25",
          estimatedTime: "Varies",
          advice: "Delhi's DTC buses are incredibly cheap, especially the AC ones. Use a transit app like Google Maps to figure out routes. It's a great way to see the city like a local.",
          user: { username: "LocalSaverRavi", score: 90, badges: ["Frugal Traveler", "Route Wizard"] },
          rating: 18,
          coordinates: { lat: 28.6139, lng: 77.2090 }
        },
    ];
};

/**
 * Submits a new tip. This now calls the Gemini API for coordinates.
 * In a real app, this would be a POST /api/tips call.
 */
export const addTip = async (tipData: Omit<Tip, 'id' | 'rating' | 'user' | 'coordinates'>): Promise<Tip> => {
    console.log("Submitting new tip:", tipData);
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required to add a tip.");
    
    const loggedInUser = JSON.parse(localStorage.getItem('fairfare-user') || '{}') as GoogleUser;
    
    // Fetch coordinates from Gemini API based on the origin
    const fetchedCoordinates = await getCoordinatesForAddress(tipData.origin);

    const newTip: Tip = {
        ...tipData,
        id: Date.now(),
        rating: 0,
        user: { username: loggedInUser.name || "Anonymous", score: 1, badges: ["New Contributor"] },
        ...(fetchedCoordinates && { coordinates: fetchedCoordinates })
    };
    
    // Broadcast the new tip to other open tabs/windows.
    // This simulates a server-pushed update (e.g., via WebSockets).
    const channel = new BroadcastChannel('fairfare_tips');
    channel.postMessage(newTip);
    channel.close();

    return newTip;
};

/**
 * Updates the rating of a tip.
 * In a real app, this would be a PUT /api/tips/{tipId}/rating call.
 */
export const updateRating = async (tipId: number, change: number): Promise<void> => {
    console.log(`Updating rating for tip ${tipId} by ${change}`);
    await new Promise(res => setTimeout(res, 200)); // Simulate network delay
    // The backend would update the rating in the database.
    return;
};

/**
 * Gets a streaming chat response from the Gemini API.
 * In a real app, this would be a POST /api/chat call that returns a stream.
 */
export async function* postChatMessageStream(message: string, contextTips: Tip[]): AsyncGenerator<string> {
    console.log("Streaming chat message from backend:", message);
    // Directly yield from the Gemini service stream
    yield* getAiChatResponseStream(message, contextTips);
}

/**
 * Verifies a Google credential and creates a session.
 * In a real app, this would be a POST /api/auth/google call.
 */
export const loginWithGoogle = async (credential: string): Promise<{ user: GoogleUser; token: string; }> => {
    console.log("Sending Google credential to backend for verification...");
    await new Promise(res => setTimeout(res, 400)); // Simulate network delay
    
    // Simulate decoding the JWT to get user info (the backend would do this securely)
    const decoded = JSON.parse(atob(credential.split('.')[1]));
    const user: GoogleUser = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture
    };
    
    // This is a placeholder for a real, secure token from your backend.
    const token = "backend-issued-secure-session-token-placeholder";

    return { user, token };
};