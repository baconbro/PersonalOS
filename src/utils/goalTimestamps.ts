// Utility functions for goal updates

export const updateGoalTimestamp = <T extends { updatedAt?: Date }>(goal: T): T => {
  return {
    ...goal,
    updatedAt: new Date()
  };
};

export const ensureTimestamps = <T extends { createdAt?: Date; updatedAt?: Date }>(goal: T): T => {
  const now = new Date();
  return {
    ...goal,
    createdAt: goal.createdAt || now,
    updatedAt: goal.updatedAt || goal.createdAt || now
  };
};
