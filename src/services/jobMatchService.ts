import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, JobMatch } from '../lib/firebase';
import { analyticsService } from './analyticsService';
import { nlpService } from './nlpService';

export interface JobMatchInput {
  resume_id: string;
  job_description: string;
}

export interface MatchResult {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendations: string[];
  keyword_matches: number;
  total_keywords: number;
  strengths: string[];
  weaknesses: string[];
  priority_missing_skills: Array<{ skill: string; importance: 'high' | 'medium' | 'low'; reason: string }>;
  suggested_improvements: Array<{ section: string; suggestion: string; impact: string }>;
  ats_optimization: Array<{ issue: string; fix: string; priority: number }>;
}

export const jobMatchService = {
  async analyzeJobMatch(userId: string, matchData: JobMatchInput): Promise<{ result: MatchResult | null; error: string | null }> {
    try {
      // Get resume data (you'd need to implement getResumeById)
      const resume = { skills: ['JavaScript', 'React', 'Node.js', 'Python'] }; // Mock data
      
      // Perform AI analysis
      const result = await this.performAIAnalysis(resume, matchData.job_description);

      // Save the match result
      const matchDoc = {
        user_id: userId,
        resume_id: matchData.resume_id,
        job_description: matchData.job_description,
        match_score: result.match_score,
        matched_skills: result.matched_skills,
        missing_skills: result.missing_skills,
        recommendations: result.recommendations,
        created_at: new Date().toISOString(),
      };

      await addDoc(collection(db, 'job_matches'), matchDoc);

      // Update analytics when a match is created
      await analyticsService.updateAnalytics(userId, matchData.resume_id, { views: 1 });
      return { result, error: null };
    } catch (error: any) {
      return { result: null, error: 'Failed to analyze job match' };
    }
  },

  async getUserMatches(userId: string): Promise<{ matches: JobMatch[]; error: string | null }> {
    try {
      const q = query(
        collection(db, 'job_matches'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const matches: JobMatch[] = [];
      
      querySnapshot.forEach((doc) => {
        matches.push({
          id: doc.id,
          ...doc.data(),
        } as JobMatch);
      });

      return { matches, error: null };
    } catch (error: any) {
      return { matches: [], error: 'Failed to fetch matches' };
    }
  },

  async performAIAnalysis(resume: any, jobDescription: string): Promise<MatchResult> {
    // Prepare resume text for NLP analysis
    const resumeText = this.prepareResumeText(resume);
    
    // Perform comprehensive NLP analysis
    const nlpAnalysis = nlpService.compareTexts(resumeText, jobDescription);
    const resumeAnalysis = nlpService.analyzeText(resumeText);
    const jobAnalysis = nlpService.analyzeText(jobDescription);
    
    // Extract skills using NLP
    const resumeSkills = resumeAnalysis.skills;
    const jobSkills = jobAnalysis.skills;
    
    // Advanced skill matching using semantic similarity
    const matchedSkills = this.findMatchedSkills(resumeSkills, jobSkills);
    const missingSkills = this.findMissingSkills(resumeSkills, jobSkills);
    
    // Calculate comprehensive match score
    const matchScore = this.calculateAdvancedMatchScore(
      nlpAnalysis,
      resumeAnalysis,
      jobAnalysis,
      matchedSkills,
      jobSkills
    );
    
    // Extract keywords and calculate matches
    const jobKeywords = jobAnalysis.keywords;
    const keywordMatches = this.calculateKeywordMatches(resumeAnalysis.keywords, jobKeywords);
    const totalKeywords = jobKeywords.length;

    const recommendations = this.generateRecommendations(missingSkills, matchScore);
    const strengths = this.generateStrengths(matchedSkills, matchScore);
    const weaknesses = this.generateWeaknesses(missingSkills, matchScore);
    const priorityMissingSkills = this.analyzePrioritySkills(missingSkills, jobDescription);
    const suggestedImprovements = this.generateDetailedSuggestions(resumeAnalysis, jobAnalysis, matchScore);
    const atsOptimization = this.generateATSOptimization(resumeAnalysis, jobAnalysis);

    return {
      match_score: matchScore,
      matched_skills: matchedSkills.slice(0, 8),
      missing_skills: missingSkills,
      recommendations,
      keyword_matches: keywordMatches,
      total_keywords: totalKeywords,
      strengths,
      weaknesses,
      priority_missing_skills: priorityMissingSkills,
      suggested_improvements: suggestedImprovements,
      ats_optimization: atsOptimization,
    };
  },

  prepareResumeText(resume: any): string {
    let text = '';
    
    // Add skills
    if (resume.skills && Array.isArray(resume.skills)) {
      text += resume.skills.join(' ') + ' ';
    }
    
    // Add content based on type
    if (typeof resume.content === 'string') {
      text += resume.content + ' ';
    } else if (typeof resume.content === 'object' && resume.content !== null) {
      // Handle structured resume content
      if (resume.content.personal?.summary) {
        text += resume.content.personal.summary + ' ';
      }
      if (resume.content.experience && Array.isArray(resume.content.experience)) {
        resume.content.experience.forEach((exp: any) => {
          text += `${exp.position || ''} ${exp.company || ''} ${exp.description || ''} `;
        });
      }
      if (resume.content.education && Array.isArray(resume.content.education)) {
        resume.content.education.forEach((edu: any) => {
          text += `${edu.degree || ''} ${edu.school || ''} ${edu.field || ''} `;
        });
      }
      if (resume.content.skills && Array.isArray(resume.content.skills)) {
        text += resume.content.skills.join(' ') + ' ';
      }
    }
    
    return text.trim();
  },

  findMatchedSkills(resumeSkills: string[], jobSkills: string[]): string[] {
    const matched = new Set<string>();
    
    resumeSkills.forEach(resumeSkill => {
      jobSkills.forEach(jobSkill => {
        if (this.skillsMatch(resumeSkill, jobSkill)) {
          matched.add(resumeSkill);
        }
      });
    });
    
    return Array.from(matched).slice(0, 10);
  },

  findMissingSkills(resumeSkills: string[], jobSkills: string[]): string[] {
    return jobSkills.filter(jobSkill => 
      !resumeSkills.some(resumeSkill => this.skillsMatch(resumeSkill, jobSkill))
    ).slice(0, 8);
  },

  calculateAdvancedMatchScore(
    nlpAnalysis: any,
    resumeAnalysis: any,
    jobAnalysis: any,
    matchedSkills: string[],
    jobSkills: string[]
  ): number {
    // Multi-factor scoring algorithm
    const semanticWeight = 0.3;
    const skillWeight = 0.4;
    const keywordWeight = 0.2;
    const readabilityWeight = 0.1;
    
    // Semantic similarity score (0-100)
    const semanticScore = nlpAnalysis.semanticSimilarity * 100;
    
    // Skill match score (0-100)
    const skillScore = jobSkills.length > 0 ? 
      (matchedSkills.length / jobSkills.length) * 100 : 0;
    
    // Keyword match score (0-100)
    const keywordScore = jobAnalysis.keywords.length > 0 ?
      (this.calculateKeywordMatches(resumeAnalysis.keywords, jobAnalysis.keywords) / jobAnalysis.keywords.length) * 100 : 0;
    
    // Readability bonus (normalized to 0-100)
    const readabilityScore = Math.min(100, resumeAnalysis.readabilityScore);
    
    // Calculate weighted score
    const finalScore = (
      semanticScore * semanticWeight +
      skillScore * skillWeight +
      keywordScore * keywordWeight +
      readabilityScore * readabilityWeight
    );
    
    return Math.round(Math.min(98, Math.max(15, finalScore)));
  },

  calculateKeywordMatches(resumeKeywords: string[], jobKeywords: string[]): number {
    let matches = 0;
    resumeKeywords.forEach(resumeKeyword => {
      if (jobKeywords.some(jobKeyword => this.skillsMatch(resumeKeyword, jobKeyword))) {
        matches++;
      }
    });
    return matches;
  },

  extractKeywords(text: string): string[] {
    const technicalKeywords = [
      'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Git',
      'TypeScript', 'MongoDB', 'PostgreSQL', 'Redis', 'Kubernetes', 'Jenkins',
      'Machine Learning', 'Data Analysis', 'Artificial Intelligence', 'Deep Learning',
      'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Apache Spark',
      'Hadoop', 'Elasticsearch', 'GraphQL', 'REST API', 'Microservices',
      'CI/CD', 'DevOps', 'Cloud Computing', 'Azure', 'Google Cloud',
      'Terraform', 'Ansible', 'Linux', 'Bash', 'PowerShell'
    ];

    const softSkills = [
      'Project Management', 'Agile', 'Scrum', 'Leadership', 'Communication',
      'Problem Solving', 'Team Collaboration', 'Critical Thinking',
      'Time Management', 'Analytical Skills', 'Creativity', 'Adaptability'
    ];

    const allKeywords = [...technicalKeywords, ...softSkills];
    return allKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  },

  skillsMatch(skill1: string, skill2: string): boolean {
    const s1 = skill1.toLowerCase().trim();
    const s2 = skill2.toLowerCase().trim();
    
    // Exact match
    if (s1 === s2) return true;
    
    // One contains the other
    if (s1.includes(s2) || s2.includes(s1)) return true;
    
    // Handle common variations
    const variations: { [key: string]: string[] } = {
      'javascript': ['js', 'node.js', 'nodejs'],
      'python': ['py'],
      'react': ['reactjs', 'react.js'],
      'angular': ['angularjs'],
      'vue': ['vuejs', 'vue.js'],
      'machine learning': ['ml', 'ai', 'artificial intelligence'],
      'database': ['db', 'sql', 'nosql'],
      'aws': ['amazon web services'],
      'gcp': ['google cloud platform', 'google cloud'],
    };
    
    for (const [key, vars] of Object.entries(variations)) {
      if ((s1 === key && vars.includes(s2)) || (s2 === key && vars.includes(s1))) {
        return true;
      }
    }
    
    return false;
  },

  extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
      'Git', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'TypeScript', 'Angular',
      'Vue.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'PHP',
      'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'Ruby', 'Scala',
      'Machine Learning', 'Data Science', 'AI', 'Deep Learning', 'TensorFlow',
      'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Kubernetes', 'Jenkins',
      'CI/CD', 'DevOps', 'Linux', 'Bash', 'PowerShell', 'Terraform', 'Ansible'
    ];
    
    return commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
  },
  extractSkills(jobDescription: string): string[] {
    const requiredSkillPatterns = [
      'Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'Go', 'Rust',
      'Machine Learning', 'Deep Learning', 'Data Science', 'AI',
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Cassandra',
      'Apache Kafka', 'RabbitMQ', 'Elasticsearch', 'Solr',
      'Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI',
      'Terraform', 'Ansible', 'Chef', 'Puppet',
      'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence'
    ];

    return requiredSkillPatterns.filter(skill => 
      jobDescription.toLowerCase().includes(skill.toLowerCase())
    );
  },

  generateRecommendations(missingSkills: string[], score: number): string[] {
    const recommendations = [];
    
    if (missingSkills.length > 0) {
      recommendations.push(`Add ${missingSkills[0]} experience to your skills section`);
      if (missingSkills.length > 1) {
        recommendations.push(`Include specific ${missingSkills[1]} projects or certifications`);
      }
    }

    if (score < 70) {
      recommendations.push('Use more action verbs in your experience descriptions');
      recommendations.push('Quantify your achievements with specific metrics');
    }

    if (score < 60) {
      recommendations.push('Tailor your summary to better match the job requirements');
    }

    return recommendations.slice(0, 4);
  },

  generateStrengths(matchedSkills: string[], score: number): string[] {
    const strengths = [];
    
    if (matchedSkills.length > 3) {
      strengths.push('Strong technical skills alignment');
    }
    
    if (score > 70) {
      strengths.push('Good keyword density');
      strengths.push('Relevant work experience');
    }

    return strengths;
  },

  generateWeaknesses(missingSkills: string[], score: number): string[] {
    const weaknesses = [];
    
    if (missingSkills.length > 2) {
      weaknesses.push('Missing some required technical skills');
    }
    
    if (score < 70) {
      weaknesses.push('Could improve quantifiable achievements');
    }

    if (score < 60) {
      weaknesses.push('Lacks specific industry experience');
    }

    return weaknesses;
  },

  analyzePrioritySkills(missingSkills: string[], jobDescription: string): Array<{ skill: string; importance: 'high' | 'medium' | 'low'; reason: string }> {
    const jobLower = jobDescription.toLowerCase();
    
    return missingSkills.slice(0, 8).map(skill => {
      const skillLower = skill.toLowerCase();
      let importance: 'high' | 'medium' | 'low' = 'medium';
      let reason = `${skill} appears in the job requirements`;

      // High priority indicators
      if (jobLower.includes('required') && jobLower.includes(skillLower)) {
        importance = 'high';
        reason = `${skill} is listed as a required skill`;
      } else if (jobLower.includes('must have') && jobLower.includes(skillLower)) {
        importance = 'high';
        reason = `${skill} is marked as "must have"`;
      } else if (jobLower.includes('essential') && jobLower.includes(skillLower)) {
        importance = 'high';
        reason = `${skill} is described as essential`;
      }
      // Medium priority indicators
      else if (jobLower.includes('preferred') && jobLower.includes(skillLower)) {
        importance = 'medium';
        reason = `${skill} is listed as preferred`;
      } else if (jobLower.includes('experience with') && jobLower.includes(skillLower)) {
        importance = 'medium';
        reason = `Experience with ${skill} is mentioned`;
      }
      // Low priority (nice to have)
      else if (jobLower.includes('nice to have') && jobLower.includes(skillLower)) {
        importance = 'low';
        reason = `${skill} is nice to have`;
      } else if (jobLower.includes('bonus') && jobLower.includes(skillLower)) {
        importance = 'low';
        reason = `${skill} would be a bonus`;
      }

      return { skill, importance, reason };
    });
  },

  generateDetailedSuggestions(resumeAnalysis: any, jobAnalysis: any, matchScore: number): Array<{ section: string; suggestion: string; impact: string }> {
    const suggestions = [];
    const jobKeywords = jobAnalysis.keywords;
    const jobSkills = jobAnalysis.skills;

    // Summary/Objective suggestions
    if (matchScore < 70) {
      suggestions.push({
        section: 'Summary',
        suggestion: 'Rewrite your professional summary to include key terms from the job description',
        impact: 'Can increase match score by 10-15%'
      });
    }

    // Skills section suggestions
    if (jobSkills.some(skill => skill.toLowerCase().includes('cloud')) && 
        !resumeAnalysis.skills.some((s: string) => s.toLowerCase().includes('cloud'))) {
      suggestions.push({
        section: 'Skills',
        suggestion: 'Add cloud computing skills (AWS, Azure, or Google Cloud)',
        impact: 'Highly valued in modern tech roles'
      });
    }

    if (jobSkills.some(skill => skill.toLowerCase().includes('agile')) && 
        !resumeAnalysis.skills.some((s: string) => s.toLowerCase().includes('agile'))) {
      suggestions.push({
        section: 'Skills',
        suggestion: 'Include Agile/Scrum methodology experience',
        impact: 'Shows familiarity with modern development practices'
      });
    }

    // Experience section suggestions
    suggestions.push({
      section: 'Experience',
      suggestion: 'Use action verbs and quantify achievements with specific metrics',
      impact: 'Makes your accomplishments more compelling'
    });

    if (matchScore < 60) {
      suggestions.push({
        section: 'Experience',
        suggestion: 'Reorganize bullet points to highlight relevant experience first',
        impact: 'Improves ATS scanning and recruiter attention'
      });
    }

    // Education/Certifications
    if (jobAnalysis.keywords.some((k: string) => k.toLowerCase().includes('certification')) || 
        jobAnalysis.keywords.some((k: string) => k.toLowerCase().includes('certified'))) {
      suggestions.push({
        section: 'Certifications',
        suggestion: 'Consider obtaining relevant industry certifications',
        impact: 'Demonstrates commitment to professional development'
      });
    }

    // NLP-based suggestions
    if (resumeAnalysis.readabilityScore < 60) {
      suggestions.push({
        section: 'Overall',
        suggestion: 'Improve readability by using shorter sentences and simpler language',
        impact: 'Better ATS parsing and recruiter comprehension'
      });
    }

    if (resumeAnalysis.sentiment.score < 0) {
      suggestions.push({
        section: 'Tone',
        suggestion: 'Use more positive language to describe your achievements',
        impact: 'Creates a more confident and appealing impression'
      });
    }

    return suggestions.slice(0, 6);
  },

  generateATSOptimization(resumeAnalysis: any, jobAnalysis: any): Array<{ issue: string; fix: string; priority: number }> {
    const optimizations = [];
    const jobKeywords = jobAnalysis.keywords;
    const resumeKeywords = resumeAnalysis.keywords;

    // Keyword density check
    const missingKeywords = jobKeywords.filter(keyword => 
      !resumeKeywords.some(resumeKeyword => this.skillsMatch(resumeKeyword, keyword))
    );

    if (missingKeywords.length > 0) {
      optimizations.push({
        issue: `Missing ${missingKeywords.length} important keywords`,
        fix: `Naturally incorporate: ${missingKeywords.slice(0, 3).join(', ')}`,
        priority: 1
      });
    }

    // Format optimization
    optimizations.push({
      issue: 'ATS may have trouble parsing complex formatting',
      fix: 'Use simple, clean formatting with standard section headers',
      priority: 2
    });

    // Length optimization
    optimizations.push({
      issue: 'Resume length optimization',
      fix: 'Keep resume to 1-2 pages with most relevant information first',
      priority: 3
    });

    // File format
    optimizations.push({
      issue: 'File format compatibility',
      fix: 'Save as both PDF and Word document for different ATS systems',
      priority: 4
    });

    return optimizations.slice(0, 4);
  },
};