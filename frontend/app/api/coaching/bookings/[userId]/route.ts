import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Runtime-Konfiguration: Node.js Runtime erzwingen (nicht Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/coaching/bookings/[userId] - Alle Buchungen eines Users abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prüfe ob User eigene Buchungen abruft oder Admin ist
    if (user.id !== params.userId) {
      // TODO: Admin-Check implementieren
      // const isAdmin = await checkAdminStatus(user.id);
      // if (!isAdmin) {
      //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      // }
    }

    // Versuche Buchungen aus Supabase zu laden
    // Falls Tabelle nicht existiert, verwende localStorage-Fallback im Frontend
    const { data: bookings, error: bookingsError } = await supabase
      .from('coaching_bookings')
      .select(`
        *,
        coach:coaches (
          id,
          name,
          avatar,
          title
        )
      `)
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      // Wenn Tabelle nicht existiert, gib leeres Array zurück
      // Frontend wird dann localStorage verwenden
      console.log('Coaching bookings table not found, using localStorage fallback');
      return NextResponse.json({
        success: true,
        bookings: []
      });
    }

    // Transformiere Daten für Frontend
    const transformedBookings = bookings?.map((booking: any) => ({
      id: booking.id,
      coachId: booking.coach_id,
      coach: booking.coach ? {
        id: booking.coach.id,
        name: booking.coach.name,
        avatar: booking.coach.avatar,
        title: booking.coach.title
      } : null,
      date: booking.date,
      time: booking.time,
      sessionType: booking.session_type,
      duration: booking.duration,
      price: booking.price,
      status: booking.status || 'pending',
      paymentStatus: booking.payment_status || 'pending',
      meetingLink: booking.meeting_link,
      notes: booking.notes,
      pdfUrl: booking.pdf_url,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at
    })) || [];

    return NextResponse.json({
      success: true,
      bookings: transformedBookings
    });

  } catch (error) {
    console.error('Fehler beim Abrufen der Buchungen:', error);
    const errorMessage = error instanceof Error ? error.message : 'Interner Serverfehler';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

