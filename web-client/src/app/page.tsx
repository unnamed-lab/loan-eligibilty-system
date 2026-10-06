/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthToken } from '../utils/api';
import Navbar from '../components/Navbar';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  CheckmarkCircle02Icon, 
  Cancel01Icon, 
  InformationCircleIcon, 
  Shield01Icon, 
  Building02Icon, 
  PercentIcon, 
  CreditCardIcon, 
  Alert01Icon, 
  Location01Icon, 
  BankIcon,
  ArrowUp02Icon, 
  ArrowDown02Icon,
  Loading02Icon,
  RefreshIcon,
  Coins01Icon,
  AnalyticsUpIcon
} from '@hugeicons/core-free-icons';

const NIGERIAN_STATES = [
  // Major Urban Centers
  { name: 'Lagos State', category: 'Urban' },
  { name: 'Abuja (FCT)', category: 'Urban' },
  { name: 'Rivers State (Port Harcourt)', category: 'Urban' },
  
  // Commercial & Semiurban Hubs
  { name: 'Imo State (Owerri/Orlu)', category: 'Semiurban' },
  { name: 'Anambra State (Onitsha/Awka/Nnewi)', category: 'Semiurban' },
  { name: 'Abia State (Aba/Umuahia)', category: 'Semiurban' },
  { name: 'Enugu State (Enugu Urban)', category: 'Semiurban' },
  { name: 'Oyo State (Ibadan)', category: 'Semiurban' },
  { name: 'Ogun State (Abeokuta/Agbara)', category: 'Semiurban' },
  { name: 'Kano State (Kano Metropolis)', category: 'Semiurban' },
  { name: 'Delta State (Asaba/Warri)', category: 'Semiurban' },
  { name: 'Kaduna State (Kaduna/Zaria)', category: 'Semiurban' },
  { name: 'Edo State (Benin City)', category: 'Semiurban' },
  { name: 'Akwa Ibom State (Uyo)', category: 'Semiurban' },
  { name: 'Cross River State (Calabar)', category: 'Semiurban' },
  { name: 'Kwara State (Ilorin)', category: 'Semiurban' },
  { name: 'Osun State (Osogbo)', category: 'Semiurban' },
  { name: 'Ondo State (Akure)', category: 'Semiurban' },
  { name: 'Plateau State (Jos)', category: 'Semiurban' },
  { name: 'Benue State (Makurdi)', category: 'Semiurban' },

  // Regional & Semiurban / Rural States
  { name: 'Ebonyi State (Abakaliki)', category: 'Rural' },
  { name: 'Ekiti State (Ado-Ekiti)', category: 'Rural' },
  { name: 'Bayelsa State (Yenagoa)', category: 'Rural' },
  { name: 'Kogi State (Lokoja)', category: 'Rural' },
  { name: 'Nasarawa State (Lafia/Karu)', category: 'Rural' },
  { name: 'Niger State (Minna)', category: 'Rural' },
  { name: 'Katsina State (Katsina)', category: 'Rural' },
  { name: 'Borno State (Maiduguri)', category: 'Rural' },
  { name: 'Adamawa State (Yola)', category: 'Rural' },
  { name: 'Bauchi State (Bauchi)', category: 'Rural' },
  { name: 'Gombe State (Gombe)', category: 'Rural' },
  { name: 'Sokoto State (Sokoto)', category: 'Rural' },
  { name: 'Kebbi State (Birnin Kebbi)', category: 'Rural' },
  { name: 'Zamfara State (Gusau)', category: 'Rural' },
  { name: 'Jigawa State (Dutse)', category: 'Rural' },
  { name: 'Taraba State (Jalingo)', category: 'Rural' },
  { name: 'Yobe State (Damaturu)', category: 'Rural' },
  { name: 'Other Nigerian States / Rural', category: 'Rural' },
];

function generateRandomDigitString(length: number, prefix = ''): string {
  let res = prefix;
  while (res.length < length) {
    res += Math.floor(Math.random() * 10).toString();
  }
  return res.slice(0, length);
}

const DEFAULT_FORM = {
  BVN: '22145890312',
  NIN: '54109823411',
  Gender: 'Male',
  Married: 'Yes',
  Dependents: '1',
  Education: 'Graduate',
  EmploymentSector: 'Private Corporate',
  StateLocation: 'Lagos State',
  ApplicantIncomeNGN: 450000, // Monthly salary in ₦
  CoapplicantIncomeNGN: 150000, // Monthly coapplicant income in ₦
  LoanAmountNGN: 5000000, // Loan amount in ₦ (₦5,000,000)
  LoanTermMonths: 36, // 3 years tenor
  InterestRateAnnual: 27.5, // CBN MPR (26.75%) + risk spread
  CreditBureauStatus: 'Good (No Default / CRC Verified)',
};

