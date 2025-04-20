"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

export default function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const { verifyEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setIsVerified(true);
      } catch (error) {
        console.error("Email verification failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [searchParams, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Verify your email</h1>
          <p className="mt-2 text-gray-400">
            {isLoading
              ? "Verifying your email..."
              : isVerified
              ? "Your email has been verified successfully!"
              : "Email verification failed. Please try again."}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] hover:from-[#6B51EF] hover:to-[#9771FA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {isVerified ? "Go to login" : "Try again"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 