import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logger } from '@/lib/utils/logger';

// Runtime-Konfiguration: Node.js Runtime erzwingen (nicht Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    logger.info('🔍 /api/users/discover - Start');
    const supabase = createClient();
    
    // Prüfe Supabase-Client
    if (!supabase) {
      logger.error('❌ Supabase Client konnte nicht erstellt werden');
      return NextResponse.json({ 
        error: 'Supabase Client Error',
        debug: 'Supabase Client ist null'
      }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      logger.error('❌ Unauthorized access to /api/users/discover', {
        userError: userError?.message,
        hasUser: !!user
      });
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: userError?.message || 'No user found'
      }, { status: 401 });
    }

    logger.info(`✅ User authentifiziert: ${user.id}`);
    // Lade bereits gelikte/gepasste User
    const { data: existingFriends, error: friendsError } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id);

    if (friendsError) {
      logger.warn('⚠️ Fehler beim Laden der Friendships (kann ignoriert werden):', friendsError.message);
    }

    const excludedIds = existingFriends?.map(f => f.friend_id) || [];
    excludedIds.push(user.id); // Exclude current user
    
    logger.info(`📋 Excluded IDs: ${excludedIds.length} (inkl. eigener User)`);

    // Versuche zuerst matching_profiles, dann profiles, dann friends
    let profiles: any[] | null = null;
    let profilesError: any = null;

    // 1. Versuche matching_profiles (Dating-Profile)
    logger.info('🔍 Versuche matching_profiles...');
    const { data: matchingProfiles, error: matchingError } = await supabase
      .from('matching_profiles')
      .select('*')
      .eq('is_active', true)
      .limit(100);

    if (matchingError) {
      logger.warn('⚠️ Fehler bei matching_profiles:', {
        code: matchingError.code,
        message: matchingError.message,
        details: matchingError.details
      });
    }

    if (matchingProfiles && matchingProfiles.length > 0) {
      logger.info(`📊 Gefunden: ${matchingProfiles.length} matching_profiles (vor Filterung)`);
      // Filtere ausgeschlossene IDs
      profiles = matchingProfiles.filter(p => !excludedIds.includes(p.user_id));
      logger.info(`✅ ${profiles.length} profiles von matching_profiles (nach Filterung)`);
    } else {
      logger.info('ℹ️ Keine matching_profiles gefunden oder Tabelle existiert nicht');
    }

    // 2. Falls keine matching_profiles, versuche profiles
    if (!profiles || profiles.length === 0) {
      logger.info('🔍 Versuche profiles...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(100);

      if (profileError) {
        logger.warn('⚠️ Fehler bei profiles:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details
        });
        profilesError = profileError;
      }

      if (profileData && profileData.length > 0) {
        logger.info(`📊 Gefunden: ${profileData.length} profiles (vor Filterung)`);
        // Filtere ausgeschlossene IDs
        profiles = profileData.filter(p => !excludedIds.includes(p.user_id));
        logger.info(`✅ ${profiles.length} profiles von profiles (nach Filterung)`);
      } else {
        logger.info('ℹ️ Keine profiles gefunden oder Tabelle existiert nicht');
      }
    }

    // 3. Falls immer noch keine Profile, versuche friends
    if (!profiles || profiles.length === 0) {
      logger.info('🔍 Versuche friends...');
      const { data: friendsData, error: friendsDataError } = await supabase
        .from('friends')
        .select('*')
        .limit(100);

      if (friendsDataError) {
        logger.warn('⚠️ Fehler bei friends:', {
          code: friendsDataError.code,
          message: friendsDataError.message,
          details: friendsDataError.details
        });
        profilesError = friendsDataError;
      }

      if (friendsData && friendsData.length > 0) {
        logger.info(`📊 Gefunden: ${friendsData.length} friends (vor Filterung)`);
        // Filtere ausgeschlossene IDs
        profiles = friendsData.filter(p => !excludedIds.includes(p.user_id));
        logger.info(`✅ ${profiles.length} profiles von friends (nach Filterung)`);
      } else {
        logger.info('ℹ️ Keine friends gefunden oder Tabelle existiert nicht');
      }
    }

    // Wenn immer noch keine Profile existieren
    if (!profiles || profiles.length === 0) {
      logger.warn('❌ Keine Profile in keiner Tabelle gefunden (matching_profiles, profiles, friends)');
      return NextResponse.json({
        success: true,
        users: [],
        count: 0,
        message: 'Keine User gefunden. Bitte erstelle zuerst User-Profile in Supabase.',
        debug: {
          checkedTables: ['matching_profiles', 'profiles', 'friends'],
          excludedIdsCount: excludedIds.length,
          errors: profilesError ? {
            code: profilesError.code,
            message: profilesError.message
          } : null
        }
      });
    }

    // Wenn es einen kritischen Fehler gab (nicht nur "no rows")
    if (profilesError && profilesError.code !== 'PGRST116') {
      logger.error('Error fetching profiles:', profilesError);
      // Weiter mit den gefundenen Profilen, aber logge den Fehler
    }

    // Limitiere auf 50 Profile für Swipe
    const limitedProfiles = profiles.slice(0, 50);

    // Formatiere Profile für Swipe-Interface (unterstützt verschiedene Tabellen-Strukturen)
    const enrichedUsers = limitedProfiles.map(profile => {
      // Unterstütze verschiedene Feldnamen je nach Tabelle
      const firstName = profile.first_name || '';
      const lastName = profile.last_name || '';
      const fullName = profile.name || `${firstName} ${lastName}`.trim() || 'Unbekannt';
      
      return {
        id: profile.id,
        user_id: profile.user_id,
        name: fullName,
        age: profile.age || null,
        location: profile.location || profile.birth_place || null,
        bio: profile.bio || null,
        hd_type: profile.hd_type || profile.hdType || null,
        profile: profile.hd_profile || profile.hdProfile || profile.profile || null,
        authority: profile.hd_authority || profile.hdAuthority || profile.authority || null,
        strategy: profile.hd_strategy || profile.hdStrategy || profile.strategy || null,
        image: profile.avatar || profile.image || '/dating/default.jpg',
        interests: Array.isArray(profile.interests) ? profile.interests : (profile.interests ? [profile.interests] : []),
        compatibility_score: calculateCompatibility(user.id, profile.user_id),
        created_at: profile.created_at
      };
    });

    logger.info(`Loaded ${enrichedUsers.length} users for discovery`);

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      count: enrichedUsers.length
    });

  } catch (error) {
    logger.error('Failed to load users for discovery:', error);
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

// Einfache Kompatibilitäts-Berechnung (kann später erweitert werden)
function calculateCompatibility(userId1: string, userId2: string): number {
  // TODO [WICHTIG]: Implementiere echte HD-Kompatibilitäts-Logik
  // Für jetzt: Zufälliger Score zwischen 60-100
  // Priorität: Mittel - Feature-Verbesserung
  return Math.floor(Math.random() * 40) + 60;
}

