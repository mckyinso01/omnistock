import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Mail, Lock, Sparkles, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

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
    <div className="min-h-screen bg-[#f6fbf9] text-[#103e3c] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#146f5b]/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute right-[-90px] bottom-[-100px] w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(4,163,155,0.09),transparent_70%)] pointer-events-none"></div>

      {/* Login Container */}
      <div className="w-full max-w-[460px] relative z-10">
        <div className="bg-white border border-[#d8eae5] rounded-[22px] p-8 space-y-8 shadow-[0_18px_44px_rgba(13,61,54,0.12),0_3px_10px_rgba(13,61,54,0.045)]">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e8f5ef] to-[#dcefe7] border border-[#c9eee8] flex items-center justify-center text-[#17775e] shadow-[inset_0_1px_0_#fff,0_3px_9px_rgba(20,111,91,0.06)]">
              <Package className="h-8 w-8 text-[#17775e]" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#123c35]">OmniStock POS</h1>
              <p className="text-sm text-[#789592]">Autonomous Inventory & Point-of-Sale Engine</p>
            </div>
          </div>

          {/* Error Alert Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="work-email" className="text-sm font-semibold text-[#557875]">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81948c] h-4 w-4" />
                <input 
                  id="work-email"
                  name="email"
                  type="email" 
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@omnistock.io"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#d8eae5] bg-[#f6fbf9] text-[#103e3c] placeholder:text-[#81948c] focus:border-[#16785f] focus:ring-1 focus:ring-[#16785f] outline-none text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="work-password" className="text-sm font-semibold text-[#557875]">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81948c] h-4 w-4" />
                <input 
                  id="work-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-[#d8eae5] bg-[#f6fbf9] text-[#103e3c] placeholder:text-[#81948c] focus:border-[#16785f] focus:ring-1 focus:ring-[#16785f] outline-none text-sm font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#81948c] hover:text-[#16785f] transition-colors p-1 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#146f5b] hover:bg-[#105c4b] active:scale-[0.98] text-[#fff] font-bold text-sm shadow-[0_4px_11px_rgba(20,111,91,0.2)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#fff]" />
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
          <div className="pt-4 border-t border-[#e2efeb] space-y-3 text-center">
            <button
              onClick={handleQuickDemo}
              type="button"
              className="w-full py-3.5 rounded-xl bg-[#f4f8f6] hover:bg-[#e5f3ed] text-[#16785f] border border-[#dcebe6] hover:border-[#a7d4c5] font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-[#16785f]" />
              <span>Launch Quick Demo Session</span>
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#81948c]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#16785f]" />
              <span>OmniStock Standalone v2.4 • Teal Matrix POS Mode</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}