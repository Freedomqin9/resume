export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "AI_SERVICE_ERROR"
  | "LIMIT_EXCEEDED"
  | "DATABASE_ERROR";

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      message: string;
      error: null;
    }
  | {
      success: false;
      data: null;
      message: string;
      error: {
        code: ApiErrorCode;
        detail: string;
      };
    };

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type Profile = {
  id: string;
  userId: string;
  name: string;
  currentCity: string;
  targetCities: string;
  education: string;
  major: string;
  graduationYear: string;
  workYears: string;
  currentStatus: string;
  targetRoles: string;
  backupRoles: string;
  expectedSalary: string;
  minSalary: string;
  rejectedRoles: string;
  rejectedIndustries: string;
  workExperience: string;
  projectExperience: string;
  skills: string;
  careerGoal: string;
  aiSummary?: string;
  profileCompletion: number;
  updatedAt: string;
};

export type ExtractedRequirements = {
  jobType: string;
  coreResponsibilities: string[];
  hardRequirements: string[];
  softRequirements: string[];
  skills: string[];
  experienceRequirement: string;
  educationRequirement: string;
  hiddenRequirements: string[];
  riskSignals: string[];
};

export type Job = {
  id: string;
  userId: string;
  title: string;
  company: string;
  city: string;
  salary: string;
  source: string;
  url: string;
  jdText: string;
  extractedRequirements?: ExtractedRequirements;
  createdAt: string;
  updatedAt: string;
};

export type MatchLevel =
  | "strongly_recommended"
  | "recommended"
  | "cautious"
  | "not_recommended";

export type MatchReport = {
  id: string;
  userId: string;
  jobId: string;
  totalScore: number;
  matchLevel: MatchLevel;
  skillScore: number;
  experienceScore: number;
  directionScore: number;
  growthScore: number;
  successScore: number;
  salaryCityScore: number;
  matchReasons: string[];
  riskPoints: string[];
  resumeSuggestions: string[];
  interviewSuggestions: string[];
  nextAction: string;
  createdAt: string;
};

export type ResumeMode = "conservative" | "enhanced" | "career_transition";

export type ResumeVersion = {
  id: string;
  userId: string;
  jobId: string;
  matchReportId: string;
  resumeTitle: string;
  resumeType: ResumeMode;
  summary: string;
  skillsSection: string;
  workSection: string;
  projectSection: string;
  selfEvaluation: string;
  hrMessage: string;
  interviewIntro: string;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationStatus =
  | "to_analyze"
  | "ready_to_apply"
  | "applied"
  | "follow_up"
  | "interview_scheduled"
  | "first_round_done"
  | "second_round_done"
  | "rejected"
  | "offer"
  | "abandoned";

export type Application = {
  id: string;
  userId: string;
  jobId: string;
  resumeId?: string;
  status: ApplicationStatus;
  appliedAt?: string;
  nextFollowUpAt?: string;
  contactInfo: string;
  notes: string;
  feedback: string;
  createdAt: string;
  updatedAt: string;
};
