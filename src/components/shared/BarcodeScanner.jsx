import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { X, Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader.listVideoInputDevices().then((devices) => {
      if (devices.length === 0) {
        setError("No camera found on this device.");
        return;
      }
      // Prefer back camera on mobile
      const backCamera = devices.find(d =>
        /back|rear|environment/i.test(d.label)
      );
      const deviceId = backCamera ? backCamera.deviceId : devices[0].deviceId;

      setScanning(true);
      reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
        if (result) {
          onDetected(result.getText());
          reader.reset();
          onClose();
        }
      });
    }).catch(() => {
      setError("Camera permission denied or not available.");
    });

    return () => {
      readerRef.current?.reset();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Camera className="w-5 h-5 text-emerald-600" />
            Scan Barcode
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative bg-black aspect-video">
          <video ref={videoRef} className="w-full h-full object-cover" />
          {scanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-32 border-2 border-emerald-400 rounded-lg">
                <div className="h-0.5 bg-emerald-400 animate-bounce mt-12 mx-2 rounded" />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 text-center">
          {error ? (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <CameraOff className="w-8 h-8 text-slate-300" />
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Point the camera at a barcode to scan
            </p>
          )}
          <Button variant="outline" size="sm" onClick={onClose} className="mt-3">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}