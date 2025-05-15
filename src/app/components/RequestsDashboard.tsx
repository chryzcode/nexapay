import { useEffect, useState } from "react";

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
  };
  recipient?: {
    username: string;
    userCode: string;
  };
}

interface Props {
  currentUserId: string;
}

export default function RequestsDashboard({ currentUserId }: Props) {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/requests", { method: "GET" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch requests");
        setRequests(data.requests || []);
      } catch (err: unknown) {
        let msg = "Failed to fetch requests";
        if (err instanceof Error) msg = err.message;
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [currentUserId]);

  // Add actions for approve/pay/reject and show usernames/userCodes
  const handleReject = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    try {
      const res = await fetch(`/api/requests/${requestId}/reject`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reject request');
      setRequests(reqs => reqs.map(r => r._id === requestId ? { ...r, status: 'rejected' } : r));
    } catch (err: any) {
      setError(err.message || 'Failed to reject request');
    }
  };

  const handlePay = (request: RequestItem) => {
    // Trigger PaymentForm modal with request details (integration needed in Dashboard)
    window.dispatchEvent(new CustomEvent('openPaymentModalWithRequest', { detail: request }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-16 bg-white dark:bg-[#18192b] rounded-3xl shadow-2xl border border-white/10 p-8 relative">
      <h2 className="text-3xl font-bold mb-6 text-[#7B61FF] tracking-tight">Money Requests</h2>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : requests.length === 0 ? (
        <div className="text-gray-400">No requests found.</div>
      ) : (
        <table className="w-full text-base">
          <thead>
            <tr className="bg-[#f3f0ff] dark:bg-[#232946]">
              <th className="p-3 text-left rounded-tl-xl">From</th>
              <th className="p-3 text-left">To</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-left">Note</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Date</th>
              <th className="p-3 text-center rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id} className="border-b border-white/10 last:border-b-0">
                <td className="p-3">
                  <span className="font-semibold text-[#7B61FF]">{req.sender?.username || req.senderId}</span>
                  <span className="ml-2 text-xs text-gray-400">({req.sender?.userCode || ''})</span>
                </td>
                <td className="p-3">
                  <span className="font-semibold text-[#7B61FF]">{req.recipient?.username || req.recipientIdentifier}</span>
                  <span className="ml-2 text-xs text-gray-400">({req.recipient?.userCode || ''})</span>
                </td>
                <td className="p-3 text-right font-mono">{req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="p-3 max-w-xs truncate">{req.note}</td>
                <td className="p-3 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{req.status}</span>
                </td>
                <td className="p-3 text-center">{new Date(req.createdAt).toLocaleString()}</td>
                <td className="p-3 text-center">
                  {req.status === 'pending' && req.recipientIdentifier === currentUserId && (
                    <>
                      <button className="bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white px-4 py-1 rounded-lg mr-2 hover:opacity-90 transition" onClick={() => handlePay(req)}>Pay</button>
                      <button className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition" onClick={() => handleReject(req._id)}>Reject</button>
                    </>
                  )}
                  {req.status === 'pending' && req.senderId === currentUserId && (
                    <span className="text-xs text-gray-400">Waiting</span>
                  )}
                  {req.status !== 'pending' && (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
