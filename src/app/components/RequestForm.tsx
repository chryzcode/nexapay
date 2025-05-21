import React, { useState } from 'react';

interface RequestFormProps {
  onRequestCreated?: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ onRequestCreated }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        amount: Number(amount),
        recipient: '6806c4ce7e1c52ab84944bf5',
        identifierType: 'userId',
        note: note.trim()
      };

      console.log('Sending request with data:', payload);

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        setSuccess(true);
        setAmount('');
        setNote('');
        setRecipientIdentifier('');
        
        // Trigger refresh of requests list
        if (onRequestCreated) {
          onRequestCreated();
        }
      } else {
        setError(data.error || 'An error occurred. Please try again later.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="recipientIdentifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Recipient
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="recipientIdentifier"
            id="recipientIdentifier"
            value={recipientIdentifier}
            onChange={(e) => setRecipientIdentifier(e.target.value)}
            className="block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter username or user code"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount (USD)
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            name="amount"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">USD</span>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Note (Optional)
        </label>
        <div className="mt-1">
          <textarea
            id="note"
            name="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="Add a note to your request..."
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {success && (
        <div className="text-green-500 text-sm">Request sent successfully!</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Sending Request...' : 'Send Request'}
      </button>
    </form>
  );
};

export default RequestForm; 