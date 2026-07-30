import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Check, Users, Zap, Gift, Trophy } from "lucide-react";

export default function ReferralCard({ trialData }) {
  const [copied, setCopied] = useState(false);

  if (!trialData?.referral_code) return null;

  const referralLink = `${window.location.origin}?ref=${trialData.referral_code}`;
  const installs = trialData.referral_count || 0;
  const basicSubs = trialData.basic_sub_referral_count || 0;
  const loyaltyAwarded = trialData.loyalty_bonus_awarded || false;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'OmniStock — Autonomous POS & Inventory Engine',
        text: 'Try OmniStock for your store — free for 7 days!',
        url: referralLink,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="border border-slate-800 shadow-xl bg-[#0B1C30] text-white">
      <CardContent className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-950/80 border border-violet-700/50 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Referral Program</h3>
            <p className="text-sm text-slate-300">Share OmniStock and earn <span className="font-semibold text-violet-400">Pro trials</span>!</p>
          </div>
        </div>

        {/* Bonuses explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#071322] rounded-xl p-3.5 border border-slate-700/80">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">Per Install</span>
            </div>
            <p className="text-xs text-slate-300">Earn <span className="font-bold text-emerald-400">+7 days Pro trial</span> for every friend who installs!</p>
          </div>
          <div className="bg-[#071322] rounded-xl p-3.5 border border-slate-700/80">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">10 Basic Subscribers</span>
            </div>
            <p className="text-xs text-slate-300">When 10 friends subscribe to Basic — get <span className="font-bold text-amber-400">1 Month Pro</span> free!</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Your Referral Link</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-[#071322] border border-slate-700 rounded-xl px-3 py-2 text-sm text-cyan-300 font-mono truncate select-all">
              {referralLink}
            </div>
            <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0 gap-1.5 border-slate-700 bg-[#071322] text-slate-200 hover:bg-slate-800 hover:text-white">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button size="sm" onClick={handleShare} className="shrink-0 gap-1.5 bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-md">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#071322] rounded-xl p-3 border border-slate-700/80 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-300 font-medium">Installs</span>
            </div>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono">{installs}</p>
            <p className="text-xs text-slate-400">referrals</p>
          </div>

          <div className="bg-[#071322] rounded-xl p-3 border border-slate-700/80 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-300 font-medium">Basic Subs</span>
            </div>
            <p className="text-2xl font-extrabold text-amber-400 font-mono">{basicSubs}</p>
            <p className="text-xs text-slate-400">of 10 target</p>
          </div>
        </div>

        {/* Loyalty Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-slate-300">Loyalty Bonus Progress</p>
            {loyaltyAwarded ? (
              <Badge className="bg-amber-950/80 text-amber-300 border border-amber-700/50 text-xs">🏆 Awarded!</Badge>
            ) : (
              <span className="text-xs text-slate-400 font-mono">{basicSubs}/10</span>
            )}
          </div>
          <div className="w-full bg-[#071322] rounded-full h-2.5 border border-slate-800">
            <div
              className={`h-2.5 rounded-full transition-all ${loyaltyAwarded ? 'bg-amber-400' : 'bg-gradient-to-r from-violet-500 to-cyan-400'}`}
              style={{ width: `${Math.min(100, (basicSubs / 10) * 100)}%` }}
            />
          </div>
          {!loyaltyAwarded && basicSubs < 10 && (
            <p className="text-xs text-slate-400">{10 - basicSubs} more subscribers needed to unlock 1-Month Pro!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}