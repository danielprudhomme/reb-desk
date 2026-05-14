export const robotStatuses = ['running', 'pendingLaunch', 'needsRework', 'inProgress'] as const;

export type RobotStatus = (typeof robotStatuses)[number];
