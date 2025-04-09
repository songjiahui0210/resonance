// express-better/utils/types.ts

export interface ExpressionRefinementInput {
  content: string;
  context: string;
  audience: string;
  goal: string;
}

export interface MessageBreakdown {
  mainIdea: string;
  supportingPoints: string[];
  actionNeeded: string;
}

export interface ToneFeedback {
  whatWeNoticed: string;
  howItMightAffect: string;
  gentlerWay: string;
}

export interface ClarityFeedback {
  unclearPart: string;
  whyItMatters: string;
  clearerWay: string;
}

export interface ContextFeedback {
  missingInfo: string;
  whyItHelps: string;
  howToAdd: string;
}

export interface CommunicationFeedback {
  toneFeedback: ToneFeedback[];
  clarityFeedback: ClarityFeedback[];
  contextFeedback: ContextFeedback[];
}

export interface CommonChallenge {
  challenge: string;
  whyItHappens: string;
  howToHandle: string;
}

export interface HelpfulTip {
  tip: string;
  example: string;
}

export interface ContextHelp {
  situation: string;
  commonChallenges: CommonChallenge[];
  helpfulTips: HelpfulTip[];
}

export interface EmotionalAwareness {
  yourFeeling: string;
  understandingWhy: string;
  impactOnOthers: string;
}

export interface BalancedExpression {
  challenge: string;
  validation: string;
  betterApproach: string;
}

export interface EmotionalGuidance {
  emotionalAwareness: EmotionalAwareness;
  balancedExpression: BalancedExpression;
}

export interface ImprovedVersion {
  suggestion: string;
  explanation: string;
}

export interface ExpressionAnalysis {
  messageBreakdown: MessageBreakdown;
  communicationFeedback: CommunicationFeedback;
  contextHelp: ContextHelp;
  emotionalGuidance: EmotionalGuidance;
  improvedVersion: ImprovedVersion;
}

export interface SocialSituation {
  situation: string;
  peopleInvolved: string[];
  userReaction: string;
  othersReactions: string;
  confusingAspects: string;
}

export interface Perspective {
  person: string;
  viewpoint: string;
  reasoning: string;
}

export interface SocialAnalysis {
  missedCues: string[];
  perspectives: Perspective[];
  socialRules: string[];
  patterns: string[];
}

export type CommunicationContext = 'email' | 'conversation' | 'meeting' | 'presentation' | 'feedback' | 'request';

export interface AnalysisSection {
  isVisible: boolean;
  isRead: boolean;
}

export interface AnalysisState {
  sections: {
    message: AnalysisSection;
    improvement: AnalysisSection;
    emotions: AnalysisSection;
    suggestion: AnalysisSection;
    tips: AnalysisSection;
  };
  currentSection: keyof AnalysisState['sections'];
} 