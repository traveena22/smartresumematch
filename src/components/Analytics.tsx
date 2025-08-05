import React from 'react';
import { BarChart3, TrendingUp, Eye, Download, Target, Award, Activity, Calendar, Star, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService } from '../services/analyticsService';

interface AnalyticsProps {
  resumes: any[];
  currentResume?: any;
  refreshTrigger?: number;
}

const Analytics = ({ resumes, currentResume, refreshTrigger }: AnalyticsProps) => {
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    loadAnalytics();
  }, [user, refreshTrigger]);

  const loadAnalytics = () => {
    if (user) {
      setRefreshing(true);
      analyticsService.getUserAnalytics(user.id).then(({ analytics, error }) => {
        console.log('Analytics loaded:', analytics);
        if (analytics) {
          setAnalytics(analytics);
        }
        setLoading(false);
        setRefreshing(false);
      });
    }
  };

  const SimpleChart = ({ data, title }: { data: any[], title: string }) => {
    if (!data || data.length === 0) return null;
    
    const maxScore = Math.max(...data.map(d => d.score));
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">{title}</h4>
        <div className="flex items-end space-x-2 h-32">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full bg-gray-200 rounded-t flex items-end justify-center relative group">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-500 flex items-end justify-center text-white text-xs font-medium pb-1"
                  style={{ height: `${(item.score / maxScore) * 100}px` }}
                >
                  {item.score}%
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.date}: {item.score}%
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                {item.date.split('/').slice(0, 2).join('/')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, change, color = 'blue', subtitle }: any) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {change && (
            <p className={`text-sm flex items-center mt-1 ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Analytics</h2>
          <p className="text-gray-600">
            Track your resume performance and optimization progress
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          disabled={refreshing}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {refreshing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Activity className="w-4 h-4" />
          )}
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {!analytics || analytics.totalMatches === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {resumes.length > 0 ? 'Ready to Analyze!' : 'No Analytics Yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {resumes.length > 0 
              ? 'You have uploaded a resume. Go to Job Matcher tab and analyze it against job descriptions to see detailed analytics.'
              : 'Upload a resume and run job matches to see detailed analytics and insights.'
            }
          </p>
          {resumes.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2">Your Uploaded Resume:</h4>
              <p className="text-sm text-gray-600">{currentResume?.name || resumes[0]?.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                Go to Job Matcher → Paste a job description → Click "Analyze Match"
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Target}
              title="Job Matches"
              value={analytics.totalMatches}
              subtitle="Total analyses run"
              color="blue"
            />
            <StatCard
              icon={Award}
              title="Average Match Score"
              value={`${analytics.averageScore}%`}
              subtitle="Across all matches"
              color="green"
            />
            <StatCard
              icon={Star}
              title="Best Match Score"
              value={`${analytics.bestMatchScore}%`}
              subtitle="Your highest score"
              color="purple"
            />
            <StatCard
              icon={Eye}
              title="Total Views"
              value={analytics.totalViews}
              subtitle="Resume analyses"
              color="yellow"
            />
          </div>

          {/* Charts and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Match Score Trends */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Score Trends</h3>
              <div className="h-64">
                {analytics.matchScoreHistory && analytics.matchScoreHistory.length > 0 ? (
                  <SimpleChart data={analytics.matchScoreHistory} title="Recent Match Scores" />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Run more job matches to see trends</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Skills */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills</h3>
              {analytics.topSkills && analytics.topSkills.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topSkills.map((skillData: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{skillData.skill}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (skillData.frequency / analytics.totalMatches) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{skillData.frequency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No skills data yet</p>
                  <p className="text-sm text-gray-500">Run job matches to see your top skills</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Matches */}
          {analytics.recentMatches && analytics.recentMatches.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Job Matches</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analytics.recentMatches.map((match: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-2xl font-bold ${
                        match.match_score >= 80 ? 'text-green-600' :
                        match.match_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {match.match_score}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(match.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {match.job_description.substring(0, 100)}...
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {match.matched_skills?.slice(0, 3).map((skill: string, skillIndex: number) => (
                        <span key={skillIndex} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Target className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{activity.date}</span>
                          {activity.time && (
                            <>
                              <Clock className="w-3 h-3 ml-2" />
                              <span>{activity.time}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {activity.score && (
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          activity.score >= 80 ? 'text-green-600' :
                          activity.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {activity.score}%
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">No recent activity</p>
                <p className="text-sm text-gray-500">Your job matches will appear here</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;