"use client";

import { motion } from "framer-motion";

type MobileMenuProps = {
  isOpen: boolean;
  isDarkMode: boolean;
  onItemClick: () => void;
  navLinks: Array<{ href: string; label: string }>;
};

export default function MobileMenu({ isOpen, isDarkMode, onItemClick, navLinks }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <motion.div 
      className={`absolute top-full right-0 mt-2 w-64 rounded-xl overflow-hidden ${
        isDarkMode 
          ? 'bg-[#111827] border border-white/10 shadow-xl shadow-black/20' 
          : 'bg-white border border-gray-200 shadow-xl shadow-black/10'
      } z-40`}
      initial={{ opacity: 0, y: -20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -20, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        {navLinks.map((link, index) => (
          <motion.a 
            key={link.href}
            href={link.href}
            className={`block py-3 px-4 rounded-lg ${
              isDarkMode 
                ? 'text-white hover:bg-white/10' 
                : 'text-gray-900 hover:bg-gray-100'
            } transition-colors font-medium w-full text-left mb-1`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + (index * 0.05) }}
            onClick={onItemClick}
          >
            {link.label}
          </motion.a>
        ))}
        <div className="h-px w-full my-2 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-30"></div>
        <motion.a 
          href="#"
          className="block py-3 px-4 rounded-lg bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white font-medium w-full text-center mt-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={onItemClick}
        >
          Get Started
        </motion.a>
      </div>
    </motion.div>
  );
} 