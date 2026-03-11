// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Move viewport-related settings to a separate export
export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  // Basic Metadata
  title: {
    default: 'youropenport - E-commerce Management Platform',
    template: '%s | youropenport'
  },
  description: 'Complete e-commerce management platform for sellers. Manage your stores, products, orders, and customers all in one place.',
  
  // Icons & Favicon
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico']
  },
  
  // Open Graph (for social media sharing)
  openGraph: {
    title: 'Seller Dashboard - E-commerce Management Platform',
    description: 'Complete e-commerce management platform for sellers. Manage your stores, products, orders, and customers all in one place.',
    url: 'https://youropenport.vercel.app',
    siteName: 'Seller Dashboard',
    type: 'website',
  },
  
  // Additional SEO
  keywords: [
    'e-commerce',
    'seller dashboard',
    'store management',
    'product management',
    'order management',
    'inventory management',
    'multi-vendor',
    'online store',
    'retail platform'
  ],
  
  authors: [{ name: 'Nour yahyaoui' }],
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  category: 'e-commerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Seller Dashboard" />
        <meta name="application-name" content="Seller Dashboard" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
    
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}