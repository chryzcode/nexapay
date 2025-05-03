import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useTheme } from "../providers/ThemeProvider";
import { useEffect, useState } from "react";

interface Transaction {
  amount: number;
  type: string; // 'sent' | 'received' | ...
  status: string;
  createdAt: string;
  sender: string;
  recipient: string;
}

interface DashboardAnalyticsProps {
  transactions: Transaction[];
}

export default function DashboardAnalytics({ transactions }: DashboardAnalyticsProps) {
  const { isDarkMode } = useTheme();

  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    received: 0,
    avgSent: 0,
    avgReceived: 0,
    largestSent: 0,
    largestReceived: 0,
  });
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setChartData([]);
      setStats({ total: 0, sent: 0, received: 0, avgSent: 0, avgReceived: 0, largestSent: 0, largestReceived: 0 });
      setDuration('No transactions yet');
      return;
    }
    const groups: Record<string, { Sent: number; Received: number }> = {};
    let sent = 0, received = 0, largestSent = 0, largestReceived = 0;
    let minDate = new Date(transactions[0].createdAt);
    let maxDate = new Date(transactions[0].createdAt);
    transactions.forEach(tx => {
      const date = new Date(tx.createdAt);
      if (date < minDate) minDate = date;
      if (date > maxDate) maxDate = date;
      const month = date.toLocaleString('default', { month: 'short' });
      if (!groups[month]) groups[month] = { Sent: 0, Received: 0 };
      if (tx.type === 'sent') {
        groups[month].Sent += tx.amount;
        sent += tx.amount;
        if (tx.amount > largestSent) largestSent = tx.amount;
      } else if (tx.type === 'received') {
        groups[month].Received += tx.amount;
        received += tx.amount;
        if (tx.amount > largestReceived) largestReceived = tx.amount;
      }
    });
    const chartArr = Object.entries(groups).map(([name, vals]) => ({ name, ...vals }));
    const months = chartArr.length || 1;
    setChartData(chartArr);
    setStats({
      total: sent + received,
      sent,
      received,
      avgSent: Math.round(sent / months),
      avgReceived: Math.round(received / months),
      largestSent,
      largestReceived,
    });
    // Duration display
    if (minDate.getTime() === maxDate.getTime()) {
      setDuration(minDate.toLocaleDateString());
    } else {
      setDuration(`${minDate.toLocaleDateString()} — ${maxDate.toLocaleDateString()}`);
    }
  }, [transactions]);

  return (
    <div className={`w-full h-64 bg-white/40 dark:bg-[#18192b]/60 rounded-2xl shadow-lg p-4 border border-white/10 flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-[#7B61FF]">Transaction Analytics</h3>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold bg-[#7B61FF]/10 text-[#7B61FF] px-3 py-1 rounded-full">Total: {stats.total}</span>
          <span className="text-xs font-semibold bg-[#A78BFA]/10 text-[#7B61FF] px-3 py-1 rounded-full">Sent: {stats.sent}</span>
          <span className="text-xs font-semibold bg-[#7B61FF]/10 text-[#A78BFA] px-3 py-1 rounded-full">Received: {stats.received}</span>
          <span className="text-xs font-medium bg-[#232946]/5 text-[#232946] dark:text-gray-200 px-2 py-1 rounded ml-2">{duration}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mb-2">
        <span className="text-xs bg-[#7B61FF]/10 text-[#7B61FF] px-2 py-1 rounded">Avg Sent/mo: {stats.avgSent}</span>
        <span className="text-xs bg-[#A78BFA]/10 text-[#A78BFA] px-2 py-1 rounded">Avg Rec/mo: {stats.avgReceived}</span>
        <span className="text-xs bg-[#7B61FF]/10 text-[#7B61FF] px-2 py-1 rounded">Largest Sent: {stats.largestSent}</span>
        <span className="text-xs bg-[#A78BFA]/10 text-[#A78BFA] px-2 py-1 rounded">Largest Rec: {stats.largestReceived}</span>
      </div>
      <ResponsiveContainer width="100%" height="75%">
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#2D2E4A' : '#e7e7f6'} />
          <XAxis dataKey="name" stroke={isDarkMode ? '#c7c7f7' : '#232946'} />
          <YAxis stroke={isDarkMode ? '#c7c7f7' : '#232946'} />
          <Tooltip contentStyle={{ background: isDarkMode ? '#232946' : '#fff', borderRadius: 12, border: 'none' }} />
          <Legend />
          <Bar dataKey="Sent" fill="#7B61FF" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Received" fill="#A78BFA" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
