import { z } from 'zod'

import { businessHoursItemSchema, BusinessHoursFormItem } from '@/components/forms/businessHoursSchema'

export const businessInfoSchema = z.object({
    businessName: z.string().min(2, 'Business name is required'),
    categoryId: z.string().min(1, 'Select at least one category'),
    description: z.string().min(10, 'Description is required'),
    phone: z.string().min(5, 'Mobile number is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    price: z
        .string()
        .min(1, 'Price is required')
        .refine((val) => /^\d+(\.\d+)?$/.test(val.trim()), 'Enter a valid number'),
    businessHours: z.array(businessHoursItemSchema).length(7),
})

export type BusinessInfoFormValues = Omit<z.infer<typeof businessInfoSchema>, 'businessHours'> & {
    businessHours: BusinessHoursFormItem[]
}
