import React, { useState } from 'react';
import { CostComparisonResult, ItemComparisonMatrixRow } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  Layers,
  Sparkles,
  Search,
  ArrowUpDown,
  Download,
  Info,
  X,
} from 'lucide-react';

interface ComparisonViewProps {
  comparison: CostComparisonResult | null;
  loading: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ comparison, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeItemDrawer, setActiveItemDrawer] = useState<ItemComparisonMatrixRow | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-slate-400 gap-3">
        <div className="w-9 h-9 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Computing deterministic bid comparison & scope intelligence matrix...
        </p>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="glass-panel p-10 text-center text-slate-400">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">No Comparison Data Available</h3>
        <p className="text-xs">Upload contractor quotations to generate the comparison matrix.</p>
      </div>
    );
  }

  // Filter items
  const filteredRows = comparison.matrixRows.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.itemNumber.includes(searchTerm);

    if (selectedCategory === 'ALL') return matchesSearch;
    if (selectedCategory === 'FLOORING') return matchesSearch && /flooring|spc|skirting/i.test(r.title + r.description);
    if (selectedCategory === 'TOILET') return matchesSearch && /toilet|tile|cladding/i.test(r.title + r.description);
    if (selectedCategory === 'CIVIL') return matchesSearch && /civil|base|waste|mortar/i.test(r.title + r.description);
    return matchesSearch;
  });

  // Client-Side CSV Export Function
  const handleExportCSV = () => {
    const headers = ['Item #', 'Title', 'Description', 'Unit', 'Quantity', 'Baseline Rate (INR)', 'Baseline Amount (INR)'];
    comparison.contractorSummaries.forEach((c) => {
      headers.push(`${c.contractorName} Rate`, `${c.contractorName} Amount`, `${c.contractorName} Scope`);
    });

    const csvRows = [headers.join(',')];

    for (const r of comparison.matrixRows) {
      const row = [
        `"${r.itemNumber}"`,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.description.replace(/"/g, '""')}"`,
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
    link.setAttribute('download', `Tender_Bid_Comparison_${comparison.projectName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Currency formatter
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

  const sortedContractors = [...comparison.contractorSummaries].sort(
    (a, b) => a.rankScopeAdjusted - b.rankScopeAdjusted,
  );

  return (
    <div className="space-y-6 animate-fade-in relative pb-12">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div
          className="glass-panel p-5 relative overflow-hidden"
          title={`Approved Baseline: ₹${Number(comparison.baselineTotal).toLocaleString('en-IN')}`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>BOQ Baseline ({comparison.boqVersionCode})</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight font-mono">
            {formatINR(comparison.baselineTotal)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-400 font-medium">
            <span>Approved Tender Baseline (97 Items)</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          className="glass-panel p-5 relative overflow-hidden"
          title={`Raw Quoted Bid: ₹${Number(comparison.lowestRawBid.amount).toLocaleString('en-IN')}`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Lowest Quoted Raw Bid</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 tracking-tight font-mono">
            {formatINR(comparison.lowestRawBid.amount)}
          </div>
          <div className="text-xs text-amber-400 font-medium mt-2 truncate">
            <span>By {comparison.lowestRawBid.contractorName}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          className="glass-panel p-5 relative overflow-hidden border-cyan-500/30"
          title={`Scope-Adjusted Bid: ₹${Number(comparison.lowestScopeAdjustedBid.amount).toLocaleString('en-IN')}`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/15 rounded-full blur-xl pointer-events-none" />
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Lowest Scope-Adjusted Bid</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 tracking-tight font-mono">
            {formatINR(comparison.lowestScopeAdjustedBid.amount)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-cyan-300 font-medium truncate">
            <span>By {comparison.lowestScopeAdjustedBid.contractorName}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Scope Completeness Alert</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-slate-100 mt-1">
            {comparison.lowestCompliantBid ? (
              <span className="text-emerald-400 flex items-center gap-1 text-sm">
                <CheckCircle2 className="w-4 h-4" /> 100% Compliant Bid
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1.5 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" /> Exclusions Reconciled
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Missing items automatically benchmarked to protect project profit margins.
          </p>
        </div>
      </div>

      {/* Contractor Rankings & Scope Inclusions Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-cyan-400" /> Contractor Quotations & Normalization Leaderboard
            </h3>
            <p className="text-[11px] text-slate-400">Ranked strictly by Scope-Adjusted True Cost (including missing materials)</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Matrix</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {sortedContractors.map((c) => {
            const isRank1 = c.rankScopeAdjusted === 1;
            return (
              <div
                key={c.contractorId}
                className={`glass-panel p-4 flex flex-col justify-between transition-all ${
                  isRank1
                    ? 'border-cyan-500/60 bg-gradient-to-b from-[#142340] to-[#0f172a] shadow-glow'
                    : 'hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        isRank1 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      RANK #{c.rankScopeAdjusted}
                    </span>
                    <span className={c.isFullyCompliant ? 'badge badge-compliant' : 'badge badge-partial'}>
                      {c.isFullyCompliant ? 'COMPLIANT' : 'PARTIAL SCOPE'}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-100 mb-0.5 truncate" title={c.contractorName}>
                    {c.contractorName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mb-3">{c.quotationNumber}</div>

                  <div className="space-y-1 text-xs bg-[#090f1d] p-2.5 rounded-xl border border-slate-800/80 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">Raw Quoted:</span>
                      <span className="font-mono font-semibold text-slate-200 text-xs">
                        {formatINR(c.rawQuotedTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                      <span className="text-cyan-400 font-semibold text-[11px]">Scope-Adjusted:</span>
                      <span className="font-mono font-bold text-cyan-300 text-xs">
                        {formatINR(c.scopeAdjustedTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                  <span>
                    Missing Items: <strong className={c.missingItemsCount > 0 ? 'text-amber-400' : 'text-slate-300'}>{c.missingItemsCount}</strong>
                  </span>
                  <span>
                    Client Mat: <strong className={c.clientSuppliedCount > 0 ? 'text-indigo-400' : 'text-slate-300'}>{c.clientSuppliedCount}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Table with Interactive Filtering */}
      <div className="glass-panel overflow-hidden border border-slate-800">
        {/* Table Top Controls */}
        <div className="p-4 border-b border-slate-800 bg-[#0e1526] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter pills */}
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Items ({comparison.matrixRows.length})
            </button>
            <button
              onClick={() => setSelectedCategory('FLOORING')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === 'FLOORING'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Flooring & SPC
            </button>
            <button
              onClick={() => setSelectedCategory('TOILET')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === 'TOILET'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Toilet & Wet Works
            </button>
            <button
              onClick={() => setSelectedCategory('CIVIL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === 'CIVIL'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Civil & Base
            </button>
          </div>

          {/* Search Field */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search specifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141d33] text-xs text-slate-200 pl-9 pr-3 py-1.5 rounded-lg border border-slate-700/60 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>
        </div>

        {/* Matrix Grid Table */}
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#10182b] text-slate-300 uppercase tracking-wider font-bold text-[10px] sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="py-3 px-3 border-b border-slate-800 w-12 text-center">#</th>
                <th className="py-3 px-3 border-b border-slate-800 min-w-[260px]">Specification / BOQ Item</th>
                <th className="py-3 px-2 border-b border-slate-800 w-14 text-center">Unit</th>
                <th className="py-3 px-2 border-b border-slate-800 w-18 text-right">Qty</th>
                <th className="py-3 px-3 border-b border-slate-800 w-28 text-right bg-blue-950/20 text-blue-300">
                  Baseline (Est)
                </th>

                {/* Dynamic Columns for all 8 contractors strictly sorted by rank */}
                {sortedContractors.map((c) => (
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
            <tbody className="divide-y divide-slate-800/60">
              {filteredRows.map((row, idx) => (
                <tr
                  key={row.boqItemId}
                  onClick={() => setActiveItemDrawer(row)}
                  className={`cursor-pointer transition-colors ${
                    idx % 2 === 0 ? 'bg-[#0a0f1d] hover:bg-[#131f38]' : 'bg-[#080d19] hover:bg-[#131f38]'
                  }`}
                >
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                    {row.itemNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-100 text-xs flex items-center gap-1.5">
                      <span>{row.title}</span>
                      <Info className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
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
                    <div>₹{Number(row.baselineRate).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                    <div className="text-[9px] text-blue-400/80 font-normal">
                      {formatINR(row.baselineAmount)}
                    </div>
                  </td>

                  {/* Contractor Quote Rates & Amounts matched by contractor name */}
                  {sortedContractors.map((sc) => {
                    const cq = row.contractorQuotes.find((q) => q.contractorName === sc.contractorName) || {
                      quotedRate: '0.00',
                      quotedAmount: '0.00',
                      inclusionState: 'EXCLUDED' as const,
                      scopeAdjustedAmount: '0.00',
                    };
                    const isLowest = cq.quotedRate === row.lowestQuotedRate && Number(cq.quotedRate) > 0;
                    const isClient = cq.inclusionState === 'CLIENT_SUPPLIED';
                    const isExcluded = cq.inclusionState === 'EXCLUDED' || Number(cq.quotedRate) === 0;

                    return (
                      <td
                        key={sc.contractorId}
                        className={`py-2.5 px-3 text-right font-mono transition-colors ${
                          isLowest
                            ? 'bg-emerald-950/30 border-l border-r border-emerald-500/20'
                            : ''
                        }`}
                      >
                        {isExcluded ? (
                          <div>
                            <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              OMITTED
                            </span>
                            <div className="text-[10px] text-slate-500 line-through mt-0.5">₹0.00</div>
                          </div>
                        ) : isClient ? (
                          <div>
                            <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
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
                              {formatINR(cq.quotedAmount)}
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

      {/* Item Specification Deep-Dive Modal / Drawer */}
      {activeItemDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-xl bg-[#0b1120] border-l border-slate-800 h-full p-6 overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                  Item #{activeItemDrawer.itemNumber}
                </span>
                <h3 className="text-base font-bold text-white">{activeItemDrawer.title}</h3>
              </div>
              <button
                onClick={() => setActiveItemDrawer(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Specification & Scope Details
              </h4>
              <p className="text-xs text-slate-300 bg-[#070b14] p-3.5 rounded-xl border border-slate-800 leading-relaxed font-sans">
                {activeItemDrawer.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">Tender Quantity:</span>
                <div className="font-mono font-bold text-white text-sm">
                  {activeItemDrawer.quantity} {activeItemDrawer.unit}
                </div>
              </div>
              <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">Baseline Estimate Rate:</span>
                <div className="font-mono font-bold text-cyan-400 text-sm">
                  ₹{activeItemDrawer.baselineRate} / {activeItemDrawer.unit}
                </div>
              </div>
            </div>

            {/* Contractor Rates Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Contractor Quotation Comparison
              </h4>
              <div className="space-y-2">
                {activeItemDrawer.contractorQuotes.map((cq, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#070b14] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{cq.contractorName}</div>
                      <div className="text-[10px] text-slate-400">
                        Status: <strong className="text-cyan-400">{cq.inclusionState}</strong>
                        {cq.notes && <span className="text-amber-400 ml-1">({cq.notes})</span>}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-emerald-400">₹{cq.quotedRate}</div>
                      <div className="text-[10px] text-slate-400">₹{cq.quotedAmount} total</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
