/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthToken } from '../../../utils/api';
import Navbar from '../../../components/Navbar';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  CheckmarkCircle02Icon, 
  Cancel01Icon, 
  Loading02Icon, 
  ArrowUp02Icon, 
  ArrowDown02Icon, 
  Layers01Icon,
  SparklesIcon,
  Calendar01Icon,
  ArrowLeft02Icon,
  InformationCircleIcon
} from '@hugeicons/core-free-icons';

export default function LogDetailsPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const id = params.id;
  const router = useRouter();
  
  const [authChecked, setAuthChecked] = useState(false);
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthChecked(true);
      // eslint-disable-next-line react-hooks/immutability
      fetchLogDetails();
    }
  }, [router]);

  const fetchLogDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getLogDetails(id);
      setLog(data);
    } catch (err) {
      console.error('Failed to load log details', err);
      alert('Failed to load record details');
      router.push('/history');
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

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <HugeiconsIcon icon={Loading02Icon} className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!log) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Back Link */}
        <button
          onClick={() => router.push('/history')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium group"
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Audit Logs</span>
        </button>

        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white tracking-tight">Underwriting Record Details</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  CBN Verified Audit
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-1">Audit ID: {log.id}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Model Version</span>
              <p className="text-xs font-mono text-slate-200 mt-0.5">{log.modelVersion}</p>
            </div>
          </div>

          {/* Verdict Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-slate-950/80 border border-slate-800/80 rounded-xl gap-4 shadow-inner">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl border ${
                log.eligible 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {log.eligible ? <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-6 h-6" /> : <HugeiconsIcon icon={Cancel01Icon} className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Underwriting Verdict</p>
                <p className="text-lg font-black text-white uppercase tracking-wide">
                  {log.eligible ? 'APPROVED' : 'REJECTED'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-center sm:text-right">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Model Approval Probability</p>
                <p className="text-xl font-black text-white font-mono">
                  {Math.round(log.probability * 100)}%
                </p>
              </div>
              <div className="text-xs text-slate-400 border-l border-slate-800 pl-4 text-left font-mono">
                Latency: <span className="font-semibold text-slate-200">{log.inferenceLatencyMs?.toFixed(2) ?? 0} ms</span>
              </div>
            </div>
          </div>

          {/* Input Features */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <HugeiconsIcon icon={Layers01Icon} className="w-4 h-4 text-emerald-400" />
              <span>Assessed Input Parameters</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-950/60 p-5 border border-slate-800/80 rounded-xl text-xs">
              <div>
                <span className="text-slate-400">Gender</span>
                <p className="text-slate-200 font-semibold mt-0.5">{log.input?.Gender}</p>
              </div>
              <div>
                <span className="text-slate-400">Marital Status</span>
                <p className="text-slate-200 font-semibold mt-0.5">{log.input?.Married === 'Yes' ? 'Married' : 'Single'}</p>
              </div>
              <div>
                <span className="text-slate-400">Dependents</span>
                <p className="text-slate-200 font-semibold mt-0.5">{log.input?.Dependents}</p>
              </div>
              <div>
                <span className="text-slate-400">Education</span>
                <p className="text-slate-200 font-semibold mt-0.5">{log.input?.Education}</p>
              </div>
              <div>
                <span className="text-slate-400">Self Employed</span>
                <p className="text-slate-200 font-semibold mt-0.5">{log.input?.Self_Employed}</p>
              </div>
              <div>
                <span className="text-slate-400">Property / Location Zone</span>
                <p className="text-slate-200 font-semibold mt-0.5">{log.input?.Property_Area}</p>
              </div>
              <div>
                <span className="text-slate-400">Monthly Salary (₦)</span>
                <p className="text-emerald-400 font-mono font-semibold mt-0.5">{formatNGN((log.input?.ApplicantIncome ?? 0) * 100)}</p>
              </div>
              <div>
                <span className="text-slate-400">Coapplicant Income (₦)</span>
                <p className="text-slate-200 font-mono font-semibold mt-0.5">{formatNGN((log.input?.CoapplicantIncome ?? 0) * 100)}</p>
              </div>
              <div>
                <span className="text-slate-400">Facility Requested (₦)</span>
                <p className="text-white font-mono font-bold mt-0.5">{formatNGN((log.input?.LoanAmount ?? 0) * 100000)}</p>
              </div>
              <div>
                <span className="text-slate-400">Tenor</span>
                <p className="text-slate-200 font-semibold mt-0.5">{log.input?.Loan_Amount_Term} months</p>
              </div>
              <div>
                <span className="text-slate-400">CRC Bureau Check</span>
                <p className="text-slate-200 font-semibold mt-0.5">{log.input?.Credit_History === 1 ? 'Good History' : 'Delinquent Record'}</p>
              </div>
            </div>
          </div>

          {/* Explanations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-emerald-400" />
              <span>SHAP Explainability Risk Factors</span>
            </h3>

            {log.reasons && log.reasons.length > 0 ? (
              <div className="space-y-2">
                {log.reasons.map((reason: string, idx: number) => {
                  const isPositive = reason.includes('increased') || reason.includes('good') || reason.includes('Good');
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3.5 border rounded-xl text-xs leading-relaxed ${
                        isPositive
                          ? 'bg-emerald-500/5 text-emerald-300 border-emerald-500/15'
                          : 'bg-rose-500/5 text-rose-300 border-rose-500/15'
                      }`}
                    >
                      {isPositive ? (
                        <HugeiconsIcon icon={ArrowUp02Icon} className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                      ) : (
                        <HugeiconsIcon icon={ArrowDown02Icon} className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      )}
                      <span className="font-medium">{reason}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3.5 bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded-xl italic">
                <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 shrink-0" />
                <span>No explainability factors were stored with this log.</span>
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-4 font-mono">
            <HugeiconsIcon icon={Calendar01Icon} className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit record created on {new Date(log.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/60 py-6 bg-slate-950 text-center text-xs text-slate-400 mt-auto">
        <p>© 2026 CSBank Nigeria Ltd. Internal auditing details.</p>
      </footer>
    </div>
  );
}
