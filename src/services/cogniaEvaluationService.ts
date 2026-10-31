import { CogniaFolder, FolderFile } from '../types';

export interface CogniaStandardCard {
  standardNumber: number;
  folderId: number; // mapped module id
  title: string;
  characteristic: 'Culture of Learning' | 'Leadership for Learning' | 'Engagement of Learning' | 'Growth in Learning' | 'Institutional Capacity';
  statement: string;
  keyElements: string[];
  sampleEvidence: string[];
  keywords: string[];
  rubric: {
    level1: string; // Insufficient
    level2: string; // Emerging
    level3: string; // Operational
    level4: string; // Exemplary
  };
}

export interface ModuleEvaluation {
  folderId: number;
  standardNumber: number;
  standardName: string;
  characteristic: string;
  score: number; // 0 to 100
  level: 1 | 2 | 3 | 4;
  levelLabel: string;
  levelUrdu: string;
  status: 'critical' | 'needs-work' | 'operational' | 'exemplary';
  statusLabel: string;
  statusUrdu: string;
  fileCount: number;
  hasPdf: boolean;
  hasSpreadsheet: boolean;
  hasMediaOrEmail: boolean;
  matchedEvidences: string[];
  missingEvidences: string[];
  recommendationUrdu: string;
  recommendationEn: string;
}

export interface CharacteristicSummary {
  name: string;
  nameUrdu: string;
  score: number;
  totalStandards: number;
  populatedStandards: number;
  totalFiles: number;
  level: string;
  color: string;
}

export interface EvaluationResult {
  overallScore: number; // 0 to 100
  level: 1 | 2 | 3 | 4;
  levelLabel: string;
  levelUrdu: string;
  summaryTextUrdu: string;
  summaryTextEn: string;
  characteristics: CharacteristicSummary[];
  moduleEvaluations: ModuleEvaluation[];
  priorityGaps: ModuleEvaluation[]; // Top modules needing urgent work ("Kider Mehnat Ki Zaroorat Ha")
  operationalModules: ModuleEvaluation[];
  totalFiles: number;
  totalModules: number;
  populatedModules: number;
  evaluatedAt: string;
}

