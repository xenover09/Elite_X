<div align="center">
  <img src="src/dashboard/public/logo.jpg" alt="Elite X Logo" width="150" style="border-radius: 20px;" />
  <h1>Elite X</h1>
  <p><strong>A Next-Generation Discord AI & Moderation Bot with a Blazing Fast SPA Web Dashboard</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Node.js-18.x-green.svg" alt="Node.js" />
    <img src="https://img.shields.io/badge/Discord.js-v14-blue.svg" alt="Discord.js" />
    <img src="https://img.shields.io/badge/Express.js-Backend-black.svg" alt="Express" />
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
  </p>
</div>

---

## Overview

**Elite X** is a feature-rich, high-performance Discord bot designed for modern communities. It combines lightning-fast AI conversational capabilities (powered by Groq) with an advanced, beautifully designed, and zero-reload **Single Page Application (SPA)** web dashboard for seamless server management.

Whether you need to send dynamic embeds, manage channel privacy, or strictly control AI access for your community, Elite X provides a robust, all-in-one solution.

---

## Key Features

### ⚡ Blazing Fast Web Dashboard (SPA)
- **Zero-Reload Navigation:** Built with custom Vanilla JS and `history.pushState`, providing an instant, app-like experience without ever refreshing the page.
- **Secure Authentication:** OAuth2 Discord login ensures only authorized server administrators can manage their servers. Session persistence is fully optimized for reverse-proxies (e.g., Railway, Nginx).
- **Beautiful UI/UX:** A stunning dark mode interface with glassmorphism, micro-animations, and dynamic data fetching.

### 🤖 Strict & Configurable AI (Groq)
- **Off by Default:** When the bot joins a server, AI features are completely disabled by default for safety.
- **Channel Restriction:** AI will *only* respond in the specific channel designated by the server admin via the dashboard.
- **Bring Your Own Key (BYOK):** The AI requires the server admin to input their own Groq API Key via the dashboard. If no key is provided, the AI refuses to run.
- **Rate Limited & Cooldowns:** Built-in safeguards to prevent API spam and abuse.

### 🛡️ Powerful Moderation & Utilities
- **Advanced Embed Builder:** Create and send fully customized rich embeds (custom titles, descriptions, colors, images, and interactive buttons) directly from the web panel.
- **Channel Lock/Unlock:** Instantly restrict channel access to specific VIP or Admin roles with a single click.
- **Clear Chat (Nuke):** Instantly clone and delete a channel to permanently clear message history while perfectly preserving all channel permissions and positions.

---

## Getting Started

### Prerequisites

- **Node.js** v18.x or higher
- A **Discord Bot Token** and **Client ID/Secret** from the [Discord Developer Portal](https://discord.com/developers/applications)
- A **Groq API Key** (Users will provide their own through the dashboard)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/xenover09/Elite_X.git
   cd Elite_X
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and fill in your credentials:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   CLIENT_SECRET=your_client_secret_here
   CALLBACK_URL=http://localhost:3001/auth/callback
   PORT=3001
   
   # Optional fallback environment variables
   GROQ_API_KEY=your_fallback_groq_api_key
   ADMIN_KEY=your_secure_dashboard_admin_password
   ```

4. **Run the Bot & Dashboard:**
   For development (auto-restarts on changes):
   ```bash
   npm run dev
   ```
   For production:
   ```bash
   npm start
   ```

---

## Dashboard Preview

*The dashboard provides an intuitive, module-based approach to managing your servers.*

- **Landing Page:** Welcomes users with a modern hero section.
- **My Guilds:** Seamlessly loads a list of all servers where you have admin permissions.
- **Manage Server:** Access the Embed Sender, Channel Locker, AI Settings, and Chat Clearer all in one instant-loading workspace.

---

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/xenover09/Elite_X/issues).

---

<div align="center">
  <p>Secured with Elite Bearer Auth • © 2026 The Elite Circle</p>
</div>
