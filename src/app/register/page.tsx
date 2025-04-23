"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { toast } from 'react-toastify';
import { useTheme } from "@/app/providers/ThemeProvider";

export default function Register() {
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== retypePassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(fullname, username, email, password);
      toast.success(result.message || 'Registration successful! Please check your email for the verification link.');
      setFullname("");
      setUsername("");
      setEmail("");
      setPassword("");
      setRetypePassword("");
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0B0F1A]' : 'bg-[#F9F9FB]'}`}>
      <div className={`w-full max-w-md p-8 space-y-8 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-lg' : 'bg-white border-gray-200 shadow-md'}`}>
        <div className="text-center">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Create an account</h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Join NexaPay today</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullname" className={`block text-base font-semibold mb-1 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Full Name</label>
            <input
              id="fullname"
              name="fullname"
              type="text"
              autoComplete="name"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 ${isDarkMode ? 'bg-white/5 border-white/10 text-[#F9F9FB]' : 'bg-white border-gray-200 text-[#111827]'}`}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label htmlFor="username" className={`block text-base font-semibold mb-1 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 ${isDarkMode ? 'bg-white/5 border-white/10 text-[#F9F9FB]' : 'bg-white border-gray-200 text-[#111827]'}`}
              placeholder="Enter a username"
            />
          </div>
          <div>
            <label htmlFor="email" className={`block text-base font-semibold mb-1 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 ${isDarkMode ? 'bg-white/5 border-white/10 text-[#F9F9FB]' : 'bg-white border-gray-200 text-[#111827]'}`}
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className={`block text-base font-semibold mb-1 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 ${isDarkMode ? 'bg-white/5 border-white/10 text-[#F9F9FB]' : 'bg-white border-gray-200 text-[#111827]'}`}
              placeholder="Create a password"
            />
          </div>
          <div>
            <label htmlFor="retypePassword" className={`block text-base font-semibold mb-1 ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Retype Password</label>
            <input
              id="retypePassword"
              name="retypePassword"
              type="password"
              autoComplete="new-password"
              required
              value={retypePassword}
              onChange={(e) => setRetypePassword(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 ${isDarkMode ? 'bg-white/5 border-white/10 text-[#F9F9FB]' : 'bg-white border-gray-200 text-[#111827]'}`}
              placeholder="Retype your password"
            />
            {retypePassword && password !== retypePassword && (
              <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !password || !retypePassword || password !== retypePassword}
            className={`w-full flex justify-center py-2 px-4 border rounded-lg shadow-md text-base font-semibold bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] hover:from-[#6B51EF] hover:to-[#9771FA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'text-[#F9F9FB] border-white/10' : 'text-[#111827] border-gray-200'}`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Already have an account?{' '}
            <Link href="/login" className={`font-semibold underline-offset-2 hover:underline ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}