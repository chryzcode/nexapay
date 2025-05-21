import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTheme } from "../providers/ThemeProvider";
import Web3 from 'web3';
import BN from 'bn.js';
import { ethers } from "ethers";
import { stargateSwap, LZ_CHAIN_IDS, STARGATE_ROUTER_ADDRESSES } from "./stargate";

// NexaPayPayment contract ABI
const NEXAPAY_ABI = [
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
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "supportedTokens",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract address from environment variable
const NEXAPAY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NEXAPAY_CONTRACT;

interface RequestItem {
  _id: string;
  senderId: string;
  recipientIdentifier: string;
  identifierType: string;
  amount: number;
  note: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    username: string;
    userCode: string;
    id: string;
    walletAddress?: string;
  };
  recipient?: {
    username: string;
    userCode: string;
    id: string;
  };
}

interface Props {
  currentUserId: string;
}

export default function RequestsDashboard({ currentUserId }: Props) {
  const { isDarkMode } = useTheme();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch requests");
      console.log('Fetched requests:', data.requests);
      console.log('Current user ID:', currentUserId);
      setRequests(data.requests || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch requests");
      toast.error(err.message || "Failed to fetch requests", {
        position: "bottom-center",
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '16px',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUserId]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchRequests();
    };

    window.addEventListener("refreshRequests", handleRefresh);
    return () => window.removeEventListener("refreshRequests", handleRefresh);
  }, []);

  const handleAccept = async (request: RequestItem) => {
    try {
      setProcessingRequestId(request._id);

      if (!NEXAPAY_CONTRACT_ADDRESS) {
        throw new Error('Contract address not configured');
      }

      // 1. Get the authenticated user's wallet (payer)
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to make payments');
      }

      const web3 = new Web3(window.ethereum);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const payerAddress = accounts[0];

      // 2. Get the requester's wallet address (recipient)
      let recipientAddress = request.sender?.walletAddress;
      if (!recipientAddress) {
        const senderRes = await fetch(`/api/wallet/connect?userId=${request.senderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });

        if (!senderRes.ok) {
          const errorData = await senderRes.json();
          throw new Error(errorData.error || 'Failed to get sender wallet address');
        }

        const data = await senderRes.json();
        recipientAddress = data.walletAddress;
      }

      if (!recipientAddress) {
        throw new Error('Sender has not connected their wallet');
      }

      // Validate recipient address
      if (!web3.utils.isAddress(recipientAddress)) {
        throw new Error(`Invalid recipient address format: ${recipientAddress}`);
      }
      const checksummedRecipient = web3.utils.toChecksumAddress(recipientAddress);

      // 3. Get current ETH price in USD
      const ethPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const ethPriceData = await ethPriceResponse.json();
      const ethPrice = ethPriceData.ethereum.usd;

      // 4. Convert USD amount to ETH
      const usdAmount = request.amount;
      const ethAmount = usdAmount / ethPrice;
      
      // 5. Convert to Wei
      const weiAmount = web3.utils.toWei(ethAmount.toString(), 'ether');
      const balance = await web3.eth.getBalance(payerAddress);
      
      if (new BN(balance.toString()).lt(new BN(weiAmount))) {
        throw new Error(`Insufficient ETH balance. Required: ${ethAmount.toFixed(6)} ETH ($${usdAmount}), Available: ${web3.utils.fromWei(balance, 'ether')} ETH`);
      }

      // 6. Get current network and destination network
      const srcChainId = Number(await web3.eth.getChainId());
      const dstChainId = srcChainId; // For now, use same chain. Can be updated based on recipient's network

      let receipt;
      if (srcChainId !== dstChainId) {
        // Use Stargate for cross-chain payment
        receipt = await stargateSwap({
          provider,
          srcChainId,
          dstChainId,
          srcPoolId: 1, // ETH pool ID
          dstPoolId: 1, // ETH pool ID
          amount: weiAmount,
          recipient: checksummedRecipient,
          minAmount: 0 // No minimum amount required
        });
      } else {
        // Use smart contract for same-chain payment
        const contract = new web3.eth.Contract(NEXAPAY_ABI, NEXAPAY_CONTRACT_ADDRESS);
        
        // Check if ETH is supported
        const ethAddress = "0x0000000000000000000000000000000000000000";
        const isEthSupported = await contract.methods.supportedTokens(ethAddress).call();
        
        if (!isEthSupported) {
          // If ETH is not supported, fall back to direct transfer
          console.log('ETH not supported by contract, using direct transfer');
          const gasEstimate = await web3.eth.estimateGas({
            from: payerAddress,
            to: checksummedRecipient,
            value: weiAmount
          });

          const gasWithBuffer = Math.floor(Number(gasEstimate.toString()) * 1.3).toString();
          const gasPrice = await web3.eth.getGasPrice();
          const adjustedGasPrice = Math.floor(Number(gasPrice.toString()) * 1.1).toString();

          receipt = await web3.eth.sendTransaction({
            from: payerAddress,
            to: checksummedRecipient,
            value: weiAmount,
            gas: gasWithBuffer,
            gasPrice: adjustedGasPrice
          });
        } else {
          // Use contract for payment
          const gasEstimate = await contract.methods.pay(
            ethAddress,
            checksummedRecipient,
            weiAmount,
            `Request payment: ${request._id}`
          ).estimateGas({ from: payerAddress, value: weiAmount });

          const gasWithBuffer = Math.floor(Number(gasEstimate.toString()) * 1.3).toString();
          const gasPrice = await web3.eth.getGasPrice();
          const adjustedGasPrice = Math.floor(Number(gasPrice.toString()) * 1.1).toString();

          console.log('Sending payment with params:', {
            gas: gasWithBuffer,
            gasPrice: adjustedGasPrice,
            from: payerAddress,
            to: NEXAPAY_CONTRACT_ADDRESS,
            value: weiAmount
          });

          receipt = await contract.methods.pay(
            ethAddress,
            checksummedRecipient,
            weiAmount,
            `Request payment: ${request._id}`
          ).send({
            from: payerAddress,
            value: weiAmount,
            gas: gasWithBuffer,
            gasPrice: adjustedGasPrice
          });
        }
      }

      console.log('Transaction successful:', receipt);

      // 7. Update request status
      const response = await fetch(`/api/requests/${request._id}/approve`, {
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
        throw new Error('Failed to update request status');
      }

      // 8. Store transaction in database
      const txResponse = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: usdAmount,
          recipientId: request.senderId,
          type: 'sent',
          status: 'completed',
          txHash: receipt.transactionHash,
          currency: 'ETH',
          network: srcChainId,
          senderId: currentUserId,
          createdAt: new Date().toISOString()
        }),
      });

      if (!txResponse.ok) {
        console.error('Failed to store transaction record');
      }

      // 9. Show success message and refresh requests
      toast.success(`Payment of $${usdAmount} sent successfully!`, {
        position: "bottom-center",
        style: {
          background: '#10B981',
          color: '#fff',
          borderRadius: '8px',
          padding: '16px',
        },
      });

      // Refresh the requests list
      fetchRequests();

    } catch (err: any) {
      toast.error(err.message || 'Failed to process payment', {
        position: "bottom-center",
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '16px',
        },
      });
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectClick = (requestId: string) => {
    setRequestToReject(requestId);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!requestToReject) return;
    
    try {
      const res = await fetch(`/api/requests/${requestToReject}/reject`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reject request');
      setRequests(reqs => reqs.map(r => r._id === requestToReject ? { ...r, status: 'rejected' } : r));
      toast.success('Request rejected successfully', {
        position: "bottom-center",
        style: {
          background: '#10B981',
          color: '#fff',
          borderRadius: '8px',
          padding: '16px',
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to reject request');
      toast.error(err.message || 'Failed to reject request', {
        position: "bottom-center",
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '16px',
        },
      });
    } finally {
      setShowRejectModal(false);
      setRequestToReject(null);
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto mt-12 mb-16 bg-white dark:bg-[#18192b] rounded-3xl shadow-2xl border border-white/10 p-8 relative">
        <h2 className="text-3xl font-bold mb-6 text-[#7B61FF] tracking-tight">Money Requests</h2>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="text-gray-400">No requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base min-w-[1000px]">
              <thead>
                <tr className="bg-[#f3f0ff] dark:bg-[#232946]">
                  <th className="p-3 text-left rounded-tl-xl whitespace-nowrap">From</th>
                  <th className="p-3 text-left whitespace-nowrap">To</th>
                  <th className="p-3 text-right whitespace-nowrap">Amount (USD)</th>
                  <th className="p-3 text-left whitespace-nowrap">Note</th>
                  <th className="p-3 text-center whitespace-nowrap">Status</th>
                  <th className="p-3 text-center whitespace-nowrap">Date</th>
                  <th className="p-3 text-center rounded-tr-xl whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => {
                  const isProcessing = processingRequestId === req._id;
                  console.log('Request details:', {
                    requestId: req._id,
                    recipientIdentifier: req.recipientIdentifier,
                    recipient: req.recipient,
                    currentUserId,
                    isRecipient: req.recipientIdentifier === currentUserId,
                    isRecipientByCode: req.recipient?.userCode === currentUserId,
                    isRecipientByUsername: req.recipient?.username === currentUserId
                  });
                  return (
                    <tr key={req._id} className="border-b border-white/10 last:border-b-0">
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-semibold text-[#7B61FF]">{req.sender?.username || req.senderId}</span>
                        <span className="ml-2 text-xs text-gray-400">({req.sender?.userCode || ''})</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-semibold text-[#7B61FF]">{req.recipient?.username || req.recipientIdentifier}</span>
                        <span className="ml-2 text-xs text-gray-400">({req.recipient?.userCode || ''})</span>
                      </td>
                      <td className="p-3 text-right font-mono whitespace-nowrap">
                        ${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                      </td>
                      <td className="p-3 whitespace-nowrap max-w-xs">
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {req.note || '-'}
                        </p>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{req.status}</span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">{new Date(req.createdAt).toLocaleString()}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {req.status === 'pending' && (
                          <div className="flex gap-2 justify-center">
                            {(req.recipientIdentifier === currentUserId || 
                              req.recipient?.id === currentUserId || 
                              req.recipient?.userCode === currentUserId || 
                              req.recipient?.username === currentUserId) && (
                              <>
                                <button
                                  onClick={() => handleAccept(req)}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 text-sm border border-green-500/20 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {isProcessing ? "Processing..." : "Accept"}
                                </button>
                                <button
                                  onClick={() => handleRejectClick(req._id)}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 text-sm border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {req.senderId === currentUserId && (
                              <span className="text-gray-500 dark:text-gray-400">-</span>
                            )}
                          </div>
                        )}
                        {req.status !== 'pending' && (
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#18192b] rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Reject Request</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to reject this money request? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRequestToReject(null);
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
