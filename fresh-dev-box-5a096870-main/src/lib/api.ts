// API Base URL for the Express backend
export const API_BASE = "https://selaro-backend-production.up.railway.app";

// Helper function to make API calls to the Express backend
export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  console.log("API CALL:", { url, body: options.body });

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  console.log("API RESPONSE STATUS:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API ERROR:", errorText);
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("API RESPONSE DATA:", data);
  return data;
}

// Specific API endpoints
export const api = {
  simulateStart: () =>
    apiCall<{
      ok: boolean;
      sessionId: string;
      greeting?: string;
      error?: string;
    }>("/api/simulator/start", {
      method: "POST",
      body: JSON.stringify({}),
    }),

  simulateStep: (message: string, sessionId: string) =>
    apiCall<{
      ok: boolean;
      reply?: string;
      sessionId?: string;
      extracted?: Record<string, string>;
      error?: string;
    }>("/api/simulator/step", {
      method: "POST",
      body: JSON.stringify({ message, sessionId }),
    }),

  debugStatus: () => apiCall<{ ok: boolean; timestamp: string; uptime: number }>("/debug/status"),
};
