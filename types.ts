

export enum TransportMode {
    Taxi = "Taxi",
    Bus = "Bus",
    Metro = "Metro",
    AutoRickshaw = "AutoRickshaw",
    Train = "Train",
    Ferry = "Ferry",
}

export interface User {
    username: string;
    score: number;
    badges: string[];
}

export interface GoogleUser {
    name: string;
    email: string;
    picture: string;
}

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Tip {
    id: number;
    origin: string;
    destination: string;
    transportMode: TransportMode;
    estimatedCost: string;
    estimatedTime: string;
    advice: string;
    user: User;
    rating: number;
    coordinates?: Coordinates;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}


// Extend the Window interface to include the google object from the Google Identity Services script
// and the custom frame object for environment variables.
declare global {
  interface Window {
    google?: any; // For Google Sign-In
    L?: any; // For Leaflet.js
    frame?: {
      env?: {
        // API_KEY is no longer exposed to the client
      }
    }
  }
}