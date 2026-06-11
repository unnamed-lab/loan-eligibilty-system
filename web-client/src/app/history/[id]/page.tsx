'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthToken } from '../../../utils/api';
import Navbar from '../../../components/Navbar';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Layers,
  Sparkles,
  Calendar,
  ChevronLeft
} from 'lucide-react';

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
      setAuthChecked(true);
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

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!log) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Back Link */}
        <button
          onClick={() => router.push('/history')}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Audit Logs</span>
        </button>

        <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Audit Log Detail</h2>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Record ID: {log.id}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Model Version</span>
              <p className="text-xs font-mono text-slate-350">{log.modelVersion}</p>
            </div>
          </div>

          {/* Verdict Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-slate-950 border border-slate-850 rounded-xl gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl border ${
                log.eligible 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {log.eligible ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Verdict</p>
                <p className="text-lg font-black text-white uppercase tracking-wide">
                  {log.eligible ? 'APPROVED' : 'REJECTED'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-center sm:text-right">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Eligibility Confidence</p>
                <p className="text-xl font-black text-white">
                  {Math.round(log.probability * 100)}%
                </p>
              </div>
              <div className="text-xs text-slate-500 border-l border-slate-800 pl-4 text-left">
                Latency: <span className="font-semibold text-slate-300">{log.inferenceLatencyMs?.toFixed(2) ?? 0} ms</span>
              </div>
            </div>
          </div>

          {/* Input Features */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Input Parameters</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-950/40 p-5 border border-slate-855 rounded-xl text-xs">
              <div>
                <span className="text-slate-500">Gender</span>
                <p className="text-slate-250 font-semibold mt-0.5">{log.input?.Gender}</p>
              </div>
              <div>
                <span className="text-slate-500">Married</span>
                <p className="text-slate-250 font-semibold mt-0.5">{log.input?.Married}</p>
              </div>
              <div>
                <span className="text-slate-500">Dependents</span>
                <p className="text-slate-250 font-semibold mt-0.5">{log.input?.Dependents}</p>
              </div>
              <div>
                <span className="text-slate-500">Education</span>
                <p className="text-slate-250 font-semibold mt-0.5">{log.input?.Education}</p>
              </div>
              <div>
                <span className="text-slate-500">Self Employed</span>
                <p className="text-slate-250 font-semibold mt-0.5">{log.input?.Self_Employed}</p>
              </div>
              <div>
                <span className="text-slate-500">Property Area</span>
                <p className="text-slate-250 font-semibold mt-0.5">{log.input?.Property_Area}</p>
              </div>
              <div>
                <span className="text-slate-500">Applicant Income</span>
                <p className="text-slate-250 font-semibold mt-0.5">${log.input?.ApplicantIncome}</p>
              </div>
              <div>
                <span className="text-slate-500">Coapplicant Income</span>
                <p className="text-slate-250 font-semibold mt-0.5">${log.input?.CoapplicantIncome}</p>
              </div>
              <div>
                <span className="text-slate-500">Loan Amount</span>
                <p className="text-slate-250 font-semibold mt-0.5">${log.input?.LoanAmount}k</p>
              </div>
              <div>
                <span className="text-slate-500">Loan Term</span>
                <p className="text-slate-250 font-semibold mt-0.5">{log.input?.Loan_Amount_Term} months</p>
              </div>
              <div>
                <span className="text-slate-500">Credit History</span>
                <p className="text-slate-250 font-semibold mt-0.5">{log.input?.Credit_History === 1 ? 'Good History' : 'Poor/No History'}</p>
              </div>
            </div>
          </div>

          {/* Explanations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-500" />
              <span>Explainability Factors</span>
            </h3>

            {log.reasons && log.reasons.length > 0 ? (
              <div className="space-y-2">
                {log.reasons.map((reason: string, idx: number) => {
                  const isPositive = reason.includes('increased') || reason.includes('good');
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 p-3 border rounded-xl text-xs leading-relaxed ${
                        isPositive
                          ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                          : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 shrink-0 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 shrink-0 text-rose-500" />
                      )}
                      <span>{reason}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-slate-550 italic text-xs leading-relaxed">
                No explainability factors were stored with this log.
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center gap-2 text-[10px] text-slate-500 border-t border-slate-800 pt-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>Audit record created on {new Date(log.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 bg-slate-900/10 text-center text-xs text-slate-600 mt-auto">
        <p>© 2026 CSBank. Internal auditing details.</p>
      </footer>
    </div>
  );
}
