export const updateUserStreak = (
  lastOpen: Date | null,
  newOpenDate: Date,
  streak: number
): number => {
  if (!lastOpen) {
    return 1;
  }

  const lastOpenDay = new Date(lastOpen);
  const newOpenDay = new Date(newOpenDate);

  lastOpenDay.setHours(0, 0, 0, 0);
  newOpenDay.setHours(0, 0, 0, 0);

  if (newOpenDay.getDay() === 0) {
    return streak;
  }

  const diffTime = newOpenDay.getTime() - lastOpenDay.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);

  if (
    lastOpenDay.getDay() === 6 &&
    newOpenDay.getDay() === 1 &&
    diffDays === 2
  ) {
    return streak + 1;
  }

  if (diffDays === 1) {
    return streak + 1;
  }

  return 1;
};
