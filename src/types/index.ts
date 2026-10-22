export type CogniaDomain = 
  | 'Leadership Capacity'
  | 'Learning Capacity'
  | 'Resource Capacity'
  | 'Accreditation Exhibits';

export interface FolderFile {
  id: string;
  folderId: number;
  name: string;
  size: number;
  type: string;
  extension: string;
  blob?: Blob;
  dataUrl?: string;
  lastModified: number;
  uploadedAt: string;
  tags?: string[];
  notes?: string;
  relativePath?: string;
}

export interface CogniaFolder {
  id: number; // 1 to 35
  standardCode: string; // e.g. "Standard 1.1", "Standard 2.3", "Exhibit 35"
  name: string;
  domain: CogniaDomain;
  description: string;
  suggestedEvidences: string[];
  fileCount: number;
  totalSize: number;
  lastUpdated?: string;
  color?: string;
  notes?: string;
  rating?: number; // 0 to 5 stars
}

export interface PortalSettings {
  schoolName: string;
  portalSubtitle: string;
  theme: 'fluent-light' | 'fluent-dark';
  acrylicIntensity: 'subtle' | 'medium' | 'high';
  autoSaveLocal: boolean;
  compactGrid: boolean;
  lastBackupDate?: string;
}

export interface SearchResult {
  file: FolderFile;
  folder: CogniaFolder;
}
