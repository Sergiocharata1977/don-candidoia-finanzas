import { NextRequest, NextResponse } from 'next/server';

/**
 * Health check endpoint
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
