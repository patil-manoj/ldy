import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: `Contact ${siteConfig.name} – Laundry Pickup in ${siteConfig.addressLocality} | Phone, WhatsApp, Address`,
  description:
    `Contact ${siteConfig.name} at ${siteConfig.phone} or WhatsApp for laundry pickup & delivery in ${siteConfig.areas.join(', ')}. Visit us at ${siteConfig.address}. Open ${siteConfig.hoursLabel}.`,
  alternates: { canonical: '/contact/' },
};

const contactBreadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
    { '@type': 'ListItem', position: 2, name: 'Contact Us', item: `${siteConfig.url}/contact/` },
  ],
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=1920&q=80"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary-950/90 via-primary-900/70 to-white" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-300 uppercase tracking-wider mb-4">
              <span className="w-10 h-px bg-gradient-to-r from-transparent to-primary-400" />
              Get in Touch
              <span className="w-10 h-px bg-gradient-to-l from-transparent to-primary-400" />
            </span>
            <h1 className="font-heading font-bold text-5xl sm:text-6xl text-white mb-5">Contact Us</h1>
            <p className="text-primary-200/60 text-lg">
              We&apos;d love to hear from you. Reach out anytime!
            </p>
          </div>
        </section>

        {/* Contact info + map */}
        <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-primary-50/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 hover:shadow-card hover:border-primary/10 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-gray-900">Visit Us</h3>
                  </div>
                  <p className="text-gray-500 ml-[52px]">
                    {siteConfig.name}<br />
                    {siteConfig.address}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 hover:shadow-card hover:border-primary/10 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                      </svg>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-gray-900">Call Us</h3>
                  </div>
                  <a href={`tel:${siteConfig.phone}`} className="text-primary font-heading font-bold text-lg hover:text-primary-dark transition-colors ml-[52px] block">
                    {siteConfig.phone}
                  </a>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 hover:shadow-card hover:border-primary/10 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-gray-900">WhatsApp</h3>
                  </div>
                  <div className="ml-[52px]">
                    <a
                      href={siteConfig.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-glow hover:shadow-glow-lg text-sm hover:scale-[1.02]"
                    >
                      Message Us
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 hover:shadow-card hover:border-primary/10 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-gray-900">Shop Hours</h3>
                  </div>
                  <p className="text-gray-500 ml-[52px]">
                    Monday – Sunday<br />
                    {siteConfig.hoursLabel.split(',')[0]}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-gray-100 min-h-[400px]">
                <iframe
                  title={`${siteConfig.name} Location`}
                  src={siteConfig.googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '400px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactBreadcrumbJsonLd) }}
      />
    </>
  );
}
