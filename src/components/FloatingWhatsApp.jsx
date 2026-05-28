import React from 'react';
import { motion } from 'framer-motion';

export default function FloatingWhatsApp() {
  const whatsappNumber = '918861002191';
  const message = 'Hi Coastal Shaadi Support, I need assistance with my matrimonial account.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 pointer-events-none">
      {/* Label Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="hidden md:flex items-center bg-white shadow-xl border border-gray-100 rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 pointer-events-auto hover:shadow-2xl transition-all duration-300"
      >
        <span className="flex h-2 w-2 relative mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Support Online
      </motion.div>

      {/* Floating Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1, rotate: 3 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative flex items-center justify-center w-14 h-14 bg-[#25d366] text-white rounded-full shadow-[0_4px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_30px_rgba(37,211,102,0.6)] hover:bg-[#20ba5a] transition-all duration-300 pointer-events-auto"
        title="Chat on WhatsApp"
      >
        {/* Pulsing Back Glow */}
        <span className="absolute inset-0 rounded-full bg-[#25d366] animate-ping opacity-25 -z-10" />

        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.338 5.399 0 12.007 0a11.94 11.94 0 018.468 3.512 11.9 11.9 0 013.481 8.412c-.003 6.557-5.342 11.897-11.95 11.897-2.094-.002-4.14-.55-5.945-1.591L0 24zm6.305-1.654a10.015 10.015 0 005.69 1.448h.005c5.544 0 10.057-4.515 10.06-10.062a10.007 10.007 0 00-2.934-7.097 9.99 9.99 0 00-7.092-2.93C6.549 1.705 2.036 6.22 2.033 11.77a9.98 9.98 0 001.512 5.267l-.23.843-1.688 6.166 6.306-1.652-.236-.376zm11.167-6.961c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        </svg>
      </motion.a>
    </div>
  );
}
