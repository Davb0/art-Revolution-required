const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

class AIService {
  constructor() {
    this.geminiClient = null;
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama2';
    
    this.initializeGemini();
  }

  initializeGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        this.geminiClient = new GoogleGenerativeAI(apiKey);
        console.log('✅ Gemini AI initialized successfully');
      } catch (error) {
        console.warn('⚠️  Gemini AI initialization failed:', error.message);
      }
    } else {
      console.log('ℹ️  Gemini API key not configured, will use Ollama fallback');
    }
  }

  async enhanceEventsInBatches(events, batchSize = 5) {
    const enhancedEvents = [];
    
    console.log(`Enhancing ${events.length} events in batches of ${batchSize}...`);
    
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(events.length / batchSize)}`);
      
      const batchPromises = batch.map(event => this.enhanceEvent(event));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          enhancedEvents.push(result.value);
        } else {
          console.warn(`Failed to enhance event: ${batch[index].title}`, result.reason);
          // Include original event if enhancement fails
          enhancedEvents.push({
            ...batch[index],
            enhancedDescription: batch[index].originalDescription,
            aiCategory: 'unknown',
            tags: [],
            aiGenerated: false,
            enhancementError: result.reason?.message || 'Enhancement failed'
          });
        }
      });
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < events.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`✅ Enhanced ${enhancedEvents.length} events successfully`);
    return enhancedEvents;
  }

  async enhanceEvent(event) {
    try {
      const enhancement = await this.generateEnhancement(event);
      
      return {
        ...event,
        enhancedDescription: enhancement.description,
        aiCategory: enhancement.category,
        tags: enhancement.tags,
        mood: enhancement.mood,
        targetAudience: enhancement.targetAudience,
        aiGenerated: true,
        enhancedAt: new Date().toISOString()
      };
    } catch (error) {
      console.warn(`Enhancement failed for event "${event.title}":`, error.message);
      
      // Return event with basic AI categorization if enhancement fails
      return {
        ...event,
        enhancedDescription: event.originalDescription || 'No description available.',
        aiCategory: this.basicCategorization(event),
        tags: this.extractBasicTags(event),
        mood: 'neutral',
        targetAudience: 'general',
        aiGenerated: false,
        enhancementError: error.message
      };
    }
  }

  async generateEnhancement(event) {
    const prompt = this.buildEnhancementPrompt(event);
    
    try {
      // Try Gemini first if available
      if (this.geminiClient) {
        return await this.enhanceWithGemini(prompt);
      }
      
      // Fallback to Ollama
      return await this.enhanceWithOllama(prompt);
    } catch (error) {
      console.warn('AI enhancement failed, using rule-based fallback');
      return this.ruleBasedEnhancement(event);
    }
  }

  async enhanceWithGemini(prompt) {
    try {
      const model = this.geminiClient.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAIResponse(text);
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async enhanceWithOllama(prompt) {
    try {
      const response = await axios.post(`${this.ollamaHost}/api/generate`, {
        model: this.ollamaModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 500
        }
      }, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      return this.parseAIResponse(response.data.response);
    } catch (error) {
      throw new Error(`Ollama API error: ${error.message}`);
    }
  }

  buildEnhancementPrompt(event) {
    return `Analyze this Timișoara event and provide enhancement in JSON format:

Event Title: ${event.title}
Date: ${event.date}
Location: ${event.location}
Original Description: ${event.originalDescription || 'No description provided'}
Category: ${event.category || 'unknown'}

Please provide a JSON response with:
1. "description": An engaging, informative description (100-200 words) that highlights what makes this event special in Timișoara's cultural context
2. "category": One of [music, art, theater, food, technology, cultural, official, entertainment, sports, education, family]
3. "tags": Array of 3-5 relevant tags
4. "mood": One of [energetic, relaxed, professional, festive, intimate, educational]
5. "targetAudience": One of [families, young_adults, professionals, artists, general, children, seniors]

Consider Timișoara's cultural identity as European Capital of Culture. Focus on local context, accessibility, and cultural significance.

