/**
 * AI-Personalisierungs-Service für die HD App
 */

export interface UserProfile {
  id: string;
  humanDesignType: string;
  profile: string;
  authority: string;
  centers: string[];
  channels: string[];
  gates: string[];
  preferences: UserPreferences;
  behaviorPatterns: BehaviorPattern[];
}

export interface UserPreferences {
  interests: string[];
  goals: string[];
  communicationStyle: string;
  learningStyle: string;
  energyLevel: number;
  socialTendency: 'introvert' | 'extrovert' | 'ambivert';
}

export interface BehaviorPattern {
  type: string;
  frequency: number;
  context: string;
  timestamp: string;
}

export interface PersonalizedRecommendation {
  id: string;
  type: 'content' | 'feature' | 'connection' | 'activity';
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  metadata: Record<string, any>;
}

export interface AIInsight {
  id: string;
  type: 'pattern' | 'prediction' | 'suggestion' | 'warning';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  metadata: Record<string, any>;
}

class PersonalizationService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    this.baseUrl = process.env.NEXT_PUBLIC_AI_API_URL || '/api/ai';
  }

  public async generatePersonalizedRecommendations(
    userProfile: UserProfile,
    context: string = 'general'
  ): Promise<PersonalizedRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userProfile,
          context,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }

      return [];
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  public async analyzeBehaviorPatterns(
    userId: string,
    timeRange: { start: string; end: string }
  ): Promise<BehaviorPattern[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze-behavior`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          timeRange
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }

      return [];
    } catch (error) {
      console.error('Error analyzing behavior patterns:', error);
      return [];
    }
  }

  public async generateAIInsights(
    userProfile: UserProfile,
    recentActivity: any[]
  ): Promise<AIInsight[]> {
    try {
      const response = await fetch(`${this.baseUrl}/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userProfile,
          recentActivity,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }

      return [];
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return [];
    }
  }

  public async optimizeUserExperience(
    userId: string,
    currentSettings: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      const response = await fetch(`${this.baseUrl}/optimize-ux`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          currentSettings,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.data || currentSettings;
      }

      return currentSettings;
    } catch (error) {
      console.error('Error optimizing user experience:', error);
      return currentSettings;
    }
  }

  public async generatePersonalizedContent(
    contentType: 'article' | 'video' | 'exercise' | 'meditation',
    userProfile: UserProfile,
    preferences: UserPreferences
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contentType,
          userProfile,
          preferences,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.data?.content || '';
      }

      return '';
    } catch (error) {
      console.error('Error generating personalized content:', error);
      return '';
    }
  }

  public async predictUserNeeds(
    userProfile: UserProfile,
    currentContext: Record<string, any>
  ): Promise<{
    predictedNeeds: string[];
    confidence: number;
    reasoning: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/predict-needs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userProfile,
          currentContext,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.data || {
          predictedNeeds: [],
          confidence: 0,
          reasoning: 'Unable to predict needs'
        };
      }

      return {
        predictedNeeds: [],
        confidence: 0,
        reasoning: 'API request failed'
      };
    } catch (error) {
      console.error('Error predicting user needs:', error);
      return {
        predictedNeeds: [],
        confidence: 0,
        reasoning: 'Error occurred during prediction'
      };
    }
  }

  public async generateCompatibilityAnalysis(
    userProfile: UserProfile,
    otherUserProfile: UserProfile
  ): Promise<{
    compatibility: number;
    strengths: string[];
    challenges: string[];
    recommendations: string[];
    detailedAnalysis: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/compatibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userProfile,
          otherUserProfile,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.data || {
          compatibility: 0,
          strengths: [],
          challenges: [],
          recommendations: [],
          detailedAnalysis: 'Unable to generate compatibility analysis'
        };
      }

      return {
        compatibility: 0,
        strengths: [],
        challenges: [],
        recommendations: [],
        detailedAnalysis: 'API request failed'
      };
    } catch (error) {
      console.error('Error generating compatibility analysis:', error);
      return {
        compatibility: 0,
        strengths: [],
        challenges: [],
        recommendations: [],
        detailedAnalysis: 'Error occurred during analysis'
      };
    }
  }

  public async trackUserInteraction(
    userId: string,
    interaction: {
      type: string;
      target: string;
      duration?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/track-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          interaction: {
            ...interaction,
            timestamp: new Date().toISOString()
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error tracking user interaction:', error);
      return false;
    }
  }

  public async getPersonalizationScore(userId: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/personalization-score/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.data?.score || 0;
      }

      return 0;
    } catch (error) {
      console.error('Error getting personalization score:', error);
      return 0;
    }
  }
}

// Singleton instance
export const personalizationService = new PersonalizationService();
