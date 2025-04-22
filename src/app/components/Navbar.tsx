"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileMenu from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../providers/ThemeProvider";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle mobile menu item click
  const handleMobileMenuItemClick = () => {
    setMobileMenuOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Navigation links array for reusability
  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/transactions", label: "Transactions" },
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
      className={`flex justify-between items-center py-4 px-6 rounded-xl sticky top-4 z-[9999]
        ${isDarkMode 
          ? 'bg-[#18192b] border border-white/10 text-white'
          : 'bg-white/90 border border-gray-200 text-gray-900'}
        backdrop-blur-sm transition-colors duration-300`}
    >
      <Link href="/" className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] to-[#A78BFA]">NexaPay</Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {navLinks.filter((link) => link.href !== "/dashboard" && link.href !== "/transactions").map((link) => (
          <Link 
            key={link.href}
            href={link.href}
            className="px-4 py-2 rounded-lg transition-colors font-medium"
          >
            {link.label}
          </Link>
        ))}
        {/* Only show navLinks not present in dropdown to avoid duplicates */}
        {user ? (
          <div className="flex items-center gap-4">
            <div className="mr-1">
              <ThemeToggle />
            </div>
            {user.userCode && (
              <div className="flex items-center gap-2 relative group">
                <button
                  className="focus:outline-none flex items-center px-0 py-0 rounded-lg"
                  tabIndex={0}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDropdownOpen(false);
                    }
                  }}
                >
                  <span className="flex items-center text-base font-bold font-mono bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full cursor-pointer">
                    {user.userCode}
                    <span className={`transition-transform duration-200 inline-block ml-2 ${dropdownOpen ? 'rotate-180' : ''} hover:text-purple-200 active:text-purple-300`}>
                      ▼
                    </span>
                  </span>
                </button>
                <div
                  className={`absolute right-0 mt-2 min-w-[180px] max-w-xs rounded-xl shadow-xl border transition-all duration-200 z-[9999] flex flex-col py-2 ${
                    isDarkMode 
                      ? 'bg-[#18192b] border-white/10 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } ${dropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                  style={{top: 'calc(100% + 0.5rem)', right: 0, left: 'auto'}}
                >
                  <button onMouseDown={() => { router.push('/dashboard'); setDropdownOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">Dashboard</button>
                  <button onMouseDown={() => { router.push('/transactions'); setDropdownOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">Transactions</button>
                  <button onMouseDown={() => { router.push('/settings'); setDropdownOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">Settings</button>
                  <button onMouseDown={() => { setDropdownOpen(false); handleLogout(); }} className="w-full text-left block px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">Logout</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Login
          </Link>
        )}
      </nav>
      
      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-3" ref={menuButtonRef}>
        {/* Dark/Light Mode Toggle for Mobile */}
        <ThemeToggle />
        
        <div className="relative">
          <button 
            className="relative z-50 p-2 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="transition-transform duration-300"
            >
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" className="hover:stroke-purple-500 active:stroke-purple-600" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" className="hover:stroke-purple-500 active:stroke-purple-600" />
              )}
            </svg>
          </button>
          
          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <div className="fixed inset-0 z-[9998] bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            )}
            {mobileMenuOpen && (
              <MobileMenu 
                isOpen={mobileMenuOpen}
                isDarkMode={isDarkMode}
                onItemClick={handleMobileMenuItemClick}
                navLinks={navLinks}
                user={user}
                onLogout={handleLogout}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
} 