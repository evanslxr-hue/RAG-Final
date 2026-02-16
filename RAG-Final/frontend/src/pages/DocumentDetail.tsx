import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { getDocument, getDocumentFileUrl, getSummary, regenerateSummary } from '../lib/api';
import { safeErrorMessage } from '../lib/utils';
import type { DocumentListItem, SummaryResponse } from '../lib/types';

export function DocumentDetail() {
  const { docId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const requestedPage = searchParams.get('page');
  const [tab, setTab] = useState<'summary' | 'study' | 'exports'>('summary');
  const [document, setDocument] = useState<DocumentListItem | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [doc, sum] = await Promise.all([getDocument(docId), getSummary(docId)]);
      setDocument(doc);
      setSummary(sum);
    } catch (err) {
      setError(safeErrorMessage(err));
    }
  };

  useEffect(() => {
    void load();
  }, [docId]);

  const regenerate = async () => {
    try {
      setSummary(await regenerateSummary(docId));
    } catch (err) {
      setError(safeErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-300">{error}</p>}
      <Card className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{document?.filename || 'Document'}</h2>
          <p className="text-sm text-muted">Document ID: {docId}</p>
        </div>
        <Badge>{document?.status || 'UNKNOWN'}</Badge>
      </Card>
      <Card>
        {requestedPage && <p className="mb-2 text-sm text-orange">Requested page: {requestedPage}</p>}
        <iframe src={getDocumentFileUrl(docId)} className="h-[480px] w-full rounded-xl border border-border" title="PDF viewer" />
      </Card>
      <Card>
        <div className="mb-3 flex gap-2">
          <Button variant={tab === 'summary' ? 'primary' : 'secondary'} onClick={() => setTab('summary')}>Summary</Button>
          <Button variant={tab === 'study' ? 'primary' : 'secondary'} onClick={() => setTab('study')}>Study</Button>
          <Button variant={tab === 'exports' ? 'primary' : 'secondary'} onClick={() => setTab('exports')}>Exports</Button>
        </div>
        {tab === 'summary' && (
          <div className="space-y-2 text-sm text-muted">
            <p><strong className="text-white">TL;DR:</strong> {summary?.tldr || 'No summary yet.'}</p>
            <div><strong className="text-white">Key points:</strong><ul className="list-disc pl-6">{summary?.key_points?.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
            <div><strong className="text-white">Glossary:</strong><ul className="list-disc pl-6">{summary?.glossary?.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
            <div><strong className="text-white">Sections:</strong><ul className="list-disc pl-6">{summary?.sections?.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
            <Button onClick={regenerate}>Regenerate Summary</Button>
          </div>
        )}
        {tab === 'study' && <Link to={`/study/${docId}`}><Button>Go to Study</Button></Link>}
        {tab === 'exports' && <Link to="/exports"><Button>Go to Exports</Button></Link>}
      </Card>
    </div>
  );
}
