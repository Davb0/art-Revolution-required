// Art Revolution - Timișoara Events JavaScript

class EventsApp {
  constructor() {
    this.events = [];
    this.filteredEvents = [];
    this.currentFilters = {
      category: '',
      mood: '',
      audience: ''
    };
    this.currentLanguage = 'en'; // Default to English
    this.translations = {
      en: {
        tagline: "Timișoara's Cultural Pulse",
        heroTitle: "Experience Timișoara's Cultural Revolution",
        heroSubtitle: "AI-enhanced discovery of the most exciting events in Romania's European Capital of Culture",
        filterEvents: "Filter Events",
        eventsLabel: "Events",
        categoriesLabel: "Categories",
        aiEnhancedLabel: "AI Enhanced",
        visitEventPage: "Visit Event Page",
        ticketIcon: "🎫",
        categories: {
          art: "Art",
          music: "Music", 
          theatre: "Theatre",
          theater: "Theatre",
          exhibition: "Exhibition",
          food: "Food",
          technology: "Technology",
          cultural: "Cultural"
        }
      },
      ro: {
        tagline: "Pulsul Cultural al Timișoarei",
        heroTitle: "Experimentează Revoluția Culturală a Timișoarei",
        heroSubtitle: "Descoperirea îmbunătățită de AI a celor mai interesante evenimente din Capitala Culturală Europeană a României",
        filterEvents: "Filtrează Evenimente",
        eventsLabel: "Evenimente",
        categoriesLabel: "Categorii",
        aiEnhancedLabel: "Îmbunătățit AI",
        visitEventPage: "Vizitează Pagina Evenimentului",
        ticketIcon: "🎫",
        categories: {
          art: "Artă",
          music: "Muzică",
          theatre: "Teatru",
          theater: "Teatru", 
          exhibition: "Expoziție",
          food: "Mâncare",
          technology: "Tehnologie",
          cultural: "Cultural"
        }
      }
    };
    
    this.init();
  }

  async init() {
    this.bindEventListeners();
    this.updateTranslateButton();
    await this.loadEvents();
    this.setupFilters();
  }

