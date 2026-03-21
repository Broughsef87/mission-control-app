'use client';

import { useState, useEffect, useRef } from 'react';
import { PencilLine, Check } from 'lucide-react';

export default function Scratchpad() {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    fetch('/api/scratchpad')
      .then(res => res.json())
      .then(data => setContent(data.content));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setSaving(true);
    
    // Debounce save
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      fetch('/api/scratchpad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: val })
      }).then(() => setSaving(false));
    }, 1000);
  };

  return (
    <div className="bg-[#14161b] border border-[#282a36] rounded-lg p-6 relative hover:border-gray-700 transition-colors h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <PencilLine size={14} className="text-purple-400" />
          Neural Scratchpad
        </h3>
        {saving ? (
          <span className="text-[10px] text-yellow-500 animate-pulse">Saving...</span>
        ) : (
          <span className="text-[10px] text-green-500 flex items-center gap-1">
             <Check size={10} /> Saved
          </span>
        )}
      </div>

      <textarea
        className="w-full flex-1 bg-transparent text-sm text-gray-300 font-mono resize-none focus:outline-none placeholder-gray-700 leading-relaxed"
        placeholder="// Quick notes, ideas, or temporary code snippets..."
        value={content}
        onChange={handleChange}
        spellCheck={false}
      />
      
      <div className="absolute bottom-2 right-2 text-[10px] text-gray-700 font-mono pointer-events-none">
         Markdown Supported
      </div>
    </div>
  );
}
