import { useEffect, useState } from 'react'

/**
 * Debounces a value by delaying updates until after the specified delay.
 * Useful for search inputs, API calls, or any value that changes frequently.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [searchText, setSearchText] = useState('')
 * const debouncedSearchText = useDebounce(searchText, 300)
 *
 * // Use searchText for input value (immediate feedback)
 * // Use debouncedSearchText for API calls (delayed)
 * useEffect(() => {
 *   if (debouncedSearchText) {
 *     fetchResults(debouncedSearchText)
 *   }
 * }, [debouncedSearchText])
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        // Set up timeout to update debounced value after delay
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        // Cleanup: cancel timeout if value changes before delay expires
        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}
