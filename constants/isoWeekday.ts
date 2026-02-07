/**
 * API weekday: 0 = Monday, 6 = Sunday.
 * Matches backend (bookings, slots, etc.). No conversion on frontend.
 */

export const WEEKDAYS: { weekday: number; label: string }[] = [
    { weekday: 0, label: 'Monday' },
    { weekday: 1, label: 'Tuesday' },
    { weekday: 2, label: 'Wednesday' },
    { weekday: 3, label: 'Thursday' },
    { weekday: 4, label: 'Friday' },
    { weekday: 5, label: 'Saturday' },
    { weekday: 6, label: 'Sunday' },
]

/** Current day in API format (0 = Monday … 6 = Sunday). */
export function getTodayWeekday(): number {
    const jsDay = new Date().getDay() // 0=Sun, 1=Mon, …, 6=Sat
    return (jsDay + 6) % 7
}
