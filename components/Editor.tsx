
import React, { useState } from 'react';
import { CVData, CVVersion } from '../types';
import { optimizeBulletPoint } from '../geminiService';
import { SECTIONS, SECTION_LABELS } from '../constants';

interface EditorProps {
  data: CVData;
  onChange: (newData: CVData) => void;
  activeSection: string;
  version: CVVersion;
  onUpdateVersion: (updates: Partial<CVVersion>) => void;
}

const Editor: React.FC<EditorProps> = ({ data, onChange, activeSection, version, onUpdateVersion }) => {
  const [optimizing, setOptimizing] = useState<string | null>(null);

  const updateData = (updates: Partial<CVData>) => {
    onChange({ ...data, ...updates });
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input label="Full Name" value={data.personalInfo.fullName} onChange={v => updateData({ personalInfo: {...data.personalInfo, fullName: v}})} />
        <Input label="Email" value={data.personalInfo.email} onChange={v => updateData({ personalInfo: {...data.personalInfo, email: v}})} />
        <Input label="Phone" value={data.personalInfo.phone} onChange={v => updateData({ personalInfo: {...data.personalInfo, phone: v}})} />
        <Input label="Location" value={data.personalInfo.location} onChange={v => updateData({ personalInfo: {...data.personalInfo, location: v}})} />
        <Input label="LinkedIn" value={data.personalInfo.linkedin || ''} onChange={v => updateData({ personalInfo: {...data.personalInfo, linkedin: v}})} />
        <Input label="GitHub" value={data.personalInfo.github || ''} onChange={v => updateData({ personalInfo: {...data.personalInfo, github: v}})} />
      </div>
      <Input label="Professional Title" value={data.professionalTitle} onChange={v => updateData({ professionalTitle: v})} placeholder="e.g. Lead Software Engineer" />
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Professional Summary</label>
        <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold uppercase self-start">AI Optimization Enabled</span>
      </div>
      <textarea 
        className="w-full h-56 bg-white border border-slate-200 rounded-2xl p-6 text-base leading-relaxed text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
        value={version.summary}
        onChange={(e) => onUpdateVersion({ summary: e.target.value })}
        placeholder="Craft your story..."
      />
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-8">
      <AddButton label="Add Work Experience" onClick={() => updateData({ experiences: [{ id: crypto.randomUUID(), company: '', role: '', location: '', startDate: '', endDate: '', description: [] }, ...data.experiences]})} />
      {data.experiences.map((exp) => (
        <Card key={exp.id} onRemove={() => updateData({ experiences: data.experiences.filter(e => e.id !== exp.id)})}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <Input label="Company" value={exp.company} onChange={v => updateData({ experiences: data.experiences.map(e => e.id === exp.id ? {...e, company: v} : e)})} />
            <Input label="Role" value={exp.role} onChange={v => updateData({ experiences: data.experiences.map(e => e.id === exp.id ? {...e, role: v} : e)})} />
            <Input label="Start Date" value={exp.startDate} onChange={v => updateData({ experiences: data.experiences.map(e => e.id === exp.id ? {...e, startDate: v} : e)})} />
            <Input label="End Date" value={exp.endDate} onChange={v => updateData({ experiences: data.experiences.map(e => e.id === exp.id ? {...e, endDate: v} : e)})} />
          </div>
          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-100 mb-6 shadow-inner">
             <BulletBuilder onAdd={async (a,t,r) => {
                setOptimizing(exp.id);
                const bullet = await optimizeBulletPoint(a,t,r);
                updateData({ experiences: data.experiences.map(e => e.id === exp.id ? {...e, description: [...e.description, bullet]} : e)});
                setOptimizing(null);
             }} loading={optimizing === exp.id} />
          </div>
          <EditableBulletList bullets={exp.description} onChange={nb => updateData({ experiences: data.experiences.map(e => e.id === exp.id ? {...e, description: nb} : e)})} />
        </Card>
      ))}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <AddButton label="Add Project" onClick={() => updateData({ projects: [{ id: crypto.randomUUID(), name: '', role: '', link: '', description: [], techStack: [] }, ...data.projects]})} />
      {data.projects.map((proj) => (
        <Card key={proj.id} onRemove={() => updateData({ projects: data.projects.filter(p => p.id !== proj.id)})}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <Input label="Project Name" value={proj.name} onChange={v => updateData({ projects: data.projects.map(p => p.id === proj.id ? {...p, name: v} : p)})} />
            <Input label="Tech Stack" value={proj.techStack.join(', ')} onChange={v => updateData({ projects: data.projects.map(p => p.id === proj.id ? {...p, techStack: v.split(',').map(s => s.trim())} : p)})} />
          </div>
          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-100 mb-6">
            <BulletBuilder onAdd={async (a,t,r) => {
                setOptimizing(proj.id);
                const bullet = await optimizeBulletPoint(a,t,r);
                updateData({ projects: data.projects.map(p => p.id === proj.id ? {...p, description: [...p.description, bullet]} : p)});
                setOptimizing(null);
            }} loading={optimizing === proj.id} />
          </div>
          <EditableBulletList bullets={proj.description} onChange={nb => updateData({ projects: data.projects.map(p => p.id === proj.id ? {...p, description: nb} : p)})} />
        </Card>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-5">
      <AddButton label="Add Skill Category" onClick={() => updateData({ skillGroups: [...data.skillGroups, { id: crypto.randomUUID(), category: '', skills: [] }]})} />
      {data.skillGroups.map(group => (
        <div key={group.id} className="flex flex-col gap-5 p-6 bg-white border border-slate-200 rounded-3xl relative shadow-sm group hover:border-blue-300 transition-colors">
          <button onClick={() => updateData({ skillGroups: data.skillGroups.filter(g => g.id !== group.id)})} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <Input label="Category" value={group.category} onChange={v => updateData({ skillGroups: data.skillGroups.map(g => g.id === group.id ? {...g, category: v} : g)})} placeholder="e.g. Backend Development" />
          <Input label="Skills (comma separated)" value={group.skills.join(', ')} onChange={v => updateData({ skillGroups: data.skillGroups.map(g => g.id === group.id ? {...g, skills: v.split(',').map(s => s.trim())} : g)})} placeholder="Node.js, GraphQL, Docker" />
        </div>
      ))}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <AddButton label="Add Education" onClick={() => updateData({ education: [{ id: crypto.randomUUID(), institution: '', degree: '', fieldOfStudy: '', location: '', graduationDate: '' }, ...data.education]})} />
      {data.education.map((edu) => (
        <Card key={edu.id} onRemove={() => updateData({ education: data.education.filter(e => e.id !== edu.id)})}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Institution" value={edu.institution} onChange={v => updateData({ education: data.education.map(e => e.id === edu.id ? {...e, institution: v} : e)})} />
            <Input label="Degree" value={edu.degree} onChange={v => updateData({ education: data.education.map(e => e.id === edu.id ? {...e, degree: v} : e)})} />
            <Input label="Major/Field" value={edu.fieldOfStudy} onChange={v => updateData({ education: data.education.map(e => e.id === edu.id ? {...e, fieldOfStudy: v} : e)})} />
            <Input label="Graduation Year" value={edu.graduationDate} onChange={v => updateData({ education: data.education.map(e => e.id === edu.id ? {...e, graduationDate: v} : e)})} />
          </div>
        </Card>
      ))}
    </div>
  );

  const sectionContent: Record<string, React.ReactNode> = {
    [SECTIONS.PERSONAL]: renderPersonalInfo(),
    [SECTIONS.SUMMARY]: renderSummary(),
    [SECTIONS.EXPERIENCE]: renderExperience(),
    [SECTIONS.SKILLS]: renderSkills(),
    [SECTIONS.PROJECTS]: renderProjects(),
    [SECTIONS.EDUCATION]: renderEducation(),
    [SECTIONS.CERTIFICATIONS]: <div className="p-16 text-center text-slate-400 font-black uppercase text-xs border-4 border-dashed border-slate-200 rounded-[3rem] tracking-widest bg-slate-50/50">Certification Engine Coming Soon</div>,
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-8">
         <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{SECTION_LABELS[activeSection]}</h2>
         <p className="text-slate-500 text-sm mt-1">Refine your professional narrative below.</p>
      </div>
      {sectionContent[activeSection]}
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder = "" }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-xs font-black uppercase text-slate-500 tracking-widest ml-1">{label}</label>
    <input 
        className="bg-white border border-slate-200 text-slate-800 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-base transition-all shadow-sm placeholder:text-slate-300" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder} 
    />
  </div>
);

const Card: React.FC<{ children: React.ReactNode, onRemove: () => void }> = ({ children, onRemove }) => (
  <div className="p-6 md:p-10 border border-slate-200 rounded-[2.5rem] bg-white shadow-sm relative group hover:shadow-xl hover:border-blue-100 transition-all">
    <button onClick={onRemove} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
    </button>
    {children}
  </div>
);

const AddButton = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button onClick={onClick} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-500 font-black text-xs uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all active:scale-[0.98]">+ {label}</button>
);

const EditableBulletList = ({ bullets, onChange }: { bullets: string[], onChange: (nb: string[]) => void }) => (
  <div className="space-y-4">
    <label className="text-xs font-black uppercase text-slate-500 tracking-widest ml-1">Editable Achievements</label>
    {bullets.map((bullet, idx) => (
      <div key={idx} className="flex gap-4 group/item items-start">
        <div className="mt-5 w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
        <textarea 
          className="flex-1 text-sm md:text-base bg-white p-4 rounded-2xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all leading-relaxed text-slate-700 shadow-sm min-h-[90px]"
          value={bullet}
          onChange={(e) => { const next = [...bullets]; next[idx] = e.target.value; onChange(next); }}
        />
        <button onClick={() => onChange(bullets.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 self-start mt-4 p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
    ))}
    {bullets.length === 0 && <p className="text-center text-slate-400 text-sm py-4 italic">No achievements listed yet. Use the AI builder below!</p>}
  </div>
);

const BulletBuilder = ({ onAdd, loading }: { onAdd: (a: string, t: string, r: string) => void, loading: boolean }) => {
  const [f, setF] = useState({ a: '', t: '', r: '' });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-blue-500 text-xl animate-bounce">✨</span>
        <h4 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em]">AI Bullet Generator</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input label="Action Verb" value={f.a} onChange={v => setF({...f, a: v})} placeholder="e.g. Optimized" />
        <Input label="Task/Scope" value={f.t} onChange={v => setF({...f, t: v})} placeholder="e.g. Infrastructure" />
        <Input label="Key Metric" value={f.r} onChange={v => setF({...f, r: v})} placeholder="e.g. 35% growth" />
      </div>
      <button 
        disabled={loading || !f.a || !f.t} 
        onClick={() => { onAdd(f.a, f.t, f.r); setF({a:'',t:'',r:''}); }} 
        className="w-full py-4 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Optimizing Content...
          </>
        ) : 'Optimize Achievement with AI'}
      </button>
    </div>
  );
};

export default Editor;
