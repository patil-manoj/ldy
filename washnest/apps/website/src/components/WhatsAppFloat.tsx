'use client';

import { siteConfig } from '@/lib/config';

export default function WhatsAppFloat() {
  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Tooltip */}
      <span className="pointer-events-none absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
        Chat with us
        <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-gray-900" />
      </span>

      {/* Ping ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-wa-ping" />

      {/* Button */}
      <a
        href={siteConfig.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_30px_rgba(37,211,102,0.6)] active:scale-95 animate-bounce-slow"
      >
        <svg viewBox="0 0 32 32" className="h-8 w-8 fill-current drop-shadow-sm">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.738 3.054 9.37L1.056 31.08l5.918-1.956a15.926 15.926 0 0 0 9.03 2.88C24.826 32.004 32 24.828 32 16.004 32 7.176 24.826 0 16.004 0zm9.342 22.616c-.39 1.1-2.274 2.104-3.142 2.168-.792.058-1.536.376-5.176-1.108-4.39-1.79-7.154-6.282-7.37-6.572-.214-.29-1.752-2.332-1.752-4.45 0-2.118 1.108-3.162 1.502-3.594.394-.432.86-.54 1.148-.54.286 0 .574.002.824.014.264.012.62-.1.97.742.358.858 1.218 2.968 1.326 3.182.108.214.18.464.036.75-.144.29-.216.466-.43.718-.214.252-.45.564-.644.756-.214.214-.436.446-.188.876.25.43 1.108 1.828 2.378 2.962 1.634 1.458 3.012 1.91 3.44 2.124.43.214.682.18.932-.108.25-.29 1.072-1.25 1.358-1.682.286-.432.572-.358.966-.214.394.144 2.5 1.18 2.93 1.394.43.214.716.322.824.5.108.178.108 1.03-.282 2.13z" />
        </svg>
      </a>
    </div>
  );
}
