'use client';
import { useState, useEffect } from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
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
            <Navbar />
            <main className="min-h-screen bg-inherit pt-[72px] pb-8 px-4 md:px-8 relative">
              {children}
            </main>
            <ToastContainer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
