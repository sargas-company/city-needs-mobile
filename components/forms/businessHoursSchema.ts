import { z } from 'zod'

export const dayScheduleSchema = z
    .object({
        weekday: z.number().min(0).max(6),
        isEnabled: z.boolean(),
        is24h: z.boolean(),
        startTime: z.string().nullable(),
        endTime: z.string().nullable(),
    })
    .refine(
        (data) => {
            if (!data.isEnabled) return true
            if (data.is24h) return true
            return Boolean(data.startTime && data.endTime)
        },
        {
            message: 'Укажите время работы',
        }
    )

export const businessHoursFormSchema = z.object({
    days: z.array(dayScheduleSchema).length(7),
})

export type DayScheduleForm = z.infer<typeof dayScheduleSchema>
export type BusinessHoursFormValues = z.infer<typeof businessHoursFormSchema>
