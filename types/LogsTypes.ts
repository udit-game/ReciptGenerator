export interface ErrorLogPayload {
  id: string;
  context_tag: string;
  error_message: string;
  error_stack?: string | null;
}

export interface LogFilterPayload {
  targetDate: string; 
}

export interface SavedErrorLog extends ErrorLogPayload {
  created_at: string;
}
