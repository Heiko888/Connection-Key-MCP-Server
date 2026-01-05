import { supabase as supabaseClient } from '@/lib/supabase/client';

export interface ReferralCode {
  code: string;
  userId: string;
  uses: number;
  maxUses?: number;
  reward: number;
  expiresAt?: Date;
}

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalRewards: number;
  conversionRate: number;
}

export class ReferralSystem {
  private supabase = supabaseClient;

  /**
   * Generate a unique referral code for a user
   */
  async generateReferralCode(userId: string): Promise<string> {
    try {
      // Check if user already has a code
      const { data: existing } = await this.supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', userId)
        .single();

      if (existing) {
        return existing.code;
      }

      // Generate new code
      const code = this.createUniqueCode();

      const { error } = await this.supabase
        .from('referral_codes')
        .insert({
          user_id: userId,
          code,
          uses: 0,
          reward: 10, // 10% discount or credits
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      return code;
    } catch (error) {
      console.error('Error generating referral code:', error);
      throw error;
    }
  }

  /**
   * Validate and use a referral code
   */
  async useReferralCode(code: string, newUserId: string): Promise<boolean> {
    try {
      // Get referral code
      const { data: referralCode, error } = await this.supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !referralCode) {
        return false;
      }

      // Check if expired
      if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
        return false;
      }

      // Check max uses
      if (referralCode.max_uses && referralCode.uses >= referralCode.max_uses) {
        return false;
      }

      // Check if user already used this code
      const { data: existing } = await this.supabase
        .from('referral_uses')
        .select('id')
        .eq('referral_code_id', referralCode.id)
        .eq('referred_user_id', newUserId)
        .single();

      if (existing) {
        return false; // Already used
      }

      // Record referral use
      const { error: useError } = await this.supabase
        .from('referral_uses')
        .insert({
          referral_code_id: referralCode.id,
          referrer_user_id: referralCode.user_id,
          referred_user_id: newUserId,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (useError) throw useError;

      // Update uses count
      await this.supabase
        .from('referral_codes')
        .update({ uses: referralCode.uses + 1 })
        .eq('id', referralCode.id);

      return true;
    } catch (error) {
      console.error('Error using referral code:', error);
      return false;
    }
  }

  /**
   * Mark referral as successful (e.g., after payment)
   */
  async markReferralSuccess(newUserId: string): Promise<void> {
    try {
      // Find pending referral
      const { data: referralUse } = await this.supabase
        .from('referral_uses')
        .select('*, referral_codes(reward)')
        .eq('referred_user_id', newUserId)
        .eq('status', 'pending')
        .single();

      if (!referralUse) return;

      // Update status
      await this.supabase
        .from('referral_uses')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', referralUse.id);

      // Award reward to referrer
      await this.awardReferralReward(
        referralUse.referrer_user_id,
        referralUse.referral_codes.reward
      );

      // Award reward to new user
      await this.awardWelcomeReward(newUserId);

    } catch (error) {
      console.error('Error marking referral success:', error);
    }
  }

  /**
   * Get referral statistics for a user
   */
  async getReferralStats(userId: string): Promise<ReferralStats> {
    try {
      const { data: uses } = await this.supabase
        .from('referral_uses')
        .select('status')
        .eq('referrer_user_id', userId);

      const totalReferrals = uses?.length || 0;
      const successfulReferrals = uses?.filter(u => u.status === 'completed').length || 0;
      const totalRewards = successfulReferrals * 10; // 10 credits per referral

      return {
        totalReferrals,
        successfulReferrals,
        totalRewards,
        conversionRate: totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        totalReferrals: 0,
        successfulReferrals: 0,
        totalRewards: 0,
        conversionRate: 0
      };
    }
  }

  /**
   * Get referral leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const { data } = await this.supabase
        .from('referral_uses')
        .select(`
          referrer_user_id,
          profiles!referrer_user_id(name),
          count
        `)
        .eq('status', 'completed')
        .order('count', { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  /**
   * Private: Create unique code
   */
  private createUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Private: Award reward to referrer
   */
  private async awardReferralReward(userId: string, amount: number): Promise<void> {
    try {
      // Add credits to user account
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (profile) {
        await this.supabase
          .from('profiles')
          .update({ 
            credits: (profile.credits || 0) + amount 
          })
          .eq('id', userId);

        // Log transaction
        await this.supabase
          .from('credit_transactions')
          .insert({
            user_id: userId,
            amount,
            type: 'referral_reward',
            description: `Referral reward: ${amount} credits`,
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error awarding referral reward:', error);
    }
  }

  /**
   * Private: Award welcome reward to new user
   */
  private async awardWelcomeReward(userId: string): Promise<void> {
    try {
      const welcomeAmount = 5; // 5 credits welcome bonus

      const { data: profile } = await this.supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (profile) {
        await this.supabase
          .from('profiles')
          .update({ 
            credits: (profile.credits || 0) + welcomeAmount 
          })
          .eq('id', userId);

        await this.supabase
          .from('credit_transactions')
          .insert({
            user_id: userId,
            amount: welcomeAmount,
            type: 'welcome_bonus',
            description: `Welcome bonus: ${welcomeAmount} credits`,
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error awarding welcome reward:', error);
    }
  }
}

export const referralSystem = new ReferralSystem();

