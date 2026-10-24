import React, { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FolderKanban,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Client } from '../../types';
import { api } from '../../services/api';

interface ClientsViewProps {
  onSelectProjectAndNavigate: (projectId: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ onSelectProjectAndNavigate }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await api.getClients();
      setClients(data);
      if (data.length > 0 && !selectedClient) {
        setSelectedClient(data[0]);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-cyan-400" />
            Client Directory & Project Portfolios
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track client entities, phone numbers, tax IDs, and inspect all active and completed project packages.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search clients, phone, or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0c1427] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Grid: Client Table + Deep Dive Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Client Cards List */}
        <div className="lg:col-span-5 space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No clients found matching search.</div>
          ) : (
            filteredClients.map((client) => {
              const isSelected = selectedClient?.id === client.id;

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#101b33] border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                      : 'bg-[#0a1122]/90 border-slate-800/80 hover:border-slate-700 hover:bg-[#0e172c]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                      {client.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      {client.totalProjects} {client.totalProjects === 1 ? 'Project' : 'Projects'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1">{client.name}</h3>

                  <div className="mt-2.5 space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-mono text-slate-300">{client.phone || 'Not Specified'}</span>
                    </div>
                    {client.email && client.email !== 'N/A' && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500 font-mono">
                      GSTIN: {client.gstin || 'Unregistered'}
                    </span>
                    <span className="text-xs font-bold text-cyan-300">
                      ₹{Number(client.totalBudgetValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Client Deep-Dive Drawer */}
        <div className="lg:col-span-7 bg-[#0a1122]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl space-y-6">
          {selectedClient ? (
            <div className="space-y-6">
              {/* Client Profile Header */}
              <div className="pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                    {selectedClient.code}
                  </span>
                  <span className="text-xs text-slate-400">Registered Corporate Client</span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">{selectedClient.name}</h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {selectedClient.billingAddress || 'Corporate Headquarters'}
                </p>
              </div>

              {/* Key Client Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#101b33] border border-slate-800">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Contact Phone</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                    {selectedClient.phone || 'N/A'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#101b33] border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">GSTIN / Tax ID</span>
                  <span className="text-xs font-bold text-slate-200 font-mono mt-1 block truncate">
                    {selectedClient.gstin || 'Unregistered'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#101b33] border border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Total Project Value</span>
                  <span className="text-sm font-bold text-emerald-300 font-mono mt-0.5 block">
                    ₹{Number(selectedClient.totalBudgetValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* List of Projects for this Client */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-cyan-400" />
                    Projects for {selectedClient.name} ({selectedClient.projects?.length || 0})
                  </h3>
                  <span className="text-xs text-slate-500">Click to deep-dive into project tender</span>
                </div>

                {selectedClient.projects && selectedClient.projects.length > 0 ? (
                  <div className="space-y-3">
                    {selectedClient.projects.map((prj) => (
                      <div
                        key={prj.id}
                        className="p-4 rounded-xl bg-[#10192e] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                              {prj.code}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                prj.status === 'AWARDED'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                  : prj.status === 'CLOSED'
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-blue-950 text-blue-400 border border-blue-800'
                              }`}
                            >
                              {prj.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{prj.name}</h4>

                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                            {prj.assignedContractor && (
                              <span className="text-emerald-400 font-semibold">
                                Awarded: {prj.assignedContractor.name}
                              </span>
                            )}
                            {prj.boqVersions?.[0]?.totalAmount && (
                              <span>Budget: ₹{Number(prj.boqVersions[0].totalAmount).toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectProjectAndNavigate(prj.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-center"
                        >
                          Open Project <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500 bg-[#0f172a] rounded-xl border border-slate-800">
                    No projects found for this client. Upload a Client BOQ to create a new project.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              Select a client from the left to view profile and project portfolio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
