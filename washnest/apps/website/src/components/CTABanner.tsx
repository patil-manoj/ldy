import { siteConfig } from '@/lib/config';

export function CTABanner() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=1920&q=80"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-cta-gradient opacity-90" />
        <div className="absolute inset-0 shimmer" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-300 uppercase tracking-wider mb-6">
          <span className="w-10 h-px bg-gradient-to-r from-transparent to-primary-400" />
          Get Started
          <span className="w-10 h-px bg-gradient-to-l from-transparent to-primary-400" />
        </span>
        <h2 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight">
          Try {siteConfig.name} –<br />fresh, spotless laundry!
        </h2>
        <p className="text-white/60 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Book a {siteConfig.name} pickup in 30 seconds. We handle every stain, every fold, every detail — with free delivery in {siteConfig.addressLocality}.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={siteConfig.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 bg-white text-gray-900 font-heading font-semibold text-lg px-10 py-4 rounded-full transition-all duration-300 hover:bg-primary-50 hover:shadow-2xl hover:scale-[1.02]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#2563eb">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Reserve Service
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href={`tel:${siteConfig.phone}`}
            className="inline-flex items-center justify-center gap-2.5 border-2 border-white/20 text-white font-heading font-medium text-lg px-10 py-4 rounded-full transition-all duration-300 hover:bg-white/10 hover:border-white/40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            Call Us
          </a>
        </div>
      </div>
    </section>
  );
}
