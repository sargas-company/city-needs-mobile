import { useCallback, useEffect, useRef } from 'react'

/**
 * Creates a debounced version of a callback function.
 * The callback will only be invoked after the specified delay has passed
 * since the last invocation attempt.
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns A debounced version of the callback
 *
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   fetchResults(query)
 * }, 300)
 *
 * <TextInput onChangeText={handleSearch} />
 * ```
 */
export function useDebouncedCallback<TArgs extends any[]>(callback: (...args: TArgs) => void, delay: number = 500): (...args: TArgs) => void {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const callbackRef = useRef(callback)

    // Keep callback ref up to date
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return useCallback(
        (...args: TArgs) => {
            // Clear existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            // Set new timeout
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args)
            }, delay)
        },
        [delay]
    )
}
