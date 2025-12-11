/**
 * Knowledge File Upload Endpoint
 * Route: /api/admin/upload-knowledge
 * 
 * Spezialisiert für Reading Agent Knowledge-Dateien
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.API_KEY;
const KNOWLEDGE_PATH = process.env.KNOWLEDGE_PATH || '/opt/mcp-connection-key/production/knowledge';
const READING_AGENT_URL = process.env.READING_AGENT_URL || 'http://138.199.237.34:4001';

export async function POST(request: NextRequest) {
  try {
    // API-Key prüfen
    if (ADMIN_API_KEY) {
      const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
      if (apiKey !== ADMIN_API_KEY) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subfolder = (formData.get('subfolder') as string) || '';
    const reloadKnowledge = formData.get('reload') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Prüfe Dateityp
    const allowedExtensions = ['.txt', '.md'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { success: false, error: `File must be .txt or .md, got ${fileExtension}` },
        { status: 400 }
      );
    }

    // Datei lesen
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload-Pfad
    const uploadPath = subfolder 
      ? join(KNOWLEDGE_PATH, subfolder)
      : KNOWLEDGE_PATH;

    // Verzeichnis erstellen
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }

    // Datei speichern
    const filePath = join(uploadPath, file.name);
    await writeFile(filePath, fileBuffer);

    // Optional: Knowledge neu laden
    let reloadResponse = null;
    if (reloadKnowledge) {
      try {
        const agentSecret = process.env.AGENT_SECRET || '';
        const reloadRes = await fetch(`${READING_AGENT_URL}/admin/reload-knowledge`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ secret: agentSecret })
        });
        
        if (reloadRes.ok) {
          reloadResponse = await reloadRes.json();
        }
      } catch (error) {
        console.warn('Knowledge reload failed:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Knowledge file uploaded successfully',
      file: {
        name: file.name,
        size: file.size,
        path: filePath.replace(process.cwd(), ''),
        subfolder: subfolder || 'root'
      },
      reload: reloadKnowledge ? (reloadResponse ? 'success' : 'failed') : 'skipped',
      nextSteps: reloadKnowledge 
        ? ['Knowledge reloaded automatically']
        : [`Reload knowledge: POST ${READING_AGENT_URL}/admin/reload-knowledge`],
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Knowledge Upload Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Upload failed'
      },
      { status: 500 }
    );
  }
}

