/** Reputation ledger rules — see docs/REPUTATION.md */

export const VERIFIED_HOST_THRESHOLD = 50;

export const REPUTATION_POINTS = {
  EVENT_HOSTED: 10,
  EVENT_COMPLETED: 5,
  POSITIVE_FEEDBACK: 3,
  NEGATIVE_FEEDBACK: -5,
  VOUCH: 8,
  REPORT_UPHELD: -15,
  SKILL_COMPLETED: 5,
  PROFILE_COMPLETED: 5,
} as const;

export type ReputationReasonKey = keyof typeof REPUTATION_POINTS;
