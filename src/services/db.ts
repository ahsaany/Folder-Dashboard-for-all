import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CogniaFolder, FolderFile, PortalSettings, SearchResult } from '../types';
import { INITIAL_35_FOLDERS } from '../data/cogniaStandards';

interface PortalDBSchema extends DBSchema {
  folders: {
    key: number;
    value: CogniaFolder;
  };
  files: {
    key: string;
    value: FolderFile;
    indexes: {
      'by-folder': number;
      'by-name': string;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'NadaCogniaPortalDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PortalDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<PortalDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<PortalDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Folders store
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'id' });
        }

        // Files store
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id' });
          fileStore.createIndex('by-folder', 'folderId');
          fileStore.createIndex('by-name', 'name');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

export async function initializePortal(): Promise<CogniaFolder[]> {
  const db = await getDB();
  const tx = db.transaction(['folders', 'files'], 'readonly');
  const folderStore = tx.objectStore('folders');
  const existingFolders = await folderStore.getAll();

  if (existingFolders.length === 0) {
    // Seed initial 35 folders
    const writeTx = db.transaction('folders', 'readwrite');
    const writeStore = writeTx.objectStore('folders');
    for (const folder of INITIAL_35_FOLDERS) {
      await writeStore.put({
        ...folder,
        fileCount: 0,
        totalSize: 0,
        lastUpdated: new Date().toISOString(),
      });
    }
    await writeTx.done;
    return refreshFolderStats();
  }

  return refreshFolderStats();
}

export async function refreshFolderStats(): Promise<CogniaFolder[]> {
  const db = await getDB();
  const folders = await db.getAll('folders');
  const files = await db.getAll('files');

  const statsMap = new Map<number, { count: number; size: number; lastUpdated?: string }>();
  for (const f of files) {
    const stat = statsMap.get(f.folderId) || { count: 0, size: 0, lastUpdated: f.uploadedAt };
    stat.count += 1;
    stat.size += f.size;
    if (!stat.lastUpdated || new Date(f.uploadedAt) > new Date(stat.lastUpdated)) {
      stat.lastUpdated = f.uploadedAt;
    }
    statsMap.set(f.folderId, stat);
  }

  const updatedFolders: CogniaFolder[] = folders.map((folder) => {
    const stats = statsMap.get(folder.id) || { count: 0, size: 0, lastUpdated: folder.lastUpdated };
    return {
      ...folder,
      fileCount: stats.count,
      totalSize: stats.size,
      lastUpdated: stats.lastUpdated,
    };
  });

  // Sort strictly 1 through 35
  return updatedFolders.sort((a, b) => a.id - b.id);
}

export async function updateFolderMetadata(folder: CogniaFolder): Promise<void> {
  const db = await getDB();
  await db.put('folders', folder);
}

export async function getFilesInFolder(folderId: number): Promise<FolderFile[]> {
  const db = await getDB();
  const tx = db.transaction('files', 'readonly');
  const index = tx.store.index('by-folder');
  const files = await index.getAll(folderId);
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveFile(file: FolderFile): Promise<void> {
  const db = await getDB();
  await db.put('files', file);
}

export async function saveMultipleFiles(files: FolderFile[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('files', 'readwrite');
  for (const file of files) {
    await tx.store.put(file);
  }
  await tx.done;
}

export async function deleteFile(fileId: string): Promise<void> {
  const db = await getDB();
  await db.delete('files', fileId);
}

export async function clearFolderFiles(folderId: number): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('files', 'readwrite');
  const index = tx.store.index('by-folder');
  let cursor = await index.openCursor(folderId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function resetAllDataToDefault(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['folders', 'files'], 'readwrite');
  await tx.objectStore('files').clear();
  await tx.objectStore('folders').clear();

  for (const folder of INITIAL_35_FOLDERS) {
    await tx.objectStore('folders').put({
      ...folder,
      fileCount: 0,
      totalSize: 0,
      lastUpdated: new Date().toISOString(),
    });
  }
  await tx.done;
}

export async function searchFiles(query: string, folders: CogniaFolder[]): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const db = await getDB();
  const cleanQuery = query.toLowerCase().trim();
  const allFiles = await db.getAll('files');
  const folderMap = new Map<number, CogniaFolder>(folders.map((f) => [f.id, f]));

  const results: SearchResult[] = [];
  for (const file of allFiles) {
    const matchesName = file.name.toLowerCase().includes(cleanQuery);
    const matchesExtension = file.extension.toLowerCase().includes(cleanQuery);
    const folder = folderMap.get(file.folderId);
    const matchesFolderName = folder ? folder.name.toLowerCase().includes(cleanQuery) : false;
    const matchesStandard = folder ? folder.standardCode.toLowerCase().includes(cleanQuery) : false;

    if (matchesName || matchesExtension || matchesFolderName || matchesStandard) {
      if (folder) {
        results.push({ file, folder });
      }
    }
  }

  return results.slice(0, 50); // limit to 50 results for rapid UI rendering
}

export async function getStorageMetrics(): Promise<{ usedBytes: number; quotaBytes: number; fileCount: number }> {
  const db = await getDB();
  const files = await db.getAll('files');
  const usedBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);

  let quotaBytes = 500 * 1024 * 1024; // 500MB default estimate
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota) quotaBytes = estimate.quota;
    } catch {
      // fallback
    }
  }

  return { usedBytes, quotaBytes, fileCount: files.length };
}

