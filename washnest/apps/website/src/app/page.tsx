import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { HowItWorks } from '@/components/HowItWorks';
import { AreaCoverage } from '@/components/AreaCoverage';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { CTABanner } from '@/components/CTABanner';
import { Footer } from '@/components/Footer';
import { FAQ } from '@/components/FAQ';
import { siteConfig } from '@/lib/config';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: `What is the cost of laundry service in ${siteConfig.addressLocality}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${siteConfig.name} offers affordable laundry services starting at ₹20 per piece for wash & fold, and ₹10 per piece for ironing. We provide free pickup and delivery across ${siteConfig.areas.join(', ')}.`,
      },
    },
    {
      '@type': 'Question',
      name: `Do you offer pickup and delivery laundry service near ${siteConfig.addressLocality}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Yes! ${siteConfig.name} provides free doorstep pickup and delivery laundry service in ${siteConfig.areas.join(', ')} and surrounding areas. Just message us on WhatsApp to schedule a pickup.`,
      },
    },
    {
      '@type': 'Question',
      name: 'How do I book a laundry pickup?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Booking is simple — send a WhatsApp message to ${siteConfig.phone}. Our team will schedule a pickup at your convenience. We collect, wash/iron, and deliver back to your door within 24-48 hours.`,
      },
    },
    {
      '@type': 'Question',
      name: `What areas do you serve in ${siteConfig.addressRegion}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `We currently serve ${siteConfig.areas.join(', ')} and nearby areas in ${siteConfig.addressLocality}, ${siteConfig.addressRegion}. Contact us to check if we deliver to your location.`,
      },
    },
    {
      '@type': 'Question',
      name: 'What laundry services do you offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${siteConfig.name} offers Wash & Fold (from ₹20/piece), Ironing & Steam Press (from ₹10/piece), Wash & Iron (from ₹30/piece), and free Pickup & Delivery. We handle all types of garments including shirts, trousers, sarees, bedsheets, and blankets.`,
      },
    },
    {
      '@type': 'Question',
      name: 'How long does the laundry service take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer same-day service for drop-offs made in the morning. For pickup & delivery orders, your clean clothes are returned within 24-48 hours. Express service is available on request.',
      },
    },
    {
      '@type': 'Question',
      name: `What are your laundry shop timings in ${siteConfig.addressLocality}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${siteConfig.name} is open ${siteConfig.hoursLabel}. You can visit our shop at ${siteConfig.address} or book a pickup via WhatsApp anytime.`,
      },
    },
  ],
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteConfig.url,
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <AreaCoverage />
        <WhyChooseUs />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
