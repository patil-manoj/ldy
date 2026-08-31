import type { Metadata } from 'next';
import './globals.css';
import { siteConfig } from '@/lib/config';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} – Laundry Service in ${siteConfig.addressLocality}, Bengaluru | Pickup & Delivery`,
    template: `%s | Wash Nest`,
  },
  description: siteConfig.description,
  keywords: [
    'Wash Nest', 'WashNest', 'wash nest laundry', 'washnest',
    'laundry service', 'wash and fold', 'ironing service', 'steam press',
    'laundry pickup delivery', 'laundry near me', `laundry in ${siteConfig.addressLocality}`,
    `laundry service ${siteConfig.addressLocality}`, 'clothes washing service',
    `Wash Nest ${siteConfig.addressLocality}`, `WashNest ${siteConfig.addressLocality}`,
    'door step laundry', 'affordable laundry', `dry cleaning ${siteConfig.addressLocality}`,
    `laundry service Bengaluru`, `wash and fold ${siteConfig.addressLocality}`,
    `laundry service ${siteConfig.serviceArea}`,
    ...siteConfig.areas.map(a => `laundry service ${a}`),
  ],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  metadataBase: new URL(siteConfig.url),
  alternates: { canonical: '/' },
  openGraph: {
    title: `${siteConfig.name} – ${siteConfig.tagline} in ${siteConfig.addressLocality}, ${siteConfig.addressRegion}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: `${siteConfig.name} - Professional Laundry Service`,
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: `${siteConfig.name} – ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ['/logo.png'],
  },
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'EHt1V83XnuT3WVuSeVQVla1OzO8LQYueUAtiWeJc5Jg',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${siteConfig.url}/#business`,
  name: siteConfig.name,
  alternateName: ['WashNest', 'Wash Nest Laundry', 'washnest'],
  description: siteConfig.description,
  url: siteConfig.url,
  telephone: siteConfig.phone,
  image: `${siteConfig.url}/logo.png`,
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, UPI, Google Pay, PhonePe',
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.address,
    addressLocality: siteConfig.addressLocality,
    addressRegion: siteConfig.addressRegion,
    postalCode: siteConfig.postalCode,
    addressCountry: siteConfig.addressCountry,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: siteConfig.geoLatitude,
    longitude: siteConfig.geoLongitude,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: siteConfig.hoursOpen,
    closes: siteConfig.hoursClose,
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Laundry Services',
    itemListElement: [
      {
        '@type': 'OfferCatalog',
        name: 'Wash & Fold',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Shirt / T-Shirt Wash & Fold', description: 'Professional washing, drying and folding of shirts and t-shirts' }, price: '20', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Trousers Wash & Fold' }, price: '25', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bedsheet Wash & Fold' }, price: '40', priceCurrency: 'INR' },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Ironing / Steam Press',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Shirt Ironing / Steam Press' }, price: '10', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Trousers Ironing' }, price: '15', priceCurrency: 'INR' },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Pickup & Delivery',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Free Pickup & Delivery', description: 'Free doorstep pickup and delivery of laundry' }, price: '0', priceCurrency: 'INR' },
        ],
      },
    ],
  },
  areaServed: siteConfig.areas.map(area => ({
    '@type': 'City',
    name: area,
  })),
  serviceArea: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.geoLatitude,
      longitude: siteConfig.geoLongitude,
    },
    geoRadius: '5000',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: siteConfig.phone,
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi', 'Kannada'],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteConfig.url}/#website`,
  name: siteConfig.name,
  url: siteConfig.url,
  publisher: { '@id': `${siteConfig.url}/#organization` },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="font-body text-gray-900 antialiased">
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
