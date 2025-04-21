"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "@/app/providers/ThemeProvider";

export default function Transactions() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Transactions</h1>
        <button className={`bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-2 px-6 rounded-lg font-medium hover:from-[#6B51EF] hover:to-[#9771FA] transition-colors ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Filter</button>
      </div>

      <div className={`bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden ${isDarkMode ? '' : 'bg-white border-gray-200 shadow-md'}`}>
        <div className="p-6">
          <div className={`grid grid-cols-4 gap-4 text-gray-400 font-medium mb-4 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}> 
            <div>Date</div>
            <div>Description</div>
            <div>Amount</div>
            <div>Status</div>
          </div>
          
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No transactions found</div>
        </div>
      </div>
    </div>
  );
} 