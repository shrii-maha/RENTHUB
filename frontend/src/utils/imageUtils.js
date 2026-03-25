export const getImageUrl = (imageFilename) => {
  if (!imageFilename) return null;
  
  const trimmed = imageFilename.trim();
  
  // If it's already a full URL (starts with http or https or //), return it as is
  if (/^(https?:)?\/\//.test(trimmed)) {
    return trimmed;
  }
  
  // Otherwise, prefix with the backend uploads URL
  return `http://localhost:5000/uploads/${trimmed}`;
};
