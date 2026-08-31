const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919596889663';
const WA_MESSAGE = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Hi, I want to book a laundry pickup';
const SHOP_ADDRESS =
  process.env.NEXT_PUBLIC_SHOP_ADDRESS ||
  '80 Feet Rd, Mysore Bank Colony, SBM Colony, Banashankari 1st Stage, Banashankari, Bengaluru, Karnataka 560050';
const SHOP_PHONE = process.env.NEXT_PUBLIC_SHOP_PHONE || '+919596889663';
const AREAS = (
  process.env.NEXT_PUBLIC_AREAS_SERVED ||
  'Banashankari,SBM Colony,Mysore Bank Colony,Basavanagudi,Jayanagar,JP Nagar'
).split(',');

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Wash Nest',
  tagline: process.env.NEXT_PUBLIC_BUSINESS_TAGLINE || 'Laundry & Ironing, Picked Up From Your Door',
  description:
    process.env.NEXT_PUBLIC_BUSINESS_DESCRIPTION ||
    'Wash Nest – Affordable laundry & ironing service in Banashankari, South Bengaluru. Wash & fold from ₹20, with free pickup & delivery in nearby areas. Book on WhatsApp!',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://washnest.netlify.app',
  whatsappNumber: WA_NUMBER,
  whatsappLink: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`,
  phone: SHOP_PHONE,
  address: SHOP_ADDRESS,
  addressLocality: process.env.NEXT_PUBLIC_ADDRESS_LOCALITY || 'Banashankari',
  addressRegion: process.env.NEXT_PUBLIC_ADDRESS_REGION || 'Karnataka',
  postalCode: process.env.NEXT_PUBLIC_POSTAL_CODE || '560050',
  addressCountry: process.env.NEXT_PUBLIC_ADDRESS_COUNTRY || 'IN',
  serviceArea: process.env.NEXT_PUBLIC_SERVICE_AREA || 'South Bengaluru',
  geoLatitude: parseFloat(process.env.NEXT_PUBLIC_GEO_LATITUDE || '12.93902413112959'),
  geoLongitude: parseFloat(process.env.NEXT_PUBLIC_GEO_LONGITUDE || '77.55187432998854'),
  hoursOpen: process.env.NEXT_PUBLIC_BUSINESS_HOURS_OPEN || '08:00',
  hoursClose: process.env.NEXT_PUBLIC_BUSINESS_HOURS_CLOSE || '20:00',
  hoursLabel: process.env.NEXT_PUBLIC_BUSINESS_HOURS_LABEL || '8 AM – 8 PM, all days',
  googleMapsEmbedUrl:
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ||
    'https://www.google.com/maps/embed?pb=!3m2!1sen!2sin!4v1788202388799!5m2!1sen!2sin!6m8!1m7!1sw9fgRO0KNASNbLraG-zeqA!2m2!1d12.93902413112959!2d77.55187432998854!3f10.562540868621284!4f7.18485816499755!5f0.7820865974627469',
  areas: AREAS,
};
