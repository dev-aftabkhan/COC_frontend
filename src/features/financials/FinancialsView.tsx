import React from 'react';
import { Project } from '../../types';
import { DollarSign, PieChart, Receipt } from 'lucide-react';

interface FinancialsViewProps {
  project: Project | null;
}

export const FinancialsView: React.FC<FinancialsViewProps> = ({ project }) => {
  if (!project || !project.financials) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400">
        <DollarSign className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
        <p>No financial data available for this project yet.</p>
      </div>
    );
  }

  const f = project.financials;
  const marginPct = Number(f.forecastMarginPercent);
  const isHealthyMargin = marginPct >= 15;

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Financial Health Header */}
      <div>
        <h2 className="text-lg font-bold text-white">Project Financial Health & Margin Forecast</h2>
        <p className="text-xs text-slate-400">
          Real-time reconciliation of baseline contract value, commitments, cost recognition, and margin analytics.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5" title={`Exact: ₹${Number(f.contractRevenue).toLocaleString('en-IN')}`}>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Contract Revenue Baseline
          </div>
          <div className="text-2xl font-black text-white">
            {formatINR(f.contractRevenue)}
          </div>
          <div className="text-xs text-blue-400 mt-2 font-medium">Approved Client Scope</div>
        </div>

        <div className="glass-panel p-5" title={`Exact: ₹${Number(f.forecastFinalCost).toLocaleString('en-IN')}`}>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Forecast Final Cost
          </div>
          <div className="text-2xl font-black text-amber-300">
            {formatINR(f.forecastFinalCost)}
          </div>
          <div className="text-xs text-amber-400 mt-2 font-medium">Recognized + Cost to Complete</div>
        </div>

        <div className="glass-panel p-5" title={`Exact: ₹${Number(f.forecastGrossMargin).toLocaleString('en-IN')}`}>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Forecast Gross Margin
          </div>
          <div className={`text-2xl font-black ${isHealthyMargin ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatINR(f.forecastGrossMargin)}
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-medium">Revenue − Forecast Final Cost</div>
        </div>

        <div className="glass-panel p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Forecast Margin %
          </div>
          <div className={`text-2xl font-black ${isHealthyMargin ? 'text-emerald-400' : 'text-rose-400'}`}>
            {f.forecastMarginPercent}%
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Target: ≥ 18.00%</div>
        </div>
      </div>

      {/* Financial Ledger Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" /> Cost Recognition & Commitments
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded bg-[#0b101c] border border-slate-800">
              <span className="text-slate-400">Open Purchase Commitments (PO):</span>
              <span className="font-mono font-bold text-slate-200">
                ₹{Number(f.purchaseCommitments).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#0b101c] border border-slate-800">
              <span className="text-slate-400">Actual Recognized Expenses & Bills:</span>
              <span className="font-mono font-bold text-slate-200">
                ₹{Number(f.actualCostRecognized).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" /> Client Billing & Cash Flow
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded bg-[#0b101c] border border-slate-800">
              <span className="text-slate-400">Total Client Invoiced:</span>
              <span className="font-mono font-bold text-slate-200">
                ₹{Number(f.clientInvoiced).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#0b101c] border border-slate-800">
              <span className="text-slate-400">Receipts Collected:</span>
              <span className="font-mono font-bold text-emerald-400">
                ₹{Number(f.clientReceived).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#0b101c] border border-slate-800">
              <span className="text-slate-400">Outstanding Receivables:</span>
              <span className="font-mono font-bold text-amber-400">
                ₹{Number(f.accountsReceivable).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
