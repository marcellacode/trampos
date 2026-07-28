"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Mic, Sparkles } from "lucide-react";
import {
  listInterviewSessionsAction,
  startInterviewSessionAction,
  submitInterviewAnswerAction,
  type InterviewMessage,
} from "@/app/actions/interview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InterviewSimulator() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [pastSessions, setPastSessions] = useState<
    {
      id: string;
      roleTitle: string;
      companyName: string;
      status: string;
      score: number | null;
      createdAt: string;
    }[]
  >([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void listInterviewSessionsAction().then((r) => {
      if (r.success) setPastSessions(r.data);
    });
  }, [done]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = useCallback(async () => {
    setLoading(true);
    const result = await startInterviewSessionAction();
    setLoading(false);
    if (!result.success) return;
    setSessionId(result.data.sessionId);
    setMessages(result.data.messages);
    setDone(false);
    setScore(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!sessionId || !input.trim() || loading || done) return;

      setLoading(true);
      const result = await submitInterviewAnswerAction(sessionId, input);
      setLoading(false);
      setInput("");

      if (!result.success) return;
      setMessages(result.data.messages);
      if (result.data.done) {
        setDone(true);
        setScore(result.data.score ?? null);
      }
    },
    [sessionId, input, loading, done]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#4F7CFF]/20 bg-[#4F7CFF]/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-[#4F7CFF]" />
              <h2 className="text-lg font-semibold text-white">Simulador de entrevista IA</h2>
            </div>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              Pratique respostas com feedback personalizado via Groq.
            </p>
          </div>
          {!sessionId && (
            <Button onClick={() => void startSession()} disabled={loading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Iniciar simulação
            </Button>
          )}
        </div>
      </div>

      {sessionId && (
        <div className="flex h-[480px] flex-col rounded-2xl border border-white/[0.08] bg-[#111315]">
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {messages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}`}
                className={cn(
                  "max-w-[90%] rounded-xl px-4 py-2.5 text-sm",
                  msg.role === "user" && "ml-auto bg-[#4F7CFF]/20 text-white",
                  msg.role === "interviewer" && "bg-white/[0.04] text-white",
                  msg.role === "feedback" && "border border-[#22C55E]/20 bg-[#22C55E]/10 text-[#BBF7D0]"
                )}
              >
                {msg.role === "feedback" && (
                  <span className="mb-1 block text-[10px] font-semibold uppercase text-[#22C55E]">
                    Feedback
                  </span>
                )}
                {msg.content}
              </div>
            ))}
            {done && score != null && (
              <p className="text-center text-sm font-medium text-[#4F7CFF]">
                Pontuação final: {score}/100
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {!done && (
            <form onSubmit={handleSubmit} className="border-t border-white/[0.06] p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Sua resposta..."
                  className="flex-1 rounded-xl border border-white/[0.08] bg-black/20 px-4 py-2.5 text-sm text-white outline-none"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !input.trim()}>
                  Enviar
                </Button>
              </div>
            </form>
          )}

          {done && (
            <div className="border-t border-white/[0.06] p-4 text-center">
              <Button variant="outline" onClick={() => void startSession()}>
                Nova simulação
              </Button>
            </div>
          )}
        </div>
      )}

      {pastSessions.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#111315] p-5">
          <h3 className="text-sm font-semibold text-white">Sessões anteriores</h3>
          <ul className="mt-3 space-y-2">
            {pastSessions.map((s) => (
              <li key={s.id} className="flex justify-between text-xs text-[#9CA3AF]">
                <span>
                  {s.roleTitle} — {s.companyName}
                </span>
                <span>{s.score != null ? `${s.score}/100` : s.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
