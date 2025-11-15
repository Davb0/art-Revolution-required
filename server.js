const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

const eventAggregator = require('./src/services/eventAggregator');
const aiService = require('./src/services/aiService');
const { validateApiKey, errorHandler } = require('./src/middleware');
const { sendContactEmail, sendNewsletterConfirmation, sendPartnershipEmail } = require('./src/services/emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"]
    }
  }
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory cache for events
let eventsCache = {
  data: [],
  lastUpdated: null
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all enhanced events
app.get('/api/events', async (req, res) => {
  try {
    const { category, enhanced = 'true' } = req.query;
    
    // Check cache freshness
    const cacheAge = eventsCache.lastUpdated ? 
      Date.now() - eventsCache.lastUpdated : Infinity;
    const maxCacheAge = (process.env.CACHE_DURATION_HOURS || 6) * 60 * 60 * 1000;
    
    if (cacheAge > maxCacheAge || eventsCache.data.length === 0) {
      console.log('Cache expired or empty, fetching fresh events...');
      await updateEventsCache();
    }
    
    let events = [...eventsCache.data];
    
    // Filter by category if specified
    if (category) {
      events = events.filter(event => 
        event.category?.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Return enhanced or raw events
    if (enhanced === 'false') {
      events = events.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location,
        originalDescription: event.originalDescription,
        source: event.source
      }));
    }
    
    res.json({
      success: true,
      count: events.length,
      lastUpdated: eventsCache.lastUpdated,
      events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

// Get single event with enhanced details
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = eventsCache.data.find(e => e.id === req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event'
    });
  }
});

// Refresh events manually
app.post('/api/events/refresh', validateApiKey, async (req, res) => {
  try {
    await updateEventsCache();
    res.json({
      success: true,
      message: 'Events refreshed successfully',
      count: eventsCache.data.length,
      lastUpdated: eventsCache.lastUpdated
    });
  } catch (error) {
    console.error('Error refreshing events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh events'
    });
  }
});

// Translate events
app.post('/api/translate-events', async (req, res) => {
  try {
    const { events, targetLanguage } = req.body;
    
    console.log('🔄 Translation API called');
    console.log('📋 Request body:', { eventsCount: events?.length, targetLanguage });
    
    if (!events || !Array.isArray(events) || !targetLanguage) {
      console.log('❌ Invalid request parameters');
      return res.status(400).json({
        success: false,
        error: 'Invalid request. Events array and targetLanguage required.'
      });
    }
    
    if (!['en', 'ro'].includes(targetLanguage)) {
      console.log('❌ Unsupported language:', targetLanguage);
      return res.status(400).json({
        success: false,
        error: 'Unsupported language. Use "en" or "ro".'
      });
    }
    
    console.log(`🌍 Translating ${events.length} events to ${targetLanguage}`);
    console.log('📝 First event before translation:', {
      title: events[0]?.title,
      description: events[0]?.enhancedDescription || events[0]?.originalDescription,
      existingTranslations: events[0]?.translations
    });
    
    const translatedEvents = await Promise.all(
      events.map(async (event) => {
        // Always translate to ensure fresh translations with improved dictionary
        try {
          const translation = await aiService.translateEvent(event, targetLanguage);
          return {
            ...event,
            translations: {
              ...event.translations,
              [targetLanguage]: translation
            }
          };
        } catch (error) {
          console.warn(`Failed to translate event "${event.title}":`, error.message);
          // Return event with existing translation or original content on error
          return event;
        }
      })
    );
    
    console.log('✅ Translation completed');
    console.log('📝 First translated event:', {
      title: translatedEvents[0]?.title,
      translations: translatedEvents[0]?.translations
    });
    
    res.json(translatedEvents);
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation failed'
    });
  }
});

// Submit new event for verification
app.post('/api/submit-event', async (req, res) => {
  try {
    const eventData = req.body;
    
    // Basic input validation
    if (!eventData || typeof eventData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid event data'
      });
    }

    console.log('📝 New event submission:', eventData.title);

    // Verify event with AI
    const verification = await aiService.verifyEventSubmission(eventData);
    
    if (verification.approved) {
      // Store approved event (in production, this would go to a database)
      const newEvent = {
        id: Date.now().toString(),
        ...eventData,
        status: 'pending_final_review', // Still needs admin approval
        submittedAt: new Date().toISOString(),
        verificationScore: verification.score,
        aiApproved: true
      };

      // For now, store in memory (in production use database)
      if (!global.pendingEvents) {
        global.pendingEvents = [];
      }
      global.pendingEvents.push(newEvent);

      console.log(`✅ Event approved by AI (${verification.score}/100): ${eventData.title}`);
      
      res.json({
        success: true,
        approved: true,
        message: 'Event submitted successfully! It will be reviewed by our team and published soon.',
        feedback: verification.feedback,
        suggestions: verification.suggestions,
        estimatedReview: '24-48 hours'
      });
    } else {
      console.log(`❌ Event rejected by AI (${verification.score}/100): ${eventData.title} - ${verification.reason}`);
      
      res.json({
        success: true,
        approved: false,
        message: 'Event submission needs improvement before it can be published.',
        feedback: verification.feedback,
        suggestions: verification.suggestions,
        score: verification.score,
        reason: verification.reason
      });
    }

  } catch (error) {
    console.error('Event submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process event submission. Please try again.'
    });
  }
});

