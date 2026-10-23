import React, { useState } from 'react';
import { X, Search, Globe, ExternalLink, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { AudioTranscriber } from './AudioTranscriber';

interface GroundedAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const GroundedAdviceModal: React.FC<GroundedAdviceModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: Array<{ title: string; url: string }> } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickQuestions = [
    'Hvor længe kan råt hakket oksekød holde sig i fryseren?',
    'Kan man genfryse kylling, der har været tøet op i køleskabet?',
    'Hvordan fryser man fløde og ost uden at det gryner?',
    'Hvor længe holder hjemmelavet fond og suppe sig på frost?',
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/search-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      if (!res.ok) {
        throw new Error(`Søgning mislykkedes: ${res.statusText}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Der opstod en fejl under søgningen.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-800">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Google-opdateret fryserådgivning</span>
                <span className="text-[10px] font-mono text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded font-normal">
                  Google Search Grounding
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Få verificerede svar på holdbarhed og optøning fra officielle kilder
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Search Box with Microphone Input */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-2 border border-slate-300 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Stil et spørgsmål om frysning, optøning eller holdbarhed..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xs sm:text-sm focus:outline-none"
              />
              <AudioTranscriber
                onTranscribed={(spokenText) => {
                  setQuery(spokenText);
                  handleSearch(spokenText);
                }}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Søg'}
              </button>
            </div>
          </form>

          {/* Quick Questions Suggestions */}
          {!result && !loading && (
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Ofte stillede spørgsmål
              </span>
              <div className="space-y-1.5">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuery(q);
                      handleSearch(q);
                    }}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-cyan-50/50 hover:border-cyan-300 text-xs text-slate-700 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{q}</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-600 mb-3" />
              <p className="text-xs font-medium text-slate-700">
                Søger på Google og sammenholder fødevarekilder...
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Finder officielle anbefalinger om holdbarhed og frysetemperatur
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Result View */}
          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-900 mb-2">
                  <BookOpen className="w-4 h-4 text-cyan-700" />
                  <span>Svar baseret på opdaterede kilder</span>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {result.text}
                </div>
              </div>

              {/* Source Grounding Links */}
              {result.sources && result.sources.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Kilder fra Google Søgning
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-cyan-400 text-[11px] text-slate-600 hover:text-cyan-800 transition-colors flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[200px]">{src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Luk
          </button>
        </div>
      </div>
    </div>
  );
};
