import { baseApi } from '@/store/api/baseApi'

export type OnboardingAction =
    | 'CUSTOMER_ADDRESS'
    | 'CUSTOMER_CATEGORIES'
    | 'BUSINESS_PROFILE'
    | 'BUSINESS_ADDRESS'
    | 'BUSINESS_FILES'
    | 'BUSINESS_FILES_SKIP'

export type SubmitOnboardingRequest = {
    action: OnboardingAction
    payload?: unknown
}

export type SubmitOnboardingResponse = {
    user: {
        id: string
        role: string | null
        onboardingStep: number | null
        addressId?: string | null
        businessId?: string | null
    }
    onboarding: {
        isCompleted: boolean
        role: string | null
        currentStep: number | null
        totalSteps: number | null
        allowedActions: OnboardingAction[]
        requiredScreen: OnboardingAction | null
    }
}

export const onboardingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitOnboarding: builder.mutation<SubmitOnboardingResponse, SubmitOnboardingRequest>({
            query: (body) => ({
                url: '/onboarding/submit',
                method: 'POST',
                data: body,
            }),
        }),
    }),
})

export const { useSubmitOnboardingMutation } = onboardingApi
