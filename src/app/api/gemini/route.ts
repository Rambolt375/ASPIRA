// Gemini API route — server-side only, key never exposed to client
// POST /api/gemini
// Body: { type: 'triage' | 'chat', ... }

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { type: string; prompt: string; imageBase64?: string };

    let result: string;

    if (body.imageBase64) {
      // Multimodal — image + text
      const imagePart = {
        inlineData: { data: body.imageBase64, mimeType: 'image/jpeg' as const },
      };
      const res = await model.generateContent([body.prompt, imagePart]);
      result = res.response.text();
    } else {
      const res = await model.generateContent(body.prompt);
      result = res.response.text();
    }

    return NextResponse.json({ result });
  } catch (err) {
    console.error('[/api/gemini]', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
