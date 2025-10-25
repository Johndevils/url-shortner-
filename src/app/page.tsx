'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Toast } from '@/components/ui/toast'
import { Link2, Copy, BarChart3, ExternalLink, CheckCircle, Globe, Zap, Shield, QrCode } from 'lucide-react'
import { toast } from 'sonner'

interface ShortenedUrl {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  clicks: number
  createdAt: string
  qrCode?: string
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [qrCodeLoading, setQrCodeLoading] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url) {
      toast.error('Please enter a URL')
      return
    }

    try {
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        toast.error('Please enter a valid HTTP or HTTPS URL')
        return
      }
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Failed to shorten URL')
      }

      const data = await response.json()
      const newUrl: ShortenedUrl = {
        id: data.id,
        originalUrl: url,
        shortCode: data.shortCode,
        shortUrl: data.shortUrl,
        clicks: 0,
        createdAt: new Date().toISOString(),
      }
      
      setShortenedUrls([newUrl, ...shortenedUrls])
      setUrl('')
      toast.success('URL shortened successfully!')
    } catch (error) {
      toast.error('Failed to shorten URL. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (shortUrl: string, id: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopiedId(id)
      toast.success('URL copied to clipboard!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }

  const generateQRCode = async (shortUrl: string, id: string) => {
    setQrCodeLoading(id)
    try {
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: shortUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate QR code')
      }

      const data = await response.json()
      setShortenedUrls(urls => 
        urls.map(url => 
          url.id === id ? { ...url, qrCode: data.qrCode } : url
        )
      )
      toast.success('QR code generated successfully!')
    } catch (error) {
      toast.error('Failed to generate QR code')
    } finally {
      setQrCodeLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl">
              <Link2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            URL Shortener
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform long URLs into short, shareable links with advanced analytics and management features
          </p>
        </header>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">Instant URL shortening with global CDN</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-pink-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Track clicks and engagement</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
              <p className="text-sm text-gray-600">Safe and reliable redirects</p>
            </CardContent>
          </Card>
        </div>

        {/* URL Shortener Form */}
        <Card className="max-w-2xl mx-auto mb-12 border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Shorten Your URL</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your long URL below to create a short, shareable link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="url"
                  placeholder="https://example.com/very-long-url..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 h-12 text-base"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Shortening...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      Shorten
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Shortened URLs List */}
        {shortenedUrls.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Shortened URLs</h2>
            <div className="space-y-4">
              {shortenedUrls.map((item) => (
                <Card key={item.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-600">Original URL</span>
                        </div>
                        <p className="text-sm text-gray-900 truncate mb-3">{item.originalUrl}</p>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Link2 className="w-4 h-4 text-pink-600" />
                          <span className="text-sm font-medium text-pink-600">Short URL</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded">
                            {item.shortUrl}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <BarChart3 className="w-3 h-3" />
                            {item.clicks} clicks
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(item.shortUrl, item.id)}
                          className="flex items-center gap-2"
                        >
                          {copiedId === item.id ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateQRCode(item.shortUrl, item.id)}
                          disabled={qrCodeLoading === item.id}
                          className="flex items-center gap-2"
                        >
                          {qrCodeLoading === item.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <QrCode className="w-4 h-4" />
                              QR Code
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.shortUrl, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Visit
                        </Button>
                      </div>
                    </div>
                    {item.qrCode && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <QrCode className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-600">QR Code</span>
                        </div>
                        <div className="flex justify-center">
                          <img 
                            src={item.qrCode} 
                            alt="QR Code" 
                            className="w-32 h-32 border-2 border-gray-200 rounded-lg shadow-sm"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            Built with Next.js by Arsynox 
          </p>
        </footer>
      </div>
    </div>
  )
}
