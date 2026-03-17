import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PresentationData } from "../lib/gemini";
import { get, set, keys, del } from "idb-keyval";
import { Clock, Trash2, Play, Plus, ArrowLeft } from "lucide-react";

export interface Project {
  id: string;
  title: string;
  date: string;
  data: PresentationData;
  images: Record<number, string>;
}

interface ProjectListProps {
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
  onBack: () => void;
}

export function ProjectList({ onSelectProject, onNewProject, onBack }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectKeys = await keys();
      const loadedProjects: Project[] = [];
      
      for (const key of projectKeys) {
        if (typeof key === 'string' && key.startsWith('project_')) {
          const project = await get<Project>(key);
          if (project) {
            loadedProjects.push(project);
          }
        }
      }
      
      // Sort by date descending
      loadedProjects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setProjects(loadedProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await del(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 max-w-6xl mx-auto w-full">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold">Meus Projetos</h1>
        </div>
        <button 
          onClick={onNewProject}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00FF00] text-black font-semibold hover:bg-[#00CC00] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Projeto
        </button>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#00FF00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 opacity-50" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">Nenhum projeto salvo</h2>
          <p className="mb-8">Crie sua primeira apresentação para vê-la aqui.</p>
          <button 
            onClick={onNewProject}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Começar agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="bg-[#141414] border border-white/10 rounded-2xl p-6 hover:border-[#00FF00]/50 hover:shadow-[0_0_30px_rgba(0,255,0,0.1)] transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {project.title.charAt(0).toUpperCase()}
                </div>
                <button 
                  onClick={(e) => handleDelete(project.id, e)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{project.title}</h3>
              
              <div className="mt-auto pt-6 flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(project.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1 text-[#00FF00] font-medium">
                  <Play className="w-4 h-4" />
                  {project.data.slides.length} slides
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
