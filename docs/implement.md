# Implementation Plan: Unified Flexible Authentication

## Overview

Replace `authedQuery`, `authedMutation`, and `authedAction` with unified versions that:

1. Pass all custom args through to handlers (fixes `companyIdOverride` issue)
2. Add `_isAdmin` flag to context for role-based authorization
3. Keep `companyIdOverride` parameter for admin impersonation flow

## Authorization Logic (New)

```typescript
// In handlers - combined logic
const isAdmin = ctx._isAdmin === true;
const targetCompanyId = args.companyIdOverride ?? user.company_id;

// Admin with companyIdOverride → view as that company
// Admin without companyIdOverride → view their own company
// Regular user → view their own company
if (!isAdmin && resource.company_id !== user.company_id) {
  throw new Error("Forbidden");
}
```

## Changes

### 1. Update `convex/utils/permission.ts`

- Create `flexibleQuery` - passes through all args + adds `_isAdmin` to context
- Create `flexibleMutation` - same as above for mutations
- Create `flexibleAction` - same as above for actions

### 2. Update All Backend Modules

Replace `authedQuery` → `flexibleQuery`, `authedMutation` → `flexibleMutation`, `authedAction` → `flexibleAction` in:

- `convex/modules/jobs.ts`
- `convex/modules/applications.ts`
- `convex/modules/assessment.ts`
- `convex/modules/notifications.ts`
- `convex/modules/emailTemplates.ts`
- `convex/modules/statistics.ts`
- `convex/modules/company.ts`

### 3. Simplify Handler Authorization Logic

In each handler, replace complex companyIdOverride validation with:

```typescript
const isAdmin = ctx._isAdmin === true;
const targetCompanyId = args.companyIdOverride ?? user.company_id;
```

### 4. Keep companyIdOverride Parameters

- Keep `companyIdOverride` in function args for admin impersonation
- Simplify validation - no need for defensive company lookup

### 5. Update Client Hooks

- Keep `companyIdOverride` parameter for hooks that need it
- Remove `useCompanyIdOverride` helper (use URL param directly in pages)

## Benefits

- **Cleaner**: Args pass through correctly (no more `args: {}` issue)
- **Admin flow preserved**: Impersonate button still works
- **Simpler handlers**: Just check `ctx._isAdmin`
- **Works for admins**: Can impersonate any company via `companyIdOverride`
- **Works for regular users**: Still restricted to their company

## Frontend Changes

- Keep impersonation URL pattern (`?arrow_id=companies/xxx`)
- Admin clicks "Impersonate" → sees company data as that company
- Regular users → no changes
