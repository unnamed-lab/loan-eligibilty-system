'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAuthToken } from '../utils/api';
import { Sparkles, Calculator, History, LogOut } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Decode JWT token loosely or read stored user details from localStorage
      const token = localStorage.getItem('loan_officer_token');
      if (token) {
        try {
          // JWT payload is in the second part
          const payload = JSON.parse(atob(token.split('.')[1]));
          setEmail(payload.email);
        } catch {
          setEmail('loan-officer');
        }
      }
    }
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  return (
    <header className="border-b border-slate-900 bg-slate-900/30 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">CSBank Underwrite</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                pathname === '/'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                  : 'text-slate-400 hover:text-white bg-transparent border-transparent hover:bg-slate-900/50'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculator</span>
            </Link>

            <Link
              href="/history"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                pathname.startsWith('/history')
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                  : 'text-slate-400 hover:text-white bg-transparent border-transparent hover:bg-slate-900/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit History</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Officer</p>
            <p className="text-xs font-medium text-slate-300">{email || 'loan-officer'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-rose-400 transition-all border border-transparent hover:border-slate-800"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
