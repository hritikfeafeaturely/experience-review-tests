// Type definitions for Experience Review Test Data

export interface Persona {
  title: string;
  description: string;
  location: string;
  reasoning: string;
}

export interface TargetAudienceData {
  code: number;
  status: number;
  data: {
    domain: string;
    personas: Persona[];
  };
}

export interface LLMRecommendation {
  id: string;
  category: string;
  title: string;
  explanation: string;
  principle: string;
  impact: string;
}

export interface UsabilityHeuristics {
  score: number;
  max_score: number;
  description: string;
}

export interface VisualDesign {
  score: number;
  max_score: number;
  description: string;
}

export interface ModernUXPractices {
  score: number;
  max_score: number;
  description: string;
}

export interface DesignScore {
  total_score: number;
  usability_heuristics: UsabilityHeuristics;
  visual_design: VisualDesign;
  modern_ux_practices: ModernUXPractices;
  improvement_potential: string;
}

export interface LLMResponse {
  design_score: DesignScore;
  recommendations: LLMRecommendation[];
}

export interface ExperienceReviewRecommendation {
  title: string;
  recommendation: string;
  tags: string;
}

export interface UXJustification {
  category: string;
  score: number;
  description: string;
}

export interface UXScore {
  design_score: number;
  justification: UXJustification[];
  improvement_potential: string;
}

export interface UXLawRecommendation {
  title: string;
  recommendation: string;
  tags: string;
}

export interface UXLaws {
  recommendations: UXLawRecommendation[];
}

export interface NextAction {
  action: string;
  href: string;
  method: string;
  description: string;
  data?: any;
}

export interface ExperienceReviewResponse {
  step_id: string;
  action: string;
  status: string;
  result: {
    recommendations: ExperienceReviewRecommendation[];
    ux_score: UXScore;
    ux_laws: UXLaws;
  };
  next_actions?: NextAction[];
  execution_time_ms?: number;
}

export interface SessionData {
  [key: string]: any;
}

export interface ReviewRecord {
  name: string;
  url: string;
  screenshotUrl: string;
  companyInfo: string;
  targetAudience: TargetAudienceData | null;
  actions: string[];
  emotions: string[];
  llmResponse: LLMResponse | null;
  personaTaskIds: string;
  personaUserData: string;
  sessionData: SessionData | null;
  experienceReviewResponse: ExperienceReviewResponse | null;
}

export interface ParsedData {
  records: ReviewRecord[];
  generatedAt: string;
}

