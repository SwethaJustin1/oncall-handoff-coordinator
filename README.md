# On-Call Handoff Coordinator

A 2-agent pipeline, built with **Google ADK for TypeScript**, that drafts an
on-call shift handoff note and then reviews it for completeness before it
goes to the next engineer.

## Why this exists

Tools like PagerDuty and Opsgenie can auto-generate a handoff summary from
your incident data, but nothing double-checks that summary before it's sent.
If the auto-generated note quietly drops an unresolved incident or a
follow-up item, the next on-call engineer starts their shift blind.

This project adds that missing second pass: one agent drafts the note,
a second agent independently reviews it against a checklist and either
approves it or rewrites it - the same "verify before you trust the output"
pattern used in `closed-loop-verifier`, applied to a different problem.

## How it works

```
Incident log (mock-data/oncall-log.json)
        │
        ▼
┌─────────────────┐      writes state['draft_handoff']
│   Draft Agent    │ ───────────────────────────────────┐
│  (LlmAgent)       │                                     │
└─────────────────┘                                     ▼
                                              ┌─────────────────┐
                                              │  Review Agent    │
                                              │  (LlmAgent)       │
                                              └─────────────────┘
                                                          │
                                                          ▼
                                          VERDICT + final handoff note
```

- **Draft Agent** calls a `FunctionTool` (`get_oncall_log`) to fetch today's
  mock incident log, then writes a first-pass handoff note.
- **Review Agent** never sees the raw incident data - only the draft. It
  checks the draft against a 4-point checklist (open incidents flagged,
  follow-ups present, no severity dropped, tone is clear) and either
  approves it or rewrites it.
- A `SequentialAgent` (`OncallHandoffCoordinator`) guarantees the Draft Agent
  always runs first, and passes data between agents via ADK's session
  `outputKey` mechanism - no manual plumbing required.

This is the **sequential multi-agent pattern**: deterministic order, agents
communicating through shared session state rather than direct function calls.

## Project structure

```
oncall-handoff-coordinator/
├── agent.ts                  # root agent: wires Draft → Review
├── agents/
│   ├── draft-agent.ts         # writes the first draft
│   └── review-agent.ts        # checks it, approves or rewrites
├── tools/
│   └── get-oncall-log.ts      # FunctionTool: reads the mock log
├── mock-data/
│   └── oncall-log.json        # a sample day's incidents + follow-ups
├── .env.example
└── package.json
```

## Running it

Requires Node.js 24+ and a free Gemini API key.

### Get a Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and sign
   in with your Google account.
2. Click **Create API key**.
3. Choose an existing Google Cloud project, or let AI Studio create one for
   you automatically (fine for a personal/portfolio project - no billing
   setup needed for free-tier usage).
4. Copy the key that's generated - it's only shown in full once, though you
   can always view/regenerate it later from the same page.
5. Never commit this key to GitHub. It goes in your local `.env` file only,
   which `.gitignore` already excludes from version control.

### Install and run

```bash
npm install
cp .env.example .env
# paste your GEMINI_API_KEY into .env, e.g.:
# GEMINI_API_KEY="AIzaSy...your-key-here"

npx adk run agent.ts   # chat with it in the terminal
# or
npx adk web             # chat with it in a local browser UI at localhost:8000
```

Try prompting it with: `"Give me today's handoff"`

## What's next (not built yet)

- Loop the Review Agent back to the Draft Agent automatically on
  "NEEDS REVISION" instead of just returning the rewrite once
  (`LoopAgent` pattern)
- Swap the mock JSON log for a real PagerDuty/Opsgenie API pull
