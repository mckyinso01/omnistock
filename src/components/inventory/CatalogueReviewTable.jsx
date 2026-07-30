import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, AlertTriangle, Download, Loader2, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

function confidenceMeta(c) {
  if (c == null) return { label: "—", color: "text-slate-500 bg-slate-100 border-slate-200" };
  if (c >= 0.8) return { label: "High", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  if (c >= 0.6) return { label: "Medium", color: "text-amber-700 bg-amber-50 border-amber-200" };
  return { label: "Low", color: "text-red-700 bg-red-50 border-red-200" };
}

const EditCell = ({ value, onChange, type, className }) => (
  <Input
    type={type || "text"}
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className={`h-8 ${className || ""}`}
  />
);

export default function CatalogueReviewTable({ candidates, onChange, sourceImageUrl, onImport, importing }) {
  const [showSource, setShowSource] = useState(false);
  const update = (id, patch) => onChange(candidates.map(c => c._id === id ? { ...c, ...patch } : c));
  const remove = (id) => onChange(candidates.filter(c => c._id !== id));
  const toggleAll = (val) => onChange(candidates.map(c => ({ ...c, _selected: val })));
  const selected = candidates.filter(c => c._selected);
  const lowCount = selected.filter(c => (c.confidence ?? 1) < 0.6).length;
  const allSelected = candidates.length > 0 && candidates.every(c => c._selected);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-200">Review Extracted Products</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {candidates.length} entries detected · {selected.length} selected for import
            {lowCount > 0 && <span className="text-amber-400"> · {lowCount} need a second look</span>}
          </p>
        </div>
        {sourceImageUrl && (
          <Button variant="outline" size="sm" onClick={() => setShowSource(!showSource)} className="gap-2">
            <ImageIcon className="w-4 h-4" /> {showSource ? "Hide Source" : "View Source"}
          </Button>
        )}
      </div>

      {showSource && sourceImageUrl && (
        <img src={sourceImageUrl} alt="catalogue source" className="w-full max-h-64 object-contain rounded-xl border border-slate-200 bg-slate-50" />
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="p-2 w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">SKU</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">Cost</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Unit</th>
              <th className="p-2 text-center">Conf.</th>
              <th className="p-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(c => {
              const conf = confidenceMeta(c.confidence);
              const low = (c.confidence ?? 1) < 0.6;
              return (
                <tr key={c._id} className={`border-t border-slate-800 transition-colors ${low ? "bg-red-950/40" : "bg-[#071322] hover:bg-slate-800/60"}`}>
                  <td className="p-2 text-center"><Checkbox checked={!!c._selected} onCheckedChange={(v) => update(c._id, { _selected: v })} /></td>
                  <td className="p-1 min-w-[150px]">
                    <EditCell value={c.name} onChange={(v) => update(c._id, { name: v })} />
                    {c.notes && <p className="text-[10px] text-amber-400 mt-0.5 italic leading-tight">{c.notes}</p>}
                  </td>
                  <td className="p-1"><EditCell value={c.sku} onChange={(v) => update(c._id, { sku: v })} className="min-w-[90px]" /></td>
                  <td className="p-1"><EditCell value={c.price} onChange={(v) => update(c._id, { price: v })} type="number" className="w-20 text-right" /></td>
                  <td className="p-1"><EditCell value={c.cost} onChange={(v) => update(c._id, { cost: v })} type="number" className="w-20 text-right" /></td>
                  <td className="p-1"><EditCell value={c.quantity} onChange={(v) => update(c._id, { quantity: v })} type="number" className="w-16 text-right" /></td>
                  <td className="p-1"><EditCell value={c.category} onChange={(v) => update(c._id, { category: v })} className="min-w-[110px]" /></td>
                  <td className="p-1"><EditCell value={c.unit} onChange={(v) => update(c._id, { unit: v })} className="w-16" /></td>
                  <td className="p-2 text-center"><Badge variant="outline" className={`text-[10px] ${conf.color}`}>{conf.label}</Badge></td>
                  <td className="p-2 text-center">
                    <button onClick={() => remove(c._id)} className="text-slate-300 hover:text-rose-400 transition-colors" title="Remove row">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {lowCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Some rows have low confidence (highlighted in red). Please double-check before importing — handwriting can be ambiguous.</span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={() => onImport(selected)} disabled={importing || selected.length === 0} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          {importing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Importing...</>) : (<><Download className="w-4 h-4" /> Import {selected.length} Product{selected.length > 1 ? "s" : ""}</>)}
        </Button>
      </div>
    </div>
  );
}