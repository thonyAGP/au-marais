'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_QUESTIONS = [
  { label: '🏠 L\'appartement', question: 'Peux-tu me décrire l\'appartement ?' },
  { label: '📍 Le quartier', question: 'Parle-moi du quartier Le Marais' },
  { label: '💰 Les tarifs', question: 'Quels sont les tarifs ?' },
  { label: '🚇 Accès métro', question: 'Comment accéder en métro ?' },
];

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Désolé, je rencontre un problème technique. Vous pouvez nous contacter directement via WhatsApp au +33 6 31 59 84 00.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gold text-white rounded-full shadow-lg hover:bg-gold-dark transition-all duration-300 flex items-center justify-center hover:scale-110 ${isOpen ? 'hidden' : ''}`}
        aria-label="Ouvrir l'assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[550px] max-h-[calc(100vh-6rem)] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-stone-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-gold to-gold-dark text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Assistant Au Marais</h3>
                <p className="text-xs text-white/80">Répond à vos questions</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream/30">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
                  <p className="text-text text-sm">
                    Bonjour ! 👋 Je suis l&apos;assistant virtuel de l&apos;appartement Au Marais. Comment puis-je vous aider ?
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-text-muted uppercase tracking-wider">Questions fréquentes</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => handleQuickQuestion(q.question)}
                        className="px-3 py-2 bg-white border border-stone-200 rounded-full text-sm text-text hover:border-gold hover:text-gold transition-colors"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' ? 'bg-gold text-white' : 'bg-stone-200 text-text'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] p-3 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-gold text-white rounded-br-none'
                      : 'bg-white border border-stone-100 text-text rounded-bl-none shadow-sm'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-text" />
                </div>
                <div className="bg-white border border-stone-100 p-3 rounded-lg rounded-bl-none shadow-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-gold" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-stone-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question..."
                className="flex-1 px-4 py-2 border border-stone-200 rounded-full text-sm focus:outline-none focus:border-gold transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-gold text-white rounded-full flex items-center justify-center hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Envoyer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-text-muted text-center mt-2">
              Pour réserver, contactez-nous via WhatsApp
            </p>
          </form>
        </div>
      )}
    </>
  );
};
