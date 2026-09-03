const steps = [
  {
    num: '01',
    title: 'Book on WhatsApp',
    description: 'Send us a message — it takes 30 seconds to schedule your pickup.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'We Pick Up',
    description: 'Our team collects your clothes right from your doorstep, hassle-free.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Delivered Clean',
    description: 'Fresh, clean clothes delivered back to your door — on time, every time.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=1920&q=80"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/95 via-primary-900/90 to-primary-800/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-300 uppercase tracking-wider mb-4">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-primary-400" />
            Simple Process
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-primary-400" />
          </span>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-white mb-5">
            How it works
          </h2>
          <p className="text-primary-200/70 text-lg max-w-lg mx-auto">Three simple steps to perfectly clean laundry.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary-400/30 via-primary-300/50 to-primary-400/30" />

          {steps.map((s, i) => (
            <div key={s.num} className="relative text-center group">
              {/* Icon container */}
              <div className="relative w-48 h-48 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-full blur-xl group-hover:from-primary-400/30 group-hover:to-primary-600/30 transition-all duration-500" />
                <div className="relative w-full h-full rounded-full flex items-center justify-center border-2 border-primary-400/30 group-hover:border-primary-300/50 transition-all duration-500 glass-dark">
                  <div className="text-primary-300 group-hover:text-primary-200 transition-colors duration-300 group-hover:scale-110 transform">
                    {s.icon}
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full flex items-center justify-center text-sm font-heading font-bold shadow-glow ring-4 ring-primary-950">
                  {s.num}
                </div>
              </div>

              <h3 className="font-heading font-bold text-xl mb-3 text-white">{s.title}</h3>
              <p className="text-primary-200/60 leading-relaxed max-w-xs mx-auto">{s.description}</p>

              {/* Arrow for desktop */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-24 -right-6 lg:-right-8 text-primary-400/40">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
