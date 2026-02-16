import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SlideLayout } from './components/layout/SlideLayout';
import { Chat } from './pages/Chat';
import { CollectionDetail } from './pages/CollectionDetail';
import { Collections } from './pages/Collections';
import { Dashboard } from './pages/Dashboard';
import { DocumentDetail } from './pages/DocumentDetail';
import { Exports } from './pages/Exports';
import { Jobs } from './pages/Jobs';
import { Study } from './pages/Study';

interface Toast {
  id: number;
  type: 'success' | 'error';
  text: string;
}

export default function App() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const successHandler = () => addToast('success', 'Action completed.');
    const errorHandler = () => addToast('error', 'Action failed.');
    window.addEventListener('rag:success', successHandler);
    window.addEventListener('rag:error', errorHandler);
    return () => {
      window.removeEventListener('rag:success', successHandler);
      window.removeEventListener('rag:error', errorHandler);
    };
  }, []);

  const addToast = (type: Toast['type'], text: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  };

  return (
    <>
      <SlideLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/chat/:collectionId" element={<Chat />} />
          <Route path="/documents/:docId" element={<DocumentDetail />} />
          <Route path="/study/:docId" element={<Study />} />
          <Route path="/exports" element={<Exports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SlideLayout>
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`rounded-xl border px-4 py-2 text-sm shadow-soft ${toast.type === 'success' ? 'border-accent bg-card text-accent' : 'border-red-500 bg-card text-red-300'}`}>
            {toast.text}
          </div>
        ))}
      </div>
    </>
  );
}
