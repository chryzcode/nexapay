import { useState, useEffect } from "react";
import { useTheme } from "../providers/ThemeProvider";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import Web3 from "web3";

interface Props {
  onClose: () => void;
  onRequestSent?: () => void;
  onSuccess?: () => void;
  currentUserId: string;
}

enum RecipientStatus {
  IDLE = 'idle',
  SEARCHING = 'searching',
  FOUND = 'found',
  NOT_FOUND = 'not_found',
  ERROR = 'error'
}

export default function RequestMoneyForm({ onClose, onRequestSent, onSuccess, currentUserId }: Props) {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { account, connectWallet, isConnecting } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [identifierType, setIdentifierType] = useState("username");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [recipientStatus, setRecipientStatus] = useState<RecipientStatus>(RecipientStatus.IDLE);
  const [recipientDetails, setRecipientDetails] = useState<any>(null);
  const [isNetworkCompatible, setIsNetworkCompatible] = useState<boolean>(false);

  // Debounce recipient validation
  useEffect(() => {
    const validateRecipient = async () => {
      if (!recipient) {
        setRecipientStatus(RecipientStatus.IDLE);
        setRecipientDetails(null);
        return;
      }

      setRecipientStatus(RecipientStatus.SEARCHING);
      try {
        const res = await fetch("/api/resolve-identifier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: identifierType,
            value: recipient
          })
        });

        if (!res.ok) {
          throw new Error("Failed to validate recipient");
        }

        const data = await res.json();
        if (data.userId) {
          setRecipientDetails(data);
          setRecipientStatus(RecipientStatus.FOUND);
          setError("");
        } else {
          setRecipientStatus(RecipientStatus.NOT_FOUND);
          setRecipientDetails(null);
          setError("User not found");
        }
      } catch (err) {
        setRecipientStatus(RecipientStatus.ERROR);
        setRecipientDetails(null);
        setError("Failed to validate recipient");
      }
    };

    const timeoutId = setTimeout(validateRecipient, 500);
    return () => clearTimeout(timeoutId);
  }, [recipient, identifierType]);

  // Add network compatibility check
  useEffect(() => {
    const checkNetworkCompatibility = async () => {
      if (!window.ethereum || !recipientDetails?.metadata?.networkHint) {
        setIsNetworkCompatible(false);
        return;
      }

      try {
        const web3 = new Web3(window.ethereum);
        const chainId = Number(await web3.eth.getChainId());
        const isSenderTestnet = chainId === 11155111; // Sepolia testnet
        const recipientNetworkHint = recipientDetails.metadata.networkHint;
        const isRecipientTestnet = recipientNetworkHint === 11155111;
        
        // Prevent testnet to mainnet or mainnet to testnet
        setIsNetworkCompatible(!(isSenderTestnet !== isRecipientTestnet));
      } catch (error) {
        console.error('Error checking network compatibility:', error);
        setIsNetworkCompatible(false);
      }
    };

    checkNetworkCompatibility();
  }, [recipientDetails?.metadata?.networkHint]);

  function getInputClass() {
    return `w-full rounded-xl border px-4 py-3 bg-gray-50 dark:bg-[#232946] text-base ${isDarkMode ? 'text-[#F9F9FB] border-white/10' : 'text-[#111827] border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/40`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (recipientStatus !== RecipientStatus.FOUND) {
      setError("Please enter a valid recipient");
      return;
    }

    if (!isNetworkCompatible) {
      setError("Cannot request between testnet and mainnet");
      return;
    }

    if (recipientDetails.userId === currentUserId) {
      setError("You cannot request money from yourself");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: recipientDetails.userId,
          identifierType: "userId",
          amount: Number(amount),
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send request");
      
      setSuccess(true);
      setRecipient("");
      setAmount("");
      setNote("");
      
      // Show success toast
      toast.success('Money request sent successfully!', {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      
      // Trigger refresh of requests list
      if (onRequestSent) onRequestSent();
      if (onSuccess) onSuccess();
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to send request");
      // Show error toast
      toast.error(err.message || "Failed to send request", {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  }

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
        <h2 className="text-2xl font-bold mb-6">Request Money</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-base font-semibold mb-2">Recipient</label>
            <div className="flex gap-2">
              <select 
                value={identifierType} 
                onChange={e => {
                  setIdentifierType(e.target.value);
                  setRecipient("");
                  setRecipientStatus(RecipientStatus.IDLE);
                }} 
                className={`rounded-xl border px-4 py-3 bg-gray-50 dark:bg-[#232946] ${isDarkMode ? 'text-[#F9F9FB] border-white/10' : 'text-[#111827] border-gray-200'}`}
              >
                <option value="username">Username</option>
                <option value="userCode">User Code</option>
              </select>
              <input
                type="text"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder={identifierType === "username" ? "Enter username" : "Enter user code"}
                className={`${getInputClass()} ${recipientStatus === RecipientStatus.FOUND ? 'border-green-500' : recipientStatus === RecipientStatus.NOT_FOUND ? 'border-red-500' : ''}`}
                required
              />
            </div>
            {recipientStatus === RecipientStatus.SEARCHING && (
              <div className="text-sm text-gray-500 mt-1">Validating recipient...</div>
            )}
            {recipientStatus === RecipientStatus.FOUND && recipientDetails && (
              <div className="text-sm text-green-500 mt-1">
                Found user: {recipientDetails.fullname} (@{recipientDetails.username})
                {recipientDetails.metadata?.networkHint && (
                  <span className="ml-2">
                    ({recipientDetails.metadata.networkHint === 11155111 ? 'Testnet' : 'Mainnet'})
                  </span>
                )}
              </div>
            )}
            {recipientStatus === RecipientStatus.NOT_FOUND && (
              <div className="text-sm text-red-500 mt-1">User not found</div>
            )}
            {!isNetworkCompatible && recipientStatus === RecipientStatus.FOUND && (
              <div className="text-sm text-red-500 mt-1">
                Cannot request between testnet and mainnet
              </div>
            )}
          </div>
          <div>
            <label className="block text-base font-semibold mb-2">Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className={getInputClass()}
              required
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-2">Note <span className="text-gray-400 text-xs">(optional)</span></label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className={getInputClass()}
              placeholder="Add a note (optional)"
            />
          </div>
          {error && <div className="text-red-500 text-sm font-semibold text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm font-semibold text-center">Request sent successfully!</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:from-[#6B51EF] hover:to-[#9771FA] transition-all focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/40 disabled:opacity-60"
            disabled={loading || recipientStatus !== RecipientStatus.FOUND || !amount || isNaN(Number(amount)) || Number(amount) <= 0 || !isNetworkCompatible}
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
