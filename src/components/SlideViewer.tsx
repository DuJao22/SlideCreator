import { useState, useRef, useEffect } from "react";
import { PresentationData } from "../lib/gemini";
import { Project } from "./ProjectList";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, ChevronRight, Download, Copy, Loader2, ArrowLeft, Instagram, Sparkles, FileCode,
  Laptop, Briefcase, GraduationCap, HeartPulse, Palette, FlaskConical, MessageSquare, 
  ShieldCheck, Users, TrendingUp, Lightbulb, Target, Award, LayoutTemplate, Eye, EyeOff
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DESIGN_MODELS = [
  { 
    id: 'modern', 
    name: 'Moderno', 
    bg: 'bg-[#050505]', 
    cardBg: 'bg-white/5',
    accent: 'indigo', 
    iconBg: 'bg-indigo-500/20', 
    iconColor: 'text-indigo-400',
    font: 'font-sans'
  },
  { 
    id: 'minimal', 
    name: 'Minimalista', 
    bg: 'bg-zinc-950', 
    cardBg: 'bg-zinc-900',
    accent: 'zinc', 
    iconBg: 'bg-zinc-800', 
    iconColor: 'text-zinc-300',
    font: 'font-mono'
  },
  { 
    id: 'vibrant', 
    name: 'Vibrante', 
    bg: 'bg-slate-950', 
    cardBg: 'bg-emerald-900/20',
    accent: 'emerald', 
    iconBg: 'bg-emerald-500/20', 
    iconColor: 'text-emerald-400',
    font: 'font-sans'
  },
  { 
    id: 'corporate', 
    name: 'Corporativo', 
    bg: 'bg-[#0f172a]', 
    cardBg: 'bg-[#1e293b]',
    accent: 'blue', 
    iconBg: 'bg-blue-500/20', 
    iconColor: 'text-blue-400',
    font: 'font-sans'
  },
];

const getIconForCategory = (category: string) => {
  if (!category) return Sparkles;
  const cat = category.toLowerCase();
  if (cat.includes('tech') || cat.includes('data')) return Laptop;
  if (cat.includes('business') || cat.includes('finance')) return Briefcase;
  if (cat.includes('edu')) return GraduationCap;
  if (cat.includes('health')) return HeartPulse;
  if (cat.includes('art') || cat.includes('design')) return Palette;
  if (cat.includes('science')) return FlaskConical;
  if (cat.includes('communication')) return MessageSquare;
  if (cat.includes('security')) return ShieldCheck;
  if (cat.includes('people') || cat.includes('team')) return Users;
  if (cat.includes('growth') || cat.includes('trend')) return TrendingUp;
  if (cat.includes('idea') || cat.includes('innovation')) return Lightbulb;
  if (cat.includes('target') || cat.includes('goal')) return Target;
  if (cat.includes('success') || cat.includes('award')) return Award;
  return Sparkles;
};

interface SlideViewerProps {
  presentation: PresentationData;
  project?: Project | null;
  onBack: () => void;
}

