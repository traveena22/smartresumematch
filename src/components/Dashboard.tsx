// Dashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ArrowLeft, Upload, FileText, Search, Settings, Download, Eye, BarChart2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ResumeUploader from './ResumeUploader';
import JobMatcher from './JobMatcher';
import ResumeBuilder from './ResumeBuilder';
import ResumePreview from './ResumePreview';
import { generateResumePDF } from '../utils/pdfGenerator';
import { resumeService } from '../services/resumeService';

interface DashboardProps {
  initialTab?: 'overview' | 'job-matcher' | 'resume-builder' | 'analytics';
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ initialTab = 'job-matcher', onBack }) => {
  const [activeTab, setActiveTab] = useState<'job-matcher' | 'resume-builder' | 'analytics'>('job-matcher');
  const [resumes, setResumes] = useState<any[]>([]);
  const [currentResume, setCurrentResume] = useState<any>(null);
  const [refreshAnalytics, setRefreshAnalytics] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewResume, setPreviewResume] = useState<any>(null);
  const analyticsSectionRef = useRef<HTMLDivElement>(null);
  const [scrollToResults, setScrollToResults] = useState(false);

  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab');

    if (tab === 'analytics') {
      setActiveTab('analytics');
    } else if (tab === 'builder') {
      setActiveTab('resume-builder');
    } else {
      setActiveTab('job-matcher');
    }
  }, [location.search]);

  useEffect(() => {
  if (scrollToResults && analyticsSectionRef.current) {
    analyticsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    setScrollToResults(false); // reset
  }
}, [scrollToResults]);


  useEffect(() => {
    if (user) {
      loadUserResumes();
    }
  }, [user]);

  const loadUserResumes = async () => {
    if (!user) return;
    const { resumes: userResumes } = await resumeService.getUserResumes(user.id);
    if (userResumes?.length) {
      setResumes(userResumes);
      if (!currentResume) {
        setCurrentResume(userResumes[0]);
      }
    }
  };

  const tabs = [
    { id: 'job-matcher', label: 'Job Matcher', icon: Search },
    { id: 'resume-builder', label: 'Resume Builder', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const handleResumeUpload = (resumeData: any) => {
    setResumes(prev => [...prev, resumeData]);
    setCurrentResume(resumeData);
    setRefreshAnalytics(prev => prev + 1);
  };

  const handleJobMatchComplete = () => {
    setRefreshAnalytics(prev => prev + 1);
  };

  const handlePreview = (resume: any) => {
    setPreviewResume(resume);
    setShowPreview(true);
  };

  const handleDownload = (resume: any) => {
    try {
      generateResumePDF(resume);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Error downloading resume. Please try again.');
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewResume(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access the dashboard</h2>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={signOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <ResumeUploader onUpload={handleResumeUpload} />
                <button 
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  onClick={() => setActiveTab('resume-builder')}
                >
                  <FileText className="w-5 h-5" />
                  <span>Create New Resume</span>
                </button>
              </div>
            </div>

            {resumes.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Resumes</h3>
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        currentResume?.id === resume.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setCurrentResume(resume)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{resume.name}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(resume.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(resume);
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Download Resume"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        if (tab.id !== 'analytics') setScrollToResults(false);
                      }}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        (tab.id === 'analytics' && activeTab === 'analytics') || activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {(activeTab === 'job-matcher' || activeTab === 'analytics') && (
                  <JobMatcher 
                    resume={currentResume}
                    onMatchComplete={handleJobMatchComplete}
                    scrollToResults={scrollToResults}
                    analyticsRef={analyticsSectionRef}
                  />
                )}
                {activeTab === 'resume-builder' && (
                  <ResumeBuilder onSave={handleResumeUpload} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Preview Modal */}
      {showPreview && previewResume && (
        <ResumePreview
          resume={previewResume}
          onClose={handleClosePreview}
          onDownload={() => handleDownload(previewResume)}
        />
      )}
    </div>
  );
};

export default Dashboard;
