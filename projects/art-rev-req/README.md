# Timișoara Events Aggregator (Node.js + Gemini)

A minimal Node.js Express app that serves a modern homepage for Timișoara events. The backend fetches and aggregates real events using the Gemini API (API key from environment), with fallback to Ollama if Gemini fails. Ready for Vercel, Railway, or Render deployment.

## Features
- Express.js backend
- Gemini API integration (API key from environment)
- Ollama fallback if Gemini fails
- Modern frontend to display events
- Easy deployment to Vercel, Railway, or Render

## Getting Started

1. Copy `.env.example` to `.env` and fill in your Gemini API key.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Visit `http://localhost:3000` to view the app.

## Deployment
- Deploy to Vercel, Railway, or Render. The app is ready for serverless deployment.

## Environment Variables
- `GEMINI_API_KEY` - Your Gemini API key
- `OLLAMA_URL` (optional) - Ollama endpoint (default: http://localhost:11434/api/generate)

## License
MIT
