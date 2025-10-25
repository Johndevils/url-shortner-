/** https://github.com/Johndevils/url-shortner-
credit : arsynox*/
export default {
  /**
   * The main fetch handler for the Cloudflare Worker.
   * @param {Request} request - The incoming request.
   * @param {object} env - The environment object with secrets and KV bindings.
   * @returns {Promise<Response>}
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // Remove leading '/'

    if (request.method === 'POST') {
      return this.handleTelegramUpdate(request, env);
    }
    if (request.method === 'GET' && path) {
      return this.handleRedirect(path, env);
    }

    // A nice landing page for the worker URL
    const repoUrl = env.GITHUB_REPO_URL || "https://github.com/cloudflare/workers-sdk/tree/main/templates/worker-telegram-bot";
    return new Response(
      `<html>
        <body style="font-family: sans-serif; text-align: center; padding-top: 5rem;">
          <h1>Telegram URL Shortener Bot</h1>
          <p>This Worker powers a Telegram bot. To use it, find the bot on Telegram!</p>
          <a href="${repoUrl}" target="_blank">View on GitHub</a>
        </body>
      </html>`, {
        headers: { 'Content-Type': 'text/html' }
      }
    );
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
        await this.sendWelcomeAnimation(env, chatId);
      } else if (this.isValidUrl(text)) {
        await this.shortenAndReply(request, env, chatId, text);
      } else {
        await this.sendMessage(env, chatId, 'That doesn\'t look like a valid URL. Please send a URL starting with http:// or https://');
      }
    }
    return new Response('OK', { status: 200 });
  },

  /**
   * Handles redirecting a short code to its long URL.
   */
  async handleRedirect(shortCode, env) {
    const longUrl = await env.URL_STORE.get(shortCode);
    if (longUrl) {
      return Response.redirect(longUrl, 301); // Permanent Redirect
    } else {
      return new Response('URL not found.', { status: 404 });
    }
  },

  /**
   * Sends a welcome animation with a caption and a GitHub button.
   */
  async sendWelcomeAnimation(env, chatId) {
    const animationUrl = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWYwZTRmMjkyM2RjZDI1NmVjYmQ3OWMyYjI3MjcxN2RmMjNhMzA2ZiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/3o6MbhgBx0UfbB7Dck/giphy.gif';
    const caption = "Welcome! I'm a URL shortener bot powered by Cloudflare Workers. Send me any long URL, and I'll shrink it for you!";
    const githubRepoUrl = env.GITHUB_REPO_URL;

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
   * Shortens a URL, stores it, and sends the short link back to the user.
   */
  async shortenAndReply(request, env, chatId, longUrl) {
    try {
      const workerUrl = new URL(request.url).origin;
      const shortCode = await this.generateUniqueShortCode(env.URL_STORE);
      await env.URL_STORE.put(shortCode, longUrl);

      const shortUrl = `${workerUrl}/${shortCode}`;
      await this.sendMessage(env, chatId, `Success! Here is your short URL:\n${shortUrl}`);
    } catch (error) {
      console.error(error);
      await this.sendMessage(env, chatId, 'Sorry, something went wrong. Please try again later.');
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
/** https://github.com/Johndevils/url-shortner- 
credit: arsynox*/
