export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  siteAddress?: string;
  scopeSummary?: string;
  status: string;
  client: {
    id: string;
    name: string;
    code: string;
    gstin?: string;
  };
  boqVersions: {
    id: string;
    version: number;
    revisionCode: string;
    totalAmount: string;
    isApproved: boolean;
  }[];
  quotations: {
    id: string;
    quotationNumber: string;
    totalRawAmount: string;
    isCompliant: boolean;
    contractor: {
      id: string;
      name: string;
      code: string;
    };
  }[];
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
}

export interface BOQItem {
  id: string;
  itemNumber: string;
  category?: string;
  title: string;
  description: string;
  unit: string;
  quantity: string;
  estimatedRate: string;
  estimatedAmount: string;
  sourceSheet?: string;
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
  historicalBenchmarkRate?: string;
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
