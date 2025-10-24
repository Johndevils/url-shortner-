'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, AlertCircle, Loader2 } from 'lucide-react'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { shortCode: string } }): Promise<Metadata> {
  return {
    title: `Redirecting via ${params.shortCode} - URL Shortener`,
    description: `You are being redirected through our secure URL shortener. Short code: ${params.shortCode}`,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: `URL Redirect - ${params.shortCode}`,
      description: 'Secure URL redirection through our URL shortener service',
      type: 'website',
    },
  }
}

export default function RedirectPage({ params }: { params: { shortCode: string } }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    const resolveUrl = async () => {
      try {
        const response = await fetch(`/api/resolve/${params.shortCode}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          setError(errorData.error || 'URL not found')
          setLoading(false)
          return
        }

        const data = await response.json()
        setOriginalUrl(data.originalUrl)
        
        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              window.location.href = data.originalUrl
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      } catch (err) {
        setError('Failed to resolve URL')
        setLoading(false)
      }
    }

    resolveUrl()
  }, [params.shortCode])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting...</h2>
            <p className="text-gray-600">Please wait while we redirect you to your destination.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">URL Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-purple-600 to-pink-600">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Redirecting</CardTitle>
          <CardDescription>
            You will be redirected to your destination in {countdown} seconds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Destination URL:</p>
            <p className="text-sm font-mono text-gray-900 break-all">{originalUrl}</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.href = originalUrl!}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Go Now
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}