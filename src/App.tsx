import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { GeneratorForm } from "./components/GeneratorForm";
import { SlideViewer } from "./components/SlideViewer";
import { ProjectList, Project } from "./components/ProjectList";
import { PresentationData } from "./lib/gemini";
import { set } from "idb-keyval";

// Declare the global aistudio object
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [view, setView] = useState<"landing" | "generator" | "viewer" | "projects">("landing");
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const handleGenerate = async (data: PresentationData, title: string) => {
    const newProject: Project = {
      id: `project_${Date.now()}`,
      title: title || "Apresentação sem título",
      date: new Date().toISOString(),
      data,
      images: {}
    };
    
    try {
      await set(newProject.id, newProject);
    } catch (error) {
      console.error("Failed to save project:", error);
    }
    
    setCurrentProject(newProject);
    setPresentation(data);
    setView("viewer");
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setPresentation(project.data);
    setView("viewer");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <main className="flex-1 flex flex-col">
        {view === "landing" && (
          <LandingPage 
            onStart={() => setView("generator")} 
            onViewProjects={() => setView("projects")}
          />
        )}
        {view === "projects" && (
          <ProjectList 
            onSelectProject={handleSelectProject}
            onNewProject={() => setView("generator")}
            onBack={() => setView("landing")}
          />
        )}
        {view === "generator" && (
          <GeneratorForm
            onGenerate={handleGenerate}
          />
        )}
        {view === "viewer" && presentation && (
          <SlideViewer
            presentation={presentation}
            project={currentProject}
            onBack={() => setView("projects")}
          />
        )}
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500 border-t border-white/5">
        Desenvolvido por João Layon
      </footer>
    </div>
  );
}
