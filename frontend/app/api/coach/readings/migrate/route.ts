/**
 * Migration API Route
 * Migriert Readings vom In-Memory Store zu Supabase
 * 
 * GET /api/coach/readings/migrate - Zeigt Migrations-Status
 * POST /api/coach/readings/migrate - Startet Migration
 */

import { NextRequest, NextResponse } from 'next/server';
import { readingsStore } from '../store';
import { checkCoachAuth } from '@/lib/coach-auth';
import { createCoachReading } from '@/lib/db/coach-readings';

export const runtime = 'nodejs';

// GET /api/coach/readings/migrate - Migrations-Status
export async function GET(request: NextRequest) {
  try {
    const { user, isCoach } = await checkCoachAuth(request);
    
    if (!user || !isCoach) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Prüfe In-Memory Store
    const storeReadings = readingsStore.filter(r => {
      // Prüfe ob Reading bereits migriert wurde (kann durch ID oder Timestamp erkannt werden)
      // Für jetzt: Alle Readings im Store als "zu migrieren" betrachten
      return true;
    });

    return NextResponse.json(
      {
        status: 'ready',
        readingsToMigrate: storeReadings.length,
        storeSize: readingsStore.length,
        message: storeReadings.length > 0 
          ? `${storeReadings.length} Readings können migriert werden`
          : 'Keine Readings zum Migrieren vorhanden',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fehler beim Abrufen des Migrations-Status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// POST /api/coach/readings/migrate - Startet Migration
export async function POST(request: NextRequest) {
  try {
    const { user, isCoach } = await checkCoachAuth(request);
    
    if (!user || !isCoach) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { dryRun = false } = body; // Trockenlauf ohne tatsächliche Migration

    const readingsToMigrate = readingsStore.filter(r => {
      // Alle Readings im Store als "zu migrieren" betrachten
      return true;
    });

    if (readingsToMigrate.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'Keine Readings zum Migrieren vorhanden',
          migrated: 0,
          failed: 0,
        },
        { status: 200 }
      );
    }

    const results = {
      migrated: 0,
      failed: 0,
      errors: [] as string[],
    };

    if (dryRun) {
      // Trockenlauf: Prüfe nur ob Migration möglich wäre
      for (const reading of readingsToMigrate) {
        try {
          // Validiere Reading-Daten
          if (!reading.reading_type || !reading.client_name || !reading.reading_data) {
            results.failed++;
            results.errors.push(`Reading ${reading.id}: Fehlende Pflichtfelder`);
            continue;
          }

          // Prüfe ob Reading bereits in Supabase existiert (optional)
          // Für jetzt: Alle Readings als "neu" betrachten
          results.migrated++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Reading ${reading.id}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
        }
      }

      return NextResponse.json(
        {
          success: true,
          dryRun: true,
          message: `Trockenlauf: ${results.migrated} Readings könnten migriert werden, ${results.failed} würden fehlschlagen`,
          ...results,
        },
        { status: 200 }
      );
    }

    // Echte Migration
    for (const reading of readingsToMigrate) {
      try {
        // Validiere Reading-Daten
        if (!reading.reading_type || !reading.client_name || !reading.reading_data) {
          results.failed++;
          results.errors.push(`Reading ${reading.id}: Fehlende Pflichtfelder`);
          continue;
        }

        // Migriere zu Supabase
        await createCoachReading(user.id, {
          reading_type: reading.reading_type,
          client_name: reading.client_name,
          reading_data: reading.reading_data,
          status: reading.status || 'pending',
        });

        results.migrated++;
        console.log(`✅ Reading ${reading.id} erfolgreich migriert`);
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
        results.errors.push(`Reading ${reading.id}: ${errorMessage}`);
        console.error(`❌ Fehler beim Migrieren von Reading ${reading.id}:`, error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Migration abgeschlossen: ${results.migrated} Readings migriert, ${results.failed} fehlgeschlagen`,
        ...results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fehler bei der Migration:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

