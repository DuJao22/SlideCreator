import React, { useState } from "react";
import { motion } from "motion/react";
import { Loader2, AlertCircle, Sparkles, FileText, Image as ImageIcon } from "lucide-react";
import { generateCreative, CreativeData } from "../lib/gemini";

interface CreativeGeneratorProps {
  onGenerate: (data: CreativeData) => void;
}

export function CreativeGenerator({ onGenerate }: CreativeGeneratorProps) {
  const [theme, setTheme] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!theme.trim()) {
      setError("Por favor, digite um tema ou cole o texto.");
      return;
    }

    setLoading(true);
    try {
      const data = await generateCreative(theme, aspectRatio);
      onGenerate(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao gerar o criativo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-[#141414] rounded-3xl border border-white/10 p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Gerador de Criativos</h2>
          <p className="text-gray-400">Transforme seu tema ou texto em um criativo profissional.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Tema ou Texto Base</label>
            <textarea
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex: Promoção de 50% em todos os produtos de tecnologia..."
              className="w-full h-48 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 transition-all resize-none"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Formato da Imagem</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Story", value: "9:16" },
                { label: "Feed", value: "1:1" },
                { label: "Post", value: "4:5" }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAspectRatio(option.value)}
                  disabled={loading}
                  className={`px-4 py-3 rounded-xl border text-sm transition-all ${
                    aspectRatio === option.value
                      ? "bg-[#00FF00]/10 border-[#00FF00] text-[#00FF00]"
                      : "bg-[#0a0a0a] border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-xl text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00FF00] text-black font-semibold py-4 rounded-xl hover:bg-[#00CC00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gerando Criativo...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  <span>Gerar Criativo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
