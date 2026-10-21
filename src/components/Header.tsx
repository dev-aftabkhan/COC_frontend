import React from 'react';
import { Building2, Database } from 'lucide-react';
import { Project } from '../types';

interface HeaderProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (p: Project) => void;
  systemHealth: any;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  systemHealth,
}) => {
  const isHealthy = systemHealth?.status === 'ok';

  return (
    <header className="border-b border-[rgba(255,255,255,0.08)] bg-[#0d1322] px-6 py-3.5 sticky top-0 z-50 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-lg">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">NEXIO</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                INTEL v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Construction Cost Intelligence</p>
          </div>
        </div>

        {/* Project Selector */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <select
            className="bg-[#141c30] text-sm text-slate-200 border border-slate-700/60 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const p = projects.find((x) => x.id === e.target.value);
              if (p) onSelectProject(p);
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
          {selectedProject && (
            <span className="badge badge-compliant text-[10px]">
              {selectedProject.status.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      </div>

      {/* System Observability & Auth Status */}
      <div className="flex items-center gap-4">
        {/* Observability Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141c30] border border-slate-800 text-xs">
          <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-slate-300 font-medium">Observability:</span>
          <span className={isHealthy ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
            {isHealthy ? 'All Systems Healthy' : 'Degraded'}
          </span>
          <Database className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
            PG
          </div>
          <div className="hidden lg:block text-left text-xs">
            <div className="font-semibold text-slate-200">Pulkit Garg</div>
            <div className="text-[10px] text-cyan-400 font-medium">PMC / Estimator</div>
          </div>
        </div>
      </div>
    </header>
  );
};
