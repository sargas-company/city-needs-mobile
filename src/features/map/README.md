# Map Feature

A clean, adapter-based map implementation with future-proof architecture for easy provider switching.

## Architecture

```
src/features/map/
├── types/
│   └── map.types.ts          # Engine-agnostic domain types
├── context/
│   └── MapProvider.tsx        # Runtime engine selection
├── components/
│   └── Map.tsx                # Facade component (single entry point)
├── adapters/
│   └── google/
│       └── GoogleMapAdapter.tsx  # react-native-maps implementation
├── examples/
│   └── MapWithMarkers.example.tsx  # Usage examples
├── index.ts                   # Public API exports
├── SETUP.md                   # Setup and configuration guide
└── README.md                  # This file
```

## Design Principles

1. **Adapter Pattern**: Engine-specific code is isolated in adapters
2. **Type Safety**: Strong TypeScript types with no leaky abstractions
3. **Single Entry Point**: Screens only import the `Map` component
4. **Future-Proof**: Easy to swap Google Maps for Mapbox, Apple Maps, etc.
5. **Minimal Surface Area**: Only essential features implemented

## Quick Start

### Basic Usage

```tsx
import { Map } from '@/src/features/map'

function MyScreen() {
    return (
        <Map
            initialCenter={{ lat: 41.9028, lng: 12.4964 }}
            initialZoom={13}
            showUserLocation={true}
        />
    )
}
```

### With Markers

```tsx
import { Map, MapMarker } from '@/src/features/map'

const markers: MapMarker[] = [
    {
        id: 'business-1',
        position: { lat: 41.9028, lng: 12.4964 },
        title: 'Business Name',
        description: 'Business description',
    },
]

function MyScreen() {
    return (
        <Map
            initialCenter={{ lat: 41.9028, lng: 12.4964 }}
            markers={markers}
            onMarkerPress={(id) => console.log('Pressed:', id)}
        />
    )
}
```

### With Region Change Tracking

```tsx
import { Map, Bounds, LatLng } from '@/src/features/map'

function MyScreen() {
    const handleRegionChange = (bounds: Bounds, center: LatLng, zoom?: number) => {
        // Fetch businesses in visible area
        console.log('New bounds:', bounds)
    }

    return (
        <Map
            initialCenter={{ lat: 41.9028, lng: 12.4964 }}
            onRegionChangeEnd={handleRegionChange}
        />
    )
}
```

## API Reference

### `Map` Component Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `initialCenter` | `LatLng` | Yes | - | Initial map center position |
| `initialZoom` | `number` | No | `13` | Initial zoom level (higher = more zoomed in) |
| `markers` | `MapMarker[]` | No | `[]` | Array of markers to display |
| `selectedMarkerId` | `string \| null` | No | `null` | ID of currently selected marker (for highlighting) |
| `onMarkerPress` | `(id: string) => void` | No | - | Callback when marker is pressed |
| `onRegionChangeEnd` | `(bounds, center, zoom?) => void` | No | - | Callback when map region changes |
| `showUserLocation` | `boolean` | No | `false` | Show user's current location |
| `style` | `ViewStyle` | No | - | Custom style for map container |
| `className` | `string` | No | - | NativeWind className (if using Tailwind) |

### Domain Types

```typescript
interface LatLng {
    lat: number
    lng: number
}

interface Bounds {
    northeast: LatLng
    southwest: LatLng
}

interface MapMarker {
    id: string
    position: LatLng
    title?: string
    description?: string
}

interface MapRegion {
    center: LatLng
    zoom?: number
    latitudeDelta?: number
    longitudeDelta?: number
}

type MapEngine = 'google' | 'mapbox'
```

## Switching Map Providers

To switch from Google Maps to another provider:

1. **Create a new adapter** in `src/features/map/adapters/[provider]/`
   ```tsx
   // Example: MapboxAdapter.tsx
   export function MapboxAdapter(props: MapAdapterProps) {
       // Implement using Mapbox SDK
   }
   ```

2. **Update the Map facade** in `components/Map.tsx`
   ```tsx
   switch (engine) {
       case 'google':
           return <GoogleMapAdapter {...props} />
       case 'mapbox':
           return <MapboxAdapter {...props} />  // Add this
   }
   ```

3. **Change the engine** in `app/_layout.tsx`
   ```tsx
   <MapProvider engine="mapbox">  {/* Change from 'google' */}
   ```

That's it! No changes to screens or business logic required.

## Current Implementation

- **Engine**: Google Maps (`react-native-maps` v1.20.1)
- **Provider**: Configured in `app/_layout.tsx` via `MapProvider`
- **Adapter**: `GoogleMapAdapter` (only place that imports `react-native-maps`)
- **Screen**: `app/(protected)/user/(tabs)/map.tsx`

## What's NOT Included (By Design)

These features are intentionally not implemented to keep the initial implementation minimal:

- ❌ Marker clustering
- ❌ Bottom sheet integration
- ❌ Search bar
- ❌ Filters
- ❌ Custom marker icons
- ❌ Polylines/polygons
- ❌ Heatmaps
- ❌ Geofencing

Add these features later as needed, building on top of this foundation.

## Setup

See [SETUP.md](./SETUP.md) for detailed configuration instructions including:
- Google Maps API key setup
- iOS/Android configuration
- Development build instructions
- Troubleshooting

## Examples

See [examples/MapWithMarkers.example.tsx](./examples/MapWithMarkers.example.tsx) for a complete working example with markers, selection, and region tracking.

## Testing

1. Run development build: `npx expo run:ios` or `npx expo run:android`
2. Navigate to the Map tab in the user section
3. Verify:
   - Map loads and shows Rome, Italy
   - Map is interactive (pan, zoom, rotate)
   - User location shows (if permissions granted)

## Future Enhancements

When you're ready to add more features:

1. **Custom Marker Icons**: Add `icon` prop to `MapMarker` type
2. **Marker Clustering**: Create a clustering adapter wrapper
3. **Search Integration**: Add search bar overlay component
4. **Bottom Sheet**: Use existing `AppBottomSheet` component
5. **Filters**: Add filter state management and UI
6. **API Integration**: Connect to business search API in `onRegionChangeEnd`

## Notes

- The adapter is the **only** place that imports `react-native-maps`
- All domain types are **engine-agnostic**
- Screens should **only** import from `@/src/features/map` (barrel export)
- TypeScript is configured to prevent leaky abstractions
