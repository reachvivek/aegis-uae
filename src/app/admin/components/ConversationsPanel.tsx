"use client";

import { cn } from "@/lib/utils";

interface Session {
  sessionId: string;
  messages: number;
  userMessages: number;
  images: number;
  startedAt: string;
  lastActivity: string;
}

interface ChatMessage {
  role: string;
  content: string;
  hasImage: number;
  createdAt: string;
}

interface ConversationsPanelProps {
  sessions: Session[];
  selectedChat: ChatMessage[] | null;
  selectedSessionId: string;
  onSelectSession: (sessionId: string) => void;
}

export default function ConversationsPanel({ sessions, selectedChat, selectedSessionId, onSelectSession }: ConversationsPanelProps) {
  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-120px)]">
      {/* Session list */}
      <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-[#1E1E28] shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C8A]">Sessions ({sessions.length})</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map((s) => (
            <button
              key={s.sessionId}
              onClick={() => onSelectSession(s.sessionId)}
              className={cn(
                "w-full text-left px-4 py-3 border-b border-[#1E1E28]/30 hover:bg-[#12121A] transition-colors",
                selectedSessionId === s.sessionId && "bg-[#12121A] border-l-2 border-l-[#00E5B8]"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-[#7C7C8A]">{s.sessionId.slice(0, 8)}...</span>
                <span className="text-[9px] font-mono text-[#00E5B8] bg-[#00E5B8]/10 px-1.5 py-0.5 rounded">{s.messages} msgs</span>
              </div>
              <p className="text-[10px] text-[#7C7C8A]">
                {new Date(s.lastActivity).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                {s.images > 0 && <span className="ml-1 text-purple-400">({s.images} img)</span>}
              </p>
            </button>
          ))}
          {sessions.length === 0 && <p className="text-xs text-[#7C7C8A] p-4 text-center">No conversations yet</p>}
        </div>
      </div>

      {/* Chat view */}
      <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-[#1E1E28] shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C8A]">
            {selectedChat ? `Conversation — ${selectedSessionId.slice(0, 8)}` : "Select a session"}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedChat ? selectedChat.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                m.role === "user"
                  ? "bg-[#00E5B8]/10 text-white rounded-br-sm border border-[#00E5B8]/10"
                  : "bg-[#12121A] text-[#E0E0E5] rounded-bl-sm border border-[#1E1E28]"
              )}>
                {m.hasImage ? <span className="text-purple-400 text-[9px] block mb-1">[Screenshot attached]</span> : null}
                <div className="whitespace-pre-wrap">{m.content}</div>
                <span className="text-[8px] text-[#7C7C8A] block mt-1">
                  {new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          )) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-[#7C7C8A]">Click a session to view the conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
