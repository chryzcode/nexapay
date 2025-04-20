"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Balance</h2>
          <p className="text-3xl font-bold text-white">$0.00</p>
          <p className="text-gray-400 mt-2">Available Balance</p>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
          <p className="text-gray-400">No recent transactions</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-2 px-4 rounded-lg font-medium hover:from-[#6B51EF] hover:to-[#9771FA] transition-colors">
              Send Money
            </button>
            <button className="w-full bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-2 px-4 rounded-lg font-medium hover:from-[#6B51EF] hover:to-[#9771FA] transition-colors">
              Request Money
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 