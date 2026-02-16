import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function SlideLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-white">
      <Topbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
