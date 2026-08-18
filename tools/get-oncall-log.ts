import { FunctionTool } from '@google/adk';
import { z } from 'zod';

// The mock on-call log is embedded directly here rather than read from
// mock-data/oncall-log.json at runtime. ADK's devtools (npx adk web /
// npx adk run) transpile and execute agent code from a temp working
// directory, which breaks any relative file path - both __dirname- and
// process.cwd()-based lookups fail. Embedding the data sidesteps that
// entirely. mock-data/oncall-log.json is kept in the repo as the
// human-readable source of truth; keep both in sync if you edit the data.
const ONCALL_LOG = {
  shift_date: '2026-08-17',
  on_call_engineer: 'Priya N.',
  incidents: [
    {
      id: 'INC-4471',
      severity: 'SEV2',
      title: 'Checkout API latency spike',
      status: 'resolved',
      opened: '09:12',
      closed: '09:58',
      notes:
        'Rolled back a bad deploy on payments-service. Metrics returned to baseline within 15 min of rollback.',
    },
    {
      id: 'INC-4472',
      severity: 'SEV3',
      title: 'Elevated 5xx on search-service',
      status: 'resolved',
      opened: '11:30',
      closed: '11:45',
      notes: 'Auto-scaled search-service pods; error rate dropped after scale-up.',
    },
    {
      id: 'INC-4473',
      severity: 'SEV1',
      title: 'Database replica lag on orders-db',
      status: 'watching',
      opened: '14:05',
      closed: null,
      notes:
        "Replica lag reduced from 340s to 40s after killing a long-running query, but hasn't fully returned to baseline (<5s). Flagged for next shift to keep monitoring.",
    },
    {
      id: 'INC-4474',
      severity: 'SEV3',
      title: 'Alert noise from staging cluster',
      status: 'resolved',
      opened: '16:20',
      closed: '16:22',
      notes:
        'False positive, staging monitor misconfigured. Ticket filed to fix the alert threshold, not urgent.',
    },
  ],
  open_followups: [
    'Fix staging alert threshold for INC-4474 (low priority, ticket OPS-891)',
    'Confirm orders-db replica lag returns to baseline (INC-4473)',
  ],
};

// A FunctionTool is just a plain function wrapped with a name, description,
// and a Zod schema describing its inputs. The LLM decides WHEN to call it
// based on the description - we don't call it manually.
export const getOncallLog = new FunctionTool({
  name: 'get_oncall_log',
  description:
    "Returns today's on-call shift log: every incident that was opened, " +
    'its severity, status, timestamps, resolution notes, and any open follow-ups. ' +
    'Call this first, before drafting a handoff.',
  parameters: z.object({}), // no inputs needed - it always returns the current shift log
  execute: () => ONCALL_LOG,
});
