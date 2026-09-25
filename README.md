<div align="center">
  <img src="assets/logo.jpg" alt="Elite X Logo" width="150" />
  <h1>Elite X</h1>
  <p><strong>A Next-Generation Discord AI & Moderation Bot with a Powerful Web Dashboard</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Node.js-18.x-green.svg" alt="Node.js" />
    <img src="https://img.shields.io/badge/Discord.js-v14-blue.svg" alt="Discord.js" />
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
  </p>
</div>

---

## Overview

**Elite X** is a feature-rich, high-performance Discord bot designed for modern communities. It combines lightning-fast AI conversational capabilities (powered by Groq) with an advanced, beautifully designed web dashboard for seamless server management.

Whether you need to send dynamic embeds, manage channel privacy, or leverage AI for your community, Elite X provides a robust, all-in-one solution.

---

## Key Features

### Advanced AI Capabilities
- **Intelligent Chat:** Engaging and context-aware conversational AI using the Groq API.
- **Toggleable AI:** Server admins can easily enable or disable AI features per server via the dashboard.

### Professional Web Dashboard
- **Secure Authentication:** OAuth2 Discord login ensures only authorized users can manage their servers.
- **Multi-Server Management:** Easily switch between different servers where you have admin permissions.
- **Live Server Stats:** View member counts, text channels, and voice channels at a glance.
- **Theming:** Beautiful, responsive UI with Dark and Light mode support.

### Powerful Moderation & Utilities
- **Channel Lock/Unlock:** Instantly restrict channel access to specific VIP or Admin roles with a single click.
- **Advanced Embed Builder:** Create and send fully customized rich embeds (custom titles, descriptions, colors, images, and interactive buttons).
- **Clear Chat (Clone Method):** Nuke and recreate a channel instantly to permanently clear message history without losing permissions.

---

## Getting Started

### Prerequisites

- **Node.js** v18.x or higher
- **NPM** or **Yarn**
- A **Discord Bot Token** and **Client ID/Secret** from the [Discord Developer Portal](https://discord.com/developers/applications)
- A **Groq API Key** for AI features

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/xenoverhubofficial09-netizen/Elite-ai-bot.git
   cd Elite-ai-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Rename `.env.example` to `.env` (or create a new `.env` file) and fill in your credentials:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   CLIENT_SECRET=your_client_secret_here
   CALLBACK_URL=http://localhost:3001/auth/callback
   PORT=3001
   GROQ_API_KEY=your_groq_api_key
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

- **Dashboard Login:** Secured via Discord OAuth and Admin Key.
- **Server Overview:** Real-time statistics.
- **Manage Server:** Access powerful tools like Embed Sender, Channel Locker, and Chat Clearer.

---

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/xenoverhubofficial09-netizen/Elite-ai-bot/issues).

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---
<div align="center">
  <i>Developed by Xenover</i>
</div>
