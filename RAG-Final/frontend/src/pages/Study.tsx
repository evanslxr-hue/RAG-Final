import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { generateStudy, getFlashcards, getQuizzes } from '../lib/api';
import { safeErrorMessage } from '../lib/utils';
import type { Flashcard, Quiz } from '../lib/types';

export function Study() {
  const { docId = '' } = useParams();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [reveal, setReveal] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [f, q] = await Promise.all([getFlashcards(docId), getQuizzes(docId)]);
      setFlashcards(f);
      setQuizzes(q);
    } catch (err) {
      setError(safeErrorMessage(err));
    }
  };

  useEffect(() => {
    void load();
  }, [docId]);

  const onGenerate = async () => {
    try {
      await generateStudy(docId);
      await load();
    } catch (err) {
      setError(safeErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-300">{error}</p>}
      <Card className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Study Tools</h2>
        <Button onClick={onGenerate}>Generate Study Items</Button>
      </Card>
      <Card>
        <h3 className="mb-3 text-xl font-bold">Flashcards</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {flashcards.map((card, i) => (
            <div key={card.id || i} className="rounded-xl bg-header p-3">
              <p className="font-semibold">Q: {card.question}</p>
              <p className="mt-2 text-sm text-muted">A: {card.answer}</p>
              <p className="mt-2 text-xs text-muted">Citation: {card.citation?.filename || '—'} p.{card.citation?.page || '—'}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 text-xl font-bold">Quizzes</h3>
        <div className="space-y-3">
          {quizzes.map((quiz, i) => (
            <div key={quiz.id || i} className="rounded-xl bg-header p-3 text-sm">
              <p className="font-semibold">{quiz.question}</p>
              <ul className="mt-1 list-disc pl-5 text-muted">{quiz.options.map((o, idx) => <li key={idx}>{o}</li>)}</ul>
              <Button className="mt-2" variant="secondary" onClick={() => setReveal((prev) => ({ ...prev, [i]: !prev[i] }))}>Reveal answer</Button>
              {reveal[i] && (
                <div className="mt-2 text-muted">
                  <p>Answer: <span className="text-white">{quiz.answer}</span></p>
                  <p>{quiz.explanation}</p>
                  <p className="text-xs">Citation: {quiz.citation?.filename || '—'} p.{quiz.citation?.page || '—'}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
