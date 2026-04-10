import { API_CONFIG, CACHE_TTL } from '../config';
import { fetchApi, buildUrl } from '../client';
import { SecFiling, FinancialMetrics, QuarterlyRevenue } from '@/lib/types';

const BASE_URL = API_CONFIG.sec.baseUrl;
const CIRCLE_CIK = '0001876042'; // Circle Internet Financial CIK

/**
 * Get recent SEC filings for Circle
 */
export async function getSecFilings(count: number = 10): Promise<SecFiling[]> {
  try {
    // SEC requires a User-Agent header with contact information
    const url = `${BASE_URL}/submissions/CIK${CIRCLE_CIK}.json`;

    const response = await fetchApi<{
      filings: {
        recent: {
          accessionNumber: string[];
          filingDate: string[];
          form: string[];
          primaryDocument: string[];
          primaryDocDescription: string[];
        };
      };
    }>(url, {
      headers: {
        'User-Agent': 'Circle Dashboard contact@example.com',
      },
      cacheTTL: CACHE_TTL.financials,
    });

    const recent = response.data.filings.recent;
    const filings: SecFiling[] = [];

    for (let i = 0; i < Math.min(count, recent.form.length); i++) {
      // Filter for important filing types
      const formType = recent.form[i];
      if (['10-K', '10-Q', '8-K', 'S-1'].includes(formType)) {
        const accessionNumber = recent.accessionNumber[i].replace(/-/g, '');

        filings.push({
          type: formType,
          date: recent.filingDate[i],
          description: getFilingDescription(formType, recent.primaryDocDescription[i]),
          url: `https://www.sec.gov/Archives/edgar/data/${CIRCLE_CIK.replace(/^0+/, '')}/${accessionNumber}/${recent.primaryDocument[i]}`,
        });
      }
    }

    return filings;
  } catch (error) {
    console.error('SEC EDGAR API error:', error);
    return getMockSecFilings();
  }
}

/**
 * Get financial metrics from SEC filings
 * Note: This is simplified - real implementation would parse XBRL data
 */
export async function getFinancialMetrics(): Promise<FinancialMetrics> {
  // For a production app, you would:
  // 1. Parse XBRL data from 10-K/10-Q filings
  // 2. Use SEC API to get financial statements
  // 3. Or use a third-party API like Financial Modeling Prep

  // For now, return mock data based on Circle's public information
  return {
    revenue: 770_230_000,
    revenueGrowth: 77.0,
    netIncome: 266_820_000,
    eps: 0.43,
    totalAssets: 42_000_000_000,
    totalDebt: 0,
    freeCashFlow: 0,
    period: 'Q4 2025',
  };
}

/**
 * Get quarterly revenue data
 */
export async function getQuarterlyRevenue(): Promise<QuarterlyRevenue[]> {
  // This would normally be parsed from SEC filings
  return [
    { quarter: 'Q1 2025', revenue: 578_570_000, netIncome: 64_790_000 },
    { quarter: 'Q2 2025', revenue: 658_080_000, netIncome: -482_100_000 },
    { quarter: 'Q3 2025', revenue: 739_760_000, netIncome: 214_390_000 },
    { quarter: 'Q4 2025', revenue: 770_230_000, netIncome: 266_820_000 },
  ];
}

function getFilingDescription(formType: string, primaryDocDescription: string): string {
  const descriptions: Record<string, string> = {
    '10-K': 'Annual Report',
    '10-Q': 'Quarterly Report',
    '8-K': 'Current Report',
    'S-1': 'Registration Statement',
  };

  const baseDesc = descriptions[formType] || formType;
  return primaryDocDescription || baseDesc;
}

function getMockSecFilings(): SecFiling[] {
  return [
    {
      type: '10-K',
      date: '2026-02-25',
      description: 'Annual Report FY2025',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042&type=10-K',
    },
    {
      type: '10-Q',
      date: '2025-11-12',
      description: 'Quarterly Report Q3 2025',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042&type=10-Q',
    },
    {
      type: '8-K',
      date: '2025-11-12',
      description: 'Current Report - Q3 Earnings',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001876042&type=8-K',
    },
  ];
}
