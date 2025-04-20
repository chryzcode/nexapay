"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "../providers/ThemeProvider";

interface MobileMenuProps {
  isOpen: boolean;
  isDarkMode: boolean;
  onItemClick: () => void;
  navLinks: { href: string; label: string }[];
  user: any;
  onLogout: () => void;
}

export default function MobileMenu({ isOpen, isDarkMode, onItemClick, navLinks, user, onLogout }: MobileMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
        isDarkMode 
          ? 'bg-[#1A1E2C] border border-white/10' 
          : 'bg-white border border-gray-200'
      }`}
    >
      <div className="py-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onItemClick}
            className={`block px-4 py-2 ${
              isDarkMode 
                ? 'text-white hover:bg-white/10' 
                : 'text-gray-900 hover:bg-black/5'
            }`}
          >
            {link.label}
          </Link>
        ))}
        {user ? (
          <button
            onClick={() => {
              onLogout();
              onItemClick();
            }}
            className={`block w-full text-left px-4 py-2 ${
              isDarkMode 
                ? 'text-white hover:bg-white/10' 
                : 'text-gray-900 hover:bg-black/5'
            }`}
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            onClick={onItemClick}
            className={`block px-4 py-2 ${
              isDarkMode 
                ? 'text-white hover:bg-white/10' 
                : 'text-gray-900 hover:bg-black/5'
            }`}
          >
            Login
          </Link>
        )}
      </div>
    </motion.div>
  );
} 