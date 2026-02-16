# CODE_REFERENCE

## SlideLayout
`src/components/layout/SlideLayout.tsx` wraps all pages with:
- Topbar
- Teal accent line
- Sidebar
- Main content region

## API Client
`src/lib/api.ts` centralizes all backend calls with typed helper functions and required endpoint paths.

## Pages
All route pages live in `src/pages/` and map directly to React Router routes:
- Dashboard
- Collections
- CollectionDetail
- Jobs
- Chat
- DocumentDetail
- Study
- Exports

## Toast UX
`src/App.tsx` contains a tiny state-based toast stack for success/error feedback.
