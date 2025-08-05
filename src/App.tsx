import React, { useState } from 'react';
import { FileText, Target, BarChart3, Wand2, Lightbulb, Shield } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import AuthModal from './components/Auth/AuthModal';

type Page = 'home' | 'dashboard';
type DashboardTab = 'overview' | 'resume-builder' | 'job-matcher' | 'analytics';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('job-matcher');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [redirectTabAfterLogin, setRedirectTabAfterLogin] = useState<DashboardTab | null>(null);
  const { user } = useAuth();

  const handleFeatureClick = (tab: DashboardTab) => {
    if (user) {
      navigateToPage('dashboard', tab);
    } else {
      setRedirectTabAfterLogin(tab);
      setShowAuthModal(true);
    }
  };

  const navigateToPage = (page: Page, tab?: DashboardTab) => {
    setCurrentPage(page);
    if (tab) setDashboardTab(tab);
  };

  const features = [
    {
      icon: Target,
      title: 'AI Resume-Job Match Scoring',
      description: 'Get instant compatibility scores between your resume and job descriptions with detailed improvement suggestions.',
      onClick: () => handleFeatureClick('job-matcher')
    },
    {
      icon: Wand2,
      title: 'Smart Resume Optimizer',
      description: 'Automatically optimize your resume content, keywords, and formatting for better ATS compatibility.',
      onClick: () => handleFeatureClick('resume-builder')
    },
    {
      icon: FileText,
      title: 'Job Description Analyzer',
      description: 'Analyze job postings to identify key requirements, skills, and keywords you should highlight.',
      onClick: () => handleFeatureClick('job-matcher')
    },
    {
      icon: FileText,
      title: 'AI-Powered Resume Builder',
      description: 'Create professional resumes with AI assistance, smart templates, and industry-specific optimization.',
      onClick: () => handleFeatureClick('resume-builder')
    },
    {
      icon: Lightbulb,
      title: 'Personalized Suggestions',
      description: 'Receive tailored recommendations for improving your job application success rate.',
      onClick: () => handleFeatureClick('analytics')
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. We never share your personal information with third parties.'
    }
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            initialTab={dashboardTab}
            onBack={() => setCurrentPage('home')}
          />
        );
      default:
        return (
          <>
            <Hero onGetStarted={() => setShowAuthModal(true)} />
            <Features features={features} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onNavigate={navigateToPage}
        onAuthClick={() => setShowAuthModal(true)}
        currentPage={currentPage}
      />
      <main>{renderCurrentPage()}</main>
      <Footer />
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            if (redirectTabAfterLogin) {
              navigateToPage('dashboard', redirectTabAfterLogin);
              setRedirectTabAfterLogin(null);
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
