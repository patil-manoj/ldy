const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917353565671';
const WA_MESSAGE = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Hi, I want to book a laundry pickup';
const SHOP_ADDRESS = process.env.NEXT_PUBLIC_SHOP_ADDRESS || 'Marathalli, Bengaluru, Karnataka 560037';
const SHOP_PHONE = process.env.NEXT_PUBLIC_SHOP_PHONE || '+917353565671';
const AREAS = (process.env.NEXT_PUBLIC_AREAS_SERVED || 'Marathalli,Brookefield,Whitefield,ITPL,Varthur,Kadugodi').split(',');

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Wash Nest',
  tagline: process.env.NEXT_PUBLIC_BUSINESS_TAGLINE || 'Laundry & Ironing, Picked Up From Your Door',
  description:
    process.env.NEXT_PUBLIC_BUSINESS_DESCRIPTION ||
    'Wash Nest – Affordable laundry & ironing service in Marathalli, Bengaluru. Wash & fold from ₹20, free pickup & delivery. Serving Marathalli, Brookefield, Whitefield, ITPL. Book on WhatsApp!',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://washnest.netlify.app',
  whatsappNumber: WA_NUMBER,
  whatsappLink: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`,
  phone: SHOP_PHONE,
  address: SHOP_ADDRESS,
  addressLocality: process.env.NEXT_PUBLIC_ADDRESS_LOCALITY || 'Marathalli',
  addressRegion: process.env.NEXT_PUBLIC_ADDRESS_REGION || 'Karnataka',
  postalCode: process.env.NEXT_PUBLIC_POSTAL_CODE || '560037',
  addressCountry: process.env.NEXT_PUBLIC_ADDRESS_COUNTRY || 'IN',
  geoLatitude: parseFloat(process.env.NEXT_PUBLIC_GEO_LATITUDE || '12.9591'),
  geoLongitude: parseFloat(process.env.NEXT_PUBLIC_GEO_LONGITUDE || '77.6974'),
  hoursOpen: process.env.NEXT_PUBLIC_BUSINESS_HOURS_OPEN || '08:00',
  hoursClose: process.env.NEXT_PUBLIC_BUSINESS_HOURS_CLOSE || '20:00',
  hoursLabel: process.env.NEXT_PUBLIC_BUSINESS_HOURS_LABEL || '8 AM – 8 PM, all days',
  googleMapsEmbedUrl:
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ||
    'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d242.98358137382135!2d77.68451876020367!3d12.98864679907409!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1778132318708!5m2!1sen!2sin',
  areas: AREAS,
};
