// types.ts
export type Intensity = 'Mild' | 'Medium' | 'Strong';

export type ContextAnalysis = {
  setting: string;
  people_involved: string;
  challenge_type: string;
  current_impact: string;
  primary_need: string;
  secondary_needs: string[];
};

export type CommunicationStrategy = {
  opening_statements: string[];
  explanation_approaches: string[];
  needs_expression: string[];
};

export type UserInteraction = {
  id: string;
  timestamp: Date;
  input: string;
  context_analysis: ContextAnalysis;
  intensity: Intensity;
  selected_strategies: {
    strategy: string;
    success_rating: number;
    feedback: string;
  }[];
};

export type StorageData = {
  interactions: UserInteraction[];
  patterns: {
    similar_situations: string[];
    successful_approaches: string[];
    areas_for_improvement: string[];
  };
};

export type CommunicationContext = 'email' | 'conversation' | 'meeting' | 'presentation' | 'feedback' | 'request' | 'other';

export type ExpressionRefinementInput = {
  content: string;
  context: CommunicationContext;
  audience: string;
  goal: string;
};

export type MessageBreakdown = {
  mainIdea: string;              // The core message you want to convey
  supportingPoints: string[];    // Important details that help explain your point
  actionNeeded: string;          // What you'd like the other person to do
};

export type CommunicationFeedback = {
  toneFeedback: {
    whatWeNoticed: string;      // Observation about tone
    howItMightAffect: string;   // Potential impact on others
    gentlerWay: string;         // How to say it more effectively
  }[];
  clarityFeedback: {
    unclearPart: string;        // Part that might confuse others
    whyItMatters: string;       // Why clarity is needed here
    clearerWay: string;         // How to make it clearer
  }[];
  contextFeedback: {
    missingInfo: string;        // Important background that's missing
    whyItHelps: string;         // Why this information is helpful
    howToAdd: string;          // How to include this information
  }[];
};

export type ContextHelp = {
  situation: CommunicationContext;
  commonChallenges: {
    challenge: string;
    whyItHappens: string;
    howToHandle: string;
  }[];
  helpfulTips: {
    tip: string;
    example: string;
  }[];
};

export type EmotionalGuidance = {
  emotionalAwareness: {
    yourFeeling: string;        // Emotion detected in your message
    understandingWhy: string;   // Why you might feel this way
    impactOnOthers: string;     // How others might perceive it
  };
  balancedExpression: {
    challenge: string;          // What's challenging about this situation
    validation: string;         // Acknowledging your feelings
    betterApproach: string;     // How to express it effectively
  };
};

export type ExpressionAnalysis = {
  messageBreakdown: MessageBreakdown;
  communicationFeedback: CommunicationFeedback;
  contextHelp: ContextHelp;
  emotionalGuidance: EmotionalGuidance;
  improvedVersion: {
    suggestion: string;
    explanation: string;
  };
};

export type SocialSituation = {
  situation: string;
  peopleInvolved: string[];
  userReaction: string;
  othersReactions: string;
  confusingAspects: string;
};

export type SocialAnalysis = {
  missedCues: string[];
  perspectives: {
    person: string;
    viewpoint: string;
    reasoning: string;
  }[];
  socialRules: string[];
  patterns: string[];
};

export type AnalysisSection = 
  | 'message'
  | 'improvement'
  | 'tips'
  | 'emotions'
  | 'suggestion';

export interface SectionState {
  isVisible: boolean;
  isRead: boolean;
}

export interface AnalysisState {
  sections: Record<AnalysisSection, SectionState>;
  currentSection: AnalysisSection;
}