type AuthEventCallback = () => void

let onSessionExpiredCallback: AuthEventCallback | null = null

/**
 * Sets a callback to be called when the session expires (token refresh fails).
 * This is used by axiosBaseQuery to trigger logout when refresh fails.
 */
export const setOnSessionExpired = (callback: AuthEventCallback) => {
    onSessionExpiredCallback = callback
}

/**
 * Called when the session expires and user should be logged out.
 */
export const emitSessionExpired = () => {
    onSessionExpiredCallback?.()
}
