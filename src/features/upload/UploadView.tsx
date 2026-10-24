import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Building,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowRight,
  Phone,
  FolderPlus,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { Project } from '../../types';

interface UploadViewProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectCreated: (project: Project) => void;
  onQuotationUploaded: (projectId: string) => void;
  onNavigateToComparison: () => void;
  onNavigateToProjects: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  projects,
  selectedProject,
  onProjectCreated,
  onQuotationUploaded,
  onNavigateToComparison,
  onNavigateToProjects,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'client' | 'contractor'>('client');

  // Client BOQ Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectName, setProjectName] = useState('');
  const [clientGstin, setClientGstin] = useState('');
  const [clientFile, setClientFile] = useState<File | null>(null);
  const [useLocalClientFile, setUseLocalClientFile] = useState(false);
  const [localClientPath, setLocalClientPath] = useState(
    '/Users/aftab/Nexio/Client_ITC FORTUNE GUWAHATI.xlsx',
  );

  // Contractor Form State
  const [targetProjectId, setTargetProjectId] = useState(selectedProject?.id || (projects[0]?.id || ''));
  const [contractorName, setContractorName] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [contractorFile, setContractorFile] = useState<File | null>(null);
  const [selectedLocalContractorFile, setSelectedLocalContractorFile] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [structuredBOQResult, setStructuredBOQResult] = useState<any | null>(null);

  const localContractorFiles = [
    { name: 'M/S KSB INTERIOR', file: '/Users/aftab/Nexio/ITC FORTUNE GUWAHATI FOR Civil (KSB INTERIOR).xlsx' },
    { name: 'Vinod Mistry', file: '/Users/aftab/Nexio/ITC FORTUNE GUWAHATI FOR CONTRACTORS ( Vinod Mistry ).xlsx' },
    { name: 'Brijesh Ji', file: '/Users/aftab/Nexio/ITC FORTUNE GUWAHATI FOR CONTRACTORS Brijesh Ji..xlsx' },
    { name: 'Rajat Sharma (Paras Bhai Vendor)', file: '/Users/aftab/Nexio/ITC FORTUNE GUWAHATI FOR CONTRACTORS Rajat Sharma Paras Bhai Vendor.xlsx' },
    { name: 'RISE DECK', file: '/Users/aftab/Nexio/ITC_FORTUNE_GUWAHATI RISEDECK.xlsx' },
    { name: 'OM INFRA SOLUTIONS', file: '/Users/aftab/Nexio/OM INFRA Quote R0  ITC FORTUNE GUWAHATI FOR CONTRACTORS.xlsx' },
    { name: 'VK INTERIORE GUWAHATI', file: '/Users/aftab/Nexio/VK INTERIORE GUWAHATI RATE (3).xlsx' },
    { name: 'Vyaas Contractors', file: '/Users/aftab/Nexio/vyaas ITC FORTUNE GUWAHATI FOR CONTRACTORS.xlsx' },
  ];

  const handleUploadClientBOQ = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setStructuredBOQResult(null);

    try {
      let result;
      if (useLocalClientFile || !clientFile) {
        result = await api.ingestLocalClientBOQ({
          filePath: localClientPath,
          projectName: projectName || 'ITC Fortune Guwahati Civil & Interior',
          clientName: clientName || 'IRAJ CONTRACT MANUFACTURING PVT LTD',
          clientPhone: clientPhone || '+91 98290 12345',
          clientGstin: clientGstin || '08AAFCI7043F1ZM',
        });
      } else {
        const formData = new FormData();
        formData.append('file', clientFile);
        if (projectName) formData.append('projectName', projectName);
        if (clientName) formData.append('clientName', clientName);
        if (clientPhone) formData.append('clientPhone', clientPhone);
        if (clientGstin) formData.append('clientGstin', clientGstin);
        result = await api.uploadClientBOQ(formData);
      }

      setStructuredBOQResult(result);
      const isExisting = result.client.isExistingClient;
      setSuccessMessage(
        isExisting
          ? `Linked project "${result.project.name}" (${result.project.code}) to EXISTING Client: ${result.client.name} (Phone: ${result.client.phone || clientPhone})!`
          : `Created NEW Client "${result.client.name}" (${result.client.code}, Phone: ${result.client.phone}) and linked project "${result.project.name}" (${result.project.code})!`,
      );

      onProjectCreated(result.project);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading client BOQ');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadContractorQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectId) {
      setErrorMessage('Please select a project first');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let result;
      if (selectedLocalContractorFile) {
        const found = localContractorFiles.find((c) => c.file === selectedLocalContractorFile);
        result = await api.ingestLocalContractorQuotation({
          filePath: selectedLocalContractorFile,
          projectId: targetProjectId,
          contractorName: contractorName || found?.name,
          contractorPhone: contractorPhone || '+91 98310 99887',
        });
      } else if (contractorFile) {
        const formData = new FormData();
        formData.append('file', contractorFile);
        formData.append('projectId', targetProjectId);
        if (contractorName) formData.append('contractorName', contractorName);
        if (contractorPhone) formData.append('contractorPhone', contractorPhone);
        result = await api.uploadContractorQuotation(formData);
      } else {
        throw new Error('Please select or upload a contractor quotation Excel file');
      }

      const isExisting = result.contractor.isExistingContractor;
      setSuccessMessage(
        isExisting
          ? `Quotation #${result.quotation.quotationNumber} linked to EXISTING Contractor: ${result.contractor.name} (Phone: ${result.contractor.phone || contractorPhone})!`
          : `Created NEW Contractor: ${result.contractor.name} (${result.contractor.code}, Phone: ${result.contractor.phone}) & linked quotation #${result.quotation.quotationNumber}!`,
      );

      onQuotationUploaded(targetProjectId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading contractor quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleExportStructuredBOQ = () => {
    if (!structuredBOQResult?.structuredRequirements?.items) return;
    const items = structuredBOQResult.structuredRequirements.items;
    const headers = ['Item #', 'Category', 'Title', 'Unit', 'Quantity', 'Estimated Rate', 'Estimated Amount'];
    const rows = [headers.join(',')];

    items.forEach((i: any) => {
      rows.push(
        [
          `"${i.itemNumber}"`,
          `"${i.category || 'Civil Works'}"`,
          `"${(i.title || '').replace(/"/g, '""')}"`,
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
    link.setAttribute('download', `Structured_Client_BOQ_${structuredBOQResult.project.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <UploadCloud className="w-7 h-7 text-cyan-400" />
            Excel Ingestion & Entity Resolution Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload Client BOQ to create/link projects and deduplicate clients, or upload contractor quotation sheets.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#0b1324] p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setActiveSubTab('client');
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'client'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            1. Upload Client BOQ (New Project)
          </button>
          <button
            onClick={() => {
              setActiveSubTab('contractor');
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'contractor'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            2. Upload Contractor Quotes
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-sm flex items-start gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-700/60 text-rose-200 text-sm flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* SUB-TAB 1: CLIENT BOQ UPLOAD */}
      {activeSubTab === 'client' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload Form Card */}
          <div className="lg:col-span-6 bg-[#0c1427]/80 rounded-2xl border border-slate-800/90 p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm uppercase tracking-wider pb-3 border-b border-slate-800">
              <FileSpreadsheet className="w-4 h-4" /> Client Tender Sheet & Metadata
            </div>

            <form onSubmit={handleUploadClientBOQ} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Project Title / Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ITC Fortune Hotel Guwahati Fitout"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> Client Legal Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IRAJ CONTRACT MANUFACTURING"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" /> Client Phone Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98290 12345"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Used for automatic deduplication & linking.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Client GSTIN / Tax ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 08AAFCI7043F1ZM"
                  value={clientGstin}
                  onChange={(e) => setClientGstin(e.target.value)}
                  className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500 font-mono"
                />
              </div>

              {/* File Selection Toggle */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Client BOQ Excel File (.xlsx) *
                </label>

                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setUseLocalClientFile(false)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      !useLocalClientFile
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'text-slate-400 hover:text-white bg-slate-800/40'
                    }`}
                  >
                    Upload File from Computer
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseLocalClientFile(true)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      useLocalClientFile
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'text-slate-400 hover:text-white bg-slate-800/40'
                    }`}
                  >
                    Quick Select Workspace File
                  </button>
                </div>

                {!useLocalClientFile ? (
                  <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 text-center cursor-pointer transition-all bg-[#10192e]">
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      id="client-file-input"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setClientFile(e.target.files[0]);
                      }}
                    />
                    <label htmlFor="client-file-input" className="cursor-pointer block">
                      <UploadCloud className="w-10 h-10 text-cyan-400 mx-auto mb-2 opacity-80" />
                      <span className="text-sm font-semibold text-slate-200 block">
                        {clientFile ? clientFile.name : 'Click to select or drag & drop Client BOQ Excel'}
                      </span>
                      <span className="text-xs text-slate-500 mt-1 block">Supports multi-sheet workbooks (.xlsx)</span>
                    </label>
                  </div>
                ) : (
                  <div className="bg-[#10192e] p-3.5 rounded-xl border border-slate-700/80">
                    <span className="text-xs text-slate-400 block mb-1">Local Workspace File:</span>
                    <input
                      type="text"
                      value={localClientPath}
                      onChange={(e) => setLocalClientPath(e.target.value)}
                      className="w-full bg-[#18233c] text-xs font-mono text-cyan-300 px-3 py-2 rounded-lg border border-slate-700"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Ingesting & Analyzing BOQ...
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4" /> Ingest Client BOQ & Link Project
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Structured Requirement & Budget Review Card */}
          <div className="lg:col-span-6 bg-[#0c1427]/80 rounded-2xl border border-slate-800/90 p-6 shadow-xl flex flex-col justify-between">
            {structuredBOQResult ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Analyzed Client Requirement & Budget
                  </div>
                  <button
                    onClick={handleExportStructuredBOQ}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Budget (CSV)
                  </button>
                </div>

                {/* Entity Resolution Badge */}
                <div className="p-3.5 rounded-xl bg-[#101b33] border border-cyan-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                      Client Entity Status
                    </span>
                    <span className="text-sm font-bold text-white">
                      {structuredBOQResult.client.name}
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Phone: {structuredBOQResult.client.phone || clientPhone} | Code: {structuredBOQResult.client.code}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      structuredBOQResult.client.isExistingClient
                        ? 'bg-blue-950 text-blue-400 border border-blue-700'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                    }`}
                  >
                    {structuredBOQResult.client.isExistingClient ? 'Linked Existing Client' : 'Created New Client'}
                  </span>
                </div>

                {/* Grand Budget Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/50 to-blue-950/50 border border-cyan-700/50">
                  <span className="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">
                    Client Total Approved Baseline Budget
                  </span>
                  <div className="text-3xl font-black text-cyan-300 tracking-tight">
                    ₹{Number(structuredBOQResult.structuredRequirements.totalBudget).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>Total Items: <strong className="text-white">{structuredBOQResult.structuredRequirements.totalItems}</strong></span>
                    <span>Version: <strong className="text-white">{structuredBOQResult.boqVersion.revisionCode}</strong></span>
                    <span>Project: <strong className="text-white">{structuredBOQResult.project.code}</strong></span>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Scope & Category Distribution
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {structuredBOQResult.structuredRequirements.categories.map((c: any) => (
                      <div key={c.category} className="p-2.5 rounded-lg bg-[#111c33] border border-slate-800 text-xs">
                        <span className="font-semibold text-slate-200 block truncate">{c.category}</span>
                        <div className="flex items-center justify-between text-slate-400 mt-1">
                          <span>{c.itemCount} items</span>
                          <span className="font-bold text-cyan-400">₹{Number(c.totalAmount).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Action Navigation */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setActiveSubTab('contractor')}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    Upload Contractor Quotation for this Project <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onNavigateToProjects}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
                  >
                    View in Projects Hub
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <FileSpreadsheet className="w-16 h-16 text-slate-700 mb-3" />
                <h3 className="text-base font-bold text-slate-300">Ready for Client Ingestion</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Provide client name and phone number on the left. The engine will deduplicate the client, parse the multi-sheet BOQ, and render the structured requirements right here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CONTRACTOR QUOTATIONS UPLOAD */}
      {activeSubTab === 'contractor' && (
        <div className="max-w-3xl mx-auto bg-[#0c1427]/80 rounded-2xl border border-slate-800/90 p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm uppercase tracking-wider pb-3 border-b border-slate-800">
            <Building className="w-4 h-4" /> Ingest Contractor Quotation & Link Entity
          </div>

          <form onSubmit={handleUploadContractorQuotation} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Project *
              </label>
              <select
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code}) — Client: {p.client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contractor Company / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. M/S KSB INTERIOR or Vinod Mistry"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" /> Contractor Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 94350 11223"
                  value={contractorPhone}
                  onChange={(e) => setContractorPhone(e.target.value)}
                  className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Select from existing local contractor workbooks */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Quick Select from Tested Contractor Workbooks
              </label>
              <select
                value={selectedLocalContractorFile}
                onChange={(e) => {
                  setSelectedLocalContractorFile(e.target.value);
                  const found = localContractorFiles.find((c) => c.file === e.target.value);
                  if (found) setContractorName(found.name);
                }}
                className="w-full bg-[#131d33] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Or Choose Custom File Below --</option>
                {localContractorFiles.map((c) => (
                  <option key={c.file} value={c.file}>
                    {c.name} — {c.file.split('/').pop()}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom File Upload Input */}
            {!selectedLocalContractorFile && (
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 text-center cursor-pointer transition-all bg-[#10192e]">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  id="contractor-file-input"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setContractorFile(e.target.files[0]);
                  }}
                />
                <label htmlFor="contractor-file-input" className="cursor-pointer block">
                  <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
                  <span className="text-sm font-semibold text-slate-200 block">
                    {contractorFile ? contractorFile.name : 'Select Custom Contractor Quotation Excel'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">Supports Turnkey, Labour-Only, and Missing scope files</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Ingesting & Categorizing Scope...
                </>
              ) : (
                <>
                  <Building className="w-4 h-4" /> Ingest Quotation & Deduplicate Contractor
                </>
              )}
            </button>
          </form>

          {/* Shortcut to Comparison */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Finished uploading contractor quotes?</span>
            <button
              onClick={onNavigateToComparison}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5"
            >
              Open Bid Comparison Matrix <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
