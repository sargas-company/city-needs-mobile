import AsyncStorage from '@react-native-async-storage/async-storage'

async function logAllAsyncStorage(label: string = 'ASYNC_STORAGE_DUMP') {
    try {
        const keys = await AsyncStorage.getAllKeys()
        const entries = keys.length ? await AsyncStorage.multiGet(keys) : []

        const obj: Record<string, unknown> = {}
        for (const [key, value] of entries) {
            try {
                obj[key] = value ? JSON.parse(value) : value
            } catch {
                obj[key] = value
            }
        }

        console.log(`[${label}]`, obj)
    } catch (e) {
        console.warn('[ASYNC_STORAGE_DUMP] failed:', e)
    }
}

export function initAsyncStorageDebug() {
    if (!(global as any).__ASYNC_STORAGE_DEBUG_PATCHED__) {
        ;(global as any).__ASYNC_STORAGE_DEBUG_PATCHED__ = true

        void logAllAsyncStorage('ASYNC_STORAGE_INIT')

        const originalSetItem = AsyncStorage.setItem.bind(AsyncStorage)
        const originalRemoveItem = AsyncStorage.removeItem.bind(AsyncStorage)
        const originalClear = AsyncStorage.clear.bind(AsyncStorage)
        const originalMultiSet = AsyncStorage.multiSet.bind(AsyncStorage)
        const originalMultiRemove = AsyncStorage.multiRemove.bind(AsyncStorage)

        ;(AsyncStorage as any).setItem = async (key: string, value: string) => {
            console.log('[AsyncStorage.setItem]', key, value)
            const res = await originalSetItem(key, value)
            void logAllAsyncStorage('ASYNC_STORAGE_AFTER_SET')
            return res
        }
        ;(AsyncStorage as any).removeItem = async (key: string) => {
            console.log('[AsyncStorage.removeItem]', key)
            const res = await originalRemoveItem(key)
            void logAllAsyncStorage('ASYNC_STORAGE_AFTER_REMOVE')
            return res
        }
        ;(AsyncStorage as any).clear = async () => {
            console.log('[AsyncStorage.clear]')
            const res = await originalClear()
            void logAllAsyncStorage('ASYNC_STORAGE_AFTER_CLEAR')
            return res
        }
        ;(AsyncStorage as any).multiSet = async (entries: [string, string][]) => {
            console.log('[AsyncStorage.multiSet]', entries)
            const res = await originalMultiSet(entries)
            void logAllAsyncStorage('ASYNC_STORAGE_AFTER_MULTI_SET')
            return res
        }
        ;(AsyncStorage as any).multiRemove = async (keys: string[]) => {
            console.log('[AsyncStorage.multiRemove]', keys)
            const res = await originalMultiRemove(keys)
            void logAllAsyncStorage('ASYNC_STORAGE_AFTER_MULTI_REMOVE')
            return res
        }

        console.log('[AsyncStorageDebug] AsyncStorage patched for DEV logging')
    }
}
