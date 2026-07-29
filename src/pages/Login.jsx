import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      sessionStorage.setItem('stockmate_auth_token', 'mock_stockmate_token_2026');
      sessionStorage.setItem('stockmate_user_email', email || 'operator@stockmate.io');
      setLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  const handleQuickDemo = () => {
    sessionStorage.setItem('stockmate_auth_token', 'mock_stockmate_token_2026');
    sessionStorage.setItem('stockmate_user_email', 'admin@stockmate.io');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-[460px] bg-[#0d1527] border border-slate-800/80 rounded-3xl p-8 space-y-8 shadow-2xl relative z-10 text-left">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
            <Shield className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">StockMate POS</h1>
            <p className="text-xs text-slate-400">Autonomous Inventory & Point-of-Sale Engine</p>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 px-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@stockmate.io"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-800 bg-[#060a12] text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-800 bg-[#060a12] text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-xs"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In to POS Console</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Bypass */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3 text-center">
          <button
            onClick={handleQuickDemo}
            type="button"
            className="w-full py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-emerald-400 border border-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Launch Quick Demo Session</span>
          </button>
          
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>StockMate Standalone v2.4 • POS & Inventory Mode</span>
          </div>
        </div>

      </div>
    </div>
  );
}
