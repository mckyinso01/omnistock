import React, { useState, useRef, useEffect } from 'react';
import { Store, ChevronDown, Check, Building2, Layers } from 'lucide-react';
import { useBranch } from '@/lib/BranchContext';

export default function BranchSelector() {
  const { branches, activeBranch, activeBranchId, setActiveBranchId, multiBranchEnabled } = useBranch();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!activeBranch) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#071322] border border-blue-900/50 hover:border-[#00E5FF]/50 rounded-xl text-xs font-mono text-slate-200 transition-all cursor-pointer app-card-hover"
      >
        {activeBranch.is_supply_hub ? (
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Store className="w-3.5 h-3.5 text-[#00E5FF]" />
        )}
        <span className="max-w-[120px] truncate font-semibold">{activeBranch.name}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#0B1C30] border border-blue-900/50 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800/60">
            <p className="text-[10px] font-mono text-[#00E5FF]/80 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3 h-3" />
              {multiBranchEnabled ? 'Switch Branch' : 'Branch View'}
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => {
                  setActiveBranchId(branch.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all cursor-pointer text-left
                  ${branch.id === activeBranchId
                    ? 'bg-[#2563EB]/20 text-[#00E5FF]'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
              >
                {branch.is_supply_hub ? (
                  <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <Store className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{branch.name}</p>
                  {branch.code && (
                    <p className="text-[10px] text-slate-500 font-mono">{branch.code}</p>
                  )}
                </div>
                {branch.id === activeBranchId && (
                  <Check className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}