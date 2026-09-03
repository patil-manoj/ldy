import { siteConfig } from '@/lib/config';

const services = [
  {
    title: 'Wash & Fold',
    description: 'We wash, dry, and neatly fold your clothes with premium detergents. Fresh, clean, and ready to wear.',
    image: 'https://images.unsplash.com/photo-1572501403253-c113f1d6c7fe?auto=format&fit=crop&w=800&q=80',
    price: 'From ₹20/piece',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1" width="22" height="22" rx="4" />
        <circle cx="12" cy="13" r="5" />
        <circle cx="12" cy="13" r="2" />
        <path d="M7 5h2M15 5h2" />
      </svg>
    ),
  },
  {
    title: 'Ironing & Steam Press',
    description: 'Crisp, wrinkle-free clothes with professional steam pressing. Look sharp every day.',
    image: 'https://images.unsplash.com/photo-1696546760882-1d34a7af6800?auto=format&fit=crop&w=800&q=80',
    price: 'From ₹10/piece',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    title: 'Pickup & Delivery',
    description: 'Free doorstep collection and delivery. Book on WhatsApp and we handle the rest.',
    image: 'https://images.unsplash.com/photo-1663181191222-a20536e7419c?auto=format&fit=crop&w=800&q=80',
    price: 'Free pickup',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 sm:py-32 bg-white relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-warm-50 rounded-full blur-3xl opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-primary" />
            Our Services
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-primary" />
          </span>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-gray-900 mb-5">
            {siteConfig.name} – Everything your wardrobe{' '}
            <span className="gradient-text">needs</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Professional laundry service in {siteConfig.addressLocality}. Washed, ironed, and delivered with care — all at affordable prices.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div
              key={s.title}
              className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-soft hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="relative h-60 overflow-hidden">
                <img
                  src={s.image}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <span className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-primary font-heading font-bold text-sm px-4 py-2 rounded-full shadow-soft">
                  {s.price}
                </span>
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-primary shadow-soft">
                  {s.icon}
                </div>
              </div>
              <div className="p-7">
                <h3 className="font-heading font-bold text-xl mb-3 text-gray-900">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed text-[0.95rem]">{s.description}</p>
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <span className="text-sm font-semibold text-primary flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">
                    Learn more
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
