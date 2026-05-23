export const robotStatuses = [
  'draft',
  'configured',
  'analyzed',
  'validated',
  'invalid',
  'live',
] as const;

export type RobotStatus = (typeof robotStatuses)[number];
