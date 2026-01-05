// WICHTIG: Dieses File sollte nur auf der Server-Seite verwendet werden
// Für Client-Seite verwende '@/utils/supabase/client' direkt

import { createClient as createBrowserClient } from '../../utils/supabase/client';

// Helper function um zu prüfen, ob wir im Browser oder Server sind
function createSupabaseClientInstance() {
  // Im Browser: Verwende Browser-Client
  if (typeof window !== 'undefined') {
    return createBrowserClient();
  }
  
  // Im Server: Erstelle einen einfachen Client ohne Cookie-Management
  // Dies ist ein Fallback für Server-Side-Rendering
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Verwende Publishable Key (neues Supabase-Key-Modell)
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Y-pGGWYrMl_Uhl52hTAxCw_bVU0EFTb';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set (server-side).');
  }
  
  const { createClient: createSimpleClient } = require('@supabase/supabase-js');
  return createSimpleClient(supabaseUrl, supabaseKey);
}

// Singleton Supabase Client für Services (lazy initialization)
let supabaseInstance: ReturnType<typeof createSupabaseClientInstance> | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClientInstance();
  }
  return supabaseInstance;
}

// Export für Services (lazy getter - wird erst beim ersten Zugriff erstellt)
const supabase = new Proxy({} as ReturnType<typeof createSupabaseClientInstance>, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createSupabaseClientInstance>];
  }
});

// Types
export interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  hd_type?: string;
  profile?: string;
  authority?: string;
  strategy?: string;
  incarnation_cross?: string;
  centers?: any;
  channels?: any;
  gates?: any;
  planets?: any;
  subscription_package?: string;
  is_active: boolean;
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chart {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  hd_type?: string;
  profile?: string;
  authority?: string;
  strategy?: string;
  incarnation_cross?: string;
  centers?: any;
  channels?: any;
  gates?: any;
  planets?: any;
  calculation_method?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatchingProfile {
  id: string;
  user_id: string;
  name: string;
  age?: number;
  location?: string;
  bio?: string;
  hd_type?: string;
  profile?: string;
  authority?: string;
  strategy?: string;
  centers?: any;
  channels?: any;
  gates?: any;
  planets?: any;
  interests?: string[];
  images?: string[];
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MoonTracking {
  id: string;
  user_id: string;
  date: string;
  moon_phase?: string;
  mood?: number;
  energy?: number;
  sleep_hours?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Profile Service
export class ProfileService {
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  static async createProfile(profileData: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    return data;
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  }
}

// Chart Service
export class ChartService {
  static async getCharts(userId: string): Promise<Chart[]> {
    const { data, error } = await supabase
      .from('charts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching charts:', error);
      return [];
    }

    return data || [];
  }

  static async createChart(chartData: Partial<Chart>): Promise<Chart | null> {
    const { data, error } = await supabase
      .from('charts')
      .insert(chartData)
      .select()
      .single();

    if (error) {
      console.error('Error creating chart:', error);
      return null;
    }

    return data;
  }

  static async updateChart(chartId: string, updates: Partial<Chart>): Promise<Chart | null> {
    const { data, error } = await supabase
      .from('charts')
      .update(updates)
      .eq('id', chartId)
      .select()
      .single();

    if (error) {
      console.error('Error updating chart:', error);
      return null;
    }

    return data;
  }

  static async deleteChart(chartId: string): Promise<boolean> {
    const { error } = await supabase
      .from('charts')
      .delete()
      .eq('id', chartId);

    if (error) {
      console.error('Error deleting chart:', error);
      return false;
    }

    return true;
  }
}

// Matching Service
export class MatchingService {
  static async getMatchingProfiles(userId: string, limit: number = 20, offset: number = 0): Promise<MatchingProfile[]> {
    const { data, error } = await supabase
      .from('matching_profiles')
      .select('*')
      .eq('is_active', true)
      .neq('user_id', userId) // Exclude own profile
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching matching profiles:', error);
      return [];
    }

    return data || [];
  }

  static async createMatchingProfile(profileData: Partial<MatchingProfile>): Promise<MatchingProfile | null> {
    const { data, error } = await supabase
      .from('matching_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating matching profile:', error);
      return null;
    }

    return data;
  }

  static async swipeUser(userId: string, targetId: string, liked: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('swipes')
      .upsert({
        user_id: userId,
        target_id: targetId,
        liked: liked
      });

    if (error) {
      console.error('Error processing swipe:', error);
      return false;
    }

    return true;
  }

  static async getMatches(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user1:profiles!matches_user1_id_fkey(*),
        user2:profiles!matches_user2_id_fkey(*)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching matches:', error);
      return [];
    }

    return data || [];
  }
}

