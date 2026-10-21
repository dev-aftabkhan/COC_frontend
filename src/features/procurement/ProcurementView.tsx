import React, { useState } from 'react';
import { Project } from '../../types';
import { PackageCheck, Plus } from 'lucide-react';

interface ProcurementViewProps {
  project: Project | null;
}

export const ProcurementView: React.FC<ProcurementViewProps> = ({ project }) => {
  const [poList] = useState([
    {
      id: 'PO-ITC-001',
      vendor: 'M/S KSB INTERIOR',
      description: 'Room Flooring waste tile base & cement mortar supply',
      amount: '1946077.38',
      status: 'ISSUED',
      date: '2026-10-15',
      deliveryStatus: 'PARTIALLY_DELIVERED',
      grnCount: 2,
    },
    {
      id: 'PO-ITC-002',
      vendor: 'Rajat Sharma (Paras Bhai Vendor)',
      description: 'SPC Flooring 6mm WTL-01 and 100mm Skirting Turnkey',
      amount: '3567380.00',
      status: 'ISSUED',
      date: '2026-10-18',
      deliveryStatus: 'AWAITING_SHIPMENT',
      grnCount: 0,
    },
  ]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-cyan-400" />
            <span>Procurement & Goods Receipt Management (GRN)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Project: <strong className="text-slate-200">{project?.name || 'Tender Package'}</strong> • Issue Purchase Orders based on awarded quotation rates.
          </p>
        </div>

        <button className="btn-primary text-xs cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Issue New Purchase Order</span>
        </button>
      </div>

      {/* PO List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {poList.map((po) => (
          <div key={po.id} className="glass-panel p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-cyan-400 font-bold text-xs">{po.id}</span>
                <span className="badge badge-compliant text-[10px]">{po.status}</span>
              </div>

              <h3 className="font-bold text-sm text-slate-100 mb-1">{po.vendor}</h3>
              <p className="text-xs text-slate-400 mb-3">{po.description}</p>

              <div className="bg-[#0b101c] p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center mb-3">
                <span className="text-slate-400">Committed Amount:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ₹{Number(po.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Date: <strong className="text-slate-200">{po.date}</strong></span>
              <span className="badge badge-turnkey text-[10px]">{po.deliveryStatus.replace(/_/g, ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
