"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { useTheme } from "@/app/providers/ThemeProvider";

// Transaction type for type safety
interface Transaction {
  createdAt: string;
  type: string;
  recipient: string;
  sender: string;
  amount: number;
  status: string;
  currency: string;
  network: number;
  txHash: string;
  senderWallet?: string;
  recipientWallet?: string;
}

export default function Transactions() {
  const { user, loading } = useAuth();
  const { account } = useWallet();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !account) return;
    fetch("/api/transactions")
      .then(res => res.json())
      .then(data => {
        // Mark transactions as 'received' if the current wallet is the recipient
        const processedTransactions = (data.transactions || []).map((tx: any) => {
          if (tx.recipientWallet && account && tx.recipientWallet.toLowerCase() === account.toLowerCase()) {
            return { ...tx, type: 'received' };
          }
          if (tx.senderWallet && account && tx.senderWallet.toLowerCase() === account.toLowerCase()) {
            return { ...tx, type: 'sent' };
          }
          // fallback to old logic if wallet fields are missing
          if (tx.recipient && account && tx.recipient.toLowerCase() === account.toLowerCase()) {
            return { ...tx, type: 'received' };
          }
          if (tx.sender && account && tx.sender.toLowerCase() === account.toLowerCase()) {
            return { ...tx, type: 'sent' };
          }
          return tx;
        });
        setTransactions(processedTransactions);
        setFiltered(processedTransactions);
      });
  }, [user, account]);

  useEffect(() => {
    let txs = [...transactions];
    if (typeFilter !== 'all') {
      if (typeFilter === 'sent') {
        txs = txs.filter(tx => tx.type === 'sent' && tx.senderWallet && account && tx.senderWallet.toLowerCase() === account.toLowerCase());
      } else if (typeFilter === 'received') {
        txs = txs.filter(tx => tx.type === 'received' && tx.recipientWallet && account && tx.recipientWallet.toLowerCase() === account.toLowerCase());
      } else {
        txs = txs.filter(tx => tx.type === typeFilter);
      }
    }
    if (statusFilter !== 'all') txs = txs.filter(tx => tx.status === statusFilter);
    setFiltered(txs);
  }, [typeFilter, statusFilter, transactions, account]);

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
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Transactions</h1>
        <div className="flex gap-3 w-full md:w-auto">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="flex-1 md:flex-none rounded-lg border px-3 py-2 bg-white dark:bg-[#232946] text-base">
            <option value="all">All Types</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex-1 md:flex-none rounded-lg border px-3 py-2 bg-white dark:bg-[#232946] text-base">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
      <div className="relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 px-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-pulse">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className={`bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden ${isDarkMode ? '' : 'bg-white border-gray-200 shadow-md'}`}
            style={{ minWidth: '800px' }}>
            <div className={`grid grid-cols-4 gap-6 text-gray-400 font-medium mb-8 px-8 py-6 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}> 
            <div>Date</div>
            <div>Description</div>
            <div>Amount</div>
            <div>Status</div>
          </div>
          {filtered.length === 0 ? (
            <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No transactions found</div>
          ) : (
            filtered.map((tx, idx) => (
                <div key={idx} className="space-y-2 py-4 border-b last:border-b-0 border-gray-100 dark:border-[#232946] px-8">
                  <div className="grid grid-cols-4 gap-6 items-center">
                  <div>{new Date(tx.createdAt).toLocaleDateString()}</div>
                  <div>{tx.type === 'sent' ? `To ${tx.recipient.slice(0, 6)}...${tx.recipient.slice(-4)}` : `From ${tx.sender.slice(0, 6)}...${tx.sender.slice(-4)}`}</div>
                  <div className="font-semibold">
                    {tx.type === 'sent' ? '-' : '+'}${tx.amount} {tx.currency}
                  </div>
                  <div className={`capitalize font-medium ${tx.status === 'completed' ? 'text-green-500' : tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>
                    {tx.status}
                  </div>
                </div>
                {tx.txHash && (
                  <div className="mt-2 pl-2 border-l-2 border-[#7B61FF]/20">
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#7B61FF] hover:text-[#A78BFA] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      View Transaction: {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
          </div>
        </div>
      </div>
    </div>
  );
}