import { siteConfig } from '@/lib/config';

const reasons = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: 'Same-Day Service',
    desc: 'Drop off in the morning, pick up by evening. Speed meets quality.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: 'Affordable Pricing',
    desc: 'Honest prices with no hidden charges. Premium care, fair rates.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </svg>
    ),
    title: 'WhatsApp Updates',
    desc: 'Real-time status updates delivered straight to your phone.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: 'Local & Trusted',
    desc: `Your neighbourhood laundry in ${siteConfig.addressLocality}. Known and loved.`,
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-40 -left-40 w-64 h-64 bg-warm-50 rounded-full blur-3xl opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — image */}
          <div className="relative hidden lg:block">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-card-hover">
                <img
                  src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80"
                  alt="Neatly folded clean laundry stacked professionally"
                  className="w-full h-[520px] object-cover"
                />
              </div>


            </div>
          </div>

          {/* Right — content */}
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              <span className="w-10 h-px bg-gradient-to-r from-transparent to-primary" />
              Why Choose Us
            </span>
            <h2 className="font-heading font-bold text-4xl sm:text-5xl text-gray-900 mb-5">
              Why families trust{' '}
              <span className="gradient-text">Wash Nest</span>
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-lg">
              We go the extra mile to make laundry day the easiest part of your week.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              {reasons.map((r) => (
                <div
                  key={r.title}
                  className="group bg-gradient-to-br from-white to-primary-50/30 rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 border border-gray-100/80 hover:border-primary/20"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center mb-4 text-primary group-hover:from-primary group-hover:to-primary-dark group-hover:text-white transition-all duration-300 group-hover:shadow-glow">
                    {r.icon}
                  </div>
                  <h3 className="font-heading font-bold text-base mb-1.5 text-gray-900">{r.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
