# 🎭 Art Revolution - Timișoara Events Platform

**Experience Timișoara's Cultural Revolution** - A sophisticated Node.js platform showcasing Romania's European Capital of Culture through AI-enhanced event discovery and community-driven submissions.

## ✨ Platform Overview

Art Revolution is a comprehensive cultural events platform designed for Timișoara, Romania's European Capital of Culture. It combines modern web technologies with AI-powered content enhancement to create an immersive experience for discovering local cultural events.

![Main Homepage](./docs/images/homepage-hero.png)
*The main landing page featuring our bold hero section and intuitive navigation*

## 🚀 Key Features

### 🎯 **Smart Event Discovery**
- **AI-Enhanced Events**: Each event is processed through advanced AI for rich descriptions and smart categorization
- **Multi-Source Aggregation**: Automatically fetches from official city sources, community platforms, and local venues
- **Real-time Updates**: Events refresh every 6 hours with manual refresh capability
- **Intelligent Filtering**: Filter by category, mood, target audience, and more

![Events Grid](./docs/images/events-grid.png)
*Dynamic events grid showing AI-enhanced cultural events with smart filtering options*

### 📝 **Community Event Submission**
- **Floating Add Button**: Easy-to-access submission form for community members
- **AI Verification**: Automatic quality assessment and spam detection
- **Auto-Publishing**: Events scoring 70+ are published immediately
- **Rich Form Fields**: Support for images, recurring events, tags, and 14 different categories

![Event Submission Form](./docs/images/submission-form.png)
*Comprehensive event submission modal with all necessary fields for quality event creation*

### 🎨 **Advanced UI/UX**
- **Dark Theme Design**: Contemporary aesthetic perfect for cultural content
- **Mobile-First Responsive**: Optimized for all device sizes
- **Touch Interactions**: Enhanced mobile experience with haptic feedback
- **Smooth Animations**: Engaging transitions and loading states

### 🌍 **Multi-Language Support**
- **English/Romanian Toggle**: Seamless language switching
- **AI Translation**: Automatic content translation for international visitors
- **Localized Content**: Cultural context maintained across languages

![Filter Panel](./docs/images/filter-panel.png)
*Advanced filtering system with categories, moods, and target audience options*

### � **Complete Site Navigation**
- **About Section**: Mission and story behind Art Revolution
- **Partners Page**: Showcasing collaboration with official cultural sources
- **Newsletter Integration**: Weekly cultural digest subscription
- **Contact System**: Direct communication channel with the team

![About Page](./docs/images/about-page.png)
*Professional About page explaining our mission in Timișoara's cultural transformation*

![Partners Page](./docs/images/partners-page.png)
*Partners section highlighting official collaborations with Timișoara cultural institutions*

![Newsletter Page](./docs/images/newsletter-page.png)
*Newsletter subscription with curated events and exclusive cultural content*

![Contact Page](./docs/images/contact-page.png)
*Contact form and information for community engagement and feedback*

## �🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **AI Processing**: Google Gemini API, Ollama (fallback)
- **Frontend**: Vanilla JavaScript, Modern CSS3
- **Data Sources**: Multi-source web scraping with Axios & Cheerio
- **Security**: Helmet.js, CORS, input sanitization
- **Deployment**: Vercel-ready with Railway & Render support

## � Platform Statistics

![Platform Stats](./docs/images/platform-stats.png)
*Real-time statistics showing active events, categories, and last update information*

## 📦 Quick Installation

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/Davb0/art-Revolution-required.git
cd art-Revolution-required

# Install all dependencies
npm install
```

### 2. Environment Configuration

Create your environment file:
```bash
cp .env.example .env
```

**Required Environment Variables:**
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# AI Enhancement (Primary)
GEMINI_API_KEY=your_gemini_api_key_here

# AI Fallback (Optional but recommended)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2

# Email Service (Optional - for contact forms)
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_app_password

# Cache Settings
CACHE_DURATION_HOURS=6
```

### 3. Get Your API Keys

**Gemini API (Recommended):**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env` as `GEMINI_API_KEY`

**Ollama Setup (Fallback):**
```bash
# Install Ollama locally
curl -fsSL https://ollama.ai/install.sh | sh

# Pull recommended model
ollama pull llama2
```

### 4. Launch Application

```bash
# Development with hot-reload
npm run dev

# Production mode
npm start
```

**🌐 Access your platform at:** `http://localhost:3000`

## 🎨 Platform Experience

### 🏠 **Homepage Experience**
Your visitors will see a stunning dark-themed interface with:
- **Bold Hero Section**: "Experience Timișoara's Cultural Revolution" 
- **Live Event Grid**: 20+ curated cultural events with AI enhancement badges
- **Smart Statistics**: Real-time count of events, categories, and last update
- **Intuitive Navigation**: Language toggle, filtering, and refresh controls

