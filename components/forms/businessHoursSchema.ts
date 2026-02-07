import { z } from 'zod'

export const businessHoursItemSchema = z
    .object({
        weekday: z.number().min(0).max(6), // API: 0=Monday … 6=Sunday
        isEnabled: z.boolean(),
        isClosed: z.boolean().optional(),
        is24h: z.boolean().optional(),
        startTime: z.string().nullable().optional(),
        endTime: z.string().nullable().optional(),
    })
    .refine(
        (data) => {
            if (!data.isEnabled) return true
            if (data.is24h) return true
            if (data.isClosed) return true
            return Boolean(data.startTime && data.endTime)
        },
        {
            message: 'Set up work time',
        }
    )

export const dayScheduleSchema = businessHoursItemSchema

export const businessHoursFormSchema = z.object({
    days: z.array(businessHoursItemSchema).length(7),
})

export type BusinessHoursFormItem = z.infer<typeof businessHoursItemSchema>
export type DayScheduleForm = BusinessHoursFormItem
export type BusinessHoursFormValues = z.infer<typeof businessHoursFormSchema>
