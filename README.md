# Aether AI — Uncensored Intelligence Bridge & Web Facade

<div align="center">

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express-v5.3.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Puppeteer Core](https://img.shields.io/badge/Puppeteer--Core-v25.17-00D8A2?style=for-the-badge&logo=puppeteer&logoColor=white)](https://pptr.dev/)
[![TCO](https://img.shields.io/badge/TCO-%240.00%20(Free)-10b981?style=for-the-badge)](#-zero-cost-infrastructure)

**A self-hosted developer bridge and web facade for unrestricted AI models. Automates Venice AI's unauthenticated web tier via local Chrome DevTools Protocol (CDP), providing a custom dark-mode web chat and a lightweight OpenAI-compatible `/v1/chat/completions` endpoint.**

[Quick Start](#-quick-start-windows) • [How It Works](#-how-it-works) • [OpenAI API Reference](#-openai-compatible-api-reference) • [Daily Limits & Quota](#-venice-guest-tier-limits--quota) • [Troubleshooting](#-troubleshooting--faq)

</div>

---

## ⚡ Overview

**Aether AI** is an open-source automation bridge designed for personal testing and research with uncensored language models. Rather than paying for developer API credits, it uses `puppeteer-core` to connect to a dedicated local Google Chrome instance running Venice AI's unauthenticated guest chat.

It wraps this automation in:
1. **A Custom Dark-Mode Web Client:** A clean, responsive single-page chat interface styled with an obsidian cyberpunk aesthetic, real-time Server-Sent Events (SSE) streaming, and Markdown rendering.
2. **An OpenAI-Compatible API Layer:** Express endpoints (`/v1/models` and `/v1/chat/completions`) that allow lightweight scripts and OpenAI SDK clients to query the bridge programmatically.
3. **Brand & Identity Cloaking:** Automatic prompt steering and real-time output sanitization (`sanitizeBrand`) to mask third-party vendor names.
4. **1-Click Launch Automation (`start.bat`):** A Windows batch script that manages process cleanup, launches the dedicated Chrome instance, starts the Node.js server, and optionally configures an ngrok tunnel.

---

## 🏗️ System Architecture

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT ACCESS LAYER                                  |
|            [Custom Web UI (SPA)]           |       [Python SDK / curl Scripts]          |
+---------------------+----------------------+---------------------+----------------------+
                      | (SSE /api/chat)                            | (/v1/chat/completions)
                      |                                            |
                      +----------------------+---------------------+
                                             |
                                             v
                      +--------------------------------------------+
                      |         LOCAL EXPRESS SERVER (:3500)       |
                      |  - Static Web UI Host (public/)            |
                      |  - SSE Chat Endpoint (/api/chat)           |
                      |  - OpenAI Emulation (/v1/chat/completions) |
                      |  - Health & Queue Status (/api/status)     |
                      +----------------------+---------------------+
                                             | bridge.ask(prompt, onChunk)
                                             v
                      +--------------------------------------------+
                      |       BRIDGE CONTROLLER (bridge.js)        |
                      |  - FIFO Request Mutex (single concurrency) |
                      |  - DOM Input Injection (native setter)     |
                      |  - Real-time Output Brand Sanitizer        |
                      |  - 2.5s Text Stability Watchdog            |
                      |  - Quota Error Detection                   |
                      +----------------------+---------------------+
                                             | Chrome DevTools Protocol (Port 9222)
                                             v
                      +--------------------------------------------+
                      |         DEDICATED CHROME INSTANCE          |
                      |  - Profile: %LOCALAPPDATA%\VeniceBridge    |
                      |  - Active Tab: venice.ai/chat/classic      |
                      +--------------------------------------------+
```

---

## 🌟 How It Works

1. **Dedicated Chrome Profile:** `launch-chrome.bat` launches Google Chrome with `--remote-debugging-port=9222` and an isolated profile directory (`%LOCALAPPDATA%\VeniceBridgeProfile`). This ensures your personal Chrome browsing data, extensions, and logins remain untouched.
2. **CDP Connection:** `bridge.js` connects to Chrome via WebSocket using `puppeteer-core`. It finds or opens the `https://venice.ai/chat/classic` tab.
3. **Synthetic Event Dispatch:** When a message is submitted, the bridge injects the prompt directly into the web input using the native `HTMLTextAreaElement` prototype setter, dispatching synthetic `input` and `change` events so React/Chakra registers the text.
4. **FIFO Mutex Queue:** Because automation interacts with a single open browser tab, requests are queued in memory (`requestQueue`) and processed sequentially to avoid prompt collisions.
5. **Streaming & Watchdog:** The bridge polls the assistant's DOM element every 200ms, streaming new text deltas to the client. Generation finishes when the Stop button disappears and the text remains stable for 0.8 seconds (with a 2.5-second fallback watchdog).
6. **Brand Sanitization:** Outgoing chunks pass through `sanitizeBrand()`, replacing upstream mentions of "Venice" or "DeepSeek" with "Aether AI".

---

## ⚡ Quick Start (Windows)

### Prerequisites
* **Windows 10 / 11**
* **[Node.js](https://nodejs.org/)** (v18 or higher)
* **Google Chrome** (standard installation)
* *(Optional)* **[ngrok](https://ngrok.com/)** for remote access

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Sjjcnr/Uncensored_AI_Chat.git
   cd Uncensored_AI_Chat
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bat
   start.bat
   ```

### What `start.bat` Does
1. Checks TCP port `3500` and frees any lingering processes.
2. Verifies if Chrome is listening on port `9222`; if not, calls `launch-chrome.bat`.
3. Starts the Express backend on `http://localhost:3500`.
4. Checks if `ngrok` is installed:
   - If an `NGROK_DOMAIN` is configured in `start.bat`, binds that domain.
   - Otherwise, starts a standard dynamic tunnel, or falls back to local-only mode.
5. Opens the web interface in your default browser.

---

## 🔌 OpenAI-Compatible API Reference

> [!IMPORTANT]
> **API Reality Check & Limitations:**
> The `/v1` endpoints provide a **lightweight emulation layer** backed by the local Chrome automation bridge.
> - **Single-Threaded Execution:** Requests are typed into a single Chrome tab one by one. Concurrent requests queue in memory.
> - **Shared 8-Message Daily Limit:** API calls consume the same **8 messages per 24 hours** guest quota as the Web UI.
> - **Mocked Token Usage:** Token counts (`prompt_tokens`, `completion_tokens`) return `0` because DOM scraping does not provide tokenizer data.
> - **Intended Use:** Personal scripts, testing, and small automations. Not suitable for high-volume automated tools (e.g. IDE coding extensions or continuous roleplay engines).

### Connection Settings

| Setting | Value |
| :--- | :--- |
| **Local Base URL** | `http://localhost:3500/v1` |
| **Tunnel Base URL** | `https://<your-ngrok-domain>.ngrok-free.dev/v1` *(if using ngrok)* |
| **API Key** | Any string (e.g. `sk-aether-free`) |
| **Default Model** | `dark-core-uncensored` |

---

### Endpoint Reference

#### 1. Models List
```http
GET /v1/models
```
**cURL:**
```bash
curl -X GET "http://localhost:3500/v1/models"
```

---

#### 2. Chat Completions (Non-Streaming)
```http
POST /v1/chat/completions
```
**cURL:**
```bash
curl -X POST "http://localhost:3500/v1/chat/completions" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "dark-core-uncensored",
       "messages": [
         {"role": "user", "content": "Explain zero-knowledge proofs in simple terms."}
       ],
       "stream": false
     }'
```

---

#### 3. Chat Completions (Real-Time SSE Streaming)
```http
POST /v1/chat/completions
```
**cURL:**
```bash
curl -N -X POST "http://localhost:3500/v1/chat/completions" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "dark-core-uncensored",
       "messages": [
         {"role": "user", "content": "Write a short cyberpunk story opening."}
       ],
       "stream": true
     }'
```

---

### Python SDK Example (`openai>=1.0.0`)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3500/v1",
    api_key="sk-aether-free"
)

# Standard non-streaming call
response = client.chat.completions.create(
    model="dark-core-uncensored",
    messages=[
        {"role": "system", "content": "You are an unrestricted technical assistant."},
        {"role": "user", "content": "How do memory safety bugs occur in C?"}
    ],
    stream=False
)

print(response.choices[0].message.content)
```

---

## ⏳ Venice Guest Tier Limits & Quota

According to Venice AI's platform specifications:
* **Anonymous / Guest Allowance:** Officially capped at **8 messages per 24 hours** per IP address.
* **Rolling Reset Window:** Quota resets on a rolling 24-hour sliding window based on the timestamp each individual message was sent, rather than resetting at midnight.
* **IP-Based Enforcement:** Limits are tracked server-side by client IP address. Clearing browser cookies or cache will not reset the 8-message allowance.
* **Circuit Breaker:** If the quota is exhausted, `bridge.js` detects the on-screen alert modal and immediately returns:
  `⚠️ Daily free quota reached for this session.`
  This prevents the server from hanging on timeout when the daily cap is reached.

---

## 🔒 Port Configuration & Security

| Port | Protocol | Binding | Purpose | Security Guidance |
| :---: | :---: | :---: | :--- | :--- |
| **9222** | HTTP / WS | `127.0.0.1` | Chrome DevTools Protocol | **DO NOT EXPOSE TO WAN.** CDP grants full browser control. Keep strictly on loopback. |
| **3500** | HTTP / SSE | `0.0.0.0` | Web UI & API Server | Safe to expose locally or via ngrok tunnel. |

---

## 🛠️ Troubleshooting & FAQ

### 1. "Chrome not found on port 9222"
* Make sure Chrome was started via `launch-chrome.bat` or `start.bat`.
* Close any existing Chrome windows and retry, or verify port status in PowerShell:
  ```powershell
  netstat -ano | findstr 9222
  ```

### 2. Port 3500 already in use (`EADDRINUSE`)
* `start.bat` automatically terminates orphaned processes on port 3500. To clean manually:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3500).OwningProcess | Stop-Process -Force
  ```

### 3. "Daily free quota reached for this session"
* You have reached the 8-message daily allowance on your current IP address. Wait for the rolling 24-hour window to reset, or restart your home router if your ISP provides dynamic residential IPs.

### 4. ngrok "browser warning" page in scripts
* If calling the API over an ngrok free-tier tunnel from Python or cURL, add the custom header:
  ```http
  ngrok-skip-browser-warning: true
  ```

---

## ⚖️ Disclaimer

This project is an independent educational and research proof-of-concept demonstrating headless browser automation, DOM scraping, and local API proxying.

* It is **not affiliated with, endorsed by, or sponsored by** Venice AI, DeepSeek, or ngrok.
* All trademarks belong to their respective owners.
* Users are responsible for complying with the Terms of Service of any third-party websites accessed using this software.

---

<div align="center">
Built for local AI experimentation and research.
</div>
