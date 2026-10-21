import React from 'react';
import { FileText, Building, CheckCircle2, AlertTriangle } from 'lucide-react';

interface QuotationsViewProps {
  quotations: any[];
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({ quotations }) => {
  if (!quotations || quotations.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400">
        <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
        <p>No contractor quotations uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Contractor Quotations ({quotations.length})</h2>
          <p className="text-xs text-slate-400">
            Tender responses ingested from contractor workbooks with automated scope categorization.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotations.map((q) => (
          <div key={q.id} className="glass-panel p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-cyan-400 font-semibold">{q.quotationNumber}</span>
                <span
                  className={
                    q.quotationType === 'TURNKEY'
                      ? 'badge badge-turnkey'
                      : q.quotationType === 'LABOUR_ONLY'
                      ? 'badge badge-labour'
                      : 'badge badge-partial'
                  }
                >
                  {q.quotationType.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-slate-100 text-sm truncate">{q.contractor?.name}</h3>
              </div>

              <div className="text-xs text-slate-400 mb-4">
                Revision: <strong className="text-slate-200">{q.revision}</strong> | Items Quoted:{' '}
                <strong className="text-slate-200">{q.items?.length || 0}</strong>
              </div>

              <div className="bg-[#0b101c] p-3 rounded-lg border border-slate-800 mb-3">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Quoted Amount</div>
                <div className="text-xl font-mono font-bold text-emerald-400">
                  ₹{Number(q.totalRawAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span>Source: <code className="text-slate-300 font-mono text-[10px]">{q.sourceFile || 'Uploaded XLSX'}</code></span>
              {q.isCompliant ? (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[10px]">
                  <CheckCircle2 className="w-3 h-3" /> Turnkey Scope
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 font-semibold text-[10px]">
                  <AlertTriangle className="w-3 h-3" /> Exclusions Active
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
