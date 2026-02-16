
import React, { useState } from 'react';
import { analyzeJobDescription, generateSummary } from '../geminiService';
import { CVData, JDAnalysis } from '../types';

interface JobMatcherProps {
  onAnalyze: (analysis: JDAnalysis, jd: string) => void;
  onGenerateSummary: (summary: string) => void;
  cvData: CVData;
}

const JobMatcher: React.FC<JobMatcherProps> = ({ onAnalyze, onGenerateSummary, cvData }) => {
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<JDAnalysis | null>(null);

  const handleRun = async () => {
    if (!jd.trim()) return;
    setLoading(true);
    try {
      const [analysis, summary] = await Promise.all([
        analyzeJobDescription(jd),
        generateSummary(cvData, jd)
      ]);
      setResults(analysis);
      onAnalyze(analysis, jd);
      onGenerateSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-10">
         <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter uppercase">AI Match Engine</h2>
         <p className="text-slate-500 text-sm mt-1">Paste the job description to align your resume with ATS requirements.</p>
         <div className="w-12 h-1.5 bg-blue-600 rounded-full mt-2 shadow-lg shadow-blue-600/20"></div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <textarea 
          className="w-full h-64 border-2 border-slate-100 p-6 rounded-[1.5rem] font-mono text-sm bg-slate-50/50 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
          placeholder="Paste the target Job Description (JD) text here..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />

        <button 
          onClick={handleRun}
          disabled={loading || !jd}
          className="w-full bg-[#0f172a] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 disabled:bg-slate-300 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Analyzing with Gemini AI...
            </>
          ) : 'Analyze & Match CV'}
        </button>

        {results && (
          <div className="mt-12 border-t border-slate-100 pt-10 space-y-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] gap-4">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center sm:text-left">Target Score</p>
                 <p className="text-sm font-bold text-slate-600 text-center sm:text-left">Resume Relevance to JD</p>
              </div>
              <div className={`text-4xl font-black ${results.matchScore > 70 ? 'text-green-600' : 'text-orange-500'}`}>
                {Math.round(results.matchScore)}%
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Missing Keywords (Gaps)</h4>
                <div className="flex flex-wrap gap-2">
                  {results.gaps.map((gap, i) => (
                    <span key={i} className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100">{gap}</span>
                  ))}
                  {results.gaps.length === 0 && <p className="text-xs text-slate-400 italic">No major gaps identified.</p>}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Found Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {results.keywords.skills.map((skill, i) => (
                    <span key={i} className="text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">{skill}</span>
                  ))}
                  {results.keywords.skills.length === 0 && <p className="text-xs text-slate-400 italic">Try adding more specific skills.</p>}
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 p-6 rounded-[1.5rem] border border-blue-100">
               <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-2">AI Suggestions</h4>
               <p className="text-sm text-blue-900 leading-relaxed font-medium">{results.suggestions}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatcher;
