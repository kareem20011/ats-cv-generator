
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
  const [isFinished, setIsFinished] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handlePrint = () => { 
    setShowExportMenu(false); 
    setTimeout(() => window.print(), 200); 
  };

  const handleDownloadWord = () => {
    const content = document.getElementById('cv-preview')?.innerHTML;
    if (!content) return;

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><style>
      body { font-family: 'Arial', sans-serif; font-size: 11pt; padding: 0.5in; }
      h1 { font-size: 24pt; text-align: center; text-transform: uppercase; font-weight: bold; margin-bottom: 5pt; }
      h2 { font-size: 14pt; border-bottom: 1.5pt solid #000; text-transform: uppercase; margin-top: 15pt; margin-bottom: 5pt; font-weight: bold; }
      p { margin-bottom: 8pt; text-align: justify; }
      ul { margin-left: 20pt; }
      li { margin-bottom: 3pt; }
    </style></head><body>`;
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeVersion?.data.personalInfo.fullName || 'Professional_CV'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const navigateSection = (direction: 'next' | 'prev') => {
    const currentIndex = DEFAULT_ORDER.indexOf(activeSection as any);
    if (direction === 'next') {
      if (currentIndex === DEFAULT_ORDER.length - 1) {
        setIsFinished(true);
      } else {
        setActiveSection(DEFAULT_ORDER[currentIndex + 1]);
      }
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveSection(DEFAULT_ORDER[currentIndex - 1]);
    }
    const container = document.getElementById('main-content-scroll');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!activeVersion) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0f172a] text-white">
      <div className="p-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg">A</div>
            <h1 className="text-xl font-black tracking-tighter uppercase">ATS PRO</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <nav className="space-y-1.5 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
          <label className="text-[10px] font-black uppercase text-slate-500 mb-4 block tracking-widest">Builder Steps</label>
          {DEFAULT_ORDER.map((sid, idx) => (
            <button 
              key={sid}
              onClick={() => { setActiveSection(sid); setIsSidebarOpen(false); setIsFinished(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeSection === sid && !isFinished ? 'bg-blue-600 text-white font-bold shadow-xl shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border ${activeSection === sid && !isFinished ? 'border-white bg-white/20' : 'border-slate-700'}`}>
                {idx + 1}
              </div>
              <span className="text-sm">{SECTION_LABELS[sid]}</span>
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-800/50">
            <button 
              onClick={() => { setIsFinished(true); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${isFinished ? 'bg-green-600 text-white font-bold shadow-xl shadow-green-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border ${isFinished ? 'border-white bg-white/20' : 'border-slate-700'}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
              </div>
              <span className="text-sm">Final Result</span>
            </button>
          </div>
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800/50 bg-slate-900/40">
        <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
            {Math.round(((DEFAULT_ORDER.indexOf(activeSection as any) + 1) / DEFAULT_ORDER.length) * 100)}%
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Progress</p>
            <p className="text-xs font-bold text-slate-300">Profile Completion</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full bg-slate-100 overflow-hidden relative">
      {/* Sidebar Drawer */}
      <div className={`no-print fixed inset-0 z-[200] transition-opacity duration-300 lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSidebarOpen(false)}></div>
        <aside className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-sm transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
        </aside>
      </div>

      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:flex lg:w-80 bg-[#0f172a] shadow-2xl z-30 shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative min-h-0">
        <header className="no-print bg-[#0f172a] text-white h-16 px-4 flex items-center justify-between shadow-lg shrink-0 z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded-xl transition-all lg:hidden active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div className="font-black text-sm tracking-[0.25em] text-blue-400 uppercase">ATS PRO CV BUILDER</div>
          <div className="flex items-center gap-3">
             <span className="hidden sm:block text-[10px] font-black uppercase text-slate-400 tracking-widest">Auto-saved</span>
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">A</div>
          </div>
        </header>

        {/* Scrollable Container */}
        <section 
          id="main-content-scroll" 
          className="flex-1 overflow-y-auto bg-slate-50 relative custom-scrollbar touch-pan-y min-h-0"
        >
          {isFinished ? (
            <div className="min-h-full flex flex-col items-center p-0 sm:p-12 animate-in fade-in zoom-in-95 duration-500">
               <div className="w-full sm:max-w-4xl pb-0 sm:pb-20">
                  <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
                     <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter text-center sm:text-left">Your CV is Ready! 🎉</h2>
                        <p className="text-slate-500 text-sm mt-1 text-center sm:text-left">Review the final result and download your documents.</p>
                     </div>
                     <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button onClick={() => setIsFinished(false)} className="flex-1 sm:flex-none py-4 px-6 bg-slate-100 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Edit Sections</button>
                        <div className="relative flex-1 sm:flex-none">
                           <button onClick={() => setShowExportMenu(!showExportMenu)} className="w-full py-4 px-8 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95">
                              DOWNLOAD
                              <svg className={`w-3.5 h-3.5 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                           </button>
                           {showExportMenu && (
                             <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-top-4">
                               <button onClick={handlePrint} className="w-full p-5 text-left hover:bg-slate-50 flex items-center gap-4 border-b border-slate-50 group">
                                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-slate-900">PDF Document</p>
                                     <p className="text-[9px] text-slate-400 font-bold uppercase">Ready for ATS</p>
                                  </div>
                               </button>
                               <button onClick={handleDownloadWord} className="w-full p-5 text-left hover:bg-slate-50 flex items-center gap-4 group">
                                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-slate-900">Word Document</p>
                                     <p className="text-[9px] text-slate-400 font-bold uppercase">Fully Editable</p>
                                  </div>
                               </button>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
                  <div id="cv-preview-container" className="w-full flex justify-center bg-transparent sm:bg-slate-300/30 p-0 sm:p-12 rounded-none sm:rounded-[3rem] border-0 sm:border-4 sm:border-dashed border-slate-200 overflow-hidden mb-0 sm:mb-20">
                     <Preview data={activeVersion.data} version={activeVersion} />
                  </div>
               </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-5 sm:p-12 pb-44 min-h-full">
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm mb-12 sticky top-4 z-20">
                <button onClick={() => setActiveTab('editor')} className={`flex-1 py-4 text-[11px] font-black rounded-xl transition-all tracking-widest ${activeTab === 'editor' ? 'bg-[#0f172a] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>1. INFORMATION BUILDER</button>
                <button onClick={() => setActiveTab('matcher')} className={`flex-1 py-4 text-[11px] font-black rounded-xl transition-all tracking-widest ${activeTab === 'matcher' ? 'bg-[#0f172a] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>2. AI JOB MATCHER</button>
              </div>

              {activeTab === 'editor' ? (
                <div key={activeSection} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Editor activeSection={activeSection} data={activeVersion.data} version={activeVersion} onChange={d => updateActiveVersion({data: d})} onUpdateVersion={updateActiveVersion} />
                  
                  <div className="mt-16 pt-12 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 no-print pb-10">
                    <button 
                      onClick={() => navigateSection('prev')}
                      disabled={DEFAULT_ORDER.indexOf(activeSection as any) === 0}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 py-5 px-10 bg-white border border-slate-200 rounded-2xl text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-20 transition-all shadow-sm active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                      Back
                    </button>
                    <button 
                      onClick={() => navigateSection('next')}
                      className={`w-full sm:w-auto flex items-center justify-center gap-3 py-5 px-12 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${DEFAULT_ORDER.indexOf(activeSection as any) === DEFAULT_ORDER.length - 1 ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20' : 'bg-[#0f172a] hover:bg-slate-800 text-white shadow-slate-900/20'}`}
                    >
                      {DEFAULT_ORDER.indexOf(activeSection as any) === DEFAULT_ORDER.length - 1 ? (
                        <>GENERATE MY CV <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg></>
                      ) : (
                        <>Next Step <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg></>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-500 pb-20">
                  <JobMatcher cvData={activeVersion.data} onGenerateSummary={s => updateActiveVersion({summary: s})} onAnalyze={()=>{}} />
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
