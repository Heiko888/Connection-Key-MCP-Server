import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.apiCall('/api/moon-calendar/stories', 'GET');

    // Mock-Mond-Geschichten
    const stories = [
      {
        id: 'story-1',
        title: 'Der Neumond und neue Anfänge',
        content: 'Der Neumond ist eine Zeit der Stille und des Neubeginns. Wie ein Samen, der in der Dunkelheit der Erde keimt, so entstehen auch unsere Träume und Absichten in der Stille des Neumonds.',
        phase: 'new_moon',
        category: 'spiritual',
        author: 'Luna',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'story-2',
        title: 'Vollmond-Magie',
        content: 'Wenn der Vollmond am Himmel steht, ist die Energie auf ihrem Höhepunkt. Es ist die Zeit, um zu feiern, was wir erreicht haben, und um Klarheit über unsere nächsten Schritte zu gewinnen.',
        phase: 'full_moon',
        category: 'magical',
        author: 'Selene',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'story-3',
        title: 'Der abnehmende Mond und Loslassen',
        content: 'Der abnehmende Mond lehrt uns die Kunst des Loslassens. Wie die Blätter im Herbst fallen, so können auch wir das loslassen, was uns nicht mehr dient.',
        phase: 'waning_moon',
        category: 'healing',
        author: 'Artemis',
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'story-4',
        title: 'Mondzyklen und weibliche Weisheit',
        content: 'Seit jeher haben Frauen die Mondzyklen beobachtet und ihre Weisheit genutzt. Diese uralte Verbindung zwischen Mond und weiblicher Energie ist ein Geschenk, das wir heute noch nutzen können.',
        phase: 'all',
        category: 'wisdom',
        author: 'Diana',
        publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    logger.info('Moon stories fetched successfully', { count: stories.length });

    return NextResponse.json({
      success: true,
      stories,
      total: stories.length
    });

  } catch (error) {
    logger.error('Failed to fetch moon stories', error);
    return NextResponse.json(
      { error: 'Failed to fetch moon stories' },
      { status: 500 }
    );
  }
}
