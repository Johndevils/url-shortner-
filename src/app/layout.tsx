import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "URL Shortener - Free Link Shortening Service | Cloudflare Powered",
  description: "Transform long URLs into short, shareable links with advanced analytics. Fast, secure, and free URL shortener powered by Cloudflare Workers. Generate QR codes and track clicks.",
  keywords: [
    "URL shortener",
    "link shortener",
    "free URL shortener",
    "short links",
    "link management",
    "QR code generator",
    "click tracking",
    "URL analytics",
    "Cloudflare Workers",
    "link shortening service",
    "custom short URLs",
    "link redirect",
    "web analytics",
    "share links",
    "social media links"
  ],
  authors: [{ name: "URL Shortener Team" }],
  creator: "URL Shortener",
  publisher: "URL Shortener",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "URL Shortener - Free Link Shortening Service",
    description: "Transform long URLs into short, shareable links with advanced analytics. Fast, secure, and free URL shortener powered by Cloudflare Workers.",
    url: "https://your-domain.com",
    siteName: "URL Shortener",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "URL Shortener - Free Link Shortening Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "URL Shortener - Free Link Shortening Service",
    description: "Transform long URLs into short, shareable links with advanced analytics. Fast, secure, and free URL shortener.",
    images: ["/og-image.png"],
    creator: "@your-twitter-handle",
  },
  alternates: {
    canonical: "https://your-domain.com",
  },
  other: {
    "theme-color": "#9333ea",
    "msapplication-TileColor": "#9333ea",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "URL Shortener",
    "application-name": "URL Shortener",
    "mobile-web-app-capable": "yes",
  },
};

// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "URL Shortener",
  "description": "Transform long URLs into short, shareable links with advanced analytics. Fast, secure, and free URL shortener powered by Cloudflare Workers.",
  "url": "https://your-domain.com",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "featureList": [
    "URL Shortening",
    "QR Code Generation",
    "Click Analytics",
    "Link Management",
    "Custom Short URLs",
    "Real-time Statistics"
  ],
  "provider": {
    "@type": "Organization",
    "name": "URL Shortener",
    "url": "https://your-domain.com"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
