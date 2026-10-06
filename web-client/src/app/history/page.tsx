/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthToken } from '../../utils/api';
import Navbar from '../../components/Navbar';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Loading02Icon, 
  ArrowRight02Icon,
  RefreshIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon
} from '@hugeicons/core-free-icons';

export default function HistoryPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthChecked(true);
      // eslint-disable-next-line react-hooks/immutability
      fetchLogs();
    }
  }, [router]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getLogs(50);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <HugeiconsIcon icon={Loading02Icon} className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">CBN Underwriting Audit Log</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PostgreSQL Immutable Trail
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Audit trail of credit decision evaluations persisted in system logs.</p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white rounded-xl transition-all disabled:opacity-50 font-semibold hover:border-slate-700"
          >
            <HugeiconsIcon icon={RefreshIcon} className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Audit Logs'}</span>
          </button>
        </div>

        {loading && logs.length === 0 ? (
          <div className="flex justify-center items-center py-24">
            <HugeiconsIcon icon={Loading02Icon} className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto border border-slate-800/80 rounded-2xl bg-slate-900/30 backdrop-blur-xl shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800/80 font-semibold uppercase tracking-wider">
                  <th className="p-4">Log ID</th>
                  <th className="p-4">Monthly Income (₦)</th>
                  <th className="p-4">Facility Requested (₦)</th>
                  <th className="p-4">CRC Credit Bureau</th>
                  <th className="p-4">CBN Decision</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => router.push(`/history/${log.id}`)}
                    className="hover:bg-slate-900/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-mono text-slate-400 group-hover:text-slate-200 transition-colors">
                      {log.id.slice(0, 8)}...
                    </td>
                    <td className="p-4 font-mono font-medium text-emerald-400">
                      {formatNGN((log.input?.ApplicantIncome ?? 0) * 100)}
                    </td>
                    <td className="p-4 font-mono font-bold text-white">
                      {formatNGN((log.input?.LoanAmount ?? 0) * 100000)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border font-medium ${
                        log.input?.Credit_History === 1 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {log.input?.Credit_History === 1 ? 'Good Record' : 'Delinquent'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                        log.eligible 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {log.eligible ? (
                          <>
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3 h-3" /> APPROVED
                          </>
                        ) : (
                          <>
                            <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" /> REJECTED
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-white">
                      {Math.round(log.probability * 100)}%
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1.5 text-slate-400 group-hover:text-emerald-400 transition-colors font-semibold">
                        <span>View Audit</span>
                        <HugeiconsIcon icon={ArrowRight02Icon} className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 border border-slate-800/80 rounded-2xl bg-slate-950/40 text-slate-400 text-xs italic">
            No audit records found. Run a credit assessment on the NGN calculator page to populate decision logs.
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/60 py-6 bg-slate-950 text-center text-xs text-slate-400 mt-auto">
        <p>© 2026 CSBank Nigeria Ltd. Internal credit auditing tool.</p>
      </footer>
    </div>
  );
}
