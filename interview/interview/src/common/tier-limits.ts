// -1 means unlimited

export const TIER_LIMITS: Record<string, { interviews: number; resumes: number; chatbot: number }> = {
  free:         { interviews: 3,  resumes: 3,  chatbot: 20 },
  basic:        { interviews: 3,  resumes: 3,  chatbot: 20 },
  professional: { interviews: 15, resumes: 10, chatbot: -1 },
  elite:        { interviews: -1, resumes: -1, chatbot: -1 },
};

export function getLimits(tier: string) {
  return TIER_LIMITS[tier?.toLowerCase()] ?? TIER_LIMITS['basic'];
}
