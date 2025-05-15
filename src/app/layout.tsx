'use client';
import { useState, useEffect } from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from "@/context/WalletContext";
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen transition-colors bg-white dark:bg-[#0B0F1A]`}
      >
        <AuthProvider>
          <ThemeProvider>
            <WalletProvider>
              <Navbar />
              <main className="min-h-screen bg-inherit relative my-10">
                {children}
              </main>
              {/* ToastContainer must be rendered here for all client-side toasts */}
              <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
            </WalletProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
