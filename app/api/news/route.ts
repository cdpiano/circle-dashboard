import { NextResponse } from 'next/server';
import { getCircleNews } from '@/lib/api';

export async function GET() {
  try {
    const news = await getCircleNews(10);

    if (news.length === 0) {
      // Fallback news if API returns empty
      return NextResponse.json([
        {
          title: 'Circle Expands USDC to New Blockchain Networks',
          description: 'Circle continues multi-chain expansion strategy',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: 'Circle Blog',
        },
      ]);
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json([
      {
        title: 'USDC Market Update',
        description: 'Latest developments in the USDC ecosystem',
        url: '#',
        publishedAt: new Date().toISOString(),
        source: 'Circle',
      },
    ]);
  }
}
