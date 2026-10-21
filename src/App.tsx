import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ComparisonView } from './features/comparison/ComparisonView';
import { BoqView } from './features/boq/BoqView';
import { QuotationsView } from './features/quotations/QuotationsView';
import { FinancialsView } from './features/financials/FinancialsView';
import { api } from './services/api';
import { Project, CostComparisonResult } from './types';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  DollarSign,
} from 'lucide-react';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [comparison, setComparison] = useState<CostComparisonResult | null>(null);
  const [boqVersions, setBoqVersions] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'comparison' | 'boq' | 'quotations' | 'financials'>('comparison');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectData(selectedProject.id);
    }
  }, [selectedProject?.id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [h, prjs] = await Promise.all([api.getHealth(), api.getProjects()]);
      setHealth(h);
      setProjects(prjs);
      if (prjs.length > 0) {
        setSelectedProject(prjs[0]);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectData = async (projectId: string) => {
    try {
      setLoading(true);
      const [comp, boq, quotes, prjDetail] = await Promise.all([
        api.getProjectComparison(projectId).catch(() => null),
        api.getProjectBOQ(projectId).catch(() => []),
        api.getProjectQuotations(projectId).catch(() => []),
        api.getProject(projectId).catch(() => null),
      ]);
      setComparison(comp);
      setBoqVersions(boq);
      setQuotations(quotes);
      if (prjDetail) {
        setSelectedProject(prjDetail);
      }
    } catch (err) {
      console.error('Error loading project details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBOQ = async (boqVersionId: string) => {
    try {
      await api.approveBOQ(boqVersionId, 'Approved by Project Manager / Estimator');
      if (selectedProject) {
        loadProjectData(selectedProject.id);
      }
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Header
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={(p) => setSelectedProject(p)}
        systemHealth={health}
      />

      {/* Navigation Sub-header / Tab Bar */}
      <div className="bg-[#0f1628] border-b border-slate-800 px-6 py-2.5 flex items-center justify-between sticky top-[61px] z-40 backdrop-blur-md">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'comparison'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bid Comparison Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('boq')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'boq'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Client BOQ Master ({boqVersions[0]?.items?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotations')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'quotations'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Contractor Quotations ({quotations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('financials')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'financials'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Profitability & Margins</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
          <span className="font-mono text-cyan-400 font-semibold">{selectedProject?.code}</span>
          <span>•</span>
          <span>Client: <strong className="text-slate-200">{selectedProject?.client?.name}</strong></span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'comparison' && (
          <ComparisonView comparison={comparison} loading={loading} />
        )}
        {activeTab === 'boq' && (
          <BoqView boqVersions={boqVersions} onApprove={handleApproveBOQ} />
        )}
        {activeTab === 'quotations' && (
          <QuotationsView quotations={quotations} />
        )}
        {activeTab === 'financials' && (
          <FinancialsView project={selectedProject} />
        )}
      </main>
    </div>
  );
};
