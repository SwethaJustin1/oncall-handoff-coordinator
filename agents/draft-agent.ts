import { LlmAgent } from '@google/adk';
import { getOncallLog } from '../tools/get-oncall-log.js';

const GEMINI_MODEL = 'gemini-flash-latest';

// AGENT 1 of 2: writes the first draft of the handoff note.
// Its only job is to summarize - it is not responsible for checking quality.
export const draftAgent = new LlmAgent({
  name: 'DraftAgent',
  model: GEMINI_MODEL,
  description: 'Drafts the on-call shift handoff note from the incident log.',
  instruction: `You are an on-call handoff writer for an SRE/AIOps team.

Call the get_oncall_log tool to fetch today's shift data, then write a
handoff note for the incoming on-call engineer. The note must:
- List every incident with its severity, one-line summary, and current status
- Clearly separate "fully resolved" incidents from "still watching / open"
  incidents
- Include every item from open_followups, verbatim
- Be written in plain, calm, professional language - this is read by a
  tired human at the start of their shift, not a dashboard

Output ONLY the handoff note text. No preamble, no "Here is the note:".`,
  tools: [getOncallLog],
  outputKey: 'draft_handoff', // saved to session state as state['draft_handoff']
});
