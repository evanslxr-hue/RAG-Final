import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { getExportDownloadUrl, listExports } from '../lib/api';
import { formatDate, safeErrorMessage } from '../lib/utils';
import type { ExportItem } from '../lib/types';

export function Exports() {
  const [items, setItems] = useState<ExportItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setItems(await listExports());
      } catch (err) {
        setError(safeErrorMessage(err));
      }
    })();
  }, []);

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-300">{error}</p>}
      {items.map((item) => (
        <Card key={item.id} className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{item.type} ({item.format || 'n/a'})</h3>
            <p className="text-sm text-muted">{formatDate(item.created_at)}</p>
          </div>
          <a href={getExportDownloadUrl(item.id)} className="text-sm font-semibold text-accent">Download</a>
        </Card>
      ))}
    </div>
  );
}
