import { useState } from "react";
import { useTheme } from "../providers/ThemeProvider";

interface Props {
  onClose: () => void;
  onRequestSent?: () => void;
}

export default function RequestMoneyForm({ onClose, onRequestSent }: Props) {
  const { isDarkMode } = useTheme();
  const [recipient, setRecipient] = useState("");
  const [identifierType, setIdentifierType] = useState("username");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function getInputClass() {
    return `w-full rounded-xl border px-4 py-3 bg-gray-50 dark:bg-[#232946] text-base ${isDarkMode ? 'text-[#F9F9FB] border-white/10' : 'text-[#111827] border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/40`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!recipient || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid recipient and amount.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient,
          identifierType,
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
      if (onRequestSent) onRequestSent();
    } catch (err: any) {
      setError(err.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white dark:bg-[#18192b] rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/10 relative glass-card`}>
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
        <h3 className="text-3xl font-extrabold mb-6 text-[#7B61FF] tracking-tight text-center">Request Money</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-base font-semibold mb-2">Recipient</label>
            <div className="flex gap-2">
              <select value={identifierType} onChange={e => setIdentifierType(e.target.value)} className={`rounded-xl border px-4 py-3 bg-gray-50 dark:bg-[#232946] ${isDarkMode ? 'text-[#F9F9FB] border-white/10' : 'text-[#111827] border-gray-200'}` }>
                <option value="username">Username</option>
                <option value="userId">User ID</option>
              </select>
              <input
                type="text"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder={identifierType === "username" ? "Enter username" : "Enter user ID"}
                className={getInputClass()}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-base font-semibold mb-2">Amount</label>
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
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
