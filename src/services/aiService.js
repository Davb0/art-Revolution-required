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
        translations: enhancement.translations,
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
2. "category": One of [music, art, theater, food, technology, cultural, official, entertainment, sports, education, family, exhibition]
3. "tags": Array of 3-5 relevant tags
4. "mood": One of [energetic, relaxed, professional, festive, intimate, educational]
5. "targetAudience": One of [families, young_adults, professionals, artists, general, children, seniors]

Consider Timișoara's cultural identity as European Capital of Culture. Focus on local context, accessibility, and cultural significance.

Also provide translations:
6. "translations": Object with "en" (English) and "ro" (Romanian) versions of the description

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
          targetAudience: parsed.targetAudience || 'general',
          translations: parsed.translations || {
            en: parsed.description || 'Enhanced event description not available.',
            ro: parsed.description || 'Descrierea evenimentului nu este disponibilă.'
          }
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
    } else if (title.includes('art') || title.includes('exhibition') || title.includes('museum') || title.includes('expozitie')) {
      category = 'exhibition';
      tags = ['art', 'culture', 'exhibition', 'gallery'];
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
    
    const enhancedDesc = this.generateRuleBasedDescription(event, category);
    
    return {
      description: enhancedDesc,
      category,
      tags: [...new Set(tags)],
      mood,
      targetAudience,
      translations: {
        en: enhancedDesc,
        ro: this.generateRomanianDescription(event, category)
      }
    };
  }

  generateRuleBasedDescription(event, category) {
    const baseDesc = event.originalDescription || '';
    const categoryDescriptions = {
      music: 'Join us for an exciting musical experience in the heart of Timișoara.',
      exhibition: 'Discover inspiring artworks in one of Timișoara\'s cultural venues.',
      art: 'Discover inspiring artworks in one of Timișoara\'s cultural venues.',
      food: 'Taste the authentic flavors of Banat region in this culinary celebration.',
      theatre: 'Experience compelling storytelling in Timișoara\'s theatrical tradition.',
      theater: 'Experience compelling storytelling in Timișoara\'s theatrical tradition.',
      technology: 'Connect with fellow innovators in Timișoara\'s growing tech community.',
      cultural: 'Immerse yourself in the rich cultural heritage of Timișoara.',
      official: 'Participate in important civic activities in our European Capital of Culture.'
    };
    
    let enhanced = categoryDescriptions[category] || 'Join this exciting event in Timișoara.';
    
    // Only add original description if it's substantial and in English
    if (baseDesc.length > 20 && !this.isRomanianText(baseDesc)) {
      enhanced += ` ${baseDesc}`;
    }
    
    enhanced += ` Located in ${event.location}, this event showcases the vibrant spirit of Timișoara's cultural scene.`;
    
    return enhanced;
  }

  isRomanianText(text) {
    // Simple check for Romanian text markers
    const romanianMarkers = ['ă', 'â', 'î', 'ș', 'ț', 'în', 'cu', 'și', 'pentru', 'acest', 'această'];
    return romanianMarkers.some(marker => text.toLowerCase().includes(marker));
  }

  generateRomanianDescription(event, category) {
    const baseDesc = event.originalDescription || '';
    const categoryDescriptions = {
      music: 'Alăturați-vă unei experiențe muzicale captivante în inima Timișoarei.',
      exhibition: 'Descoperiți lucrări de artă inspiratoare într-una din locațiile culturale ale Timișoarei.',
      art: 'Descoperiți lucrări de artă inspiratoare într-una din locațiile culturale ale Timișoarei.',
      food: 'Savurați aromele autentice ale regiunii Banat în această celebrare culinară.',
      theatre: 'Experimentați povestiri captivante în tradiția teatrală a Timișoarei.',
      theater: 'Experimentați povestiri captivante în tradiția teatrală a Timișoarei.',
      technology: 'Conectați-vă cu alți inovatori din comunitatea tech în creștere a Timișoarei.',
      cultural: 'Imersați-vă în bogatul patrimoniu cultural al Timișoarei.',
      official: 'Participați la activități civice importante în Capitala Europeană a Culturii.'
    };
    
    let enhanced = categoryDescriptions[category] || 'Alăturați-vă acestui eveniment captivant în Timișoara.';
    
    // Translate the original description if it's in English
    if (baseDesc.length > 20) {
      if (this.isRomanianText(baseDesc)) {
        enhanced += ` ${baseDesc}`;
      } else {
        // Translate English description to Romanian
        enhanced += ` ${this.smartTranslateToRomanian(baseDesc)}`;
      }
    }
    
    enhanced += ` Situat în ${event.location}, acest eveniment prezintă spiritul vibrant al scenei culturale din Timișoara.`;
    
    return enhanced;
  }

  basicCategorization(event) {
    const title = event.title.toLowerCase();
    const keywords = {
      music: ['concert', 'jazz', 'band', 'music', 'singer'],
      art: ['art', 'gallery', 'museum', 'painting'],
      exhibition: ['exhibition', 'expozitie', 'gallery', 'showcase', 'display'],
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

  async translateEvent(event, targetLanguage) {
    try {
      if (this.geminiClient) {
        return await this.translateWithGemini(event, targetLanguage);
      } else {
        return await this.translateWithFallback(event, targetLanguage);
      }
    } catch (error) {
      console.warn('Translation failed, using fallback:', error.message);
      return this.translateWithFallback(event, targetLanguage);
    }
  }

  async translateWithGemini(event, targetLanguage) {
    const model = this.geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const targetLang = targetLanguage === 'ro' ? 'Romanian' : 'English';
    const eventDescription = event.enhancedDescription || event.originalDescription || '';
    
    const prompt = `Translate this event information to ${targetLang}. 
The original text may be in English, Romanian, or mixed languages. 
Translate everything to pure ${targetLang} with proper cultural context.
Keep location names authentic (preserve Romanian place names).
Return ONLY a valid JSON object:

{
  "title": "translated title in ${targetLang}",
  "description": "translated description in ${targetLang}", 
  "location": "appropriate location name in ${targetLang}",
  "ticketPrice": "translated price text in ${targetLang}"
}

Event to translate:
Title: ${event.title}
Description: ${eventDescription}
Location: ${event.location}
Price: ${event.ticketPrice || 'Not specified'}

${targetLanguage === 'ro' ? 
'Important: Translate to proper Romanian with diacritics (ă, â, î, ș, ț). Use natural Romanian expressions.' :
'Important: Translate to natural English. Keep Romanian place names like "Piața Unirii" authentic.'}

Important: 
- Keep location names authentic (e.g., "Piața Unirii" stays "Piața Unirii" in English, "Union Square" becomes "Piața Unirii" in Romanian)
- For Romanian: Use proper diacritics (ă, â, î, ș, ț)
- Return valid JSON only, no additional text`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    try {
      const translation = JSON.parse(text);
      return translation;
    } catch (parseError) {
      console.warn('Failed to parse Gemini translation response:', text);
      throw new Error('Invalid translation response format');
    }
  }

  async translateWithFallback(event, targetLanguage) {
    const eventDescription = event.enhancedDescription || event.originalDescription || '';
    
    // Simple rule-based translation fallback
    if (targetLanguage === 'ro') {
      return {
        title: this.smartTranslateToRomanian(event.title),
        description: this.smartTranslateToRomanian(eventDescription),
        location: this.translateLocationToRomanian(event.location),
        ticketPrice: this.translatePriceToRomanian(event.ticketPrice)
      };
    } else {
      return {
        title: this.smartTranslateToEnglish(event.title),
        description: this.smartTranslateToEnglish(eventDescription),
        location: this.translateLocationToEnglish(event.location),
        ticketPrice: this.translatePriceToEnglish(event.ticketPrice)
      };
    }
  }

  smartTranslateToRomanian(text) {
    if (!text) return '';
    
    // Enhanced translation patterns
    const translations = {
      // Titles and phrases
      'Jazz Night at Fratelli': 'Seară de Jazz la Fratelli',
      'Art Exhibition - Contemporary Timișoara': 'Expoziție de Artă - Timișoara Contemporană',
      'Food Festival - Banat Flavors': 'Festival Culinar - Aromele Banatului',
      'Theater Performance - Hamlet': 'Spectacol de Teatru - Hamlet',
      'Tech Meetup - Web Development': 'Întâlnire Tech - Dezvoltare Web',
      'Christmas Market Opening': 'Deschiderea Târgului de Crăciun',
      
      // Common phrases
      'Join this exciting event': 'Alăturați-vă acestui eveniment captivant',
      'Located in': 'Situat în',
      'this event showcases': 'acest eveniment prezintă',
      'vibrant spirit': 'spiritul vibrant',
      'cultural scene': 'scena culturală',
      'Live jazz performance': 'Spectacol jazz live',
      'featuring local and international artists': 'cu artiști locali și internaționali',
      'Showcasing modern art': 'Prezentând arta modernă',
      'from local': 'de la artiștii locali',
      'Traditional': 'Tradițional',
      'cuisine festival': 'festival culinar',
      'with local restaurants': 'cu restaurante locale',
      'Classic Shakespearean play': 'Piesa clasică shakespeareană',
      'in Romanian': 'în limba română',
      'Monthly meetup': 'Întâlnire lunară',
      'for web developers': 'pentru dezvoltatorii web',
      'Annual Christmas market': 'Târgul anual de Crăciun',
      'with local crafts and food': 'cu meșteșuguri locale și mâncare'
    };
    
    let translated = text;
    
    // Apply translations in order of specificity (longer phrases first)
    const sortedTranslations = Object.entries(translations)
      .sort((a, b) => b[0].length - a[0].length);
    
    for (const [en, ro] of sortedTranslations) {
      translated = translated.replace(new RegExp(en, 'gi'), ro);
    }
    
    return translated;
  }

  smartTranslateToEnglish(text) {
    if (!text) return '';
    
    // Check if text is already in English (contains typical English words)
    const englishWords = ['the', 'and', 'in', 'of', 'to', 'for', 'with', 'this', 'event', 'located'];
    const hasEnglish = englishWords.some(word => 
      text.toLowerCase().includes(` ${word} `) || text.toLowerCase().startsWith(`${word} `)
    );
    
    // If already in English, return as is
    if (hasEnglish) {
      return text;
    }
    
    // Romanian to English translations
    const translations = {
      'Seară de Jazz la Fratelli': 'Jazz Night at Fratelli',
      'Expoziție de Artă - Timișoara Contemporană': 'Art Exhibition - Contemporary Timișoara',
      'Festival Culinar - Aromele Banatului': 'Food Festival - Banat Flavors',
      'Spectacol de Teatru - Hamlet': 'Theater Performance - Hamlet',
      'Întâlnire Tech - Dezvoltare Web': 'Tech Meetup - Web Development',
      'Deschiderea Târgului de Crăciun': 'Christmas Market Opening',
      
      'Alăturați-vă acestui eveniment': 'Join this exciting event',
      'Situat în': 'Located in',
      'acest eveniment prezintă': 'this event showcases',
      'spiritul vibrant': 'the vibrant spirit',
      'scena culturală': 'cultural scene',
      'Spectacol jazz live': 'Live jazz performance',
      'cu artiști locali și internaționali': 'featuring local and international artists',
      'Prezentând arta modernă': 'Showcasing modern art',
      'de la artiștii locali': 'from local artists',
      'festival culinar': 'cuisine festival',
      'cu restaurante locale': 'with local restaurants',
      'Piesa clasică shakespeareană': 'Classic Shakespearean play',
      'în limba română': 'in Romanian',
      'Întâlnire lunară': 'Monthly meetup',
      'pentru dezvoltatorii web': 'for web developers',
      'Târgul anual de Crăciun': 'Annual Christmas market',
      'cu meșteșuguri locale și mâncare': 'with local crafts and food'
    };
    
    let translated = text;
    
    const sortedTranslations = Object.entries(translations)
      .sort((a, b) => b[0].length - a[0].length);
    
    for (const [ro, en] of sortedTranslations) {
      translated = translated.replace(new RegExp(ro, 'gi'), en);
    }
    
    return translated;
  }

  translateLocationToRomanian(location) {
    const locationMap = {
      'Art Museum': 'Muzeul de Artă',
      'National Theater': 'Teatrul Național',
      'Victory Square': 'Piața Victoriei',
      'Union Square': 'Piața Unirii',
      'Helios Gallery': 'Galeria Helios',
      'Theresia Bastion': 'Bastionul Theresia',
      'Revolution Museum': 'Muzeul Revoluției',
      'Huniade Castle': 'Castelul Huniade',
      'UVT Campus': 'Campus UVT'
    };
    
    return locationMap[location] || location;
  }

  translateLocationToEnglish(location) {
    const locationMap = {
      'Muzeul de Artă': 'Art Museum',
      'Teatrul Național': 'National Theater', 
      'Piața Victoriei': 'Victory Square',
      'Piața Unirii': 'Union Square',
      'Galeria Helios': 'Helios Gallery',
      'Bastionul Theresia': 'Theresia Bastion',
      'Muzeul Revoluției': 'Revolution Museum',
      'Castelul Huniade': 'Huniade Castle',
      'Campus UVT': 'UVT Campus'
    };
    
    return locationMap[location] || location;
  }

  translatePriceToRomanian(price) {
    if (!price) return '';
    
    return price
      .replace(/Free/gi, 'Gratuit')
      .replace(/Free entry/gi, 'Intrare gratuită');
  }

  translatePriceToEnglish(price) {
    if (!price) return '';
    
    return price
      .replace(/Gratuit/gi, 'Free')
      .replace(/Intrare gratuită/gi, 'Free entry');
  }
}

module.exports = new AIService();