const express = require('express');
const cors = require('cors');
const path = require('path');
const bridge = require('./bridge');

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cors());
app.use(express.json());

// Explicitly serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

// Auto-initialize bridge connection on server start
bridge.init().catch(() => {
  console.log('[Server] Bridge waiting for Chrome to launch...');
});

// 1. Bridge Status Endpoint
app.get('/api/status', async (req, res) => {
  const status = await bridge.checkStatus();
  res.json(status);
});

// 2. Clear / New Conversation
app.post('/api/new-chat', async (req, res) => {
  try {
    await bridge.startNewChat();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Web UI Chat Streaming Endpoint (SSE)
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    await bridge.ask(message, (chunk) => {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error('[Chat Error]:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// 4. OpenAI-Compatible API: GET /v1/models
app.get('/v1/models', (req, res) => {
  res.json({
    object: 'list',
    data: [
      {
        id: 'dark-core-uncensored',
        object: 'model',
        created: Math.floor(Date.now() / 1000),
        owned_by: 'custom-bridge'
      },
      {
        id: 'dark-heretic-flash',
        object: 'model',
        created: Math.floor(Date.now() / 1000),
        owned_by: 'custom-bridge'
      }
    ]
  });
});

// 5. OpenAI-Compatible API: POST /v1/chat/completions
app.post('/v1/chat/completions', async (req, res) => {
  const { messages, stream = false, model = 'dark-core-uncensored' } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: { message: 'Invalid messages array' } });
  }

  // Get the latest user message and optional system message
  const userMsg = [...messages].reverse().find(m => m.role === 'user');
  if (!userMsg) {
    return res.status(400).json({ error: { message: 'No user message found' } });
  }

  const sysMsg = messages.find(m => m.role === 'system');
  let prompt = userMsg.content;
  if (sysMsg && sysMsg.content) {
    prompt = `[System Context: ${sysMsg.content}]\n\n${prompt}`;
  }

  const requestId = 'chatcmpl-' + Math.random().toString(36).substring(2, 12);

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      let sentLength = 0;
      await bridge.ask(prompt, (chunk) => {
        const fullText = typeof chunk === 'object' ? (chunk.text || '') : String(chunk);
        const delta = fullText.slice(sentLength);
        if (delta.length > 0) {
          sentLength = fullText.length;
          const payload = {
            id: requestId,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: model,
            choices: [
              {
                index: 0,
                delta: { content: delta },
                finish_reason: null
              }
            ]
          };
          res.write(`data: ${JSON.stringify(payload)}\n\n`);
        }
      });

      const finalChunk = {
        id: requestId,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [
          {
            index: 0,
            delta: {},
            finish_reason: 'stop'
          }
        ]
      };
      res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  } else {
    try {
      const fullReply = await bridge.ask(prompt);
      const textReply = typeof fullReply === 'object' ? (fullReply.text || '') : String(fullReply);
      res.json({
        id: requestId,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: textReply },
            finish_reason: 'stop'
          }
        ],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      });
    } catch (err) {
      res.status(429).json({ error: { message: err.message, type: 'rate_limit_exceeded', code: 429 } });
    }
  }
});

app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`  UNCENSORED AI BRIDGE SERVER RUNNING ON PORT ${PORT} `);
  console.log(`  Web Interface:      http://localhost:${PORT}`);
  console.log(`  OpenAI API BaseURL: http://localhost:${PORT}/v1`);
  console.log(`========================================================`);
});
