import { Project, CostComparisonResult } from '../types';

const API_BASE = '/api/v1';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

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

  async getProjectBOQ(projectId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/boq/project/${projectId}`);
    if (!res.ok) throw new Error('Failed to fetch BOQ versions');
    return res.json();
  },

  async getProjectQuotations(projectId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/quotations/project/${projectId}`);
    if (!res.ok) throw new Error('Failed to fetch contractor quotations');
    return res.json();
  },

  async getProjectComparison(projectId: string): Promise<CostComparisonResult> {
    const res = await fetch(`${API_BASE}/comparison/project/${projectId}`);
    if (!res.ok) throw new Error('Failed to fetch comparison matrix');
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
};
