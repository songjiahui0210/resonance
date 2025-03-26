export const generateContextPrompt = (userInput: string): string => {
  return `
User input: "${userInput}"

Analyze this situation considering ADHD/autism characteristics:
1. Identify the core elements:
   - Setting (where/when)
   - People involved (who)
   - Challenge type (what)
   - Current impact (how)

2. Categorize the primary need:
   - Communication need
   - Social understanding
   - Emotional expression
   - Boundary setting
   - Conflict resolution
   - Information processing
   - Other

Return JSON:
{
  "setting": "",
  "people_involved": "",
  "challenge_type": "",
  "current_impact": "",
  "primary_need": "",
  "secondary_needs": []
}`;
};
