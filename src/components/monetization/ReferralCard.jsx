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
        title: 'StockMate — Inventory & POS para sa iyong tindahan',
        text: 'Subukan mo ang StockMate! Libre sa unang 7 araw.',
        url: referralLink,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-indigo-50">
      <CardContent className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Referral Program</h3>
            <p className="text-sm text-slate-500">I-share ang StockMate, kumita ng <span className="font-semibold text-violet-600">Pro trials</span>!</p>
          </div>
        </div>

        {/* Bonuses explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 border border-violet-100">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700">Per Install</span>
            </div>
            <p className="text-sm text-slate-600">Magbibigay ng <span className="font-bold text-emerald-600">+7 days Pro trial</span> para sa iyo bawat kaibigan na mag-install!</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-violet-100">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-700">10 Basic Subscribers</span>
            </div>
            <p className="text-sm text-slate-600">Kapag 10 kaibigan mo ay nag-subscribe sa Basic — <span className="font-bold text-amber-600">1 buwan Pro</span> para sa iyo!</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Iyong Referral Link</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 font-mono truncate">
              {referralLink}
            </div>
            <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0 gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button size="sm" onClick={handleShare} className="shrink-0 gap-1.5 bg-violet-600 hover:bg-violet-700 text-white">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-slate-500 font-medium">Installs</span>
            </div>
            <p className="text-2xl font-extrabold text-blue-600">{installs}</p>
            <p className="text-xs text-slate-400">referrals mo</p>
          </div>

          <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-slate-500 font-medium">Basic Subs</span>
            </div>
            <p className="text-2xl font-extrabold text-amber-600">{basicSubs}</p>
            <p className="text-xs text-slate-400">sa 10 na target</p>
          </div>
        </div>

        {/* Loyalty Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-slate-600">Loyalty Bonus Progress</p>
            {loyaltyAwarded ? (
              <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">🏆 Awarded!</Badge>
            ) : (
              <span className="text-xs text-slate-400">{basicSubs}/10</span>
            )}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${loyaltyAwarded ? 'bg-amber-400' : 'bg-gradient-to-r from-violet-400 to-indigo-500'}`}
              style={{ width: `${Math.min(100, (basicSubs / 10) * 100)}%` }}
            />
          </div>
          {!loyaltyAwarded && basicSubs < 10 && (
            <p className="text-xs text-slate-400">{10 - basicSubs} pa kaibigan ang kailangan para sa 1-month Pro!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}