// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { getCatalogSnapshot } from '@/lib/catalog.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { totalCount, categoryCounts } = getCatalogSnapshot();
    return NextResponse.json({
      success: true,
      total: totalCount,
      counts: categoryCounts,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
