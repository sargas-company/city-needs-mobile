import React, { createContext, useContext, ReactNode } from 'react'

import { MapEngine } from '../types/map.types'

interface MapContextValue {
    engine: MapEngine
}

const MapContext = createContext<MapContextValue | undefined>(undefined)

interface MapProviderProps {
    children: ReactNode
    /**
     * Map engine to use. Defaults to 'google'.
     * Can be switched to 'mapbox' or other engines in the future.
     */
    engine?: MapEngine
}

/**
 * MapProvider: Provides map engine configuration to the app.
 * Wrap your app (or map screens) with this provider to select the map engine.
 */
export function MapProvider({ children, engine = 'google' }: MapProviderProps) {
    return <MapContext.Provider value={{ engine }}>{children}</MapContext.Provider>
}

/**
 * Hook to access the current map engine
 */
export function useMapEngine(): MapEngine {
    const context = useContext(MapContext)
    if (!context) {
        // Default to 'google' if provider is not used
        return 'google'
    }
    return context.engine
}
