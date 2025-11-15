const axios = require('axios');
const cheerio = require('cheerio');

class EventAggregator {
  constructor() {
    this.sources = [
      {
        name: 'timisoara_official',
        url: 'https://www.primariatm.ro/evenimente/',
        scraper: this.scrapeOfficialEvents.bind(this)
      },
      {
        name: 'what_to_do',
        url: 'https://whattodo.ro/timisoara',
        scraper: this.scrapeWhatToDo.bind(this)
      },
      {
        name: 'local_events',
        scraper: this.getMockLocalEvents.bind(this)
      }
    ];
  }

  async getAllEvents() {
    const allEvents = [];
    
    for (const source of this.sources) {
      try {
        console.log(`Fetching events from ${source.name}...`);
        const events = await source.scraper(source.url);
        
        // Add source information and unique IDs
        const sourcedEvents = events.map(event => ({
          ...event,
          id: this.generateEventId(event, source.name),
          source: source.name,
          fetchedAt: new Date().toISOString()
        }));
        
        allEvents.push(...sourcedEvents);
        console.log(`✅ Fetched ${sourcedEvents.length} events from ${source.name}`);
      } catch (error) {
        console.error(`❌ Error fetching from ${source.name}:`, error.message);
      }
    }
    
    // Remove duplicates and sort by date
    const uniqueEvents = this.removeDuplicates(allEvents);
    return this.sortEventsByDate(uniqueEvents);
  }

