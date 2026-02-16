import type {
  ChatRequest,
  ChatResponse,
  Collection,
  DocumentListItem,
  ExportItem,
  Flashcard,
  Job,
  Quiz,
  SummaryResponse
} from './types';

export const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  if (response.status === 204) return {} as T;
  return (await response.json()) as T;
}

export const listCollections = () => request<Collection[]>('/api/collections');

export const createCollection = (name: string) =>
  request<Collection>('/api/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

export const listDocuments = (collectionId: string) =>
  request<DocumentListItem[]>(`/api/collections/${collectionId}/documents`);

export async function uploadDocuments(collectionId: string, files: FileList | File[]) {
  const form = new FormData();
  Array.from(files).forEach((file) => form.append('files', file));
  return request<DocumentListItem[]>(`/api/collections/${collectionId}/documents`, {
    method: 'POST',
    body: form
  });
}

export const listJobs = () => request<Job[]>('/api/jobs');
export const getJob = (id: string) => request<Job>(`/api/jobs/${id}`);
export const chat = (payload: ChatRequest) =>
  request<ChatResponse>('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

export const getDocument = (docId: string) => request<DocumentListItem>(`/api/documents/${docId}`);
export const getDocumentFileUrl = (docId: string) => `${baseUrl}/api/documents/${docId}/file`;
export const getSummary = (docId: string) => request<SummaryResponse>(`/api/documents/${docId}/summary`);
export const regenerateSummary = (docId: string) =>
  request<SummaryResponse>(`/api/documents/${docId}/summarize`, { method: 'POST' });

export const getFlashcards = (docId: string) => request<Flashcard[]>(`/api/documents/${docId}/study/flashcards`);
export const getQuizzes = (docId: string) => request<Quiz[]>(`/api/documents/${docId}/study/quizzes`);
export const generateStudy = (docId: string) =>
  request<{ status?: string }>(`/api/documents/${docId}/study/generate`, { method: 'POST' });

export const listExports = () => request<ExportItem[]>('/api/exports');
export const getExportDownloadUrl = (exportId: string) => `${baseUrl}/api/exports/${exportId}/download`;

export const exportAnswer = (payload: { answer: string; citations?: unknown[]; format?: string }) =>
  request<ExportItem>('/api/export/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

export const exportSummary = (docId: string) =>
  request<ExportItem>('/api/export/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: docId })
  });

export const exportStudyPack = (docId: string) =>
  request<ExportItem>('/api/export/study-pack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: docId })
  });
