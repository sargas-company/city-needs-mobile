import { z } from 'zod'

export const serviceSchema = z.object({
    name: z.string().min(1, 'Service name is required').max(128, 'Service name is too long'),
    durationMinutes: z.coerce.number().int('Must be a whole number').min(1, 'Min 1 minute'),
    price: z.coerce.number().int('Must be a whole number').min(1, 'Price must be at least $1'),
    currency: z.string().default('CAD'),
})

export type ServiceFormValues = z.infer<typeof serviceSchema>
