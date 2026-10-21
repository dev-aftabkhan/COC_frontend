import React, { useState } from 'react';
import { CostComparisonResult } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  Layers,
  Sparkles,
  Search,
  ArrowUpDown,
} from 'lucide-react';

interface ComparisonViewProps {
  comparison: CostComparisonResult | null;
  loading: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ comparison, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Computing deterministic cost intelligence matrix...</p>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <p>No comparison data available for this project yet.</p>
      </div>
    );
  }

  const filteredRows = comparison.matrixRows.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.itemNumber.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            BOQ Baseline ({comparison.boqVersionCode})
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ₹{Number(comparison.baselineTotal).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-400 font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>Approved Baseline Tender</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Lowest Quoted Raw Bid
          </div>
          <div className="text-2xl font-black text-amber-300 tracking-tight">
            ₹{Number(comparison.lowestRawBid.amount).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-amber-400/90 font-medium mt-2 flex items-center gap-1">
            <span>By {comparison.lowestRawBid.contractorName}</span>
            <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded font-bold">RAW ONLY</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 relative overflow-hidden border-cyan-500/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/15 rounded-full blur-xl pointer-events-none" />
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Lowest Scope-Adjusted Bid
          </div>
          <div className="text-2xl font-black text-cyan-400 tracking-tight">
            ₹{Number(comparison.lowestScopeAdjustedBid.amount).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-cyan-300 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>By {comparison.lowestScopeAdjustedBid.contractorName}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Scope Compliance Alert
          </div>
          <div className="text-base font-bold text-slate-200 mt-1">
            {comparison.lowestCompliantBid ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Fully Compliant Bid Found
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1.5 text-sm font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" /> Partial / Scope Exclusions Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Never award based on raw totals. Normalizing missing materials & exclusions protects tender margins.
          </p>
        </div>
      </div>

      {/* Contractor Ranking & Scope Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-cyan-400" /> Contractor Quotations & Scope Normalization ({comparison.contractorSummaries.length})
          </h3>
          <span className="text-xs text-slate-400 font-medium">Ranked by Scope-Adjusted True Cost</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {comparison.contractorSummaries.map((c) => (
            <div
              key={c.contractorId}
              className={`glass-panel p-4 flex flex-col justify-between transition-all ${
                c.rankScopeAdjusted === 1
                  ? 'border-cyan-500/50 bg-gradient-to-b from-[#162744] to-[#111c33]'
                  : 'hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      c.rankScopeAdjusted === 1
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    RANK #{c.rankScopeAdjusted}
                  </span>
                  <span className={c.isFullyCompliant ? 'badge badge-compliant' : 'badge badge-partial'}>
                    {c.isFullyCompliant ? 'COMPLIANT' : 'PARTIAL SCOPE'}
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-100 mb-1 truncate" title={c.contractorName}>
                  {c.contractorName}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mb-3">{c.quotationNumber}</div>

                <div className="space-y-1.5 text-xs bg-[#0b101c] p-2.5 rounded-lg border border-slate-800/80 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Raw Quoted:</span>
                    <span className="font-mono font-semibold text-slate-200">
                      ₹{Number(c.rawQuotedTotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-cyan-400 font-semibold">Scope-Adjusted:</span>
                    <span className="font-mono font-bold text-cyan-300">
                      ₹{Number(c.scopeAdjustedTotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scope flags */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span>Missing: <strong className={c.missingItemsCount > 0 ? 'text-amber-400' : 'text-slate-300'}>{c.missingItemsCount}</strong></span>
                <span>Client Scope: <strong className={c.clientSuppliedCount > 0 ? 'text-indigo-400' : 'text-slate-300'}>{c.clientSuppliedCount}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="glass-panel overflow-hidden border border-slate-800">
        <div className="p-4 border-b border-slate-800 bg-[#0e1526] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search line items or specs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#141d33] text-sm text-slate-200 pl-9 pr-3 py-1.5 rounded-lg border border-slate-700/60 focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
            <span>Showing <strong>{filteredRows.length}</strong> items across <strong>{comparison.contractorSummaries.length}</strong> contractor quotes</span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#121b30] text-slate-300 uppercase tracking-wider font-bold text-[10px] sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="py-3 px-3 border-b border-slate-800 w-12 text-center">#</th>
                <th className="py-3 px-3 border-b border-slate-800 min-w-[240px]">Specification / BOQ Item</th>
                <th className="py-3 px-2 border-b border-slate-800 w-16 text-center">Unit</th>
                <th className="py-3 px-2 border-b border-slate-800 w-20 text-right">Qty</th>
                <th className="py-3 px-3 border-b border-slate-800 w-28 text-right bg-blue-950/20 text-blue-300">
                  Baseline (Est)
                </th>

                {/* Columns for each contractor */}
                {comparison.contractorSummaries.map((c) => (
                  <th
                    key={c.contractorId}
                    className="py-3 px-3 border-b border-slate-800 min-w-[170px] text-right font-bold"
                  >
                    <div className="truncate text-slate-100">{c.contractorName}</div>
                    <div className="text-[9px] text-cyan-400 font-mono font-normal">Rank #{c.rankScopeAdjusted}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredRows.map((row, idx) => (
                <tr
                  key={row.boqItemId}
                  className={idx % 2 === 0 ? 'bg-[#0f1628]/60 hover:bg-[#152038]' : 'bg-[#0b101c]/60 hover:bg-[#152038]'}
                >
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono font-medium">
                    {row.itemNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-100 text-xs">{row.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={row.description}>
                      {row.description}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-300 font-mono text-[11px]">
                    {row.unit}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-200 font-mono font-medium">
                    {Number(row.quantity).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold bg-blue-950/10 text-blue-300">
                    <div>₹{row.baselineRate}</div>
                    <div className="text-[10px] text-blue-400/80 font-normal">₹{Number(row.baselineAmount).toLocaleString()}</div>
                  </td>

                  {/* Contractor Quotes */}
                  {row.contractorQuotes.map((cq, cIdx) => {
                    const isLowest = cq.quotedRate === row.lowestQuotedRate && Number(cq.quotedRate) > 0;
                    const isClient = cq.inclusionState === 'CLIENT_SUPPLIED';
                    const isExcluded = cq.inclusionState === 'EXCLUDED' || Number(cq.quotedRate) === 0;

                    return (
                      <td
                        key={cIdx}
                        className={`py-2.5 px-3 text-right font-mono transition-colors ${
                          isLowest
                            ? 'bg-emerald-950/30 border-l border-r border-emerald-500/20'
                            : ''
                        }`}
                      >
                        {isExcluded ? (
                          <div>
                            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              OMITTED
                            </span>
                            <div className="text-[10px] text-slate-500 line-through mt-0.5">₹0.00</div>
                          </div>
                        ) : isClient ? (
                          <div>
                            <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                              CLIENT MAT
                            </span>
                            <div className="text-[10px] text-indigo-300 font-semibold mt-0.5">₹{cq.quotedRate}</div>
                          </div>
                        ) : (
                          <div>
                            <div className={`font-bold ${isLowest ? 'text-emerald-400' : 'text-slate-200'}`}>
                              ₹{cq.quotedRate}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              ₹{Number(cq.quotedAmount).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
