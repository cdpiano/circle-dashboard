import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real implementation, this would fetch from a news API or regulatory database
    // For now, we'll use curated regulatory updates
    const updates = [
      {
        id: 'reg-1',
        country: 'United States',
        region: 'North America',
        title: 'SEC Approves Stablecoin Framework',
        description: 'The SEC has approved a comprehensive regulatory framework for stablecoins, providing clarity on reserve requirements and disclosure standards.',
        status: 'positive',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        source: 'SEC',
        impact: 'high',
      },
      {
        id: 'reg-2',
        country: 'European Union',
        region: 'Europe',
        title: 'MiCA Stablecoin Rules Take Effect',
        description: 'The Markets in Crypto-Assets (MiCA) regulation for stablecoins is now fully enforced, requiring EU-based issuers to maintain reserves and obtain licenses.',
        status: 'positive',
        date: new Date(Date.now() - 5 * 86400000).toISOString(),
        source: 'European Commission',
        impact: 'high',
      },
      {
        id: 'reg-3',
        country: 'United Kingdom',
        region: 'Europe',
        title: 'UK Treasury Proposes Stablecoin Regulation',
        description: 'The UK Treasury has proposed new regulations that would bring stablecoins used for payments under existing payment services regulations.',
        status: 'neutral',
        date: new Date(Date.now() - 7 * 86400000).toISOString(),
        source: 'UK Treasury',
        impact: 'medium',
      },
      {
        id: 'reg-4',
        country: 'Singapore',
        region: 'Asia-Pacific',
        title: 'MAS Expands Stablecoin Framework',
        description: 'The Monetary Authority of Singapore has expanded its Payment Services Act to include comprehensive stablecoin oversight with clear licensing requirements.',
        status: 'positive',
        date: new Date(Date.now() - 10 * 86400000).toISOString(),
        source: 'MAS',
        impact: 'medium',
      },
      {
        id: 'reg-5',
        country: 'Hong Kong',
        region: 'Asia-Pacific',
        title: 'HKMA Launches Stablecoin Issuer Sandbox',
        description: 'Hong Kong Monetary Authority launched a regulatory sandbox for stablecoin issuers, paving the way for licensed operations in the region.',
        status: 'positive',
        date: new Date(Date.now() - 12 * 86400000).toISOString(),
        source: 'HKMA',
        impact: 'medium',
      },
      {
        id: 'reg-6',
        country: 'Japan',
        region: 'Asia-Pacific',
        title: 'Japan Proposes Stablecoin Restrictions',
        description: 'Japanese regulators are considering restrictions on foreign-issued stablecoins, requiring local banking partnerships for operations.',
        status: 'negative',
        date: new Date(Date.now() - 15 * 86400000).toISOString(),
        source: 'FSA Japan',
        impact: 'medium',
      },
      {
        id: 'reg-7',
        country: 'Brazil',
        region: 'Latin America',
        title: 'Brazil Central Bank Reviews Stablecoin Policy',
        description: 'Banco Central do Brasil is reviewing its stance on stablecoins as part of its broader digital currency strategy. Final decision pending.',
        status: 'pending',
        date: new Date(Date.now() - 18 * 86400000).toISOString(),
        source: 'BCB',
        impact: 'low',
      },
      {
        id: 'reg-8',
        country: 'UAE',
        region: 'Middle East',
        title: 'Dubai Issues First Stablecoin License',
        description: 'Dubai\'s Virtual Assets Regulatory Authority (VARA) has issued its first stablecoin license, establishing the UAE as a crypto-friendly jurisdiction.',
        status: 'positive',
        date: new Date(Date.now() - 20 * 86400000).toISOString(),
        source: 'VARA',
        impact: 'medium',
      },
    ];

    const summary = {
      favorable: updates.filter((u) => u.status === 'positive').length,
      neutral: updates.filter((u) => u.status === 'neutral').length,
      restrictive: updates.filter((u) => u.status === 'negative').length,
      pending: updates.filter((u) => u.status === 'pending').length,
    };

    return NextResponse.json({ updates, summary });
  } catch (error) {
    console.error('Regulatory API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regulatory data' },
      { status: 500 }
    );
  }
}
