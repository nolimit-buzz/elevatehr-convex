# Progress — Onboarding Wizard Fix

Branch: `feature/fix-onboarding-wizard` (off `main`)

## Problem

The onboarding wizard (`src/app/onboarding/page.tsx`) was fully broken: it POSTed to a dead WordPress API (`app.elevatehr.ai/wp-json/...`) and read a raw `"jwt"` localStorage key that nothing else in the app writes. Nothing persisted server-side. On top of that, nothing in the app actually routed users to `/onboarding` — it was an orphaned page reachable only by typing the URL directly.

## What was done

### 1. Onboarding wizard rewrite
- Replaced the dead WP API POST with real Convex calls: `company.update`, `generateUploadUrl`, `updateLogo` (via `CompanyQueries()`)
- Fixed the auth guard to use `getWithExpiry(DefaultConstants.tokenName)` instead of the stale raw `localStorage.getItem("jwt")`
- Added a Zustand store (`src/app/onboarding/store/useOnboardingStore.ts`) to manage wizard state: active step, form data, skipped steps
- Added a **Skip** button for the Logo and Booking Link steps (optional); Website and About remain required to proceed
- Installed `zustand` as a dependency

### 2. Register page toast fix
- Replaced the low-contrast inline MUI `Alert` error message with a `sonner` toast (top-right position), consistent with how errors are shown elsewhere in the app (e.g. Profile page)

### 3. Onboarding routing fix
Discovered that neither Register nor Login ever redirected users into `/onboarding`:
- Added `onboarding_completed: boolean` to the `companies` schema (`convex/modules/company.ts`)
- `AuthLogin.tsx` (the login form used on `/`) now redirects to `/onboarding` instead of `/dashboard` when the logged-in user's company hasn't completed onboarding
- Onboarding's `handleComplete` now sets `onboarding_completed: true` when the wizard is submitted, so subsequent logins go straight to `/dashboard`

### 4. Local environment / data cleanup
- Rebuilt the Docker `app` container to pick up code changes (had to regenerate `bun.lock` after adding `zustand` via npm, since the Docker build uses `bun install --frozen-lockfile`)
- Pushed the updated Convex schema to the local self-hosted backend
- Cleaned up local test data: removed 2 stale test users/companies (`syntaxdesigners@gmail.com`/Syntax, `akpanjosepj2021@gmail.com`/NLB), kept `testverify@example.com`/Test Co Verify for ongoing testing

## Verification done
- `tsc --noEmit` passes with no new errors introduced by these changes
- Manual rebuild + container restart confirmed the app serves correctly on `localhost:3001`

## Still to verify (manual click-through)
- Register a new company end-to-end → confirm it lands on `/onboarding` after login (not `/dashboard`)
- Complete onboarding, including skipping Logo/Booking steps → confirm `company.update` persists, logo uploads via Convex storage, and subsequent logins skip onboarding
- Confirm the duplicate-email registration error now shows as a toast, not an inline alert
