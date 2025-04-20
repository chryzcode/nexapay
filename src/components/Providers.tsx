"use client";

import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1A1E2C",
              color: "#F9F9FB",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#7B61FF",
                secondary: "#F9F9FB",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#F9F9FB",
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
} 