// 31 Cognia Standards from the Official Performance Standards Resource Cards
export const COGNIA_STANDARDS_CATALOG: CogniaStandardCard[] = [
  // 1-6: Culture of Learning
  {
    standardNumber: 1,
    folderId: 1,
    title: 'Respect, Equity & Fairness',
    characteristic: 'Culture of Learning',
    statement: 'Leaders cultivate and sustain a culture that demonstrates respect, equity, and fairness for all learners.',
    keyElements: ['Equitable student access', 'Respectful environment', 'Inclusive policies', 'Fair treatment for all learners'],
    sampleEvidence: ['School Equity Policy & Guidelines', 'Climate & Satisfaction Survey Results', 'Student Behavior & Fairness Code', 'Staff Respect Protocols'],
    keywords: ['equity', 'respect', 'fairness', 'code of conduct', 'climate', 'survey', 'policy', 'diversity'],
    rubric: {
      level1: 'Practices are isolated, subjective, or lack systematic support for equity.',
      level2: 'Practices are emerging, with some documented guidelines for fair treatment.',
      level3: 'Clear policies and consistent practices actively promote equity and respect.',
      level4: 'Equity and respect are embedded in culture with institutional data monitoring.'
    }
  },
  {
    standardNumber: 2,
    folderId: 2,
    title: 'Learner-Centered Expectations',
    characteristic: 'Culture of Learning',
    statement: 'Learners demonstrate behaviors and attitudes that reflect high expectations in their learning journeys.',
    keyElements: ['High academic expectations', 'Learner accountability', 'Positive classroom culture'],
    sampleEvidence: ['Academic Honesty Policy', 'Student Goal Setting Sheets', 'Classroom Norms & Rubrics', 'Parent-Student Compacts'],
    keywords: ['expectation', 'goal', 'learner', 'student', 'attitude', 'compact', 'honesty'],
    rubric: {
      level1: 'Expectations are vague or inconsistent across classrooms.',
      level2: 'Expectations are defined but learner ownership is variable.',
      level3: 'High expectations are shared, tracked, and consistently reinforced.',
      level4: 'Learners self-regulate and actively advocate for their own academic growth.'
    }
  },
  {
    standardNumber: 3,
    folderId: 3,
    title: 'Challenging & Authentic Learning',
    characteristic: 'Culture of Learning',
    statement: 'Learners engage in challenging learning opportunities tailored to their individual abilities and backgrounds.',
    keyElements: ['Rigorous curriculum', 'Inquiry-based tasks', 'Individual challenge levels'],
    sampleEvidence: ['Advanced Placement/Gifted Course Outlines', 'Project-Based Learning Briefs', 'Scaffolded Challenge Rubrics', 'Student Exemplar Work'],
    keywords: ['challenge', 'rigor', 'gifted', 'project', 'authentic', 'inquiry', 'exemplar'],
    rubric: {
      level1: 'Learning tasks are routine with minimal cognitive challenge.',
      level2: 'Challenging tasks are provided occasionally to selected groups.',
      level3: 'Challenging experiences are systematically integrated across subjects.',
      level4: 'Differentiated high-level cognitive tasks are deeply embedded in daily learning.'
    }
  },
  {
    standardNumber: 4,
    folderId: 4,
    title: 'Personalized Learning Journeys',
    characteristic: 'Culture of Learning',
    statement: 'Learners direct and personalize their learning through choice, goal setting, and self-reflection.',
    keyElements: ['Student voice and choice', 'Personalized learning plans', 'Self-paced mastery'],
    sampleEvidence: ['Individual Learning Plans (ILPs)', 'Student Choice Board Samples', 'Reflective Portfolios', 'Self-Assessment Sheets'],
    keywords: ['personalized', 'choice', 'portfolio', 'ilp', 'reflection', 'self-assessment'],
    rubric: {
      level1: 'Instruction is one-size-fits-all with negligible student choice.',
      level2: 'Limited student choices offered during selected elective units.',
      level3: 'Learners actively set individual goals and exercise authentic learning choices.',
      level4: 'Personalized learning pathways empower learners to design and assess goals.'
    }
  },
  {
    standardNumber: 5,
    folderId: 5,
    title: 'Self-Efficacy & Resilience',
    characteristic: 'Culture of Learning',
    statement: 'Learners develop self-efficacy, growth mindset, and resilience to navigate challenges.',
    keyElements: ['Growth mindset instruction', 'Resilience training', 'Social-emotional learning (SEL)'],
    sampleEvidence: ['SEL Curriculum Guides', 'Growth Mindset Reflection Logs', 'Counseling Workshop Records', 'Resilience Surveys'],
    keywords: ['mindset', 'resilience', 'sel', 'social emotional', 'counseling', 'well-being'],
    rubric: {
      level1: 'Social-emotional resilience is not formally addressed or tracked.',
      level2: 'Isolated SEL sessions held without school-wide integration.',
      level3: 'Systematic SEL and growth mindset initiatives are taught and monitored.',
      level4: 'Resilience and self-efficacy are core institutional cultural pillars.'
    }
  },
  {
    standardNumber: 6,
    folderId: 6,
    title: 'Positive Relationships & Community',
    characteristic: 'Culture of Learning',
    statement: 'Learners build constructive relationships with peers, educators, and community members.',
    keyElements: ['Peer collaboration', 'Mentorship programs', 'Community engagement'],
    sampleEvidence: ['Peer Mentoring Schedules', 'Anti-Bullying Campaign Logs', 'Community Partnership Agreements', 'PTA Event Reports'],
    keywords: ['relationship', 'mentoring', 'anti-bullying', 'community', 'peer', 'partnership'],
    rubric: {
      level1: 'Interpersonal conflicts are reactive; peer relationships lack structure.',
      level2: 'Occasional relationship-building activities without measurable tracking.',
      level3: 'Constructive relationships and anti-bullying policies are proactive.',
      level4: 'Deeply positive community relationships and peer leadership flourish.'
    }
  },

  // 7-15: Leadership for Learning
  {
    standardNumber: 7,
    folderId: 7,
    title: 'Aligned Mission, Vision & Values',
    characteristic: 'Leadership for Learning',
    statement: 'Leaders guide and sustain an aligned mission, vision, and core values that foster student success.',
    keyElements: ['Shared mission statement', 'Stakeholder communication', 'Strategic alignment'],
    sampleEvidence: ['School Mission & Vision Document', 'Stakeholder Communication Plan', 'Strategic Goals 3-Year Plan', 'Annual Review Minutes'],
    keywords: ['mission', 'vision', 'values', 'strategic', 'stakeholder', 'goals', 'alignment'],
    rubric: {
      level1: 'Mission is out-of-date or disconnected from daily practices.',
      level2: 'Mission is posted but not systematically referenced in decision-making.',
      level3: 'Mission and vision clearly guide curricular and operational choices.',
      level4: 'Mission is a living compass evaluated and refreshed with all stakeholders.'
    }
  },
  {
    standardNumber: 8,
    folderId: 8,
    title: 'Governing Authority & Policies',
    characteristic: 'Leadership for Learning',
    statement: 'The governing body adheres to defined policies, ethics, and responsibilities supporting student learning.',
    keyElements: ['Board governance policies', 'Ethical standards', 'Non-interference in operations'],
    sampleEvidence: ['School Board Charter & Bylaws', 'Code of Ethics Document', 'Board Meeting Minutes & Resolutions', 'Annual Board Evaluation'],
    keywords: ['board', 'governing', 'bylaws', 'charter', 'ethics', 'policy', 'resolution'],
    rubric: {
      level1: 'Governance policies are absent, informal, or infringe on daily management.',
      level2: 'Policies exist but board evaluations and reviews are sporadic.',
      level3: 'Clear division of governance and leadership roles with documented policies.',
      level4: 'Exemplary transparent governance with regular self-evaluations and compliance.'
    }
  },
  {
    standardNumber: 9,
    folderId: 9,
    title: 'Strategic Resource & Budget Allocation',
    characteristic: 'Leadership for Learning',
    statement: 'Leaders allocate financial, physical, and human resources purposefully to achieve learner outcomes.',
    keyElements: ['Budget alignment to learning', 'Facilities maintenance', 'Resource stewardship'],
    sampleEvidence: ['Annual Academic Budget Allocation', 'Capital & Facility Improvement Plan', 'Instructional Technology Plan', 'Audit Financial Reports'],
    keywords: ['budget', 'resource', 'allocation', 'finance', 'facility', 'audit', 'technology plan'],
    rubric: {
      level1: 'Resource allocation is arbitrary and unrelated to academic goals.',
      level2: 'Budget matches historical lines with limited alignment to student needs.',
      level3: 'Financial and physical resources are systematically allocated to priorities.',
      level4: 'Strategic resource investment directly accelerates continuous improvement.'
    }
  },
  {
    standardNumber: 10,
    folderId: 10,
    title: 'Shared & Distributed Leadership',
    characteristic: 'Leadership for Learning',
    statement: 'Leaders cultivate shared leadership opportunities and empower staff and learners.',
    keyElements: ['Department heads empowerment', 'Student council leadership', 'Collaborative decision making'],
    sampleEvidence: ['Leadership Committee Charters', 'Department Heads Meeting Agendas', 'Student Council Constitution', 'Staff Delegation Matrix'],
    keywords: ['shared leadership', 'committee', 'delegation', 'student council', 'department', 'coordinator'],
    rubric: {
      level1: 'Decision making is strictly hierarchical and top-down.',
      level2: 'Committees exist on paper with limited genuine decision authority.',
      level3: 'Distributed leadership empowers staff and students in key school decisions.',
      level4: 'A robust culture of collective efficacy and shared leadership thrives.'
    }
  },
  {
    standardNumber: 11,
    folderId: 11,
    title: 'Supervision & Instructional Feedback',
    characteristic: 'Leadership for Learning',
    statement: 'Leaders provide purposeful supervision and feedback that drive high instructional quality.',
    keyElements: ['Classroom observations', 'Actionable teacher feedback', 'Growth-oriented evaluation'],
    sampleEvidence: ['Teacher Evaluation System Handbook', 'Classroom Observation Rubrics & Data', 'Walkthrough Feedback Samples', 'Teacher Improvement Plans'],
    keywords: ['supervision', 'observation', 'walkthrough', 'evaluation', 'feedback', 'rubric'],
    rubric: {
      level1: 'Supervision is compliance-only or sporadic without constructive feedback.',
      level2: 'Observations occur annually with limited follow-up coaching.',
      level3: 'Regular formal and informal observations provide actionable feedback.',
      level4: 'Systematic coaching and peer feedback cycle elevate pedagogical excellence.'
    }
  },
  {
    standardNumber: 12,
    folderId: 12,
    title: 'Professional Learning & Collaboration',
    characteristic: 'Leadership for Learning',
    statement: 'Leaders guide staff through systematic professional development aligned with learner needs.',
    keyElements: ['Targeted PD plan', 'Collaborative workshops', 'Needs-based teacher training'],
    sampleEvidence: ['Annual Professional Development Calendar', 'Workshop Attendance & Evaluation Logs', 'PD Needs Assessment Survey', 'Teacher Certification Records'],
    keywords: ['professional development', 'pd', 'training', 'workshop', 'calendar', 'certification'],
    rubric: {
      level1: 'Professional development is ad-hoc, unfocused, or non-existent.',
      level2: 'PD sessions occur without clear alignment to school improvement goals.',
      level3: 'A coherent PD plan addresses instructional priorities and staff needs.',
      level4: 'Data-driven, ongoing collaborative professional learning drives innovation.'
    }
  },
  {
    standardNumber: 13,
    folderId: 13,
    title: 'Data-Driven Decision Systems',
    characteristic: 'Leadership for Learning',
    statement: 'Leaders implement comprehensive data systems to analyze operational and academic performance.',
    keyElements: ['Data dashboards', 'Regular data review cycles', 'Evidence-based adjustments'],
    sampleEvidence: ['Quarterly Academic Benchmark Reports', 'School Improvement Plan (SIP) Data Reviews', 'Data Team Meeting Minutes', 'Key Performance Indicators (KPI) Sheet'],
    keywords: ['data', 'dashboard', 'benchmark', 'kpi', 'sip', 'decision', 'metrics'],
    rubric: {
      level1: 'Decisions rely on intuition without reference to systematic data.',
      level2: 'Data is collected annually but rarely analyzed for instructional changes.',
      level3: 'Regular data meetings systematically examine metrics to adjust practices.',
      level4: 'A rich predictive data ecosystem empowers real-time academic intervention.'
    }
  },
  {
    standardNumber: 14,
    folderId: 14,
    title: 'Culture of Trust & Continuous Improvement',
    characteristic: 'Leadership for Learning',
    statement: 'Leaders foster a culture of mutual respect, psychological safety, and continuous improvement.',
    keyElements: ['Staff psychological safety', 'Open door policy', 'Innovation encouragement'],
    sampleEvidence: ['Staff Climate Survey Analytics', 'Continuous Improvement Plan Progress Log', 'Innovation Grants/Initiatives Documentation', 'Exit Interview Summaries'],
    keywords: ['trust', 'improvement', 'safety', 'climate', 'survey', 'innovation', 'culture'],
    rubric: {
      level1: 'Low trust, fear of failure, or resistance to change dominates.',
      level2: 'Improvement initiatives are announced but lack sustained buy-in.',
      level3: 'Staff feel supported to innovate; continuous improvement is valued.',
      level4: 'A celebrated culture of trust, research, and perpetual refinement exists.'
    }
  },
  {
    standardNumber: 15,
    folderId: 15,
    title: 'Stakeholder Engagement & Partnerships',
    characteristic: 'Leadership for Learning',
    statement: 'Leaders implement strategies that cultivate reciprocal partnerships with families and the community.',
    keyElements: ['Parent communication', 'Community partnerships', 'Advisory councils'],
    sampleEvidence: ['Parent-Teacher Conference Records', 'Family Communication Logs & Newsletters', 'Community Business Partnership MOUs', 'Parent Advisory Council Minutes'],
    keywords: ['stakeholder', 'parent', 'partnership', 'community', 'mou', 'newsletter', 'advisory'],
    rubric: {
      level1: 'Parent communication is one-way and strictly transactional.',
      level2: 'Events occur but two-way collaboration is infrequent.',
      level3: 'Structured partnerships and parent forums actively engage families.',
      level4: 'Deep reciprocal community and family alliances enrich school life.'
    }
  },

  // 16-23: Engagement of Learning
  {
    standardNumber: 16,
    folderId: 16,
    title: 'Collaborative Learning & Peer Dialogue',
    characteristic: 'Engagement of Learning',
    statement: 'Learners collaborate meaningfully with peers and educators to co-construct understanding.',
    keyElements: ['Group projects', 'Peer review rubrics', 'Interactive discussions'],
    sampleEvidence: ['Collaborative Project Rubrics', 'Peer Assessment Samples', 'Structured Dialogue Protocol Sheets', 'Student Collaboration Videos/Photos'],
    keywords: ['collaboration', 'peer', 'group', 'dialogue', 'co-construct', 'rubric'],
    rubric: {
      level1: 'Learning is predominantly teacher-centered and solitary.',
      level2: 'Group work is assigned without clear collaboration protocols.',
      level3: 'Learners regularly collaborate using structured roles and shared goals.',
      level4: 'High-level cooperative inquiry and peer critiquing are daily classroom norms.'
    }
  },
  {
    standardNumber: 17,
    folderId: 17,
    title: 'Critical Thinking & Problem Solving',
    characteristic: 'Engagement of Learning',
    statement: 'Learners develop critical thinking, complex problem-solving, and analytical capabilities.',
    keyElements: ['Higher-order thinking skills', 'Real-world problem solving', 'Inquiry labs'],
    sampleEvidence: ['STEM/Inquiry Lab Task Sheets', 'Critical Thinking Assessment Rubrics', 'Debate & Socratic Seminar Guides', 'Student Problem-Solving Portfolios'],
    keywords: ['critical thinking', 'problem solving', 'inquiry', 'stem', 'analysis', 'socratic'],
    rubric: {
      level1: 'Instruction focuses almost entirely on rote memorization.',
      level2: 'Occasional open-ended questions provided without scaffolded inquiry.',
      level3: 'Critical analysis, synthesis, and problem solving are regularly practiced.',
      level4: 'Learners routinely tackle complex, unscripted problems with original solutions.'
    }
  },
  {
    standardNumber: 18,
    folderId: 18,
    title: 'Real-World & Authentic Connections',
    characteristic: 'Engagement of Learning',
    statement: 'Learners connect academic knowledge to authentic contexts, career pathways, and real-world issues.',
    keyElements: ['Authentic learning scenarios', 'Career exploration', 'Interdisciplinary studies'],
    sampleEvidence: ['Career Fair & Speaker Logs', 'Field Trip Learning Syntheses', 'Interdisciplinary Capstone Overviews', 'Authentic Audience Project Briefs'],
    keywords: ['real-world', 'career', 'authentic', 'capstone', 'field trip', 'interdisciplinary'],
    rubric: {
      level1: 'Curriculum is disconnected from real-world relevance.',
      level2: 'Isolated examples given without authentic applications.',
      level3: 'Authentic real-world scenarios and career linkages are systematically embedded.',
      level4: 'Learners produce public products and address genuine global/community challenges.'
    }
  },
  {
    standardNumber: 19,
    folderId: 19,
    title: 'Differentiated Instructional Practice',
    characteristic: 'Engagement of Learning',
    statement: 'Educators implement differentiated instructional strategies to address diverse learner needs.',
    keyElements: ['Tiered assignments', 'Accommodations & modifications', 'Flexible grouping'],
    sampleEvidence: ['Differentiated Lesson Plan Samples', 'Tiered Assignment Handouts', 'ELL & Special Needs Accommodation Logs', 'Learning Centers Guidelines'],
    keywords: ['differentiation', 'tiered', 'ell', 'special needs', 'accommodation', 'lesson plan'],
    rubric: {
      level1: 'All students receive identical tasks without adaptation.',
      level2: 'Modifications are informal or limited to struggling students only.',
      level3: 'Teachers consistently vary content, process, and product to suit learners.',
      level4: 'Dynamic diagnostic differentiation accelerates learning for every individual.'
    }
  },
  {
    standardNumber: 20,
    folderId: 20,
    title: 'Active Learning & Digital Tech Integration',
    characteristic: 'Engagement of Learning',
    statement: 'Educators use active learning strategies and technology tools to stimulate intellectual curiosity.',
    keyElements: ['Hands-on activities', 'Educational technology', 'Student digital creation'],
    sampleEvidence: ['EdTech Integration Lesson Plans', 'Digital Portfolio Guides', 'Makerspace / Lab Project Logs', 'Interactive Simulation Activities'],
    keywords: ['technology', 'active learning', 'edtech', 'simulation', 'digital', 'interactive', 'makerspace'],
    rubric: {
      level1: 'Technology is used solely for passive consumption or word processing.',
      level2: 'Occasional interactive apps used without deep pedagogical purpose.',
      level3: 'Digital tools and active learning enrich engagement and comprehension.',
      level4: 'Learners leverage advanced technology to research, design, and create globally.'
    }
  },
  {
    standardNumber: 21,
    folderId: 21,
    title: 'Conducive & Safe Learning Environments',
    characteristic: 'Engagement of Learning',
    statement: 'Educators cultivate positive, safe, and organized learning spaces that maximize learning time.',
    keyElements: ['Classroom management', 'Physical/digital safety', 'Optimized time on task'],
    sampleEvidence: ['Classroom Management Guidelines', 'Lab Safety Protocol Documents', 'Time-on-Task Observation Records', 'Classroom Layout Guidelines'],
    keywords: ['environment', 'safety', 'management', 'time on task', 'conduct', 'classroom'],
    rubric: {
      level1: 'Disruptions frequent; learning environments are cluttered or disorganized.',
      level2: 'Classrooms are orderly but rely primarily on punitive measures.',
      level3: 'Positive behavioral norms and safe physical/digital spaces maximize learning.',
      level4: 'Classrooms are vibrant, student-centered ecosystems of focused engagement.'
    }
  },
  {
    standardNumber: 22,
    folderId: 22,
    title: 'Learner Self-Reflection & Ownership',
    characteristic: 'Engagement of Learning',
    statement: 'Learners reflect on their academic progress and take ownership of their personal targets.',
    keyElements: ['Self-monitoring', 'Student-led conferences', 'Reflective journals'],
    sampleEvidence: ['Student-Led Conference Scripts & Logs', 'Academic Reflection Journals', 'Student Goal Tracking Charts', 'Error Analysis Worksheets'],
    keywords: ['self-reflection', 'ownership', 'conference', 'goal tracking', 'journal', 'metacognition'],
    rubric: {
      level1: 'Learners are unaware of their progress or grades until report cards.',
      level2: 'Students track grades occasionally without reflective analysis.',
      level3: 'Learners regularly reflect, articulate progress, and update action steps.',
      level4: 'Students run their own academic conferences and demonstrate deep metacognition.'
    }
  },
  {
    standardNumber: 23,
    folderId: 23,
    title: 'Professional Learning Communities (PLCs)',
    characteristic: 'Engagement of Learning',
    statement: 'Educators collaborate through structured professional learning communities to examine student work.',
    keyElements: ['PLC meeting protocols', 'Analysis of student work', 'Collaborative lesson redesign'],
    sampleEvidence: ['PLC Team Meeting Minutes & Agendas', 'Common Formative Assessment Analysis Protocols', 'PLC Action Research Summaries', 'Curriculum Pacing Revisions'],
    keywords: ['plc', 'professional learning community', 'minutes', 'collaborative team', 'agenda', 'action research'],
    rubric: {
      level1: 'Teachers work in silos; PLCs are non-existent or administrative only.',
      level2: 'PLCs meet irregularly and focus on logistics rather than student data.',
      level3: 'Regular PLCs analyze common assessments to adjust teaching practices.',
      level4: 'High-performing PLCs relentlessly refine curriculum and share best practices.'
    }
  },

  // 24-31: Growth in Learning
  {
    standardNumber: 24,
    folderId: 24,
    title: 'Valid, Reliable & Fair Assessments',
    characteristic: 'Growth in Learning',
    statement: 'The institution maintains valid, reliable, and fair assessment measures aligned with standards.',
    keyElements: ['Assessment blueprints', 'Rubric calibration', 'Standardized benchmark integrity'],
    sampleEvidence: ['Assessment Policy & Framework', 'Standardized Test Calibration Minutes', 'Comprehensive Assessment Blueprint Matrix', 'Rubric Alignment Guide'],
    keywords: ['assessment', 'validity', 'reliability', 'blueprint', 'rubric', 'standardized', 'exam'],
    rubric: {
      level1: 'Assessments lack standardization, alignment, or quality control.',
      level2: 'Tests are standard-aligned but validity and calibration are untested.',
      level3: 'Comprehensive assessment matrix balances formative and summative metrics.',
      level4: 'Exemplary assessment systems are rigorously verified and norm-referenced.'
    }
  },
  {
    standardNumber: 25,
    folderId: 25,
    title: 'Systematic Assessment Data Analysis',
    characteristic: 'Growth in Learning',
    statement: 'Assessment data is systematically gathered, disaggregated, and analyzed across all subgroups.',
    keyElements: ['Disaggregated data by cohort', 'Longitudinal tracking', 'Equity gap analysis'],
    sampleEvidence: ['Disaggregated Cohort Performance Reports', 'Longitudinal Growth Tracking Spreadsheets', 'Subgroup Performance Heatmaps', 'Standardized Exam Trend Reports'],
    keywords: ['data analysis', 'disaggregated', 'longitudinal', 'cohort', 'subgroup', 'trend', 'heatmap'],
    rubric: {
      level1: 'Only overall grade averages are recorded without subgroup disaggregation.',
      level2: 'Data is disaggregated annually with limited deep trend analysis.',
      level3: 'Teams systematically analyze subgroup data to identify growth patterns.',
      level4: 'Advanced multidimensional data analytics drive predictive institutional growth.'
    }
  },
  {
    standardNumber: 26,
    folderId: 26,
    title: 'Targeted Interventions & Curriculum Shifts',
    characteristic: 'Growth in Learning',
    statement: 'Assessment results inform targeted instructional interventions and curriculum adjustments.',
    keyElements: ['RTI / MTSS tiers', 'Remediation protocols', 'Curricular updates based on gaps'],
    sampleEvidence: ['RTI / MTSS Intervention Tier Logs', 'Remediation Session Schedules & Rosters', 'Curriculum Revisions Documentation', 'Remediation Progress Monitoring Sheets'],
    keywords: ['intervention', 'remediation', 'rti', 'mtss', 'curriculum revision', 'support'],
    rubric: {
      level1: 'Failing students receive no systematic academic intervention.',
      level2: 'Tutoring is offered ad-hoc without formal progress monitoring.',
      level3: 'A structured multi-tiered intervention system (MTSS) assists learners.',
      level4: 'Precision interventions immediately close achievement gaps with verified data.'
    }
  },
  {
    standardNumber: 27,
    folderId: 27,
    title: 'Timely & Actionable Feedback',
    characteristic: 'Growth in Learning',
    statement: 'Learners receive timely, specific, descriptive feedback to guide their improvement.',
    keyElements: ['Formative descriptive feedback', 'Turnaround time', 'Opportunity for revision'],
    sampleEvidence: ['Feedback Rubric Exemplars', 'Teacher Marking Guidelines', 'Student Revision Logs', 'Digital Feedback Samples (LMS/Google Classroom)'],
    keywords: ['feedback', 'descriptive', 'turnaround', 'revision', 'grading', 'marking'],
    rubric: {
      level1: 'Feedback consists solely of numerical grades without explanatory comments.',
      level2: 'Comments are written but infrequent or too late to impact subsequent work.',
      level3: 'Descriptive, actionable feedback is given promptly with revision options.',
      level4: 'Continuous dialogue and descriptive feedback accelerate individual mastery.'
    }
  },
  {
    standardNumber: 28,
    folderId: 28,
    title: 'Progress Tracking & Family Communication',
    characteristic: 'Growth in Learning',
    statement: 'Student progress and achievement are consistently tracked and communicated to families.',
    keyElements: ['Parent portal access', 'Progress reports', 'Academic alerts'],
    sampleEvidence: ['Online Portal Gradebook Verification Logs', 'Mid-Term Progress Report Samples', 'At-Risk Student Parent Notification Letters', 'Parent Portal Usage Statistics'],
    keywords: ['progress report', 'gradebook', 'parent portal', 'communication', 'academic alert', 'report card'],
    rubric: {
      level1: 'Parents are notified only at the end of term or when failure occurs.',
      level2: 'Periodic report cards sent but online access is sporadic.',
      level3: 'Real-time portal access and regular progress updates keep parents informed.',
      level4: 'Seamless transparent reporting empowers active family-school collaboration.'
    }
  },
  {
    standardNumber: 29,
    folderId: 29,
    title: 'Comprehensive Student Support Services',
    characteristic: 'Growth in Learning',
    statement: 'Support services and counseling systematically address academic and behavioral challenges.',
    keyElements: ['Guidance counseling', 'Special education coordination', 'Health & wellness services'],
    sampleEvidence: ['Counseling Department Program Guide', 'Student Referral & Case Management Logs', 'Special Needs Accommodation Plans', 'Health Clinic Annual Service Report'],
    keywords: ['counseling', 'support services', 'referral', 'guidance', 'special education', 'health clinic'],
    rubric: {
      level1: 'Support services are minimal or uncoordinated.',
      level2: 'Counseling available upon request but lacks systematic follow-up.',
      level3: 'Coordinated academic, behavioral, and health support serves all learners.',
      level4: 'An integrated multi-disciplinary support system ensures every child thrives.'
    }
  },
  {
    standardNumber: 30,
    folderId: 30,
    title: 'Verifiable Long-Term Learner Growth',
    characteristic: 'Growth in Learning',
    statement: 'The institution systematically demonstrates steady, verifiable growth in student performance.',
    keyElements: ['Multi-year trend analysis', 'Value-added growth metrics', 'External exam gains'],
    sampleEvidence: ['Multi-Year Standardized Assessment Growth Trends', 'Value-Added Growth Analyses', 'Comparative National/International Percentile Reports', 'Subject-Wise Growth Graphs'],
    keywords: ['growth trend', 'value-added', 'standardized', 'percentile', 'multi-year', 'achievement gains'],
    rubric: {
      level1: 'No verifiable long-term learning growth data is available.',
      level2: 'Single-year snapshots exist with unclear multi-year trajectories.',
      level3: 'Documented multi-year trend data proves steady learning gains.',
      level4: 'Consistent exemplary growth across all student cohorts is statistically verified.'
    }
  },
  {
    standardNumber: 31,
    folderId: 31,
    title: 'Transition & Postsecondary Readiness',
    characteristic: 'Growth in Learning',
    statement: 'Graduation, transition, and postsecondary readiness rates reflect high expectations and equity.',
    keyElements: ['Graduation rate tracking', 'College/career counseling', 'Alumni tracking'],
    sampleEvidence: ['High School Graduation Rate Records', 'College Acceptance & Scholarship Lists', 'Career Readiness / Internship Logs', 'Alumni Transition Follow-Up Survey'],
    keywords: ['graduation', 'postsecondary', 'college', 'career readiness', 'alumni', 'scholarship', 'transition'],
    rubric: {
      level1: 'Transition support is absent; graduation tracking is basic.',
      level2: 'College visits organized but individualized career guidance is limited.',
      level3: 'Comprehensive transition planning ensures high graduation and college rates.',
      level4: 'Exemplary postsecondary readiness and global university acceptances abound.'
    }
  },

  // 32-35: Institutional Exhibits & Diagnostic Modules
  {
    standardNumber: 32,
    folderId: 32,
    title: 'Continuous Improvement Plan (CIP/SIP)',
    characteristic: 'Institutional Capacity',
    statement: 'The institution maintains a data-verified Continuous Improvement Plan with monitored KPIs.',
    keyElements: ['Annual plan goals', 'Quarterly milestone reviews', 'Resource commitments'],
    sampleEvidence: ['School Improvement Plan (Full Document)', 'Quarterly KPI Dashboard Reports', 'Action Item Implementation Log', 'Stakeholder Review Meeting Minutes'],
    keywords: ['continuous improvement', 'cip', 'sip', 'kpi', 'action plan', 'milestone', 'accreditation'],
    rubric: {
      level1: 'No written continuous improvement plan exists.',
      level2: 'Plan exists but milestones are not systematically tracked.',
      level3: 'Clear CIP with quarterly reviews and measured student performance targets.',
      level4: 'Institutionalized continuous improvement cycle drives perpetual school excellence.'
    }
  },
  {
    standardNumber: 33,
    folderId: 33,
    title: 'Accreditation Crosswalk & Exhibits',
    characteristic: 'Institutional Capacity',
    statement: 'A comprehensive evidence crosswalk maps school documentation directly to Cognia Standards.',
    keyElements: ['Evidence mapping table', 'Artifact verification', 'Accreditation readiness file'],
    sampleEvidence: ['Cognia Standards Evidence Crosswalk Matrix', 'Artifact Verification Checklist', 'External Review Visit Schedule', 'Self-Assessment Team Rosters'],
    keywords: ['crosswalk', 'exhibit', 'artifact', 'evidence mapping', 'external review', 'verification'],
    rubric: {
      level1: 'Evidence is scattered without mapping to Cognia standards.',
      level2: 'Partial list of documents mapped to select standards.',
      level3: 'Full crosswalk matrix links specific evidences to every Cognia standard.',
      level4: 'Flawless comprehensive crosswalk with rich multi-format evidence archives.'
    }
  },
  {
    standardNumber: 34,
    folderId: 34,
    title: 'Institutional Policies, Handbooks & Bylaws',
    characteristic: 'Institutional Capacity',
    statement: 'Published policies, staff and student handbooks ensure legal compliance and smooth operations.',
    keyElements: ['Staff handbook', 'Parent/Student handbook', 'Safety & Emergency manual'],
    sampleEvidence: ['Faculty & Staff Handbook', 'Student & Parent Handbook', 'Crisis Management & Safety Manual', 'Ministry Compliance & Licensing Docs'],
    keywords: ['handbook', 'policy manual', 'bylaws', 'crisis management', 'safety manual', 'compliance', 'license'],
    rubric: {
      level1: 'Handbooks are outdated or missing key legal and operational policies.',
      level2: 'Handbooks exist but lack annual updates or staff acknowledgments.',
      level3: 'Comprehensive updated handbooks are published and acknowledged annually.',
      level4: 'Model policy infrastructure compliant with international and local regulations.'
    }
  },
  {
    standardNumber: 35,
    folderId: 35,
    title: 'Self-Assessment Report (SAR) & Diagnostic',
    characteristic: 'Institutional Capacity',
    statement: 'The school completes a thorough Self-Assessment Report analyzing strengths and opportunities.',
    keyElements: ['Diagnostic self-rating', 'Executive summary', 'Stakeholder validation'],
    sampleEvidence: ['Cognia Self-Assessment Report (SAR)', 'Executive Summary for Review Team', 'Diagnostic Readiness Rubric Scores', 'Stakeholder Validation Sign-Offs'],
    keywords: ['self-assessment', 'sar', 'diagnostic', 'executive summary', 'validation', 'readiness rubric'],
    rubric: {
      level1: 'Self-assessment not yet initiated.',
      level2: 'Draft self-assessment with incomplete evidentiary citations.',
      level3: 'Comprehensive SAR with honest self-analysis and evidence citations.',
      level4: 'Master-level SAR validated by all stakeholder groups ready for review.'
    }
  }
];

