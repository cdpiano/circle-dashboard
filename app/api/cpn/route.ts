import { NextResponse } from 'next/server';
import { mockCpnVolumeData } from '@/lib/mock-data';

export async function GET() {
  try {
    // TODO: Replace with Circle quarterly report data when available
    return NextResponse.json({
      success: true,
      data: mockCpnVolumeData,
      source: 'mock',
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: mockCpnVolumeData,
      source: 'fallback',
    });
  }
}
