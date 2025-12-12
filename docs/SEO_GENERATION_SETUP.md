# SEO Generation Feature - Setup & Troubleshooting

## Overview
The SEO generation feature uses Google's Gemini AI to automatically generate product titles and descriptions from raw input text. This feature is available in the Products page when adding new products.

## Setup Instructions

### 1. Get a Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key

### 2. Configure Environment Variables
1. Create a `.env.local` file in the project root (if it doesn't exist):
   ```bash
   # PowerShell
   Copy-Item .env.local.example .env.local
   ```

2. Open `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Important**: Restart your Next.js dev server after adding the API key:
   ```powershell
   # Stop the server (Ctrl+C in the terminal)
   # Then restart:
   npm run dev
   ```

### 3. Using the Feature
1. Navigate to the Products page
2. Click "Add Product"
3. In the "Raw Description" field, enter a basic product description
4. Click "Generate Title & Description"
5. The AI will populate the Product Name and Description fields

## Troubleshooting

### Error: "Server configuration error: GEMINI_API_KEY is not set"
**Cause**: The `GEMINI_API_KEY` environment variable is missing or not loaded.

**Solution**:
1. Check that `.env.local` exists and contains `GEMINI_API_KEY=your_key`
2. Restart the dev server (environment variables are only loaded on startup)
3. Verify the key is valid by checking [Google AI Studio](https://aistudio.google.com/app/apikey)

### Error: "Failed to generate content"
**Possible causes**:
- Invalid or expired API key
- Network connectivity issues
- Gemini API quota exceeded
- Invalid model name

**Solutions**:
1. Check server terminal logs for detailed error messages:
   - Look for `Error generating content:` followed by the specific error
   - Check if there's a message about quota, authentication, or network issues

2. Verify your API key is valid:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Ensure the key hasn't been revoked or expired

3. Check your API quota:
   - Free tier has limits on requests per minute/day
   - Check [Google AI Studio](https://aistudio.google.com/app/apikey) for quota information

4. Test the API directly with curl (PowerShell):
   ```powershell
   $apiKey = "your_api_key_here"
   $body = @{
       contents = @(
           @{
               parts = @(
                   @{ text = "Say hello" }
               )
           }
       )
   } | ConvertTo-Json -Depth 10
   
   Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey" `
       -Method Post `
       -ContentType "application/json" `
       -Body $body
   ```

### Error: "Failed to parse the generated content"
**Cause**: The AI returned text that couldn't be parsed as JSON.

**Solution**:
1. Check server logs for "Raw Gemini text:" to see what was returned
2. The prompt might need adjustment if the model returns non-JSON output
3. This is usually temporary - try again or rephrase your raw description

### General Debugging Steps
1. **Check server terminal logs**: The API route logs detailed error information
2. **Check browser console**: Shows the client-side error and HTTP status
3. **Verify .env.local**: Ensure it's in the project root and properly formatted
4. **Restart dev server**: Required after any `.env.local` changes
5. **Test with simple input**: Try a basic description like "red dress" first

## Development Notes

### Files Involved
- `app/api/generate-seo/route.js` - API route handler
- `app/products/page.js` - Client-side integration (handleGenerateSEO function)
- `.env.local` - Environment variables (not committed to git)
- `env.example` - Template for environment variables

### API Route Details
The route:
- Validates input (must be non-empty string)
- Checks for GEMINI_API_KEY before making API calls
- Uses Gemini 2.0 Flash model
- Expects JSON response with `title` and `description` fields
- Logs detailed errors for debugging

### Security Notes
- Never commit `.env.local` to version control (it's in `.gitignore`)
- Keep your API keys secure and rotate them if exposed
- The API key is only used server-side (Next.js API routes)
- Client-side code never sees the API key

## Getting Help
If you continue to experience issues:
1. Copy the full error message from both browser console and server terminal
2. Check if your API key has proper permissions
3. Verify you're using a supported Gemini model (currently: gemini-2.0-flash)
4. Check Google AI Studio for any service outages or announcements
