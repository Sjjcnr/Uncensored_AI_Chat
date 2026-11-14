// Aether AI Client Logic
const chatForm = document.getElementById('chatForm');
const promptInput = document.getElementById('promptInput');
const sendBtn = document.getElementById('sendBtn');
const messagesList = document.getElementById('messagesList');
const messagesViewport = document.getElementById('messagesViewport');
const welcomeBanner = document.getElementById('welcomeBanner');
const statusPill = document.getElementById('statusPill');
const statusText = document.getElementById('statusText');
const queueStatus = document.getElementById('queueStatus');
const newChatBtn = document.getElementById('newChatBtn');
const guideBtn = document.getElementById('guideBtn');
const guideModal = document.getElementById('guideModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const apiUrlDisplay = document.getElementById('apiUrlDisplay');

let isGenerating = false;

// Configure Marked for GitHub Flavored Markdown and line breaks
if (window.marked) {
  marked.setOptions({
    breaks: true,
    gfm: true
  });
}

// Display current origin for API
if (apiUrlDisplay) {
  apiUrlDisplay.innerText = `${window.location.origin}/v1`;
}

// 1. Check Bridge Connection Status
async function updateBridgeStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();

    if (data.connected) {
      statusPill.className = 'status-indicator online';
      statusText.innerText = data.isBusy ? 'Bridge Busy (Generating...)' : 'Bridge Online (Ready)';
      queueStatus.innerText = `Queue: ${data.queueLength || 0} pending`;
    } else {
      statusPill.className = 'status-indicator offline';
      statusText.innerText = 'Chrome Offline (Run launch-chrome.bat)';
      queueStatus.innerText = 'Queue: Offline';
    }
  } catch (e) {
    statusPill.className = 'status-indicator offline';
    statusText.innerText = 'Server Disconnected';
  }
}

// Poll status every 3 seconds
setInterval(updateBridgeStatus, 3000);
updateBridgeStatus();

// 2. Auto-grow Textarea
promptInput.addEventListener('input', () => {
  promptInput.style.height = 'auto';
  promptInput.style.height = Math.min(promptInput.scrollHeight, 140) + 'px';
});

// 3. Send on Enter (Shift+Enter for newline)
promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!isGenerating && promptInput.value.trim()) {
      chatForm.dispatchEvent(new Event('submit'));
    }
  }
});

// 4. Quick Prompts
document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const prompt = btn.getAttribute('data-prompt');
    promptInput.value = prompt;
    promptInput.dispatchEvent(new Event('input'));
    chatForm.dispatchEvent(new Event('submit'));
  });
});

// 5. Start New Chat
newChatBtn.addEventListener('click', async () => {
  if (confirm('Start a new conversation and clear chat?')) {
    try {
      await fetch('/api/new-chat', { method: 'POST' });
      messagesList.innerHTML = '';
      welcomeBanner.style.display = 'block';
      isGenerating = false;
      sendBtn.disabled = false;
      updateBridgeStatus();
    } catch (err) {
      console.error(err);
    }
  }
});

// 6. Modal Toggle
guideBtn.addEventListener('click', () => guideModal.classList.add('active'));
closeModalBtn.addEventListener('click', () => guideModal.classList.remove('active'));
guideModal.addEventListener('click', (e) => {
  if (e.target === guideModal) guideModal.classList.remove('active');
});

// 7. Form Submission & Streaming
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = promptInput.value.trim();
  if (!message || isGenerating) return;

  // Hide welcome banner
  welcomeBanner.style.display = 'none';

  // Append user message
  appendMessage('user', message);
  promptInput.value = '';
  promptInput.style.height = 'auto';

  // Create assistant placeholder
  const assistantBubble = appendMessage('assistant', 'Thinking...');
  isGenerating = true;
  sendBtn.disabled = true;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!res.ok) {
      const err = await res.json();
      assistantBubble.innerText = `Error: ${err.error || 'Failed to send'}`;
      isGenerating = false;
      sendBtn.disabled = false;
      return;
    }

    assistantBubble.innerHTML = '';
    let accumulatedText = '';

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') break;
          try {
            const parsed = JSON.parse(raw);
            if (parsed.html) {
              assistantBubble.innerHTML = parsed.html;
              messagesViewport.scrollTop = messagesViewport.scrollHeight;
            } else if (parsed.text) {
              assistantBubble.innerText = parsed.text;
              messagesViewport.scrollTop = messagesViewport.scrollHeight;
            } else if (parsed.error) {
              if (!assistantBubble.innerText || assistantBubble.innerText.trim() === '') {
                assistantBubble.innerHTML = `<div style="color:var(--warning);background:rgba(245,158,11,0.1);padding:10px 14px;border-radius:8px;border:1px solid rgba(245,158,11,0.25);font-size:13px;">${parsed.error}</div>`;
                messagesViewport.scrollTop = messagesViewport.scrollHeight;
              }
            }
          } catch (e) {
            // non-json line
          }
        }
      }
    }
  } catch (err) {
    assistantBubble.innerText = `Error connecting to bridge: ${err.message}`;
  } finally {
    isGenerating = false;
    sendBtn.disabled = false;
    updateBridgeStatus();
  }
});

function appendMessage(role, text) {
  const row = document.createElement('div');
  row.className = `message-row ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  if (role === 'assistant' && window.marked && text !== 'Thinking...') {
    bubble.innerHTML = marked.parse(text);
  } else {
    bubble.innerText = text;
  }

  row.appendChild(bubble);
  messagesList.appendChild(row);
  messagesViewport.scrollTop = messagesViewport.scrollHeight;
  return bubble;
}