function FieldTooltip({ text }: { text: string }) {
  return (
    <span className="relative inline-block group ml-1 align-middle">
      <HugeiconsIcon icon={InformationCircleIcon} className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors" />
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block group-focus-within:block w-64 p-2.5 bg-slate-900 border border-slate-700/80 text-[11px] text-slate-200 rounded-xl shadow-2xl z-50 leading-snug font-normal text-left normal-case tracking-normal">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></span>
      </span>
    </span>
  );
}

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthChecked(true);
    }
  }, [router]);

  // Currency Formatter for NGN (₦)
  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper to randomize identity placeholders (for demo purposes)
  const handleRandomizeIdentity = () => {
    setFormData(prev => ({
      ...prev,
      BVN: generateRandomDigitString(11, '221'),
      NIN: generateRandomDigitString(11, '541')
    }));
  };

  // Live Financial Metrics & CBN Debt Service Ratio (DSR / DTI) Calculation
  const financialMetrics = useMemo(() => {
    const totalMonthlyIncome = (formData.ApplicantIncomeNGN || 0) + (formData.CoapplicantIncomeNGN || 0);
    const monthlyRate = ((formData.InterestRateAnnual || 0) / 100) / 12;
    const n = formData.LoanTermMonths || 1;
    const principal = formData.LoanAmountNGN || 0;

    // Monthly EMI Calculation
    let monthlyRepayment = 0;
    if (monthlyRate > 0 && n > 0 && principal > 0) {
      monthlyRepayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    } else if (n > 0 && principal > 0) {
      monthlyRepayment = principal / n;
    }

    // Debt Service Ratio (DSR) = Monthly Repayment / Total Monthly Income
    const dsrRatio = totalMonthlyIncome > 0 ? (monthlyRepayment / totalMonthlyIncome) * 100 : 0;
    
    // Total Interest & Repayment
    const totalRepayment = monthlyRepayment * n;
    const totalInterest = Math.max(0, totalRepayment - principal);

    return {
      totalMonthlyIncome,
      monthlyRepayment,
      dsrRatio,
      totalRepayment,
      totalInterest
    };
  }, [formData]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Find property area classification from state location
      const selectedState = NIGERIAN_STATES.find(s => s.name === formData.StateLocation);
      const propertyArea = selectedState ? selectedState.category : 'Semiurban';

      // Map NGN inputs to standard ML model contract ranges
      // ApplicantIncome: ₦450,000 -> 4500 (scaled for ML contract continuous feature min:0, max:100000)
      // LoanAmount: ₦5,000,000 -> 50 (in ₦'000 / $k model equivalent scale min:0, max:1000)
      const mappedApplicantIncome = Math.min(100000, Math.max(0, Math.round((formData.ApplicantIncomeNGN || 0) / 100)));
      const mappedCoapplicantIncome = Math.min(100000, Math.max(0, Math.round((formData.CoapplicantIncomeNGN || 0) / 100)));
      const mappedLoanAmount = Math.min(1000, Math.max(1, Math.round((formData.LoanAmountNGN || 0) / 100000)));

      const isSelfEmployed = formData.EmploymentSector.includes('Self') || formData.EmploymentSector.includes('MSME');
      const creditHistoryValue = formData.CreditBureauStatus.includes('Good') ? 1 : 0;

      const payload = {
        Gender: formData.Gender,
        Married: formData.Married,
        Dependents: formData.Dependents,
        Education: formData.Education,
        Self_Employed: isSelfEmployed ? 'Yes' : 'No',
        ApplicantIncome: mappedApplicantIncome,
        CoapplicantIncome: mappedCoapplicantIncome,
        LoanAmount: mappedLoanAmount,
        Loan_Amount_Term: Number(formData.LoanTermMonths),
        Credit_History: creditHistoryValue,
        Property_Area: propertyArea
      };

      const result = await api.predict(payload);
      setPredictionResult(result);
    } catch (err: any) {
      alert(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <HugeiconsIcon icon={Loading02Icon} className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // DSR Status Pill Styling
  const getDsrBadge = (ratio: number) => {
    if (ratio <= 33.33) {
      return {
        label: 'CBN Compliant (Low DTI Risk)',
        style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      };
    } else if (ratio <= 50) {
      return {
        label: 'Elevated DTI Risk (CBN Threshold 33.3%)',
        style: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      };
    } else {
      return {
        label: 'CBN DSR Violation (> 50% Income)',
        style: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      };
    }
  };

  const dsrBadge = getDsrBadge(financialMetrics.dsrRatio);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white tracking-tight">Nigeria Credit Eligibility Assessment</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  CBN Standards
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Underwriting risk engine benchmarked against Central Bank of Nigeria (CBN) retail credit rules.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
              <HugeiconsIcon icon={BankIcon} className="w-3.5 h-3.5 text-emerald-400" />
              <span>NIBSS / CRC Integrated</span>
            </div>
          </div>

          <form onSubmit={handlePredict} className="space-y-6">
            {/* Identity & Verification Section (Demo Placeholder) */}
            <div className="bg-slate-950/70 p-4 sm:p-5 border border-slate-800/80 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <HugeiconsIcon icon={Shield01Icon} className="w-4 h-4 text-emerald-400" />
                  <span>Identity Verification (NIBSS / NIMC - Demo Placeholder)</span>
                </div>
                <button
                  type="button"
                  onClick={handleRandomizeIdentity}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors font-medium bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
                >
                  <HugeiconsIcon icon={RefreshIcon} className="w-3 h-3" />
                  <span>Randomize Demo IDs</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <span>BVN (11-Digits)</span>
                      <FieldTooltip text="Demo placeholder: 11-digit Bank Verification Number mandated by CBN to verify applicant identity across Nigerian banks." />
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-normal">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3 h-3" /> Verified (Demo)
                    </span>
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={formData.BVN}
                    onChange={(e) => handleFieldChange('BVN', e.target.value.replace(/\D/g, ''))}
                    placeholder="22145890312"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-mono text-white placeholder-slate-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <span>NIN (National ID)</span>
                      <FieldTooltip text="Demo placeholder: 11-digit National Identification Number issued by NIMC for identity cross-validation." />
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-normal">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3 h-3" /> Linked (Demo)
                    </span>
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={formData.NIN}
                    onChange={(e) => handleFieldChange('NIN', e.target.value.replace(/\D/g, ''))}
                    placeholder="54109823411"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-mono text-white placeholder-slate-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Applicant Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender</label>
                <select
                  value={formData.Gender}
                  onChange={(e) => handleFieldChange('Gender', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-200 transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Marital Status</label>
                <select
                  value={formData.Married}
                  onChange={(e) => handleFieldChange('Married', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-200 transition-all"
                >
                  <option value="Yes">Married</option>
                  <option value="No">Single</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span>Dependents</span>
                  <FieldTooltip text="Number of financial dependents. Higher dependent ratios increase estimated household living expenses." />
                </label>
                <select
                  value={formData.Dependents}
                  onChange={(e) => handleFieldChange('Dependents', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-200 transition-all"
                >
                  <option value="0">0 Dependents</option>
                  <option value="1">1 Dependent</option>
                  <option value="2">2 Dependents</option>
                  <option value="3+">3+ Dependents</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Educational Qualification</label>
                <select
                  value={formData.Education}
                  onChange={(e) => handleFieldChange('Education', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-200 transition-all"
                >
                  <option value="Graduate">Tertiary Degree (Graduate)</option>
                  <option value="Not Graduate">Secondary / Non-Graduate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span>Employment Sector</span>
                  <FieldTooltip text="Income stability tier. Civil servants on IPPIS and corporate staff receive higher stability scores." />
                </label>
                <select
                  value={formData.EmploymentSector}
                  onChange={(e) => handleFieldChange('EmploymentSector', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-200 transition-all"
                >
                  <option value="Civil Service (IPPIS)">Civil Service (State / Federal IPPIS)</option>
                  <option value="Private Corporate">Private Corporate Employee</option>
                  <option value="MSME / Business Owner">MSME / Registered Business Owner</option>
                  <option value="Self Employed / Informal">Self-Employed / Freelancer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <HugeiconsIcon icon={Location01Icon} className="w-3.5 h-3.5 text-emerald-400" />
                  <span>State / Location Zone</span>
                  <FieldTooltip text="State location determines urban vs semi-urban risk classification (Lagos, Abuja FCT, and Port Harcourt are classified as major urban centers)." />
                </label>
                <select
                  value={formData.StateLocation}
                  onChange={(e) => handleFieldChange('StateLocation', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-200 transition-all"
                >
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state.name} value={state.name}>
                      {state.name} ({state.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <HugeiconsIcon icon={Shield01Icon} className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Credit Bureau Check (CRC / FirstCentral / XDS)</span>
                  <FieldTooltip text="Automated credit report check against licensed Nigerian credit bureaus. Active defaults result in high risk ratings." />
                </label>
                <select
                  value={formData.CreditBureauStatus}
                  onChange={(e) => handleFieldChange('CreditBureauStatus', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-200 transition-all"
                >
                  <option value="Good (No Default / CRC Verified)">Good History (Clear CRC/FirstCentral Credit Report)</option>
                  <option value="Poor/Delinquent Record">Delinquent / Overdue Debt / Bad History</option>
                </select>
              </div>
            </div>

            <hr className="border-slate-800/80" />

            {/* Income & Loan Parameters in NGN (₦) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <HugeiconsIcon icon={CreditCardIcon} className="w-4 h-4 text-emerald-400" />
                <span>Financial & Facilities Metrics (in ₦ NGN)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span>Applicant Monthly Salary (₦)</span>
                    <FieldTooltip text="Net monthly salary or verified business income in Naira (₦) credited to applicant's primary bank account." />
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.ApplicantIncomeNGN}
                    onChange={(e) => handleFieldChange('ApplicantIncomeNGN', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white font-mono transition-all"
                  />
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{formatNGN(formData.ApplicantIncomeNGN || 0)} / mo</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span>Co-applicant Income (₦)</span>
                    <FieldTooltip text="Verified monthly income of spouse or co-borrower in Naira (₦), which increases total household repayment capability." />
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.CoapplicantIncomeNGN}
                    onChange={(e) => handleFieldChange('CoapplicantIncomeNGN', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white font-mono transition-all"
                  />
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{formatNGN(formData.CoapplicantIncomeNGN || 0)} / mo</div>
                </div>

                {/* Flexible Loan Amount Input */}
                <div className="space-y-1.5 md:col-span-2 bg-slate-950/60 p-4 border border-slate-800/80 rounded-xl">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <HugeiconsIcon icon={Coins01Icon} className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Loan Amount Requested (₦)</span>
                      <FieldTooltip text="Total principal credit facility requested by applicant in Naira (₦). Type any loan amount freely." />
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {formatNGN(formData.LoanAmountNGN || 0)}
                    </span>
                  </div>

                  <input
                    type="number"
                    min="10000"
                    step="any"
                    value={formData.LoanAmountNGN}
                    onChange={(e) => handleFieldChange('LoanAmountNGN', Number(e.target.value))}
                    placeholder="Enter any loan amount (e.g. 7500000)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-base text-white font-mono font-bold transition-all placeholder-slate-600"
                  />

                  {/* Preset Amount Shortcuts for Convenience */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
                    {[
                      { label: '₦1M', val: 1000000 },
                      { label: '₦2.5M', val: 2500000 },
                      { label: '₦5M', val: 5000000 },
                      { label: '₦10M', val: 10000000 },
                      { label: '₦25M', val: 25000000 },
                      { label: '₦50M', val: 50000000 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleFieldChange('LoanAmountNGN', preset.val)}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                          formData.LoanAmountNGN === preset.val
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <span>Loan Tenor (Months)</span>
                      <FieldTooltip text="Duration of loan repayment in months. Longer tenors reduce monthly EMI but increase overall interest paid." />
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono font-medium">
                      {((formData.LoanTermMonths || 36) / 12).toFixed(1)} years
                    </span>
                  </div>
                  <select
                    value={formData.LoanTermMonths}
                    onChange={(e) => handleFieldChange('LoanTermMonths', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-200 transition-all"
                  >
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                    <option value={48}>48 Months (4 Years)</option>
                    <option value={60}>60 Months (5 Years)</option>
                    <option value={120}>120 Months (10 Years - Mortgage)</option>
                    <option value={180}>180 Months (15 Years - Mortgage)</option>
                    <option value={360}>360 Months (30 Years - Mortgage)</option>
                  </select>
                </div>
              </div>

              {/* Interest Rate & Repayment Preview */}
              <div className="mt-4 p-4 sm:p-5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-4 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <HugeiconsIcon icon={PercentIcon} className="w-4 h-4 text-emerald-400" />
                    <span>CBN MPR Interest Rate Benchmark</span>
                    <FieldTooltip text="Annual interest rate (% p.a.) benchmarked against Central Bank of Nigeria Monetary Policy Rate (MPR ~26.75%) plus commercial bank risk spread." />
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.25"
                      min="5"
                      max="50"
                      value={formData.InterestRateAnnual}
                      onChange={(e) => handleFieldChange('InterestRateAnnual', Number(e.target.value))}
                      className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-right font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-slate-400 font-medium">% p.a.</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-t border-slate-800/60 pt-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Monthly EMI</span>
                    <p className="font-mono font-bold text-slate-100 mt-0.5">{formatNGN(financialMetrics.monthlyRepayment)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Repayment</span>
                    <p className="font-mono font-semibold text-slate-300 mt-0.5">{formatNGN(financialMetrics.totalRepayment)}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <span>Debt-Service Ratio</span>
                      <FieldTooltip text="Calculates monthly loan repayment as a % of total net income. CBN guidelines recommend DSR <= 33.33%." />
                    </span>
                    <p className="font-mono font-bold text-white mt-0.5">{financialMetrics.dsrRatio.toFixed(1)}%</p>
                  </div>
                </div>

                {/* DSR Warning Badge */}
                <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium border ${dsrBadge.style}`}>
                  {financialMetrics.dsrRatio <= 33.33 ? (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 shrink-0 text-amber-400" />
                  )}
                  <span>{dsrBadge.label}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-linear-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-sm tracking-wide"
            >
              {loading ? (
                <>
                  <HugeiconsIcon icon={Loading02Icon} className="w-5 h-5 animate-spin" />
                  <span>Evaluating CBN Credit Rules...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={AnalyticsUpIcon} className="w-5 h-5" />
                  <span>Run Credit Underwriting Assessment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 space-y-6">
          {predictionResult ? (
            <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl sticky top-24">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Underwriting Verdict</h3>
                <p className="text-xs text-slate-400 mt-1">CBN Compliant Machine Learning Underwriting Output</p>
              </div>

              <div className="flex flex-col items-center py-4 text-center">
                <div className="relative w-36 h-36 mb-5">
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
                    <span className="text-3xl font-black text-white font-mono tracking-tight">
                      {Math.round(predictionResult.probability * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Approval Prob</span>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase border tracking-wider ${
                  predictionResult.eligible
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-sm'
                }`}>
                  {predictionResult.eligible ? (
                    <>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
                      <span>APPROVED</span>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
                      <span>REJECTED</span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-left w-full bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 mt-5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Max Facility Approved</span>
                    <p className="font-mono font-bold text-emerald-400 mt-0.5">
                      {predictionResult.eligible ? formatNGN(formData.LoanAmountNGN || 0) : '₦0'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Underwriting Latency</span>
                    <p className="font-mono font-semibold text-slate-200 mt-0.5">
                      {predictionResult.inferenceLatencyMs?.toFixed(2) ?? 0} ms
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-slate-800/80" />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">SHAP Risk Drivers & Factors</span>
                  <span className="text-[10px] text-slate-400 font-mono">TreeExplainer v1.0</span>
                </div>

                {predictionResult.reasons && predictionResult.reasons.length > 0 ? (
                  <div className="space-y-2">
                    {predictionResult.reasons.map((reason: string, idx: number) => {
                      const isPositive = reason.includes('increased') || reason.includes('good') || reason.includes('Good');
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 p-3.5 border rounded-xl text-xs leading-relaxed transition-all ${
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
                    <span>Explainability metrics unavailable.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-95 shadow-sm">
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 text-slate-500 rounded-2xl mb-4 shadow-inner">
                <HugeiconsIcon icon={Building02Icon} className="w-7 h-7 text-emerald-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300 tracking-tight">Verdicts & CBN Compliance Output</h4>
              <p className="text-xs text-slate-400 mt-1.5 max-w-60 mx-auto leading-relaxed">
                Complete the NGN credit parameters form to calculate approval probability and view SHAP risk factors.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 bg-slate-950 text-center text-xs text-slate-400 mt-auto">
        <p>© 2026 CSBank Nigeria Ltd. Licensed by Central Bank of Nigeria (CBN). NIBSS Integrated Underwriting Portal.</p>
      </footer>
    </div>
  );
}
