import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

const links = [
  { label: 'Dashboard', to: '/' },
  { label: 'Collections', to: '/collections' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Exports', to: '/exports' }
];

export function Sidebar() {
  return (
    <aside className="w-full border-r border-border bg-header p-4 md:w-64">
      <div className="mb-8 px-2">
        <h2 className="text-lg font-bold text-white">RAG Control</h2>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'block rounded-xl px-4 py-3 text-sm font-medium transition',
                isActive ? 'bg-accent/20 text-accent' : 'text-muted hover:bg-card hover:text-white'
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
