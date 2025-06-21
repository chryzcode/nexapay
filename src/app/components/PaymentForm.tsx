"use client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { useTheme } from "../providers/ThemeProvider";
import { resolveRecipient, RecipientResolutionResult, getNetworkName } from "../utils/userResolution";
import { stargateSwap, LZ_CHAIN_IDS, STARGATE_ROUTER_ADDRESSES } from "./stargate";
import Web3 from "web3";
import BN from "bn.js";
import { useWallet } from "@/context/WalletContext";

// Token information type definition
type TokenInfo = {
  symbol: string;
  address: string;
  decimals: number;
};

// NexaPayPayment contract ABI (including pay, supportedTokens, and PaymentReceived event)
const NEXAPAY_ABI = [
  {
    "inputs": [
      { "internalType": "address[]", "name": "initialTokens", "type": "address[]" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "payer", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "merchant", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "token", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "paymentReference", "type": "string" }
    ],
    "name": "PaymentReceived",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "token", "type": "address" },
      { "indexed": false, "internalType": "bool", "name": "supported", "type": "bool" }
    ],
    "name": "TokenSupportUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "address", "name": "merchant", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "paymentReference", "type": "string" }
    ],
    "name": "pay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "bool", "name": "supported", "type": "bool" }
    ],
    "name": "setTokenSupport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "supportedTokens",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Network-specific stablecoin configurations
