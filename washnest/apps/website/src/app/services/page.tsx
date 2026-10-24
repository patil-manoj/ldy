import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CTABanner } from '@/components/CTABanner';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: `Laundry Services & Pricing in ${siteConfig.addressLocality} – Wash, Iron, Pickup & Delivery`,
  description:
    `Laundry services in ${siteConfig.addressLocality}: washing at ₹80/kg (minimum 5 kg), ironing, dry cleaning, and free pickup & delivery. Serving ${siteConfig.areas.join(', ')}. Book on WhatsApp!`,
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
        name: 'Washing',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Mixed Clothes Washing (minimum 5 kg)' }, price: '80', priceCurrency: 'INR', unitCode: 'KGM' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bedsheet Washing (up to 5 kg)' }, price: '400', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Double Blanket Washing' }, price: '350', priceCurrency: 'INR' },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Ironing',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Pant Ironing' }, price: '15', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Shirt Ironing' }, price: '15', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Saree Ironing' }, price: '60', priceCurrency: 'INR' },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: "Dry Cleaning - Women's Wear",
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Tops Dry Cleaning' }, price: '175', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Saree Dry Cleaning' }, price: '300', priceCurrency: 'INR' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bridal Gown Dry Cleaning' }, price: '450', priceCurrency: 'INR' },
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
        text: `At ${siteConfig.name}, washing is ₹80/kg with a minimum order of 5 kg. We also offer ironing and dry cleaning with the prices shown on this page. Pickup and delivery is free across ${siteConfig.areas.join(', ')}.`,
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
    category: 'Washing',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=400&q=80',
    accent: 'from-primary to-primary-dark',
    items: [
      ['Mixed Clothes (minimum 5 kg)', '₹80/kg'],
      ['Bedsheet (up to 5 kg)', '₹400'],
      ['Blanket (Double)', '₹350'],
      ['Blanket (Single)', '₹300'],
      ['Comforter', '₹400'],
      ['Curtain (up to 5 kg)', '₹400'],
      ['Soft Toys (up to 4 kg)', '₹350'],
      ['Sofa Covers (up to 4 kg)', '₹350'],
      ['Door Mats (up to 4 kg)', '₹400'],
      ['Shoes - Washing (1 pair)', '₹250'],
      ['Floor Carpet', '₹30/sq ft'],
    ],
  },
  {
    category: 'Ironing',
    image: 'https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&w=400&q=80',
    accent: 'from-accent to-accent-dark',
    items: [
      ['Pant', '₹15'], ['Shirt', '₹15'], ['Chudidhar (3 pcs)', '₹60'], ['Top Single', '₹20'],
      ['Bottom', '₹15'], ['Saree', '₹60'], ['Blouse', '₹10'], ['Dhoti Cotton', '₹25'],
      ['Dhoti Silk', '₹30'], ['Bed Sheet Single', '₹40'], ['Bed Sheet Double', '₹50'],
      ['Curtains (Small)', '₹80'], ['Curtains (Big)', '₹100'], ['Pillow Cover', '₹10'],
      ['Towel', '₹15'], ['Pajama Suit', '₹50'], ['Blazer', '₹50'], ['Waistcoat', '₹30'],
      ['Dupatta', '₹25'], ['Skirts', '₹50'], ['Bridal Gown', '₹120'], ['Long Frock', '₹40'],
      ['Anarkali', '₹60'], ['Sofa Cover', '₹30'], ['Kids Dress (Boys) - Each', '₹10'],
      ['Kids Dress (Girls) - Each', '₹15'],
    ],
  },
  {
    category: "Dry Cleaning - Women's Wear",
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85',
    accent: 'from-primary-700 to-primary-900',
    items: [
      ['Tops', '₹175'], ['Saree', '₹300'], ['Blouse', '₹150'], ['Dupatta', '₹150'],
      ['Anarkali', '₹350'], ['Bridal Gown', '₹450'], ['Skirt', '₹150'],
      ['Salwar Kameez (2 pcs)', '₹250'], ['Salwar Kameez (3 pcs)', '₹350'],
      ['Regular Kids Wear', '₹200'], ['Long Frock', '₹350'],
    ],
  },
  {
    category: 'Dry Cleaning - Household',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=85',
    accent: 'from-primary-700 to-primary-900',
    items: [
      ['Bed Sheet Single', '₹250'], ['Bed Sheet Double', '₹350'], ['Single Blanket', '₹400'],
      ['Double Blanket', '₹500'], ['Jumbo Blanket', '₹600'], ['Soft Toy', '₹250'],
      ['School Bag', '₹250'], ['Curtains up to 4 feet', '₹150'], ['Curtains up to 7 feet', '₹250'],
      ['Curtains up to 10 feet', '₹450'], ['Curtains up to 12 feet', '₹550'], ['Pillow', '₹350'],
    ],
  },
  {
    category: "Dry Cleaning - Men's Wear",
    image: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=400&q=80',
    accent: 'from-accent to-accent-dark',
    items: [
      ['Pants', '₹150'], ['Shirts', '₹150'], ['Dhoti', '₹150'], ['Pyjama Set', '₹300'],
      ['Suit (2 pcs)', '₹350'], ['Suit (3 pcs)', '₹450'], ['Blazer', '₹300'],
      ['Jerkin / Jacket', '₹300'], ['Leather Jacket', '₹450'], ['Waistcoat', '₹200'],
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              Minimum washing order is 5 kg. Contact us on WhatsApp: {siteConfig.phone} for bulk or custom orders.
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
