const GRADE_POINTS: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
}

export interface ResultWithCourse {
  grade: string
  course: { units: number }
}

export function calculateGPA(results: ResultWithCourse[]): number {
  if (results.length === 0) return 0
  let totalPoints = 0
  let totalUnits = 0

  for (const r of results) {
    const points = GRADE_POINTS[r.grade] ?? 0
    totalPoints += points * r.course.units
    totalUnits += r.course.units
  }

  if (totalUnits === 0) return 0
  return Math.round((totalPoints / totalUnits) * 100) / 100
}
