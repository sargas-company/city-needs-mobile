import { initializeApp, getApps } from 'firebase/app'
// @ts-ignore
import { initializeAuth, getReactNativePersistence, onAuthStateChanged, User } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const firebaseAuth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
})

/**
 * Waits for Firebase Auth to restore the session from AsyncStorage.
 * This is necessary because `firebaseAuth.currentUser` is null immediately after
 * app restart until Firebase finishes restoring the session asynchronously.
 *
 * The `onAuthStateChanged` callback is guaranteed to fire once the auth state
 * is determined (either user exists or not).
 */
export const waitForAuthReady = (): Promise<User | null> => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            unsubscribe()
            resolve(user)
        })
    })
}
