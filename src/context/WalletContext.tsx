"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface WalletContextType {
  account: string | null;
  setAccount: (account: string | null) => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  setAccount: () => {},
  disconnectWallet: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const { user } = useAuth();

  // Load saved wallet on mount and when user changes
  useEffect(() => {
    async function loadWallet() {
      if (typeof window !== 'undefined' && user?.id) {
        try {
          console.log('Loading wallet for user:', user.id);
          // First try to get from database
          const response = await fetch(`/api/wallet/connect?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            console.log('Wallet data from API:', data);
            if (data.walletAddress) {
              setAccount(data.walletAddress);
              localStorage.setItem('walletAccount', data.walletAddress);
              return;
            }
          }
          
          // Fallback to localStorage
          const savedAccount = localStorage.getItem('walletAccount');
          if (savedAccount) {
            setAccount(savedAccount);
          }
        } catch (error) {
          console.error('Error loading wallet:', error);
        }
      }
    }

    loadWallet();
  }, [user]);

  // Save wallet to database when connected
  useEffect(() => {
    async function saveWallet() {
      if (account && user?.id) {
        try {
          console.log('Saving wallet for user:', user.id, 'address:', account);
          const response = await fetch('/api/wallet/connect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              walletAddress: account,
            }),
          });

          if (!response.ok) {
            console.error('Failed to save wallet to database');
            const errorData = await response.json();
            console.error('Error details:', errorData);
          } else {
            localStorage.setItem('walletAccount', account);
          }
        } catch (error) {
          console.error('Error saving wallet:', error);
        }
      }
    }

    saveWallet();
  }, [account, user]);

  const disconnectWallet = async () => {
    if (user?.id) {
      try {
        console.log('Disconnecting wallet for user:', user.id);
        const response = await fetch('/api/wallet/connect', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        });

        if (!response.ok) {
          console.error('Failed to remove wallet from database');
          const errorData = await response.json();
          console.error('Error details:', errorData);
        }
      } catch (error) {
        console.error('Error removing wallet:', error);
      }
    }

    localStorage.removeItem('walletAccount');
    setAccount(null);
  };

  return (
    <WalletContext.Provider value={{ account, setAccount, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