### 🎭 **Event Discovery**
Each event card features:
- **AI Enhancement Badge**: Shows events processed by artificial intelligence
- **Rich Descriptions**: Engaging, contextual event information  
- **Smart Categories**: Music, Art, Theater, Food, Technology, and more
- **Mood Indicators**: Energetic, Intimate, Festive vibes
- **Local Venues**: Real Timișoara locations (Opera Națională, Muzeul de Artă, etc.)
- **Pricing Info**: From free events to premium cultural experiences

### 📝 **Event Submission Flow**
Community members can easily:
1. **Click the floating + button** (always visible)
2. **Fill comprehensive form** with 14 category options
3. **Upload event images** (up to 5MB with preview)
4. **Add tags and descriptions** with character counter
5. **Set recurring events** for ongoing cultural activities
6. **Submit for AI review** with real-time progress indicators

### 🎯 **Advanced Filtering**
Visitors can filter by:
- **Categories**: All major cultural event types
- **Mood**: Energetic, Relaxed, Festive, Intimate, Professional
- **Target Audience**: Families, Young Adults, Professionals, Artists

## 🚀 Production Deployment

### 🔥 **Vercel (Recommended)**
Perfect for this Node.js application:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy with automatic configuration
vercel --prod

# Configure environment variables in dashboard
vercel env add GEMINI_API_KEY
vercel env add NODE_ENV production
```

**Benefits**: Automatic HTTPS, global CDN, serverless functions

### 🚂 **Railway**
Great for full-stack applications:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy with environment variables
railway up
```

**Benefits**: Persistent storage, database integration, custom domains

### 🎨 **Render**
Excellent for static sites with API:

1. **Connect Repository**: Link your GitHub repo to Render
2. **Build Settings**: 
   - Build Command: `npm install`
   - Start Command: `npm start`
3. **Environment**: Add all required variables in dashboard
4. **Deploy**: Automatic deployments on git push

**Benefits**: Free tier available, automatic SSL, preview deployments

### ☁️ **Custom VPS Deployment**

```bash
# Clone and setup on your server
git clone https://github.com/Davb0/art-Revolution-required.git
cd art-Revolution-required
npm install --production

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name "art-revolution"
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/art-revolution
```

## ⚙️ Platform Configuration

### 📡 **Event Data Sources**

**Primary Sources:**
- **Timișoara Official** (`primariatm.ro`): Official city events and announcements
- **WhatToDo.ro** (`whattodo.ro/timisoara`): Community-driven event platform
- **Local Events Database**: 20+ curated cultural events with realistic venues

**Fallback Strategy:**
- Mock events ensure platform always has content
- Graceful degradation when external sources fail
- Cached data prevents empty states

### 🤖 **AI Enhancement Pipeline**

**Event Processing:**
1. **Content Analysis**: Evaluate event quality and cultural relevance
2. **Description Enhancement**: Generate engaging, contextual descriptions
3. **Smart Categorization**: Auto-assign to 14+ cultural categories
4. **Mood Detection**: Classify as Energetic, Intimate, Festive, etc.
5. **Audience Targeting**: Identify ideal visitor demographics
6. **Tag Generation**: Create discoverable hashtags

**Quality Scoring:**
- **70+ Score**: Auto-publish immediately
- **50-69 Score**: Require manual review  
- **<50 Score**: Provide improvement suggestions

**Translation Support:**
- Automatic Romanian/English content translation
- Cultural context preservation across languages
- Localized event details and descriptions

### 🔄 **Caching & Performance**

**Update Schedule:**
- **Automatic Refresh**: Every 6 hours via server cron
- **Manual Refresh**: Admin button for immediate updates
- **Smart Caching**: Preserve user experience during updates

**Performance Optimizations:**
- **Event Batching**: Process AI enhancements in groups of 5
- **Fallback Loading**: Show cached content during API failures  
- **Progressive Enhancement**: Core functionality works without JavaScript

## 🎯 API Documentation

### 📊 **Core Endpoints**

**Event Management:**
```http
GET /api/events
# Returns all AI-enhanced events with filtering support
# Query params: ?category=music&enhanced=true&language=ro

GET /api/events/:id  
# Get detailed information for specific event

POST /api/submit-event
# Community event submission with AI verification
# Auto-publishes events scoring 70+
```

**Platform Operations:**
```http
POST /api/events/refresh
# Manual cache refresh (admin only)
# Triggers immediate re-fetch from all sources

GET /api/health
# System health check and statistics
# Returns: server status, cache age, source availability

POST /api/translate-events  
# Batch translation service
# Supports Romanian/English content translation
```

**Filtering & Discovery:**
```http
GET /api/events?category=music,art&mood=energetic
GET /api/events?audience=families&price=free
GET /api/events?date=2024-12-01&location=timisoara
GET /api/events?enhanced=false  # Raw data without AI
```

