# Art Revolution - Timișoara Events

Modern Node.js Express app for Timișoara events aggregation with AI enhancement using Gemini API (Ollama fallback). Features contemporary UI showcasing Romania's European Capital of Culture.

## 🚀 Features

- **Event Aggregation**: Scrapes multiple Timișoara event sources
- **AI Enhancement**: Uses Gemini API to enhance event descriptions and categorization
- **Fallback Support**: Ollama integration when Gemini is unavailable
- **Modern UI**: Contemporary, bold design with dark theme
- **Real-time Updates**: Automatic cache refresh every 6 hours
- **Mobile Responsive**: Works perfectly on all devices
- **Easy Deployment**: Ready for Vercel, Railway, or Render

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **AI**: Google Gemini API, Ollama (fallback)
- **Frontend**: Vanilla JavaScript, CSS3
- **Scraping**: Axios, Cheerio
- **Security**: Helmet, CORS

## 📦 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Davb0/art-Revolution-required.git
cd art-Revolution-required

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
```env
# Server
PORT=3000
NODE_ENV=production

# Gemini AI (get from Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here

# Ollama (fallback - optional)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2

# Cache (optional)
CACHE_DURATION_HOURS=6
```

### 3. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

### 4. Run the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Visit `http://localhost:3000` to see your Timișoara events app!

## 🎨 What You'll See

- **Hero Section**: Bold branding for Art Revolution
- **AI-Enhanced Events**: Events with rich descriptions and categorization
- **Smart Filtering**: Filter by category, mood, and target audience
- **Event Details**: Full modal with enhanced information
- **Real-time Stats**: Event count, categories, and last update time

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Render

1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in dashboard

## 🔧 Configuration

### Event Sources

The app aggregates events from multiple sources:
- **Official Timișoara**: City council events
- **WhatToDo.ro**: Entertainment and cultural events
- **Mock Events**: Fallback cultural events

### AI Enhancement

Events are enhanced with:
- **Rich Descriptions**: Engaging, contextual descriptions
- **Categorization**: Music, art, theater, food, tech, etc.
- **Mood Classification**: Energetic, relaxed, festive, intimate
- **Target Audience**: Families, young adults, professionals, artists
- **Smart Tags**: Relevant hashtags for discovery

### Caching Strategy

- **Automatic Updates**: Every 6 hours via cron job
- **Manual Refresh**: Button to force cache update
- **Graceful Fallbacks**: Shows cached events if sources fail

## 🎯 API Endpoints

```bash
# Get all events (enhanced by default)
GET /api/events

# Get events by category
GET /api/events?category=music

# Get raw events (no AI enhancement)
GET /api/events?enhanced=false

# Get single event
GET /api/events/:id

# Manual refresh (requires API key)
POST /api/events/refresh

# Health check
GET /api/health
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin protection
- **Rate Limiting**: Prevents abuse
- **Input Sanitization**: XSS protection
- **API Key Protection**: Secure admin endpoints

## 🎨 Customization

### Styling

Edit `/public/styles.css`:
```css
:root {
  --primary-color: #ff6b35;    /* Change brand color */
  --accent-color: #4ecdc4;     /* Change accent color */
  --background-dark: #0a0a0a;  /* Change background */
}
```

### Event Sources

Add new sources in `/src/services/eventAggregator.js`:
```javascript
{
  name: 'new_source',
  url: 'https://example.com/events',
  scraper: this.scrapeNewSource.bind(this)
}
```

### AI Prompts

Customize AI enhancement in `/src/services/aiService.js`:
```javascript
buildEnhancementPrompt(event) {
  return `Your custom prompt for ${event.title}...`;
}
```

## 🐛 Troubleshooting

### Common Issues

**Events not loading:**
- Check API key configuration
- Verify network connectivity
- Check browser console for errors

**AI enhancement failing:**
- Verify Gemini API key is valid
- Check API quota limits
- Fallback to Ollama if available

**Scraping errors:**
- Event sources may have changed structure
- Check console logs for specific errors
- Mock events will be used as fallback

### Debug Mode

```bash
# Enable detailed logging
NODE_ENV=development npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏛️ About Timișoara

This app celebrates Timișoara as Romania's European Capital of Culture, showcasing the city's vibrant arts scene, rich cultural heritage, and innovative spirit.

---

**Art Revolution** • *Timișoara's Cultural Pulse* • Built with ❤️ for Romania's ECoC
