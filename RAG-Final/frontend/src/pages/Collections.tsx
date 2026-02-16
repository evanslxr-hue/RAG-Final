import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { createCollection, listCollections } from '../lib/api';
import { formatDate, safeErrorMessage } from '../lib/utils';
import type { Collection } from '../lib/types';

export function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setCollections(await listCollections());
    } catch (err) {
      setError(safeErrorMessage(err));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () => collections.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [collections, search]
  );

  const onCreate = async () => {
    if (!name.trim()) return;
    try {
      await createCollection(name.trim());
      setName('');
      await load();
    } catch (err) {
      setError(safeErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-300">{error}</p>}
      <Card className="space-y-3">
        <h3 className="text-xl font-bold">Create Collection</h3>
        <div className="flex gap-2">
          <Input placeholder="Collection name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={onCreate}>Create</Button>
        </div>
      </Card>
      <Card>
        <Input placeholder="Search collections..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((collection) => (
          <Card key={collection.id}>
            <h4 className="text-lg font-bold">{collection.name}</h4>
            <p className="mt-1 text-sm text-muted">Created: {formatDate(collection.created_at)}</p>
            <Link to={`/collections/${collection.id}`} className="mt-4 inline-block">
              <Button variant="secondary">Open</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
