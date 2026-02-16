import { useLocation } from 'react-router-dom';

const labels: Record<string, string> = {
  '/': 'Dashboard',
  '/collections': 'Collections',
  '/jobs': 'Jobs',
  '/exports': 'Exports'
};

export function Topbar() {
  const { pathname } = useLocation();
  const title = Object.keys(labels).find((key) => pathname === key || pathname.startsWith(`${key}/`));

  return (
    <header className="border-b border-border bg-header">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-white">{(title && labels[title]) || 'PDF RAG Assistant'}</h1>
        <p className="text-sm text-muted">Local-first retrieval and study workspace</p>
      </div>
      <div className="h-1 w-full bg-accent" />
    </header>
  );
}
