"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from 'react-toastify';
import { useTheme } from "@/app/providers/ThemeProvider";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    if (password !== retypePassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Password reset failed.");
        return;
      }
      toast.success("Password reset successfully. You can now log in.");
      setPassword("");
      setRetypePassword("");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Password reset failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0B0F1A]' : 'bg-[#F9F9FB]'}`}>
      <div className={`w-full max-w-md p-8 space-y-8 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-lg' : 'bg-white border-gray-200 shadow-md'}`}>
        <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Reset Password</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className={`block text-base font-semibold mb-1 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 ${isDarkMode ? 'bg-white/5 border-white/10 text-[#F9F9FB]' : 'bg-white border-gray-200 text-[#111827]'}`}
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label className={`block text-base font-semibold mb-1 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Retype New Password</label>
            <input
              type="password"
              value={retypePassword}
              onChange={e => setRetypePassword(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 ${isDarkMode ? 'bg-white/5 border-white/10 text-[#F9F9FB]' : 'bg-white border-gray-200 text-[#111827]'}`}
              placeholder="Retype new password"
              required
            />
            {retypePassword && password !== retypePassword && (
              <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border rounded-lg shadow-md text-base font-semibold bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] hover:from-[#6B51EF] hover:to-[#9771FA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'text-[#F9F9FB] border-white/10' : 'text-[#111827] border-gray-200'}`}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
