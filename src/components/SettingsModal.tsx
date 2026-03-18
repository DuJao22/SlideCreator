import React, { useState } from "react";
import { X, Loader2, CheckCircle, AlertCircle, Key } from "lucide-react";
import { validateApiKey } from "../lib/gemini";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_api_key") || "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      setError("Por favor, cole uma chave válida.");
      return;
    }
    
    setLoading(true);
    setError("");
    setStatus("idle");

    try {
      const isValid = await validateApiKey(apiKey);
      if (isValid) {
        localStorage.setItem("gemini_api_key", apiKey);
        setStatus("valid");
        setTimeout(onClose, 1500);
      } else {
        setStatus("invalid");
        setError("Chave inválida. Verifique e tente novamente.");
      }
    } catch (e) {
      setStatus("invalid");
      setError("Erro ao validar chave.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141414] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Key className="w-5 h-5 text-[#00FF00]" />
            Configurar API Key
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Cole sua chave da API Gemini abaixo para usar o sistema. A chave será salva apenas no seu navegador.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza..."
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50"
          />
          
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          {status === "valid" && (
            <div className="flex items-center gap-2 text-[#00FF00] text-sm">
              <CheckCircle className="w-4 h-4" />
              Chave validada com sucesso!
            </div>
          )}

          <button
            onClick={handleValidate}
            disabled={loading}
            className="w-full bg-[#00FF00] text-black font-semibold py-3 rounded-xl hover:bg-[#00CC00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Validar e Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
