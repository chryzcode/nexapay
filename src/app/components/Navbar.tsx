"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";

type NavbarProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

export default function Navbar({ isDarkMode, toggleTheme }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLDivElement>(null);

  // Handle mobile menu item click
  const handleMobileMenuItemClick = () => {
    setMobileMenuOpen(false);
  };

  // Navigation links array for reusability
  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#signin", label: "Sign In" },
  ];

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuButtonRef.current && !menuButtonRef.current.contains(event.target as Node) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close mobile menu when window resizes to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex justify-between items-center backdrop-blur-md py-4 px-6 rounded-xl ${
        isDarkMode 
          ? 'border border-white/10 bg-black/30 shadow-lg shadow-black/10' 
          : 'border border-gray-200 bg-white/90 shadow-lg shadow-black/5'
      } sticky top-4 z-50`}
    >
      <h1 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] to-[#A78BFA]">NexaPay</h1>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link 
            key={link.href}
            href={link.href}
            className={`${
              isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-black/5'
            } px-4 py-2 rounded-lg transition-colors font-medium`}
          >
            {link.label}
          </Link>
        ))}
        
        {/* Dark/Light Mode Toggle */}
        <div className="ml-2">
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
      </nav>
      
      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-3" ref={menuButtonRef}>
        {/* Dark/Light Mode Toggle for Mobile */}
        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        
        <div className="relative">
          <button 
            className={`relative z-50 p-2 rounded-lg ${
              isDarkMode 
                ? mobileMenuOpen ? 'bg-white/10' : 'hover:bg-white/10' 
                : mobileMenuOpen ? 'bg-black/10' : 'hover:bg-black/5'
            } transition-colors`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={isDarkMode ? "white" : "#111827"}
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`}
            >
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
          
          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <MobileMenu 
                isOpen={mobileMenuOpen}
                isDarkMode={isDarkMode}
                onItemClick={handleMobileMenuItemClick}
                navLinks={navLinks}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
} 