# URL Shortener - Cloudflare Workers

A modern, fast URL shortener built with Next.js and ready for Cloudflare Workers deployment.

## Features

- ⚡ **Lightning Fast** - Global CDN with Cloudflare Workers
- 📊 **Analytics** - Track clicks and engagement
- 🛡️ **Secure** - Safe and reliable redirects
- 📱 **QR Code Generation** - Generate QR codes for shortened URLs
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🔗 **Copy to Clipboard** - Easy URL sharing
- 📈 **Click Tracking** - Monitor URL performance

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Cloudflare Workers, API routes
- **QR Code**: QRCode.js library
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with gradient designs

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Cloudflare Workers Deployment

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler auth
```

3. Deploy to Cloudflare Workers:
```bash
wrangler deploy
```

Or use the deployment script:
```bash
./deploy.sh
```

## API Endpoints

### Shorten URL
```http
POST /api/shorten
Content-Type: application/json

{
  "url": "https://example.com/very-long-url"
}
```

Response:
```json
{
  "id": "uuid",
  "shortCode": "abc123",
  "shortUrl": "https://your-domain.com/abc123",
  "originalUrl": "https://example.com/very-long-url"
}
```

### Resolve URL
```http
GET /api/resolve/{shortCode}
```

Response:
```json
{
  "originalUrl": "https://example.com/very-long-url",
  "shortCode": "abc123"
}
```

### Generate QR Code
```http
POST /api/qr
Content-Type: application/json

{
  "url": "https://your-domain.com/abc123",
  "size": 200
}
```

Response:
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "url": "https://your-domain.com/abc123"
}
```

### List All URLs
```http
GET /api/urls
```

Response:
```json
{
  "urls": [
    {
      "id": "uuid",
      "originalUrl": "https://example.com",
      "shortCode": "abc123",
      "shortUrl": "https://your-domain.com/abc123",
      "clicks": 5,
      "createdAt": "2023-12-01T12:00:00.000Z"
    }
  ]
}
```

## URL Redirect

Access shortened URLs directly:
```http
GET /{shortCode}
```

This will redirect to the original URL and increment the click count.

## Configuration

### Environment Variables

For production deployment with Cloudflare Workers, you can configure:

- **KV Namespace**: For persistent URL storage
- **Custom Domain**: For branded short URLs
- **Analytics**: For advanced tracking

### Custom Domain

1. Add your domain to Cloudflare
2. Update `wrangler.toml`:
```toml
[env.production.routes]
pattern = "your-domain.com/*"
zone_name = "your-domain.com"
```

### Persistent Storage

For production use, replace the in-memory storage with Cloudflare KV:

1. Create KV namespace:
```bash
wrangler kv:namespace create "URL_STORE"
```

2. Update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "URL_STORE"
id = "your-kv-namespace-id"
```

3. Update worker code to use KV storage

## Development

### Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── shorten/
│   │   │   ├── resolve/
│   │   │   └── qr/
│   │   ├── [shortCode]/
│   │   └── page.tsx
│   └── components/
│       └── ui/
├── cloudflare-worker.js
├── wrangler.toml
└── deploy.sh
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `wrangler deploy` - Deploy to Cloudflare Workers

## Features in Detail

### URL Shortening
- Generates 6-character random codes
- Validates URL format and protocol
- Prevents duplicate short codes
- Returns complete URL information

### QR Code Generation
- Generates QR codes for shortened URLs
- Customizable size (default: 200x200)
- Base64 encoded image data
- Display in UI with download option

### Analytics
- Click tracking for each shortened URL
- Real-time click count updates
- URL creation timestamp
- List all URLs with statistics

### Security
- URL validation and sanitization
- HTTPS-only redirects
- CORS headers for API access
- Error handling and validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial use.

## Support

For issues and questions:
- Check the [GitHub Issues](https://github.com/your-username/url-shortener/issues)
- Review the Cloudflare Workers [documentation](https://developers.cloudflare.com/workers/)

---

**Built with ❤️ for the web**