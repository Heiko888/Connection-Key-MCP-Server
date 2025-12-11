/**
 * n8n Workflow Upload Endpoint
 * Route: /api/admin/upload-workflow
 * 
 * Spezialisiert für n8n Workflow-Uploads
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.API_KEY;
const N8N_WORKFLOWS_PATH = process.env.N8N_WORKFLOWS_PATH || '/opt/mcp-connection-key/n8n-workflows';

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
    const workflowName = formData.get('name') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Prüfe ob JSON
    if (!file.name.endsWith('.json')) {
      return NextResponse.json(
        { success: false, error: 'File must be a JSON file' },
        { status: 400 }
      );
    }

    // Datei lesen
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileContent = fileBuffer.toString('utf8');

    // JSON validieren
    try {
      JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON file' },
        { status: 400 }
      );
    }

    // Dateiname bestimmen
    const fileName = workflowName 
      ? `${workflowName.replace(/[^a-zA-Z0-9-_]/g, '-')}.json`
      : file.name;

    // Verzeichnis erstellen
    if (!existsSync(N8N_WORKFLOWS_PATH)) {
      await mkdir(N8N_WORKFLOWS_PATH, { recursive: true });
    }

    // Datei speichern
    const filePath = join(N8N_WORKFLOWS_PATH, fileName);
    await writeFile(filePath, fileBuffer);

    return NextResponse.json({
      success: true,
      message: 'Workflow uploaded successfully',
      workflow: {
        name: fileName,
        path: filePath,
        size: file.size
      },
      nextSteps: [
        'Import workflow in n8n: https://n8n.werdemeisterdeinergedankenagent.de',
        'Or use n8n API to import automatically'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Workflow Upload Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Upload failed'
      },
      { status: 500 }
    );
  }
}

