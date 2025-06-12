"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface WalletContextType {
  account: string | null;
  setAccount: (account: string | null) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  setAccount: () => {},
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  isConnecting: false,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useAuth();

  // Load wallet on mount if user is logged in
  useEffect(() => {
    if (user?.id) {
      loadStoredWallet();
    }
  }, [user]);

  const loadStoredWallet = async () => {
    try {
      const response = await fetch(`/api/wallet/connect?userId=${user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.walletAddress) {
          setAccount(data.walletAddress);
          console.log('Loaded stored wallet:', data.walletAddress);
        }
      }
    } catch (error) {
      console.error('Error loading stored wallet:', error);
    }
  };

  const connectWallet = async () => {
    if (!user?.id) {
      toast.error("Please log in to connect your wallet", {
        position: "bottom-center",
        duration: 4000,
      });
      return;
    }

    if (typeof window === "undefined" || !window.ethereum) {
      toast.error("Please install MetaMask to connect your wallet", {
        position: "bottom-center",
        duration: 4000,
      });
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const connectedAccount = accounts[0];

      // Get the current chainId
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const networkHint = parseInt(chainId, 16); // Convert hex to decimal

      // Update user document in the database with the wallet address and network
      const response = await fetch("/api/wallet/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          walletAddress: connectedAccount,
          networkHint: networkHint,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update wallet address in the database");
      }

      setAccount(connectedAccount);
      toast.success("Wallet connected successfully!", {
        position: "bottom-center",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet", {
        position: "bottom-center",
        duration: 4000,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (!user?.id) return;

    try {
      // First, clear the wallet from the database
      const response = await fetch("/api/wallet/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to disconnect wallet");
      }

      // Clear local state
      setAccount(null);

      // Clear any stored wallet data
      localStorage.removeItem('walletAccount');
      sessionStorage.removeItem('walletAccount');

      toast.success("Wallet disconnected successfully", {
        position: "bottom-center",
        duration: 3000,
      });

      // Force a page reload to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Failed to disconnect wallet", {
        position: "bottom-center",
        duration: 4000,
      });
    }
  };

  return (
    <WalletContext.Provider value={{ 
      account, 
      setAccount, 
      connectWallet, 
      disconnectWallet,
      isConnecting 
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
