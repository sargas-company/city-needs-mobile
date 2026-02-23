import type { FirebaseError } from 'firebase/app'

export const getFirebaseSignUpErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object') {
        const anyErr = error as any
        const code = anyErr?.error?.message as string | undefined

        if (code) {
            switch (code) {
                case 'EMAIL_EXISTS':
                    return 'This email is already registered'
                case 'WEAK_PASSWORD':
                    return 'Password is too weak'
                case 'INVALID_EMAIL':
                    return 'Invalid email address'
                default:
                    return 'Sign up failed. Please try again.'
            }
        }
    }

    if ((error as FirebaseError).code) {
        const fbErr = error as FirebaseError
        switch (fbErr.code) {
            case 'auth/email-already-in-use':
                return 'This email is already registered'
            case 'auth/weak-password':
                return 'Password is too weak'
            case 'auth/invalid-email':
                return 'Invalid email address'
            case 'auth/too-many-requests':
                return 'Too many attempts. Try again later.'
            default:
                return 'Sign up failed. Please try again.'
        }
    }

    if (error instanceof Error) return error.message
    return 'Sign up failed. Please try again.'
}

export const getFirebaseLoginErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object') {
        const anyErr = error as any
        const code = anyErr?.error?.message as string | undefined

        if (code) {
            switch (code) {
                case 'INVALID_LOGIN_CREDENTIALS':
                case 'INVALID_PASSWORD':
                case 'EMAIL_NOT_FOUND':
                    return 'Invalid email or password'
                case 'USER_DISABLED':
                    return 'This account has been disabled'
                default:
                    return 'Login failed. Please try again.'
            }
        }
    }

    if ((error as FirebaseError).code) {
        const fbErr = error as FirebaseError
        switch (fbErr.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                return 'Invalid email or password'
            case 'auth/too-many-requests':
                return 'Too many attempts. Try again later.'
            default:
                return 'Login failed. Please try again.'
        }
    }

    if (error instanceof Error) return error.message
    return 'Login failed. Please try again.'
}
