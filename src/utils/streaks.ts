/**
 * Compute current streak from an array of workout date strings (YYYY-MM-DD format).
 * Streak = consecutive days with at least 1 workout, counting backward from today.
 */
export function computeStreak(workoutDates: string[]): number {
  if (workoutDates.length === 0) return 0

  const uniqueDates = [...new Set(workoutDates)].sort().reverse()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let checkDate = new Date(today)

  // Check if user worked out today or yesterday (to not break streak)
  const todayStr = formatDate(today)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = formatDate(yesterday)

  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return 0 // Streak is broken
  }

  // If they didn't work out today but did yesterday, start from yesterday
  if (uniqueDates[0] !== todayStr) {
    checkDate = new Date(yesterday)
  }

  for (const dateStr of uniqueDates) {
    const checkStr = formatDate(checkDate)
    if (dateStr === checkStr) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (dateStr < checkStr) {
      break // Gap found
    }
  }

  return streak
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}
