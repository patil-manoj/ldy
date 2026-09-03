import { siteConfig } from '@/lib/config';

const faqs = [
  {
    q: `What is the cost of laundry service in ${siteConfig.addressLocality}?`,
    a: `${siteConfig.name} offers affordable laundry services starting at ₹20 per piece for wash & fold, and ₹10 per piece for ironing. We provide free pickup and delivery across ${siteConfig.areas.join(', ')}.`,
  },
  {
    q: `Do you offer pickup and delivery laundry service near ${siteConfig.addressLocality}?`,
    a: `Yes! ${siteConfig.name} provides free doorstep pickup and delivery laundry service in ${siteConfig.areas.join(', ')} and surrounding areas. Just message us on WhatsApp to schedule a pickup.`,
  },
  {
    q: `How do I book a laundry pickup with ${siteConfig.name}?`,
    a: `Booking is simple — send a WhatsApp message to ${siteConfig.phone}. Our team will schedule a pickup at your convenience. We collect, wash/iron, and deliver back to your door within 24-48 hours.`,
  },
  {
    q: `What areas does ${siteConfig.name} serve?`,
    a: `We currently serve ${siteConfig.areas.join(', ')} and nearby areas in ${siteConfig.addressLocality}, ${siteConfig.addressRegion}. Contact us to check if we deliver to your location.`,
  },
  {
    q: `What laundry services does ${siteConfig.name} offer?`,
    a: `${siteConfig.name} offers Wash & Fold (from ₹20/piece), Ironing & Steam Press (from ₹10/piece), Wash & Iron (from ₹30/piece), and free Pickup & Delivery. We handle all types of garments including shirts, trousers, sarees, bedsheets, and blankets.`,
  },
  {
    q: 'How long does the laundry service take?',
    a: `${siteConfig.name} offers same-day service for drop-offs made in the morning. For pickup & delivery orders, your clean clothes are returned within 24-48 hours.`,
  },
  {
    q: `What are ${siteConfig.name}'s shop timings?`,
    a: `${siteConfig.name} is open ${siteConfig.hoursLabel}. You can visit our shop at ${siteConfig.address} or book a pickup via WhatsApp anytime.`,
  },
];

export function FAQ() {
  return (
    <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-50 rounded-full blur-3xl opacity-40" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-primary" />
            FAQ
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-primary" />
          </span>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-gray-900 mb-5">
            Frequently asked questions about{' '}
            <span className="gradient-text">{siteConfig.name}</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Everything you need to know about our laundry service in {siteConfig.addressLocality}.
          </p>
        </div>

        <div className="space-y-5">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card hover:border-primary/10 transition-all duration-300"
            >
              <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-heading font-semibold text-gray-900 text-base list-none">
                {faq.q}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary/40 group-open:rotate-180 transition-transform duration-300 flex-shrink-0 ml-4"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-gray-500 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
