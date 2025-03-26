// express-better/context.ts
import { 
  ExpressionRefinementInput, 
  ExpressionAnalysis, 
  SocialSituation, 
  SocialAnalysis 
} from './types';
import { useState } from 'react';

// Initialize Gemini
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not set in environment variables');
}

const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-002:generateContent';

const refineExpressionPrompt = (input: ExpressionRefinementInput) => `
You are a supportive communication coach helping someone with ADHD/High Functioning Autism express themselves better. Analyze their message with empathy and provide detailed, constructive feedback.

Message to analyze: "${input.content}"
Communication Context: ${input.context}
Speaking to: ${input.audience}
Goal: ${input.goal}

Provide a detailed analysis in this exact JSON format:
{
  "messageBreakdown": {
    "mainIdea": "The core message they want to convey",
    "supportingPoints": ["Important details that help explain their point"],
    "actionNeeded": "What they'd like the other person to do"
  },
  "communicationFeedback": {
    "toneFeedback": [
      {
        "whatWeNoticed": "Observation about tone in a specific part",
        "howItMightAffect": "How this tone might impact the listener",
        "gentlerWay": "A more effective way to express the same thing"
      }
    ],
    "clarityFeedback": [
      {
        "unclearPart": "Part that might be confusing",
        "whyItMatters": "Why being clearer here would help",
        "clearerWay": "How to make this part more understandable"
      }
    ],
    "contextFeedback": [
      {
        "missingInfo": "Important background information that's missing",
        "whyItHelps": "Why adding this information would help",
        "howToAdd": "Natural way to include this information"
      }
    ]
  },
  "contextHelp": {
    "situation": "${input.context}",
    "commonChallenges": [
      {
        "challenge": "Common ADHD/autism challenge in this type of communication",
        "whyItHappens": "Why this challenge occurs",
        "howToHandle": "Practical strategy to handle this challenge"
      }
    ],
    "helpfulTips": [
      {
        "tip": "Specific tip for this communication context",
        "example": "Example of how to apply this tip"
      }
    ]
  },
  "emotionalGuidance": {
    "emotionalAwareness": {
      "yourFeeling": "Emotion detected in the message",
      "understandingWhy": "Validation of why they might feel this way",
      "impactOnOthers": "How these emotions might be received"
    },
    "balancedExpression": {
      "challenge": "What's challenging about expressing this",
      "validation": "Acknowledging the validity of their feelings",
      "betterApproach": "How to express these feelings effectively"
    }
  },
  "improvedVersion": {
    "suggestion": "A revised version of their message",
    "explanation": "Why these changes help"
  }
}

Remember to:
1. Be supportive and understanding
2. Explain 'why' for each suggestion
3. Keep feedback constructive and specific
4. Focus on both clarity and emotional impact
5. Provide practical, actionable advice`;

const analyzeSocialSituationPrompt = (situation: SocialSituation) => `
Help understand this social situation from an ADHD/HFA perspective:

Situation: "${situation.situation}"
People Involved: ${situation.peopleInvolved.join(', ')}
User's Reaction: ${situation.userReaction}
Others' Reactions: ${situation.othersReactions}
Confusing Aspects: ${situation.confusingAspects}

Provide a detailed analysis in this exact JSON format:
{
  "missedCues": ["social cues that might have been missed"],
  "perspectives": [
    {
      "person": "person involved",
      "viewpoint": "their perspective",
      "reasoning": "why they might have felt/acted this way"
    }
  ],
  "socialRules": ["relevant unwritten social rules"],
  "patterns": ["patterns to recognize in similar situations"]
}`;

async function makeGeminiRequest(prompt: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const response = await fetch(`${API_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || response.statusText);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text.trim();
  
  // Remove markdown code block formatting if present
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

export const refineExpression = async (
  input: ExpressionRefinementInput
): Promise<ExpressionAnalysis> => {
  const responseText = await makeGeminiRequest(refineExpressionPrompt(input));
  return JSON.parse(responseText);
};

export const analyzeSocialSituation = async (
  situation: SocialSituation
): Promise<SocialAnalysis> => {
  const responseText = await makeGeminiRequest(analyzeSocialSituationPrompt(situation));
  return JSON.parse(responseText);
};

export const useExpressionRefinement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refineExpression = async (input: ExpressionRefinementInput): Promise<ExpressionAnalysis> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        throw new Error('Failed to refine expression');
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    refineExpression,
    isLoading,
    error,
  };
};

