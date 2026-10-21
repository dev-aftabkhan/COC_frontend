import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './features/overview/OverviewView';
import { ComparisonView } from './features/comparison/ComparisonView';
import { BoqView } from './features/boq/BoqView';
import { QuotationsView } from './features/quotations/QuotationsView';
import { FinancialsView } from './features/financials/FinancialsView';
import { ProcurementView } from './features/procurement/ProcurementView';
import { BenchmarksView } from './features/benchmarks/BenchmarksView';
import { ObservabilityView } from './features/observability/ObservabilityView';
import { api } from './services/api';
import { Project, CostComparisonResult } from './types';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [comparison, setComparison] = useState<CostComparisonResult | null>(null);
  const [boqVersions, setBoqVersions] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
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

  const handleExportReport = () => {
    if (!comparison) return;
    const headers = ['Item #', 'Title', 'Unit', 'Quantity', 'Baseline Rate', 'Baseline Amount'];
    comparison.contractorSummaries.forEach((c) => {
      headers.push(`${c.contractorName} Rate`, `${c.contractorName} Amount`, `${c.contractorName} Scope`);
    });

    const csvRows = [headers.join(',')];
    for (const r of comparison.matrixRows) {
      const row = [
        `"${r.itemNumber}"`,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.unit}"`,
        `"${r.quantity}"`,
        `"${r.baselineRate}"`,
        `"${r.baselineAmount}"`,
      ];
      for (const cq of r.contractorQuotes) {
        row.push(`"${cq.quotedRate}"`, `"${cq.quotedAmount}"`, `"${cq.inclusionState}"`);
      }
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Tender_Report_${comparison.projectName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex font-sans antialiased">
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        selectedProject={selectedProject}
        projects={projects}
        onSelectProject={(p) => setSelectedProject(p)}
        systemHealth={health}
      />

      {/* Main Content View Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          selectedProject={selectedProject}
          systemHealth={health}
          onExportReport={handleExportReport}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewView
              comparison={comparison}
              project={selectedProject}
              onNavigateToComparison={() => setActiveTab('comparison')}
              onNavigateToBOQ={() => setActiveTab('boq')}
            />
          )}

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

          {activeTab === 'procurement' && (
            <ProcurementView project={selectedProject} />
          )}

          {activeTab === 'benchmarks' && <BenchmarksView />}

          {activeTab === 'observability' && (
            <ObservabilityView systemHealth={health} />
          )}
        </main>
      </div>
    </div>
  );
};