export function evaluateAllModules(
  folders: CogniaFolder[],
  allFiles: FolderFile[]
): EvaluationResult {
  const folderMap = new Map<number, CogniaFolder>(folders.map((f) => [f.id, f]));
  const filesByFolder = new Map<number, FolderFile[]>();

  for (const file of allFiles) {
    const list = filesByFolder.get(file.folderId) || [];
    list.push(file);
    filesByFolder.set(file.folderId, list);
  }

  const moduleEvaluations: ModuleEvaluation[] = [];

  for (const std of COGNIA_STANDARDS_CATALOG) {
    const folder = folderMap.get(std.folderId);
    const files = filesByFolder.get(std.folderId) || [];
    const fileCount = files.length;

    const hasPdf = files.some((f) => f.extension.toLowerCase() === 'pdf');
    const hasSpreadsheet = files.some((f) => ['xlsx', 'xls', 'csv'].includes(f.extension.toLowerCase()));
    const hasMediaOrEmail = files.some((f) => 
      ['eml', 'msg', 'mp4', 'mp3', 'png', 'jpg', 'jpeg', 'psd'].includes(f.extension.toLowerCase())
    );

    // Analyze evidence matches
    const matchedEvidences: string[] = [];
    const missingEvidences: string[] = [];

    // Check each sample evidence
    std.sampleEvidence.forEach((evidence) => {
      const evLower = evidence.toLowerCase();
      const match = files.some((f) => {
        const nameLower = f.name.toLowerCase();
        const notesLower = (f.notes || '').toLowerCase();
        const subfolderLower = (f.subfolder || '').toLowerCase();
        return (
          std.keywords.some((kw) => nameLower.includes(kw) || notesLower.includes(kw) || subfolderLower.includes(kw)) ||
          evLower.split(' ').some((word) => word.length > 4 && (nameLower.includes(word) || notesLower.includes(word)))
        );
      });

      if (match) {
        matchedEvidences.push(evidence);
      } else {
        missingEvidences.push(evidence);
      }
    });

    // Score calculation (0 to 100)
    // 0 files -> 0 score
    // 1 file -> baseline 35-45
    // 2 files -> 55-70
    // 3+ files with diverse formats -> 80-100
    let score = 0;
    if (fileCount === 0) {
      score = 0;
    } else if (fileCount === 1) {
      score = 35 + (hasPdf ? 10 : 5);
    } else if (fileCount === 2) {
      score = 60 + (hasPdf ? 8 : 4) + (hasSpreadsheet || hasMediaOrEmail ? 7 : 0);
    } else {
      score = 80 + Math.min(15, (fileCount - 3) * 3) + (hasPdf ? 3 : 0) + (hasSpreadsheet ? 2 : 0);
    }
    score = Math.min(100, Math.max(0, score));

    // Rubric assignment
    let level: 1 | 2 | 3 | 4 = 1;
    let levelLabel = 'Level 1: Insufficient';
    let levelUrdu = 'لیول 1: ناکافی (محنت درکار ہے)';
    let status: 'critical' | 'needs-work' | 'operational' | 'exemplary' = 'critical';
    let statusLabel = 'Critical Gap';
    let statusUrdu = 'شدید ضرورت ہے';

    if (score >= 85) {
      level = 4;
      levelLabel = 'Level 4: Exemplary';
      levelUrdu = 'لیول 4: مثالی اور پائیدار';
      status = 'exemplary';
      statusLabel = 'Accreditation Ready';
      statusUrdu = 'مکمل اور بہترین';
    } else if (score >= 60) {
      level = 3;
      levelLabel = 'Level 3: Operational';
      levelUrdu = 'لیول 3: تسلی بخش و معیاری';
      status = 'operational';
      statusLabel = 'Operational';
      statusUrdu = 'معیاری پیشرفت';
    } else if (score >= 30) {
      level = 2;
      levelLabel = 'Level 2: Emerging';
      levelUrdu = 'لیول 2: ابتدائی کام جاری ہے';
      status = 'needs-work';
      statusLabel = 'Needs Work';
      statusUrdu = 'کام جاری ہے';
    } else {
      level = 1;
      levelLabel = 'Level 1: Insufficient';
      levelUrdu = 'لیول 1: فوری محنت کی ضرورت ہے';
      status = 'critical';
      statusLabel = 'Missing Evidence';
      statusUrdu = 'فوری محنت درکار';
    }

    // Recommendations in Urdu and English
    let recommendationUrdu = '';
    let recommendationEn = '';

    if (fileCount === 0) {
      recommendationUrdu = `اس ماڈیول میں کوئی ثبوت موجود نہیں ہے۔ فوری طور پر "${missingEvidences[0] || 'متعلقہ پالیسی یا دستاویز'}" اپلوڈ کریں۔`;
      recommendationEn = `No evidence documents uploaded. Upload "${missingEvidences[0] || 'relevant policy or logs'}" immediately.`;
    } else if (score < 60) {
      recommendationUrdu = `لیول 3 تک پہنچنے کے لیے مزید ثبوت شامل کریں، خاص طور پر: "${missingEvidences[0] || 'میٹنگ کے منٹس یا جائزہ رپورٹ'}".`;
      recommendationEn = `To reach Operational Level 3, provide additional proof like: "${missingEvidences[0] || 'meeting minutes or assessment report'}".`;
    } else if (score < 85) {
      recommendationUrdu = `شاندار کام جاری ہے۔ مثالی لیول 4 کے لیے مکمل ثبوت جیسے "${missingEvidences[0] || 'مستقل نگرانی ڈیٹا'}" شامل کریں۔`;
      recommendationEn = `Great progress. Add "${missingEvidences[0] || 'longitudinal tracking data'}" to qualify for Level 4 Exemplary.`;
    } else {
      recommendationUrdu = `یہ ماڈیول مکمل اور کاگنیا ایکریڈیٹیشن کے لیے مثالی ہے۔ تمام ضروری دستاویزات محفوظ ہیں۔`;
      recommendationEn = `This standard is fully documented and audit-ready according to Cognia criteria.`;
    }

    moduleEvaluations.push({
      folderId: std.folderId,
      standardNumber: std.standardNumber,
      standardName: folder?.name || std.title,
      characteristic: std.characteristic,
      score,
      level,
      levelLabel,
      levelUrdu,
      status,
      statusLabel,
      statusUrdu,
      fileCount,
      hasPdf,
      hasSpreadsheet,
      hasMediaOrEmail,
      matchedEvidences,
      missingEvidences,
      recommendationUrdu,
      recommendationEn,
    });
  }

  // Calculate overall score
  const totalScore = moduleEvaluations.reduce((sum, m) => sum + m.score, 0);
  const overallScore = Math.round(totalScore / moduleEvaluations.length);

  // Overall level
  let overallLevel: 1 | 2 | 3 | 4 = 1;
  let overallLevelLabel = 'Level 1: Insufficient';
  let overallLevelUrdu = 'لیول 1: ناکافی (سخت محنت درکار ہے)';

  if (overallScore >= 85) {
    overallLevel = 4;
    overallLevelLabel = 'Level 4: Exemplary (Cognia Ready)';
    overallLevelUrdu = 'لیول 4: مثالی تیاری (کاگنیا ریڈی)';
  } else if (overallScore >= 60) {
    overallLevel = 3;
    overallLevelLabel = 'Level 3: Operational';
    overallLevelUrdu = 'لیول 3: تسلی بخش و آپریشنل';
  } else if (overallScore >= 30) {
    overallLevel = 2;
    overallLevelLabel = 'Level 2: Emerging';
    overallLevelUrdu = 'لیول 2: ابتدائی مرحلہ (کام جاری ہے)';
  }

  // Characteristics breakdown
  const charGroups: Record<string, { total: number; scoreSum: number; files: number; popCount: number; color: string; urdu: string }> = {
    'Culture of Learning': { total: 0, scoreSum: 0, files: 0, popCount: 0, color: '#1B5E20', urdu: 'سیکھنے کا ماحول و کلچر' },
    'Leadership for Learning': { total: 0, scoreSum: 0, files: 0, popCount: 0, color: '#D97706', urdu: 'تعلیمی قیادت و گورننس' },
    'Engagement of Learning': { total: 0, scoreSum: 0, files: 0, popCount: 0, color: '#0284C7', urdu: 'طلبہ کی سرگرمی و تدریس' },
    'Growth in Learning': { total: 0, scoreSum: 0, files: 0, popCount: 0, color: '#7C3AED', urdu: 'تعلیمی پیشرفت و نتائج' },
    'Institutional Capacity': { total: 0, scoreSum: 0, files: 0, popCount: 0, color: '#0D9488', urdu: 'ادارہ جاتی تیاری و پالیسیاں' },
  };

  moduleEvaluations.forEach((m) => {
    const grp = charGroups[m.characteristic] || charGroups['Institutional Capacity'];
    grp.total += 1;
    grp.scoreSum += m.score;
    grp.files += m.fileCount;
    if (m.fileCount > 0) grp.popCount += 1;
  });

  const characteristics: CharacteristicSummary[] = Object.entries(charGroups).map(([name, data]) => {
    const avgScore = data.total > 0 ? Math.round(data.scoreSum / data.total) : 0;
    let lvl = 'Level 1: Insufficient';
    if (avgScore >= 85) lvl = 'Level 4: Exemplary';
    else if (avgScore >= 60) lvl = 'Level 3: Operational';
    else if (avgScore >= 30) lvl = 'Level 2: Emerging';

    return {
      name,
      nameUrdu: data.urdu,
      score: avgScore,
      totalStandards: data.total,
      populatedStandards: data.popCount,
      totalFiles: data.files,
      level: lvl,
      color: data.color,
    };
  });

  // Priority Gaps: modules where score < 60, sorted by lowest score first
  const priorityGaps = [...moduleEvaluations]
    .filter((m) => m.score < 60)
    .sort((a, b) => a.score - b.score || a.folderId - b.folderId);

  const operationalModules = [...moduleEvaluations]
    .filter((m) => m.score >= 60)
    .sort((a, b) => b.score - a.score);

  const populatedModules = moduleEvaluations.filter((m) => m.fileCount > 0).length;

  const summaryTextUrdu = `کاگنیا پورٹل تجزیہ: کل تیاری ${overallScore}% ہے۔ ${priorityGaps.length} ماڈیولز میں فوری محنت درکار ہے جبکہ ${operationalModules.length} ماڈیولز معیاری حالت میں ہیں۔`;
  const summaryTextEn = `Cognia Portal Audit: Overall readiness is at ${overallScore}%. ${priorityGaps.length} modules require immediate evidence work, and ${operationalModules.length} modules meet or exceed operational standards.`;

  return {
    overallScore,
    level: overallLevel,
    levelLabel: overallLevelLabel,
    levelUrdu: overallLevelUrdu,
    summaryTextUrdu,
    summaryTextEn,
    characteristics,
    moduleEvaluations,
    priorityGaps,
    operationalModules,
    totalFiles: allFiles.length,
    totalModules: moduleEvaluations.length,
    populatedModules,
    evaluatedAt: new Date().toISOString(),
  };
}
