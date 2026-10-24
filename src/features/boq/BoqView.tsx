import React, { useState } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  Download,
  Search,
} from 'lucide-react';

interface BoqViewProps {
  boqVersions: any[];
  onApprove: (id: string) => void;
}

export const BoqView: React.FC<BoqViewProps> = ({ boqVersions, onApprove }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!boqVersions || boqVersions.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400">
        <FileSpreadsheet className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
        <p>No client BOQ versions loaded yet. Use the "Upload & Ingest" tab to upload a client Excel sheet.</p>
      </div>
    );
  }

  const latest = boqVersions[0];
  const items = latest.items || [];

  // Extract unique categories
  const categories = Array.from(new Set(items.map((i: any) => i.category || 'Civil Works'))) as string[];

  const filteredItems = items.filter((itm: any) => {
    const matchesSearch =
      itm.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itm.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itm.itemNumber?.includes(searchTerm);

    if (selectedCategory === 'ALL') return matchesSearch;
    return matchesSearch && (itm.category || 'Civil Works') === selectedCategory;
  });

  const handleExportCSV = () => {
    const headers = ['Item #', 'Category', 'Title', 'Specification', 'Unit', 'Quantity', 'Estimated Rate (INR)', 'Estimated Amount (INR)'];
    const rows = [headers.join(',')];

    items.forEach((i: any) => {
      rows.push(
        [
          `"${i.itemNumber}"`,
          `"${i.category || 'Civil Works'}"`,
          `"${(i.title || '').replace(/"/g, '""')}"`,
          `"${(i.specification || i.description || '').replace(/"/g, '""')}"`,
          `"${i.unit}"`,
          `"${i.quantity}"`,
          `"${i.estimatedRate}"`,
          `"${i.estimatedAmount}"`,
        ].join(','),
      );
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Client_Requirement_Budget_${latest.revisionCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-extrabold text-white">{latest.title}</h2>
            <span className="badge badge-turnkey text-xs">{latest.revisionCode}</span>
            {latest.isApproved ? (
              <span className="badge badge-compliant text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved Baseline
              </span>
            ) : (
              <span className="badge badge-partial text-xs">Pending Approval</span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Authoritative scope & client requirement baseline extracted from client Excel tender sheet.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Client Budget</div>
            <div className="text-2xl font-black text-cyan-400">
              ₹{Number(latest.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" /> Export Budget (CSV)
            </button>

            {!latest.isApproved && (
              <button
                onClick={() => onApprove(latest.id)}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Approve BOQ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search items or specifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#10192e] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* BOQ Items Table */}
      <div className="glass-panel overflow-hidden border border-slate-800">
        <div className="p-4 border-b border-slate-800 bg-[#0e1526] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Master BOQ Line Items ({filteredItems.length})</span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#121b30] text-slate-300 uppercase tracking-wider font-bold text-[10px] sticky top-0 z-20">
              <tr>
                <th className="py-3 px-3 border-b border-slate-800 w-16 text-center">Item #</th>
                <th className="py-3 px-3 border-b border-slate-800 w-36">Category</th>
                <th className="py-3 px-3 border-b border-slate-800">Description & Specification</th>
                <th className="py-3 px-3 border-b border-slate-800 w-20 text-center">Unit</th>
                <th className="py-3 px-3 border-b border-slate-800 w-24 text-right">Quantity</th>
                <th className="py-3 px-3 border-b border-slate-800 w-28 text-right">Client Rate</th>
                <th className="py-3 px-3 border-b border-slate-800 w-32 text-right">Client Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredItems.map((item: any, idx: number) => (
                <tr
                  key={item.id}
                  className={idx % 2 === 0 ? 'bg-[#0f1628]/60 hover:bg-[#152038]' : 'bg-[#0b101c]/60 hover:bg-[#152038]'}
                >
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono font-medium">
                    {item.itemNumber}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-medium text-[11px]">
                    {item.category || 'Civil Works'}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-100">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                    {item.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                    {Number(item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-cyan-300 font-semibold">
                    ₹{Number(item.estimatedRate).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                    ₹{Number(item.estimatedAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
