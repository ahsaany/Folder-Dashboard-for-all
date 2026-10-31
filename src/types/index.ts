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
  subfolder?: string; // e.g. "Term 1", "Evidences", "Audits"
}

export interface CogniaFolder {
  id: number; // 1 to 35 (or custom added modules)
  standardCode?: string; // Optional/legacy code, omitted in display
  name: string;
  domain: CogniaDomain;
  description: string;
  suggestedEvidences: string[];
  fileCount: number;
  totalSize: number;
  lastUpdated?: string;
  color?: string; // e.g. '#1B5E20', '#0284C7', '#7C3AED', etc.
  notes?: string;
  rating?: number; // 0 to 5 stars
  subfolders?: string[]; // user created subfolders
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

export const FOLDER_COLOR_PALETTE = [
  { name: 'Emerald Green', hex: '#1B5E20', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
  { name: 'Forest Green', hex: '#2E7D32', bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300' },
  { name: 'Warm Gold', hex: '#D97706', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
  { name: 'Vibrant Yellow', hex: '#EAB308', bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300' },
  { name: 'Ocean Blue', hex: '#0284C7', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300' },
  { name: 'Deep Royal Blue', hex: '#1D4ED8', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
  { name: 'Royal Purple', hex: '#7C3AED', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' },
  { name: 'Rose Red', hex: '#E11D48', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' },
  { name: 'Teal Green', hex: '#0D9488', bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-300' },
  { name: 'Sunset Orange', hex: '#EA580C', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300' },
  { name: 'Slate Gray', hex: '#475569', bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-300' },
];
