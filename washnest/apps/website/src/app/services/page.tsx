import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CTABanner } from '@/components/CTABanner';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: `Laundry Services & Pricing in ${siteConfig.addressLocality} – Wash, Iron, Pickup & Delivery`,
  description:
    `Affordable laundry services in ${siteConfig.addressLocality}: Wash & Fold from ₹20, Ironing from ₹10, free pickup & delivery. Serving ${siteConfig.areas.join(', ')}. Book on WhatsApp!`,
  alternates: { canonical: '/services/' },
};

const servicePageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Laundry Service',
  provider: {
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    '@id': `${siteConfig.url}/#business`,
  },
  areaServed: siteConfig.areas.map(area => ({ '@type': 'City', name: area })),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Laundry Services Price List',
    itemListElement: [
      {
        '@type': 'OfferCatalog',
        name: 'Wash & Fold',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Shirt / T-Shirt Wash & Fold' }, price: '20', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Trousers Wash & Fold' }, price: '25', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Jeans Wash & Fold' }, price: '30', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Saree Wash & Fold' }, price: '50', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bedsheet (Single) Wash & Fold' }, price: '40', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bedsheet (Double) Wash & Fold' }, price: '60', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Blanket Wash & Fold' }, price: '100', priceCurrency: 'INR' },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Ironing / Steam Press',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Shirt Ironing' }, price: '10', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Trousers / Jeans Ironing' }, price: '15', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Saree Ironing' }, price: '30', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Suit (2-piece) Ironing' }, price: '50', priceCurrency: 'INR' },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Wash & Iron',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Shirt Wash & Iron' }, price: '30', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Trousers Wash & Iron' }, price: '35', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Saree Wash & Iron' }, price: '70', priceCurrency: 'INR' },
        ],
      },
    ],
  },
};

const servicesBreadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
    { '@type': 'ListItem', position: 2, name: 'Services & Pricing', item: `${siteConfig.url}/services/` },
  ],
};

const servicesFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: `How much does laundry cost in ${siteConfig.addressLocality}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `At ${siteConfig.name}, wash & fold starts at ₹20 per piece, ironing from ₹10 per piece, and wash & iron from ₹30 per piece. Pickup and delivery is free across ${siteConfig.areas.join(', ')}.`,
      },
    },
    {
      '@type': 'Question',
      name: 'Is pickup and delivery free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Yes, ${siteConfig.name} offers completely free pickup and delivery for all laundry orders in ${siteConfig.areas.join(', ')} areas.`,
      },
    },
    {
      '@type': 'Question',
      name: 'What clothes can I give for laundry?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We handle all types of garments — shirts, t-shirts, trousers, jeans, sarees, kurtas, suits, bedsheets, blankets, and more. Contact us for special items like curtains or wedding outfits.',
      },
    },
  ],
};

const pricing = [
  {
    category: 'Wash & Fold',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=400&q=80',
    accent: 'from-primary to-primary-dark',
    items: [
      ['Shirt / T-Shirt', '₹20'],
      ['Trousers', '₹25'],
      ['Jeans', '₹30'],
      ['Saree', '₹50'],
      ['Bedsheet (Single)', '₹40'],
      ['Bedsheet (Double)', '₹60'],
      ['Blanket', '₹100'],
    ],
  },
  {
    category: 'Ironing / Steam Press',
    image: 'https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&w=400&q=80',
    accent: 'from-accent to-accent-dark',
    items: [
      ['Shirt / T-Shirt', '₹10'],
      ['Trousers / Jeans', '₹15'],
      ['Saree', '₹30'],
      ['Suit (2-piece)', '₹50'],
      ['Kurta', '₹15'],
    ],
  },
  {
    category: 'Wash & Iron',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=400&q=80',
    accent: 'from-primary-700 to-primary-900',
    items: [
      ['Shirt / T-Shirt', '₹30'],
      ['Trousers', '₹35'],
      ['Jeans', '₹40'],
      ['Saree', '₹70'],
      ['Suit (2-piece)', '₹120'],
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=1920&q=80"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary-950/90 via-primary-900/70 to-white" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-300 uppercase tracking-wider mb-4">
              <span className="w-10 h-px bg-gradient-to-r from-transparent to-primary-400" />
              Transparent Pricing
              <span className="w-10 h-px bg-gradient-to-l from-transparent to-primary-400" />
            </span>
            <h1 className="font-heading font-bold text-5xl sm:text-6xl text-white mb-5">Our Services &amp; Pricing</h1>
            <p className="text-primary-200/60 text-lg max-w-xl mx-auto">
              Clean clothes, transparent pricing. No surprises, no hidden fees.
            </p>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-primary-50/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {pricing.map((group) => (
                <div key={group.category} className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 border border-gray-100">
                  <div className="relative h-44 overflow-hidden">
                    <img src={group.image} alt={group.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <h2 className="absolute bottom-4 left-6 font-heading font-bold text-xl text-white">{group.category}</h2>
                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full bg-gradient-to-r ${group.accent} shadow-glow`} />
                  </div>
                  <div className="p-6">
                    <table className="w-full text-sm">
                      <tbody>
                        {group.items.map(([item, price]) => (
                          <tr key={item} className="border-b border-gray-50 last:border-0 hover:bg-primary-50/30 transition-colors">
                            <td className="py-3.5 text-gray-600">{item}</td>
                            <td className="py-3.5 text-right font-heading font-bold text-primary">{price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400 text-sm mt-10">
              Prices may vary for special items. Contact us on WhatsApp for bulk or custom orders.
            </p>
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicePageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesBreadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesFaqJsonLd) }}
      />
    </>
  );
}
