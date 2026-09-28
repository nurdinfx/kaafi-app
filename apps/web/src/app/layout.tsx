import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kaafi-App — Suuqa Garoowe & Somalia | Multi-Category Marketplace',
  description:
    'Somalia\'s leading multi-category marketplace. Buy & sell vehicles, real estate, land, electronics, services, and more. Africa-first platform launched in Garoowe, Puntland.',
  keywords: [
    'Kaafi-App',
    'Garoowe marketplace',
    'Somalia marketplace',
    'Puntland business',
    'vehicles for sale Somalia',
    'real estate Garoowe',
    'electronics Somalia',
    'fududeeye',
  ],
  openGraph: {
    title: 'Kaafi-App — Multi-Category Marketplace | Garoowe, Somalia',
    description: 'Buy & sell anything — Vehicles, Real Estate, Electronics, Services & more across Puntland and Somalia.',
    type: 'website',
    locale: 'so_SO',
    alternateLocale: ['en_US', 'ar_SA'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kaafi-App — Garoowe Marketplace',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0c8fe2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="so" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('fududeeye_theme');
                if (t === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
