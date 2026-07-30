import React, { useState } from "react";
import { Code, Key, Copy, Check, Download, ShieldCheck, X } from "lucide-react";

export const SourceCodeLicenseModal = ({
  isOpen,
  onClose,
  appName = "OmniStock POS",
  repoUrl = "git@github.com:enterprise-clients/omnistock-pos-perpetual.git"
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const sshKey = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOrX89J21zK9pL3xY7qR4vW6sM0nU2tP5zK1xY7qR4vW omnistock-perpetual-key";

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(sshKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1500);
  };

  const handleDownloadDockerCompose = () => {
    const composeContent = `version: '3.8'\nservices:\n  omnistock:\n    build: .\n    ports:\n      - "5173:5173"\n    environment:\n      - NODE_ENV=production\n`;
    const blob = new Blob([composeContent], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "omnistock-docker-compose.yml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in-50 duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-left text-slate-100">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                Perpetual Source Code & Full IP License
              </h3>
              <p className="text-xs text-slate-400">Full repository access, React/Vite source code & SQLite/Express backend</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-0.5">License Ownership:</span>
            <span className="font-mono font-bold text-emerald-400">Perpetual Full IP Ownership</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Updates & Support:</span>
            <span className="font-mono font-bold text-blue-400">Lifetime Git Commits</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span>Deploy Key (Git Clone SSH):</span>
            </span>
            <button
              onClick={handleCopyKey}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 cursor-pointer"
            >
              {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedKey ? "Copied Key!" : "Copy SSH Key"}</span>
            </button>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 truncate">
            {sshKey}
          </div>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 flex items-center justify-between">
          <div className="truncate">
            <span className="text-slate-500">$ </span>
            <span className="text-emerald-400">git clone </span>
            <span>{repoUrl}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handleDownloadDockerCompose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Download docker-compose.yml</span>
          </button>

          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg">
            Close License View
          </button>
        </div>
      </div>
    </div>
  );
};
