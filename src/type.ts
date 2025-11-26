export type UserRole = 'GUEST' | 'MODERATOR' | 'ADMIN';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption: string;
  tags: string[];
  timestamp: number;
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