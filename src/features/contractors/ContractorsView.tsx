import React, { useState, useEffect } from 'react';
import {
  Building,
  Phone,
  MapPin,
  Trophy,
  Search,
  ExternalLink,
  Briefcase,
} from 'lucide-react';
import { Contractor } from '../../types';
import { api } from '../../services/api';

interface ContractorsViewProps {
  onSelectProjectAndNavigate: (projectId: string) => void;
}

export const ContractorsView: React.FC<ContractorsViewProps> = ({ onSelectProjectAndNavigate }) => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);

  useEffect(() => {
    loadContractors();
  }, []);

  const loadContractors = async () => {
    try {
      setLoading(true);
      const data = await api.getContractors();
      setContractors(data);
      if (data.length > 0 && !selectedContractor) {
        setSelectedContractor(data[0]);
      }
    } catch (err) {
      console.error('Error loading contractors:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredContractors = contractors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.specialization && c.specialization.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Building className="w-7 h-7 text-cyan-400" />
            Contractor Directory & Bid Track Records
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse registered construction vendors, inspect bid history, phone numbers, and see which projects they have and their statuses.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search contractor, phone, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0c1427] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Grid: Contractor Table + Deep Dive Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contractor Cards List */}
        <div className="lg:col-span-5 space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs">Loading contractors...</div>
          ) : filteredContractors.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No contractors found matching search.</div>
          ) : (
            filteredContractors.map((c) => {
              const isSelected = selectedContractor?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedContractor(c)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#101b33] border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                      : 'bg-[#0a1122]/90 border-slate-800/80 hover:border-slate-700 hover:bg-[#0e172c]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                      {c.code}
                    </span>
                    {c.awardedProjectsCount > 0 ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> {c.awardedProjectsCount} Awarded
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                        {c.totalQuotationsSubmitted} {c.totalQuotationsSubmitted === 1 ? 'Bid' : 'Bids'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1">{c.name}</h3>

                  <div className="mt-2.5 space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-mono text-slate-300">{c.phone || 'Not Specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{c.specialization || 'Civil & Interior Works'}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">Total Quoted Value</span>
                    <span className="text-xs font-bold text-cyan-300">
                      ₹{Number(c.totalBiddedValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Contractor Deep-Dive Drawer */}
        <div className="lg:col-span-7 bg-[#0a1122]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl space-y-6">
          {selectedContractor ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                    {selectedContractor.code}
                  </span>
                  <span className="text-xs text-slate-400">{selectedContractor.specialization || 'Civil Vendor'}</span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">{selectedContractor.name}</h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {selectedContractor.address || 'Operational in Guwahati & Eastern Region'}
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#101b33] border border-slate-800">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Phone Number</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                    {selectedContractor.phone || 'N/A'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#101b33] border border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Awarded Contracts</span>
                  <span className="text-sm font-bold text-emerald-300 font-mono mt-0.5 block flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" /> {selectedContractor.awardedProjectsCount} Projects
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#101b33] border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Bidded Volume</span>
                  <span className="text-sm font-bold text-cyan-300 font-mono mt-0.5 block">
                    ₹{Number(selectedContractor.totalBiddedValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Projects & Quotations for this Contractor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    Projects & Bids for {selectedContractor.name} ({(selectedContractor.quotations?.length || 0) + (selectedContractor.assignedProjects?.length || 0)})
                  </h3>
                  <span className="text-xs text-slate-500">Status & quotation values</span>
                </div>

                {/* Assigned Awarded Projects */}
                {selectedContractor.assignedProjects && selectedContractor.assignedProjects.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Awarded Projects
                    </span>
                    {selectedContractor.assignedProjects.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-700/60 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                              {p.code}
                            </span>
                            <span className="font-bold text-sm text-white">{p.name}</span>
                          </div>
                          <span className="text-xs text-emerald-400 font-medium mt-1 block">
                            Status: {p.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <button
                          onClick={() => onSelectProjectAndNavigate(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          View Project <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submitted Quotations */}
                {selectedContractor.quotations && selectedContractor.quotations.length > 0 ? (
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tender Quotations Submitted
                    </span>
                    {selectedContractor.quotations.map((q) => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-[#10192e] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">
                              {q.quotationNumber}
                            </span>
                            <span className="text-xs font-bold text-white">{q.project?.name || 'Project'}</span>
                            {q.isFinalized && (
                              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1.5 py-0.5 rounded font-bold">
                                FINALIZED
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>Quoted: <strong className="text-cyan-300">₹{Number(q.totalRawAmount).toLocaleString('en-IN')}</strong></span>
                            <span>Scope: {q.quotationType}</span>
                            <span>Status: {q.project?.status.replace(/_/g, ' ')}</span>
                          </div>
                        </div>

                        {q.projectId && (
                          <button
                            onClick={() => onSelectProjectAndNavigate(q.projectId)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-center"
                          >
                            Open Project <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500 bg-[#0f172a] rounded-xl border border-slate-800">
                    No quotations on record for this contractor.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              Select a contractor from the left to view profile and bid track record.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