const NETWORK_STABLECOINS: Record<number, { usdc: TokenInfo; usdt: TokenInfo }> = {
  // Mainnet Networks
  1: {  // Ethereum Mainnet
    usdc: { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    usdt: { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 }
  },
  137: {  // Polygon Mainnet
    usdc: { symbol: "USDC", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6 },
    usdt: { symbol: "USDT", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 }
  },
  56: {  // BSC Mainnet
    usdc: { symbol: "USDC", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
    usdt: { symbol: "USDT", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 }
  },
  43114: {  // Avalanche
    usdc: { symbol: "USDC", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 },
    usdt: { symbol: "USDT", address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", decimals: 6 }
  },
  // Testnet Networks (keeping existing testnets)
  11155111: {  // Sepolia (Ethereum Testnet)
    usdc: { symbol: "USDC", address: "0x1c7D4B196Cb0C7B01d3E18fbfD9A0fD5963E1f05", decimals: 6 },
    usdt: { symbol: "USDT", address: "0x7169D38820dfd117C3FA1f22a697dC8d4277c485", decimals: 6 }
  },
  80001: {  // Mumbai (Polygon Testnet)
    usdc: { symbol: "USDC", address: "0x0FA8EmA34E77646Ae76f9b9d6eCb8A4a6F9B2A7", decimals: 6 },
    usdt: { symbol: "USDT", address: "0x3813e82e6f7098b9583FC0F33a962D02018B6803", decimals: 6 }
  },
  97: {   // BSC Testnet
    usdc: { symbol: "USDC", address: "0x64544969ed7EBf5f083679233325356EAe6b383", decimals: 18 },
    usdt: { symbol: "USDT", address: "0x337610d27c682E347C9d7A50d0A9B5eB16b8E7AC", decimals: 18 }
  }
};

// NexaPayPayment contract address (replace with actual deployed address)
const NEXAPAY_CONTRACT_ADDR = process.env.NEXT_PUBLIC_NEXAPAY_CONTRACT;

enum IdentifierType {
  WALLET = 'wallet',
  USERNAME = 'username',
  USER_ID = 'userId'
}

const IDENTIFIER_TYPES_LIST = [
  { label: "Wallet Address", value: IdentifierType.WALLET, placeholder: "0x..." },
  { label: "Username", value: IdentifierType.USERNAME, placeholder: "username" },
  { label: "User ID", value: IdentifierType.USER_ID, placeholder: "123456" },
] as const;

enum RecipientStatus {
  IDLE = 'idle',
  SEARCHING = 'searching',
  FOUND = 'found',
  NOT_FOUND = 'not_found',
  ERROR = 'error'
}

interface RecipientResolution {
  address?: string;
  type?: IdentifierType;
  metadata?: Record<string, unknown>;
}

interface PaymentFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  srcChainId?: number;
  dstChainId?: number;
}

// Move this to the top, before getChainName and all usages
const CHAIN_OPTIONS = [
  { id: 1, name: 'Ethereum Mainnet' },
  { id: 137, name: 'Polygon' },
  { id: 56, name: 'BSC' },
  { id: 43114, name: 'Avalanche' },
  { id: 11155111, name: 'Sepolia (Testnet)' },
  { id: 80001, name: 'Mumbai (Testnet)' },
  { id: 97, name: 'BSC Testnet' },
];

export default function PaymentForm({ 
  onClose, 
  onSuccess,
  srcChainId = 11155111,
  dstChainId = 11155111 
}: PaymentFormProps) {
  const { isDarkMode } = useTheme();
  const { account } = useWallet();
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [identifierType, setIdentifierType] = useState<IdentifierType>(IdentifierType.WALLET);
  const [merchant, setMerchant] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);

  // Enhancement state
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [usdValue, setUsdValue] = useState<string>("");
  const [recipientInput, setRecipientInput] = useState("");
  const [recipientResolution, setRecipientResolution] = useState<RecipientResolution | null>(null);
  const [recipientStatus, setRecipientStatus] = useState<RecipientStatus>(RecipientStatus.IDLE);

  // Add these state variables near the top of the component
  const [ethAmount, setEthAmount] = useState<number | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  const [requestId, setRequestId] = useState<string | null>(null);

  const [isNetworkCompatible, setIsNetworkCompatible] = useState<boolean>(false);

  // Add state for network error message
  const [networkErrorMessage, setNetworkErrorMessage] = useState<string>("");

  // Add state for recipient's network type
  const [recipientNetworkType, setRecipientNetworkType] = useState<string>("");

  // Add a fallback price fetch function
  const fetchEthPriceWithFallback = async () => {
    try {
      // Try CoinGecko first
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      if (!response.ok) {
        throw new Error('CoinGecko API failed');
      }
      const data = await response.json();
      setEthPrice(data.ethereum.usd);
      setPriceError(null);
    } catch (error) {
      console.warn('CoinGecko API failed, trying fallback...');
      try {
        // Fallback to 1inch API
        const response = await fetch('https://api.1inch.io/v5.0/1/quote?fromTokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&toTokenAddress=0xdac17f958d2ee523a2206206994597c13d831ec7&amount=1000000000000000000');
        if (!response.ok) {
          throw new Error('Fallback API failed');
        }
        const data = await response.json();
        const price = parseFloat(data.toTokenAmount) / 1e6; // Convert from USDT decimals
        setEthPrice(price);
        setPriceError(null);
      } catch (fallbackError) {
        console.error('All price APIs failed:', fallbackError);
        setPriceError('Unable to fetch current ETH price. Please try again later.');
        // Set a default price for development/testing
        setEthPrice(2000); // Default fallback price
      }
    }
  };

  // Listen for payment modal open event
  useEffect(() => {
    const handleOpenPaymentModal = (event: CustomEvent) => {
      const { recipient, amount, note, requestId: reqId } = event.detail;
      if (recipient) {
        setRecipientInput(recipient);
        setIdentifierType(IdentifierType.USER_ID);
      }
      if (amount) {
        setAmount(amount.toString());
      }
      if (note) {
        setReference(note);
      }
      if (reqId) {
        setRequestId(reqId);
      }
    };

    window.addEventListener('openPaymentModal', handleOpenPaymentModal as EventListener);
    return () => {
      window.removeEventListener('openPaymentModal', handleOpenPaymentModal as EventListener);
    };
  }, []);

  // Helper to get chain name
  function getChainName(chainId: number) {
    const found = CHAIN_OPTIONS.find(opt => opt.id === chainId);
    return found ? found.name : `Chain ${chainId}`;
  }

  // Helper to get sender wallet address (if available)
  const [senderAddress, setSenderAddress] = useState<string>("");
  useEffect(() => {
    async function fetchAddress() {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.getAccounts();
          setSenderAddress(accounts[0] || "");
        } catch {}
      }
    }
    fetchAddress();
  }, []);

  // Update the useEffect for price fetching
  useEffect(() => {
    async function fetchRate() {
      setUsdRate(null);
      setEthPrice(null);
      setPriceError(null);
      
      try {
        await fetchEthPriceWithFallback();
        
        // Detect current network's token
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        
        // Fallback to a default network if unsupported
        const networkStablecoins = NETWORK_STABLECOINS[network.chainId] || NETWORK_STABLECOINS[11155111]; // Default to Sepolia
        
        // Prefer USDC, fallback to USDT
        let tokenInfo: TokenInfo = networkStablecoins.usdc || networkStablecoins.usdt;
        if (!tokenInfo) {
          toast.warning("Using default stablecoin due to network detection issue");
          // Hardcoded fallback to Sepolia USDC
          tokenInfo = NETWORK_STABLECOINS[11155111].usdc;
        }
        
        let coingeckoId = '';
        if (tokenInfo.symbol.toLowerCase().includes('usdt')) coingeckoId = 'tether';
        else if (tokenInfo.symbol.toLowerCase().includes('usdc')) coingeckoId = 'usd-coin';
        else coingeckoId = 'usd-coin'; // fallback
        
        try {
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`);
          if (!res.ok) {
            throw new Error('Failed to fetch USD rate');
          }
          const data = await res.json();
          const rate = data[coingeckoId].usd;
          setUsdRate(rate);
        } catch (err) {
          console.warn('Failed to fetch USD rate:', err);
          setUsdRate(1); // Fallback to 1:1 rate
        }
      } catch (err) {
        console.error('Network detection failed:', err);
        setUsdRate(1); // Fallback to 1:1 rate
      }
    }
    fetchRate();
  }, []); // Ensure dependency is an array

  // Calculate USD value on amount or rate change
  useEffect(() => {
    if (!usdRate || !amount) { 
      setUsdValue(""); 
      setEthAmount(null);
      return; 
    }
    const val = parseFloat(amount) * usdRate;
    setUsdValue(val ? `$${val.toFixed(2)}` : "");
    
    // Calculate ETH amount
    if (ethPrice) {
      const ethVal = parseFloat(amount) / ethPrice;
      setEthAmount(ethVal);
    }
  }, [usdRate, amount, ethPrice]);

  // Resolve recipient address on merchant/identifierType change
  // Debounce logic with useRef
  // Use number for browser setTimeout
  const timeoutRef = React.useRef<number | null>(null);
  useEffect(() => {
    if (!recipientInput) {
      setRecipientResolution(null);
      setRecipientStatus(RecipientStatus.NOT_FOUND);
      return;
    }
    setRecipientStatus(RecipientStatus.SEARCHING);
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(async () => {
      try {
        // Pass provider and identifierType to resolveRecipient
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // Convert IdentifierType to the format expected by resolveRecipient
        const resolveType = identifierType === IdentifierType.USER_ID ? 'userCode' : 
                           identifierType === IdentifierType.USERNAME ? 'username' : 
                           identifierType === IdentifierType.WALLET ? 'wallet' : 'wallet';
        const resolvedRecipient = await resolveRecipient(recipientInput, provider, resolveType);
        setRecipientResolution({
          address: resolvedRecipient.address,
          type: resolvedRecipient.type as IdentifierType,
          metadata: resolvedRecipient.metadata
        });
        setRecipientStatus(RecipientStatus.FOUND);
      } catch (err) {
        console.error('Recipient resolution error:', err);
        setRecipientResolution(null);
        setRecipientStatus(RecipientStatus.NOT_FOUND);
      }
    }, 500);
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
    // Only rerun when recipientInput or identifierType changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipientInput, identifierType]);

  // Add useEffect to fetch current user ID
  useEffect(() => {
    async function fetchUserId() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.user?.id) {
          throw new Error('User ID not found');
        }
        setCurrentUserId(data.user.id);
      } catch (err) {
        console.error('Failed to fetch user ID:', err);
        toast.error('Authentication error - please log in again');
        if (typeof onClose === 'function') {
          onClose();
        }
      }
    }
    fetchUserId();
  }, [onClose]);

  // Check network compatibility and self-transaction
  useEffect(() => {
    const checkNetworkCompatibilityAndSelfTransaction = async () => {
      if (!recipientResolution?.address) {
        setIsNetworkCompatible(true);
        setNetworkErrorMessage("");
        setRecipientNetworkType("");
        return;
      }

      try {
        // Get current network
        const web3 = new Web3(window.ethereum);
        const chainId = Number(await web3.eth.getChainId());
        
        // Define testnet chain IDs
        const TESTNET_CHAINS = [11155111, 80001, 97]; // Sepolia, Mumbai, BSC Testnet
        const isSenderTestnet = TESTNET_CHAINS.includes(chainId);

        // Use networkHint from resolved user instead of checking balances
        const recipientNetworkHint = recipientResolution.metadata?.networkHint;
        let isRecipientTestnet = false;
        
        if (recipientNetworkHint) {
          isRecipientTestnet = recipientNetworkHint === 11155111; // Sepolia testnet
        } else {
          // Fallback: assume testnet if no networkHint (for backward compatibility)
          isRecipientTestnet = true;
        }
        
        // Set recipient's network type
        setRecipientNetworkType(isRecipientTestnet ? "Sepolia (Testnet)" : "Ethereum (Mainnet)");
        
        // Allow if both are on testnet or both are on mainnet
        const isCompatible = isSenderTestnet === isRecipientTestnet;
        setIsNetworkCompatible(isCompatible);

        // Set appropriate error message
        if (!isCompatible) {
          if (isSenderTestnet && !isRecipientTestnet) {
            setNetworkErrorMessage("Cannot send from testnet to mainnet");
          } else if (!isSenderTestnet && isRecipientTestnet) {
            setNetworkErrorMessage("Cannot send from mainnet to testnet");
          } else {
            setNetworkErrorMessage("Network mismatch");
          }
        } else {
          setNetworkErrorMessage("");
        }

        // Check for self-transaction
        if (senderAddress && recipientResolution.address && senderAddress.toLowerCase() === recipientResolution.address.toLowerCase()) {
          setNetworkErrorMessage("You cannot send to your own wallet address");
          setIsNetworkCompatible(false);
          return;
        }

        // Also check if the resolved user ID matches the current user ID
        try {
          const recipientRes = await fetch('/api/resolve-identifier', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'address',
              value: recipientResolution.address
            })
          });
          if (recipientRes.ok) {
            const data = await recipientRes.json();
            if (data.userId && data.userId === currentUserId) {
              setNetworkErrorMessage("You cannot send to yourself");
              setIsNetworkCompatible(false);
              return;
            }
          }
        } catch (err) {
          console.error('Failed to check recipient user ID for self-send check:', err);
        }

        // Log for debugging
        console.log('Network Check:', {
          senderChainId: chainId,
          recipientAddress: recipientResolution.address,
          recipientNetworkHint,
          isSenderTestnet,
          isRecipientTestnet,
          isCompatible
        });
      } catch (error) {
        console.error('Error checking network compatibility:', error);
        setIsNetworkCompatible(false);
        setNetworkErrorMessage("Network validation failed");
        setRecipientNetworkType("");
      }
    };

    checkNetworkCompatibilityAndSelfTransaction();
  }, [recipientResolution?.address, recipientResolution?.metadata?.networkHint, senderAddress, currentUserId]);

  // Send payment
  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset sending state
    setSending(false);
    
    // Validate MetaMask connection
    if (!window.ethereum) {
      toast.error("MetaMask not detected");
      return;
    }
    
    // Validate recipient resolution
    if (!recipientResolution?.address || recipientStatus !== RecipientStatus.FOUND) {
      toast.error("Recipient not found or invalid");
      return;
    }

    setSending(true);
    try {
      // Validate recipient
      if (!recipientResolution.address || typeof recipientResolution.address !== 'string') {
        throw new Error('Recipient address is missing or invalid format');
      }
      const web3Nexa = new Web3(window.ethereum);
      if (!web3Nexa.utils.isAddress(recipientResolution.address)) {
        throw new Error(`Invalid recipient address format: ${recipientResolution.address}`);
      }
      const checksummedRecipient = web3Nexa.utils.toChecksumAddress(recipientResolution.address);

      // Setup accounts and contracts
      const accounts = await web3Nexa.eth.getAccounts();
      const from = accounts[0];

      // Get current network
      const chainId = Number(await web3Nexa.eth.getChainId());
      const networkStablecoins = NETWORK_STABLECOINS[chainId];
      
      if (!networkStablecoins) {
        throw new Error(`Network ${chainId} not supported`);
      }

      // Validate network compatibility
      const isTestnet = chainId === 11155111; // Sepolia testnet
      const recipientNetworkHint = recipientResolution.metadata?.networkHint;
      
      if (recipientNetworkHint) {
        const isRecipientTestnet = recipientNetworkHint === 11155111;
        if (isTestnet !== isRecipientTestnet) {
          throw new Error(`Network mismatch: You are on ${isTestnet ? 'testnet' : 'mainnet'} but recipient is on ${isRecipientTestnet ? 'testnet' : 'mainnet'}`);
        }
      }

      // Get current ETH price in USD
      const ethPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const ethPriceData = await ethPriceResponse.json();
      const ethPrice = ethPriceData.ethereum.usd;

      // Convert USD amount to ETH
      const usdAmount = parseFloat(amount);
      const ethAmount = usdAmount / ethPrice;
      
      // Convert to Wei
      const weiAmount = web3Nexa.utils.toWei(ethAmount.toString(), 'ether');
      const balance = await web3Nexa.eth.getBalance(from);
      
      console.log('Payment details:', {
        usdAmount,
        ethAmount,
        weiAmount,
        ethPrice,
        balance: balance.toString()
      });

      if (new BN(balance.toString()).lt(new BN(weiAmount))) {
        throw new Error(`Insufficient ETH balance. Required: ${ethAmount.toFixed(6)} ETH ($${usdAmount}), Available: ${web3Nexa.utils.fromWei(balance.toString(), 'ether')} ETH`);
      }

      // Get gas estimate for ETH transfer
      const gasEstimate = await web3Nexa.eth.estimateGas({
        from,
        to: checksummedRecipient,
        value: weiAmount
      });

      // Add 30% buffer to gas estimate
      const gasWithBuffer = Math.floor(Number(gasEstimate.toString()) * 1.3).toString();
      const gasPrice = await web3Nexa.eth.getGasPrice();
      const adjustedGasPrice = Math.floor(Number(gasPrice.toString()) * 1.1).toString();

      console.log('Sending ETH with params:', {
        gas: gasWithBuffer,
        gasPrice: adjustedGasPrice,
        from,
        to: checksummedRecipient,
        value: weiAmount
      });

      try {
        // Send ETH
        const receipt = await web3Nexa.eth.sendTransaction({
          from,
          to: checksummedRecipient,
          value: weiAmount,
          gas: gasWithBuffer,
          gasPrice: adjustedGasPrice
        });

        console.log('Transaction successful:', receipt);
        toast.success('Payment sent successfully!');

        // Update request status if this was a payment for a request
        if (requestId) {
          try {
            const response = await fetch(`/api/requests/${requestId}/approve`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                txHash: receipt.transactionHash,
                amount: usdAmount
              })
            });

            if (!response.ok) {
              console.error('Failed to update request status');
            }
          } catch (err) {
            console.error('Error updating request status:', err);
          }
        }

        onSuccess?.();

        // Attempt to get recipient's user ID from their wallet address for transaction storage
        let recipientUserId = null;
        try {
          const recipientRes = await fetch('/api/resolve-identifier', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'address',
              value: checksummedRecipient
            })
          });

          if (recipientRes.ok) {
            const data = await recipientRes.json();
            recipientUserId = data.userId || null;
          }
        } catch (err) {
          console.error('Failed to resolve recipient user ID:', err);
        }

        // Store transaction in database, even if user ID is not resolved
        try {
          const originalAmount = usdAmount;
          const feeAmount = usdAmount * 0.05; // 5% fee
          const netAmount = usdAmount - feeAmount;
          
          const requestBody = {
            amount: netAmount, // Amount after fee deduction
            originalAmount: originalAmount, // Original amount before fee
            feeAmount: feeAmount, // Fee amount deducted
            recipientId: recipientUserId || checksummedRecipient, // Use wallet address as fallback
            type: 'sent',
            status: 'completed',
            txHash: receipt.transactionHash,
            currency: 'ETH',
            network: chainId,
            senderId: currentUserId,
            createdAt: new Date().toISOString()
          };
          console.log('Storing transaction with body:', requestBody);
          const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure cookies are sent with the request
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to store transaction:', errorText, 'Status:', response.status);
            if (response.status === 401) {
              toast.error('Transaction completed but failed to save record due to authentication issue. Please log in again.');
            } else {
              toast.error(`Transaction completed but failed to save record: ${errorText}`);
            }
          } else {
            toast.success(`Payment of $${originalAmount} sent successfully (Fee: $${feeAmount.toFixed(2)})`);
            setMerchant('');
            setAmount('');
            setReference('');
            
            // Close the modal if onClose is provided
            if (typeof onClose === 'function') {
              onClose();
            }
          }
        } catch (dbError) {
          console.error('Error storing transaction:', dbError);
          toast.error('Transaction completed but failed to save record');
        }

        return;
      } catch (err: any) {
        console.error('ETH transfer failed:', err);
        throw new Error(`Payment failed: ${err.message}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Payment failed: ${message}`);
    } finally {
      setSending(false);
    }
  }, [recipientResolution, amount, reference, onClose, currentUserId, onSuccess, requestId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-[#18192b] rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          onClick={onClose}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-6">Send Payment</h2>
        <form onSubmit={handleSend} className="flex flex-col gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold mb-2">Recipient</label>
              <div className="flex gap-2">
                <select 
                  value={identifierType} 
                  onChange={e => {
                    setIdentifierType(e.target.value as IdentifierType);
                    setRecipientInput("");
                    setRecipientStatus(RecipientStatus.IDLE);
                  }} 
                  className={`w-1/3 rounded-xl border px-4 py-3 bg-gray-50 dark:bg-[#232946] ${isDarkMode ? 'text-[#F9F9FB] border-white/10' : 'text-[#111827] border-gray-200'}`}
                >
                  {IDENTIFIER_TYPES_LIST.map(type => (
                    <option value={type.value} key={type.value}>{type.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={recipientInput}
                  onChange={(e) => {
                    const input = e.target.value;
                    setRecipientInput(input);
                    setRecipientStatus(RecipientStatus.SEARCHING);
                    setRecipientResolution(null);
                  }}
                  placeholder={identifierType === IdentifierType.USERNAME ? "Enter username" : identifierType === IdentifierType.USER_ID ? "Enter user code" : "Enter wallet address, username, or ENS"}
                  className={`w-2/3 rounded-xl border px-4 py-3 bg-gray-50 dark:bg-[#232946] ${isDarkMode ? 'text-[#F9F9FB] border-white/10' : 'text-[#111827] border-gray-200'} ${recipientStatus === RecipientStatus.FOUND ? 'border-green-500' : recipientStatus === RecipientStatus.NOT_FOUND ? 'border-red-500' : ''}`}
                  required
                />
              </div>
              {recipientStatus === RecipientStatus.SEARCHING && (
                <div className="text-sm text-gray-500 mt-1">Validating recipient...</div>
              )}
              {recipientStatus === RecipientStatus.FOUND && recipientResolution?.type != null && recipientResolution?.address != null && (
                <div className="text-sm text-green-500 mt-1">
                  Found user: {String(recipientResolution.type ?? '')}: {String(recipientResolution.address ?? '')}
                  {recipientResolution.metadata && typeof recipientResolution.metadata.networkHint === 'number'
                    ? ` (${getNetworkName(recipientResolution.metadata.networkHint)})`
                    : ''}
                </div>
              )}
              {recipientStatus === RecipientStatus.NOT_FOUND && (
                <div className="text-sm text-red-500 mt-1">User not found</div>
              )}
              {!isNetworkCompatible && recipientStatus === RecipientStatus.FOUND && networkErrorMessage && (
                <div className="text-sm text-red-500 mt-1">
                  {networkErrorMessage}
                </div>
              )}
            </div>

            <div>
              <label className="block text-base font-semibold mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                className={`w-full rounded-xl border px-4 py-3 bg-gray-50 dark:bg-[#232946] ${isDarkMode ? 'text-[#F9F9FB] border-white/10' : 'text-[#111827] border-gray-200'}`}
                required
              />
              {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-[#232946] rounded-lg border border-gray-200 dark:border-white/10">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between mb-1">
                      <span>Payment Amount:</span>
                      <span className="font-medium">${Number(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-1 text-orange-600 dark:text-orange-400">
                      <span>Platform Fee (5%):</span>
                      <span className="font-medium">-${(Number(amount) * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-white/10">
                      <span className="font-semibold">Recipient Receives:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        ${(Number(amount) * 0.95).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-base font-semibold mb-2">Reference <span className="text-gray-400 text-xs">(optional)</span></label>
              <input
                type="text"
                value={reference}
                onChange={e => setReference(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 bg-gray-50 dark:bg-[#232946] ${isDarkMode ? 'text-[#F9F9FB] border-white/10' : 'text-[#111827] border-gray-200'}`}
                placeholder="Order ID, Invoice, etc."
              />
            </div>

            <div className="text-center text-base font-semibold mb-2">
              {getChainName(srcChainId)} <span className="mx-2">→</span> {recipientInput && recipientResolution?.address ? recipientNetworkType : ''}
            </div>

            {usdValue && (
              <div className="text-sm text-gray-500">
                <span className="font-medium">Amount in ETH:</span> {ethAmount ? `${ethAmount.toFixed(6)} ETH` : 'Calculating...'}
              </div>
            )}
            {ethPrice && (
              <div className="text-sm text-gray-500">
                <span className="font-medium">Current ETH Price:</span> ${ethPrice.toFixed(2)}
                {priceError && <span className="text-red-500 ml-2">({priceError})</span>}
              </div>
            )}
            {usdValue && (
              <div className="text-xs text-blue-400">
                ≈ {usdValue} USD
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:from-[#6B51EF] hover:to-[#9771FA] transition-all focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/40 disabled:opacity-60"
            disabled={sending || recipientStatus !== RecipientStatus.FOUND || !amount || isNaN(Number(amount)) || Number(amount) <= 0 || !isNetworkCompatible}
          >
            {sending ? "Sending..." : "Send Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
