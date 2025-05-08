"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "@/app/providers/ThemeProvider";

// Transaction type for type safety
interface Transaction {
  createdAt: string;
  type: string;
  recipient: string;
  sender: string;
  amount: number;
  status: string;
}

export default function Transactions() {
  const { user, loading } = useAuth();
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
    if (!user) return;
    fetch("/api/transactions")
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        setFiltered(data.transactions || []);
      });
  }, [user]);

  useEffect(() => {
    let txs = [...transactions];
    if (typeFilter !== 'all') txs = txs.filter(tx => tx.type === typeFilter);
    if (statusFilter !== 'all') txs = txs.filter(tx => tx.status === statusFilter);
    setFiltered(txs);
  }, [typeFilter, statusFilter, transactions]);

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
      <div className="flex justify-between items-center mb-12">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Transactions</h1>
        <div className="flex gap-3">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="rounded-lg border px-3 py-2 bg-white dark:bg-[#232946] text-base">
            <option value="all">All Types</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border px-3 py-2 bg-white dark:bg-[#232946] text-base">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className={`bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden ${isDarkMode ? '' : 'bg-white border-gray-200 shadow-md'}`}
          style={{ padding: '2.5rem 2rem' }}>
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-gray-400 font-medium mb-8 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}> 
            <div>Date</div>
            <div>Description</div>
            <div>Amount</div>
            <div>Status</div>
          </div>
          {filtered.length === 0 ? (
            <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No transactions found</div>
          ) : (
            filtered.map((tx, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-center py-5 border-b last:border-b-0 border-gray-100 dark:border-[#232946]">
                <div>{new Date(tx.createdAt).toLocaleDateString()}</div>
                <div>{tx.type === 'sent' ? `To ${tx.recipient}` : `From ${tx.sender}`}</div>
                <div className="font-semibold">${tx.amount}</div>
                <div className={`capitalize font-medium ${tx.status === 'completed' ? 'text-green-500' : tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>{tx.status}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}