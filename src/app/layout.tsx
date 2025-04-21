import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "NexaPay",
  description: "Next-generation Web3 Payment Gateway",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // suppressHydrationWarning={true}
        className={`${inter.variable} font-sans antialiased min-h-screen transition-colors`}
      >
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            {children}
            <ToastContainer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
