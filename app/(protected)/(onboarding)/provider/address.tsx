import { useRouter } from 'expo-router'
import { useState } from 'react'

import { AddressForm } from '@/components/forms/AddressForm'
import { submitOnboardingThunk } from '@/store/features/onboarding/onboarding.thunks'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectProfileUser } from '@/store/features/profile/profile.selectors'

const ProviderAddress = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const profile = useAppSelector(selectProfileUser)
    const [, setSubmitError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const initialValues = {
        addressLine1: profile?.addressLine1 ?? '',
        addressLine2: profile?.addressLine2 ?? '',
        city: profile?.city ?? '',
        state: profile?.state ?? '',
        zip: profile?.zip ?? '',
        countryCode: profile?.countryCode ?? 'CA',
        countryName: profile?.countryName ?? 'Canada',
    }

    const handleSubmit = async (values: any) => {
        setSubmitError(null)
        setIsSubmitting(true)
        try {
            await dispatch(
                submitOnboardingThunk({
                    action: 'BUSINESS_ADDRESS',
                    payload: {
                        countryCode: values.countryCode,
                        city: values.city,
                        state: values.state,
                        addressLine1: values.addressLine1,
                        addressLine2: values.addressLine2 || undefined,
                        zip: values.zip,
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
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isSubmittingExternal={isSubmitting}
            stepLabel="2/3"
            title="Enter Your Address Details"
            subtitle="Provide your business address so customers can find you."
            submitLabel="Continue"
        />
    )
}

export default ProviderAddress
