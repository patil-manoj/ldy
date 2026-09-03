import { siteConfig } from '@/lib/config';

export function AreaCoverage() {
  return (
    <section className="py-24 sm:py-32 bg-section-light relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-100/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-warm-50 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — image */}
          <div className="relative rounded-3xl overflow-hidden shadow-card-hover h-80 lg:h-[520px] group">
            <img
              src="https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80"
              alt="Bengaluru city aerial view"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-primary-900/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="glass rounded-2xl p-5 shadow-glass">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white shadow-glow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-gray-900">East {siteConfig.addressRegion}</div>
                    <div className="text-xs text-gray-500">{siteConfig.areas.length}+ areas covered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — content */}
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              <span className="w-10 h-px bg-gradient-to-r from-transparent to-primary" />
              Delivery Zones
            </span>
            <h2 className="font-heading font-bold text-4xl sm:text-5xl text-gray-900 mb-5">
              Areas we <span className="gradient-text">serve</span>
            </h2>
            <p className="text-gray-500 max-w-lg text-lg leading-relaxed mb-10">
              We serve {siteConfig.areas.slice(0, -1).join(', ')} and {siteConfig.areas[siteConfig.areas.length - 1]} area and surrounding localities in
              East {siteConfig.addressRegion}. If you&apos;re nearby, we&apos;ll come to you!
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              {siteConfig.areas.map((area) => (
                <span
                  key={area}
                  className="group inline-flex items-center gap-2 bg-white text-gray-700 font-medium px-5 py-3 rounded-2xl text-sm shadow-soft border border-gray-100 hover:border-primary/30 hover:text-primary hover:shadow-glow/10 transition-all duration-300 cursor-default"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/60 group-hover:text-primary transition-colors">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {area}
                </span>
              ))}
            </div>

            <a
              href={siteConfig.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-900 text-white font-heading font-semibold px-7 py-3.5 rounded-full transition-all duration-300 shadow-glow hover:shadow-glow-lg hover:scale-[1.02]"
            >
              Check your area
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
