"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "@/app/providers/ThemeProvider";

export default function Dashboard() {
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
      <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Dashboard</h1>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-lg' : 'bg-white border-gray-200 shadow-md'}`}>
        {/* Balance Card */}
        <div className={`bg-card rounded-xl p-6 border ${isDarkMode ? 'bg-[#1F2937]' : 'bg-[#F9F9FB]'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Balance</h2>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>$0.00</p>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available Balance</p>
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
            <button className={`w-full bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-2 px-4 rounded-lg font-medium hover:from-[#6B51EF] hover:to-[#9771FA] transition-colors ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Send Money</button>
            <button className={`w-full bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-2 px-4 rounded-lg font-medium hover:from-[#6B51EF] hover:to-[#9771FA] transition-colors ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Request Money</button>
          </div>
        </div>
      </div>
    </div>
  );
} 