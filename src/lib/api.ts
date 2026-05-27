/**
 * Centralized API URL utility for PitchIQ.
 * Dynamically resolves backend endpoints based on the deployment environment.
 */
export const getApiUrl = (path: string): string => {
  // Read VITE_API_URL environment variable, falling back to localhost in dev
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  
  // Clean trailing slash from base url
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  
  // Clean leading slash from path
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${cleanBase}${cleanPath}`;
};
