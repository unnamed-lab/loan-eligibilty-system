'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthToken } from '../utils/api';
import Navbar from '../components/Navbar';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Info,
  Calculator
} from 'lucide-react';

const DEFAULT_FORM = {
  Gender: 'Male',
  Married: 'Yes',
  Dependents: '0',
  Education: 'Graduate',
  Self_Employed: 'No',
  ApplicantIncome: 5000,
  CoapplicantIncome: 0,
  LoanAmount: 120,
  Loan_Amount_Term: 360,
  Credit_History: 1,
  Property_Area: 'Semiurban'
};

export default function Home() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        ApplicantIncome: Number(formData.ApplicantIncome),
        CoapplicantIncome: Number(formData.CoapplicantIncome),
        LoanAmount: Number(formData.LoanAmount),
        Loan_Amount_Term: Number(formData.Loan_Amount_Term),
        Credit_History: Number(formData.Credit_History)
      };
      const result = await api.predict(payload);
      setPredictionResult(result);
    } catch (err: any) {
      alert(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-3 bg-slate-900/50 border border-slate-900 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Eligibility Calculator</h2>
            <p className="text-xs text-slate-500 mt-1">Input details to check application risk and explainability parameters.</p>
          </div>

          <form onSubmit={handlePredict} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Gender</label>
                <select
                  value={formData.Gender}
                  onChange={(e) => handleFieldChange('Gender', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-sm text-slate-300"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Married</label>
                <select
                  value={formData.Married}
                  onChange={(e) => handleFieldChange('Married', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-sm text-slate-300"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Dependents</label>
                <select
                  value={formData.Dependents}
                  onChange={(e) => handleFieldChange('Dependents', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-sm text-slate-300"
                >
                  <option value="0">0 Dependents</option>
                  <option value="1">1 Dependent</option>
                  <option value="2">2 Dependents</option>
                  <option value="3+">3+ Dependents</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Education</label>
                <select
                  value={formData.Education}
                  onChange={(e) => handleFieldChange('Education', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-sm text-slate-300"
                >
                  <option value="Graduate">Graduate</option>
                  <option value="Not Graduate">Not Graduate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Self Employed</label>
                <select
                  value={formData.Self_Employed}
                  onChange={(e) => handleFieldChange('Self_Employed', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-sm text-slate-300"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Property Area</label>
                <select
                  value={formData.Property_Area}
                  onChange={(e) => handleFieldChange('Property_Area', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-sm text-slate-300"
                >
                  <option value="Semiurban">Semiurban</option>
                  <option value="Urban">Urban</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Credit History Status</label>
                <select
                  value={formData.Credit_History}
                  onChange={(e) => handleFieldChange('Credit_History', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-sm text-slate-300"
                >
                  <option value={1}>Good History (Approved credit check)</option>
                  <option value={0}>Poor/No History (Delinquent/No past check)</option>
                </select>
              </div>
            </div>

            <hr className="border-slate-900" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Applicant Income ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.ApplicantIncome}
                  onChange={(e) => handleFieldChange('ApplicantIncome', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Coapplicant Income ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.CoapplicantIncome}
                  onChange={(e) => handleFieldChange('CoapplicantIncome', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Loan Amount ($k)</label>
                  <span className="text-[10px] text-slate-500">e.g. 150 = $150,000</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.LoanAmount}
                  onChange={(e) => handleFieldChange('LoanAmount', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Loan Term (Months)</label>
                  <span className="text-[10px] text-slate-500">e.g. 360 = 30 years</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.Loan_Amount_Term}
                  onChange={(e) => handleFieldChange('Loan_Amount_Term', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-sm text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Check Eligibility</span>
              )}
            </button>
          </form>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 space-y-6">
          {predictionResult ? (
            <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Eligibility Verdict</h3>
                <p className="text-xs text-slate-500 mt-1">Underwritten eligibility prediction details</p>
              </div>

              <div className="flex flex-col items-center py-6 text-center">
                <div className="relative w-32 h-32 mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="stroke-slate-950 fill-transparent"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className={`fill-transparent transition-all duration-1000 ${
                        predictionResult.eligible ? 'stroke-emerald-500' : 'stroke-rose-500'
                      }`}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - predictionResult.probability)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">
                      {Math.round(predictionResult.probability * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Approval Prob</span>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase border tracking-wider ${
                  predictionResult.eligible
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {predictionResult.eligible ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>APPROVED</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>REJECTED</span>
                    </>
                  )}
                </div>

                <p className="text-slate-400 text-xs mt-3">
                  Latency: <span className="font-semibold text-slate-300">{predictionResult.inferenceLatencyMs?.toFixed(2) ?? 0} ms</span>
                </p>
              </div>

              <hr className="border-slate-900" />

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SHAP Feature Explanations</span>
                {predictionResult.reasons && predictionResult.reasons.length > 0 ? (
                  <div className="space-y-2">
                    {predictionResult.reasons.map((reason: string, idx: number) => {
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
                  <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-900 text-slate-500 text-xs rounded-xl italic">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Explainability metrics unavailable.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="p-3 bg-slate-900 border border-slate-800 text-slate-600 rounded-xl mb-4">
                <Calculator className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-400">Verdicts Output</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-[200px] mx-auto">Submit the assessment form on the left to verify eligibility and examine features influence.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 bg-slate-900/10 text-center text-xs text-slate-600 mt-auto">
        <p>© 2026 CSBank. Internal decisioning environment.</p>
      </footer>
    </div>
  );
}
