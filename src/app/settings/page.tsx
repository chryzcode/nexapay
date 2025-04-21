"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useTheme } from "@/app/providers/ThemeProvider";

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (user) {
      setFullname(user.fullname || "");
      setUsername(user.username || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== retypePassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, username, password: password.trim() === "" ? undefined : password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }
      if (typeof refreshUser === "function") await refreshUser();
      toast.success("Profile updated successfully.");
      setPassword("");
      setRetypePassword("");
    } catch (error: any) {
      toast.error(error.message || "Update failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0B0F1A]' : 'bg-[#F9F9FB]'}`}>
      <div className={`w-full max-w-md p-8 space-y-8 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-lg' : 'bg-white border-gray-200 shadow-md'}`}>
        <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Update Profile</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className={`block text-base font-semibold mb-1 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className={`mt-1 block w-full px-3 py-2 rounded-lg border cursor-not-allowed ${isDarkMode ? 'bg-gray-800 border-white/10 text-gray-400' : 'bg-gray-200 border-gray-200 text-gray-500'}`}
            />
          </div>
          <div>
            <label className={`block text-base font-semibold mb-1 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Full Name</label>
            <input
              type="text"
              value={fullname}
              onChange={e => setFullname(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 ${isDarkMode ? 'bg-white/5 border-white/10 text-[#F9F9FB]' : 'bg-white border-gray-200 text-[#111827]'}`}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label className={`block text-base font-semibold mb-1 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 ${isDarkMode ? 'bg-white/5 border-white/10 text-[#F9F9FB]' : 'bg-white border-gray-200 text-[#111827]'}`}
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className={`block text-base font-semibold mb-1 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 ${isDarkMode ? 'bg-white/5 border-white/10 text-[#F9F9FB]' : 'bg-white border-gray-200 text-[#111827]'}`}
              placeholder="Enter new password (leave blank to keep current)"
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
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
