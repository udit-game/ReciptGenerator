export interface ErrorLogPayload {
  id: string;
  error_message: string;
  error_stack?: string | null;
}

export interface LogFilterPayload {
  targetDate: string; 
}

export interface SavedErrorLog extends ErrorLogPayload {
  id: string;
  error_message: string;
  error_stack: string | null;
  created_at: string;
}
