import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { listJobs } from '../lib/api';
import { formatDate, safeErrorMessage } from '../lib/utils';
import type { Job } from '../lib/types';

export function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setJobs(await listJobs());
    } catch (err) {
      setError(safeErrorMessage(err));
    }
  };

  useEffect(() => {
    void fetchJobs();
  }, []);

  const hasActive = useMemo(() => jobs.some((job) => !['DONE', 'FAILED'].includes(job.status.toUpperCase())), [jobs]);

  useEffect(() => {
    if (!hasActive) return;
    const timer = setInterval(() => void fetchJobs(), 2000);
    return () => clearInterval(timer);
  }, [hasActive]);

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-300">{error}</p>}
      {jobs.map((job) => (
        <Card key={job.id}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">{job.type || 'Job'} · {job.id}</h3>
            <Badge>{job.status}</Badge>
          </div>
          <p className="mb-2 text-sm text-muted">Stage: {job.stage || '—'} · Updated: {formatDate(job.updated_at)}</p>
          <div className="h-2 overflow-hidden rounded bg-header">
            <div className="h-full bg-accent" style={{ width: `${Math.max(0, Math.min(100, job.progress ?? 0))}%` }} />
          </div>
        </Card>
      ))}
    </div>
  );
}
