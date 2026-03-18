import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Presentation, Zap, Settings } from "lucide-react";
import { SettingsModal } from "./SettingsModal";

interface LandingPageProps {
  onStart: () => void;
  onViewProjects: () => void;
}

export function LandingPage({ onStart, onViewProjects }: LandingPageProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto w-full relative">
      <button 
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        title="Configurar API Key"
      >
        <Settings className="w-6 h-6 text-gray-400" />
      </button>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#00FF00] text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          <span>SlideAI by Layon</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
          Crie Slides Profissionais em <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF00] to-emerald-400">
            Segundos com IA
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Transforme suas ideias em apresentações incríveis. Gere estrutura, conteúdo, roteiro de fala e imagens com apenas um clique.
        </p>
        
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#00FF00] text-black font-semibold rounded-2xl overflow-hidden transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            <span className="relative z-10 text-lg">Gerar Slides Agora</span>
            <Zap className="w-5 h-5 relative z-10 group-hover:animate-pulse" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </button>
          
          <button
            onClick={onViewProjects}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#141414] border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/5 transition-colors w-full sm:w-auto"
          >
            <span className="text-lg">Meus Projetos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <FeatureCard 
            icon={<Presentation className="w-6 h-6 text-[#00FF00]" />}
            title="Estrutura Inteligente"
            description="A IA organiza seu tema em uma narrativa lógica e persuasiva."
          />
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6 text-[#00FF00]" />}
            title="Roteiro e Legendas"
            description="Receba o que falar em cada slide e legendas prontas para o Instagram."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-[#00FF00]" />}
            title="Imagens com IA"
            description="Gere imagens em alta resolução (até 4K) para ilustrar seus slides."
          />
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 hover:border-white/10 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-[#00FF00]/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
