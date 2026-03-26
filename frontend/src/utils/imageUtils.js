export const getImageUrl = (imageFilename) => {
  if (!imageFilename) return null;
  
  const trimmed = imageFilename.trim();
  
  // If it's already a full URL (starts with http or https or //), return it as is
  if (/^(https?:)?\/\//.test(trimmed)) {
    return trimmed;
  }
  
  // Get base API URL from environment variables
  // VITE_API_URL is typically: https://renthub-ypl5.onrender.com/api
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  // Remove '/api' from the end to get the BASE backend URL
  const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
  
  // Prefix with the dynamic backend uploads URL
  return `${baseUrl}/uploads/${trimmed}`;
};
