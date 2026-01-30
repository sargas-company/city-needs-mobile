import { z } from 'zod'

export const serviceSchema = z.object({
    name: z.string().min(2, 'Service name is required'),
    description: z.string().optional(),
    durationMinutes: z.coerce.number().min(5, 'Min 5 minutes'),
    price: z.coerce.number().min(0, 'Price must be >= 0'),
    currency: z.string().default('CAD'),
})

export type ServiceFormValues = z.infer<typeof serviceSchema>
