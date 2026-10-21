import React from 'react';
import { CheckCircle2, FileSpreadsheet, Layers, ShieldCheck } from 'lucide-react';

interface BoqViewProps {
  boqVersions: any[];
  onApprove: (id: string) => void;
}

export const BoqView: React.FC<BoqViewProps> = ({ boqVersions, onApprove }) => {
  if (!boqVersions || boqVersions.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400">
        <FileSpreadsheet className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
        <p>No client BOQ versions loaded yet.</p>
      </div>
    );
  }

  const latest = boqVersions[0];

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
            Authoritative scope baseline extracted from Client Excel tender documentation.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Baseline Amount</div>
            <div className="text-2xl font-black text-cyan-400">
              ₹{Number(latest.totalAmount).toLocaleString('en-IN')}
            </div>
          </div>
          {!latest.isApproved && (
            <button
              onClick={() => onApprove(latest.id)}
              className="btn-primary text-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              Approve BOQ
            </button>
          )}
        </div>
      </div>

      {/* BOQ Items Table */}
      <div className="glass-panel overflow-hidden border border-slate-800">
        <div className="p-4 border-b border-slate-800 bg-[#0e1526] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Master BOQ Line Items ({latest.items?.length || 0})</span>
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
                <th className="py-3 px-3 border-b border-slate-800 w-28 text-right">Est. Rate</th>
                <th className="py-3 px-3 border-b border-slate-800 w-32 text-right">Est. Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {(latest.items || []).map((item: any, idx: number) => (
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
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-200">
                    {Number(item.quantity).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                    ₹{Number(item.estimatedRate).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-cyan-300">
                    ₹{Number(item.estimatedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
