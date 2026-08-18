import { SequentialAgent } from '@google/adk';
import { draftAgent } from './agents/draft-agent.js';
import { reviewAgent } from './agents/review-agent.js';

// The SequentialAgent is the "coordinator": it doesn't think or write
// anything itself, it just guarantees DraftAgent always runs BEFORE
// ReviewAgent, and that ReviewAgent can read state['draft_handoff'] that
// DraftAgent wrote. Deterministic order, not LLM-decided order.
export const rootAgent = new SequentialAgent({
  name: 'OncallHandoffCoordinator',
  description:
    'Drafts an on-call handoff note, then reviews it for completeness before handoff.',
  subAgents: [draftAgent, reviewAgent],
});