### 🔒 **Authentication**

Most endpoints are public for discovery. Admin operations require:
```http
Authorization: Bearer your_admin_api_key
# Set ADMIN_API_KEY in environment variables
```

## 🔒 Security & Performance

### 🛡️ **Security Measures**
- **Helmet.js Protection**: Comprehensive security headers
- **CORS Configuration**: Cross-origin request protection  
- **Input Sanitization**: XSS and injection prevention
- **Rate Limiting**: API abuse prevention (100 req/hour per IP)
- **Content Validation**: AI-powered spam and quality detection
- **Secure Environment**: Environment variable protection

### ⚡ **Performance Features**
- **Efficient Caching**: 6-hour refresh cycle with manual override
- **Optimized Assets**: Minified CSS/JS with versioning
- **Lazy Loading**: Progressive content loading for mobile
- **CDN Ready**: Optimized for global content delivery
- **Mobile First**: Responsive design with touch optimizations

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

## 🎨 Customization Guide

### 🌈 **Visual Branding**

**Color Scheme** (`/public/styles.css`):
```css
:root {
  --primary-color: #ff6b35;        /* Main brand orange */
  --secondary-color: #c8a882;      /* Gold accent */
  --background-dark: #0a0a0a;      /* Deep black background */
  --text-primary: #ffffff;         /* Primary text */
  --text-secondary: #b0b0b0;       /* Secondary text */
}
```

**Typography & Spacing**:
```css
:root {
  --font-primary: 'Inter', sans-serif;
  --font-heading: 'Playfair Display', serif;
  --space-lg: 2rem;
  --border-radius: 12px;
}
```

### 📡 **Adding Event Sources**

Create new scrapers in `/src/services/eventAggregator.js`:
```javascript
// Add to sources array
{
  name: 'facebook_events',
  url: 'https://facebook.com/events/timisoara',
  scraper: this.scrapeFacebookEvents.bind(this)
},

// Implement scraper method
async scrapeFacebookEvents(url) {
  // Your scraping logic here
  return events;
}
```

### 🤖 **AI Customization**

**Custom Prompts** (`/src/services/aiService.js`):
```javascript
buildEnhancementPrompt(event) {
  return `
    Enhance this Timișoara cultural event for Romania's European Capital of Culture:
    
    Title: ${event.title}
    Description: ${event.originalDescription}
    
    Focus on: Local culture, accessibility, community impact
    Style: Engaging, informative, culturally relevant
    Length: 2-3 sentences maximum
  `;
}
```

### 📱 **Mobile Customization**

**Touch Interactions** (`/public/script.js`):
```javascript
// Customize mobile features
initMobileFeatures() {
  // Add haptic feedback
  this.addTouchFeedback(button);
  
  // Custom mobile navigation  
  this.setupMobileGestures();
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

## � Project Highlights

### ✨ **What Makes This Special**

- **🤖 AI-First Approach**: Every event enhanced by advanced AI for maximum engagement
- **�🏛️ Cultural Focus**: Built specifically for Timișoara's European Capital of Culture status
- **📱 Modern UX**: Contemporary dark theme with smooth animations and mobile optimization
- **🔄 Auto-Publishing**: Community events go live automatically when they pass AI quality checks
- **🌍 Bilingual Support**: Seamless English/Romanian switching with AI translation
- **📊 Real-Time Stats**: Live dashboard showing platform activity and engagement

### 🎯 **Perfect For**

- **Cultural Organizations**: Promote events with AI-enhanced descriptions
- **Event Venues**: Showcase upcoming performances and exhibitions  
- **Community Groups**: Easy submission process for local cultural activities
- **Tourists & Locals**: Discover authentic Timișoara cultural experiences
- **City Administration**: Official platform for cultural announcements

## 🏛️ About Timișoara

**Romania's European Capital of Culture** - This platform celebrates Timișoara's rich cultural heritage, from its baroque architecture and vibrant arts scene to its role as a center of innovation and cultural diversity in Southeast Europe.

The app showcases over **20 diverse cultural events** across categories like:
- 🎭 **Theater & Opera** at venues like Teatrul Național and Opera Națională
- 🎨 **Art Exhibitions** at Muzeul de Artă and contemporary galleries  
- 🎵 **Music Events** from jazz at Fratelli Studios to indie festivals
- 🍽️ **Culinary Culture** including traditional Banat cuisine festivals
- 💻 **Tech & Innovation** highlighting Timișoara's growing startup ecosystem

---

**🚀 Live Demo**: [art-revolution-timisoara.vercel.app](https://art-revolution-timisoara.vercel.app)

**Art Revolution** • *Timișoara's Cultural Pulse* • Built with ❤️ for Romania's ECoC 2023
