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
    
    this.init();
  }

  async init() {
    this.bindEventListeners();
    await this.loadEvents();
    this.setupFilters();
  }

  bindEventListeners() {
    // Navigation controls
    document.getElementById('filterBtn')?.addEventListener('click', () => this.toggleFilters());
    document.getElementById('refreshBtn')?.addEventListener('click', () => this.refreshEvents());
    
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

    const category = event.aiCategory || event.category || 'event';
    const description = event.enhancedDescription || event.originalDescription || 'No description available.';
    const tags = event.tags || [];
    
    return `
      <div class="event-card" style="animation-delay: ${index * 0.1}s">
        ${event.aiGenerated ? '<div class="ai-badge">✨ AI Enhanced</div>' : ''}
        
        <div class="event-header">
          <div class="event-date">
            📅 ${formattedDate} • ${formattedTime}
          </div>
          <h3 class="event-title">${this.escapeHtml(event.title)}</h3>
          <div class="event-location">
            📍 ${this.escapeHtml(event.location)}
          </div>
        </div>
        
        <div class="event-body">
          <p class="event-description">${this.escapeHtml(description)}</p>
          
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

    const description = event.enhancedDescription || event.originalDescription || 'No description available.';
    const tags = event.tags || [];
    
    modal.querySelector('.modal-content').innerHTML = `
      <div style="margin-bottom: 2rem;">
        ${event.aiGenerated ? '<div class="ai-badge" style="position: relative; top: 0; right: 0; margin-bottom: 1rem;">✨ AI Enhanced Event</div>' : ''}
        
        <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 600; margin-bottom: 1rem; line-height: 1.2;">
          ${this.escapeHtml(event.title)}
        </h2>
        
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; color: var(--text-secondary);">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            📅 <span>${formattedDate}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            🕒 <span>${formattedTime}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            📍 <span>${this.escapeHtml(event.location)}</span>
          </div>
        </div>
        
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
          <span class="event-category">${this.formatFilterLabel(event.aiCategory || event.category || 'event')}</span>
          ${event.mood ? `<span style="padding: 0.5rem 1rem; background: var(--surface-light); border-radius: var(--radius-md); font-size: 0.875rem;">${this.formatFilterLabel(event.mood)} mood</span>` : ''}
          ${event.targetAudience ? `<span style="padding: 0.5rem 1rem; background: var(--surface-light); border-radius: var(--radius-md); font-size: 0.875rem;">For ${this.formatFilterLabel(event.targetAudience)}</span>` : ''}
        </div>
        
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">About This Event</h3>
          <p style="color: var(--text-secondary); line-height: 1.7; font-size: 1rem;">
            ${this.escapeHtml(description)}
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