"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { toast } from 'react-toastify';
import { useTheme } from "@/app/providers/ThemeProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0B0F1A] text-[#F9F9FB]' : 'bg-[#F9F9FB] text-[#111827]'} relative overflow-hidden`}>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className={`absolute -top-[30%] -left-[10%] w-[50%] h-[50%] ${isDarkMode ? 'bg-[#7B61FF]/10' : 'bg-[#7B61FF]/5'} rounded-full blur-[120px]`}></div>
        <div className={`absolute top-[60%] -right-[10%] w-[40%] h-[40%] ${isDarkMode ? 'bg-[#7B61FF]/5' : 'bg-[#7B61FF]/5'} rounded-full blur-[120px]`}></div>
      </div>

      <div className="w-full max-w-md p-8 space-y-8 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
        <div className="text-center">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'}`}>Welcome back</h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={`h-4 w-4 ${isDarkMode ? 'text-purple-500' : 'text-purple-500'} focus:ring-purple-500 border-white/10 rounded bg-white/5`}
              />
              <label htmlFor="remember-me" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Remember me
              </label>
            </div>

            <Link
              href="/forgot-password"
              className={`text-sm font-medium ${isDarkMode ? 'text-purple-500' : 'text-purple-500'} hover:text-purple-400`}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium ${isDarkMode ? 'text-[#F9F9FB]' : 'text-[#111827]'} bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] hover:from-[#6B51EF] hover:to-[#9771FA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Don't have an account?{" "}
            <Link href="/register" className={`font-medium ${isDarkMode ? 'text-purple-500' : 'text-purple-500'} hover:text-purple-400`}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 