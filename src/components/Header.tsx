import React from 'react';
import { Search, Database, Sparkles, Download, Bell } from 'lucide-react';
import { Project } from '../types';

interface HeaderProps {
  selectedProject: Project | null;
  systemHealth: any;
  onExportReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedProject,
  systemHealth,
  onExportReport,
}) => {
  const isHealthy = systemHealth?.status === 'ok';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#080d1a]/95 backdrop-blur-xl px-6 sticky top-0 z-40 flex items-center justify-between">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search BOQ specifications, contractor quotes, rates (e.g. SPC Flooring, 600x600 Tile)..."
            className="w-full bg-[#11192e] text-xs text-slate-200 pl-10 pr-4 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:border-cyan-500 font-medium placeholder:text-slate-500 transition-colors shadow-inner"
          />
        </div>
        {selectedProject && (
          <span className="hidden lg:inline-flex text-[10px] font-mono font-semibold px-2 py-1 bg-slate-800 text-slate-300 rounded-lg shrink-0">
            {selectedProject.code}
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* AI Engine Status */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-[11px] text-indigo-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Groq AI Active</span>
        </div>

        {/* Database Observability Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#11192e] border border-slate-800 text-[11px]">
          <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          <span className="text-slate-300 font-medium">PostgreSQL:</span>
          <span className={isHealthy ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {isHealthy ? '135.235.138.171:5432' : 'Disconnected'}
          </span>
          <Database className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </div>

        {/* Export Tender Report */}
        <button
          onClick={onExportReport}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Bid Report</span>
        </button>

        {/* Notification Bell */}
        <button className="relative w-9 h-9 rounded-xl bg-[#11192e] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
        </button>
      </div>
    </header>
  );
};
