import { z } from 'zod'

export const supportedCities = ['Saskatoon', 'Regina'] as const

export const addressSchema = z
    .object({
        addressLine1: z.string().min(3, 'Address Line 1 is required'),
        addressLine2: z.string().optional().or(z.literal('')),
        city: z.enum(supportedCities),
        zip: z.string().min(1, 'ZIP / Postal Code is required').max(16, 'ZIP / Postal Code is too long'),
        countryCode: z.literal('CA'),
        countryName: z.literal('Canada'),
        lat: z.number().optional(),
        lng: z.number().optional(),
    })
    .refine((values) => !!values.city && !!values.lat && !!values.lng && !!values.zip, {
        message: 'Select an address from the suggestions to continue',
        path: ['addressLine1'],
    })

export type AddressFormValues = z.infer<typeof addressSchema>
export type CityKey = (typeof supportedCities)[number]
