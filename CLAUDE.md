# CLAUDE.md — City Needs Frontend

## Project Overview

Cross-platform mobile app (iOS, Android, Web) built with **Expo 54**, **React Native 0.81**, **React 19**, and **TypeScript 5.9** (strict mode).

## Quick Commands

```bash
npm start           # Start Expo dev server
npm run ios         # Start iOS simulator
npm run android     # Start Android emulator
npm run web         # Start web dev server
npm run lint        # Run ESLint
npm run lint:fix    # Fix lint issues
npm run format      # Format with Prettier
```

## Project Structure

```
app/                    # Expo Router file-based routes
├── (auth)/             # Sign-in / sign-up
├── (onboarding)/       # Welcome flow
├── (protected)/        # Auth-gated routes
│   ├── user/(tabs)/    # User tab navigation (home, map, search, reels, profile)
│   ├── business/       # Business/provider routes
│   └── (onboarding)/   # Role-based onboarding
components/
├── ui/                 # Base UI components (App* prefix: AppButton, AppInput, AppText, etc.)
├── forms/              # Form components + Zod schemas
├── layout/             # Layout wrappers
├── guards/             # Route guard components
├── modals/             # Modal components
├── bookings/           # Booking cards, details sheet
└── reviews/            # Review display components (ReviewCard, ReviewList)
services/
├── api/                # API config, error types
├── auth/               # Firebase auth, session/token management
├── location/           # Location services
└── geocoding/          # Geocoding providers
store/
├── api/                # RTK Query base API + Axios adapter
└── features/           # Redux slices by domain (auth, profile, location, business, bookings, reviews, etc.)
hooks/                  # Custom hooks
constants/              # Design tokens, theme colors, onboarding config
```

## Tech Stack & Key Patterns

### State Management
- **Redux Toolkit** with slices, thunks, and typed hooks (`useAppDispatch`, `useAppSelector`)
- **RTK Query** with custom `axiosBaseQuery` for API calls + caching
- **Redux Persist** for auth and location data
- Feature endpoints injected via `baseApi.injectEndpoints()`
- Cursor-based pagination with custom `serializeQueryArgs` + `merge` for infinite scroll (see `bookingsApi.ts`, `reviewsApi.ts`)

### Forms
- **react-hook-form** with `Controller` pattern
- **Zod** schemas for validation (via `@hookform/resolvers`)
- Wrapper components: `FormInput<T>`, `FormPhoneInput`

### Styling
- **NativeWind** (TailwindCSS for React Native) — use `className` prop, not `StyleSheet.create`
- Design tokens in `constants/design-tokens.js`!IMPORTANT USAGE
- Light/dark mode via `useColorScheme()` hook
- Fonts: Poppins family (4 weights)
- Utility: `cn()` helper for conditional class merging

### Routing
- **Expo Router** file-based routing with `typedRoutes` enabled
- Parenthesized groups `(auth)`, `(protected)` for logical grouping without URL impact
- Programmatic navigation via `useRouter()` from expo-router

### API
- Base URL from `EXPO_PUBLIC_API_URL` env var (default: `localhost:3001/api`)
- Bearer token auto-injected by `axiosBaseQuery`
- Automatic 401 token refresh with retry
- FormData support for file uploads

### Auth
- Firebase authentication
- Token stored via `expo-secure-store`
- Auto-refresh on 401 responses

### User Roles
- `UserRole` enum: `END_USER`, `BUSINESS_OWNER` (defined in `store/features/profile/profile.types.ts`)
- Re-exported from `services/auth/auth.types.ts` for cross-domain use
- Used for role-based UI rendering (e.g., `BookingDetailsSheet` shows different actions per role)

## Code Conventions

- **TypeScript strict mode** — no `any` unless unavoidable
- **Path alias**: `@/*` maps to project root
- **Components**: PascalCase, functional only (arrow or function declaration)
- **Base UI components**: Prefixed with `App` (AppButton, AppInput, AppText, AppPressable)
- **Redux slices**: `feature.slice.ts`, `feature.thunks.ts`, `feature.selectors.ts`, `featureApi.ts`
- **Shared types**: Domain enums/types defined in their primary domain, re-exported where needed (e.g., `UserRole` in `profile.types.ts`, re-exported from `auth.types.ts`)
- **No semicolons**, single quotes, trailing commas (es5), 4-space indent, 150 char print width
- **Import order**: builtin → external → internal (enforced by ESLint)
- **Unused imports**: Auto-removed; unused vars allowed with `_` prefix

## Environment Variables

All client-side vars use `EXPO_PUBLIC_` prefix. See `.env.example` for required keys:
- `EXPO_PUBLIC_API_URL` — Backend API base URL
- `EXPO_PUBLIC_FIREBASE_*` — Firebase config
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps
- `EXPO_PUBLIC_MAPBOX_API_KEY` — Mapbox
- `EXPO_PUBLIC_GEOCODING_PROVIDER` — Geocoding provider (default: nominatim)

## Git Hooks

- **pre-commit** (Husky + lint-staged): Runs Prettier + ESLint on staged `*.{js,jsx,ts,tsx,json}` files
