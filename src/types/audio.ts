export type ChunkStatus = 'idle' | 'processing' | 'done' | 'error';

export interface AudioChunk {
  id: number;
  blob: Blob;
  url: string;
  text: string;
  status: ChunkStatus;
}