import React from 'react';
import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle }) {
  return (
    <div className="pt-32 pb-8 bg-gradient-to-b from-primary/10 to-canvas">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        )}
        <div className="w-24 h-1 bg-accent mx-auto mt-8 rounded-full" />
      </div>
    </div>
  );
}
