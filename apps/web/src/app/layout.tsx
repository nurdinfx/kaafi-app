import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppProviders from '../components/AppProviders';

export const metadata: Metadata = {
  title: 'DukaamiOnline — Suuqa Casriga ah ee Soomaaliya',
  icons: {
    icon: [
      { url: '/dukaami_icon.png' },
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/kaafi_logo.png' },
    ],
    shortcut: '/dukaami_icon.png',
    apple: '/dukaami_icon.png',
  },
  description:
    'DukaamiOnline — Suuqa ugu weyn ee Soomaaliya ee elektaroonigga, dharka, dahabka, iyo meheradaha ganacsiga. Ka dukaameyso ama fur store-kaaga online sida Shopify.',
  keywords: [
    'dukaamionline',
    'dukaami online',
    'dukaami',
    'suuqa bakaaraha online',
    'dukaameysi somalia',
    'garoowe marketplace',
  ],
  openGraph: {
    title: 'DukaamiOnline — Suuqa Weyn ee Soomaaliya',
    description: 'Ku dukaameyso si fudud, meel kasta. Dharka dumarka, qalabka telefoonada, saacadaha raaxada, iyo meheradaha Shopify-style.',
    type: 'website',
    locale: 'so_SO',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#ea580c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="so" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen bg-slate-100 text-slate-800">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
