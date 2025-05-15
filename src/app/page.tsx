"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { useTheme } from "./providers/ThemeProvider";

export default function Home() {
  const { isDarkMode } = useTheme();

  const supportedCryptocurrencies = [
    { name: "Bitcoin", symbol: "BTC" },
    { name: "Ethereum", symbol: "ETH" },
    { name: "USDC", symbol: "USDC" },
    { name: "USDT", symbol: "USDT" },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0B0F1A] text-[#F9F9FB]' : 'bg-[#F9F9FB] text-[#111827]'} relative overflow-hidden`}>
      {/* Background gradient element - reduce opacity for better contrast */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className={`absolute -top-[30%] -left-[10%] w-[50%] h-[50%] ${isDarkMode ? 'bg-[#7B61FF]/10' : 'bg-[#7B61FF]/5'} rounded-full blur-[120px]`}></div>
        <div className={`absolute top-[60%] -right-[10%] w-[40%] h-[40%] ${isDarkMode ? 'bg-[#7B61FF]/5' : 'bg-[#7B61FF]/5'} rounded-full blur-[120px]`}></div>
      </div>

      {/* Hero */}
      <section className="pt-16 md:pt-20 px-8 md:px-16 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-xl"
        >
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Accept Crypto Payments <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] drop-shadow-sm">With <span className="text-purple-600">NexaPay</span></span>
          </h2>
          <p className={`mt-4 text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-800'} font-medium`}>
            Effortlessly send and receive cryptocurrencies with speed and security. Experience seamless transactions for Bitcoin, Ethereum, and all major tokens.
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="/register" className="px-6 py-3 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">Get Started</a>
          </div>
          
          <div className="mt-10 flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
            </div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-700'} text-sm font-medium`}>Trusted by people worldwide</p>
          </div>
        </motion.div>
        
        {/* Dashboard Preview - Responsive Image Display */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative"
        >
          {/* Desktop image - hidden on mobile, shown on md screens and up */}
          <div className="hidden md:block relative">
            <Image
              src="/dashboard-preview.png"
              alt="NexaPay Dashboard Preview"
              width={650}
              height={420}
              className={`rounded-xl ${isDarkMode ? 'shadow-xl shadow-purple-500/10' : 'shadow-lg shadow-purple-500/20'}`}
              priority={true}
              suppressHydrationWarning={true}
            />
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] rounded-full blur-xl opacity-40"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] rounded-full blur-xl opacity-40"></div>
          </div>
          
          {/* Mobile image - shown only on small screens, hidden on md screens and up */}
          <div className="block md:hidden relative">
            <Image
              src="/dashboard-mobile-preview.png"
              alt="NexaPay Dashboard Mobile Preview"
              width={350}
              height={500}
              className={`rounded-xl mx-auto ${isDarkMode ? 'shadow-xl shadow-purple-500/10' : 'shadow-lg shadow-purple-500/20'}`}
              priority={true}
              suppressHydrationWarning={true}
            />
            {/* Decorative elements for mobile */}
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] rounded-full blur-lg opacity-40"></div>
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] rounded-full blur-lg opacity-40"></div>
          </div>
          
          {/* Stats floating element */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className={`absolute -bottom-6 -left-6 md:bottom-4 md:left-0 p-4 ${isDarkMode ? 'bg-[#1A1E2C]' : 'bg-white'} rounded-lg shadow-lg max-w-[220px] border ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}
          >
            {/* Stats content */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Transaction Volume</p>
                <p className="font-bold">+27% This Week</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <motion.section 
        id="features" 
        className="px-8 md:px-16 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-4xl font-bold mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] drop-shadow-sm">Features</span>
        </h2>
        <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-8 max-w-2xl font-medium`}>Our platform provides everything you need to accept and manage cryptocurrency payments.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Multi-chain Payments",
              description: "Easily transact with Ethereum, Polygon, and BSC networks.",
              icon: "M13 10V3L4 14h7v7l9-11h-7z"
            },
            {
              title: "Instant Transactions",
              description: "Receive payments instantly with low fees.",
              icon: "M13 10V3L4 14h7v7l9-11h-7z"
            },
            {
              title: "User-friendly Interface",
              description: "Simple and intuitive design for hassle-free transactions.",
              icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            },
            {
              title: "Secure Transactions",
              description: "Advanced security measures to protect your funds.",
              icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className={`backdrop-blur-md ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 shadow-md shadow-black/10' 
                  : 'bg-white/90 border-gray-200 shadow-md shadow-black/5'
              } border p-6 rounded-xl hover:shadow-lg hover:shadow-[#7B61FF]/10 transition-all`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-lg mb-4 text-white shadow-md shadow-purple-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section 
        id="how-it-works" 
        className="px-8 md:px-16 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-4xl font-bold mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] to-[#A78BFA]">How It Works</span>
        </h2>
        <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-8 max-w-2xl font-medium`}>Getting started with NexaPay is simple and straightforward</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "1", title: "Connect Wallet", description: "Link your crypto wallet to get started with Bitcoin, Ethereum, and more." },
            { step: "2", title: "Send", description: "Initiate transactions to send cryptocurrencies to your people worldwide." },
            { step: "3", title: "Monitor", description: "Track payment status in real-time for Bitcoin and Ethereum transactions." },
            { step: "4", title: "Receive", description: "Get funds directly to your wallet in Bitcoin, Ethereum, or other supported currencies." }
          ].map((step, index) => (
            <motion.div 
              key={index}
              className={`text-center relative backdrop-blur-md ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 shadow-lg shadow-black/10' 
                  : 'bg-white/90 border-gray-200 shadow-lg shadow-black/5'
              } border p-6 rounded-xl`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] text-white mb-4 shadow-md shadow-purple-500/20"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <span className="text-2xl font-bold">{step.step}</span>
              </motion.div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials */}
      {/* <motion.section
        className="px-8 md:px-16 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-4xl font-bold mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] to-[#A78BFA]">Trusted By</span>
        </h2>
        <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-8 max-w-2xl font-medium`}>See what our clients have to say about NexaPay</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Sarah Johnson",
              company: "Blockchain Ventures",
              text: "NexaPay revolutionized how our platform handles payments. The integration was seamless and our users love the simplicity.",
              avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%237B61FF' /%3E%3C/svg%3E"
            },
            {
              name: "Michael Chen",
              company: "CryptoCommerce",
              text: "The multi-chain support is exactly what we needed. Our global customer base can now pay with their preferred network.",
              avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23A78BFA' /%3E%3C/svg%3E"
            },
            {
              name: "Elena Rodriguez",
              company: "NFT Marketplace",
              text: "Security and reliability were our top concerns, and NexaPay delivered on both fronts. Couldn't be happier with the service.",
              avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%238B5CF6' /%3E%3C/svg%3E"
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              className={`backdrop-blur-md ${isDarkMode 
                ? 'bg-white/10 border-white/10' 
                : 'bg-white/90 border-gray-200'} 
                border shadow-lg p-6 rounded-xl`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full shadow-md"
                />
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{testimonial.name}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{testimonial.company}</p>
                </div>
              </div>
              <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          {['Company A', 'Brand B', 'Startup C', 'Enterprise D', 'Platform E'].map((company, index) => (
            <div key={index} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-bold text-xl`}>{company}</div>
          ))}
        </div>
      </motion.section> */}
      
      {/* FAQ Section */}
      <motion.section
        className="px-8 md:px-16 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-4xl font-bold mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] to-[#A78BFA]">FAQ</span>
        </h2>
        <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-8 max-w-2xl font-medium`}>Common questions about NexaPay</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              question: "How does NexaPay ensure payment security?",
              answer: "NexaPay uses advanced cryptographic techniques and smart contract auditing to ensure all transactions are secure. We also implement multi-signature wallets and regular security audits."
            },
            {
              question: "Which cryptocurrencies are supported?",
              answer: "We currently support stablecoins (USDC, USDT, BUSD) on both Polygon and BSC networks, with plans to add more tokens and networks in the future."
            },

            {
              question: "How quickly are payments processed?",
              answer: "Payments are typically confirmed within 1-2 minutes, depending on network congestion. Our system monitors blockchain confirmations to ensure transaction finality."
            },
            
            {
              question: "Is there a minimum payment amount?",
              answer: "The minimum payment amount is $5 USD equivalent to ensure transaction fees remain reasonable relative to the payment size."
            }
          ].map((faq, index) => (
            <motion.div
              key={index}
              className={`backdrop-blur-md ${isDarkMode 
                ? 'bg-white/10 border-white/10 shadow-lg shadow-black/10' 
                : 'bg-white/90 border-gray-200 shadow-lg shadow-black/5'} 
                border p-6 rounded-xl`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{faq.question}</h3>
              <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="px-8 md:px-16 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="relative overflow-hidden rounded-xl shadow-xl">
          <div className={`absolute inset-0 ${isDarkMode 
            ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50' 
            : 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30'} backdrop-blur-sm`}></div>
          <div className="relative z-10 max-w-6xl mx-auto py-16 px-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] to-[#A78BFA]">
                Ready to Transform Your Payment Experience?
              </span>
            </h2>
            <p className={`text-center text-xl ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-10 max-w-3xl mx-auto font-medium`}>
              Start accepting crypto payments today and unlock global commerce potential with NexaPay
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6">

              <Link href="/register">
                <motion.button
                  className="bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-3 px-8 rounded-full font-medium hover:from-[#6B51EF] hover:to-[#9771FA] shadow-lg shadow-purple-900/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start for Free
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>


      {/* Footer */}
      <footer className="px-8 md:px-16 py-12 border-t border-[#2D2F36]">
        <div className="flex flex-col md:flex-row md:justify-between">
          <div className="w-full md:w-auto mb-6 md:mb-0 text-center md:text-left">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] to-[#A78BFA]">NexaPay</div>
            <p className="text-gray-400 mt-2">&copy; {new Date().getFullYear()} NexaPay. All rights reserved.</p>
          </div>
          <div className="w-full md:w-auto flex justify-center md:justify-start space-x-8">
            <a href="mailto:alabaolanrewaju13@gmail.com" className="text-gray-400 hover:text-white">Email</a>
            <a href="https://twitter.com/chryzcode" className="text-gray-400 hover:text-white">Twitter</a>
            <a href="https://www.linkedin.com/in/olanrewaju-alaba/" className="text-gray-400 hover:text-white">Linkedin</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
