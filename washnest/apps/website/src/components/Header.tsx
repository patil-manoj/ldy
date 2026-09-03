'use client';

import Link from 'next/link';
import { siteConfig } from '@/lib/config';
import { useEffect, useState } from 'react';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change / resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.05),0_4px_24px_rgba(0,0,0,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className={`font-display font-black text-2xl sm:text-3xl tracking-tight transition-colors duration-500 ${
              scrolled ? 'text-gray-900' : 'text-white'
            }`}>
              {siteConfig.name}
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Home', href: '/' },
              { label: 'Services', href: '/services/' },
              { label: 'Contact', href: '/contact/' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-4 py-2 text-[0.85rem] font-medium rounded-lg transition-all duration-300 ${
                  scrolled
                    ? 'text-gray-500 hover:text-primary hover:bg-primary-50/60'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <a
              href={siteConfig.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-lg transition-all duration-500 ${
                scrolled
                  ? 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-glow'
                  : 'bg-white text-gray-900 hover:bg-white/90 shadow-[0_2px_12px_rgba(255,255,255,0.15)]'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Book Now
            </a>

            {/* Hamburger button — visible only on mobile */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className={`md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-300 ${
                scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
            >
              {mobileOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="md:hidden pb-4">
            <div className={`flex flex-col gap-1 rounded-xl p-2 ${
              scrolled ? 'bg-gray-50' : 'bg-white/10 backdrop-blur-lg'
            }`}>
              {[
                { label: 'Home', href: '/' },
                { label: 'Services', href: '/services/' },
                { label: 'Contact', href: '/contact/' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    scrolled
                      ? 'text-gray-700 hover:text-primary hover:bg-primary-50/60'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
