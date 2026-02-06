/**
 * ISO 8601 weekday: 1 = Monday, 7 = Sunday.
 * API uses the same format (1–7); no conversion needed.
 */

export const ISO_WEEKDAYS: { weekday: number; label: string }[] = [
    { weekday: 1, label: 'Monday' },
    { weekday: 2, label: 'Tuesday' },
    { weekday: 3, label: 'Wednesday' },
    { weekday: 4, label: 'Thursday' },
    { weekday: 5, label: 'Friday' },
    { weekday: 6, label: 'Saturday' },
    { weekday: 7, label: 'Sunday' },
]

/** Current day in ISO 8601 (1 = Monday … 7 = Sunday). */
export function getTodayWeekdayISO(): number {
    const jsDay = new Date().getDay() // 0=Sun, 1=Mon, …, 6=Sat
    return jsDay === 0 ? 7 : jsDay
}

/** Legacy: 0–6 (0=Mon … 6=Sun) → ISO 1–7. Not needed when API sends 1–7. */
export function apiWeekdayToIso(api: number): number {
    return api + 1
}

/** Legacy: ISO 1–7 → 0–6. Not needed when API expects 1–7. */
export function isoWeekdayToApi(iso: number): number {
    return iso - 1
}