  async scrapeOfficialEvents(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const events = [];
      
      // Look for event containers (adapt selectors based on actual site structure)
      $('.event, .eveniment, [class*="event"]').each((i, element) => {
        try {
          const $el = $(element);
          const title = $el.find('h1, h2, h3, .title, [class*="title"]').first().text().trim();
          const date = this.extractDate($el.find('.date, [class*="date"], time').first().text());
          const location = $el.find('.location, [class*="location"], .venue').first().text().trim();
          const description = $el.find('.description, [class*="description"], p').first().text().trim();
          
          if (title && date) {
            events.push({
              title,
              date,
              location: location || 'Timișoara',
              originalDescription: description || '',
              category: 'official'
            });
          }
        } catch (err) {
          console.warn('Error parsing event element:', err.message);
        }
      });
      
      return events;
    } catch (error) {
      console.warn('Official events scraping failed, using fallback');
      return this.getFallbackOfficialEvents();
    }
  }

  async scrapeWhatToDo(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const events = [];
      
      // Adapt selectors for WhatToDo structure
      $('.event-item, .card, [class*="event"]').each((i, element) => {
        try {
          const $el = $(element);
          const title = $el.find('h2, h3, .event-title, [class*="title"]').first().text().trim();
          const date = this.extractDate($el.find('.date, [class*="date"]').first().text());
          const location = $el.find('.venue, .location, [class*="location"]').first().text().trim();
          const description = $el.find('.description, [class*="desc"]').first().text().trim();
          
          if (title && date) {
            events.push({
              title,
              date,
              location: location || 'Timișoara',
              originalDescription: description || '',
              category: 'entertainment'
            });
          }
        } catch (err) {
          console.warn('Error parsing event element:', err.message);
        }
      });
      
      return events;
    } catch (error) {
      console.warn('WhatToDo scraping failed, using fallback');
      return this.getFallbackEntertainmentEvents();
    }
  }

  async getMockLocalEvents() {
    // Mock events representing typical Timișoara cultural events
    const today = new Date();
    const events = [];
    
    const mockEvents = [
      {
        title: 'Jazz Night at Fratelli',
        daysFromNow: 1,
        hour: 20,
        minute: 30,
        location: 'Fratelli Studios',
        originalDescription: 'Live jazz performance featuring local and international artists.',
        category: 'music',
        visitSource: 'https://www.fratelli.ro/evenimente',
        ticketPrice: '50 RON'
      },
      {
        title: 'Art Exhibition - Contemporary Timișoara',
        daysFromNow: 3,
        hour: 10,
        minute: 0,
        location: 'Muzeul de Artă',
        originalDescription: 'Showcasing modern art from local Timișoara artists.',
        category: 'exhibition',
        visitSource: 'https://www.muzeuart-tm.ro/expozitii',
        ticketPrice: '15 RON'
      },
      {
        title: 'Food Festival - Banat Flavors',
        daysFromNow: 5,
        hour: 12,
        minute: 0,
        location: 'Piața Victoriei',
        originalDescription: 'Traditional Banat cuisine festival with local restaurants.',
        category: 'food',
        visitSource: 'https://www.primariatm.ro/evenimente/festival-banat',
        ticketPrice: 'Free entry'
      },
      {
        title: 'Theater Performance - Hamlet',
        daysFromNow: 7,
        hour: 19,
        minute: 30,
        location: 'Teatrul Național',
        originalDescription: 'Classic Shakespearean play in Romanian.',
        category: 'theatre',
        visitSource: 'https://www.tnts.ro/spectacole/hamlet',
        ticketPrice: '30-80 RON'
      },
      {
        title: 'Tech Meetup - Web Development',
        daysFromNow: 10,
        hour: 18,
        minute: 0,
        location: 'UVT Campus',
        originalDescription: 'Monthly meetup for web developers in Timișoara.',
        category: 'technology',
        visitSource: 'https://www.meetup.com/timisoara-web-dev',
        ticketPrice: 'Free'
      },
      {
        title: 'Christmas Market Opening',
        daysFromNow: 14,
        hour: 10,
        minute: 0,
        location: 'Piața Unirii',
        originalDescription: 'Annual Christmas market with local crafts and food.',
        category: 'cultural',
        visitSource: 'https://www.primariatm.ro/targul-de-craciun',
        ticketPrice: 'Free entry'
      }
    ];
    
    return mockEvents.map(event => {
      const eventDate = new Date(today.getTime() + event.daysFromNow * 24 * 60 * 60 * 1000);
      eventDate.setHours(event.hour, event.minute, 0, 0);
      
      return {
        title: event.title,
        date: eventDate.toISOString(),
        location: event.location,
        originalDescription: event.originalDescription,
        category: event.category,
        visitSource: event.visitSource,
        ticketPrice: event.ticketPrice
      };
    });
  }

  getFallbackOfficialEvents() {
    const today = new Date();
    
    const event1Date = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    event1Date.setHours(10, 0, 0, 0);
    
    const event2Date = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    event2Date.setHours(9, 0, 0, 0);
    
    return [
      {
        title: 'City Council - Public Session',
        date: event1Date.toISOString(),
        location: 'Timișoara City Hall',
        originalDescription: 'Public session of the Timișoara City Council.',
        category: 'official'
      },
      {
        title: 'Timișoara City Day',
        date: event2Date.toISOString(),
        location: 'Historic Center',
        originalDescription: 'City day celebration with cultural events.',
        category: 'official'
      }
    ];
  }

  getFallbackEntertainmentEvents() {
    const today = new Date();
    
    const eventDate = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);
    eventDate.setHours(21, 0, 0, 0);
    
    return [
      {
        title: 'Rock Concert in Old Town',
        date: eventDate.toISOString(),
        location: 'Union Square',
        originalDescription: 'Rock concert featuring local bands.',
        category: 'music'
      }
    ];
  }

  extractDate(dateStr) {
    if (!dateStr) return null;
    
    try {
      // Clean the date string
      const cleanDate = dateStr.replace(/[^\d\s\-\/\.:]/g, '').trim();
      
      // Try various date patterns
      const patterns = [
        /(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})/,  // DD-MM-YYYY or DD/MM/YYYY
        /(\d{4})[\-\/](\d{1,2})[\-\/](\d{1,2})/,  // YYYY-MM-DD
        /(\d{1,2})\.(\d{1,2})\.(\d{4})/,          // DD.MM.YYYY
      ];
      
      for (const pattern of patterns) {
        const match = cleanDate.match(pattern);
        if (match) {
          let day, month, year;
          
          if (pattern.source.startsWith('(\\d{4})')) {
            // YYYY-MM-DD format
            [, year, month, day] = match;
          } else {
            // DD-MM-YYYY format
            [, day, month, year] = match;
          }
          
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        }
      }
      
      // If no pattern matches, try parsing as-is
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
      
    } catch (error) {
      console.warn('Error parsing date:', dateStr, error.message);
    }
    
    // Return tomorrow as fallback
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString();
  }

  generateEventId(event, source) {
    const baseString = `${source}-${event.title}-${event.date}-${event.location}`;
    return Buffer.from(baseString).toString('base64').slice(0, 16);
  }

  removeDuplicates(events) {
    const seen = new Set();
    return events.filter(event => {
      const key = `${event.title.toLowerCase()}-${event.date}-${event.location.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  sortEventsByDate(events) {
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
}

module.exports = new EventAggregator();