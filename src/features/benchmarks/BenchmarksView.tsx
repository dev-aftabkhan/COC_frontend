import React from 'react';
import { TrendingUp, MapPin, Building, Calendar } from 'lucide-react';

export const BenchmarksView: React.FC = () => {
  const benchmarks = [
    {
      itemCode: 'CAT-CIV-001',
      description: 'Room Flooring - waste tiles over cement mortar base',
      unit: 'SQMT',
      historicalRate: 950.0,
      currentLowestRate: 750.0,
      currentAwardedRate: 914.94,
      project: 'Radisson Blu Guwahati',
      location: 'Guwahati, Assam',
      date: 'Nov 2025',
      variancePct: -3.7,
    },
    {
      itemCode: 'CAT-CIV-004',
      description: 'Toilet Flooring - 600x600 vitrified tile in cement mortar',
      unit: 'SQMT',
      historicalRate: 1050.0,
      currentLowestRate: 900.0,
      currentAwardedRate: 968.76,
      project: 'Taj Vivanta Guwahati',
      location: 'Guwahati, Assam',
      date: 'Aug 2025',
      variancePct: -7.7,
    },
    {
      itemCode: 'CAT-CIV-005',
      description: 'Toilet Walls - 600x600 tile cladding with Laticrete adhesive',
      unit: 'SQMT',
      historicalRate: 1150.0,
      currentLowestRate: 1020.0,
      currentAwardedRate: 1022.58,
      project: 'Taj Vivanta Guwahati',
      location: 'Guwahati, Assam',
      date: 'Aug 2025',
      variancePct: -11.1,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <span>Regional Historical Cost Intelligence & Benchmarks</span>
        </h2>
        <p className="text-xs text-slate-400">
          Comparing current ITC Fortune Guwahati tender prices against verified contractual awarded rates in Guwahati, Assam.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {benchmarks.map((b) => (
          <div key={b.itemCode} className="glass-panel p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-cyan-400 text-xs font-bold">{b.itemCode}</span>
                <span className="badge badge-compliant text-[10px]">
                  {b.variancePct < 0 ? `${b.variancePct}% vs Historical` : `+${b.variancePct}% vs Historical`}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-100 mb-2 leading-snug">{b.description}</h3>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>{b.project}</span>
                <span className="text-slate-600">•</span>
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{b.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#090f1d] p-3 rounded-xl border border-slate-800 text-xs mb-3 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">Historical Rate:</div>
                  <div className="font-bold text-slate-200">₹{b.historicalRate.toFixed(2)} / {b.unit}</div>
                </div>
                <div>
                  <div className="text-[10px] text-cyan-400">Current Tender:</div>
                  <div className="font-bold text-cyan-300">₹{b.currentAwardedRate.toFixed(2)} / {b.unit}</div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {b.date}
              </span>
              <span className="text-emerald-400 font-semibold">Tender Rate Favorable</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
