'use client';
import { useState } from 'react';
import { Send, Command } from 'lucide-react';

export default function TaskInput({ onAdd }: { onAdd: () => void }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ text: text.trim() }),
      headers: { 'Content-Type': 'application/json' }
    });
    setText('');
    setSending(false);
    onAdd(); // Refresh parent
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#14161b] border border-[#282a36] rounded-lg p-4 flex gap-3 shadow-lg">
      <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
        <Command size={18} />
      </div>
      <div className="flex-1">
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Assign new mission protocol..."
          className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none h-10"
        />
      </div>
      <button 
        type="submit" 
        disabled={sending || !text.trim()}
        className="w-10 h-10 bg-[#1f2128] hover:bg-indigo-600 hover:text-white text-gray-400 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={16} />
      </button>
    </form>
  );
}
