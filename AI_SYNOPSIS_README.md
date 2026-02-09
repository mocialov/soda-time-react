# AI-Enhanced Synopsis Setup

This document explains the AI-enhanced synopsis feature that has been added to Soda Time.

## Overview

The application now uses Google's GenAI API to generate enhanced, more engaging synopses for movies and TV shows. This feature uses the Gemma AI model to rewrite existing synopses into more compelling descriptions while maintaining factual accuracy.

## Setup Instructions

### 1. Add Your API Key

1. Open the `.env` file in the root of your project
2. Replace `your_api_key_here` with your actual Google GenAI API key:

```env
VITE_GOOGLE_GENAI_API_KEY=your_actual_api_key_here
```

**Note:** The `.env` file is already added to `.gitignore`, so your API key will not be committed to version control.

### 2. Get a Google GenAI API Key

If you don't have an API key yet:

1. Visit: https://ai.google.dev/
2. Sign in with your Google account
3. Navigate to the API section
4. Generate a new API key
5. Copy the key to your `.env` file

### 3. Toggle the Feature

The AI-enhanced synopsis feature can be enabled/disabled through the application settings:

- **Setting name:** `aiEnhancedSynopsis`
- **Default:** `true` (enabled)
- **Location:** Settings → UI Settings

## How It Works

### Automatic Enhancement

When you view movie or show details:

1. The original synopsis is displayed immediately
2. If AI enhancement is enabled, the app sends the synopsis to Google's GenAI API
3. The AI generates an improved version (2-3 paragraphs)
4. The enhanced synopsis replaces the original once ready
5. A loading indicator shows while generation is in progress

### Caching

To improve performance and reduce API calls:

- Enhanced synopses are cached in memory
- The cache key is based on title and year
- Cached synopses are reused for the same content

### Graceful Fallback

The feature is designed to fail gracefully:

- If no API key is configured, the original synopsis is shown
- If the API call fails, the original synopsis is retained
- Error messages are logged to the console for debugging

## Files Modified

### New Files

- `.env` - Environment variables (API key)
- `src/services/ai-synopsis.ts` - AI synopsis service

### Modified Files

- `src/services/settings.ts` - Added `aiEnhancedSynopsis` setting
- `src/components/MovieDetail.tsx` - Integrated AI synopsis
- `src/components/ShowDetail.tsx` - Integrated AI synopsis
- `src/components/MovieDetail.css` - Added loading spinner styles

## API Usage

The feature uses the following Google GenAI configuration:

- **Model:** `gemma-2-9b-it`
- **Input:** Title, year, rating, genres, and original synopsis
- **Output:** Enhanced 2-3 paragraph synopsis
- **Prompt:** Instructs the AI to create an engaging, spoiler-free synopsis

## Cost Considerations

- The Gemma model is free for most use cases
- Check Google's pricing at: https://ai.google.dev/pricing
- Consider rate limits based on your API tier
- Caching reduces redundant API calls

## Troubleshooting

### Synopsis not enhancing

1. Check that your API key is correctly set in `.env`
2. Ensure the key doesn't equal `your_api_key_here`
3. Check the browser console for error messages
4. Verify the `aiEnhancedSynopsis` setting is enabled

### API Errors

- Check your API key validity
- Verify your API quota hasn't been exceeded
- Ensure you have network connectivity
- Check for CORS issues (should not occur in Electron)

## Privacy & Security

- API key is stored locally in `.env`
- The `.env` file is excluded from Git
- Only titles and synopses are sent to the API
- No user data or viewing history is transmitted
- All API communication uses HTTPS

## Future Enhancements

Potential improvements for this feature:

- Persistent caching (IndexedDB)
- Multiple language support
- Synopsis length preferences
- Tone/style customization
- Batch processing for performance
