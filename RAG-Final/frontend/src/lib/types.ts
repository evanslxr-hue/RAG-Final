export interface Collection {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export type DocumentStatus = 'INDEXED' | 'PROCESSING' | 'FAILED' | string;

export interface DocumentListItem {
  id: string;
  collection_id: string;
  filename: string;
  status: DocumentStatus;
  page_count?: number;
  created_at: string;
  last_job_id?: string;
}

export interface JobLogItem {
  timestamp?: string;
  stage?: string;
  message: string;
}

export interface Job {
  id: string;
  type?: string;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED' | string;
  stage?: string;
  progress?: number;
  updated_at?: string;
  created_at?: string;
  document_id?: string;
  logs?: JobLogItem[];
}

export interface Citation {
  document_id: string;
  filename?: string;
  page?: number;
  snippet?: string;
}

export interface ChatRequest {
  collection_id: string;
  message: string;
  strict_mode?: boolean;
  session_id?: string;
}

export interface ChatResponse {
  answer: string;
  citations?: Citation[];
  session_id?: string;
}

export interface SummaryResponse {
  document_id: string;
  tldr: string;
  key_points: string[];
  glossary: string[];
  sections: string[];
}

export interface Flashcard {
  id?: string;
  question: string;
  answer: string;
  citation?: Citation;
}

export interface Quiz {
  id?: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  citation?: Citation;
}

export interface ExportItem {
  id: string;
  type: string;
  format?: string;
  created_at?: string;
  status?: string;
}
