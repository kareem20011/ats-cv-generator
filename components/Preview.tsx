
import React from 'react';
import { CVData, CVVersion } from '../types';
import { SECTIONS } from '../constants';

interface PreviewProps {
  data: CVData;
  version: CVVersion;
}

const Preview: React.FC<PreviewProps> = ({ data, version }) => {
  const isHidden = (section: string) => version.hiddenSections.includes(section);

  return (
    <div id="cv-preview" className="print-area bg-white p-4 sm:p-[0.75in] shadow-2xl print:shadow-none print:p-0 mx-auto min-h-full sm:min-h-[11in] h-full w-full sm:max-w-[8.5in] text-[#0f172a] font-['Inter'] leading-tight animate-in zoom-in-95 duration-500">
      {/* Header */}
      <header className="text-center mb-8 border-b-[3px] border-slate-900 pb-6">
        <h1 className="text-4xl font-[900] uppercase tracking-tighter mb-1 text-slate-900">{data.personalInfo.fullName || 'Your Name'}</h1>
        <p className="text-xl font-bold text-slate-600 mb-4">{data.professionalTitle || 'Target Job Title'}</p>
        <div className="text-[10.5pt] text-slate-500 flex flex-wrap justify-center gap-x-5 gap-y-1 font-medium">
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          {data.personalInfo.email && <span className="underline decoration-slate-300">{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.linkedin && <span className="font-semibold underline">LinkedIn</span>}
          {data.personalInfo.github && <span className="font-semibold underline">GitHub</span>}
        </div>
      </header>

      {/* Dynamic Sections Based on Order */}
      <div className="space-y-8">
        {version.sectionOrder.map((sectionId) => {
          if (isHidden(sectionId)) return null;

          switch (sectionId) {
            case SECTIONS.SUMMARY:
              return version.summary ? (
                <section key={sectionId} className="page-break-inside-avoid">
                  <h2 className="text-[12pt] font-black uppercase border-b-2 border-slate-900 mb-3 tracking-wide">Professional Summary</h2>
                  <p className="text-[10.5pt] text-justify leading-relaxed text-slate-700">{version.summary}</p>
                </section>
              ) : null;

            case SECTIONS.SKILLS:
              return data.skillGroups.length > 0 ? (
                <section key={sectionId} className="page-break-inside-avoid">
                  <h2 className="text-[12pt] font-black uppercase border-b-2 border-slate-900 mb-3 tracking-wide">Skills & Expertise</h2>
                  <div className="space-y-2">
                    {data.skillGroups.map(g => (
                      <div key={g.id} className="text-[10.5pt]">
                        <span className="font-black text-slate-900">{g.category}:</span> <span className="text-slate-700">{g.skills.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case SECTIONS.EXPERIENCE:
              return data.experiences.length > 0 ? (
                <section key={sectionId}>
                  <h2 className="text-[12pt] font-black uppercase border-b-2 border-slate-900 mb-4 tracking-wide">Professional Experience</h2>
                  <div className="space-y-7">
                    {data.experiences.map(exp => (
                      <div key={exp.id} className="page-break-inside-avoid">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-[900] text-[11.5pt] uppercase text-slate-900">{exp.company}</span>
                          <span className="text-[10.5pt] font-black text-slate-600">{exp.startDate} — {exp.endDate || 'Present'}</span>
                        </div>
                        <div className="flex justify-between italic text-[11pt] font-bold mb-3 text-slate-500">
                          <span>{exp.role}</span>
                          <span>{exp.location}</span>
                        </div>
                        <ul className="list-disc list-outside ml-5 space-y-2 text-[10.5pt] text-slate-700">
                          {exp.description.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case SECTIONS.PROJECTS:
              return data.projects.length > 0 ? (
                <section key={sectionId}>
                  <h2 className="text-[12pt] font-black uppercase border-b-2 border-slate-900 mb-4 tracking-wide">Key Projects</h2>
                  <div className="space-y-5">
                    {data.projects.map(proj => (
                      <div key={proj.id} className="page-break-inside-avoid">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-[900] text-[11pt] uppercase text-slate-900">{proj.name}</span>
                          <span className="text-[10pt] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{proj.techStack.join(' • ')}</span>
                        </div>
                        <ul className="list-disc list-outside ml-5 space-y-1.5 text-[10.5pt] text-slate-700">
                          {proj.description.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case SECTIONS.EDUCATION:
              return data.education.length > 0 ? (
                <section key={sectionId} className="page-break-inside-avoid">
                  <h2 className="text-[12pt] font-black uppercase border-b-2 border-slate-900 mb-3 tracking-wide">Education</h2>
                  <div className="space-y-3">
                    {data.education.map(edu => (
                      <div key={edu.id} className="flex justify-between text-[11pt]">
                        <div className="flex flex-col">
                          <span className="font-black uppercase text-slate-900">{edu.institution}</span>
                          <span className="text-slate-500 font-bold italic">{edu.degree} in {edu.fieldOfStudy}</span>
                        </div>
                        <span className="font-black text-slate-900">{edu.graduationDate}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default Preview;