// Admin Service
export class AdminService {
  static async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.is_admin === true;
  }

  static async setAdmin(userId: string, isAdmin: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('user_id', userId);

    if (error) {
      console.error('Error setting admin status:', error);
      return false;
    }

    return true;
  }

  static async setCoach(userId: string, isCoach: boolean): Promise<boolean> {
    const updateData: any = { is_coach: isCoach };
    if (isCoach) {
      updateData.role = 'coach';
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId);

    if (error) {
      console.error('Error setting coach status:', error);
      return false;
    }

    // Optional: Auch User-Metadaten aktualisieren (benötigt Secret Key)
    try {
      const secretKey = process.env.SUPABASE_SECRET_KEY;
      if (!secretKey) {
        console.warn('SUPABASE_SECRET_KEY nicht gesetzt - Metadaten-Update übersprungen');
        return true;
      }
      
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        console.warn('NEXT_PUBLIC_SUPABASE_URL nicht gesetzt - Metadaten-Update übersprungen');
        return true;
      }
      
      const adminClient = createSupabaseClient(supabaseUrl, secretKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      const { data: { user } } = await adminClient.auth.admin.getUserById(userId);
      if (user) {
        await adminClient.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...user.user_metadata,
            role: isCoach ? 'coach' : null
          }
        });
      }
    } catch (metaError) {
      // Metadaten-Update ist optional, Fehler ignorieren
      console.warn('Could not update user metadata:', metaError);
    }

    return true;
  }

  static async getAllUsers(limit: number = 50, offset: number = 0): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }

    return data || [];
  }

  static async getUserStats(): Promise<any> {
    const { data: totalUsers, error: totalError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    const { data: activeUsers, error: activeError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('is_admin', true);

    if (totalError || activeError || adminError) {
      console.error('Error fetching user stats:', { totalError, activeError, adminError });
      return null;
    }

    return {
      totalUsers: totalUsers?.length || 0,
      activeUsers: activeUsers?.length || 0,
      adminUsers: adminUsers?.length || 0
    };
  }

  static async getSubscriptionStats(): Promise<any> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('package_id');

    if (error) {
      console.error('Error fetching subscription stats:', error);
      return null;
    }

    const stats = {
      free: 0,
      basic: 0,
      premium: 0,
      vip: 0,
      admin: 0
    };

    data?.forEach((sub: { package_id: string }) => {
      if (stats.hasOwnProperty(sub.package_id)) {
        stats[sub.package_id as keyof typeof stats]++;
      }
    });

    return stats;
  }
}

// Moon Tracking Service
export class MoonTrackingService {
  static async getMoonTracking(userId: string, startDate?: string, endDate?: string): Promise<MoonTracking[]> {
    let query = supabase
      .from('moon_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching moon tracking:', error);
      return [];
    }

    return data || [];
  }

  static async addMoonTracking(trackingData: Partial<MoonTracking>): Promise<MoonTracking | null> {
    const { data, error } = await supabase
      .from('moon_tracking')
      .insert(trackingData)
      .select()
      .single();

    if (error) {
      console.error('Error adding moon tracking:', error);
      return null;
    }

    return data;
  }

  static async updateMoonTracking(trackingId: string, updates: Partial<MoonTracking>): Promise<MoonTracking | null> {
    const { data, error } = await supabase
      .from('moon_tracking')
      .update(updates)
      .eq('id', trackingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating moon tracking:', error);
      return null;
    }

    return data;
  }

  static async deleteMoonTracking(trackingId: string): Promise<boolean> {
    const { error } = await supabase
      .from('moon_tracking')
      .delete()
      .eq('id', trackingId);

    if (error) {
      console.error('Error deleting moon tracking:', error);
      return false;
    }

    return true;
  }
}

// Chat Service
export class ChatService {
  static async getConversations(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey(*),
        receiver:profiles!chat_messages_receiver_id_fkey(*)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return data || [];
  }

  static async getMessages(conversationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey(*)
      `)
      .or(`sender_id.eq.${conversationId},receiver_id.eq.${conversationId}`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  }

  static async sendMessage(messageData: {
    sender_id: string;
    receiver_id: string;
    content: string;
    message_type?: string;
  }): Promise<any | null> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data;
  }

  static async markAsRead(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
      return false;
    }

    return true;
  }
}

// Subscription Service
export class SubscriptionService {
  static async getSubscription(userId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data;
  }

  static async updateSubscription(userId: string, packageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        package_id: packageId,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 Jahr
      });

    if (error) {
      console.error('Error updating subscription:', error);
      return false;
    }

    return true;
  }

  static async setVIP(userId: string): Promise<boolean> {
    return this.updateSubscription(userId, 'vip');
  }

  static async setPremium(userId: string): Promise<boolean> {
    return this.updateSubscription(userId, 'premium');
  }

  static async setBasic(userId: string): Promise<boolean> {
    return this.updateSubscription(userId, 'basic');
  }

  static async setFree(userId: string): Promise<boolean> {
    return this.updateSubscription(userId, 'free');
  }

  static async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single();

    if (error) {
      console.error('Error fetching subscription by Stripe ID:', error);
      return null;
    }

    return data;
  }

  static async updateSubscriptionByStripeId(stripeSubscriptionId: string, updates: any): Promise<boolean> {
    const { error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (error) {
      console.error('Error updating subscription by Stripe ID:', error);
      return false;
    }

    return true;
  }
}

// Community Service
export class CommunityService {
  static async getPosts(limit: number = 20, offset: number = 0): Promise<any[]> {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        author:profiles!community_posts_user_id_fkey(*)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    return data || [];
  }

  static async createPost(postData: {
    user_id: string;
    title: string;
    content: string;
    category?: string;
    tags?: string[];
  }): Promise<any | null> {
    const { data, error } = await supabase
      .from('community_posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return null;
    }

    return data;
  }

  static async likePost(postId: string): Promise<boolean> {
    // Zuerst aktuellen likes_count abrufen
    const { data: post, error: fetchError } = await supabase
      .from('community_posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error('Error fetching post:', fetchError);
      return false;
    }

    // Dann likes_count um 1 erhöhen
    const { error } = await supabase
      .from('community_posts')
      .update({ likes_count: (post.likes_count || 0) + 1 })
      .eq('id', postId);

    if (error) {
      console.error('Error liking post:', error);
      return false;
    }

    return true;
  }
}
