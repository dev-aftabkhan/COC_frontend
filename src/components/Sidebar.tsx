import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  FileSpreadsheet,
  Building2,
  Building,
  DollarSign,
  PackageCheck,
  TrendingUp,
  Activity,
  Layers,
  UploadCloud,
  FolderKanban,
} from 'lucide-react';
import { Project } from '../types';

export type TabType =
  | 'overview'
  | 'upload'
  | 'projects'
  | 'clients'
  | 'contractors'
  | 'comparison'
  | 'boq'
  | 'quotations'
  | 'financials'
  | 'procurement'
  | 'benchmarks'
  | 'observability';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  selectedProject: Project | null;
  projects: Project[];
  onSelectProject: (p: Project) => void;
  systemHealth: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  selectedProject,
  projects,
  onSelectProject,
  systemHealth,
}) => {
  const isHealthy = systemHealth?.status === 'ok';

  const navItems: { id: TabType; label: string; icon: React.ElementType; badge?: string; category: string }[] = [
    // Primary Ingestion & Entities
    { id: 'upload', label: 'Upload & Ingest', icon: UploadCloud, badge: 'Upload', category: 'INGESTION & ENTITIES' },
    { id: 'projects', label: 'Projects Hub', icon: FolderKanban, badge: `${projects.length}`, category: 'INGESTION & ENTITIES' },
    { id: 'clients', label: 'Client Directory', icon: Building2, category: 'INGESTION & ENTITIES' },
    { id: 'contractors', label: 'Contractor Directory', icon: Building, category: 'INGESTION & ENTITIES' },

    // Cost Intelligence & Bidding
    { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard, category: 'COST INTELLIGENCE & TENDER' },
    { id: 'comparison', label: 'Bid Comparison Matrix', icon: BarChart3, badge: 'Matrix', category: 'COST INTELLIGENCE & TENDER' },
    { id: 'boq', label: 'Client BOQ Master', icon: FileSpreadsheet, category: 'COST INTELLIGENCE & TENDER' },

    // Commercials & Execution
    { id: 'financials', label: 'Profitability & Margins', icon: DollarSign, category: 'COMMERCIALS & EXECUTION' },
    { id: 'procurement', label: 'Purchase Orders & GRN', icon: PackageCheck, category: 'COMMERCIALS & EXECUTION' },
    { id: 'benchmarks', label: 'Historical Benchmarks', icon: TrendingUp, category: 'COMMERCIALS & EXECUTION' },

    // Governance
    { id: 'observability', label: 'System Observability', icon: Activity, badge: isHealthy ? 'UP' : 'ERR', category: 'SYSTEM & OBSERVABILITY' },
  ];

  const categories = [
    'INGESTION & ENTITIES',
    'COST INTELLIGENCE & TENDER',
    'COMMERCIALS & EXECUTION',
    'SYSTEM & OBSERVABILITY',
  ];

  return (
    <aside className="w-64 bg-[#080d1a] border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 text-white font-black text-xl tracking-tighter">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">NEXIO</span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Cost Intelligence Platform</p>
          </div>
        </div>
      </div>

      {/* Active Project Card Selector */}
      <div className="p-3.5 m-3 rounded-xl bg-[#0f172a]/90 border border-slate-800/90 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> ACTIVE TENDER
          </span>
          <span className="badge badge-compliant text-[9px] py-0 px-1.5">
            {selectedProject?.status.replace(/_/g, ' ') || 'ACTIVE'}
          </span>
        </div>

        <select
          className="w-full bg-[#18233c] text-xs text-slate-200 border border-slate-700/60 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer truncate"
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

        {selectedProject?.assignedContractor && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-emerald-400 flex items-center gap-1">
            <span>Awarded:</span>
            <strong className="truncate">{selectedProject.assignedContractor.name}</strong>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
        {categories.map((cat) => {
          const items = navItems.filter((i) => i.category === cat);
          if (items.length === 0) return null;

          return (
            <div key={cat} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {cat}
              </div>

              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 transition-colors shrink-0 ${
                          isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          isActive
                            ? 'bg-cyan-500 text-slate-950 font-black'
                            : 'bg-slate-800/90 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 m-3 rounded-xl bg-[#0a101d] border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          <span className="font-mono text-[10px] text-slate-300">Remote Postgres DB</span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400">135.235.138.171</span>
      </div>
    </aside>
  );
};
