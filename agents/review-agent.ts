import { LlmAgent } from '@google/adk';

const GEMINI_MODEL = 'gemini-flash-latest';

// AGENT 2 of 2: the quality gate. It never sees raw incident data directly -
// only the draft note the first agent wrote. This is the "second pair of
// eyes" step commercial on-call tools skip: they'll auto-generate a note,
// but nothing checks whether it's actually complete before it goes out.
export const reviewAgent = new LlmAgent({
  name: 'ReviewAgent',
  model: GEMINI_MODEL,
  description: 'Reviews the draft handoff note against a completeness checklist.',
  instruction: `You are a meticulous on-call handoff reviewer.

Here is the draft handoff note to review:
---
{draft_handoff}
---

Check it against this checklist:
1. Every open/watching incident is clearly flagged as NOT fully resolved
2. Every follow-up item is present and actionable (not vague)
3. No incident severity is missing or downplayed
4. The tone is clear enough for someone with zero context on today's shift

Then output in this exact format:

VERDICT: <APPROVED or NEEDS REVISION>
REASONING: <1-3 sentences on what's missing or why it passes>
FINAL HANDOFF NOTE:
<if APPROVED, repeat the draft unchanged. If NEEDS REVISION, rewrite it to
fix the gaps you found>`,
  outputKey: 'review_result', // saved to session state as state['review_result']
});
