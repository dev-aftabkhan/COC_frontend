import React from 'react';
import { CostComparisonResult, Project } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  ShieldCheck,
  AlertTriangle,
  Building,
  Layers,
  ArrowUpRight,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';

interface OverviewViewProps {
  comparison: CostComparisonResult | null;
  project: Project | null;
  onNavigateToComparison: () => void;
  onNavigateToBOQ: () => void;
  onNavigateToUpload?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  comparison,
  project,
  onNavigateToComparison,
  onNavigateToBOQ,
  onNavigateToUpload,
}) => {
  if (!comparison) {
    return (
      <div className="glass-panel p-10 text-center text-slate-400">
        <Layers className="w-10 h-10 text-cyan-400 mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-white mb-1">
          {project ? `Loading Tender Intelligence for ${project.name}...` : 'Loading Tender Intelligence...'}
        </h3>
        <p className="text-xs text-slate-400">Parsing project baseline and contractor quotations.</p>
      </div>
    );
  }

  // Format currency in Indian notation (Crores / Lakhs / Thousands)
  const formatINR = (val: string | number) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  // Prepare chart data: Raw vs Scope-Adjusted in Crores
  const chartData = comparison.contractorSummaries.map((c) => ({
    name: c.contractorName.replace(/\(.*?\)/g, '').trim(),
    raw: Number((Number(c.rawQuotedTotal) / 10000000).toFixed(2)),
    adjusted: Number((Number(c.scopeAdjustedTotal) / 10000000).toFixed(2)),
    missing: c.missingItemsCount,
    compliant: c.isFullyCompliant,
  }));

  const tradeData = [
    { name: 'Room Flooring (Base)', value: 38, color: '#06b6d4' },
    { name: 'Toilet Cladding & Flooring', value: 32, color: '#3b82f6' },
    { name: 'SPC Flooring & Skirting', value: 20, color: '#6366f1' },
    { name: 'Marble Thresholds & POP', value: 10, color: '#10b981' },
  ];

  const totalContractors = comparison.contractorSummaries.length;
  const compliantCount = comparison.contractorSummaries.filter((c) => c.isFullyCompliant).length;
  const sortedContractors = [...comparison.contractorSummaries].sort(
    (a, b) => a.rankScopeAdjusted - b.rankScopeAdjusted,
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Hero Welcome Banner */}
      <div className="glass-panel-glow p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="badge badge-turnkey text-[10px]">TENDER INTELLIGENCE SUITE</span>
            <span className="text-xs text-slate-400">
              {project?.name || comparison.projectName} • Ref {project?.code || comparison.projectId}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Commercial Cost Intelligence Overview
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {totalContractors > 0 ? (
              <>
                Multi-contractor quotation reconciliation active. Automated normalization identified{' '}
                <strong className="text-cyan-400">{totalContractors} contractor submissions</strong> for Client BOQ{' '}
                <strong className="text-slate-100">Revision {comparison.boqVersionCode}</strong>.
              </>
            ) : (
              <>
                Client BOQ Baseline <strong className="text-slate-100">Revision {comparison.boqVersionCode}</strong>{' '}
                ingested with <strong className="text-cyan-400">{comparison.matrixRows.length} scope items</strong>.
                Historical cost benchmarks linked. Upload contractor quotation sheets to begin bid reconciliation.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
          <button
            onClick={onNavigateToBOQ}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>View Master BOQ</span>
          </button>
          <button
            onClick={onNavigateToComparison}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <span>Open Bid Comparison Matrix</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div
          className="glass-panel p-5 relative overflow-hidden group"
          title={`Exact Baseline: ₹${Number(comparison.baselineTotal).toLocaleString('en-IN')}`}
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>BOQ Baseline Value</span>
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {formatINR(comparison.baselineTotal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">Approved</span>
            <span>Client Scope Baseline ({comparison.matrixRows.length} items)</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          className="glass-panel p-5 relative overflow-hidden group"
          title={totalContractors > 0 ? `Exact Raw: ₹${Number(comparison.lowestRawBid.amount).toLocaleString('en-IN')}` : 'Awaiting contractor quotes'}
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Lowest Quoted Raw Bid</span>
            <Building className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
            {totalContractors > 0 ? formatINR(comparison.lowestRawBid.amount) : '₹0.00'}
          </div>
          <div className="text-[11px] text-amber-400/90 mt-2 flex items-center gap-1 truncate font-medium">
            {totalContractors > 0 ? (
              <>
                <span>By {comparison.lowestRawBid.contractorName}</span>
                <span className="text-[9px] bg-amber-500/20 px-1 rounded font-bold">PARTIAL</span>
              </>
            ) : (
              <span className="text-slate-400 text-[10px]">Awaiting contractor quotations</span>
            )}
          </div>
        </div>

        {/* Metric 3 */}
        <div
          className="glass-panel p-5 relative overflow-hidden group border-cyan-500/30"
          title={totalContractors > 0 ? `Exact Scope-Adjusted: ₹${Number(comparison.lowestScopeAdjustedBid.amount).toLocaleString('en-IN')}` : 'Awaiting contractor quotes'}
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Lowest Scope-Adjusted Bid</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono tracking-tight">
            {totalContractors > 0 ? formatINR(comparison.lowestScopeAdjustedBid.amount) : '₹0.00'}
          </div>
          <div className="text-[11px] text-cyan-300 mt-2 flex items-center gap-1 font-medium truncate">
            {totalContractors > 0 ? (
              <span>By {comparison.lowestScopeAdjustedBid.contractorName}</span>
            ) : (
              <span className="text-slate-400 text-[10px]">Scope normalization ready</span>
            )}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Tender Health & Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 mt-0.5">
            {totalContractors > 0 ? (
              compliantCount > 0 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-5 h-5" /> {compliantCount} Turnkey Bid
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1.5 text-sm font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> Exclusions Reconciled
                </span>
              )
            ) : (
              <span className="text-cyan-400 flex items-center gap-1 text-sm font-semibold">
                <ShieldCheck className="w-4 h-4" /> Baseline Verified
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {totalContractors > 0
              ? `${totalContractors} Tenderers Evaluated Across Scope Items`
              : 'Historical Rate Benchmarking Linked'}
          </div>
        </div>
      </div>

      {/* Zero Contractors Callout */}
      {totalContractors === 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-[#101c38] to-[#0a1224] border border-cyan-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Next Step in Tender Lifecycle</span>
              <span className="text-[10px] bg-cyan-900/60 text-cyan-300 px-2 py-0.5 rounded font-mono">STEP 2 OF 3</span>
            </div>
            <h3 className="text-base font-bold text-white">Upload Contractor Quotations</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Upload contractor quote sheets to unlock multi-bid dispersion curves, scope normalization, unquoted exclusion detection, and deterministic contractor rankings.
            </p>
          </div>
          {onNavigateToUpload && (
            <button
              onClick={onNavigateToUpload}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 shrink-0 cursor-pointer transition-all hover:scale-105"
            >
              <span>Upload Contractor Quotes</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Contractor Bid Dispersion */}
        <div className="glass-panel p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Contractor Price Dispersion: Quoted vs Scope-Adjusted
              </h3>
              <p className="text-[11px] text-slate-400">
                Amounts normalized in ₹ Crores. Missing line items imputed deterministically.
              </p>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
              Unit: ₹ Crores (Cr)
            </span>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 15, left: -10, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val} Cr`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any, name: string) => [
                    `₹${val} Cr`,
                    name === 'raw' ? 'Quoted Raw Bid' : 'Scope-Adjusted True Cost',
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '16px' }}
                  formatter={(val) => (val === 'raw' ? 'Raw Quoted Bid' : 'Scope-Adjusted True Cost')}
                />
                <Bar dataKey="raw" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="adjusted" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Breakdown Donut */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-100">Trade Scope Weightage</h3>
            <p className="text-[11px] text-slate-400">Budget allocation across Civil & Wet Works packages</p>
          </div>

          <div className="h-[210px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tradeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {tradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Allocation']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            {tradeData.map((t) => (
              <div key={t.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-slate-300 text-[11px] truncate max-w-[150px]">{t.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-200 text-[11px]">{t.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contractor Leaderboard Quick View */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-400" /> Contractor Quotations Summary & Risk Classification
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluated using multi-factor scope completeness, material inclusions, and regional cost benchmarks
            </p>
          </div>
          <button
            onClick={onNavigateToComparison}
            className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Matrix</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {sortedContractors.slice(0, 4).map((c) => (
            <div
              key={c.contractorId}
              className="bg-[#0b101c] p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/60 font-mono">
                    RANK #{c.rankScopeAdjusted}
                  </span>
                  <span className={c.isFullyCompliant ? 'badge badge-compliant' : 'badge badge-partial'}>
                    {c.isFullyCompliant ? 'COMPLIANT' : 'PARTIAL'}
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-100 truncate mb-1" title={c.contractorName}>
                  {c.contractorName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mb-2">{c.quotationNumber}</div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[10px] text-slate-400">Scope-Adjusted Cost</div>
                <div className="text-sm font-mono font-bold text-cyan-300">
                  {formatINR(c.scopeAdjustedTotal)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
