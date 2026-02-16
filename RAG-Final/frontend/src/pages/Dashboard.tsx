import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { listCollections, listDocuments, listExports, listJobs } from '../lib/api';
import { formatDate, safeErrorMessage } from '../lib/utils';
import type { Collection } from '../lib/types';

export function Dashboard() {
  const [stats, setStats] = useState({ collections: 0, documents: 0, jobs: 0, exports: 0 });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [collections, jobs, exports] = await Promise.all([listCollections(), listJobs(), listExports()]);
        let docCount = 0;
        const docsAccumulator: any[] = [];
        for (const col of collections as Collection[]) {
          const docs = await listDocuments(col.id);
          docCount += docs.length;
          docsAccumulator.push(...docs);
        }
        setStats({ collections: collections.length, documents: docCount, jobs: jobs.length, exports: exports.length });
        setRecentJobs(jobs.slice(0, 5));
        setRecentDocs(docsAccumulator.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 5));
      } catch (err) {
        setError(safeErrorMessage(err));
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(stats).map(([k, v]) => (
          <Card key={k}>
            <p className="text-sm capitalize text-muted">{k}</p>
            <h3 className="mt-2 text-4xl font-bold">{v}</h3>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-xl font-bold">Recent Jobs</h3>
          <ul className="space-y-2 text-sm text-muted">
            {recentJobs.map((job) => (
              <li key={job.id} className="rounded-lg bg-header p-3">
                <div className="font-semibold text-white">{job.id}</div>
                <div>{job.status} · {formatDate(job.updated_at)}</div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-3 text-xl font-bold">Recent Documents</h3>
          <ul className="space-y-2 text-sm text-muted">
            {recentDocs.map((doc) => (
              <li key={doc.id} className="rounded-lg bg-header p-3">
                <div className="font-semibold text-white">{doc.filename}</div>
                <div>{doc.status} · {formatDate(doc.created_at)}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Manage your collections</h3>
          <p className="text-sm text-muted">Create, upload, and chat with your PDFs.</p>
        </div>
        <Link to="/collections">
          <Button>Go to Collections</Button>
        </Link>
      </Card>
    </div>
  );
}