  bindEventListeners() {
    // Navigation controls
    document.getElementById('filterBtn')?.addEventListener('click', () => this.toggleFilters());
    document.getElementById('refreshBtn')?.addEventListener('click', () => this.refreshEvents());
    document.getElementById('translateBtn')?.addEventListener('click', () => this.toggleLanguage());
    
    // Filter panel
    document.getElementById('closeFilters')?.addEventListener('click', () => this.closeFilters());
    
    // Modal
    document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modalOverlay') this.closeModal();
    });
    document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
    
    // Close filters on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeFilters();
        this.closeModal();
      }
    });
    
    // Prevent filter panel close when clicking inside
    document.getElementById('filterPanel')?.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  async loadEvents() {
    try {
      this.showLoading(true);
      
      const response = await fetch('/api/events');
      const data = await response.json();
      
      if (data.success) {
        this.events = data.events;
        this.filteredEvents = [...this.events];
        this.updateStats(data);
        this.renderEvents();
      } else {
        throw new Error(data.error || 'Failed to load events');
      }
    } catch (error) {
      console.error('Error loading events:', error);
      this.showError('Failed to load events. Please try again later.');
    } finally {
      this.showLoading(false);
    }
  }

  async refreshEvents() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.style.transform = 'rotate(180deg)';
      setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg)';
      }, 500);
    }
    
    await this.loadEvents();
  }

  async toggleLanguage() {
    const previousLanguage = this.currentLanguage;
    this.currentLanguage = this.currentLanguage === 'en' ? 'ro' : 'en';
    
    this.updateTranslations();
    this.updateTranslateButton();
    
    // Show loading state
    this.showLoading(true, 'Translating events...');
    
    try {
      // Translate events if needed
      await this.translateEvents();
      this.renderEvents();
    } catch (error) {
      console.error('Translation failed:', error);
      // Revert language change on error
      this.currentLanguage = previousLanguage;
      this.updateTranslateButton();
      this.showError('Translation failed. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  updateTranslations() {
    const t = this.translations[this.currentLanguage];
    
    // Update static text elements
    const tagline = document.querySelector('.tagline');
    if (tagline) tagline.textContent = t.tagline;
    
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      heroTitle.innerHTML = this.currentLanguage === 'en' 
        ? 'Experience Timișoara\'s <span class="highlight">Cultural Revolution</span>'
        : 'Experimentează <span class="highlight">Revoluția Culturală</span> a Timișoarei';
    }
    
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = t.heroSubtitle;
    
    const filterBtn = document.querySelector('#filterBtn span');
    if (filterBtn) filterBtn.textContent = t.filterEvents;
    
    // Update stats labels
    const eventLabel = document.querySelector('.stat-label');
    if (eventLabel) eventLabel.textContent = t.eventsLabel;
    
    const categoryLabels = document.querySelectorAll('.stat-label');
    if (categoryLabels[1]) categoryLabels[1].textContent = t.categoriesLabel;
    if (categoryLabels[2]) categoryLabels[2].textContent = t.aiEnhancedLabel;
  }

  updateTranslateButton() {
    const translateBtn = document.getElementById('translateBtn');
    const translateText = translateBtn?.querySelector('.translate-text');
    
    if (translateText) {
      translateText.textContent = this.currentLanguage.toUpperCase();
    }
    
    if (translateBtn) {
      translateBtn.title = this.currentLanguage === 'en' ? 'Switch to Romanian' : 'Comută în Engleză';
    }
  }

  async translateEvents() {
    // Check if events already have translations for current language
    const needsTranslation = this.events.some(event => 
      !event.translations || !event.translations[this.currentLanguage]
    );
    
    if (!needsTranslation) {
      return; // Already translated
    }
    
    try {
      const response = await fetch('/api/translate-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: this.events,
          targetLanguage: this.currentLanguage
        })
      });
      
      if (!response.ok) {
        throw new Error('Translation request failed');
      }
      
      const translatedEvents = await response.json();
      this.events = translatedEvents;
      this.filteredEvents = [...this.events];
      
    } catch (error) {
      console.error('Error translating events:', error);
      throw error;
    }
  }

  getLocalizedContent(event, field) {
    // Check if event has translations
    if (event.translations && event.translations[this.currentLanguage]) {
      const translatedValue = event.translations[this.currentLanguage][field];
      if (translatedValue) {
        return translatedValue;
      }
    }
    
    // Fall back to original content
    switch (field) {
      case 'title':
        return event.title;
      case 'description':
        return event.enhancedDescription || event.originalDescription || 'No description available.';
      case 'location':
        return event.location;
      case 'ticketPrice':
        return event.ticketPrice;
      default:
        return event[field] || '';
    }
  }

  setupFilters() {
    // Extract unique categories from events
    const categories = [...new Set(this.events.map(event => event.aiCategory || event.category)
      .filter(Boolean))];
    
    this.renderFilterOptions('categoryFilters', categories, 'category');
    this.bindFilterListeners();
  }

  renderFilterOptions(containerId, options, filterType) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Keep the "All" button and add new options
    const allButton = container.querySelector('[data-' + filterType + '=\"\"]');
    const existingButtons = Array.from(container.querySelectorAll('[data-' + filterType + ']:not([data-' + filterType + '=\"\"])'));
    
    // Remove existing specific option buttons
    existingButtons.forEach(btn => btn.remove());
    
    // Add new option buttons
    options.forEach(option => {
      if (!option) return;
      
      const button = document.createElement('button');
      button.className = 'filter-option';
      button.setAttribute('data-' + filterType, option);
      button.textContent = this.formatFilterLabel(option);
      container.appendChild(button);
    });
  }

  bindFilterListeners() {
    // Bind click events to all filter buttons
    document.querySelectorAll('.filter-option').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleFilterClick(button);
      });
    });
  }

  handleFilterClick(button) {
    const filterType = Object.keys(this.currentFilters).find(key => 
      button.hasAttribute('data-' + key)
    );
    
    if (!filterType) return;
    
    const filterValue = button.getAttribute('data-' + filterType);
    
    // Update active states within the same filter group
    const filterGroup = button.parentElement;
    filterGroup.querySelectorAll('.filter-option').forEach(btn => {
      btn.classList.remove('active');
    });
    button.classList.add('active');
    
    // Update current filters
    this.currentFilters[filterType] = filterValue;
    
    // Apply filters
    this.applyFilters();
  }

  applyFilters() {
    this.filteredEvents = this.events.filter(event => {
      const categoryMatch = !this.currentFilters.category || 
        (event.aiCategory || event.category) === this.currentFilters.category;
      
      const moodMatch = !this.currentFilters.mood || 
        event.mood === this.currentFilters.mood;
      
      const audienceMatch = !this.currentFilters.audience || 
        event.targetAudience === this.currentFilters.audience;
      
      return categoryMatch && moodMatch && audienceMatch;
    });
    
    this.renderEvents();
  }

  renderEvents() {
    const container = document.getElementById('eventsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!container) return;
    
    if (this.filteredEvents.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    container.innerHTML = this.filteredEvents.map((event, index) => 
      this.createEventCard(event, index)
    ).join('');
    
    // Bind click events to event cards
    container.querySelectorAll('.event-card').forEach((card, index) => {
      card.addEventListener('click', () => this.showEventModal(this.filteredEvents[index]));
    });
  }

  createEventCard(event, index) {
    const date = new Date(event.date);
    const formattedDate = date.toLocaleDateString('ro-RO', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    const formattedTime = date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // Use translations if available, otherwise fall back to original content
    const eventTitle = this.getLocalizedContent(event, 'title');
    const eventLocation = this.getLocalizedContent(event, 'location');
    const eventDescription = this.getLocalizedContent(event, 'description');
    
    const category = event.aiCategory || event.category || 'event';
    const tags = event.tags || [];
    
    const t = this.translations[this.currentLanguage];
    
    return `
      <div class="event-card" style="animation-delay: ${index * 0.1}s">
        ${event.aiGenerated ? `<div class="ai-badge">✨ ${t.aiEnhancedLabel}</div>` : ''}
        
        <div class="event-header">
          <div class="event-date">
            📅 ${formattedDate} • ${formattedTime}
          </div>
          <h3 class="event-title">${this.escapeHtml(eventTitle)}</h3>
          <div class="event-location">
            📍 ${this.escapeHtml(eventLocation)}
          </div>
        </div>
        
        <div class="event-body">
          <p class="event-description">${this.escapeHtml(eventDescription)}</p>
          
          <div class="event-meta">
            <span class="event-category">${this.formatFilterLabel(category)}</span>
            ${event.mood ? `<span class="event-mood">${this.formatFilterLabel(event.mood)} mood</span>` : ''}
          </div>
          
          ${tags.length > 0 ? `
            <div class="event-tags">
              ${tags.slice(0, 4).map(tag => `
                <span class="event-tag">#${this.escapeHtml(tag)}</span>
              `).join('')}
              ${tags.length > 4 ? `<span class="event-tag">+${tags.length - 4} more</span>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  showEventModal(event) {
    const modal = document.getElementById('eventModal');
    const overlay = document.getElementById('modalOverlay');
    
    if (!modal || !overlay) return;
    
    const date = new Date(event.date);
    const formattedDate = date.toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedTime = date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const eventTitle = this.getLocalizedContent(event, 'title');
    const eventLocation = this.getLocalizedContent(event, 'location');
    const eventDescription = this.getLocalizedContent(event, 'description');
    const eventTicketPrice = this.getLocalizedContent(event, 'ticketPrice');
    const tags = event.tags || [];
    const t = this.translations[this.currentLanguage];
    
    modal.querySelector('.modal-content').innerHTML = `
      <div style="margin-bottom: 2rem;">
        ${event.aiGenerated ? `<div class="ai-badge" style="position: relative; top: 0; right: 0; margin-bottom: 1rem;">✨ ${t.aiEnhancedLabel}</div>` : ''}
        
        <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 600; margin-bottom: 1rem; line-height: 1.2;">
          ${this.escapeHtml(eventTitle)}
        </h2>
        
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; color: var(--text-secondary);">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            📅 <span>${formattedDate}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            🕒 <span>${formattedTime}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            📍 <span>${this.escapeHtml(eventLocation)}</span>
          </div>
          ${eventTicketPrice ? `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              🎫 <span>${this.escapeHtml(eventTicketPrice)}</span>
            </div>
          ` : ''}
        </div>
        
        ${event.visitSource ? `
          <div style="margin-bottom: 1.5rem;">
            <a href="${this.escapeHtml(event.visitSource)}" target="_blank" rel="noopener noreferrer" 
               style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; 
                      background: var(--primary-color); color: white; text-decoration: none; 
                      border-radius: var(--radius-md); font-weight: 500; transition: all var(--transition-normal);">
              🔗 ${this.translations[this.currentLanguage].visitEventPage}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15,3 21,3 21,9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        ` : ''}
        
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
          <span class="event-category">${this.formatFilterLabel(event.aiCategory || event.category || 'event')}</span>
          ${event.mood ? `<span style="padding: 0.5rem 1rem; background: var(--surface-light); border-radius: var(--radius-md); font-size: 0.875rem;">${this.formatFilterLabel(event.mood)} mood</span>` : ''}
          ${event.targetAudience ? `<span style="padding: 0.5rem 1rem; background: var(--surface-light); border-radius: var(--radius-md); font-size: 0.875rem;">For ${this.formatFilterLabel(event.targetAudience)}</span>` : ''}
        </div>
        
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">
            ${this.currentLanguage === 'en' ? 'About This Event' : 'Despre Acest Eveniment'}
          </h3>
          <p style="color: var(--text-secondary); line-height: 1.7; font-size: 1rem;">
            ${this.escapeHtml(eventDescription)}
          </p>
        </div>
        
        ${tags.length > 0 ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Tags</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${tags.map(tag => `
                <span style="padding: 0.375rem 0.75rem; background: var(--surface-light); border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.875rem; color: var(--text-secondary);">
                  #${this.escapeHtml(tag)}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <div style="padding-top: 2rem; border-top: 1px solid var(--border-color); font-size: 0.875rem; color: var(--text-secondary);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Source: ${this.escapeHtml(event.source || 'Unknown')}</span>
            ${event.enhancedAt ? `<span>Enhanced: ${new Date(event.enhancedAt).toLocaleDateString()}</span>` : ''}
          </div>
        </div>
      </div>
    `;
    
    overlay.classList.add('active');
  }

  closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  toggleFilters() {
    const panel = document.getElementById('filterPanel');
    if (panel) {
      panel.classList.toggle('active');
    }
  }

  closeFilters() {
    const panel = document.getElementById('filterPanel');
    if (panel) {
      panel.classList.remove('active');
    }
  }

  updateStats(data) {
    const eventCount = document.getElementById('eventCount');
    const categoryCount = document.getElementById('categoryCount');
    const lastUpdated = document.getElementById('lastUpdated');
    
    if (eventCount) {
      eventCount.textContent = data.count || 0;
    }
    
    if (categoryCount) {
      const categories = new Set(this.events.map(e => e.aiCategory || e.category).filter(Boolean));
      categoryCount.textContent = categories.size;
    }
    
    if (lastUpdated && data.lastUpdated) {
      const date = new Date(data.lastUpdated);
      const timeAgo = this.getTimeAgo(date);
      lastUpdated.textContent = timeAgo;
    }
  }

  getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  formatFilterLabel(text) {
    if (!text) return '';
    
    // Check if we have a translation for this category
    const normalizedText = text.toLowerCase();
    const t = this.translations[this.currentLanguage];
    
    if (t.categories[normalizedText]) {
      return t.categories[normalizedText];
    }
    
    // Default formatting for non-translated terms
    return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    const eventsGrid = document.getElementById('eventsGrid');
    
    if (loadingState) {
      loadingState.style.display = show ? 'flex' : 'none';
    }
    
    if (eventsGrid) {
      eventsGrid.style.display = show ? 'none' : 'grid';
    }
  }

  showError(message) {
    const container = document.getElementById('eventsGrid');
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
          <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--warning-color);">Oops! Something went wrong</h3>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">${this.escapeHtml(message)}</p>
          <button onclick="window.eventsApp.refreshEvents()" style="padding: 0.75rem 1.5rem; background: var(--primary-color); border: none; border-radius: var(--radius-md); color: white; font-weight: 500; cursor: pointer;">
            Try Again
          </button>
        </div>
      `;
    }
    
    this.showLoading(false);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.eventsApp = new EventsApp();
});

// Handle service worker registration for offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}