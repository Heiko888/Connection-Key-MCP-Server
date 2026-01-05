import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { getReadingJobById } from '@/lib/db/reading-jobs';
import { getCoachReadingById } from '@/lib/db/coach-readings';

export const runtime = 'nodejs';

type JobStatusResponse =
  | {
      success: true;
      job: {
        id: string;
        status: 'pending' | 'running' | 'completed' | 'failed';
        progress: number | null;
        error: string | null;
        createdAt: string;
        updatedAt: string;
      };
    }
  | { success: false; error: string };

/**
 * Status-API für Reading-Jobs
 * 
 * Gibt den aktuellen Status eines Jobs zurück.
 * Frontend pollt diese Route alle 3-5s.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json<JobStatusResponse>(
        { success: false, error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const jobId = params.jobId;
    if (!jobId) {
      return NextResponse.json<JobStatusResponse>(
        { success: false, error: 'Job-ID fehlt' },
        { status: 400 }
      );
    }

    // Job laden
    const job = await getReadingJobById(jobId);
    if (!job) {
      return NextResponse.json<JobStatusResponse>(
        { success: false, error: 'Job nicht gefunden' },
        { status: 404 }
      );
    }

    // Ownership prüfen (über Reading)
    const reading = await getCoachReadingById(user.id, job.reading_id);
    if (!reading) {
      return NextResponse.json<JobStatusResponse>(
        { success: false, error: 'Kein Zugriff auf diesen Job' },
        { status: 403 }
      );
    }

    // Response
    return NextResponse.json<JobStatusResponse>({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        error: job.error,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Fehler beim Laden des Job-Status:', error);
    return NextResponse.json<JobStatusResponse>(
      {
        success: false,
        error: error?.message || 'Unbekannter Serverfehler',
      },
      { status: 500 }
    );
  }
}

