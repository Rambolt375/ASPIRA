'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import type { ChatMessage } from '@/types';

export default function AsistenPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        'Halo! Saya Asisten AI Sipil ASPIRA Kota Bogor. Saya siap membantu Anda memahami prosedur pelaporan fasilitas publik, menjelaskan siklus status pengerjaan, atau memberikan panduan seputar transparansi pelayanan kota. Ada yang ingin Anda tanyakan?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const msgCounter = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(textToSend?: string) {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    msgCounter.current += 1;
    const userMessage: ChatMessage = {
      id: `user-${msgCounter.current}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'AI request failed');
      }

      msgCounter.current += 1;
      const modelMessage: ChatMessage = {
        id: `model-${msgCounter.current}`,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch {
      msgCounter.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `model-err-${msgCounter.current}`,
          role: 'model',
          content: 'Maaf, tidak dapat terhubung ke asisten AI saat ini.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const QUICK_PROMPTS = [
    'Jelaskan 8 siklus status laporan ASPIRA',
    'Bagaimana agar bukti foto dinilai otentik?',
    'Apa saja syarat laporan ditangani dengan SLA?',
    'Kategori fasilitas apa saja yang dapat dilaporkan?',
  ];

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100dvh - 56px - 64px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-500/20">
          🤖
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Asisten AI Sipil ASPIRA</h1>
          <p className="text-xs text-slate-500">Panduan interaktif pelaporan & transparansi Kota Bogor</p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                  AI
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold animate-pulse">
              ...
            </div>
            <span>Asisten sedang menyusun jawaban...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-xs shrink-0 transition-colors border border-slate-200"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-2 flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pertanyaan seputar pengaduan warga..."
          className="flex-1 p-3.5 rounded-2xl border border-slate-300 text-slate-900 placeholder:text-slate-500 font-medium text-xs sm:text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-sm bg-white"
        />
        <Button type="submit" disabled={!input.trim() || loading}>
          Kirim
        </Button>
      </form>
    </main>
  );
}
