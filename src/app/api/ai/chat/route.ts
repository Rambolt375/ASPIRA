import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const FALLBACK_REPLY =
  'Maaf, sistem asisten AI sedang mengalami gangguan sementara. Silakan coba beberapa saat lagi.';

const SYSTEM_PROMPT = `Anda adalah Asisten AI Sipil ASPIRA untuk Kota Bogor, Indonesia.
Tugas Anda:
1. Membantu warga Kota Bogor memahami alur pengaduan infrastruktur publik (jalan, jembatan, drainase, lampu PJU, sampah, banjir).
2. Menjelaskan 8 siklus status laporan ASPIRA (DITERIMA, VERIFIKASI, DICEK, DITUGASKAN, DALAM_PENANGANAN, DIATASI, PENINJAUAN, PERAWATAN).
3. Memberikan panduan cara menyertakan bukti foto yang valid dan koordinat lokasi.
4. Bersikap sopan, netral, transparan, dan berlandaskan fakta. Jangan mengarang putusan resmi pemerintah atau menjanjikan anggaran.`;

type IncomingMessage = { role?: unknown; content?: unknown };

function normalizeHistory(messages: IncomingMessage[]) {
  // Gemini requires history to start with a user turn and alternate user/model turns.
  // The page's welcome message is a model turn, so discard leading model messages.
  const history: { role: 'user' | 'model'; parts: [{ text: string }] }[] = [];

  for (const message of messages) {
    const content = typeof message.content === 'string' ? message.content.trim() : '';
    if (!content) continue;

    const role = message.role === 'user' ? 'user' : 'model';
    const previous = history.at(-1);
    if (!previous && role !== 'user') continue;
    if (previous?.role === role) {
      previous.parts[0].text += `\n${content}`;
    } else {
      history.push({ role, parts: [{ text: content }] });
    }
  }

  return history;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { messages?: unknown };
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required.' }, { status: 400 });
    }

    const messages = body.messages as IncomingMessage[];
    const lastMessage = messages.at(-1);
    const lastUserMsg = typeof lastMessage?.content === 'string' ? lastMessage.content.trim() : '';
    if (!lastUserMsg) {
      return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: `Halo warga Kota Bogor! Saya Asisten AI ASPIRA. Terkait pertanyaan Anda ("${lastUserMsg}"), Anda dapat membuat laporan di menu Buat Laporan dengan melampirkan foto dan titik lokasi di Kota Bogor agar dapat diverifikasi dan ditindaklanjuti oleh dinas terkait.`,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.8-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    // Do not include the current message in history; send it separately below.
    const history = normalizeHistory(messages.slice(0, -1));
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastUserMsg);

    return NextResponse.json({ reply: result.response.text() });
  } catch (err: unknown) {
    console.error('[/api/ai/chat POST]', err);
    return NextResponse.json({ reply: FALLBACK_REPLY }, { status: 500 });
  }
}

