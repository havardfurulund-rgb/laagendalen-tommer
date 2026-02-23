import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { getProfessionalAdvice } from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hei! Jeg er Ved-Leif fra Lågendalen Tømmer. Hvordan kan jeg hjelpe deg i dag? 🔥',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await getProfessionalAdvice(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting advice:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Beklager, det oppstod en feil. Prøv igjen senere.',
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <button
        onClick={() => setOpen(!open)}
        className="w-16 h-16 bg-[#1a241e] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-opacity-90 transition-all font-bold text-xl hover:scale-110"
      >
        {open ? <X size={24} /> : '💬'}
      </button>

      {open && (
        <div className="absolute bottom-20 right-0 w-96 h-[500px] bg-white border border-gray-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#1a241e] text-white p-6 border-b">
            <h3 className="text-lg font-bold">Ved-Leif</h3>
            <p className="text-sm text-white/80">Vedekspert fra Lågendalen</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-[#1a241e] text-white rounded-br-none'
                      : 'bg-gray-100 text-[#1a241e] rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-[#1a241e] px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-[#1a241e] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#1a241e] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#1a241e] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Spørsmål om ved?"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a241e]"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2 bg-[#1a241e] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
