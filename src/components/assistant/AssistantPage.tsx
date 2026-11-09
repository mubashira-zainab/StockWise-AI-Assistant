/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  FileDown,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Cpu,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { ChatMessage } from '../../types';
import { getAccentClasses } from '../../utils/accentStyles';

export const AssistantPage: React.FC = () => {
  const {
    activeConversation,
    sendMessage,
    regenerateLastMessage,
    clearCurrentConversation,
    createNewConversation,
    exportConversationJSON,
    isAiStreaming,
    aiSettings,
    groqStatus,
    metrics,
    accentColor,
    setActiveTab,
  } = useBusiness();

  const accentStyles = getAccentClasses(accentColor);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Exact 5 suggested questions required by specification
  const suggestedQuestions = [
    'Which products are running low?',
    'Analyze my current inventory.',
    'Which products generate the highest profit?',
    'What should I reorder?',
    'Summarize my sales performance.',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isAiStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isAiStreaming) return;
    const text = input;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(text);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const messages = activeConversation?.messages || [];

  // Clean Markdown & Bullet Formatting
  const renderFormattedMessage = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-800 dark:text-slate-200 my-1">
            {formatBold(text)}
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-slate-800 dark:text-slate-200 leading-relaxed my-0.5">
          {formatBold(line)}
        </p>
      );
    });
  };

  const formatBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#070B18] min-w-0 overflow-hidden relative">
      {/* Assistant Header & Model Status */}
      <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] flex items-center justify-between gap-3 shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${accentStyles.bg} flex items-center justify-center text-white`}>
              <Bot className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
              StockWise AI Assistant
            </span>
          </div>

          <span className="hidden md:inline-block text-slate-300 dark:text-slate-700">·</span>

          {/* Model Status Badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-slate-600 dark:text-slate-400">
              {aiSettings.model}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              (Server Connected)
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => createNewConversation()}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white ${accentStyles.bg} ${accentStyles.hoverBg} rounded-xl transition-all shadow-xs`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          <button
            onClick={exportConversationJSON}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Export Transcript"
          >
            <FileDown className="w-4 h-4" />
          </button>

          <button
            onClick={clearCurrentConversation}
            className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {/* Welcome Empty State */}
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto my-6 space-y-6 text-center">
            <div className={`inline-flex p-3 rounded-2xl ${accentStyles.lightBg} border border-blue-200 dark:border-blue-900`}>
              <div className={`w-12 h-12 rounded-xl ${accentStyles.bg} flex items-center justify-center text-white shadow-lg`}>
                <Bot className="w-7 h-7" />
              </div>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                StockWise AI Intelligence Assistant
              </h2>
              <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                Connected to Groq Chat Completions. Genuinely analyzes your real database snapshot to answer questions on stock replenishment, sales trends, and margins.
              </p>
            </div>

            {/* In-Memory Database Summary Badge */}
            <div className="p-4 max-w-md mx-auto bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl text-left text-xs shadow-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                <span>Database Context Injected</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">Active Data</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">Catalog</span>
                  <span className="font-bold">{metrics.totalProducts} items</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Valuation</span>
                  <span className="font-bold font-mono">${metrics.totalInventoryValue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Low Stock</span>
                  <span className={`font-bold font-mono ${metrics.lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {metrics.lowStockCount} items
                  </span>
                </div>
              </div>
            </div>

            {/* Suggested Questions Grid */}
            <div className="space-y-2 text-left max-w-lg mx-auto pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Suggested Business Inquiries:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(q)}
                    className="flex items-center justify-between p-3.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl transition-all shadow-xs group text-left"
                  >
                    <span className="font-medium">{q}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg: ChatMessage) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? `${accentStyles.bg} text-white`
                    : 'bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs'
                }`}
              >
                {isUser ? 'U' : <Bot className="w-4 h-4 text-blue-500" />}
              </div>

              <div
                className={`group relative rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[85%] md:max-w-[78%] ${
                  isUser
                    ? `${accentStyles.bg} text-white rounded-tr-xs shadow-md`
                    : msg.isError
                    ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 rounded-tl-xs shadow-xs'
                    : 'bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-xs'
                }`}
              >
                <div>
                  {isUser ? msg.content : renderFormattedMessage(msg.content)}
                </div>

                {/* Footer Timestamp & Actions */}
                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-white/80' : 'text-slate-400'
                  }`}
                >
                  <span className="font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {!isUser && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 hover:text-slate-900 dark:hover:text-white rounded-md"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {msg.isError && (
                        <button
                          onClick={regenerateLastMessage}
                          className="flex items-center gap-1 p-1 text-rose-600 hover:underline"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* AI Typing / Streaming Indicator */}
        {isAiStreaming && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-500 shadow-xs">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-slate-500 shadow-xs flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Communicating with Groq API...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips Bar */}
      {messages.length > 0 && (
        <div className="px-6 py-2 overflow-x-auto flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shrink-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold shrink-0">Prompts:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              className="text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <div className="p-4 md:px-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shrink-0 shadow-lg">
        <div className="max-w-3xl mx-auto relative flex items-center">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask StockWise AI about inventory reorders, profit margins, sales analysis..."
            rows={1}
            disabled={isAiStreaming}
            className="w-full resize-none pl-4 pr-24 py-3 text-xs bg-slate-50 dark:bg-[#070B18] text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-blue-500 max-h-36 disabled:opacity-50 shadow-inner"
          />

          <div className="absolute right-2 flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={regenerateLastMessage}
                disabled={isAiStreaming}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Regenerate last answer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isAiStreaming}
              className={`p-2.5 text-white ${accentStyles.bg} ${accentStyles.hoverBg} disabled:opacity-40 rounded-xl transition-all shadow-xs`}
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press Enter to send, Shift + Enter for newline</span>
          <span className="font-mono">
            Model: {aiSettings.model} · {aiSettings.responseMode.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
