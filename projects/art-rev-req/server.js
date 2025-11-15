require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Gemini + Ollama Event Aggregator Endpoint ---
app.get('/api/events', async (req, res) => {
  try {
    // Example: fetch events from real sources (replace with real scraping or APIs)
    const sources = [
      { name: 'zilesinopti', url: 'https://zilesinopti.ro/evenimente-timisoara/' },
      { name: 'radiotimisoara', url: 'https://www.radiotimisoara.ro/agenda-evenimente' }
    ];
    // For demo, just send static events. Replace with real scraping if needed.
    let events = [
      { title: 'Art Expo', date: '2025-11-20', location: 'Timișoara Art Museum', description: 'A modern art exhibition.' },
      { title: 'Jazz Night', date: '2025-11-22', location: 'Downtown Club', description: 'Live jazz music.' }
    ];

    // --- AI Enhancement: Use Gemini API ---
    const prompt = `Given these events: ${JSON.stringify(events)}\nReturn them in a modern, user-friendly JSON format with title, date, location, and description.`;
    let aiEvents = null;
    try {
      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [ { parts: [ { text: prompt } ] } ]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const text = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = text.match(/\{[\s\S]*\}/);
      aiEvents = match ? JSON.parse(match[0]) : null;
    } catch (err) {
      // Fallback to Ollama if Gemini fails
      try {
        const ollamaRes = await axios.post(
          process.env.OLLAMA_URL || 'http://localhost:11434/api/generate',
          {
            model: 'mistral',
            prompt,
            stream: false,
            temperature: 0.3
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const ollamaText = ollamaRes.data.response || '';
        const match = ollamaText.match(/\{[\s\S]*\}/);
        aiEvents = match ? JSON.parse(match[0]) : null;
      } catch (ollamaErr) {
        aiEvents = null;
      }
    }
    res.json({ events: aiEvents || events });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// --- Serve Frontend ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
