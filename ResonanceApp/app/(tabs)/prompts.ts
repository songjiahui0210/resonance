// express-better/utils/prompts.ts

export const defaultPrompts = {
  professional: {
    title: "Professional Communication",
    description: "Refine your professional emails, messages, or presentations",
    examples: [
      "Requesting a deadline extension",
      "Asking for clarification",
      "Providing project updates",
      "Giving constructive feedback"
    ]
  },
  personal: {
    title: "Personal Relationships",
    description: "Express yourself better in personal relationships",
    examples: [
      "Setting boundaries",
      "Expressing needs",
      "Resolving conflicts",
      "Sharing feelings"
    ]
  },
  social: {
    title: "Social Situations",
    description: "Navigate social interactions more effectively",
    examples: [
      "Joining group conversations",
      "Responding to invitations",
      "Handling misunderstandings",
      "Making new connections"
    ]
  }
};

export const defaultContexts = [
  "Work/Professional",
  "Friends/Family",
  "Romantic Relationship",
  "Social Gathering",
  "Online Communication",
  "Academic Setting",
  "Healthcare",
  "Customer Service"
];

export const defaultAudiences = [
  "Supervisor/Manager",
  "Colleague",
  "Friend",
  "Family Member",
  "Partner",
  "Acquaintance",
  "Service Provider",
  "Group/Team"
];

export const defaultGoals = [
  "Clarify my message",
  "Express my feelings",
  "Set boundaries",
  "Ask for help",
  "Provide feedback",
  "Resolve conflict",
  "Make a request",
  "Share information"
]; 