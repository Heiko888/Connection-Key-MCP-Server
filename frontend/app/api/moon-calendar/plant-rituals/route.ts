import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.apiCall('/api/moon-calendar/plant-rituals', 'GET');

    // Mock-Pflanzen-Rituale
    const rituals = [
      {
        id: 'ritual-1',
        name: 'Neumond-Säen',
        description: 'Säen Sie Samen bei Neumond für starkes Wurzelwachstum und tiefe Verbindung zur Erde.',
        phase: 'new_moon',
        plants: ['Basilikum', 'Koriander', 'Petersilie', 'Dill'],
        steps: [
          'Bereiten Sie die Erde vor',
          'Säen Sie die Samen bei Sonnenuntergang',
          'Sprechen Sie Ihre Absicht aus',
          'Gießen Sie mit Mondwasser'
        ],
        benefits: [
          'Starkes Wurzelwachstum',
          'Tiefe Verbindung zur Erde',
          'Intensive Aromen',
          'Längere Haltbarkeit'
        ],
        difficulty: 'beginner'
      },
      {
        id: 'ritual-2',
        name: 'Vollmond-Ernte',
        description: 'Ernten Sie Kräuter bei Vollmond für maximale Wirkung und energetische Kraft.',
        phase: 'full_moon',
        plants: ['Lavendel', 'Rosmarin', 'Thymian', 'Salbei'],
        steps: [
          'Warten Sie bis nach Sonnenuntergang',
          'Ernten Sie bei trockenem Wetter',
          'Verwenden Sie eine goldene Schere',
          'Lagern Sie in dunklen Gläsern'
        ],
        benefits: [
          'Maximale ätherische Öle',
          'Längere Haltbarkeit',
          'Stärkere Heilwirkung',
          'Energetische Reinigung'
        ],
        difficulty: 'intermediate'
      },
      {
        id: 'ritual-3',
        name: 'Abnehmender Mond - Trocknen',
        description: 'Trocknen Sie Kräuter bei abnehmendem Mond für optimale Konservierung.',
        phase: 'waning_moon',
        plants: ['Minze', 'Zitronenmelisse', 'Kamille', 'Ringelblume'],
        steps: [
          'Binden Sie die Kräuter zu Bündeln',
          'Hängen Sie sie kopfüber auf',
          'Wählen Sie einen dunklen, trockenen Ort',
          'Warten Sie bis zum nächsten Neumond'
        ],
        benefits: [
          'Optimale Konservierung',
          'Erhaltung der Wirkstoffe',
          'Längere Lagerzeit',
          'Intensivere Aromen'
        ],
        difficulty: 'beginner'
      },
      {
        id: 'ritual-4',
        name: 'Mondwasser-Herstellung',
        description: 'Stellen Sie Mondwasser her, um die Energie des Mondes zu nutzen.',
        phase: 'all',
        plants: ['Rosenblüten', 'Lavendel', 'Kamille'],
        steps: [
          'Füllen Sie ein Glas mit Quellwasser',
          'Fügen Sie die Kräuter hinzu',
          'Stellen Sie es bei Mondlicht auf',
          'Lassen Sie es über Nacht stehen'
        ],
        benefits: [
          'Energetische Reinigung',
          'Hautpflege',
          'Spirituelle Verbindung',
          'Heilende Wirkung'
        ],
        difficulty: 'beginner'
      }
    ];

    logger.info('Plant rituals fetched successfully', { count: rituals.length });

    return NextResponse.json({
      success: true,
      rituals,
      total: rituals.length
    });

  } catch (error) {
    logger.error('Failed to fetch plant rituals', error);
    return NextResponse.json(
      { error: 'Failed to fetch plant rituals' },
      { status: 500 }
    );
  }
}
