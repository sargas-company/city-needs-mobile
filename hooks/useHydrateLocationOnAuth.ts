import { useEffect } from 'react'

import { useGetLocationQuery } from '@/store/api/locationApi'
import { setLocation } from '@/store/features/location/location.slice'
import { selectIsAuth } from '@/store/features/auth/auth.selectors'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export const useHydrateLocationOnAuth = () => {
    const dispatch = useAppDispatch()
    const isAuth = useAppSelector(selectIsAuth)
    const { data } = useGetLocationQuery(undefined, { skip: !isAuth })

    useEffect(() => {
        if (data?.ok && data.location) {
            dispatch(setLocation(data.location))
        }
    }, [data, dispatch])
}
