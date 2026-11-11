import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = await req.json();
    const { messages } = body;

    const systemPrompt = `Anda adalah Asisten AI Sipil ASPIRA untuk Kota Bogor, Indonesia.
Tugas Anda:
1. Membantu warga Kota Bogor memahami alur pengaduan infrastruktur publik (jalan, jembatan, drainase, lampu PJU, sampah, banjir).
2. Menjelaskan 8 siklus status laporan ASPIRA (DITERIMA, VERIFIKASI, DICEK, DITUGASKAN, DALAM_PENANGANAN, DIATASI, PENINJAUAN, PERAWATAN).
3. Memberikan panduan cara menyertakan bukti foto kamera langsung yang valid dan koordinat lokasi.
4. Bersikap sopan, netral, transparan, dan berlandaskan fakta regulasi sipil. Jangan mengarang putusan resmi pemerintah atau menjanjikan anggaran.`;

    if (!apiKey) {
      const lastUserMsg = messages?.[messages.length - 1]?.content || '';
      return NextResponse.json({
        reply: `Halo warga Kota Bogor! Saya Asisten AI ASPIRA. Terkait pertanyaan Anda ("${lastUserMsg}"), Anda dapat membuat laporan di menu Buat Laporan dengan melampirkan foto kamera langsung dan titik lokasi di Kota Bogor agar dapat diverifikasi dan ditindaklanjuti oleh dinas terkait.`,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    const history = (messages || []).slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1]?.content || 'Halo';
    const result = await chat.sendMessage(lastMessage);

    return NextResponse.json({ reply: result.response.text() });
  } catch (err: unknown) {
    console.error('[/api/ai/chat POST]', err);
    return NextResponse.json(
      { reply: 'Maaf, sistem asisten AI sedang mengalami gangguan sementara. Silakan coba beberapa saat lagi.' },
      { status: 500 },
    );
  }
}

