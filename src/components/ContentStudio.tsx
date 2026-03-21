'use client';
import { useState, useEffect } from 'react';
import { Video, Mic, Film, CheckCircle2, Plus, Trash2, X, Save, FileText, ExternalLink } from 'lucide-react';

interface VideoProject {
  id: string;
  title: string;
  status: 'idea' | 'scripting' | 'filming' | 'editing' | 'published';
  notes: string;
  filePath?: string;
}

export default function ContentStudio() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null);

  useEffect(() => {
    fetch('/api/videos').then(res => res.json()).then(data => setProjects(data.projects));
  }, []);

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', title: newTitle, status: 'idea' })
    });
    const data = await res.json();
    setProjects(data.projects);
    setNewTitle('');
  };

  const updateStatus = async (id: string, status: VideoProject['status']) => {
    // Optimistic update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    if (selectedProject?.id === id) {
        setSelectedProject(prev => prev ? { ...prev, status } : null);
    }
    
    await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, status })
    });
  };

  const saveNotes = async () => {
    if (!selectedProject) return;
    
    // Optimistic update
    setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, notes: selectedProject.notes, filePath: selectedProject.filePath } : p));

    await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id: selectedProject.id, notes: selectedProject.notes, filePath: selectedProject.filePath })
    });
  };

  const openFile = async (filePath: string | undefined) => {
    if (!filePath) return;
    await fetch('/api/system/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath })
    });
  };

  const deleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (selectedProject?.id === id) setSelectedProject(null);
        
        await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
        });
    }
  };

  const columns = [
    { id: 'idea', label: 'Ideas', icon: <Video size={16} className="text-yellow-500" /> },
    { id: 'scripting', label: 'Scripting', icon: <Mic size={16} className="text-blue-500" /> },
    { id: 'filming', label: 'Filming', icon: <Film size={16} className="text-red-500" /> },
    { id: 'editing', label: 'Editing', icon: <Film size={16} className="text-purple-500" /> },
    { id: 'published', label: 'Published', icon: <CheckCircle2 size={16} className="text-green-500" /> },
  ];

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-2xl font-bold text-white mb-1">Content Studio</h2>
           <p className="text-sm text-gray-500">Manage your production pipeline.</p>
        </div>
        
        <form onSubmit={addProject} className="flex gap-2">
          <input 
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="New video idea..."
            className="bg-[#14161b] border border-[#282a36] text-sm px-4 py-2 rounded-lg w-64 focus:outline-none focus:border-indigo-500 text-white"
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Plus size={16} /> Add
          </button>
        </form>
      </div>

      <div className="flex-1 grid grid-cols-5 gap-4 overflow-x-auto min-w-[1000px] pb-4">
        {columns.map(col => (
          <div key={col.id} className="bg-[#14161b]/50 border border-[#282a36] rounded-lg flex flex-col h-full">
            <div className="p-3 border-b border-[#282a36] flex items-center gap-2 font-medium text-sm text-gray-300">
              {col.icon}
              {col.label}
              <span className="ml-auto bg-[#282a36] text-xs px-2 py-0.5 rounded-full text-gray-400">
                {projects.filter(p => p.status === col.id).length}
              </span>
            </div>
            
            <div className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              {projects.filter(p => p.status === col.id).map(project => (
                <div 
                    key={project.id} 
                    onClick={() => setSelectedProject(project)}
                    className={`
                        p-3 rounded border cursor-pointer transition-all hover:border-indigo-500/50 group shadow-sm relative
                        ${selectedProject?.id === project.id ? 'bg-[#2a2d36] border-indigo-500 ring-1 ring-indigo-500/30' : 'bg-[#1c1e24] border-[#282a36]'}
                    `}
                >
                  <p className="text-sm text-gray-200 font-medium mb-2 line-clamp-2">{project.title}</p>
                  
                  {project.notes && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
                          <FileText size={10} />
                          <span>Has notes</span>
                      </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#282a36]/50" onClick={e => e.stopPropagation()}>
                    <select 
                      value={project.status}
                      onChange={(e) => updateStatus(project.id, e.target.value as any)}
                      className="bg-transparent text-[10px] uppercase font-bold text-gray-500 focus:outline-none cursor-pointer hover:text-indigo-400"
                    >
                      {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    
                    <button onClick={() => deleteProject(project.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over Panel for Details */}
      {selectedProject && (
          <div className="absolute top-0 right-0 h-full w-[500px] bg-[#14161b] border-l border-[#282a36] shadow-2xl p-6 flex flex-col transform transition-transform duration-300 z-50">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white truncate pr-4">{selectedProject.title}</h3>
                  <button onClick={() => setSelectedProject(null)} className="text-gray-500 hover:text-white">
                      <X size={20} />
                  </button>
              </div>

              <div className="flex flex-col gap-4 mb-6 text-sm">
                  <div className="flex flex-col gap-1">
                      <label className="text-gray-500 text-xs uppercase font-bold">Status</label>
                      <select 
                        value={selectedProject.status}
                        onChange={(e) => updateStatus(selectedProject.id, e.target.value as any)}
                        className="bg-[#1c1e24] border border-[#282a36] text-gray-300 rounded px-2 py-2 focus:outline-none focus:border-indigo-500 w-1/3"
                      >
                        {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                  </div>

                  <div className="flex flex-col gap-1">
                      <label className="text-gray-500 text-xs uppercase font-bold">Script File Path (Local)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={selectedProject.filePath || ''}
                          onChange={(e) => setSelectedProject({ ...selectedProject, filePath: e.target.value })}
                          placeholder="e.g. G:\My Drive\Content\Scripts\video.md"
                          className="flex-1 bg-[#1c1e24] border border-[#282a36] text-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        />
                        {selectedProject.filePath && (
                          <button 
                            onClick={() => openFile(selectedProject.filePath)}
                            className="bg-[#282a36] hover:bg-[#343746] text-indigo-400 px-3 py-2 rounded border border-[#282a36] flex items-center gap-2 transition-colors"
                            title="Open file in default editor"
                          >
                            <ExternalLink size={14} /> Open
                          </button>
                        )}
                      </div>
                  </div>
              </div>

              <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-500 text-xs uppercase font-bold">Notes</label>
                    <button 
                        onClick={saveNotes}
                        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        <Save size={12} /> Save
                    </button>
                  </div>
                  <textarea 
                    className="flex-1 bg-[#0f1115] border border-[#282a36] rounded-lg p-4 text-sm text-gray-300 font-mono focus:outline-none focus:border-indigo-500/50 resize-none leading-relaxed"
                    value={selectedProject.notes || ''}
                    onChange={(e) => setSelectedProject({ ...selectedProject, notes: e.target.value })}
                    placeholder="Write your notes, or research here..."
                  />
              </div>
          </div>
      )}
    </div>
  );
}
