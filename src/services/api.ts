import { Project, CostComparisonResult, Client, Contractor } from '../types';

const API_BASE = '/api/v1';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  async finalizeQuotation(
    projectId: string,
    quotationId: string,
    negotiatedUpdates?: { itemId: string; negotiatedRate: number }[],
    notes?: string,
  ): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/finalize-quotation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quotationId, negotiatedUpdates, notes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to finalize quotation');
    }
    return res.json();
  },

  async updateQuotationRates(
    quotationId: string,
    updates: { itemId: string; negotiatedRate: number }[],
  ) {
    const res = await fetch(`${API_BASE}/projects/quotations/${quotationId}/rates`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update quotation item rates');
    }
    return res.json();
  },

  // Clients
  async getClients(): Promise<Client[]> {
    const res = await fetch(`${API_BASE}/clients`);
    if (!res.ok) throw new Error('Failed to fetch clients');
    return res.json();
  },

  async getClient(id: string): Promise<Client> {
    const res = await fetch(`${API_BASE}/clients/${id}`);
    if (!res.ok) throw new Error('Failed to fetch client details');
    return res.json();
  },

  // Contractors
  async getContractors(): Promise<Contractor[]> {
    const res = await fetch(`${API_BASE}/contractors`);
    if (!res.ok) throw new Error('Failed to fetch contractors');
    return res.json();
  },

  async getContractor(id: string): Promise<Contractor> {
    const res = await fetch(`${API_BASE}/contractors/${id}`);
    if (!res.ok) throw new Error('Failed to fetch contractor details');
    return res.json();
  },

  // BOQ
  async getProjectBOQ(projectId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/boq/project/${projectId}`);
    if (!res.ok) throw new Error('Failed to fetch BOQ versions');
    return res.json();
  },

  async uploadClientBOQ(formData: FormData) {
    const res = await fetch(`${API_BASE}/boq/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload client BOQ');
    }
    return res.json();
  },

  async ingestLocalClientBOQ(dto: {
    filePath: string;
    projectName?: string;
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    clientGstin?: string;
  }) {
    const res = await fetch(`${API_BASE}/boq/ingest-local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to ingest client BOQ');
    }
    return res.json();
  },

  async approveBOQ(boqVersionId: string, reason: string) {
    const res = await fetch(`${API_BASE}/boq/${boqVersionId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Failed to approve BOQ');
    return res.json();
  },

  // Quotations
  async getProjectQuotations(projectId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/quotations/project/${projectId}`);
    if (!res.ok) throw new Error('Failed to fetch contractor quotations');
    return res.json();
  },

  async uploadContractorQuotation(formData: FormData) {
    const res = await fetch(`${API_BASE}/quotations/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload contractor quotation');
    }
    return res.json();
  },

  async ingestLocalContractorQuotation(dto: {
    filePath: string;
    projectId: string;
    contractorName?: string;
    contractorPhone?: string;
    contractorEmail?: string;
  }) {
    const res = await fetch(`${API_BASE}/quotations/ingest-local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to ingest contractor quotation');
    }
    return res.json();
  },

  // Comparison
  async getProjectComparison(projectId: string): Promise<CostComparisonResult> {
    const res = await fetch(`${API_BASE}/comparison/project/${projectId}`);
    if (!res.ok) throw new Error('Failed to fetch comparison matrix');
    return res.json();
  },
};
