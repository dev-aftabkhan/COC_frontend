export interface ClientContact {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  roleTitle?: string | null;
  isPrimary?: boolean;
}

export interface Client {
  id: string;
  name: string;
  code: string;
  phone?: string | null;
  normalizedPhone?: string | null;
  email?: string | null;
  gstin?: string | null;
  pan?: string | null;
  billingAddress?: string | null;
  totalProjects: number;
  activeProjects: number;
  totalBudgetValue: string;
  projects?: {
    id: string;
    code: string;
    name: string;
    status: string;
    createdAt?: string;
    assignedContractor?: { id: string; name: string } | null;
    boqVersions?: { totalAmount: string }[];
  }[];
  contacts?: ClientContact[];
  createdAt?: string;
}

export interface ContractorContact {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  isPrimary?: boolean;
}

export interface Contractor {
  id: string;
  name: string;
  code: string;
  phone?: string | null;
  normalizedPhone?: string | null;
  email?: string | null;
  specialization?: string | null;
  address?: string | null;
  gstin?: string | null;
  totalQuotationsSubmitted: number;
  awardedProjectsCount: number;
  totalBiddedValue: string;
  assignedProjects?: {
    id: string;
    code: string;
    name: string;
    status: string;
  }[];
  quotations?: {
    id: string;
    projectId: string;
    quotationNumber: string;
    totalRawAmount: string;
    totalScopeAmount: string;
    isCompliant: boolean;
    isFinalized: boolean;
    quotationType: string;
    project?: { id: string; code: string; name: string; status: string };
  }[];
  contacts?: ContractorContact[];
  createdAt?: string;
}

export interface QuotationItem {
  id: string;
  quotationId?: string;
  itemNumber: string;
  title?: string | null;
  description: string;
  unit: string;
  quantity: string | number;
  quotedRate: string | number;
  quotedAmount: string | number;
  negotiatedRate?: string | number | null;
  negotiatedAmount?: string | number | null;
  inclusionState: 'INCLUDED' | 'EXCLUDED' | 'CLIENT_SUPPLIED' | 'NOT_APPLICABLE' | 'UNKNOWN';
  notes?: string | null;
  sourceRow?: number | null;
}

export interface Quotation {
  id: string;
  projectId: string;
  contractorId: string;
  contractor: {
    id: string;
    name: string;
    code: string;
    phone?: string | null;
    email?: string | null;
  };
  quotationNumber: string;
  revision: string;
  quotationType: string;
  totalRawAmount: string;
  totalScopeAmount: string;
  isCompliant: boolean;
  isFinalized: boolean;
  finalizedAt?: string | null;
  notes?: string | null;
  items?: QuotationItem[];
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  siteAddress?: string | null;
  scopeSummary?: string | null;
  status: string;
  client: {
    id: string;
    name: string;
    code: string;
    phone?: string | null;
    email?: string | null;
    gstin?: string | null;
  };
  assignedContractor?: {
    id: string;
    name: string;
    code: string;
    phone?: string | null;
    email?: string | null;
  } | null;
  finalizedQuotation?: {
    id: string;
    quotationNumber: string;
    totalRawAmount: string;
    totalScopeAmount: string;
    isFinalized: boolean;
    finalizedAt?: string | null;
    contractor?: { id: string; name: string; code: string };
    items?: QuotationItem[];
  } | null;
  boqVersions: {
    id: string;
    version: number;
    revisionCode: string;
    totalAmount: string;
    isApproved: boolean;
  }[];
  quotations: Quotation[];
  financials?: {
    contractRevenue: string;
    purchaseCommitments: string;
    actualCostRecognized: string;
    clientInvoiced: string;
    clientReceived: string;
    accountsReceivable: string;
    forecastFinalCost: string;
    forecastGrossMargin: string;
    forecastMarginPercent: string;
  };
  createdAt?: string;
}

export interface BOQItem {
  id: string;
  itemNumber: string;
  category?: string | null;
  title: string;
  description: string;
  unit: string;
  quantity: string;
  estimatedRate: string;
  estimatedAmount: string;
  sourceSheet?: string | null;
}

export interface ContractorSummary {
  contractorId: string;
  contractorName: string;
  quotationNumber: string;
  rawQuotedTotal: string;
  scopeAdjustedTotal: string;
  isFullyCompliant: boolean;
  missingItemsCount: number;
  clientSuppliedCount: number;
  varianceVsBaselineAmount: string;
  varianceVsBaselinePercent: string;
  rankRaw: number;
  rankScopeAdjusted: number;
}

export interface ItemComparisonMatrixRow {
  boqItemId: string;
  itemNumber: string;
  category?: string;
  title: string;
  description: string;
  unit: string;
  quantity: string;
  baselineRate: string;
  baselineAmount: string;
  contractorQuotes: {
    contractorName: string;
    quotedRate: string;
    quotedAmount: string;
    inclusionState: 'INCLUDED' | 'EXCLUDED' | 'CLIENT_SUPPLIED' | 'NOT_APPLICABLE' | 'UNKNOWN';
    scopeAdjustedAmount: string;
    notes?: string;
  }[];
  lowestQuotedRate: string;
  lowestQuotedContractor: string;
  historicalBenchmarkRate?: string | null;
  historicalProjectName?: string | null;
  historicalIndicator?: 'HIGH' | 'LOW' | 'EQUAL' | 'NEW';
  historicalSymbol?: string;
  historicalVariancePercent?: string | null;
}

export interface CostComparisonResult {
  projectId: string;
  projectName: string;
  boqVersionCode: string;
  baselineTotal: string;
  contractorSummaries: ContractorSummary[];
  lowestRawBid: {
    contractorName: string;
    amount: string;
  };
  lowestCompliantBid: {
    contractorName: string;
    amount: string;
  } | null;
  lowestScopeAdjustedBid: {
    contractorName: string;
    amount: string;
  };
  potentialSavingsVsBaseline: string;
  matrixRows: ItemComparisonMatrixRow[];
}
