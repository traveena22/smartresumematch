import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db, Analytics } from '../lib/firebase';

export interface AnalyticsData {
  totalViews: number;
  averageScore: number;
  applicationsSubmitted: number;
  interviewsScheduled: number;
  topSkills: Array<{ skill: string; frequency: number }>;
  recentActivity: Array<{
    date: string;
    action: string;
    score?: number;
    time?: string;
  }>;
  matchScoreHistory: Array<{ date: string; score: number; index: number }>;
  totalMatches: number;
  bestMatchScore: number;
  recentMatches: any[];
}

export const analyticsService = {
  async getUserAnalytics(userId: string): Promise<{ analytics: AnalyticsData | null; error: string | null }> {
    try {
      console.log('Fetching analytics for user:', userId);
      
      // Get user's analytics data
      const analyticsQuery = query(
        collection(db, 'analytics'),
        where('user_id', '==', userId)
      );
      const analyticsSnapshot = await getDocs(analyticsQuery);
      
      let analyticsData: Analytics[] = [];
      analyticsSnapshot.forEach((doc) => {
        analyticsData.push({ id: doc.id, ...doc.data() } as Analytics);
      });

      console.log('Analytics data found:', analyticsData);
      // Get user's job matches for scoring data
      const matchesQuery = query(
        collection(db, 'job_matches'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const matchesSnapshot = await getDocs(matchesQuery);
      
      let matches: any[] = [];
      matchesSnapshot.forEach((doc) => {
        matches.push({ id: doc.id, ...doc.data() });
      });

      console.log('Job matches found:', matches);
      // Calculate analytics
      const totalViews = analyticsData.reduce((sum, item) => sum + item.views, 0);
      const applicationsSubmitted = analyticsData.reduce((sum, item) => sum + item.applications, 0);
      const interviewsScheduled = analyticsData.reduce((sum, item) => sum + item.interviews, 0);
      
      const averageScore = matches.length > 0 
        ? Math.round(matches.reduce((sum, match) => sum + match.match_score, 0) / matches.length)
        : 0;

      // Calculate top skills
      const skillFrequency: { [key: string]: number } = {};
      matches.forEach(match => {
        match.matched_skills?.forEach((skill: string) => {
          skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
        });
      });

      const topSkills = Object.entries(skillFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([skill, frequency]) => ({ skill, frequency }));

      // Generate recent activity
      const recentActivity = matches.slice(0, 5).map(match => {
        const date = new Date(match.created_at);
        return {
          date: date.toLocaleDateString(),
          action: `Job match analyzed - ${match.match_score}% compatibility`,
          score: match.match_score,
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });

      // Generate match score history for charts
      const matchScoreHistory = matches.slice(0, 10).reverse().map((match, index) => ({
        date: new Date(match.created_at).toLocaleDateString(),
        score: match.match_score,
        index: index + 1
      }));
      const analytics: AnalyticsData = {
        totalViews,
        averageScore,
        applicationsSubmitted,
        interviewsScheduled,
        topSkills,
        recentActivity,
        matchScoreHistory,
        totalMatches: matches.length,
        bestMatchScore: matches.length > 0 ? Math.max(...matches.map(m => m.match_score)) : 0,
        recentMatches: matches.slice(0, 3)
      };

      console.log('Final analytics:', analytics);
      return { analytics, error: null };
    } catch (error: any) {
      return { analytics: null, error: 'Failed to fetch analytics' };
    }
  },

  async updateAnalytics(userId: string, resumeId: string, updates: Partial<Pick<Analytics, 'views' | 'applications' | 'interviews'>>): Promise<{ error: string | null }> {
    try {
      const analyticsId = `${userId}_${resumeId}`;
      const analyticsRef = doc(db, 'analytics', analyticsId);

      // Try to get existing document
      const analyticsQuery = query(
        collection(db, 'analytics'),
        where('user_id', '==', userId),
        where('resume_id', '==', resumeId)
      );
      const snapshot = await getDocs(analyticsQuery);

      if (!snapshot.empty) {
        // Update existing record
        const existingDoc = snapshot.docs[0];
        const existingData = existingDoc.data() as Analytics;
        
        await updateDoc(doc(db, 'analytics', existingDoc.id), {
          views: existingData.views + (updates.views || 0),
          applications: existingData.applications + (updates.applications || 0),
          interviews: existingData.interviews + (updates.interviews || 0),
          updated_at: new Date().toISOString(),
        });
      } else {
        // Create new record
        await setDoc(analyticsRef, {
          user_id: userId,
          resume_id: resumeId,
          views: updates.views || 0,
          applications: updates.applications || 0,
          interviews: updates.interviews || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      return { error: null };
    } catch (error: any) {
      return { error: 'Failed to update analytics' };
    }
  },
};