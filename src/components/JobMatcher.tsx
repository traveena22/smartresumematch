import React, { useState } from 'react';
import { Search, Target, TrendingUp, AlertCircle, CheckCircle, XCircle, Lightbulb, Zap, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobMatchService } from '../services/jobMatchService';

interface JobMatcherProps {
  resume: any;
  onMatchComplete?: () => void;
}

const JobMatcher: React.FC<JobMatcherProps> = ({ resume, onMatchComplete }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const { user } = useAuth();

  const handleAnalyze = () => {
    if (!jobDescription.trim()) return;
    
    setIsAnalyzing(true);
    
    // Use real AI analysis service
    if (user && resume) {
      jobMatchService.analyzeJobMatch(user.id, {
        resume_id: resume.id,
        job_description: jobDescription,
      }).then(({ result, error }) => {
        if (result) {
          setMatchResult({
            overallScore: result.match_score,
            matchedSkills: result.matched_skills,
            missingSkills: result.missing_skills,
            keywordMatches: result.keyword_matches,
            totalKeywords: result.total_keywords,
            recommendations: result.recommendations,
            strengths: result.strengths,
            weaknesses: result.weaknesses,
            priorityMissingSkills: result.priority_missing_skills,
            suggestedImprovements: result.suggested_improvements,
            atsOptimization: result.ats_optimization,
          });
          // Notify parent component that match is complete
          if (onMatchComplete) {
            onMatchComplete();
          }
        }
        setIsAnalyzing(false);
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Job Matcher</h2>
        <p className="text-gray-600">
          Analyze how well your resume matches a specific job description
        </p>
      </div>

      {!resume && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">
              Please upload a resume first to use the job matcher.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={!resume}
        />
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {jobDescription.length} characters
          </p>
          <button
            onClick={handleAnalyze}
            disabled={!resume || !jobDescription.trim() || isAnalyzing}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze Match</span>
              </>
            )}
          </button>
        </div>
      </div>

      {matchResult && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBg(matchResult.overallScore)} mb-4`}>
                <span className={`text-3xl font-bold ${getScoreColor(matchResult.overallScore)}`}>
                  {matchResult.overallScore}%
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Overall Match Score</h3>
              <p className="text-gray-600">
                Your resume has a {matchResult.overallScore}% compatibility with this job posting
              </p>
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Matched Skills
              </h3>
              <div className="space-y-2">
                {matchResult.matchedSkills.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                Missing Skills
              </h3>
              <div className="space-y-2">
                {matchResult.missingSkills.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Missing Skills */}
          {matchResult.priorityMissingSkills && matchResult.priorityMissingSkills.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                Priority Skills to Add
              </h3>
              <div className="space-y-3">
                {matchResult.priorityMissingSkills.map((skillData: any, index: number) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    skillData.importance === 'high' ? 'border-red-500 bg-red-50' :
                    skillData.importance === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">{skillData.skill}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            skillData.importance === 'high' ? 'bg-red-100 text-red-800' :
                            skillData.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {skillData.importance} priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{skillData.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Suggestions */}
          {matchResult.suggestedImprovements && matchResult.suggestedImprovements.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                Detailed Improvement Suggestions
              </h3>
              <div className="space-y-4">
                {matchResult.suggestedImprovements.map((suggestion: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{suggestion.section} Section</h4>
                        <p className="text-gray-700 mb-2">{suggestion.suggestion}</p>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600 font-medium">Impact: {suggestion.impact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ATS Optimization */}
          {matchResult.atsOptimization && matchResult.atsOptimization.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Search className="w-5 h-5 text-purple-500 mr-2" />
                ATS Optimization Tips
              </h3>
              <div className="space-y-3">
                {matchResult.atsOptimization.map((tip: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">{tip.priority}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{tip.issue}</p>
                      <p className="text-sm text-gray-600">{tip.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 text-blue-500 mr-2" />
              Optimization Recommendations
            </h3>
            <div className="space-y-3">
              {matchResult.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-green-600">
                Strengths
              </h3>
              <ul className="space-y-2">
                {matchResult.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-red-600">
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {matchResult.weaknesses.map((weakness: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div> 
        </div>
      )}
    </div>
  );
};

export default JobMatcher;