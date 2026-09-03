import Link from 'next/link';
import { siteConfig } from '@/lib/config';

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-900/30 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <img src="/logo.png" alt={siteConfig.name} className="w-10 h-10 rounded-xl" />
              <span className="font-heading font-bold text-lg text-white">{siteConfig.name}</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500 mb-6">
              Professional laundry &amp; ironing service in {siteConfig.addressLocality}, {siteConfig.addressRegion}.
              Pickup &amp; delivery at your doorstep.
            </p>
            <div className="rounded-xl overflow-hidden h-28">
              <img
                src="https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=400&q=80"
                alt="Neatly folded laundry"
                className="w-full h-full object-cover opacity-50 hover:opacity-70 transition-opacity duration-300"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-wider mb-5">Navigate</h4>
            <ul className="space-y-3.5">
              <li><Link href="/services/" className="text-sm text-gray-500 hover:text-primary-300 transition-colors">Services &amp; Pricing</Link></li>
              <li><Link href="/contact/" className="text-sm text-gray-500 hover:text-primary-300 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-wider mb-5">Services</h4>
            <ul className="space-y-3.5">
              <li className="text-sm text-gray-500">Wash &amp; Fold</li>
              <li className="text-sm text-gray-500">Ironing &amp; Steam Press</li>
              <li className="text-sm text-gray-500">Pickup &amp; Delivery</li>
              <li className="text-sm text-gray-500">Wash &amp; Iron</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-wider mb-5">Get in Touch</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5 text-sm text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-primary-600">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {siteConfig.address}
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-primary-600">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                <a href={`tel:${siteConfig.phone}`} className="text-gray-500 hover:text-primary-300 transition-colors">{siteConfig.phone}</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-primary-600">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                <a href={siteConfig.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-300 transition-colors">WhatsApp Us</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-primary-600">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {siteConfig.hoursLabel}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span>Made with</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            <span>in {siteConfig.addressLocality}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
