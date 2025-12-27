
export interface ImageHistoryItem {
  id: string;
  originalUrl: string;
  editedUrl: string;
  prompt: string;
  timestamp: number;
}

export enum AppStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  ERROR = 'error',
  SUCCESS = 'success'
}
