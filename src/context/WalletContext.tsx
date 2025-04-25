"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WalletContextType {
  account: string | null;
  setAccount: (account: string | null) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);

  // Optionally, persist wallet connection in localStorage
  useEffect(() => {
    const saved = window.localStorage.getItem("walletAccount");
    if (saved) setAccount(saved);
  }, []);

  useEffect(() => {
    if (account) {
      window.localStorage.setItem("walletAccount", account);
    } else {
      window.localStorage.removeItem("walletAccount");
    }
  }, [account]);

  return (
    <WalletContext.Provider value={{ account, setAccount }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
