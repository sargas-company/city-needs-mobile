import { z } from 'zod'

export const serviceSchema = z.object({
    name: z.string().min(1, 'Service name is required').max(128, 'Service name is too long'),
    durationMinutes: z.coerce.number().int('Must be a whole number').min(5, 'Min 5 minute'),
    price: z.coerce.number().int('Must be a whole number').min(1, 'Price must be at least $1'),
})

export type ServiceFormValues = z.infer<typeof serviceSchema>
