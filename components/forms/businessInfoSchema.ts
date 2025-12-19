import { z } from 'zod'

export const businessInfoSchema = z.object({
    businessName: z.string().min(2, 'Business name is required'),
    categoryId: z.string().min(1, 'Select at least one category'),
    description: z.string().min(10, 'Description is required'),
    phone: z.string().min(5, 'Mobile number is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    operatingHours: z.string().min(3, 'Operating hours are required'),
})

export type BusinessInfoFormValues = z.infer<typeof businessInfoSchema>
