// Browser-compatible NLP Service for Resume and Job Description Analysis
export interface NLPAnalysisResult {
  skills: string[];
  keywords: string[];
  entities: {
    technologies: string[];
    companies: string[];
    roles: string[];
    certifications: string[];
  };
  sentiment: {
    score: number;
    comparative: number;
  };
  readabilityScore: number;
  keyPhrases: string[];
  semanticSimilarity: number;
}

export class NLPService {
  private stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'would', 'you', 'your', 'have', 'had',
    'been', 'were', 'said', 'each', 'which', 'their', 'time', 'if',
    'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her',
    'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more',
    'very', 'what', 'know', 'just', 'first', 'get', 'over', 'think',
    'also', 'back', 'after', 'use', 'work', 'life', 'only', 'new',
    'way', 'may', 'say', 'come', 'could', 'now', 'than', 'most',
    'other', 'how', 'take', 'years', 'good', 'give', 'day', 'us',
    'well', 'old', 'see', 'own', 'man', 'here', 'thing', 'both',
    'those', 'part', 'being', 'system', 'such', 'made', 'school',
    'show', 'going', 'where', 'much', 'should', 'used', 'through'
  ]);

  private positiveWords = new Set([
    'excellent', 'outstanding', 'exceptional', 'superior', 'impressive',
    'successful', 'achieved', 'accomplished', 'improved', 'increased',
    'enhanced', 'optimized', 'streamlined', 'innovative', 'creative',
    'effective', 'efficient', 'productive', 'reliable', 'dedicated',
    'motivated', 'experienced', 'skilled', 'proficient', 'expert',
    'advanced', 'strong', 'solid', 'comprehensive', 'extensive',
    'proven', 'demonstrated', 'delivered', 'exceeded', 'surpassed'
  ]);

  private negativeWords = new Set([
    'failed', 'unsuccessful', 'poor', 'weak', 'inadequate', 'insufficient',
    'limited', 'basic', 'minimal', 'struggled', 'difficult', 'challenging',
    'problem', 'issue', 'concern', 'lacking', 'missing', 'unable',
    'cannot', 'never', 'nothing', 'nobody', 'nowhere', 'neither',
    'nor', 'not', 'no', 'none', 'without', 'less', 'least', 'worst'
  ]);

  // Extract skills using pattern matching
  extractSkills(text: string): string[] {
    const technicalPatterns = [
      // Programming languages
      /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Go|Rust|Swift|Kotlin|Ruby|PHP|Scala|R|MATLAB|Perl|Shell|Bash|PowerShell|HTML|CSS|SQL)\b/gi,
      // Frameworks and libraries
      /\b(React|Angular|Vue\.?js|Node\.?js|Express|Django|Flask|Spring|Laravel|Rails|ASP\.NET|jQuery|Bootstrap|Tailwind|Next\.?js|Nuxt\.?js)\b/gi,
      // Databases
      /\b(MySQL|PostgreSQL|MongoDB|Redis|Cassandra|Oracle|SQL Server|SQLite|DynamoDB|Elasticsearch|Neo4j|MariaDB|CouchDB)\b/gi,
      // Cloud and DevOps
      /\b(AWS|Azure|Google Cloud|GCP|Docker|Kubernetes|Jenkins|GitLab CI|GitHub Actions|Terraform|Ansible|Chef|Puppet|Vagrant)\b/gi,
      // Tools and technologies
      /\b(Git|SVN|JIRA|Confluence|Slack|Trello|Figma|Adobe|Photoshop|Illustrator|Sketch|InVision|Zeplin)\b/gi,
      // Methodologies
      /\b(Agile|Scrum|Kanban|DevOps|CI\/CD|TDD|BDD|Microservices|REST|GraphQL|SOAP|API)\b/gi,
      // Data Science and AI
      /\b(Machine Learning|Deep Learning|AI|Artificial Intelligence|TensorFlow|PyTorch|Pandas|NumPy|Scikit-learn|Jupyter|Apache Spark|Hadoop|Tableau|Power BI)\b/gi,
      // Mobile Development
      /\b(iOS|Android|React Native|Flutter|Xamarin|Ionic|Cordova|PhoneGap)\b/gi,
      // Testing
      /\b(Jest|Mocha|Cypress|Selenium|Puppeteer|Playwright|JUnit|TestNG|Karma|Jasmine)\b/gi
    ];

    const skills = new Set<string>();
    
    // Extract using regex patterns
    technicalPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => skills.add(match.trim()));
      }
    });

    // Extract capitalized technical terms
    const techTerms = text.match(/\b[A-Z][a-zA-Z]*(?:\.[a-zA-Z]+)*\b/g);
    if (techTerms) {
      techTerms.forEach(term => {
        if (term.length > 2 && this.isTechnicalTerm(term)) {
          skills.add(term);
        }
      });
    }

    return Array.from(skills).slice(0, 20);
  }

  // Extract entities (companies, roles, certifications)
  extractEntities(text: string): NLPAnalysisResult['entities'] {
    const entities = {
      technologies: [] as string[],
      companies: [] as string[],
      roles: [] as string[],
      certifications: [] as string[]
    };

    // Extract companies (common tech companies)
    const companyPatterns = [
      /\b(Google|Microsoft|Apple|Amazon|Facebook|Meta|Netflix|Tesla|Uber|Airbnb|Spotify|Twitter|LinkedIn|GitHub|Salesforce|Oracle|IBM|Intel|NVIDIA|Adobe|Slack|Zoom|Dropbox|Atlassian|Shopify|Square|PayPal|eBay|Yahoo|Cisco|VMware|Red Hat|MongoDB|Elastic|Snowflake|Databricks|Palantir|Stripe|Twilio|Okta|ServiceNow|Workday|HubSpot|Zendesk|Splunk|New Relic|DataDog|PagerDuty|HashiCorp|Docker|Kubernetes|Jenkins|GitLab|Bitbucket|Jira|Confluence|Trello|Asana|Notion|Figma|Sketch|InVision|Zeplin)\b/gi
    ];

    companyPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.companies.push(...matches.slice(0, 10));
      }
    });

    // Extract job roles
    const rolePatterns = [
      /\b(Software Engineer|Developer|Programmer|Architect|Manager|Director|Lead|Senior|Junior|Intern|Principal|Staff|Distinguished|Fellow)\b/gi,
      /\b(Full Stack|Frontend|Backend|DevOps|Data Scientist|Data Engineer|Data Analyst|Product Manager|Project Manager|Scrum Master|UI\/UX Designer|UX Designer|UI Designer|QA Engineer|Test Engineer|Security Engineer|Site Reliability Engineer|Platform Engineer|Cloud Engineer|Machine Learning Engineer|AI Engineer|Research Scientist|Technical Writer|Business Analyst|Systems Analyst|Database Administrator|Network Administrator|IT Support|Help Desk|Technical Support)\b/gi
    ];

    rolePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.roles.push(...matches.slice(0, 5));
      }
    });

    // Extract certifications
    const certPatterns = [
      /\b(AWS Certified|Microsoft Certified|Google Cloud|Oracle Certified|Cisco|CompTIA|PMP|Scrum Master|CSM|PSM|CISSP|CISM|CISA|CEH|OSCP|CKA|CKS|CKAD|Kubernetes|Docker|Terraform|Ansible|Jenkins|GitLab|GitHub|Jira|Confluence|Salesforce|ServiceNow|Workday|HubSpot|Zendesk|Splunk|New Relic|DataDog|PagerDuty|HashiCorp)\b/gi,
      /\b(Certificate|Certification|Certified)\s+[A-Z][a-zA-Z\s]+/gi
    ];

    certPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.certifications.push(...matches.slice(0, 5));
      }
    });

    return entities;
  }

  // Calculate semantic similarity using simple word overlap
  calculateSemanticSimilarity(resumeText: string, jobText: string): number {
    const resumeWords = this.tokenize(resumeText.toLowerCase());
    const jobWords = this.tokenize(jobText.toLowerCase());
    
    const resumeSet = new Set(resumeWords);
    const jobSet = new Set(jobWords);
    
    const intersection = new Set([...resumeSet].filter(x => jobSet.has(x)));
    const union = new Set([...resumeSet, ...jobSet]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // Extract key phrases using n-grams
  extractKeyPhrases(text: string): string[] {
    const phrases = new Set<string>();
    const words = this.tokenize(text.toLowerCase());
    
    // Extract bigrams and trigrams
    for (let i = 0; i < words.length - 1; i++) {
      if (!this.stopWords.has(words[i]) && !this.stopWords.has(words[i + 1])) {
        const bigram = `${words[i]} ${words[i + 1]}`;
        if (this.isSignificantPhrase(bigram)) {
          phrases.add(bigram);
        }
      }
      
      if (i < words.length - 2 && !this.stopWords.has(words[i + 2])) {
        const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        if (this.isSignificantPhrase(trigram)) {
          phrases.add(trigram);
        }
      }
    }

    return Array.from(phrases).slice(0, 15);
  }

  // Analyze sentiment using word lists
  analyzeSentiment(text: string): { score: number; comparative: number } {
    const words = this.tokenize(text.toLowerCase());
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (this.positiveWords.has(word)) {
        positiveCount++;
      } else if (this.negativeWords.has(word)) {
        negativeCount++;
      }
    });
    
    const score = positiveCount - negativeCount;
    const comparative = words.length > 0 ? score / words.length : 0;
    
    return { score, comparative };
  }

  // Calculate readability score (simplified Flesch Reading Ease)
  calculateReadabilityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.tokenize(text);
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, score));
  }

  // Comprehensive NLP analysis
  analyzeText(text: string): Omit<NLPAnalysisResult, 'semanticSimilarity'> {
    return {
      skills: this.extractSkills(text),
      keywords: this.extractKeywords(text),
      entities: this.extractEntities(text),
      sentiment: this.analyzeSentiment(text),
      readabilityScore: this.calculateReadabilityScore(text),
      keyPhrases: this.extractKeyPhrases(text)
    };
  }

  // Compare resume against job description
  compareTexts(resumeText: string, jobText: string): NLPAnalysisResult {
    const resumeAnalysis = this.analyzeText(resumeText);
    const jobAnalysis = this.analyzeText(jobText);
    const semanticSimilarity = this.calculateSemanticSimilarity(resumeText, jobText);

    // Merge and enhance analysis
    const combinedSkills = [...new Set([...resumeAnalysis.skills, ...jobAnalysis.skills])];
    const combinedKeywords = [...new Set([...resumeAnalysis.keywords, ...jobAnalysis.keywords])];

    return {
      ...resumeAnalysis,
      skills: combinedSkills,
      keywords: combinedKeywords,
      semanticSimilarity
    };
  }

  // Helper methods
  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0 && !this.stopWords.has(word));
  }

  private extractKeywords(text: string): string[] {
    const words = this.tokenize(text);
    const frequency: { [key: string]: number } = {};
    
    words.forEach(word => {
      if (word.length > 2) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  private isTechnicalTerm(term: string): boolean {
    const technicalIndicators = [
      'js', 'py', 'sql', 'api', 'ui', 'ux', 'ai', 'ml', 'ci', 'cd',
      'aws', 'gcp', 'css', 'html', 'xml', 'json', 'rest', 'soap',
      'app', 'web', 'dev', 'tech', 'sys', 'net', 'db', 'server'
    ];
    
    const lowerTerm = term.toLowerCase();
    return technicalIndicators.some(indicator => 
      lowerTerm.includes(indicator)
    ) || (term.length > 3 && /^[A-Z]/.test(term));
  }

  private isSignificantPhrase(phrase: string): boolean {
    const words = phrase.split(' ');
    return words.length >= 2 && 
           words.every(word => word.length > 2) &&
           words.some(word => !this.stopWords.has(word));
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }
    
    // Handle silent 'e'
    if (word.endsWith('e')) {
      syllableCount--;
    }
    
    return Math.max(1, syllableCount);
  }
}

export const nlpService = new NLPService();