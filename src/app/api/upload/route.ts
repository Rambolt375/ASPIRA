// Upload proxy route — keeps NEXT_PUBLIC_STORAGE_API_KEY out of the client bundle
// if you prefer server-side uploads. For now this is a thin pass-through.
// POST /api/upload  — multipart/form-data with a "file" field

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_STORAGE_API_URL;
  const apiKey  = process.env.NEXT_PUBLIC_STORAGE_API_KEY;

  if (!baseUrl || !apiKey) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
  }

  const formData = await req.formData();

  const upstream = await fetch(`${baseUrl}/upload`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body:    formData,
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
