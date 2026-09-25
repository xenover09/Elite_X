const Groq = require('groq-sdk');
const logger = require('../utils/logger');

let groqClient = null;

/**
 * Returns a singleton Groq client instance.
 * @returns {Groq}
 */
function getGroqClient() {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

/**
 * Sends a question to the Groq API and returns a formatted response string.
 * Throws an enriched error with a `userMessage` property on failure.
 *
 * @param {string} question - The user's question.
 * @param {object} [guildState] - The settings for the guild.
 * @returns {Promise<string>} The AI's response text.
 */
async function queryGroq(question, guildState) {
  let client;
  if (guildState && (guildState.aiApiKey || guildState.aiApiUrl)) {
    client = new Groq({ 
      apiKey: guildState.aiApiKey || process.env.GROQ_API_KEY,
      baseURL: guildState.aiApiUrl || undefined
    });
  } else {
    client = getGroqClient();
  }

  let model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  if (guildState && guildState.aiModel) {
    model = guildState.aiModel.trim();
  }

  const maxTokens = parseInt(process.env.AI_MAX_TOKENS, 10) || 1024;
  const temperature = parseFloat(process.env.AI_TEMPERATURE) || 0.7;

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful, concise, and friendly AI assistant inside a Discord server. ' +
        'Keep responses clear and well-structured. Use markdown formatting where appropriate. ' +
        'If a question is harmful, illegal, or inappropriate, politely decline to answer.',
    },
    {
      role: 'user',
      content: question,
    },
  ];

  let text = '';

  try {
    if (guildState && (guildState.aiApiKey || guildState.aiApiUrl)) {
      let apiKey = guildState.aiApiKey || process.env.GROQ_API_KEY;
      if (apiKey) apiKey = apiKey.trim();

      // --- AUTO DETECT GOOGLE GEMINI KEY ---
      if (apiKey && apiKey.startsWith('AIzaSy')) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: messages[0].content }]
            },
            contents: [{ parts: [{ text: question }] }]
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Google API ${response.status}: ${errText}`);
        }

        const data = await response.json();
        text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      } 
      // --- CUSTOM OPENAI COMPATIBLE ENDPOINT ---
      else {
        let baseUrl = guildState.aiApiUrl || 'https://api.groq.com/openai/v1';
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: maxTokens,
            temperature
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();
        text = data?.choices?.[0]?.message?.content?.trim();
      }
    } else {
      // Use default Groq SDK
      const client = getGroqClient();
      const completion = await client.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      });
      text = completion?.choices?.[0]?.message?.content?.trim();
    }
  } catch (err) {
    logger.error('Groq API request failed:', err.message);

    const enriched = new Error(err.message);
    enriched.userMessage = resolveUserMessage(err);
    throw enriched;
  }

  if (!text) {
    logger.error('Empty response received from AI API.');
    const err = new Error('API returned an empty response.');
    err.userMessage = 'The AI returned an empty response. Please try rephrasing your question.';
    throw err;
  }

  // Discord message limit is 2000 characters — keep headroom for chunking
  return text.length > 1900 ? text.slice(0, 1897) + '...' : text;
}

/**
 * Maps Groq API errors to user-friendly messages.
 * @param {Error} err
 * @returns {string}
 */
function resolveUserMessage(err) {
  const status = err?.status || err?.statusCode;

  if (status === 401) return 'AI service authentication failed. Please contact an administrator.';
  if (status === 429) return 'The AI service is currently rate-limited. Please try again in a moment.';
  if (status === 503 || status === 502) return 'The AI service is temporarily unavailable. Please try again later.';
  if (err.message?.toLowerCase().includes('timeout')) return 'The AI request timed out. Please try again.';

  return 'Failed to get a response from the AI. Please try again later.';
}

module.exports = { queryGroq };
