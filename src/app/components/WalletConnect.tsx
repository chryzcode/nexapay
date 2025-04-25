"use client";

import { useEffect, useState } from "react";
import Web3 from "web3";
import { toast } from "react-toastify";
import { useWallet } from "@/context/WalletContext";

// USDT/USDC ERC20 ABIs (simplified)
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
];

// Add your supported token addresses for the current chain
const SUPPORTED_TOKENS = [
  {
    symbol: "USDT",
    address: "0x...", // Replace with actual USDT address
  },
  {
    symbol: "USDC",
    address: "0x...", // Replace with actual USDC address
  },
];

// Add a prop to notify parent of connection state
interface WalletConnectProps {
  onConnect?: (account: string) => void;
  onDisconnect?: () => void;
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const { account, setAccount } = useWallet();
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState(false);

  // Fetch balances for supported tokens
  const fetchBalances = async (web3: Web3, account: string) => {
    const results: Record<string, string> = {};
    for (const token of SUPPORTED_TOKENS) {
      try {
        const contract = new web3.eth.Contract(ERC20_ABI as any, token.address);
        const [rawBalance, decimals] = await Promise.all([
          contract.methods.balanceOf(account).call(),
          contract.methods.decimals().call(),
        ]);
        results[token.symbol] = (Number(rawBalance) / 10 ** Number(decimals)).toLocaleString();
      } catch {
        results[token.symbol] = "-";
      }
    }
    setBalances(results);
  };

  // Auto-fetch balances on account change
  useEffect(() => {
    if (web3 && account) {
      fetchBalances(web3, account);
    }
  }, [web3, account]);

  // Disconnect wallet handler
  const handleDisconnect = () => {
    setAccount(null);
    setWeb3(null);
    toast.info("Wallet disconnected");
    if (onDisconnect) onDisconnect();
  };

  // Only render button if not connected, else render disconnect option
  if (!account) {
    return (
      <button
        onClick={async () => {
          if (typeof window === "undefined" || !(window as any).ethereum) {
            toast.error("MetaMask not detected");
            return;
          }
          setConnecting(true);
          try {
            const provider = (window as any).ethereum;
            await provider.request({ method: "eth_requestAccounts" });
            const web3Instance = new Web3(provider);
            setWeb3(web3Instance);
            const accounts = await web3Instance.eth.getAccounts();
            setAccount(accounts[0]);
            toast.success("Wallet connected successfully");
            if (onConnect) onConnect(accounts[0]);
          } catch (err: any) {
            if (err?.code === 4001) {
              toast.info("Wallet connection cancelled");
            } else {
              toast.error("Wallet connection failed");
            }
            if (onDisconnect) onDisconnect();
          } finally {
            setConnecting(false);
          }
        }}
        disabled={connecting}
        className="px-4 py-2 flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white font-semibold hover:from-[#6B51EF] hover:to-[#9771FA] disabled:opacity-60"
        style={{ minWidth: 160 }}
      >
        {/* Wallet Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v11.25A2.25 2.25 0 0119.5 20.25h-15A2.25 2.25 0 012.25 18V6.75z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 12.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
        </svg>
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }
  // If connected, render disconnect button
  return (
    <button
      onClick={handleDisconnect}
      className="px-4 py-2 flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 mt-2"
      style={{ minWidth: 160 }}
    >
      {/* Disconnect Icon */}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h9a2.25 2.25 0 002.25-2.25V15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l3-3m0 0l-3-3m3 3H9" />
      </svg>
      Disconnect
    </button>
  );
}
