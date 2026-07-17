import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, X, ScanText, Sparkles } from "lucide-react";
import CatalogueReviewTable from "./CatalogueReviewTable";

export default function CatalogueUploaderModal({ onImported, onClose }) {
  const [stage, setStage] = useState("capture");
  const [candidates, setCandidates] = useState([]);
  const [sourceImageUrl, setSourceImageUrl] = useState("");
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const cameraRef = useRef(null);
  const uploadRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    setStage("processing");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSourceImageUrl(file_url);
      const res = await base44.functions.invoke("scanCatalogue", { image_url: file_url });
      const data = res.data || res;
      if (data?.error) {
        setError(data.error);
        setStage("capture");
        return;
      }
      const products = (data?.products || []).map((p, i) => ({ ...p, _id: `c${i}-${Date.now()}`, _selected: true }));
      if (products.length === 0) {
        setError("No products detected in the image. Try a clearer, well-lit photo with the catalogue page filling more of the frame.");
        setStage("capture");
        return;
      }
      setCandidates(products);
      setStage("review");
    } catch (e) {
      setError(e.message || "Processing failed.");
      setStage("capture");
    }
  };

  const handleImport = async (selected) => {
    setImporting(true);
    try {
      const records = selected.map(({ name, sku, barcode, price, cost, quantity, category, unit, low_stock_threshold }) => ({
        name,
        sku: sku || "",
        barcode: barcode || "",
        price: Number(price) || 0,
        cost: Number(cost) || 0,
        quantity: Number(quantity) || 0,
        category: category || "",
        unit: unit || "pcs",
        low_stock_threshold: Number(low_stock_threshold) || 10,
        status: "active",
        source_image_url: sourceImageUrl,
      }));
      await onImported(records);
      onClose();
    } catch (e) {
      setError(e.message || "Import failed.");
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <ScanText className="w-5 h-5 text-purple-600" />
            Catalogue Scanner
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {stage === "capture" && (
            <div className="text-center space-y-5 py-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-50 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Snap a Catalogue Page</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Take a clear photo of a handwritten price list or supplier catalogue. AI reads each line — even messy handwriting — and turns it into editable product entries you can review before importing.
                </p>
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2 max-w-md mx-auto">{error}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button onClick={() => cameraRef.current?.click()} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                  <Camera className="w-4 h-4" /> Take Photo
                </Button>
                <Button variant="outline" onClick={() => uploadRef.current?.click()} className="gap-2">
                  <Upload className="w-4 h-4" /> Upload Image
                </Button>
              </div>
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
          )}

          {stage === "processing" && (
            <div className="text-center py-16 space-y-3">
              <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-700">Reading your catalogue...</p>
              <p className="text-xs text-slate-400">Deciphering handwriting · extracting products · auto-categorizing</p>
            </div>
          )}

          {stage === "review" && (
            <CatalogueReviewTable
              candidates={candidates}
              onChange={setCandidates}
              sourceImageUrl={sourceImageUrl}
              onImport={handleImport}
              importing={importing}
            />
          )}
        </div>
      </div>
    </div>
  );
}