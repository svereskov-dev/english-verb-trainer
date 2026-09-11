export function isDailyGoalReached(
  completedDailyWords: number,
  dailyGoal: number,
): boolean {
  return completedDailyWords >= dailyGoal;
}