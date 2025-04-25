"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useWallet } from "@/context/WalletContext";
import dynamic from "next/dynamic";
import Web3 from "web3";

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
  const { account, setAccount } = useWallet();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [usdTotal, setUsdTotal] = useState<string>("0.00");
  const [ethBalance, setEthBalance] = useState<string>("0.00");

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
    <div className={`container mx-auto px-4 py-8 min-h-screen ${isDarkMode ? 'bg-[#0B0F1A]' : 'bg-[#F9F9FB]'}`}>
      <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Dashboard</h1>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-lg' : 'bg-white border-gray-200 shadow-md'}`}>
        {/* Balance Card with WalletConnect */}
        <div className={`bg-card rounded-xl p-6 border ${isDarkMode ? 'bg-[#1F2937]' : 'bg-[#F9F9FB]'}`}> 
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Balance</h2>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>${usdTotal} USD</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{ethBalance} ETH</p>
          {account && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-300 font-mono break-all">
              Connected: {account}
            </div>
          )}
          {!account && (
            <div className="flex justify-end mt-4 w-full">
              {typeof window !== "undefined" && (
                <WalletConnect />
              )}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className={`bg-card rounded-xl p-6 border ${isDarkMode ? 'bg-[#1F2937]' : 'bg-[#F9F9FB]'}`}> 
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Recent Transactions</h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No recent transactions</p>
        </div>

        {/* Quick Actions */}
        <div className={`bg-card rounded-xl p-6 border ${isDarkMode ? 'bg-[#1F2937]' : 'bg-[#F9F9FB]'}`}> 
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Quick Actions</h2>
          <div className="space-y-3">
            <button
              className={`w-full flex items-center gap-2 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-2 px-4 rounded-lg font-medium hover:from-[#6B51EF] hover:to-[#9771FA] transition-colors ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}
              onClick={() => setShowPaymentModal(true)}
            >
              {/* Send Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m-7.5-7.5l7.5 7.5-7.5 7.5" />
              </svg>
              Send Money
            </button>
            <button
              className={`w-full flex items-center gap-2 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-2 px-4 rounded-lg font-medium hover:from-[#6B51EF] hover:to-[#9771FA] transition-colors ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}
            >
              {/* Receive Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m7.5 7.5l-7.5-7.5 7.5-7.5" />
              </svg>
              Request Money
            </button>
          </div>
        </div>
      </div>
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-[#18192b] rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              onClick={() => setShowPaymentModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <PaymentForm />
          </div>
        </div>
      )}
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
                onClick={() => { if (typeof window !== "undefined") { window.localStorage.removeItem("walletAccount"); } setAccount(null); setShowDisconnectModal(false); }}
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
    </div>
  );
} 