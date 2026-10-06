'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAuthToken } from '../utils/api';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  BankIcon, 
  Calculator01Icon, 
  Time01Icon, 
  Logout01Icon,
  Shield01Icon
} from '@hugeicons/core-free-icons';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('loan_officer_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setEmail(payload.email);
        } catch {
          setEmail('officer@csbank.ng');
        }
      }
    }
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  return (
    <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 font-sans">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-inner group-hover:border-emerald-500/40 transition-colors">
              <HugeiconsIcon icon={BankIcon} className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  CSBank Nigeria
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold tracking-wider">
                  <HugeiconsIcon icon={Shield01Icon} className="w-2.5 h-2.5" />
                  CBN LICENSED
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Credit Risk & Underwriting Portal</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                pathname === '/'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 bg-transparent border-transparent hover:bg-slate-900/60'
              }`}
            >
              <HugeiconsIcon icon={Calculator01Icon} className="w-4 h-4" />
              <span>NGN Calculator</span>
            </Link>

            <Link
              href="/history"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                pathname.startsWith('/history')
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 bg-transparent border-transparent hover:bg-slate-900/60'
              }`}
            >
              <HugeiconsIcon icon={Time01Icon} className="w-4 h-4" />
              <span>Audit History</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Underwriter Officer</p>
            <p className="text-xs font-mono font-medium text-slate-200">{email || 'officer@csbank.ng'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-rose-400 transition-all border border-slate-800/50 hover:border-rose-500/20"
            title="Sign Out"
          >
            <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
