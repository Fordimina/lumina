export type UserRole = 'GUEST' | 'MODERATOR' | 'ADMIN';

export type UploadStatus = "pending" | "uploading" | "failed" | "completed";

export interface PendingUploadMeta {
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;         // ISO string
  mediaType: "image" | "video";
}

export interface PendingUpload {
  id: string;                // crypto.randomUUID()
  file: File;
  meta: PendingUploadMeta;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption: string;
  tags: string[];
  timestamp: number;         // UNIX timestamp
  author: string;
}

export interface AISuggestion {
  caption: string;
  tags: string[];
}

export interface AppSettings {
  galleryTitle: string;
  maintenanceMode: boolean;
  allowPublicComments: boolean;
  aboutHtml: string;
}

export enum ViewMode {
  MASONRY = 'MASONRY',
  GRID = 'GRID'
}
