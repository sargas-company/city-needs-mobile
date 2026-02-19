import React, { PropsWithChildren, useEffect, useMemo, useRef } from 'react'
import { AppState, AppStateStatus, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'

import { authApi } from '@/store/features/auth/authApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectAuthStatus, selectIsAuth } from '@/store/features/auth/auth.selectors'
import { selectProfileStatus, selectProfileUser, selectUserRole, selectVerification } from '@/store/features/profile/profile.selectors'
import { UserRole, type AppUser } from '@/store/features/profile/profile.types'
import { setProfileUser } from '@/store/features/profile/profile.slice'
import { resolveApiData } from '@/store/features/auth/auth.thunks'

const VERIFY_ROUTE = '/(protected)/(onboarding)/provider/verify'

export const BusinessVerificationGuard = ({ children }: PropsWithChildren) => {
    const router = useRouter()
    const pathname = usePathname()
    const dispatch = useAppDispatch()

    const authStatus = useAppSelector(selectAuthStatus)
    const isAuth = useAppSelector(selectIsAuth)

    const profileStatus = useAppSelector(selectProfileStatus)
    const role = useAppSelector(selectUserRole)
    const profileUser = useAppSelector(selectProfileUser)
    const verification = useAppSelector(selectVerification)

    const onboardingStep = profileUser?.onboardingStep

    const isOnVerifyScreen = useMemo(() => {
        return (pathname ?? '').endsWith('/provider/verify')
    }, [pathname])

    const refreshMe = async () => {
        const meResult = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap()
        const resolvedMe = resolveApiData<AppUser>(meResult)
        dispatch(setProfileUser(resolvedMe))
    }

    const canEvaluate = useMemo(() => {
        if (!isAuth) return false
        if (authStatus !== 'authenticated') return false

        if (profileStatus === 'loading' || profileStatus === 'idle') return false

        if (role !== UserRole.BUSINESS_OWNER) return false

        if (onboardingStep !== null && onboardingStep !== undefined) return false

        return true
    }, [isAuth, authStatus, profileStatus, role, onboardingStep])

    const mustGoToVerify = useMemo(() => {
        return verification?.nextAction === 'GO_TO_VERIFICATION'
    }, [verification?.nextAction])

    useEffect(() => {
        if (!canEvaluate) return
        if (!mustGoToVerify) return
        if (isOnVerifyScreen) return

        router.replace(VERIFY_ROUTE)
    }, [canEvaluate, mustGoToVerify, isOnVerifyScreen, router])

    useEffect(() => {
        if (!isAuth || authStatus !== 'authenticated') return

        const onChange = (state: AppStateStatus) => {
            if (state === 'active') {
                void refreshMe().catch(() => undefined)
            }
        }

        const sub = AppState.addEventListener('change', onChange)
        return () => sub.remove()
    }, [isAuth, authStatus]) // eslint-disable-line react-hooks/exhaustive-deps

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = null

        if (!isAuth || authStatus !== 'authenticated') return

        const deadlineRaw = verification?.graceDeadlineAt ?? null
        if (!deadlineRaw) return

        const deadlineMs = new Date(deadlineRaw).getTime()
        const msLeft = deadlineMs - Date.now()
        if (Number.isNaN(deadlineMs) || msLeft <= 0) return

        timerRef.current = setTimeout(() => {
            void refreshMe().catch(() => undefined)
        }, msLeft + 250)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }, [verification?.graceDeadlineAt, isAuth, authStatus]) // eslint-disable-line react-hooks/exhaustive-deps

    return <View style={{ flex: 1 }}>{children}</View>
}
