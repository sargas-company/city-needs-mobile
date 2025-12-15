import { z } from 'zod'

export const addressSchema = z.object({
    addressLine1: z.string().min(3, 'Address Line 1 is required'),
    addressLine2: z.string().optional().or(z.literal('')),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State / Province / Region is required'),
    zip: z.string().min(3, 'ZIP / Postal Code is required').max(16, 'ZIP / Postal Code is too long'),
    countryCode: z.literal('CA'),
    countryName: z.literal('Canada'),
})

export type AddressFormValues = z.infer<typeof addressSchema>
