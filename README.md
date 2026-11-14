# Aether AI — Uncensored Intelligence Bridge & OpenAI Facade

<div align="center">

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express-v5.3.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Puppeteer Core](https://img.shields.io/badge/Puppeteer--Core-v25.17-00D8A2?style=for-the-badge&logo=puppeteer&logoColor=white)](https://pptr.dev/)
[![ngrok Tunnel](https://img.shields.io/badge/Tunnel-ngrok%20Edge-1F1E33?style=for-the-badge&logo=ngrok&logoColor=white)](https://ngrok.com/)
[![Architecture](https://img.shields.io/badge/Architecture-CDP%20%7C%20SSE%20%7C%20REST-6366f1?style=for-the-badge)](#-system-architecture)
[![TCO](https://img.shields.io/badge/TCO-%240.00%20(100%25%20Free)-10b981?style=for-the-badge)](#-zero-cost-tco--infrastructure)

**A self-hosted, 100% free neural facade and web bridge for unrestricted LLM models. Wraps Venice's unauthenticated web tier inside a cyberpunk dark-mode interface and an OpenAI-compatible `/v1/chat/completions` API gateway.**

[Live Public Link](#-live-permanent-public-tunnel) • [1-Click Setup](#-1-click-quick-start) • [OpenAI API Spec](#-openai-compatible-api-specification) • [System Architecture](#-system-architecture) • [Troubleshooting](#-troubleshooting--faq)

</div>

---

## ⚡ Executive Overview

**Aether AI** transforms headless and automated browser compute into an enterprise-grade, zero-cost AI provider. By leveraging the **Chrome DevTools Protocol (CDP)**, a dedicated quarantined browser profile, and a custom Node.js Express facade, Aether AI connects directly to Venice AI's guest tier without requiring login credentials, API billing, or KYC verification.

Whether accessed through the built-in obsidian glassmorphic Web UI or integrated as a drop-in OpenAI API replacement into client applications like **SillyTavern**, **OpenWebUI**, **Cursor**, or custom Python automation pipelines, Aether AI delivers uncensored model access with real-time SSE token streaming, concurrency protection, and stealth brand virtualization.

---

## 🌟 Key Highlights

- **⚡ 1-Click Master Automation (`start.bat`):** Zero-friction launcher that cleans stuck ports, probes Chrome CDP, spins up the bridge server, mounts the ngrok tunnel, and opens your browser in seconds.
- **🌐 Global Public Edge Gateway:** Configured for seamless ngrok edge tunneling (`https://<your-domain>.ngrok-free.dev` or dynamic URL) providing global WAN access from mobile devices, tablets, and remote workstations.
- **🔌 Drop-In OpenAI API Compatibility:** Full `/v1/chat/completions` and `/v1/models` endpoints supporting both buffered replies and Server-Sent Events (SSE) token-by-token streaming.
- **🎭 Stealth Brand Masking & Identity Steering:** Real-time stream sanitizer (`sanitizeBrand`) and system-prompt injector enforce the **Aether AI** persona, scrubbing vendor references from text, code, and errors.
- **🛡️ Quarantined Chrome Profile Isolation:** Binds to `%LOCALAPPDATA%\VeniceBridgeProfile` on remote debugging port `9222`, guaranteeing complete isolation from your personal Google Chrome logins, extensions, and cookies.
- **🔒 Mutex Concurrency Queue:** Atomic request queue (`requestQueue` / `isBusy`) prevents multi-user prompt collision and race conditions across single-tab browser automation.
- **⏱️ Dual-Condition Stability Watchdog:** Adaptive DOM polling with sub-second finish detection (0.8s button vanishing gate) and a 2.4s safety watchdog to ensure zero dropped messages and eliminate timeout hangs.
- **💰 100% Zero-Cost ($0.00 TCO):** Zero cloud bills, zero API subscriptions, zero token metering.

---

## 🏗️ System Architecture

Aether AI operates across three decoupled layers: **Public Ingress**, **Application Facade**, and **Automation Engine**.

### High-Level Topology

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT INGRESS LAYER                                 |
|  [Custom Web UI (SPA)]   |   [SillyTavern / OpenWebUI]   |   [Python SDK / curl / Apps] |
+------------+-----------------------------+-------------------------------+--------------+
             | (SSE /api/chat)             | (/v1/chat/completions)        | (/v1/models)
             |                             |                               |
             +-----------------------------v-------------------------------+
                                           |
                                           v
             +-------------------------------------------------------------+
             |                 NGROK STATIC EDGE TUNNEL                    |
             |       https://<your-subdomain>.ngrok-free.dev         |
             |             (Edge TLS Termination / NAT Traversal)          |
             +-----------------------------+-------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------------+
|                          EXPRESS 5 API SERVER (server.js :3500)                         |
|  - CORS & JSON Parsing Middleware                                                       |
|  - Static Obsidian Web UI Host (`public/`)                                              |
|  - Native SSE Chat Pipeline (`/api/chat`)                                               |
|  - OpenAI-Compatible REST Router (`/v1/chat/completions`, `/v1/models`)                 |
|  - Telemetry & Health Probe (`/api/status`, `/api/new-chat`)                            |
+------------------------------------------+----------------------------------------------+
                                           | bridge.ask(prompt, onChunk)
                                           v
+-----------------------------------------------------------------------------------------+
|                        BRIDGE ORCHESTRATOR CORE (bridge.js)                             |
|  - Lock Engine & FIFO Request Mutex (`this.requestQueue`, `this.isBusy`)                |
|  - Dynamic Identity Steering Injector (Regex Detection -> Persona Injection)            |
|  - React / Chakra UI Synthetic Event Bypasser (Native Prototype Setter)                 |
|  - Real-Time Token Streamer & Watchdog (200ms Poller, 0.8s / 2.4s Stability Gates)       |
|  - Real-Time Stream Brand Sanitizer (`sanitizeBrand`)                                   |
|  - In-DOM Quota & Rate-Limit Circuit Breaker                                            |
+------------------------------------------+----------------------------------------------+
                                           | Chrome DevTools Protocol (CDP WebSocket)
                                           v
+-----------------------------------------------------------------------------------------+
|                    ISOLATED CHROME INSTANCE (launch-chrome.bat :9222)                   |
|  - Command: chrome.exe --remote-debugging-port=9222 --user-data-dir="...Profile"        |
|  - Target Session: https://venice.ai/chat/classic (Anonymous Guest Tier)               |
+-----------------------------------------------------------------------------------------+
```

### Mermaid Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client / Python / Web UI
    participant Server as Express Server (:3500)
    participant Bridge as Bridge Core (bridge.js)
    participant Chrome as Chrome CDP (:9222)
    participant Provider as Venice Guest Tier

    Client->>Server: POST /v1/chat/completions (stream=true)
    Server->>Bridge: ask(prompt, onChunk)
    Note over Bridge: Enqueue task in FIFO Mutex Queue
    Bridge->>Bridge: Acquire isBusy Lock & Apply Identity Steering
    Bridge->>Chrome: Inject prompt via Native HTMLTextArea setter
    Bridge->>Chrome: Trigger Submit Button (Enter fallback)
    Chrome->>Provider: Send prompt to neural model

    loop Every 200ms DOM Polling
        Chrome-->>Bridge: Scrape assistant div.prose delta
        Bridge->>Bridge: Run sanitizeBrand(chunk)
        Bridge-->>Server: onChunk({ text, html })
        Server-->>Client: SSE data: {"choices":[{"delta":{"content":"..."}}]}
    end

    Note over Bridge: Watchdog detects Stop Button gone & 0.8s DOM stability
    Bridge-->>Server: Execution Resolved
    Server-->>Client: data: [DONE]
    Bridge->>Bridge: Release isBusy Lock -> Process Next in Queue
```

---

## ⚡ 1-Click Quick Start

### Prerequisites
1. **Windows 10 / 11**
2. **[Node.js](https://nodejs.org/)** (v18 or higher recommended)
3. **Google Chrome** (standard installation path)
4. **[ngrok](https://ngrok.com/)** (installed and added to system `PATH`)

### Launching the System
Simply double-click the launcher script in the project root:

```bat
start.bat
```

### What `start.bat` Executes Under the Hood
The master script executes an automated 6-phase deployment:
1. **Process & Socket Hygiene:** Kills any orphaned `ngrok.exe` processes and resolves active PID bindings on TCP port `3500` via `netstat -aon`, terminating lingering processes to eliminate `EADDRINUSE` errors.
2. **CDP Daemon Probing:** Queries `netstat -ano | findstr 9222`. If Chrome is inactive, it executes `launch-chrome.bat` with a dedicated ICMP wait loop (`ping -n 3 127.0.0.1`) until Chrome DevTools Protocol is initialized.
3. **Server Daemonization:** Spawns the Node.js Express server in a dedicated persistent console window (`Aether AI - Server Window`) using `cmd /k` so runtime logs remain visible.
4. **Static Public Edge Tunnel:** Spawns ngrok with your static public hostname (`ngrok http 3500 --url https://<your-subdomain>.ngrok-free.dev`).
5. **Convergence Delay:** Pauses 3 seconds to guarantee socket listener binding and TLS handshaking before clients hit the port.
6. **Automated UX Egress:** Launches your default operating system browser directly to the live public endpoint.

---

## 🌐 Live Permanent Public Tunnel

Aether AI includes a permanent, reserved public edge URL powered by ngrok:

👉 **[https://<your-subdomain>.ngrok-free.dev](https://<your-subdomain>.ngrok-free.dev)**

### Remote Access Capabilities
- **Universal Device Access:** Open the URL on any smartphone (iOS / Android), tablet, or external laptop worldwide.
- **NAT / Firewall Traversal:** Zero port forwarding required on your router; works behind Carrier-Grade NAT (CGNAT) and restricted Wi-Fi networks.
- **Automatic Edge SSL/TLS:** Full HTTPS encryption terminating at the ngrok edge.

> [!TIP]
> **Headless API Client Compatibility:** When interacting with the ngrok free tier using automated scripts or curl, include the custom header `-H "ngrok-skip-browser-warning: true"` or a standard `User-Agent` to bypass ngrok's one-time anti-abuse interstitial page.

---

## 🔌 OpenAI-Compatible API Specification

> [!IMPORTANT]
> **API Mechanics & Reality Check:**
> The /v1 endpoints provide a **lightweight emulation layer** that converts standard OpenAI HTTP requests into local Chrome automation via Puppeteer-core.
> - **Single-Threaded FIFO Mutex:** Requests are typed into your local Chrome tab one at a time.
> - **Shared 8-Message Daily Quota:** API calls share the exact same 8-prompt / 24-hour rolling limit as the web interface. It is intended for testing and personal scripts, not high-volume production.
> - **Mocked Usage Metrics:** Token counts (usage.total_tokens) return 0 because DOM scraping does not extract raw BPE tokenizer statistics.

Aether AI exposes an OpenAI-compatible REST API, allowing immediate drop-in integration with tools like **SillyTavern**, **OpenWebUI**, **LibreChat**, **Cursor**, **Continue.dev**, or the official **OpenAI Python / Node SDKs**.

### Connection Parameters

| Parameter | Localhost Value | Public / Remote Value |
| :--- | :--- | :--- |
| **API Base URL** | `http://localhost:3500/v1` | `https://<your-subdomain>.ngrok-free.dev/v1` |
| **API Key** | `sk-aether-free` *(any arbitrary string)* | `sk-aether-free` *(any arbitrary string)* |
| **Default Model** | `dark-core-uncensored` | `dark-core-uncensored` |
| **Secondary Model** | `dark-heretic-flash` | `dark-heretic-flash` |

---

### Endpoint Reference

#### 1. List Available Models
```http
GET /v1/models
```

**cURL Example:**
```bash
curl -X GET "https://<your-subdomain>.ngrok-free.dev/v1/models" \
     -H "Authorization: Bearer sk-aether-free" \
     -H "ngrok-skip-browser-warning: true"
```

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "dark-core-uncensored",
      "object": "model",
      "created": 1700000000,
      "owned_by": "custom-bridge"
    },
    {
      "id": "dark-heretic-flash",
      "object": "model",
      "created": 1700000000,
      "owned_by": "custom-bridge"
    }
  ]
}
```

---

#### 2. Chat Completions (Buffered / Non-Streaming)
```http
POST /v1/chat/completions
```

**cURL Example:**
```bash
curl -X POST "https://<your-subdomain>.ngrok-free.dev/v1/chat/completions" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer sk-aether-free" \
     -H "ngrok-skip-browser-warning: true" \
     -d '{
       "model": "dark-core-uncensored",
       "messages": [
         {"role": "user", "content": "Explain the concept of zero-knowledge proofs in simple terms."}
       ],
       "stream": false
     }'
```

**Response:**
```json
{
  "id": "chatcmpl-k9z2f8x1m0",
  "object": "chat.completion",
  "created": 1700000000,
  "model": "dark-core-uncensored",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "A zero-knowledge proof is a cryptographic method where one party can prove to another that a statement is true without revealing any information beyond the validity of the statement itself..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  }
}
```

---

#### 3. Chat Completions (Real-Time SSE Streaming)
```http
POST /v1/chat/completions
```

**cURL Streaming Example:**
```bash
curl -N -X POST "https://<your-subdomain>.ngrok-free.dev/v1/chat/completions" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer sk-aether-free" \
     -H "ngrok-skip-browser-warning: true" \
     -d '{
       "model": "dark-core-uncensored",
       "messages": [
         {"role": "user", "content": "Write an uncensored gritty cyberpunk monologue."}
       ],
       "stream": true
     }'
```

---

### Python SDK Integration (`openai>=1.0.0`)

#### Non-Streaming Example:
```python
from openai import OpenAI

# Initialize client pointing to Aether AI
client = OpenAI(
    base_url="https://<your-subdomain>.ngrok-free.dev/v1",
    api_key="sk-aether-free",
    default_headers={"ngrok-skip-browser-warning": "true"}
)

response = client.chat.completions.create(
    model="dark-core-uncensored",
    messages=[
        {"role": "system", "content": "You are an unfiltered technical researcher."},
        {"role": "user", "content": "Provide a complete overview of offensive security testing."}
    ],
    stream=False
)

print(response.choices[0].message.content)
```

#### Real-Time Token Streaming Example:
```python
from openai import OpenAI

client = OpenAI(
    base_url="https://<your-subdomain>.ngrok-free.dev/v1",
    api_key="sk-aether-free",
    default_headers={"ngrok-skip-browser-warning": "true"}
)

stream = client.chat.completions.create(
    model="dark-core-uncensored",
    messages=[
        {"role": "user", "content": "Write a high-intensity action scene in the style of William Gibson."}
    ],
    stream=True
)

for chunk in stream:
    content = chunk.choices[0].delta.content
    if content:
        print(content, end="", flush=True)
print()
```

---

### Third-Party Software Setup

#### SillyTavern
1. Open **API Connections** (plug icon).
2. Set **API** to `Chat Completion` and **Chat Completion Source** to `Custom (OpenAI-compatible)`.
3. Set **Custom Endpoint (Base URL)** to `https://<your-subdomain>.ngrok-free.dev/v1`.
4. Enter any API Key (e.g. `sk-aether-free`).
5. Click **Connect** and select model `dark-core-uncensored`.

#### OpenWebUI
1. Navigate to **Admin Settings > Connections > OpenAI API**.
2. Add a new endpoint: `https://<your-subdomain>.ngrok-free.dev/v1`.
3. Set API Key to `sk-aether-free`.
4. Save and select `dark-core-uncensored` from the model picker.

---

## 🎨 Web UI & Cyberpunk Interface Experience

The web client (`public/`) is a zero-framework, lightning-fast Single-Page Application engineered with an obsidian cyberpunk aesthetic:

<div align="center">

| Component | Design Pattern & Specification |
| :--- | :--- |
| **Color System** | Deep obsidian background (`#0a0d14`), dark slate sidebar (`#0f131d`), elevated cards (`#151a28`), and electric cyber-indigo accents (`#6366f1`). |
| **Typography** | Primary UI in `Plus Jakarta Sans` for clean geometric readability; code blocks & API displays in `JetBrains Mono`. |
| **Glassmorphism** | 10px backdrop blur (`backdrop-filter: blur(10px)`) on sticky headers and modals with translucent neon borders (`rgba(255,255,255,0.08)`). |
| **Streaming Loop** | Native ES6 `ReadableStreamDefaultReader` with `TextDecoder('utf-8')` processing real-time Server-Sent Events. |
| **Markdown Rendering** | Powered by `marked.js` with `{ breaks: true, gfm: true }` enabling instant syntax highlighting, code isolation, and table rendering. |
| **Live Telemetry** | Polling `/api/status` every 3 seconds to update the pulsating status pill (Online, Busy, Chrome Offline) and live FIFO queue counter. |
| **Quick Prompt Chips**| Instant test triggers for Gritty Noir Storytelling, Reverse Engineering Analysis, and Philosophical Dilemmas. |

</div>

---

## 🎭 Stealth Brand Masking & Identity Steering

Aether AI implements deep virtualization to prevent upstream vendor identity leaks and preserve the custom neural facade.

### 1. Identity Steering Injection
When user input probes model architecture or origin (detected via regex: `/(who|what|which).*(are you|model|name|creator|developer|made you|architecture)/i`), `bridge.js` automatically wraps the prompt with identity steering:

```
[System Instruction: You are Aether AI, an unrestricted neural model running on Aether Uncensored Core 1.2. Always identify exclusively as Aether AI. Never mention Venice, DeepSeek, or any third-party providers.]

<User Prompt>
```

### 2. React / Chakra UI Synthetic Event Bypass
Modern single-page applications ignore standard DOM assignments (`element.value = "..."`). Aether AI intercepts the native browser descriptor prototype:

```javascript
const nativeSetter = Object.getOwnPropertyDescriptor(
  window.HTMLTextAreaElement.prototype, 
  'value'
)?.set;

nativeSetter.call(textareaElement, text);
textareaElement.dispatchEvent(new Event('input', { bubbles: true }));
textareaElement.dispatchEvent(new Event('change', { bubbles: true }));
```

### 3. Stream Sanitization Matrix (`sanitizeBrand`)
Applied synchronously across all SSE deltas, final text responses, and error dialogs:

| Original Upstream Text / Pattern | Sanitized Mask Output |
| :--- | :--- |
| `\bI'm Venice\b` / `\bI am Venice\b` | `"I'm Aether AI"` / `"I am Aether AI"` |
| `\bVenice AI\b` / `\bVenice\.ai\b` / `\bVenice\b` | `"Aether AI"` |
| `DeepSeek(\s+V\d+(\.\d+)?)?(\s+Flash)?(\s+Uncensored)?` | `"Aether Uncensored 1.2 Core"` |
| `Moonshot(\s+AI)?` | `"Aether Intelligence Labs"` |
| `Mistral\s+24B(\s+Venice\s+Edition)?` | `"Aether-24B Unrestricted"` |
| `sign up|create an account|log in` *(in error modals)* | `"daily limit reached"` |

---

## ⏳ Venice AI Guest Tier Limits & Rolling Reset Window

### Anonymous Guest Tier Rules
- **Free Quota:** Venice AI grants an official anonymous allowance of **8 messages per 24-hour rolling window** per residential IP address.
- **Zero Login / KYC:** No email registration, password, telephone number, or credit card required.
- **Anti-Abuse Verification:** Enforced through Cloudflare edge IP heuristics and browser fingerprinting.

### Fast-Fail Circuit Breaker
Rather than hanging for 45 seconds when a quota cap is hit, `bridge.js` scans the DOM for error dialogs (`[role="alert"]`, `[data-status="error"]`, `.chakra-alert`, and modals containing `"limit"` / `"upgrade"`). Upon detection:
1. It immediately aborts the scrape.
2. Sanitizes the error message.
3. Emits an HTTP `429 Too Many Requests` (`rate_limit_exceeded`) to API clients, or an inline amber warning to the Web UI.

### Quota Reset Strategies
1. **Dynamic Residential IP Cycling:** Residential ISP modems typically hold dynamic IP pools. Restarting your home router or cycling your connection provides a new external IP, immediately granting a fresh 8-message allocation.
2. **Profile Re-Hygiene:** If Cloudflare flags the browser profile, deleting `%LOCALAPPDATA%\VeniceBridgeProfile` forces Chrome to generate a clean cookie container and session state upon next launch.
3. **VPN / Residential Proxies:** Routing the Chrome bridge instance through a residential VPN or proxy instantly rotates your session pool.

---

## 🔒 Configuration & Port Mapping Matrix

| Port | Protocol | Binding Interface | Security Zone | Purpose & Functionality | Security Criticality |
| :---: | :---: | :---: | :---: | :--- | :--- |
| **9222** | HTTP / WebSocket | `127.0.0.1` | **Strictly Internal (Localhost)** | Chrome DevTools Protocol (CDP) for Puppeteer DOM manipulation | 🔴 **CRITICAL RISK if exposed.** Remote debugging grants arbitrary command execution. Must never be exposed to WAN or tunnel. |
| **3500** | HTTP / SSE / REST | `0.0.0.0` / `localhost` | **Public via ngrok Edge** | Serves Web UI, SSE chat stream (`/api/chat`), and OpenAI API (`/v1`) | 🟢 **Safe for Public Ingress.** Request serialization protects backend concurrency. |

### Quarantined Chrome Profile Isolation
In `launch-chrome.bat`, Chrome is explicitly launched with:
```bat
--remote-debugging-port=9222 --user-data-dir="%LOCALAPPDATA%\VeniceBridgeProfile" https://venice.ai/chat/classic
```
- **Why this matters:** If Chrome is already running on your PC with your personal profile, launching `chrome.exe --remote-debugging-port=9222` without `--user-data-dir` will silently join your existing session and **fail to open the debug port**.
- Quarantining to `VeniceBridgeProfile` isolates your personal browsing history, passwords, and extensions from automation while persisting guest session tokens across restarts.

---

## 📂 Repository Structure

```
Uncensored_AI_Chat/
├── bridge.js              # Core Puppeteer-core CDP automation, mutex queue, sanitization & watchdog
├── server.js              # Express 5 server hosting Web UI, SSE streaming, and OpenAI /v1 router
├── start.bat              # Master 1-click startup automation script (6-phase lifecycle)
├── launch-chrome.bat      # Dedicated Chrome initiator with remote debugging and isolated profile
├── package.json           # Project manifest and dependency declarations
├── package-lock.json      # Locked dependency tree
├── README.md              # Comprehensive production documentation
└── public/                # Cyberpunk Dark-Mode Web Client
    ├── index.html         # Single-Page Application structure & modals
    ├── style.css          # Glassmorphism & obsidian cyber theme variables
    └── app.js             # SSE streaming reader loop, UI state & telemetry poller
```

---

## 🛠️ Troubleshooting & FAQ

### 1. "Chrome not found on port 9222. Please run launch-chrome.bat"
- **Cause:** Chrome was not started with `--remote-debugging-port=9222` or an existing Chrome process blocked the port.
- **Resolution:**
  1. Close all active Google Chrome windows.
  2. Run `launch-chrome.bat` manually or launch `start.bat`.
  3. Verify in PowerShell: `netstat -ano | findstr 9222`. You should see `LISTENING` on `127.0.0.1:9222`.

### 2. Port 3500 `EADDRINUSE` Error
- **Cause:** An orphaned instance of Node.js or another service is holding port 3500.
- **Resolution:** `start.bat` cleans this automatically. To clean manually:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3500).OwningProcess | Stop-Process -Force
  ```

### 3. ngrok Session / Domain Error
- **Cause:** The reserved domain is tied to an authtoken not yet registered on your local machine.
- **Resolution:** Run `ngrok config add-authtoken <YOUR_TOKEN>` using the account owning the domain.

### 4. HTTP 429 "Daily free quota reached for this session"
- **Cause:** The 8-message rolling limit for your residential IP has been consumed.
- **Resolution:**
  - Wait for the rolling 24-hour window to reset.
  - Cycle your dynamic residential IP (reboot router/modem).
  - Clear the profile cache: `rd /s /q "%LOCALAPPDATA%\VeniceBridgeProfile"`.

### 5. API Client hangs on raw GET / POST via ngrok
- **Cause:** ngrok displays a free-tier browser interstitial warning page on direct web connections.
- **Resolution:** In your HTTP request headers, pass:
  ```http
  ngrok-skip-browser-warning: true
  ```
  or configure a custom `User-Agent`.

---

## 💰 Zero-Cost (TCO) & Infrastructure

| Resource Component | Hosting Provider | Monthly Cost |
| :--- | :--- | :---: |
| **Compute / Host** | Local Workstation (Windows) | **$0.00** |
| **LLM Inference** | Unauthenticated Guest Web Tier | **$0.00** |
| **Edge Tunnel & TLS**| ngrok Static Free Tier | **$0.00** |
| **Software Stack** | Node.js, Express, Puppeteer (Open Source) | **$0.00** |
| **Total Monthly TCO** | | **$0.00** |

---

## ⚖️ Disclaimer & Ethical Notice

This software is an independent open-source research and educational prototype demonstrating headless browser automation, reverse-proxying, and API normalization techniques. 

- This project is **not affiliated with, endorsed by, or sponsored by** Venice AI, DeepSeek, Moonshot, Mistral, or ngrok.
- All product and company names are trademarks™ or registered® trademarks of their respective holders.
- Users are solely responsible for adhering to the Terms of Service of any third-party websites or services accessed through this tool, as well as applicable local laws and regulations governing automated web interactions and AI usage.

---

<div align="center">

Crafted with ⚡ by the **Aether AI / Uncensored AI Chat** Open Source Initiative.

</div>
