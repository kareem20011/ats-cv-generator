
import React, { useState, useEffect } from 'react';
import { CVData, CVVersion } from './types';
import Editor from './components/Editor';
import Preview from './components/Preview';
import JobMatcher from './components/JobMatcher';
import { SECTIONS, DEFAULT_ORDER, SECTION_LABELS } from './constants';

const App: React.FC = () => {
  const [versions, setVersions] = useState<CVVersion[]>(() => {
    const saved = localStorage.getItem('cv_versions_v4');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'matcher'>('editor');
  const [activeSection, setActiveSection] = useState<string>(SECTIONS.PERSONAL);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (versions.length === 0) {
      const initial: CVVersion = {
        id: crypto.randomUUID(),
        name: 'Master CV',
        data: {
          personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '' },
          professionalTitle: '',
          experiences: [],
          education: [],
          skillGroups: [],
          projects: [],
          certifications: []
        },
        summary: '',
        sectionOrder: DEFAULT_ORDER,
        hiddenSections: [],
        lastModified: Date.now()
      };
      setVersions([initial]);
      setActiveVersionId(initial.id);
    } else if (!activeVersionId) {
      setActiveVersionId(versions[0].id);
    }
  }, [versions, activeVersionId]);

  useEffect(() => {
    if (versions.length > 0) {
      localStorage.setItem('cv_versions_v4', JSON.stringify(versions));
    }
  }, [versions]);

  const activeVersion = versions.find(v => v.id === activeVersionId) || (versions.length > 0 ? versions[0] : null);

  const updateActiveVersion = (updates: Partial<CVVersion>) => {
    if (!activeVersionId) return;
    setVersions(prev => prev.map(v => v.id === activeVersionId ? { ...v, ...updates, lastModified: Date.now() } : v));
  };

  const handlePrint = () => { setShowExportMenu(false); setTimeout(() => window.print(), 200); };

  if (!activeVersion) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0f172a] text-white">
      <div className="p-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl">A</div>
            <h1 className="text-xl font-black tracking-tighter">ATS PRO</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="mb-8">
          <label className="text-xs font-black uppercase text-slate-500 mb-3 block tracking-widest">Selected Version</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={activeVersionId || ''}
            onChange={e => setActiveVersionId(e.target.value)}
          >
            {versions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>

        <nav className="space-y-1 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
          <label className="text-xs font-black uppercase text-slate-500 mb-4 block tracking-widest">Editor Sections</label>
          {activeVersion.sectionOrder.map((sid) => (
            <button 
              key={sid}
              onClick={() => { setActiveSection(sid); setIsSidebarOpen(false); if(window.innerWidth < 768) setMobileView('edit'); }}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${activeSection === sid ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-800'}`}
            >
              <span className={`text-sm font-bold ${activeSection === sid ? 'text-white' : 'text-slate-300'}`}>{SECTION_LABELS[sid]}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800/50 bg-slate-900/60 relative">
        <button 
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
        >
          DOWNLOAD CV
          <svg className={`w-4 h-4 transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
        </button>
        {showExportMenu && (
          <div className="absolute bottom-full left-6 right-6 mb-4 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 z-50">
            <button onClick={handlePrint} className="w-full p-5 text-left hover:bg-slate-50 flex items-center gap-4 border-b border-slate-50 group">
               <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
               </div>
               <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900">Adobe PDF</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">ATS Optimized</span>
               </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Mobile Drawer Sidebar */}
      <div className={`no-print fixed inset-0 z-[60] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
        <aside className={`absolute left-0 top-0 bottom-0 w-[80%] max-w-sm transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
        </aside>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="no-print hidden md:flex md:w-80 bg-[#0f172a] shadow-2xl z-30">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Header on Mobile */}
        <header className="no-print md:hidden bg-[#0f172a] text-white p-4 flex items-center justify-between shadow-lg sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div className="font-black text-base tracking-widest text-blue-400">ATS PRO</div>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-600/20">A</div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Editor (Builder) Panel */}
          <section className={`flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-12 ${mobileView === 'preview' ? 'hidden md:block' : 'block'}`}>
            <div className="max-w-4xl mx-auto pb-20 md:pb-0">
              <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm mb-10 sticky top-0 z-20">
                <button onClick={() => setActiveTab('editor')} className={`flex-1 py-4 text-xs font-black rounded-xl transition-all tracking-widest ${activeTab === 'editor' ? 'bg-[#0f172a] text-white shadow-xl' : 'text-slate-400'}`}>BUILDER</button>
                <button onClick={() => setActiveTab('matcher')} className={`flex-1 py-4 text-xs font-black rounded-xl transition-all tracking-widest ${activeTab === 'matcher' ? 'bg-[#0f172a] text-white shadow-xl' : 'text-slate-400'}`}>AI MATCH</button>
              </div>
              {activeTab === 'editor' ? (
                <Editor activeSection={activeSection} data={activeVersion.data} version={activeVersion} onChange={d => updateActiveVersion({data: d})} onUpdateVersion={updateActiveVersion} />
              ) : (
                <JobMatcher cvData={activeVersion.data} onGenerateSummary={s => updateActiveVersion({summary: s})} onAnalyze={()=>{}} />
              )}
            </div>
          </section>

          {/* Preview Panel */}
          <section id="cv-preview-container" className={`flex-1 bg-slate-200/50 overflow-y-auto flex flex-col items-center md:p-12 ${mobileView === 'edit' ? 'hidden md:flex' : 'flex'}`}>
            <div className="no-print hidden md:flex items-center gap-3 mb-8 bg-white/90 backdrop-blur px-6 py-2.5 rounded-full border border-slate-200 shadow-sm">
               <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-xs font-black text-slate-500 uppercase tracking-[0.15em]">Live Preview Active</span>
            </div>
            <div className="w-full flex justify-center pb-24 md:pb-0">
               <Preview data={activeVersion.data} version={activeVersion} />
            </div>
          </section>

          {/* Mobile Navigation Tabs (Floating) */}
          <div className="no-print md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0f172a]/95 backdrop-blur-md p-1.5 rounded-full shadow-2xl flex gap-1 z-[50] border border-slate-700/50 w-[240px]">
             <button onClick={() => setMobileView('edit')} className={`flex-1 py-3 rounded-full text-xs font-black transition-all ${mobileView === 'edit' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}>EDIT</button>
             <button onClick={() => setMobileView('preview')} className={`flex-1 py-3 rounded-full text-xs font-black transition-all ${mobileView === 'preview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}>VIEW</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
