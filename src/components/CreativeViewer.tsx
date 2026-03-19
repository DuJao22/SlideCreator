import React, { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { CreativeData } from "../lib/gemini";
import { Download, Copy, ArrowLeft } from "lucide-react";

interface CreativeViewerProps {
  creative: CreativeData;
  onBack: () => void;
}

export function CreativeViewer({ creative, onBack }: CreativeViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = creative.imageUrl;
    img.onload = () => {
      // Set canvas size based on aspect ratio
      const [w, h] = creative.aspectRatio.split(":").map(Number);
      const scale = 1000 / w;
      canvas.width = 1000;
      canvas.height = (h * scale);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Add text overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

      ctx.fillStyle = "white";
      ctx.font = "bold 60px sans-serif";
      ctx.fillText(creative.title, 50, canvas.height * 0.7);
      
      ctx.font = "30px sans-serif";
      ctx.fillText(creative.description, 50, canvas.height * 0.85, canvas.width - 100);
    };
  }, [creative]);

  const handleCopy = () => {
    navigator.clipboard.writeText(creative.instagramCaption);
    alert("Legenda copiada!");
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "criativo.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col p-6">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="flex-1 flex flex-col md:flex-row gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
        >
          <canvas ref={canvasRef} className="w-full h-auto" />
        </motion.div>

        <div className="w-full md:w-96 bg-[#141414] rounded-3xl p-8 border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Legenda para Instagram</h3>
          <p className="text-gray-400 mb-6 whitespace-pre-wrap">{creative.instagramCaption}</p>
          <div className="flex gap-4">
            <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 bg-white/10 py-3 rounded-xl hover:bg-white/20 transition-all">
              <Copy className="w-4 h-4" />
              Copiar
            </button>
            <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 bg-[#00FF00] text-black py-3 rounded-xl hover:bg-[#00CC00] transition-all">
              <Download className="w-4 h-4" />
              Baixar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
