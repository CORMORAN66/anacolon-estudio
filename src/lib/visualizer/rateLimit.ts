const DAILY_LIMIT = 3

export function checkRateLimit(currentCount: number): {
  allowed: boolean
  generationsLeft: number
} {
  if (currentCount >= DAILY_LIMIT) {
    return { allowed: false, generationsLeft: 0 }
  }
  return { allowed: true, generationsLeft: DAILY_LIMIT - currentCount }
}
