/**
 * Admin Upload Endpoint
 * Route: /api/admin/upload
 * 
 * Unterstützt:
 * - n8n Workflows (.json)
 * - Knowledge-Dateien (.txt, .md)
 * - Beliebige Dateien
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Upload-Typen
type UploadType = 'workflow' | 'knowledge' | 'file';

// API-Key prüfen (optional, für Sicherheit)
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.API_KEY;

export async function POST(request: NextRequest) {
  try {
    // API-Key prüfen (falls gesetzt)
    if (ADMIN_API_KEY) {
      const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
      if (apiKey !== ADMIN_API_KEY) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - Invalid API Key' },
          { status: 401 }
        );
      }
    }

    // FormData parsen
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = (formData.get('type') as UploadType) || 'file';
    const subfolder = formData.get('subfolder') as string || '';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Datei-Informationen
    const fileName = file.name;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload-Pfad bestimmen
    let uploadPath: string;
    const basePath = process.cwd();

    switch (uploadType) {
      case 'workflow':
        // n8n Workflows
        uploadPath = join(basePath, 'n8n-workflows', subfolder);
        break;
      
      case 'knowledge':
        // Knowledge-Dateien (für Reading Agent)
        uploadPath = join(basePath, 'production', 'knowledge', subfolder);
        break;
      
      case 'file':
      default:
        // Generischer Upload
        uploadPath = join(basePath, 'uploads', subfolder);
        break;
    }

    // Verzeichnis erstellen falls nicht vorhanden
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }

    // Datei speichern
    const filePath = join(uploadPath, fileName);
    await writeFile(filePath, fileBuffer);

    // Erfolgreiche Antwort
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        name: fileName,
        size: file.size,
        type: file.type,
        path: filePath.replace(basePath, ''),
        uploadType: uploadType
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Upload failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// GET: Upload-Info
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Upload endpoint available',
    supportedTypes: ['workflow', 'knowledge', 'file'],
    maxFileSize: '10MB',
    usage: {
      workflow: 'POST /api/admin/upload?type=workflow - Upload n8n workflow JSON',
      knowledge: 'POST /api/admin/upload?type=knowledge - Upload knowledge file (.txt, .md)',
      file: 'POST /api/admin/upload?type=file - Upload any file'
    }
  });
}

