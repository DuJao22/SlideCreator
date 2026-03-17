import React, { useState, useEffect } from "react";
import { generatePresentation, generatePresentationFromText, PresentationData } from "../lib/gemini";
import { motion } from "motion/react";
import { Loader2, AlertCircle, Sparkles, FileText, Type as TypeIcon } from "lucide-react";

interface GeneratorFormProps {
  onGenerate: (data: PresentationData, title: string) => void;
}

export function GeneratorForm({ onGenerate }: GeneratorFormProps) {
  const [mode, setMode] = useState<"theme" | "text">("theme");
  const [theme, setTheme] = useState("");
  const [baseText, setBaseText] = useState("");
  const [type, setType] = useState("Apresentação de vendas");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "theme" && !theme.trim()) {
      setError("Por favor, digite um tema.");
      return;
    }
    if (mode === "text" && !baseText.trim()) {
      setError("Por favor, cole o texto base.");
      return;
    }

    setLoading(true);
    try {
      let data;
      let projectTitle = "";
      if (mode === "theme") {
        data = await generatePresentation(theme, type, count);
        projectTitle = theme;
      } else {
        data = await generatePresentationFromText(baseText);
        projectTitle = data.slides[0]?.title || "Apresentação sem título";
      }
      
      onGenerate(data, projectTitle);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao gerar os slides. Tente novamente.");
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
          <h2 className="text-3xl font-bold mb-2">Configurar Apresentação</h2>
          <p className="text-gray-400">Preencha os detalhes para a IA criar seus slides.</p>
        </div>

        <div className="flex bg-[#0a0a0a] rounded-xl p-1 mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => setMode("theme")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "theme" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Gerar por Tema
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "text" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <FileText className="w-4 h-4" />
            Colar Texto Base
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "theme" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Tema dos slides</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: O futuro da inteligência artificial no marketing"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 transition-all"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Tipo de conteúdo</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["Apresentação de vendas", "Conteúdo para Instagram", "Aula/educacional"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      disabled={loading}
                      className={`px-4 py-3 rounded-xl border text-sm transition-all ${
                        type === t
                          ? "bg-[#00FF00]/10 border-[#00FF00] text-[#00FF00]"
                          : "bg-[#0a0a0a] border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Quantidade de slides</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="flex-1 accent-[#00FF00]"
                    disabled={loading}
                  />
                  <span className="text-xl font-mono w-8 text-center">{count}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <TypeIcon className="w-4 h-4 text-[#00FF00]" />
                Cole seu texto (A IA preservará a divisão de slides se houver)
              </label>
              <textarea
                value={baseText}
                onChange={(e) => setBaseText(e.target.value)}
                placeholder="Ex:&#10;Slide 1: Introdução...&#10;Slide 2: Desenvolvimento..."
                className="w-full h-64 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 transition-all resize-none"
                disabled={loading}
              />
            </div>
          )}

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
                  <span>Gerando com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Gerar Slides</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
