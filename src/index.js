/**
 * A serverless URL shortener and Telegram bot, running on Cloudflare Workers.
 *
 * GitHub: https://github.com/Johndevils/url-shortner-
 * Credit: @Arsynox, @pheonixion
 */
export default {
  /**
   * The main fetch handler for the Cloudflare Worker.
   * This function acts as the central router for all incoming requests.
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);

    // Handle incoming POST requests from the Telegram webhook.
    if (request.method === 'POST') {
      return this.handleTelegramUpdate(request, env);
    }

    // Handle incoming GET requests.
    if (request.method === 'GET') {
      if (path) {
        // If a path exists (e.g., /AbC123d), treat it as a short link and redirect.
        return this.handleRedirect(path, env);
      } else {
        // --- HTML REMOVED ---
        // If no path exists (root domain), redirect to the GitHub repository.
        const repoUrl = env.GITHUB_REPO_URL;
        if (repoUrl) {
          // Using a 302 redirect (Found) is appropriate for this kind of link.
          return Response.redirect(repoUrl, 302);
        } else {
          // Fallback message if GITHUB_REPO_URL is not set.
          return new Response('This is a Telegram URL Shortener Bot. The GitHub repository link is not configured.', { status: 200 });
        }
      }
    }

    // For any other HTTP method, return an error.
    return new Response('Method Not Allowed', { status: 405 });
  },

  /**
   * Handles incoming updates from the Telegram webhook.
   */
  async handleTelegramUpdate(request, env) {
    const payload = await request.json();
    if (payload.message && payload.message.text) {
      const message = payload.message;
      const chatId = message.chat.id;
      const text = message.text;

      if (text === '/start') {
        await this.sendWelcomeMessage(env, chatId);
      } else if (this.isValidUrl(text)) {
        await this.shortenAndReply(request, env, chatId, text);
      } else {
        await this.sendMessage(env, chatId, 'That doesn\'t look like a valid URL. Please send a URL that starts with http:// or https://');
      }
    }
    return new Response('OK', { status: 200 });
  },

  /**
   * Handles redirecting a short code to its corresponding long URL.
   */
  async handleRedirect(shortCode, env) {
    const longUrl = await env.URL_STORE.get(shortCode);
    if (longUrl) {
      return Response.redirect(longUrl, 301); // 301 Permanent Redirect for short links
    } else {
      return new Response('URL not found.', { status: 404 });
    }
  },
  
  /**
   * Sends the welcome message as text with an inline keyboard.
   */
  async sendWelcomeMessage(env, chatId) {
    const text = "Welcome! I'm a URL shortener bot powered by Cloudflare Workers. Send me any long URL, and I'll shrink it for you!";
    const githubRepoUrl = env.GITHUB_REPO_URL;

    const replyMarkup = {
      inline_keyboard: [
        [ // Row 1
          { text: '⭐ View on GitHub', url: githubRepoUrl },
          { text: 'Credit: @pheonixion', url: 'https://t.me/pheonixion' }
        ]
      ],
    };

    const payload = {
      chat_id: chatId,
      text: text,
      reply_markup: replyMarkup,
    };
    
    const apiUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  /**
   * Shortens a URL, stores it in KV, and sends the result back to the user.
   */
  async shortenAndReply(request, env, chatId, longUrl) {
    try {
      const workerUrl = new URL(request.url).origin;
      const shortCode = await this.generateUniqueShortCode(env.URL_STORE);
      await env.URL_STORE.put(shortCode, longUrl);

      const shortUrl = `${workerUrl}/${shortCode}`;
      await this.sendMessage(env, chatId, `Success! Here is your short URL:\n${shortUrl}`);
    } catch (error) {
      console.error("Error in shortenAndReply:", error);
      await this.sendMessage(env, chatId, 'Sorry, an unexpected error occurred. Please try again later.');
    }
  },

  /**
   * Sends a simple text message via the Telegram Bot API.
   */
  async sendMessage(env, chatId, text) {
    const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const payload = { chat_id: chatId, text: text };
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // --- Helper Functions ---
  isValidUrl(urlString) {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) { return false; }
  },
  async generateUniqueShortCode(store, length = 7) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code; let isUnique = false;
    while (!isUnique) {
      code = '';
      for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      if (!(await store.get(code))) { isUnique = true; }
    }
    return code;
  },
};
