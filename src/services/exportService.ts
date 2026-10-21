import JSZip from 'jszip';
import { CogniaFolder, FolderFile } from '../types';
import { getDB } from './db';

export async function exportFolderAsZip(folder: CogniaFolder, files: FolderFile[]): Promise<void> {
  const zip = new JSZip();
  const folderSlug = `Folder_${String(folder.id).padStart(2, '0')}_${folder.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const zipFolder = zip.folder(folderSlug);

  // Add metadata readme
  const readmeContent = `# ${folder.name} (${folder.standardCode})
Domain: ${folder.domain}
Description: ${folder.description}
Files Count: ${files.length}
Exported: ${new Date().toLocaleString()}

Suggested Evidences:
${folder.suggestedEvidences.map((e) => `- ${e}`).join('\n')}

Notes:
${folder.notes || 'None'}
`;
  zipFolder?.file('README_Cognia_Standard.txt', readmeContent);

  for (const file of files) {
    if (file.blob) {
      zipFolder?.file(file.name, file.blob);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, `${folderSlug}.zip`);
}

export async function exportAll35FoldersZip(folders: CogniaFolder[]): Promise<void> {
  const db = await getDB();
  const allFiles = await db.getAll('files');
  const zip = new JSZip();
  const root = zip.folder('Nada_International_School_Cognia_Portal_Archive');

  // Master manifest
  const manifest = {
    institution: 'Nada International School',
    system: 'Cognia Accreditation Evidence Portal',
    exportedAt: new Date().toISOString(),
    totalFolders: folders.length,
    totalFiles: allFiles.length,
    folders: folders.map((f) => ({
      id: f.id,
      standardCode: f.standardCode,
      name: f.name,
      domain: f.domain,
      fileCount: f.fileCount,
      totalSize: f.totalSize,
    })),
  };
  root?.file('MASTER_PORTAL_INDEX.json', JSON.stringify(manifest, null, 2));

  // Organize by 35 folders
  for (const folder of folders) {
    const folderName = `Folder_${String(folder.id).padStart(2, '0')}_${folder.standardCode.replace(/\s+/g, '_')}_${folder.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const subFolder = root?.folder(folderName);

    const folderFiles = allFiles.filter((f) => f.folderId === folder.id);
    for (const file of folderFiles) {
      if (file.blob) {
        subFolder?.file(file.name, file.blob);
      }
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const filename = `NIS_Cognia_Portal_All_35_Folders_${new Date().toISOString().slice(0, 10)}.zip`;
  downloadBlob(content, filename);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
