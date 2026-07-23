import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Zap } from "lucide-react";

export const InteractiveVideoPlayer = ({
  videoSrc = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  title = "StockMate POS & Barcode Scanner Simulator",
  autoPlay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [useCanvasFallback, setUseCanvasFallback] = useState(true); // Default to POS canvas simulation
  const [progress, setProgress] = useState(0);

  const canvasRef = useRef(null);

  // Canvas Simulation Loop for StockMate POS
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let stepTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Barcode Laser Line Animation
      if (isPlaying) {
        stepTimer += 0.03;
        const laserY = 80 + Math.sin(stepTimer * 2) * 60;
        setProgress(Math.round(((stepTimer % 4) / 4) * 100));

        // Draw Barcode Lines
        ctx.fillStyle = "#ffffff";
        const barWidths = [4, 2, 6, 2, 8, 3, 5, 2, 7, 3, 4, 8, 2, 5];
        let currentX = 220;
        barWidths.forEach(w => {
          ctx.fillRect(currentX, 60, w, 100);
          currentX += w + 6;
        });

        // Red Laser Beam
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(180, laserY);
        ctx.lineTo(540, laserY);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // POS Receipt Panel
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(140, 200, 440, 160, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "left";
      ctx.fillText("RECEIPT SCANNER #0841 — STOCKMATE POS", 160, 230);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px monospace";
      ctx.fillText("ITEM: Espresso Bean Blend 1kg  x2   $42.00", 160, 260);
      ctx.fillText("ITEM: Cold Brew Concentrate 500ml x1 $14.50", 160, 280);
      ctx.fillText("TOTAL SUB-10MS TRANSACTION:        $56.50", 160, 320);

      ctx.fillStyle = "#22c55e";
      ctx.fillText("[PAYMENT CONFIRMED — INDEXEDDB SYNCED]", 160, 345);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group text-left">
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-200">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <Zap className="h-3.5 w-3.5 text-sky-400" />
        <span>StockMate POS Barcode Simulator</span>
      </div>

      <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={720}
          height={405}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setIsPlaying(!isPlaying)}
        />

        {!isPlaying && (
          <div 
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20 cursor-pointer group-hover:bg-black/20 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-sky-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all border border-sky-400/50">
              <Play className="h-8 w-8 ml-1" />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-4 text-slate-300">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <span className="text-xs font-mono font-medium text-slate-400">{title}</span>
        </div>

        <div className="flex-1 max-w-xs bg-slate-800 rounded-full h-2 overflow-hidden relative">
          <div 
            className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[11px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">0ms Fallback</span>
      </div>
    </div>
  );
};
