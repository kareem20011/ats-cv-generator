
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
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Target Job Description</h2>
      <p className="text-sm text-slate-500">Paste the job description here to optimize your CV keywords and generate a tailored summary.</p>
      
      <textarea 
        className="w-full h-40 border p-3 rounded font-mono text-xs bg-slate-50"
        placeholder="Paste JD text here..."
        value={jd}
        onChange={(e) => setJd(e.target.value)}
      />

      <button 
        onClick={handleRun}
        disabled={loading || !jd}
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-slate-300 transition"
      >
        {loading ? 'Analyzing with AI...' : 'Analyze & Match CV'}
      </button>

      {results && (
        <div className="mt-6 border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700 uppercase">Relevance Score</span>
            <span className={`text-2xl font-black ${results.matchScore > 70 ? 'text-green-600' : 'text-orange-500'}`}>
              {Math.round(results.matchScore)}%
            </span>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Identified Gaps</h4>
            <div className="flex flex-wrap gap-2">
              {results.gaps.map((gap, i) => (
                <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100">{gap}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Key Skills Found</h4>
            <div className="flex flex-wrap gap-2">
              {results.keywords.skills.map((skill, i) => (
                <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatcher;
