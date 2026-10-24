import React, { useState } from 'react';
import {
  FolderKanban,
  Building,
  Phone,
  Trophy,
  Edit3,
  BarChart3,
  X,
  Search,
  Award,
} from 'lucide-react';
import { Project, Quotation } from '../../types';
import { api } from '../../services/api';

interface ProjectsViewProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (p: Project) => void;
  onNavigateToComparison: () => void;
  onRefreshProjects: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  onNavigateToComparison,
  onRefreshProjects,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeProject, setActiveProject] = useState<Project | null>(selectedProject || projects[0] || null);

  // Negotiation & Finalization Modal States
  const [finalizingQuotation, setFinalizingQuotation] = useState<Quotation | null>(null);
  const [finalizationNotes, setFinalizationNotes] = useState('');
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [editedRates, setEditedRates] = useState<{ [itemId: string]: number }>({});
  const [saving, setSaving] = useState(false);
  const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenFinalizeModal = (quote: Quotation) => {
    setFinalizingQuotation(quote);
    setFinalizationNotes(`Finalized tender rate negotiation with ${quote.contractor.name}`);
    setModalMessage(null);
  };

  const handleConfirmFinalization = async () => {
    if (!activeProject || !finalizingQuotation) return;
    setSaving(true);
    setModalMessage(null);

    try {
      // Check if there are negotiated rate updates
      const updates = Object.entries(editedRates).map(([itemId, negotiatedRate]) => ({
        itemId,
        negotiatedRate,
      }));

      const updatedPrj = await api.finalizeQuotation(
        activeProject.id,
        finalizingQuotation.id,
        updates.length > 0 ? updates : undefined,
        finalizationNotes,
      );

      setModalMessage({ type: 'success', text: `Contract successfully awarded to ${finalizingQuotation.contractor.name}!` });
      onRefreshProjects();
      setActiveProject(updatedPrj);
      setTimeout(() => {
        setFinalizingQuotation(null);
        setModalMessage(null);
      }, 1500);
    } catch (err: any) {
      setModalMessage({ type: 'error', text: err.message || 'Error finalizing quotation' });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditRatesModal = (quote: Quotation) => {
    setEditingQuotation(quote);
    const initialRates: { [itemId: string]: number } = {};
    (quote.items || []).forEach((itm) => {
      initialRates[itm.id] = Number(itm.negotiatedRate || itm.quotedRate);
    });
    setEditedRates(initialRates);
    setModalMessage(null);
  };

  const handleSaveRates = async () => {
    if (!editingQuotation) return;
    setSaving(true);
    setModalMessage(null);

    try {
      const updates = Object.entries(editedRates).map(([itemId, negotiatedRate]) => ({
        itemId,
        negotiatedRate,
      }));

      await api.updateQuotationRates(editingQuotation.id, updates);
      setModalMessage({ type: 'success', text: 'Negotiated item rates saved and total recalculated!' });
      onRefreshProjects();
      setTimeout(() => {
        setEditingQuotation(null);
        setModalMessage(null);
      }, 1200);
    } catch (err: any) {
      setModalMessage({ type: 'error', text: err.message || 'Error updating rates' });
    } finally {
      setSaving(false);
    }
  };

  const calculateDynamicTotal = () => {
    if (!editingQuotation?.items) return '0.00';
    let total = 0;
    for (const itm of editingQuotation.items) {
      const rate = editedRates[itm.id] !== undefined ? editedRates[itm.id] : Number(itm.quotedRate);
      total += Number(itm.quantity) * rate;
    }
    return total.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <FolderKanban className="w-7 h-7 text-cyan-400" />
            Projects Hub & Contract Awarding
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse all projects, inspect linked clients, review incoming quotations, and finalize/negotiate contract rates.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0c1427] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Grid: Projects List + Deep-Dive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Projects List */}
        <div className="lg:col-span-5 space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {filteredProjects.map((p) => {
            const isSelected = activeProject?.id === p.id;
            const boqTotal = p.boqVersions?.[0]?.totalAmount || '0';

            return (
              <div
                key={p.id}
                onClick={() => {
                  setActiveProject(p);
                  onSelectProject(p);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#101b33] border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                    : 'bg-[#0a1122]/90 border-slate-800/80 hover:border-slate-700 hover:bg-[#0e172c]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                    {p.code}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      p.status === 'AWARDED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : p.status === 'CLOSED'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}
                  >
                    {p.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1">{p.name}</h3>

                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                  <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{p.client?.name || 'Unassigned Client'}</span>
                </div>

                {/* Assigned Contractor or Quotations summary */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Client Budget</span>
                    <span className="font-bold text-slate-300">
                      ₹{Number(boqTotal).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  <div className="text-right">
                    {p.assignedContractor ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                        <Trophy className="w-3 h-3" /> {p.assignedContractor.name}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        {p.quotations?.length || 0} Quotes Received
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Project Deep-Dive Panel */}
        <div className="lg:col-span-7 bg-[#0a1122]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl space-y-6">
          {activeProject ? (
            <div className="space-y-6">
              {/* Project Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                      {activeProject.code}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {activeProject.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">{activeProject.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">{activeProject.description || 'No description'}</p>
                </div>

                <button
                  onClick={onNavigateToComparison}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all shrink-0"
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Open Comparison Matrix
                </button>
              </div>

              {/* Client & Contractor Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Client Profile Card */}
                <div className="p-4 rounded-xl bg-[#101b33] border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> Linked Client
                  </span>
                  <div className="text-sm font-bold text-white">{activeProject.client?.name}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Phone className="w-3 h-3 text-cyan-400" />
                    <span>{activeProject.client?.phone || 'No phone recorded'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    GSTIN: {activeProject.client?.gstin || 'Unregistered'}
                  </div>
                </div>

                {/* Assigned Contractor Banner */}
                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    activeProject.assignedContractor
                      ? 'bg-emerald-950/40 border-emerald-700/60'
                      : 'bg-[#101b33] border-slate-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Awarded Contractor
                  </span>
                  {activeProject.assignedContractor ? (
                    <>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {activeProject.assignedContractor.name}
                        <span className="badge badge-compliant text-[9px]">FINALIZED</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{activeProject.assignedContractor.phone || 'Contact on file'}</span>
                      </div>
                      {activeProject.finalizedQuotation && (
                        <div className="text-xs font-bold text-emerald-300">
                          Finalized Amount: ₹{Number(activeProject.finalizedQuotation.totalRawAmount).toLocaleString('en-IN')}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-slate-400 py-2">
                      No contractor awarded yet. Review quotations below to select and award.
                    </div>
                  )}
                </div>
              </div>

              {/* Quotations Received List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-cyan-400" />
                    Quotations Received ({activeProject.quotations?.length || 0})
                  </h3>
                  <span className="text-xs text-slate-500">Select quotation to finalize or edit rates</span>
                </div>

                {activeProject.quotations && activeProject.quotations.length > 0 ? (
                  <div className="space-y-2.5">
                    {activeProject.quotations.map((quote) => {
                      const isAwarded = quote.isFinalized || activeProject.finalizedQuotation?.id === quote.id;

                      return (
                        <div
                          key={quote.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                            isAwarded
                              ? 'bg-emerald-950/30 border-emerald-700/80'
                              : 'bg-[#10192e] border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{quote.contractor.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                {quote.quotationNumber}
                              </span>
                              {isAwarded && (
                                <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                                  AWARDED
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                              <span>
                                Raw Bid: <strong className="text-cyan-300">₹{Number(quote.totalRawAmount).toLocaleString('en-IN')}</strong>
                              </span>
                              <span>Type: <strong className="text-slate-300">{quote.quotationType}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Edit / Negotiate Rates Button */}
                            <button
                              onClick={() => handleOpenEditRatesModal(quote)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-cyan-400" /> Negotiate Rates
                            </button>

                            {/* Finalize & Award Button */}
                            <button
                              disabled={isAwarded}
                              onClick={() => handleOpenFinalizeModal(quote)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                                isAwarded
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50 cursor-default'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                              }`}
                            >
                              <Trophy className="w-3.5 h-3.5" />
                              {isAwarded ? 'Awarded Winner' : 'Finalize & Award'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500 bg-[#0f172a] rounded-xl border border-slate-800">
                    No quotations submitted for this project yet. Use the "Upload & Ingest" tab to add contractor quotes.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              Select a project from the left to view details and quotations.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: FINALIZE & AWARD QUOTATION */}
      {finalizingQuotation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1325] border border-cyan-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Trophy className="w-5 h-5" /> Award Tender to {finalizingQuotation.contractor.name}
              </div>
              <button onClick={() => setFinalizingQuotation(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  modalMessage.type === 'success' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                }`}
              >
                {modalMessage.text}
              </div>
            )}

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                You are awarding the project <strong>{activeProject?.name}</strong> to:
              </p>
              <div className="p-3.5 rounded-xl bg-[#101b33] border border-slate-800">
                <div className="font-bold text-sm text-white">{finalizingQuotation.contractor.name}</div>
                <div className="text-slate-400 mt-1">Quotation Ref: {finalizingQuotation.quotationNumber}</div>
                <div className="text-cyan-300 font-bold text-base mt-2">
                  Total Contract Value: ₹{Number(finalizingQuotation.totalRawAmount).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Commercial Award Notes</label>
                <textarea
                  rows={3}
                  value={finalizationNotes}
                  onChange={(e) => setFinalizationNotes(e.target.value)}
                  className="w-full bg-[#131d33] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setFinalizingQuotation(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={handleConfirmFinalization}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black shadow-lg shadow-emerald-500/20"
              >
                {saving ? 'Awarding Contract...' : 'Confirm & Award Contract'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT & NEGOTIATE LINE ITEM RATES */}
      {editingQuotation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1325] border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  Negotiate Rates: {editingQuotation.contractor.name} ({editingQuotation.quotationNumber})
                </h3>
                <span className="text-xs text-slate-400">
                  Adjust item rates to reflect negotiated commercial agreements. Totals update dynamically.
                </span>
              </div>
              <button onClick={() => setEditingQuotation(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMessage && (
              <div
                className={`my-3 p-3 rounded-xl text-xs font-bold ${
                  modalMessage.type === 'success' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                }`}
              >
                {modalMessage.text}
              </div>
            )}

            {/* Editable Item Table */}
            <div className="flex-1 overflow-y-auto my-4 pr-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e172a] text-slate-400 uppercase font-semibold sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Item #</th>
                    <th className="py-2.5 px-3">Specification / Title</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3 text-right">Quoted Rate</th>
                    <th className="py-2.5 px-3 text-right">Negotiated Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {(editingQuotation.items || []).map((itm) => {
                    const activeRate = editedRates[itm.id] !== undefined ? editedRates[itm.id] : Number(itm.quotedRate);
                    const itemAmount = Number(itm.quantity) * activeRate;
                    const isEdited = activeRate !== Number(itm.quotedRate);

                    return (
                      <tr key={itm.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono text-cyan-400">{itm.itemNumber}</td>
                        <td className="py-2.5 px-3 text-white max-w-xs truncate">{itm.title || itm.description}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{Number(itm.quantity).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-slate-400">{itm.unit}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400 font-mono">
                          ₹{Number(itm.quotedRate).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={activeRate}
                            onChange={(e) =>
                              setEditedRates({ ...editedRates, [itm.id]: parseFloat(e.target.value) || 0 })
                            }
                            className={`w-28 text-right bg-[#131d33] border rounded-lg px-2.5 py-1 text-xs font-mono font-bold focus:outline-none focus:border-cyan-400 ${
                              isEdited ? 'border-cyan-400 text-cyan-300' : 'border-slate-700 text-white'
                            }`}
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                          ₹{itemAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Summary & Save */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Recalculated Quotation Total</span>
                <span className="text-xl font-black text-cyan-300 font-mono">₹{calculateDynamicTotal()}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingQuotation(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={handleSaveRates}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/20"
                >
                  {saving ? 'Saving Rates...' : 'Save Negotiated Rates'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