// Generate realistic PDF and document blobs for instant sample testing
function createMinimalPdfBlob(title: string, subtitle: string, bodyText: string): Blob {
  // A clean, valid minimal PDF document in raw standard PDF syntax
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 420 >>
stream
BT
/F1 22 Tf
50 720 Td
(NADA INTERNATIONAL SCHOOL) Tj
/F1 14 Tf
0 -30 Td
(COGNIA ACCREDITATION EVIDENCE DOSSIER) Tj
/F1 12 Tf
0 -24 Td
(${title}) Tj
/F1 10 Tf
0 -20 Td
(Standard / Category: ${subtitle}) Tj
0 -16 Td
(Date of Archive: ${dateStr}) Tj
0 -30 Td
(--------------------------------------------------------------------------------------------------) Tj
0 -25 Td
(DOCUMENT SUMMARY & COMPLIANCE NOTES:) Tj
0 -20 Td
(${bodyText.substring(0, 80)}) Tj
0 -16 Td
(${bodyText.substring(80, 160) || 'Verified compliant with Cognia Performance Standards.'}) Tj
0 -16 Td
(${bodyText.substring(160, 240) || 'Nada International School Accreditation Committee - All Rights Reserved.'}) Tj
0 -35 Td
(Status: OFFICIAL VERIFIED RECORD [OFFLINE CACHE]) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000716 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
795
%%EOF`;

  return new Blob([pdfString], { type: 'application/pdf' });
}

function createTextBlob(content: string, type: string = 'text/plain'): Blob {
  return new Blob([content], { type });
}

export async function seedSampleCogniaEvidence(): Promise<void> {
  const sampleFiles: FolderFile[] = [
    // Folder 1: Leadership & Shared Vision
    {
      id: 'f1_doc1',
      folderId: 1,
      name: 'NIS_Mission_Vision_Cognia_Alignment_2026.pdf',
      size: 45200,
      type: 'application/pdf',
      extension: 'pdf',
      lastModified: Date.now() - 86400000 * 5,
      uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      blob: createMinimalPdfBlob(
        'Mission and Vision Alignment',
        'Standard 1.1 - Leadership Capacity',
        'Comprehensive documentation proving stakeholder consensus on Nada International School core educational vision and Cognia values.'
      ),
      notes: 'Approved by NIS Governing Board and Academic Leadership.',
    },
    {
      id: 'f1_doc2',
      folderId: 1,
      name: 'Strategic_Goals_Executive_Summary.pdf',
      size: 38400,
      type: 'application/pdf',
      extension: 'pdf',
      lastModified: Date.now() - 86400000 * 4,
      uploadedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      blob: createMinimalPdfBlob(
        'Strategic Goals Summary 2025-2027',
        'Standard 1.1 - Strategic Priorities',
        'Target benchmarks for holistic student achievement, digital transformation, and staff retention across academic departments.'
      ),
      notes: 'Reviewed semi-annually by Academic Steering Council.',
    },

    // Folder 2: Continuous Improvement System
    {
      id: 'f2_doc1',
      folderId: 2,
      name: 'Annual_Continuous_Improvement_Cycle.pdf',
      size: 52100,
      type: 'application/pdf',
      extension: 'pdf',
      lastModified: Date.now() - 86400000 * 3,
      uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      blob: createMinimalPdfBlob(
        'Continuous Improvement Plan Framework',
        'Standard 1.2 - Improvement Cycles',
        'Systematic cyclical review integrating student performance metrics, faculty feedback loops, and external diagnostic data.'
      ),
      notes: 'Contains Plan-Do-Study-Act (PDSA) cycle logs.',
    },

    // Folder 11: Rigorous & Equitable Curriculum
    {
      id: 'f11_doc1',
      folderId: 11,
      name: 'Curriculum_Scope_Sequence_Grades_K12.pdf',
      size: 61000,
      type: 'application/pdf',
      extension: 'pdf',
      lastModified: Date.now() - 86400000 * 2,
      uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      blob: createMinimalPdfBlob(
        'K-12 Vertical Curriculum Mapping',
        'Standard 2.1 - Learning Capacity',
        'Interdisciplinary alignment across English, Mathematics, Sciences, and Humanities ensuring international benchmarking.'
      ),
      notes: 'Integrated with Cognia STEM certification guidelines.',
    },
    {
      id: 'f11_doc2',
      folderId: 11,
      name: 'Departmental_Curriculum_Audit.xlsx',
      size: 18200,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: 'xlsx',
      lastModified: Date.now() - 86400000 * 2,
      uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      blob: createTextBlob('Department,Standard,Status,Reviewer\nMath,Standard 2.1,Verified,HOD\nScience,Standard 2.1,Verified,HOD\nEnglish,Standard 2.1,Verified,HOD', 'text/csv'),
      notes: 'Spreadsheet audit of departmental curriculum pacing.',
    },

    // Folder 13: Assessment System
    {
      id: 'f13_doc1',
      folderId: 13,
      name: 'Assessment_Policy_&_Standardized_Testing_Guide.pdf',
      size: 49500,
      type: 'application/pdf',
      extension: 'pdf',
      lastModified: Date.now() - 86400000 * 1,
      uploadedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      blob: createMinimalPdfBlob(
        'Standardized Testing & Assessment Blueprint',
        'Standard 2.3 - Learning Assessment',
        'Full operational protocols for diagnostic MAP testing, mock AP examinations, and rubric-based internal assessments.'
      ),
      notes: 'Includes benchmark grading scales and moderation protocols.',
    },

    // Folder 23: Staff Recruitment & Retention
    {
      id: 'f23_doc1',
      folderId: 23,
      name: 'Faculty_Qualifications_&_Certification_Roster.pdf',
      size: 44000,
      type: 'application/pdf',
      extension: 'pdf',
      lastModified: Date.now() - 86400000 * 6,
      uploadedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      blob: createMinimalPdfBlob(
        'Faculty Credentials & Certification Matrix',
        'Standard 3.1 - Resource Capacity',
        'Verified master database of instructional staff, subject-area degrees, teacher licensing status, and Cognia training units.'
      ),
      notes: '100% compliant with Ministry and Cognia teaching qualifications.',
    },

    // Folder 25: Campus Facilities & Safety
    {
      id: 'f25_doc1',
      folderId: 25,
      name: 'Campus_Safety_Audit_&_Emergency_Evacuation_Plan.pdf',
      size: 58000,
      type: 'application/pdf',
      extension: 'pdf',
      lastModified: Date.now() - 86400000 * 7,
      uploadedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      blob: createMinimalPdfBlob(
        'Annual Campus Safety & Emergency Drills',
        'Standard 3.3 - Resource Capacity',
        'Complete facility inspection log, fire drill timestamps, assembly area mappings, and medical emergency escalation matrix.'
      ),
      notes: 'Inspected and certified by local civil defense authorities.',
    },

    // Folder 30: Cognia Self-Assessment Diagnostic
    {
      id: 'f30_doc1',
      folderId: 30,
      name: 'Cognia_Self_Assessment_Narrative_Report_2026.pdf',
      size: 92000,
      type: 'application/pdf',
      extension: 'pdf',
      lastModified: Date.now() - 86400000 * 1,
      uploadedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      blob: createMinimalPdfBlob(
        'Cognia Self-Assessment Diagnostic Comprehensive Report',
        'Exhibit 4.1 - Accreditation Portfolio',
        'Comprehensive 40-page institutional self-evaluation detailing domain ratings across Leadership, Learning, and Resource Capacity.'
      ),
      notes: 'Final draft submitted for Cognia Peer Review Team inspection.',
    },

    // Folder 31: Stakeholder Surveys
    {
      id: 'f31_doc1',
      folderId: 31,
      name: 'NIS_Cognia_Stakeholder_Survey_Summary.pdf',
      size: 41200,
      type: 'application/pdf',
      extension: 'pdf',
      lastModified: Date.now() - 86400000 * 3,
      uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      blob: createMinimalPdfBlob(
        'Tri-Stakeholder Survey Synthesis (Parents, Students, Staff)',
        'Exhibit 4.2 - Stakeholder Feedback',
        'Statistical distribution of satisfaction scores, instructional satisfaction, climate perception, and open feedback summaries.'
      ),
      notes: 'High approval ratings across school safety and academic rigor.',
    },
  ];

  await saveMultipleFiles(sampleFiles);
}
