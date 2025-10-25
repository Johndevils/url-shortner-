/**
 * https://github.com/Johndevils/url-shortner- *
 * Credit : Arsynox */
export default {
  /**
   * The main fetch handler for the Cloudflare Worker.
   * This function acts as the central router for all incoming requests.
   *
   * @param {Request} request - The incoming HTTP request.
   * @param {object} env - The environment object containing secrets (TELEGRAM_BOT_TOKEN),
   *                       variables (GITHUB_REPO_URL), and KV bindings (URL_STORE).
   * @returns {Promise<Response>} A promise that resolves to the HTTP response.
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // Remove the leading '/' from the path

    // ROUTE 1: Handle POST requests from the Telegram webhook.
    if (request.method === 'POST') {
      return this.handleTelegramUpdate(request, env);
    }

    // ROUTE 2: Handle GET requests with a path (e.g., /AbC123d) for redirection.
    if (request.method === 'GET' && path) {
      return this.handleRedirect(path, env);
    }

    // ROUTE 3: If a user visits the root worker URL, show a simple HTML landing page.
    // This provides a professional presence for your custom domain.
    const repoUrl = env.GITHUB_REPO_URL || "https://github.com/cloudflare/workers-sdk";
    return new Response(
      `<html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 4rem; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h1 style="color: #111827;">Telegram URL Shortener Bot</h1>
            <p style="color: #4b5563;">This domain powers a serverless URL shortener bot on Telegram.</p>
            <a href="${repoUrl}" target="_blank" style="display: inline-block; margin-top: 1rem; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">View on GitHub</a>
          </div>
        </body>
      </html>`, {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  },

  /**
   * Handles incoming updates from the Telegram webhook by parsing the JSON payload.
   * @param {Request} request The incoming request from Telegram.
   * @param {object} env The environment object.
   */
  async handleTelegramUpdate(request, env) {
    const payload = await request.json();
    if (payload.message && payload.message.text) {
      const message = payload.message;
      const chatId = message.chat.id;
      const text = message.text;

      // Route commands and messages to the appropriate functions.
      if (text === '/start') {
        await this.sendWelcomeAnimation(env, chatId);
      } else if (this.isValidUrl(text)) {
        await this.shortenAndReply(request, env, chatId, text);
      } else {
        await this.sendMessage(env, chatId, 'That doesn\'t look like a valid URL. Please send a URL that starts with http:// or https://');
      }
    }
    // Always return a 200 OK to Telegram to acknowledge receipt of the update.
    // If you don't, Telegram will repeatedly re-send the same update.
    return new Response('OK', { status: 200 });
  },

  /**
   * Handles redirecting a short code to its corresponding long URL.
   * @param {string} shortCode The short code from the URL path.
   * @param {object} env The environment object.
   */
  async handleRedirect(shortCode, env) {
    const longUrl = await env.URL_STORE.get(shortCode);
    if (longUrl) {
      // Perform a 301 Permanent Redirect to the long URL.
      return Response.redirect(longUrl, 301);
    } else {
      // If the code is not found in the KV store, return a 404 Not Found response.
      return new Response('URL not found. It may have expired or never existed.', { status: 404 });
    }
  },

  /**
   * Sends the enhanced welcome message with a GIF and an inline GitHub button.
   * @param {object} env The environment object.
   * @param {number} chatId The chat ID to send the message to.
   */
  async sendWelcomeAnimation(env, chatId) {
    const animationUrl = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWYwZTRmMjkyM2RjZDI1NmVjYmQ3OWMyYjI3MjcxN2RmMjNhMzA2ZiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/3o6MbhgBx0UfbB7Dck/giphy.gif';
    const caption = "Welcome! I'm a URL shortener bot powered by Cloudflare Workers. Send me any long URL, and I'll shrink it for you!";
    const githubRepoUrl = env.GITHUB_REPO_URL;

    // The inline keyboard button structure required by the Telegram Bot API.
    const replyMarkup = {
      inline_keyboard: [
        [{ text: '⭐ View on GitHub', url: githubRepoUrl }],
      ],
    };

    const payload = {
      chat_id: chatId,
      animation: animationUrl,
      caption: caption,
      reply_markup: replyMarkup,
    };
    
    const apiUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendAnimation`;
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  /**
   * Shortens a URL, stores it in KV, and sends the result back to the user.
   * @param {Request} request The original incoming request (used to determine the domain).
   * @param {object} env The environment object.
   * @param {number} chatId The chat ID to reply to.
   * @param {string} longUrl The URL to shorten.
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
   * @param {object} env The environment object.
   * @param {number} chatId The chat ID to send the message to.
   * @param {string} text The text to send.
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

  /**
   * Validates a string to ensure it is a well-formed URL with an http/https protocol.
   * @param {string} urlString The string to validate.
   * @returns {boolean} True if the URL is valid, false otherwise.
   */
  isValidUrl(urlString) {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  },

  /**
   * Generates a random, unique short code that does not already exist in the KV store.
   * It will retry if a collision occurs, which is statistically rare.
   * @param {KVNamespace} store The KV store to check for uniqueness.
   * @param {number} length The desired length of the short code (default is 7).
   * @returns {Promise<string>} A unique short code.
   */
  async generateUniqueShortCode(store, length = 7) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = '';
      for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      // Check if the generated code already exists in the KV store.
      if (!(await store.get(code))) {
        isUnique = true;
      }
    }
    return code;
  },
};
