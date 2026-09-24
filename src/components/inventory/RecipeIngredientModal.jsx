import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Coffee, ShieldAlert, CheckCircle2, Scale, AlertTriangle, Plus, Trash2 } from "lucide-react";
import DESIGN_TOKENS from "@/lib/designSystem";

export default function RecipeIngredientModal({ isOpen, onClose, product }) {
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "Espresso Beans (Premium Arabica)", portion: "18", unit: "grams", costPerUnit: "0.85", status: "NORMAL" },
    { id: 2, name: "Fresh Whole Milk", portion: "150", unit: "ml", costPerUnit: "0.12", status: "NORMAL" },
    { id: 3, name: "Vanilla Syrup Shot", portion: "15", unit: "ml", costPerUnit: "0.20", status: "WARNING" },
    { id: 4, name: "16oz Eco Packaging Cup & Lid", portion: "1", unit: "pcs", costPerUnit: "2.50", status: "NORMAL" }
  ]);

  const [anomalyStatus, setAnomalyStatus] = useState(false);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now(), name: "New Ingredient / Syrup", portion: "10", unit: "grams", costPerUnit: "0.50", status: "NORMAL" }
    ]);
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  const totalCost = ingredients.reduce((sum, item) => sum + (parseFloat(item.portion || 0) * parseFloat(item.costPerUnit || 0)), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0B1C30] border border-slate-700/80 rounded-2xl p-6 shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Recipe & Ingredient Portion Control: {product?.name || "Espresso Latte (16oz)"}
              </h2>
              <p className="text-xs text-slate-400">
                Automated Portion Deduction, Theft Anomaly Audit & Daily COGS Calculator
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Anomaly Detection Banner */}
        <div className={`p-4 rounded-xl mb-4 border flex items-center justify-between ${anomalyStatus ? 'bg-rose-950/80 border-rose-500/50 text-rose-200' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'}`}>
          <div className="flex items-center gap-3">
            {anomalyStatus ? <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            <div>
              <span className="font-semibold text-sm">
                {anomalyStatus ? "🚨 AUDIT ANOMALY DETECTED: Physical stock depleting 18% faster than recorded sales!" : "🛡️ PILFERAGE GUARD ACTIVE: Ingredient consumption 100% matched with sales ledger."}
              </span>
              <p className="text-xs opacity-80">Flags unrecorded giveaways, improper barista portioning, or staff theft instantly.</p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setAnomalyStatus(!anomalyStatus)}
            className="text-xs border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
          >
            {anomalyStatus ? "Clear Flag" : "Simulate Anomaly Audit"}
          </Button>
        </div>

        {/* Ingredient Table */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {ingredients.map((item) => (
            <Card key={item.id} className="bg-[#071322] border-slate-800/80">
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <Input 
                    value={item.name} 
                    onChange={(e) => {
                      const updated = ingredients.map(i => i.id === item.id ? { ...i, name: e.target.value } : i);
                      setIngredients(updated);
                    }}
                    className="bg-slate-900/80 border-slate-700 text-sm text-slate-100 h-8"
                  />
                </div>
                <div className="flex items-center gap-2 w-36">
                  <Input 
                    type="number"
                    value={item.portion} 
                    onChange={(e) => {
                      const updated = ingredients.map(i => i.id === item.id ? { ...i, portion: e.target.value } : i);
                      setIngredients(updated);
                    }}
                    className="bg-slate-900/80 border-slate-700 text-sm text-slate-100 h-8 text-center"
                  />
                  <span className="text-xs text-slate-400 w-12">{item.unit}</span>
                </div>
                <div className="w-24 text-right">
                  <span className="text-xs text-slate-400">COGS: </span>
                  <span className="text-sm font-semibold text-emerald-400">₱{(parseFloat(item.portion || 0) * parseFloat(item.costPerUnit || 0)).toFixed(2)}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeIngredient(item.id)} className="text-rose-400 hover:text-rose-300 h-8 w-8">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Metrics */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button size="sm" onClick={addIngredient} className="bg-amber-600 hover:bg-amber-500 text-white text-xs gap-1.5">
              <Plus className="w-4 h-4" /> Add Ingredient
            </Button>
            <div className="text-xs text-slate-400">
              Total Recipe COGS per Serving: <span className="text-sm font-bold text-amber-400 ml-1">₱{totalCost.toFixed(2)}</span>
            </div>
          </div>
          <Button onClick={onClose} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs px-5 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            Save Recipe & Lock Portion Guard
          </Button>
        </div>

      </div>
    </div>
  );
}