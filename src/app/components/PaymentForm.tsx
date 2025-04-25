"use client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState } from "react";
import { toast } from "react-toastify";
import Web3 from "web3";
import BN from "bn.js";

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

export default function PaymentForm() {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [token, setToken] = useState(SUPPORTED_TOKENS[0].address);
  const [sending, setSending] = useState(false);

  // Send payment
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.ethereum) {
      toast.error("MetaMask not detected");
      return;
    }
    if (!merchant || !amount) {
      toast.error("Please fill all fields");
      return;
    }
    setSending(true);
    try {
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
      await contract.methods.pay(token, merchant, value.toString(), reference).send({ from });
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
    <div className="p-4 bg-white dark:bg-[#18192b] rounded-lg shadow-md mt-8">
      <h3 className="text-lg font-semibold mb-2">Send Payment</h3>
      <form onSubmit={handleSend} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Token</label>
          <select
            value={token}
            onChange={e => setToken(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {SUPPORTED_TOKENS.map((t) => (
              <option value={t.address} key={t.symbol}>{t.symbol}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Merchant Address</label>
          <input
            type="text"
            value={merchant}
            onChange={e => setMerchant(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="0x..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reference (optional)</label>
          <input
            type="text"
            value={reference}
            onChange={e => setReference(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Order ID, Invoice, etc."
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-2 px-4 rounded-lg font-medium hover:from-[#6B51EF] hover:to-[#9771FA] transition-colors disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send Payment"}
        </button>
      </form>
    </div>
  );
}
