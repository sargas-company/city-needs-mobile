import { useRouter } from 'expo-router'
import { useState } from 'react'

import { AddressForm } from '@/components/forms/AddressForm'
import { AddressFormValues } from '@/components/forms/addressSchema'
import { submitOnboardingThunk } from '@/store/features/onboarding/onboarding.thunks'
import { useAppDispatch } from '@/store/hooks'

const ProviderAddress = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const [, setSubmitError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (values: AddressFormValues) => {
        setSubmitError(null)
        setIsSubmitting(true)
        try {
            await dispatch(
                submitOnboardingThunk({
                    action: 'BUSINESS_ADDRESS',
                    payload: {
                        countryCode: values.countryCode,
                        city: values.city,
                        addressLine1: values.addressLine1,
                        addressLine2: values.addressLine2 || undefined,
                        zip: values.zip,
                        lat: values.lat!,
                        lng: values.lng!,
                    },
                })
            ).unwrap()
            router.replace('/(protected)/gate')
        } catch (err) {
            setSubmitError((err as { data?: { message?: string } })?.data?.message ?? 'Failed to save address')
        }
        setIsSubmitting(false)
    }

    return (
        <AddressForm
            onSubmit={handleSubmit}
            isSubmittingExternal={isSubmitting}
            title="Enter Your Address Details"
            subtitle="Provide your business address so customers can find you."
            submitLabel="Continue"
            steps={['Business Info', 'Address', 'Branding', 'Verification']}
            currentStep={2}
        />
    )
}

export default ProviderAddress
