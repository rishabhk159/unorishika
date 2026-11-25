import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Smile, X, User } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

const QUICK_EMOJIS = ['🔥', '😂', 'UNO!', 'Nice move!', 'Draw 4!', 'GG', '😎', '💀', 'Play fast!'];

export default function GameChat({ isOpen, onClose, messages = [], onSendMessage, playerName, playerAvatar }) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const { playClick } = useSoundEffects();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    playClick();
    onSendMessage(text.trim());
    setText('');
  };

  const handleSendQuick = (item) => {
    playClick();
    onSendMessage(item);
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed sm:absolute bottom-4 right-4 z-40 w-[92vw] sm:w-88 h-[420px] bg-slate-900/95 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md animate-fadeIn">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-yellow-400" />
          <span className="font-bold text-sm text-white font-display">Match Room Chat</span>
          <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            Live
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages list */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-center">
            Say hi or taunt your opponents!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isSelf = msg.sender === playerName;
            const isSystem = msg.sender === 'System';

            if (isSystem) {
              return (
                <div key={i} className="text-center my-1.5">
                  <span className="text-[10px] text-yellow-400/90 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={i}
                className={`flex gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Mini avatar */}
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs shrink-0 shadow">
                  {msg.avatar || (isSelf ? playerAvatar : '👤')}
                </div>

                <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} max-w-[78%]`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] text-slate-400 font-bold">
                      {isSelf ? 'You' : msg.sender}
                    </span>
                    {msg.timestamp && (
                      <span className="text-[9px] text-slate-600">
                        {formatTime(msg.timestamp)}
                      </span>
                    )}
                  </div>

                  <div
                    className={`px-3 py-2 rounded-2xl break-words leading-relaxed ${
                      isSelf
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-slate-950 font-semibold rounded-tr-none shadow-md'
                        : 'bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/80 shadow'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis strip */}
      <div className="px-2 py-1.5 border-t border-slate-800 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {QUICK_EMOJIS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuick(item)}
            className="text-xs px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-yellow-400 shrink-0 transition border border-slate-700/60"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Text Input */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-slate-800 bg-slate-950 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message players in room..."
          className="flex-1 px-3 py-2 bg-slate-800/80 text-xs text-white rounded-xl border border-slate-700 focus:outline-none focus:border-yellow-400"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-3.5 py-2 bg-yellow-400 disabled:opacity-40 hover:bg-yellow-300 text-slate-950 rounded-xl transition font-bold"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
