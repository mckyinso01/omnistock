import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Mail, Lock, Sparkles, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import DESIGN_TOKENS from '@/lib/designSystem';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      setTimeout(() => {
        try {
          login(email || 'operator@omnistock.io');
          setLoading(false);
          navigate('/dashboard');
        } catch (err) {
          console.error("Auth Exception:", err);
          setErrorMsg("Failed to initialize session. Using offline operator session.");
          login('operator@omnistock.io');
          setLoading(false);
          navigate('/dashboard');
        }
      }, 400);
    } catch (err) {
      console.error("Form Exception:", err);
      setLoading(false);
      setErrorMsg("Connection error. Retry session initialization.");
    }
  };

  const handleQuickDemo = () => {
    try {
      login('admin@omnistock.io');
      navigate('/dashboard');
    } catch (err) {
      console.error("Quick Demo Exception:", err);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Login Container with 2px Moving Border Line Only & App-Wide Hover Shadow */}
      <div className="moving-border-card app-card-hover w-full max-w-[460px] shadow-2xl relative z-10">
        
        {/* Solid Dark Navy Interior Card (100% Solid Dark #0B1C30 - ZERO GRADIENT FILL INSIDE) */}
        <div className="w-full h-full bg-[#0B1C30] rounded-[1.38rem] p-8 space-y-8 text-left relative z-10">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#0B1C30]/80 backdrop-blur-xl border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.25)]">
              <Package className="h-8 w-8 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <h1 className={DESIGN_TOKENS.typography.h1}>OmniStock POS</h1>
              <p className={DESIGN_TOKENS.typography.muted}>Autonomous Inventory & Point-of-Sale Engine</p>
            </div>
          </div>

          {/* Error Alert Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="work-email" className={DESIGN_TOKENS.typography.body}>Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input 
                  id="work-email"
                  name="email"
                  type="email" 
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@omnistock.io"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-700/80 bg-[#071322] text-slate-100 placeholder:text-slate-500 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none text-base sm:text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="work-password" className={DESIGN_TOKENS.typography.body}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input 
                  id="work-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-slate-700/80 bg-[#071322] text-slate-100 placeholder:text-slate-500 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none text-base sm:text-sm font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors p-1 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,229,255,0.3)] border border-cyan-400/40 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Authenticating Session...</span>
                </>
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
              className="w-full py-3.5 rounded-xl bg-[#071322] hover:bg-[#0E1E36] text-cyan-300 border border-slate-700/80 hover:border-[#00E5FF]/60 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer app-card-hover"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Launch Quick Demo Session</span>
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>OmniStock Standalone v2.4 • Midnight Logic POS Mode</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
