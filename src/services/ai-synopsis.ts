// AI Synopsis Generation Service using Google GenAI
import { GoogleGenAI } from "@google/genai";

class AiSynopsisService {
  private ai: GoogleGenAI | null = null;
  private cache: Map<string, string> = new Map();

  constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
    
    if (apiKey && apiKey !== 'your_api_key_here') {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.warn('Google GenAI API key not configured. AI synopsis generation will be disabled.');
    }
  }

  /**
   * Check if the AI service is available
   */
  isAvailable(): boolean {
    return this.ai !== null;
  }

  /**
   * Generate an enhanced synopsis for a movie or TV show
   * @param title - The title of the movie/show
   * @param originalSynopsis - The original synopsis
   * @param year - Release year
   * @param rating - Rating (optional)
   * @param genres - Array of genres (optional)
   * @returns Enhanced synopsis or original if generation fails
   */
  async generateSynopsis(
    title: string,
    originalSynopsis: string,
    year?: string | number,
    rating?: number,
    genres?: string[]
  ): Promise<string> {
    if (!this.ai || !originalSynopsis || originalSynopsis.trim().length === 0) {
      return originalSynopsis;
    }

    // Create a cache key
    const cacheKey = `${title}-${year}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Build the prompt for AI to enhance the synopsis
      let prompt = `You are a professional movie/TV synopsis writer who has considered all previous feedback given to movies. Given the following information about a ${genres && genres.length > 0 ? genres.join(', ') : ''} title, create an engaging, concise, and well-written synopsis that is more compelling than the original while staying true to the facts.

Title: "${title}"${year ? `\nYear: ${year}` : ''}${rating ? `\nRating: ${rating}/10` : ''}${genres && genres.length > 0 ? `\nGenres: ${genres.join(', ')}` : ''}

Original synopsis: "${originalSynopsis}"

Please write a silly, engaging synopsis (2-3 paragraphs maximum) that captures the essence of the story with spoilers. Make it fun and entertaining. No formatting in the response, just the text.`;

      const response = await this.ai.models.generateContent({
        model: "gemma-3-27b-it",
        contents: prompt,
      });

      const enhancedSynopsis = response.text?.trim();
      
      if (enhancedSynopsis && enhancedSynopsis.length > 0) {
        // Cache the result
        this.cache.set(cacheKey, enhancedSynopsis);
        return enhancedSynopsis;
      }
      
      return originalSynopsis;
    } catch (error) {
      console.error('Error generating AI synopsis:', error);
      return originalSynopsis; // Fallback to original synopsis
    }
  }

  /**
   * Clear the synopsis cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const aiSynopsisService = new AiSynopsisService();