// Get pending events (admin only)
app.get('/api/admin/pending-events', validateApiKey, (req, res) => {
  try {
    const pendingEvents = global.pendingEvents || [];
    res.json({
      success: true,
      events: pendingEvents,
      count: pendingEvents.length
    });
  } catch (error) {
    console.error('Error fetching pending events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending events'
    });
  }
});

// Approve/reject pending event (admin only)
app.post('/api/admin/review-event/:id', validateApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, feedback } = req.body; // action: 'approve' | 'reject'
    
    if (!global.pendingEvents) {
      return res.status(404).json({
        success: false,
        error: 'No pending events found'
      });
    }

    const eventIndex = global.pendingEvents.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const event = global.pendingEvents[eventIndex];

    if (action === 'approve') {
      // Add to live events cache
      const liveEvent = {
        ...event,
        status: 'published',
        publishedAt: new Date().toISOString(),
        source: 'user_submission',
        visitSource: event.website || null,
        ticketPrice: event.ticketPrice || null
      };

      // Add to events cache
      eventsCache.data.unshift(liveEvent);
      console.log(`✅ Event approved and published: ${event.title}`);
      
    } else {
      console.log(`❌ Event rejected by admin: ${event.title}`);
    }

    // Remove from pending
    global.pendingEvents.splice(eventIndex, 1);

    res.json({
      success: true,
      message: `Event ${action}d successfully`,
      action
    });

  } catch (error) {
    console.error('Event review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review event'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cacheStatus: {
      eventsCount: eventsCache.data.length,
      lastUpdated: eventsCache.lastUpdated
    }
  });
});

// Email endpoints
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await sendContactEmail({ name, email, subject, message });
    
    res.json({
      success: result.success,
      message: result.success ? 'Email sent successfully' : 'Failed to send email',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error in contact endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process contact form'
    });
  }
});

app.post('/api/newsletter', async (req, res) => {
  try {
    const { email, interests = [] } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const result = await sendNewsletterConfirmation(email, interests);
    
    res.json({
      success: result.success,
      message: result.success ? 'Subscription confirmed' : 'Failed to confirm subscription',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error in newsletter endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process newsletter subscription'
    });
  }
});

app.post('/api/partnership', async (req, res) => {
  try {
    const { org, contact, pemail, ptype, pmessage } = req.body;

    if (!org || !contact || !pemail || !ptype) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await sendPartnershipEmail({ org, contact, pemail, ptype, pmessage });
    
    res.json({
      success: result.success,
      message: result.success ? 'Partnership inquiry sent' : 'Failed to send partnership inquiry',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error in partnership endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process partnership inquiry'
    });
  }
});

// Update events cache function
async function updateEventsCache() {
  try {
    console.log('Starting event aggregation...');
    const rawEvents = await eventAggregator.getAllEvents();
    console.log(`Fetched ${rawEvents.length} raw events`);
    
    console.log('Enhancing events with AI...');
    const enhancedEvents = await aiService.enhanceEventsInBatches(rawEvents);
    console.log(`Enhanced ${enhancedEvents.length} events`);
    
    eventsCache.data = enhancedEvents;
    eventsCache.lastUpdated = Date.now();
    
    console.log(`Cache updated with ${enhancedEvents.length} events`);
  } catch (error) {
    console.error('Error updating events cache:', error);
    throw error;
  }
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Schedule automatic cache updates every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Scheduled cache update starting...');
  try {
    await updateEventsCache();
    console.log('Scheduled cache update completed successfully');
  } catch (error) {
    console.error('Scheduled cache update failed:', error);
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Art Revolution server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initial cache load
  try {
    console.log('Loading initial event cache...');
    await updateEventsCache();
    console.log('✅ Initial cache loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load initial cache:', error);
  }
});

module.exports = app;