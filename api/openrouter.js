/**
 * Serverless API endpoint for OpenRouter API calls
 * This keeps the API key secure on the server-side
 *
 * Usage: POST /api/openrouter
 * Body: { systemPrompt, userPrompt, options }
 */

export default async function handler(req, res) {
  // Set CORS headers to allow requests from your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { systemPrompt, userPrompt, messages, options = {} } = req.body;

    // Validate input
    if (!systemPrompt && !messages) {
      return res.status(400).json({
        error: 'Missing required parameter: systemPrompt or messages'
      });
    }

    if (!userPrompt && !messages) {
      return res.status(400).json({
        error: 'Missing required parameter: userPrompt or messages'
      });
    }

    // Get API key from environment (server-side only - secure!)
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not configured');
      return res.status(500).json({
        error: 'OpenRouter API key not configured on server'
      });
    }

    // Build messages array
    let requestMessages;
    if (messages) {
      // Use provided messages array (for conversation history)
      requestMessages = messages;
    } else {
      // Build simple system + user message
      requestMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];
    }

    // Make request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'https://myaimcentral.vercel.app',
        'X-Title': 'AIMfM Family Intelligence System'
      },
      body: JSON.stringify({
        model: options.model || 'anthropic/claude-3.5-sonnet',
        messages: requestMessages,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.1,
        ...options.extraParams
      })
    });

    // Handle OpenRouter errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `OpenRouter API error: ${response.status}`,
        details: errorText
      });
    }

    // Return the successful response
    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
