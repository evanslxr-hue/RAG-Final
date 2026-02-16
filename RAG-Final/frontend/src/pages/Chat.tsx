import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { chat } from '../lib/api';
import { safeErrorMessage } from '../lib/utils';
import type { Citation } from '../lib/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

function storageKey(collectionId: string) {
  return `rag-chat-${collectionId}`;
}

export function Chat() {
  const { collectionId = '' } = useParams();
  const [sessions, setSessions] = useState<Record<string, Message[]>>({});
  const [activeSessionId, setActiveSessionId] = useState('default');
  const [message, setMessage] = useState('');
  const [strictMode, setStrictMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsed = JSON.parse(localStorage.getItem(storageKey(collectionId)) || '{"default": []}');
    setSessions(parsed);
    setActiveSessionId(Object.keys(parsed)[0] || 'default');
  }, [collectionId]);

  const messages = sessions[activeSessionId] || [];
  const citations = useMemo(() => messages.flatMap((m) => m.citations || []), [messages]);

  const persist = (next: Record<string, Message[]>) => {
    setSessions(next);
    localStorage.setItem(storageKey(collectionId), JSON.stringify(next));
  };

  const send = async () => {
    if (!message.trim()) return;
    const userMsg: Message = { role: 'user', content: message };
    const current = [...messages, userMsg];
    persist({ ...sessions, [activeSessionId]: current });
    setMessage('');
    try {
      const res = await chat({ collection_id: collectionId, message: userMsg.content, strict_mode: strictMode, session_id: activeSessionId });
      persist({ ...sessions, [activeSessionId]: [...current, { role: 'assistant', content: res.answer, citations: res.citations }] });
    } catch (err) {
      setError(safeErrorMessage(err));
    }
  };

  const newSession = () => {
    const id = `session-${Date.now()}`;
    const next = { ...sessions, [id]: [] };
    persist(next);
    setActiveSessionId(id);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr_320px]">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">Sessions</h3>
          <Button variant="secondary" onClick={newSession}>New</Button>
        </div>
        <div className="space-y-2">
          {Object.keys(sessions).map((id) => (
            <button key={id} onClick={() => setActiveSessionId(id)} className={`w-full rounded-xl p-2 text-left text-sm ${id === activeSessionId ? 'bg-accent/20 text-accent' : 'bg-header text-muted'}`}>
              {id}
            </button>
          ))}
        </div>
      </Card>
      <Card className="flex h-[70vh] flex-col">
        {error && <p className="text-sm text-red-300">{error}</p>}
        <div className="mb-3 flex-1 space-y-3 overflow-y-auto rounded-xl bg-header p-3">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${m.role === 'user' ? 'ml-auto bg-accent/20 text-white' : 'bg-card text-muted'}`}>
              {m.content}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask about this collection..." />
          <label className="text-xs text-muted">
            <input type="checkbox" checked={strictMode} onChange={(e) => setStrictMode(e.target.checked)} className="mr-1" />
            strict
          </label>
          <Button onClick={send}>Send</Button>
        </div>
      </Card>
      <Card>
        <h3 className="mb-2 font-bold">Citations</h3>
        <div className="space-y-2 text-sm text-muted">
          {citations.map((c, i) => (
            <Link key={`${c.document_id}-${i}`} to={`/documents/${c.document_id}${c.page ? `?page=${c.page}` : ''}`} className="block rounded-xl bg-header p-2 hover:text-white">
              <p className="font-semibold text-white">{c.filename || c.document_id}</p>
              <p>Page: {c.page ?? '—'}</p>
              <p className="line-clamp-3">{c.snippet || 'No snippet'}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
