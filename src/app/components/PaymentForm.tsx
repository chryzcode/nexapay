"use client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Web3 from "web3";
import BN from "bn.js";
import { useTheme } from "../providers/ThemeProvider";

// NexaPayPayment contract ABI (partial, just pay and supportedTokens)
const NEXAPAY_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "address", "name": "merchant", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "reference", "type": "string" }
    ],
    "name": "pay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "supportedTokens",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Supported tokens (replace with actual deployed addresses)
const SUPPORTED_TOKENS = [
  {
    symbol: "USDT",
    address: "0x...", // Replace with actual USDT address
    decimals: 6, // USDT/USDC typically use 6 decimals
  },
  {
    symbol: "USDC",
    address: "0x...", // Replace with actual USDC address
    decimals: 6,
  },
];

// NexaPayPayment contract address (replace with actual deployed address)
const NEXAPAY_CONTRACT_ADDRESS = "0x...";

const IDENTIFIER_TYPES = [
  { label: "Wallet Address", value: "address", placeholder: "0x..." },
  { label: "Username", value: "username", placeholder: "username" },
  { label: "User ID", value: "userId", placeholder: "123456" },
];

export default function PaymentForm({ onClose }: { onClose?: () => void }) {
  const { isDarkMode } = useTheme();
  const [identifierType, setIdentifierType] = useState("address");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [token, setToken] = useState(SUPPORTED_TOKENS[0].address);
  const [sending, setSending] = useState(false);

  // Enhancement state
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [usdValue, setUsdValue] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [recipientStatus, setRecipientStatus] = useState<'idle' | 'loading' | 'found' | 'notfound'>('idle');

  // Fetch token USD rate on token change
  useEffect(() => {
    async function fetchRate() {
      setUsdRate(null);
      let coingeckoId = '';
      if (token.toLowerCase().includes('usdt')) coingeckoId = 'tether';
      else if (token.toLowerCase().includes('usdc')) coingeckoId = 'usd-coin';
      else coingeckoId = 'usd-coin'; // fallback
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`);
        const data = await res.json();
        setUsdRate(data[coingeckoId]?.usd || null);
      } catch {
        setUsdRate(null);
      }
    }
    fetchRate();
  }, [token]);

  // Calculate USD value on amount or rate change
  useEffect(() => {
    if (!usdRate || !amount) { setUsdValue(""); return; }
    const val = parseFloat(amount) * usdRate;
    setUsdValue(val ? `$${val.toFixed(2)}` : "");
  }, [usdRate, amount]);

  // Resolve recipient address on merchant/identifierType change
  useEffect(() => {
    if (!merchant) { setRecipientAddress(""); setRecipientStatus('idle'); return; }
    if (identifierType === 'address') {
      setRecipientAddress(merchant);
      setRecipientStatus('found');
      return;
    }
    setRecipientStatus('loading');
    fetch('/api/resolve-identifier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: identifierType, value: merchant })
    })
      .then(res => res.json())
      .then(data => {
        if (data.address) {
          setRecipientAddress(data.address);
          setRecipientStatus('found');
        } else {
          setRecipientAddress("");
          setRecipientStatus('notfound');
        }
      })
      .catch(() => {
        setRecipientAddress("");
        setRecipientStatus('notfound');
      });
  }, [merchant, identifierType]);

  // Send payment
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.ethereum) {
      toast.error("MetaMask not detected");
      return;
    }
    if (!recipientAddress || recipientStatus !== 'found') {
      toast.error("Recipient not found or invalid");
      return;
    }
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }
    setSending(true);
    try {
      // 1. Resolve recipient address
      let recipient = recipientAddress;
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const from = accounts[0];
      const tokenInfo = SUPPORTED_TOKENS.find(t => t.address === token);
      if (!tokenInfo) throw new Error("Token not supported");
      const erc20 = new web3.eth.Contract([
        {
          constant: false,
          inputs: [
            { name: "_spender", type: "address" },
            { name: "_value", type: "uint256" }
          ],
          name: "approve",
          outputs: [{ name: "", type: "bool" }],
          type: "function"
        }
      ], token);
      // Approve the contract to spend tokens
      const value = new BN(Number(amount) * 10 ** tokenInfo.decimals);
      await erc20.methods.approve(NEXAPAY_CONTRACT_ADDRESS, value.toString()).send({ from });
      // Call pay
      const contract = new web3.eth.Contract(NEXAPAY_ABI as any, NEXAPAY_CONTRACT_ADDRESS);
      await contract.methods.pay(token, recipient, value.toString(), reference).send({ from });
      toast.success("Payment sent successfully");
      setMerchant("");
      setAmount("");
      setReference("");
    } catch (err: any) {
      toast.error("Payment failed: " + (err?.message || err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-[9999] pointer-events-auto" style={{ paddingTop: '120px' }}>
      {/* Optional translucent overlay for modal effect */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" style={{ zIndex: 0 }}></div>
      <div className={`relative bg-white/5 border border-white/10 rounded-xl p-8 w-full max-w-lg shadow-2xl ${isDarkMode ? 'bg-[#18192b] text-white' : 'bg-white text-[#18192b]'}`}
        style={{ zIndex: 1 }}>
        {/* Close button - should call a prop function if provided */}
        {typeof onClose === 'function' && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-2xl text-white/70 hover:text-white focus:outline-none"
            aria-label="Close"
            style={{ zIndex: 2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <h3 className="text-3xl font-extrabold mb-6 text-[#7B61FF] tracking-tight text-center">Send Payment</h3>
        <form onSubmit={handleSend} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1">Token</label>
            <select
              value={token}
              onChange={e => setToken(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-transparent"
            >
              {SUPPORTED_TOKENS.map((t) => (
                <option value={t.address} key={t.symbol}>{t.symbol}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Recipient Type</label>
            <select
              value={identifierType}
              onChange={e => setIdentifierType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-transparent"
            >
              {IDENTIFIER_TYPES.map(type => (
                <option value={type.value} key={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Recipient</label>
            <input
              type="text"
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-transparent"
              placeholder={IDENTIFIER_TYPES.find(t => t.value === identifierType)?.placeholder || ""}
              required
            />
            {/* Recipient resolution feedback */}
            {recipientStatus === 'loading' && (
              <div className="text-xs text-yellow-400 mt-1">Resolving recipient...</div>
            )}
            {recipientStatus === 'found' && recipientAddress && (
              <div className="text-xs text-green-400 mt-1">Recipient: {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}</div>
            )}
            {recipientStatus === 'notfound' && (
              <div className="text-xs text-red-400 mt-1">Recipient not found</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Amount</label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-transparent"
              placeholder="0.00"
              required
            />
            {/* USD Conversion display */}
            {usdValue && (
              <div className="text-xs text-blue-400 mt-1">≈ {usdValue} USD</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Reference (optional)</label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-transparent"
              placeholder="Order ID, Invoice, etc."
            />
          </div>
          <button
            type="submit"
            disabled={sending || recipientStatus !== 'found'}
            className="w-full bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-3 px-4 rounded-xl font-semibold text-lg shadow-md hover:from-[#6B51EF] hover:to-[#9771FA] transition-colors disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
