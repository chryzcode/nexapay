"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="flex items-center justify-between py-4 px-8 md:px-16">
      <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] to-[#A78BFA]">
        NexaPay
      </Link>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link 
              href="/dashboard" 
              className={`transition-colors ${
                isActive("/dashboard") 
                  ? "text-white" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/transactions" 
              className={`transition-colors ${
                isActive("/transactions") 
                  ? "text-white" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Transactions
            </Link>
            <Link 
              href="/settings" 
              className={`transition-colors ${
                isActive("/settings") 
                  ? "text-white" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Settings
            </Link>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              href="/login" 
              className={`transition-colors ${
                isActive("/login") 
                  ? "text-white" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-2 px-4 rounded-lg font-medium hover:from-[#6B51EF] hover:to-[#9771FA] shadow-lg shadow-purple-900/20"
            >
              Sign Up
            </Link>
          </>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          {isDarkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
} 