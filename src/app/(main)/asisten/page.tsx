'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types';

export default function AsistenPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        'Halo! Saya Asisten AI Sipil ASPIRA Kota Bogor.\n\nSaya siap membantu Anda memahami prosedur pelaporan fasilitas publik, menjelaskan 8 siklus status penanganan, atau memberikan panduan seputar layanan infrastruktur kota. Ada yang ingin Anda tanyakan?',
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

  function handleReset() {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content:
          'Halo! Saya Asisten AI Sipil ASPIRA Kota Bogor.\n\nPercakapan telah direset. Silakan tanyakan hal lain seputar pelaporan dan transparansi kota.',
        timestamp: new Date().toISOString(),
      },
    ]);
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100dvh-56px-64px)] md:h-[calc(100vh-2rem)]">
      {/* 1. Header Card */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs shrink-0 mb-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-xs">
            🤖
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Asisten AI Sipil ASPIRA
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Konsultasi regulasi pelaporan & transparansi Kota Bogor
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
          title="Reset percakapan"
        >
          Bersihkan Chat
        </button>
      </div>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  AI
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs transition-colors ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-xs font-medium'
                    : 'bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                }`}
              >
                {m.content}
                <div
                  className={`mt-1.5 text-[10px] ${
                    isUser ? 'text-emerald-100/70 text-right' : 'text-slate-400 dark:text-slate-500 text-left'
                  }`}
                >
                  {new Date(m.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  👤
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs py-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold animate-pulse">
              🤖
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Menyusun jawaban resmi...
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 3. Quick Prompts Chips */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-600 text-xs font-medium shrink-0 transition-all border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* 4. Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-2 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pertanyaan seputar pengaduan warga..."
          className="flex-1 p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-xs sm:text-sm outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm disabled:opacity-50 transition-all shadow-xs shrink-0 flex items-center gap-1.5"
        >
          <span>Kirim</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </main>
  );
}