export function SlideViewer({ presentation: initialPresentation, project, onBack }: SlideViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [presentation, setPresentation] = useState(initialPresentation);
  const [cleanView, setCleanView] = useState(false);

  useEffect(() => {
    setPresentation(initialPresentation);
  }, [initialPresentation]);
  const [exporting, setExporting] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(DESIGN_MODELS[0].id);
  const [mobileTab, setMobileTab] = useState<'preview' | 'script' | 'caption' | 'edit'>('preview');
  
  const slidesRef = useRef<HTMLDivElement>(null);

  const selectedModel = DESIGN_MODELS.find(m => m.id === selectedModelId) || DESIGN_MODELS[0];
  const currentSlide = presentation.slides[currentIndex];
  console.log("Current Slide Data:", currentSlide);

  const updateSlide = (updates: Partial<typeof currentSlide>) => {
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map((s, i) => i === currentIndex ? { ...s, ...updates } : s)
    }));
  };

  const handleNext = () => {
    if (currentIndex < presentation.slides.length - 1) setCurrentIndex(c => c + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(c => c - 1);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setCleanView(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreenAndCleanView = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setCleanView(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setCleanView(false);
    }
  };

  const handleCopyContent = () => {
    let content = `Apresentação gerada por SlideAI\n\n`;
    presentation.slides.forEach((slide, i) => {
      content += `Slide ${i + 1}: ${slide.title}\n`;
      content += `Conteúdo:\n`;
      if (slide.layout === 'grid' && slide.gridItems) {
        slide.gridItems.forEach(item => content += `- ${item.title}: ${item.description}\n`);
      } else {
        (slide.content || []).forEach(c => content += `- ${c}\n`);
      }
      content += `\nRoteiro de Fala:\n${slide.script}\n\n-------------------\n\n`;
    });
    content += `\nLegenda para Instagram:\n${presentation.instagramCaption}`;
    
    navigator.clipboard.writeText(content);
    alert("Conteúdo copiado para a área de transferência!");
  };

  const handleDownloadImage = async () => {
    const slideElement = document.querySelector('.slide.active') as HTMLElement;
    if (!slideElement) return;
    
    const canvas = await html2canvas(slideElement, {
      backgroundColor: null,
      scale: 2,
    });
    
    const link = document.createElement('a');
    link.download = `slide-${currentIndex + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!slidesRef.current) return;
    setExporting(true);
    
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1920, 1080]
      });

      const slideElements = slidesRef.current.querySelectorAll('.pdf-slide');
      
      // Helper to get hex color from tailwind class
      const getBackgroundColor = (bgClass: string) => {
        if (bgClass.includes('#')) {
          return bgClass.match(/#([0-9a-fA-F]{6})/)?.[0] || '#141414';
        }
        if (bgClass.includes('zinc-950')) return '#09090b';
        if (bgClass.includes('slate-950')) return '#020617';
        return '#141414';
      };

      const bgColor = getBackgroundColor(selectedModel.bg);
      
      for (let i = 0; i < slideElements.length; i++) {
        const el = slideElements[i] as HTMLElement;
        const canvas = await html2canvas(el, { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: bgColor,
          width: 1920,
          height: 1080,
          onclone: (clonedDoc) => {
            // Remove or replace oklab colors in the cloned document
            const elements = clonedDoc.querySelectorAll('*');
            elements.forEach((element) => {
              const style = clonedDoc.defaultView?.getComputedStyle(element);
              if (!style) return;
              ['color', 'background-color', 'border-color', 'fill', 'stroke', 'box-shadow', 'text-shadow'].forEach((prop) => {
                const value = style.getPropertyValue(prop);
                if (value && (value.includes('oklab') || value.includes('oklch'))) {
                  if (prop === 'box-shadow' || prop === 'text-shadow') {
                    (element as HTMLElement).style.setProperty(prop, 'none');
                  } else {
                    (element as HTMLElement).style.setProperty(prop, 'black');
                  }
                }
              });
            });
          }
        });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 1920, 1080);
      }
      
      pdf.save("apresentacao-slideai.pdf");
    } catch (error) {
      console.error("PDF Export failed", error);
      alert("Erro ao exportar PDF. Tente novamente.");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadHTML = () => {
    let htmlContent = '<!DOCTYPE html>\n' +
      '<html lang="pt-BR">\n' +
      '<head>\n' +
      '  <meta charset="UTF-8">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '  <title>' + (presentation.slides[0]?.title || 'Apresentação SlideAI') + '</title>\n' +
      '  <style>\n' +
      '    :root { --bg: #050505; --card-bg: rgba(255, 255, 255, 0.05); --accent: #818cf8; --text: #ffffff; --text-muted: #9ca3af; }\n' +
      '    body, html { margin: 0; padding: 0; width: 100%; min-height: 100vh; height: auto; background-color: var(--bg); color: var(--text); font-family: \'Inter\', system-ui, -apple-system, sans-serif; overflow-y: auto; }\n' +
      '    .slide { display: none; width: 100%; min-height: 100vh; height: auto; flex-direction: column; padding: 4rem; box-sizing: border-box; opacity: 0; transition: opacity 0.5s ease; }\n' +
      '    .slide.active { display: flex; opacity: 1; z-index: 10; }\n' +
      '    .header { margin-bottom: 3rem; }\n' +
      '    .title { font-size: 3.5rem; font-weight: 700; margin: 0; line-height: 1.1; letter-spacing: -0.02em; }\n' +
      '    .content-wrapper { display: flex; gap: 4rem; flex: 1; align-items: flex-start; }\n' +
      '    .text-content { flex: 1; font-size: 1.5rem; line-height: 1.6; color: var(--text-muted); font-weight: 300; }\n' +
      '    .text-content ul { padding-left: 0; list-style: none; margin: 0; }\n' +
      '    .text-content li { margin-bottom: 1.5rem; display: flex; align-items: flex-start; gap: 1.5rem; }\n' +
      '    .bullet { width: 0.8rem; height: 0.8rem; border-radius: 50%; background: var(--accent); margin-top: 0.6rem; flex-shrink: 0; }\n' +
      '    .icon-content { width: 40%; display: flex; justify-content: center; align-items: center; }\n' +
      '    .icon-wrapper { width: 20vw; height: 20vw; max-width: 350px; max-height: 350px; border-radius: 2rem; background: var(--card-bg); display: flex; justify-content: center; align-items: center; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.4); overflow: hidden; }\n' +
      '    .icon-wrapper svg { width: 50%; height: 50%; color: var(--accent); }\n' +
      '    .grid-wrapper { display: flex; gap: 3rem; flex: 1; align-items: flex-start; }\n' +
      '    .grid-container { flex: 1; display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }\n' +
      '    .grid-item { background: var(--card-bg); border: 1px solid rgba(255,255,255,0.05); border-radius: 1.5rem; padding: 2rem; display: flex; flex-direction: column; gap: 1rem; }\n' +
      '    .grid-icon { width: 3rem; height: 3rem; border-radius: 1rem; background: rgba(99,102,241,0.2); display: flex; align-items: center; justify-content: center; color: var(--accent); font-weight: bold; margin-bottom: 0.5rem; }\n' +
      '    .grid-title { font-size: 1.5rem; font-weight: 600; margin: 0; color: var(--text); }\n' +
      '    .grid-desc { font-size: 1.1rem; color: var(--text-muted); margin: 0; line-height: 1.5; }\n' +
      '    .footer { margin-top: auto; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.15em; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 2rem; font-weight: 500; }\n' +
      '    @media (max-width: 1024px) {\n' +
      '      .slide { padding: 2rem; }\n' +
      '      .title { font-size: 2.5rem; }\n' +
      '      .content-wrapper, .grid-wrapper { flex-direction: column; }\n' +
      '      .text-content, .icon-content, .grid-container, .grid-wrapper > div:last-child { width: 100%; }\n' +
      '      .icon-wrapper { width: 50vw; height: 50vw; }\n' +
      '      .grid-container { grid-template-columns: 1fr; }\n' +
      '    }\n' +
      '    .controls { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 100; display: flex; gap: 1rem; background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 9999px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }\n' +
      '    button { background: var(--accent); border: none; color: white; padding: 1rem 2rem; border-radius: 9999px; cursor: pointer; font-size: 1.1rem; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }\n' +
      '    button:hover { background: #6366f1; transform: translateY(-2px); }\n' +
      '    button:disabled { background: #374151; cursor: not-allowed; opacity: 0.6; }\n' +
      '  </style>\n' +
      '</head>\n' +
      '<body>\n';

    presentation.slides.forEach((slide, i) => {
      const isGrid = slide.layout === 'grid';
      
      const iconOrImageHtml = slide.imageUrl ?
        '<img src="' + slide.imageUrl + '" style="width: 100%; height: 100%; object-fit: cover;" referrerPolicy="no-referrer" />' :
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>';

      let contentHtml = '';
      
      if (isGrid && slide.gridItems) {
        const gridItemsHtml = slide.gridItems.map((item) => 
          '<div class="grid-item">' +
          '  <div class="grid-icon">✨</div>' +
          '  <h3 class="grid-title">' + item.title + '</h3>' +
          '  <p class="grid-desc">' + item.description + '</p>' +
          '</div>'
        ).join('');
        
        contentHtml = '<div class="grid-wrapper">' +
          '<div class="grid-container">' + gridItemsHtml + '</div>' +
          '<div class="icon-content"><div class="icon-wrapper">' + iconOrImageHtml + '</div></div>' +
          '</div>';
      } else {
        const listHtml = (slide.content || []).map(item => '<li><div class="bullet"></div><span>' + item + '</span></li>').join('');
        
        contentHtml = '<div class="content-wrapper">' +
          '<div class="text-content"><ul>' + listHtml + '</ul></div>' +
          '<div class="icon-content"><div class="icon-wrapper">' + iconOrImageHtml + '</div></div>' +
          '</div>';
      }

      htmlContent += '<div class="slide ' + (i === 0 ? 'active' : '') + '" id="slide-' + i + '">' +
        '<div class="header"><h2 class="title">' + slide.title + '</h2></div>' +
        contentHtml +
        '<div class="footer">' +
        '  <span>SlideAI Professional</span>' +
        '  <span>' + (i + 1) + ' / ' + presentation.slides.length + '</span>' +
        '</div>' +
        '</div>';
    });

    htmlContent += '<div class="controls">' +
      '<button id="prevBtn" onclick="prevSlide()" disabled>Anterior</button>' +
      '<button id="nextBtn" onclick="nextSlide()">Próximo</button>' +
      '</div>' +
      '<script>' +
      '  let currentSlide = 0;' +
      '  const totalSlides = ' + presentation.slides.length + ';' +
      '  const slides = document.querySelectorAll(".slide");' +
      '  const prevBtn = document.getElementById("prevBtn");' +
      '  const nextBtn = document.getElementById("nextBtn");' +
      '  function updateButtons() {' +
      '    prevBtn.disabled = currentSlide === 0;' +
      '    nextBtn.disabled = currentSlide === totalSlides - 1;' +
      '  }' +
      '  function showSlide(index) {' +
      '    slides.forEach(s => s.classList.remove("active"));' +
      '    slides[index].classList.add("active");' +
      '    updateButtons();' +
      '  }' +
      '  function nextSlide() {' +
      '    if (currentSlide < totalSlides - 1) {' +
      '      currentSlide++;' +
      '      showSlide(currentSlide);' +
      '    }' +
      '  }' +
      '  function prevSlide() {' +
      '    if (currentSlide > 0) {' +
      '      currentSlide--;' +
      '      showSlide(currentSlide);' +
      '    }' +
      '  }' +
      '  updateButtons();' +
      '</script>' +
      '</body>' +
      '</html>';

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (presentation.slides[0]?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'apresentacao') + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const CurrentIcon = getIconForCategory(currentSlide.iconCategory);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050505]">
      {/* Header - Hide if cleanView */}
      {!cleanView && (
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 shrink-0 bg-[#0a0a0a]">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={toggleFullscreenAndCleanView} className="flex items-center gap-2 px-2 md:px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
              {cleanView ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden md:inline">{cleanView ? 'Sair do Clean View' : 'Clean View'}</span>
            </button>
            <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
              <LayoutTemplate className="w-4 h-4 text-gray-400 ml-2" />
              <select 
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="bg-transparent text-sm text-white border-none focus:ring-0 py-1 pl-2 pr-8 cursor-pointer appearance-none outline-none"
              >
                {DESIGN_MODELS.map(model => (
                  <option key={model.id} value={model.id} className="bg-zinc-900 text-white">
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="hidden md:block w-px h-6 bg-white/10 mx-2"></div>
            
            <button onClick={handleCopyContent} className="flex items-center gap-2 px-2 md:px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
              <Copy className="w-4 h-4" />
              <span className="hidden md:inline">Copiar</span>
            </button>
            <button onClick={handleDownloadHTML} className="flex items-center gap-2 px-2 md:px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-sm font-medium transition-colors">
              <FileCode className="w-4 h-4" />
              <span className="hidden md:inline">HTML</span>
            </button>
            <button onClick={handleDownloadPDF} disabled={exporting} className="flex items-center gap-2 px-2 md:px-4 py-2 rounded-lg bg-[#00FF00] text-black hover:bg-[#00CC00] text-sm font-semibold transition-colors disabled:opacity-50">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden md:inline">PDF</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {cleanView && (
          <>
            <button 
              onClick={() => setCleanView(false)} 
              className="fixed top-4 right-4 z-[100] p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-black/70 transition-all"
              title="Sair do Clean View"
            >
              <EyeOff className="w-6 h-6" />
            </button>
            <button 
              onClick={handleDownloadImage} 
              className="fixed top-4 right-20 z-[100] p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-black/70 transition-all"
              title="Baixar Slide como Imagem"
            >
              <Download className="w-6 h-6" />
            </button>
          </>
        )}
        {/* Slide Preview Area */}
        <div className={`${mobileTab !== 'preview' ? 'hidden' : 'flex'} lg:flex flex-1 flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden`}>
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className={`w-full max-w-6xl h-auto min-h-[500px] ${selectedModel.bg} ${selectedModel.font} rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative flex flex-col ring-1 ring-white/5 transition-colors duration-500`}
          >
            {/* Professional Background Image */}
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden opacity-20">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                alt="Background" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/40"></div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentIndex}-${currentSlide.layout}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative p-8 md:p-14 flex flex-col z-10 flex-1"
              >
                {/* Slide Content */}
                <div className="flex-1 flex flex-col">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="mb-8 md:mb-12 max-w-4xl shrink-0 flex justify-between items-center"
                  >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-tight">{currentSlide.title}</h2>
                    <select 
                      value={currentSlide.layout || 'split'}
                      onChange={(e) => {
                        console.log("Layout changed to:", e.target.value);
                        const newSlides = [...presentation.slides];
                        newSlides[currentIndex] = { ...newSlides[currentIndex], layout: e.target.value as 'split' | 'grid' };
                        console.log("New slides:", newSlides);
                        setPresentation(prev => ({ ...prev, slides: newSlides }));
                      }}
                      className="bg-white/10 text-white text-sm rounded-lg px-3 py-2 border border-white/10 outline-none cursor-pointer"
                    >
                      <option value="split">Split</option>
                      <option value="grid">Grid</option>
                    </select>
                  </motion.div>
                  
                  {currentSlide.layout === 'grid' ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-4">
                        {currentSlide.gridItems?.map((item, i) => (
                          <div
                            key={i}
                            className={`${selectedModel.cardBg} border border-white/5 rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/10 transition-colors`}
                          >
                            <div className={`w-10 h-10 rounded-xl ${selectedModel.iconBg} flex items-center justify-center ${selectedModel.iconColor} shrink-0`}>
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-white leading-tight">{item.title}</h3>
                            <p className="text-gray-400 text-xs leading-relaxed flex-1">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col md:flex-row gap-12 overflow-hidden">
                      <div className="flex-1 flex flex-col justify-center overflow-y-auto pr-4 custom-scrollbar">
                        <ul className="space-y-8">
                          {(currentSlide.content || []).map((item, i) => (
                            <motion.li 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 + 0.3, duration: 0.5, ease: "easeOut" }}
                              key={i} 
                              className="flex items-start gap-5 text-xl md:text-2xl text-gray-200 leading-relaxed font-light"
                            >
                              <span className={`w-2 h-2 rounded-full bg-${selectedModel.accent}-500 mt-3.5 shrink-0`} />
                              <span>{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Split Layout Icon Area - Subtle and Professional */}
                      <div className="w-full md:w-[30%] flex flex-col items-center justify-center shrink-0">
                        <div className={`w-48 h-48 md:w-64 md:h-64 rounded-3xl flex items-center justify-center ${selectedModel.cardBg} border border-white/5 overflow-hidden`}>
                          {currentSlide.imageUrl ? (
                            <img src={currentSlide.imageUrl} alt={currentSlide.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <CurrentIcon className={`w-24 h-24 md:w-32 md:h-32 ${selectedModel.iconColor} opacity-70`} />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Slide Footer */}
                <div className="mt-auto pt-8 flex justify-between items-center text-xs text-gray-500 font-medium border-t border-white/5 uppercase tracking-widest">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full bg-${selectedModel.accent}-500`}></span>
                    <span>SlideAI Professional</span>
                  </div>
                  <span>{currentIndex + 1} / {presentation.slides.length}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Navigation Controls - Floating Bar */}
          {!cleanView && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 rounded-full shadow-2xl border border-white/10 z-50">
              <button 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="font-mono text-sm font-medium px-2">{currentIndex + 1} / {presentation.slides.length}</span>
              <button 
                onClick={handleNext} 
                disabled={currentIndex === presentation.slides.length - 1}
                className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* Sidebar: Script & Extras */}
        <div className={`${mobileTab === 'preview' ? 'hidden' : 'flex'} lg:flex w-full lg:w-96 border-l border-white/10 bg-[#0a0a0a] flex-col shrink-0 overflow-y-auto`}>
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-[#00FF00]">
              <Sparkles className="w-5 h-5" />
              {mobileTab === 'script' ? 'Roteiro de Fala' : mobileTab === 'caption' ? 'Legenda Instagram' : 'Editar Slide'}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {mobileTab === 'script' ? 'O que dizer neste slide' : mobileTab === 'caption' ? 'Legenda para redes sociais' : 'Edite o conteúdo do slide'}
            </p>
          </div>
          <div className="p-6 flex-1">
            {mobileTab === 'edit' ? (
              <div className="space-y-4">
                <input 
                  value={currentSlide.title}
                  onChange={(e) => updateSlide({ title: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl p-3 text-white"
                  placeholder="Título"
                />
                {currentSlide.layout === 'split' ? (
                  <textarea 
                    value={currentSlide.content?.join('\n')}
                    onChange={(e) => updateSlide({ content: e.target.value.split('\n') })}
                    className="w-full h-40 bg-[#141414] border border-white/10 rounded-xl p-3 text-white"
                    placeholder="Conteúdo (um por linha)"
                  />
                ) : (
                  <div className="space-y-2">
                    {currentSlide.gridItems?.map((item, i) => (
                      <div key={i} className="bg-[#141414] p-3 rounded-xl border border-white/10 space-y-2">
                        <input 
                          value={item.title}
                          onChange={(e) => updateSlide({ gridItems: currentSlide.gridItems?.map((gi, idx) => idx === i ? { ...gi, title: e.target.value } : gi) })}
                          className="w-full bg-transparent border-b border-white/10 text-white"
                        />
                        <textarea 
                          value={item.description}
                          onChange={(e) => updateSlide({ gridItems: currentSlide.gridItems?.map((gi, idx) => idx === i ? { ...gi, description: e.target.value } : gi) })}
                          className="w-full bg-transparent border-b border-white/10 text-white"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#141414] p-5 rounded-xl border border-white/5 text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                {mobileTab === 'script' ? currentSlide.script : presentation.instagramCaption}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Tab Bar */}
      {!cleanView && (
        <div className="lg:hidden flex border-t border-white/10 bg-[#0a0a0a]">
          <button onClick={() => setMobileTab('preview')} className={`flex-1 p-4 text-sm font-medium ${mobileTab === 'preview' ? 'text-white border-t-2 border-[#00FF00]' : 'text-gray-500'}`}>Preview</button>
          <button onClick={() => setMobileTab('script')} className={`flex-1 p-4 text-sm font-medium ${mobileTab === 'script' ? 'text-white border-t-2 border-[#00FF00]' : 'text-gray-500'}`}>Roteiro</button>
          <button onClick={() => setMobileTab('caption')} className={`flex-1 p-4 text-sm font-medium ${mobileTab === 'caption' ? 'text-white border-t-2 border-[#00FF00]' : 'text-gray-500'}`}>Instagram</button>
          <button onClick={() => setMobileTab('edit')} className={`flex-1 p-4 text-sm font-medium ${mobileTab === 'edit' ? 'text-white border-t-2 border-[#00FF00]' : 'text-gray-500'}`}>Editar</button>
        </div>
      )}

      {/* Hidden container for PDF export */}
      <div className="fixed top-0 left-[-9999px] z-[-50]" ref={slidesRef}>
        {presentation.slides.map((slide, i) => {
          const SlideIcon = getIconForCategory(slide.iconCategory);
          return (
            <div key={i} className={`pdf-slide w-[1920px] h-[1080px] ${selectedModel.bg} flex flex-col relative text-[#ffffff] ${selectedModel.font} overflow-hidden`}>
              {/* Subtle Atmospheric Gradients */}
              <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[rgba(49,46,129,0.1)] blur-[120px] pointer-events-none"></div>
              <div className="absolute -bottom-[50%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[rgba(6,78,59,0.05)] blur-[120px] pointer-events-none"></div>
              
              <div className="relative z-10 flex-1 flex flex-col p-28">
                <div className="mb-24 max-w-6xl">
                  <h2 className="text-7xl font-semibold text-[#ffffff] tracking-tight leading-tight">{slide.title}</h2>
                </div>
                
                {slide.layout === 'grid' ? (
                  <div className="flex-1 flex gap-24">
                    <div className="flex-1 grid grid-cols-2 gap-12">
                      {slide.gridItems?.map((item, j) => (
                        <div key={j} className={`${selectedModel.cardBg} border border-[rgba(255,255,255,0.05)] rounded-[2rem] p-12 flex flex-col gap-6`}>
                          <div className={`w-20 h-20 rounded-[1.5rem] ${selectedModel.iconBg} flex items-center justify-center ${selectedModel.iconColor} mb-4 shrink-0 border border-[rgba(255,255,255,0.05)]`}>
                            <Sparkles className="w-10 h-10" />
                          </div>
                          <h3 className="text-4xl font-semibold text-white leading-tight">{item.title}</h3>
                          <p className="text-2xl text-[#9ca3af] leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="w-[600px] flex items-center justify-center shrink-0">
                      <div className={`w-full aspect-square rounded-[3rem] overflow-hidden border border-[rgba(255,255,255,0.1)] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] flex items-center justify-center ${selectedModel.cardBg}`}>
                        <SlideIcon className={`w-64 h-64 ${selectedModel.iconColor} opacity-80`} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex gap-24">
                    <div className="flex-1 flex flex-col justify-center">
                      <ul className="space-y-14">
                        {(slide.content || []).map((item, j) => (
                          <li key={j} className="flex items-start gap-8 text-4xl text-[#d1d5db] leading-relaxed font-light">
                            <div className={`w-4 h-4 rounded-full bg-${selectedModel.accent}-400 mt-5 shrink-0`} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="w-[800px] flex items-center justify-center shrink-0">
                      <div className={`w-full aspect-square rounded-[3rem] overflow-hidden border border-[rgba(255,255,255,0.1)] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] flex items-center justify-center ${selectedModel.cardBg}`}>
                        {slide.imageUrl ? (
                          <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <SlideIcon className={`w-80 h-80 ${selectedModel.iconColor} opacity-80`} />
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-auto pt-12 flex justify-between items-center text-2xl text-[#6b7280] border-t border-[rgba(255,255,255,0.05)] font-medium uppercase tracking-widest">
                  <div className="flex items-center gap-5">
                    <span className={`w-4 h-4 rounded-full bg-${selectedModel.accent}-500`}></span>
                    <span>SlideAI Professional</span>
                  </div>
                  <span>{i + 1} / {presentation.slides.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
