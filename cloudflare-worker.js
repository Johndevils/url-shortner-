// Cloudflare Worker for URL Shortener
// Deploy to Cloudflare Workers for global CDN performance

// In production, use Cloudflare KV or D1 database
// For demo, using in-memory storage (will reset on deployment)
const urlStore = new Map()
const codeStore = new Map()

function generateShortCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(),
    },
  })
}

async function handleShorten(request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return jsonResponse({ error: 'URL is required' }, 400)
    }

    // Validate URL
    try {
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return jsonResponse({ error: 'Invalid URL protocol' }, 400)
      }
    } catch {
      return jsonResponse({ error: 'Invalid URL format' }, 400)
    }

    // Generate unique short code
    let shortCode
    let attempts = 0
    const maxAttempts = 10

    do {
      shortCode = generateShortCode()
      attempts++
      if (attempts > maxAttempts) {
        return jsonResponse({ error: 'Failed to generate unique short code' }, 500)
      }
    } while (codeStore.has(shortCode))

    const baseUrl = `https://${request.headers.get('host')}`
    const shortUrl = `${baseUrl}/${shortCode}`
    const id = crypto.randomUUID()

    // Store the URL mapping
    const urlData = {
      id,
      originalUrl: url,
      shortCode,
      shortUrl,
      clicks: 0,
      createdAt: new Date().toISOString()
    }

    urlStore.set(id, urlData)
    codeStore.set(shortCode, url)

    return jsonResponse({
      id,
      shortCode,
      shortUrl,
      originalUrl: url
    })
  } catch (error) {
    console.error('Error shortening URL:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}

async function handleResolve(shortCode) {
  try {
    const originalUrl = codeStore.get(shortCode)

    if (!originalUrl) {
      return jsonResponse({ error: 'URL not found' }, 404)
    }

    // Increment click count
    for (const [id, urlData] of urlStore.entries()) {
      if (urlData.shortCode === shortCode) {
        urlData.clicks++
        urlStore.set(id, urlData)
        break
      }
    }

    return jsonResponse({
      originalUrl,
      shortCode
    })
  } catch (error) {
    console.error('Error resolving URL:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}

async function handleRedirect(shortCode) {
  try {
    const originalUrl = codeStore.get(shortCode)

    if (!originalUrl) {
      return new Response('URL not found', { status: 404 })
    }

    // Increment click count
    for (const [id, urlData] of urlStore.entries()) {
      if (urlData.shortCode === shortCode) {
        urlData.clicks++
        urlStore.set(id, urlData)
        break
      }
    }

    return Response.redirect(originalUrl, 302)
  } catch (error) {
    console.error('Error redirecting:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

async function handleListUrls() {
  try {
    const urls = Array.from(urlStore.values()).map(url => ({
      id: url.id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: url.shortUrl,
      clicks: url.clicks,
      createdAt: url.createdAt
    }))

    return jsonResponse({ urls })
  } catch (error) {
    console.error('Error fetching URLs:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}

async function handleGenerateQR(request) {
  try {
    const { url, size = 200 } = await request.json()

    if (!url) {
      return jsonResponse({ error: 'URL is required' }, 400)
    }

    // Use external QR code API (since Cloudflare Workers don't have built-in QR generation)
    const qrResponse = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`)
    
    if (!qrResponse.ok) {
      throw new Error('Failed to generate QR code')
    }

    const qrCodeBuffer = await qrResponse.arrayBuffer()
    const qrCodeBase64 = btoa(String.fromCharCode(...new Uint8Array(qrCodeBuffer)))
    const qrCodeDataUrl = `data:image/png;base64,${qrCodeBase64}`

    return jsonResponse({
      qrCode: qrCodeDataUrl,
      url
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return jsonResponse({ error: 'Failed to generate QR code' }, 500)
  }
}

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    })
  }

  // API routes
  if (path.startsWith('/api/')) {
    if (path === '/api/shorten' && request.method === 'POST') {
      return await handleShorten(request)
    }
    
    if (path === '/api/urls' && request.method === 'GET') {
      return await handleListUrls()
    }
    
    if (path === '/api/qr' && request.method === 'POST') {
      return await handleGenerateQR(request)
    }
    
    if (path.startsWith('/api/resolve/') && request.method === 'GET') {
      const shortCode = path.split('/api/resolve/')[1]
      return await handleResolve(shortCode)
    }
    
    return jsonResponse({ error: 'API endpoint not found' }, 404)
  }

  // Direct short code redirect
  if (path.length > 1 && !path.includes('.')) {
    const shortCode = path.substring(1)
    if (codeStore.has(shortCode)) {
      return await handleRedirect(shortCode)
    }
  }

  // Serve static files or fallback
  return new Response('URL Shortener API - Use /api/shorten to create short URLs', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      ...getCorsHeaders(),
    },
  })
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request)
  },
}