Respond only with valid JSON:`;
  }

  parseAIResponse(text) {
    try {
      // Clean the response text
      let cleanText = text.trim();
      
      // Remove markdown code blocks if present
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON object in the text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        return {
          description: parsed.description || 'Enhanced event description not available.',
          category: parsed.category || 'entertainment',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          mood: parsed.mood || 'neutral',
          targetAudience: parsed.targetAudience || 'general'
        };
      }
      
      throw new Error('No valid JSON found in AI response');
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  ruleBasedEnhancement(event) {
    const title = event.title.toLowerCase();
    const description = (event.originalDescription || '').toLowerCase();
    const location = (event.location || '').toLowerCase();
    
    // Determine category based on keywords
    let category = 'entertainment';
    let tags = [];
    let mood = 'neutral';
    let targetAudience = 'general';
    
    if (title.includes('jazz') || title.includes('music') || title.includes('concert')) {
      category = 'music';
      tags = ['music', 'live', 'performance'];
      mood = 'energetic';
      targetAudience = 'young_adults';
    } else if (title.includes('art') || title.includes('exhibition') || title.includes('museum')) {
      category = 'art';
      tags = ['art', 'culture', 'exhibition'];
      mood = 'intimate';
      targetAudience = 'artists';
    } else if (title.includes('food') || title.includes('restaurant') || title.includes('festival')) {
      category = 'food';
      tags = ['food', 'local', 'festival'];
      mood = 'festive';
      targetAudience = 'families';
    } else if (title.includes('theater') || title.includes('teatru')) {
      category = 'theater';
      tags = ['theater', 'performance', 'culture'];
      mood = 'intimate';
      targetAudience = 'general';
    } else if (title.includes('tech') || title.includes('meetup') || title.includes('conference')) {
      category = 'technology';
      tags = ['technology', 'networking', 'education'];
      mood = 'professional';
      targetAudience = 'professionals';
    }
    
    // Add location-based tags
    if (location.includes('piața') || location.includes('square')) {
      tags.push('outdoor');
    }
    if (location.includes('museum') || location.includes('muzeul')) {
      tags.push('indoor', 'cultural');
    }
    
    return {
      description: this.generateRuleBasedDescription(event, category),
      category,
      tags: [...new Set(tags)],
      mood,
      targetAudience
    };
  }

  generateRuleBasedDescription(event, category) {
    const baseDesc = event.originalDescription || '';
    const categoryDescriptions = {
      music: 'Join us for an exciting musical experience in the heart of Timișoara.',
      art: 'Discover inspiring artworks in one of Timișoara\'s cultural venues.',
      food: 'Taste the authentic flavors of Banat region in this culinary celebration.',
      theater: 'Experience compelling storytelling in Timișoara\'s theatrical tradition.',
      technology: 'Connect with fellow innovators in Timișoara\'s growing tech community.',
      cultural: 'Immerse yourself in the rich cultural heritage of Timișoara.',
      official: 'Participate in important civic activities in our European Capital of Culture.'
    };
    
    let enhanced = categoryDescriptions[category] || 'Join this exciting event in Timișoara.';
    
    if (baseDesc.length > 20) {
      enhanced += ` ${baseDesc}`;
    }
    
    enhanced += ` Located in ${event.location}, this event showcases the vibrant spirit of Timișoara's cultural scene.`;
    
    return enhanced;
  }

  basicCategorization(event) {
    const title = event.title.toLowerCase();
    const keywords = {
      music: ['concert', 'jazz', 'band', 'music', 'singer'],
      art: ['art', 'exhibition', 'gallery', 'museum', 'painting'],
      food: ['food', 'restaurant', 'culinary', 'taste', 'festival'],
      theater: ['theater', 'teatru', 'performance', 'play', 'drama'],
      technology: ['tech', 'meetup', 'conference', 'coding', 'development'],
      cultural: ['cultural', 'heritage', 'traditional', 'cultural'],
      official: ['council', 'consiliul', 'mayor', 'primar', 'official']
    };
    
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => title.includes(word))) {
        return category;
      }
    }
    
    return 'entertainment';
  }

  extractBasicTags(event) {
    const text = `${event.title} ${event.originalDescription || ''}`.toLowerCase();
    const commonTags = ['timisoara', 'local', 'culture', 'community', 'event'];
    
    const keywords = ['music', 'art', 'food', 'theater', 'tech', 'family', 'outdoor', 'indoor', 'free', 'festival'];
    const foundTags = keywords.filter(tag => text.includes(tag));
    
    return [...commonTags, ...foundTags].slice(0, 5);
  }
}

module.exports = new AIService();