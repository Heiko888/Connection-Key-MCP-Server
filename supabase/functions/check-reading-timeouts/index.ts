/**
 * Supabase Edge Function: Check Reading Timeouts
 * 
 * CORRECTION: Uses Supabase Edge Function instead of pg_cron
 * Schedule: Every 30 seconds via Supabase Dashboard Cron Trigger
 * 
 * Calls RPC: check_reading_timeouts()
 */

import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Call RPC function
    const { data, error } = await supabase.rpc('check_reading_timeouts');
    
    if (error) {
      console.error('RPC Error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = data && data.length > 0 ? data[0] : { updated_count: 0, updated_jobs: [] };

    return new Response(
      JSON.stringify({ 
        success: true,
        updatedCount: result.updated_count || 0,
        updatedJobs: result.updated_jobs || [],
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Function Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
});
