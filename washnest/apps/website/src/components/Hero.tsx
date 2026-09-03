import { siteConfig } from '@/lib/config';

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Full-screen hero image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1920&q=80"
          alt="Neatly organized clean clothes on hangers in a professional laundry"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/95 via-primary-900/80 to-primary-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-transparent to-primary-950/20" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary-400/5 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-primary-300/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-20">
        <div className="flex flex-col justify-center min-h-[70vh]">
          {/* Content */}
          <div className="max-w-2xl">
            <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-[4.5rem] leading-[1.05] tracking-tight text-white mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              {siteConfig.name} –{' '}
              <span className="text-primary-300">Fresh clothes,</span>{' '}
              delivered to your door
            </h1>

            <p className="text-lg sm:text-xl text-white/60 max-w-lg mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
              {siteConfig.name} is your trusted laundry service in {siteConfig.addressLocality}. Professional wash, fold &amp; iron with free pickup and delivery. Book on WhatsApp!
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <a
                href={siteConfig.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-primary hover:bg-primary-dark text-white font-heading font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Schedule Pickup
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="/services/"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 text-white font-heading font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:bg-white/20 hover:border-white/25"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
