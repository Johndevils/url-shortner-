![Telegram URL Shortener Banner](src/assets/banner.png)


# Telegram URL Shortener on Cloudflare Workers

This is a template for a serverless URL shortener that operates via a Telegram bot. It is built entirely on the Cloudflare stack, using a Cloudflare Worker for logic and Cloudflare KV for storage.

The bot greets new users with a welcome animation and provides a button to view the source code on GitHub.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Johndevils/url-shortner-)

**Important:** Remember to replace `YOUR_USERNAME/YOUR_REPO_NAME` in the button link above with your actual GitHub repository URL after you've forked or created it.

---

## Features

*   **URL Shortening**: Send any long URL and get a short one back.
*   **Fast Redirects**: Uses Cloudflare's edge network for low-latency redirects.
*   **Engaging Welcome**: Greets users with a GIF and an interactive button.
*   **Serverless**: No servers to manage, and runs on Cloudflare's generous free tier.
*   **One-Click Deploy**: Easily deployable with a single click.

## 🚀 Deployment Instructions

### Step 1: Create a Telegram Bot
1.  Open Telegram and search for the **@BotFather**.
2.  Start a chat and send the command `/newbot`.
3.  Follow the prompts to choose a name and username for your bot.
4.  BotFather will give you a **bot token**. Copy this token immediately and save it.

### Step 2: Deploy to Cloudflare
1.  Click the **Deploy with Cloudflare** button at the top of this README.
2.  Authorize Cloudflare to access your GitHub account and select "Fork repository". This will create a copy of the template in your own GitHub account.
3.  In the Cloudflare deployment interface:
    *   Give your project a unique name.
    *   Navigate to the **Variables** section. You will see two required variables.
    *   **`TELEGRAM_BOT_TOKEN`**: Click **Edit**, paste the bot token from BotFather, and click **Encrypt**.
    *   **`GITHUB_REPO_URL`**: Click **Edit**, paste the full URL to the GitHub repository you just forked (e.g., `https://github.com/your-username/telegram-url-shortener`).
    *   Click **Save** after setting both variables.
4.  Click the **Deploy** button. Cloudflare will automatically create the worker and the `URL_STORE` KV namespace.

### Step 3: Set the Webhook
After deployment, you must tell Telegram where to send messages.
1.  Go to your new worker's page in the Cloudflare dashboard to find its URL (e.g., `https://your-project-name.your-subdomain.workers.dev`).
2.  Construct the following URL, replacing the placeholders:
    `https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>`
3.  Paste this completed URL into your web browser's address bar and press Enter.
4.  You should see a success message: `{"ok":true,"result":true,"description":"Webhook was set"}`.

### ✅ All Done!
Your bot is now live! Find it on Telegram and send `/start` to see the new welcome message, or send it a URL to shorten.
