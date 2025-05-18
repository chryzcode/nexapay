"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useWallet } from "@/context/WalletContext";
import dynamic from "next/dynamic";
import Web3 from "web3";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowUp, FaArrowDown, FaWallet, FaMoneyBillWave } from "react-icons/fa";
import DashboardAnalytics from "../components/DashboardAnalytics";
import RequestMoneyForm from "../components/RequestMoneyForm";
import RequestsDashboard from "../components/RequestsDashboard";

const WalletConnect = dynamic(() => import('../components/WalletConnect'), {
  ssr: false,
});

const PaymentForm = dynamic(() => import('../components/PaymentForm'), {
  ssr: false,
});

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { account, setAccount, disconnectWallet } = useWallet();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [usdTotal, setUsdTotal] = useState<string>("0.00");
  const [ethBalance, setEthBalance] = useState<string>("0.00");
  const [transactions, setTransactions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchBalanceAndUsd() {
      if (!account || typeof window === "undefined" || !(window as any).ethereum) {
        setUsdTotal("0.00");
        setEthBalance("0.00");
        return;
      }
      const web3 = new Web3((window as any).ethereum);
      let eth = 0;
      let usd = 0;
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const data = await res.json();
        const ethPrice = data.ethereum.usd;
        const raw = await web3.eth.getBalance(account);
        eth = Number(web3.utils.fromWei(raw, "ether"));
        usd = eth * ethPrice;
        setEthBalance(eth.toFixed(6));
        setUsdTotal(usd.toFixed(2));
      } catch {
        setUsdTotal("0.00");
        setEthBalance("0.00");
      }
    }
    fetchBalanceAndUsd();
  }, [account]);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/transactions");
        if (!res.ok) return;
        const data = await res.json();
        // Expecting data.transactions as array
        setTransactions(data.transactions || []);
      } catch {
        setTransactions([]);
      }
    }
    fetchTransactions();
  }, []);

  useEffect(() => {
    async function fetchUserId() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setCurrentUserId(data.user?.id || "");
      } catch {
        setCurrentUserId("");
      }
    }
    fetchUserId();
  }, []);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.08, type: 'spring', stiffness: 60 } })
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`container mx-auto px-4 md:px-20 py-16 min-h-screen ${isDarkMode ? 'bg-[#0B0F1A]' : 'bg-[#F9F9FB]'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Dashboard</h1>
      </div>

      {/* Cards Section: Balance | Quick Actions | Transactions */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-10">
        <AnimatePresence>
          {/* Balance Card */}
          <motion.div
            className="rounded-3xl bg-white dark:bg-[#18192b] shadow-2xl border border-white/20 p-5 flex flex-col items-center justify-center relative overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            custom={0}
            exit="hidden"
            style={{ minHeight: 140 }}
          >
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-[#7B61FF]/30 to-[#A78BFA]/20 rounded-full blur-2xl opacity-60"></div>
            <FaWallet className="text-5xl mb-3 text-[#7B61FF] drop-shadow-lg" />
            <div className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">${usdTotal} <span className="text-base md:text-lg font-medium text-gray-400">USD</span></div>
            <div className="text-base md:text-lg font-mono text-gray-400">{ethBalance} ETH</div>
            {account ? (
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#232946] border border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Connected:</span>
                  <span className="ml-2 text-sm font-medium">{account.slice(0, 6)}...{account.slice(-4)}</span>
                </div>
                <button
                  onClick={() => setShowDisconnectModal(true)}
                  className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h9a2.25 2.25 0 002.25-2.25V15" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="mt-4">
                {typeof window !== "undefined" && <WalletConnect />}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="rounded-3xl bg-white dark:bg-[#18192b] shadow-2xl border border-white/20 p-3 md:p-5 flex flex-col items-center justify-center relative overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            custom={1}
            exit="hidden"
            style={{ minHeight: 140 }}
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-[#A78BFA]/30 to-[#7B61FF]/10 rounded-full blur-2xl opacity-60"></div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 justify-center"><FaArrowUp className="text-[#7B61FF]" /> Quick Actions</h2>
            <div className="flex flex-col gap-4 w-full items-center">
              <button
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-3 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:from-[#6B51EF] hover:to-[#9771FA] transition-all focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/40"
                onClick={() => setShowPaymentModal(true)}
              >
                <FaArrowUp className="w-6 h-6" /> Send Money
              </button>
              <button
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#A78BFA] to-[#7B61FF] text-white py-3 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:from-[#9771FA] hover:to-[#6B51EF] transition-all focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/40"
                onClick={() => setShowRequestModal(true)}
              >
                <FaArrowDown className="w-6 h-6" /> Request Money
              </button>
            </div>
          </motion.div>

          {/* Transactions Card */}
          <motion.div
            className="rounded-3xl bg-white dark:bg-[#18192b] shadow-2xl border border-white/20 p-3 md:p-5 flex flex-col justify-center relative overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            custom={2}
            exit="hidden"
            style={{ minHeight: 140 }}
          >
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-[#A78BFA]/30 to-[#7B61FF]/10 rounded-full blur-2xl opacity-60"></div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 justify-center"><FaMoneyBillWave className="text-[#A78BFA]" /> Recent Transactions</h2>
            <div className="flex-1 flex flex-col">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-8">
                  <svg width="48" height="48" fill="none" className="mb-2 opacity-40">
                    <rect width="48" height="48" rx="24" fill="#A78BFA" fillOpacity="0.13"/>
                    <path d="M16 24h16M24 16v16" stroke="#7B61FF" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  <div className="text-gray-400 text-center">No recent transactions</div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {transactions.slice(0, 5).map((tx: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-[#232946]/20 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'sent' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                          {tx.type === 'sent' ? <FaArrowUp className="w-4 h-4" /> : <FaArrowDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {tx.type === 'sent' ? 'Sent to' : 'Received from'} {tx.type === 'sent' ? tx.recipient.slice(0, 6) + '...' + tx.recipient.slice(-4) : tx.sender.slice(0, 6) + '...' + tx.sender.slice(-4)}
                          </div>
                          <div className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${tx.type === 'sent' ? 'text-red-500' : 'text-green-500'}`}>
                        {tx.type === 'sent' ? '-' : '+'}${tx.amount} {tx.currency}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Requests Dashboard and Analytics - stacked vertically, no glassmorphism */}
      <div className="w-full max-w-7xl flex flex-col gap-8 items-stretch mt-2 mb-16">
        <motion.div
          className="rounded-3xl bg-white dark:bg-[#18192b] shadow-2xl border border-white/20 flex flex-col justify-start relative overflow-hidden p-0"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          custom={3}
          exit="hidden"
          style={{ minHeight: 140 }}
        >
          <div className="p-8 h-full flex flex-col justify-start">
            <RequestsDashboard currentUserId={currentUserId} />
          </div>
        </motion.div>
        <motion.div
          className="rounded-3xl bg-white dark:bg-[#18192b] shadow-2xl border border-white/20 flex flex-col justify-start relative overflow-hidden p-0"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          custom={4}
          exit="hidden"
          style={{ minHeight: 140 }}
        >
          <div className="p-8 h-full flex flex-col justify-start">
            <DashboardAnalytics transactions={transactions} />
          </div>
        </motion.div>
      </div>
      {/* Payment Modal */}
      {showPaymentModal && <PaymentForm onClose={() => setShowPaymentModal(false)} />}
      {/* Request Modal */}
      {showRequestModal && <RequestMoneyForm onClose={() => setShowRequestModal(false)} />}
      {/* Disconnect Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-[#18192b] rounded-xl shadow-lg p-6 w-full max-w-xs relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              onClick={() => setShowDisconnectModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto w-10 h-10 text-red-500 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h9a2.25 2.25 0 002.25-2.25V15" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <p className="mb-4 text-lg">Disconnect your wallet?</p>
              <button
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-colors"
                onClick={() => { disconnectWallet(); setShowDisconnectModal(false); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h9a2.25 2.25 0 002.25-2.25V15" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Glassmorphism style */}
      <style jsx global>{`
        .glass-card {
          background: rgba(255,255,255,0.13);
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
          backdrop-filter: blur(13px);
          -webkit-backdrop-filter: blur(13px);
          border-radius: 1.5rem;
          border: 1px solid rgba(255,255,255,0.16);
        }
      `}</style>
    </div>
  );
}