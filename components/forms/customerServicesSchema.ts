import { z } from 'zod'

export const customerServicesSchema = z.object({
    categoryIds: z.array(z.string()).min(1, 'Select at least one service'),
})

export type CustomerServicesFormValues = z.infer<typeof customerServicesSchema>
