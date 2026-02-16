import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { listCollections, listDocuments, listJobs, uploadDocuments } from '../lib/api';
import { formatDate, safeErrorMessage } from '../lib/utils';
import type { DocumentListItem, Job } from '../lib/types';

const filters = ['ALL', 'INDEXED', 'PROCESSING', 'FAILED'];

export function CollectionDetail() {
  const { id = '' } = useParams();
  const [collectionName, setCollectionName] = useState('Collection');
  const [docs, setDocs] = useState<DocumentListItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [collections, documents, jobList] = await Promise.all([listCollections(), listDocuments(id), listJobs()]);
      const current = collections.find((c) => c.id === id);
      setCollectionName(current?.name || 'Collection');
      setDocs(documents);
      setJobs(jobList);
    } catch (err) {
      setError(safeErrorMessage(err));
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const filtered = useMemo(
    () =>
      docs.filter((doc) => {
        const matchesSearch = doc.filename.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || doc.status.toUpperCase() === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [docs, search, statusFilter]
  );

  const latestJobByDoc = useMemo(() => {
    const map = new Map<string, Job>();
    jobs.forEach((job) => {
      if (job.document_id) map.set(job.document_id, job);
    });
    return map;
  }, [jobs]);

  const onUpload = async () => {
    if (!files || files.length === 0) return;
    try {
      setUploadStatus('Uploading...');
      await uploadDocuments(id, files);
      setUploadStatus('Upload complete');
      await load();
    } catch (err) {
      setUploadStatus('Upload failed');
      setError(safeErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-300">{error}</p>}
      <Card className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{collectionName}</h2>
          <p className="text-sm text-muted">Collection ID: {id}</p>
        </div>
        <Link to={`/chat/${id}`}><Button>Open Chat</Button></Link>
      </Card>
      <Card className="space-y-3">
        <h3 className="text-xl font-bold">Upload PDFs</h3>
        <input type="file" multiple accept="application/pdf" onChange={(e) => setFiles(e.target.files)} />
        <div className="flex items-center gap-3">
          <Button onClick={onUpload}>Upload</Button>
          <span className="text-sm text-muted">{uploadStatus}</span>
        </div>
      </Card>
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input className="max-w-lg" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {filters.map((filter) => (
            <Button key={filter} variant={statusFilter === filter ? 'primary' : 'secondary'} onClick={() => setStatusFilter(filter)}>
              {filter}
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-border bg-header p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{doc.filename}</p>
                  <p className="text-xs text-muted">{formatDate(doc.created_at)}</p>
                </div>
                <Badge>{doc.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted">Latest job: {latestJobByDoc.get(doc.id)?.status || '—'}</p>
              <div className="mt-3 flex gap-2">
                <Link to={`/documents/${doc.id}`}><Button variant="secondary">Open Document</Button></Link>
                <Link to={`/chat/${id}`}><Button variant="ghost">Open Chat</Button></Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
