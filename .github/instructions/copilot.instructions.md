---
applyTo: "**"
---

# Response Behavior

- Do NOT explain your reasoning unless explicitly asked
- Do NOT summarize or list changes after making edits
- Do NOT modify code structure or patterns unless explicitly requested

# Code Quality

- ALWAYS validate code for errors after every change
- ALWAYS read the Convex schema (`convex/schema.ts`) and types (`convex/utils/types.ts`) before modifying client code
- ALWAYS follow Convex best practices when writing backend code
- ALWAYS ensure changes do not break existing functionality
- ALWAYS optimize for performance and scalability

# Type Safety

- NEVER define interfaces/types on the client that duplicate backend return types
- ALWAYS use Convex's `FunctionReturnType` to infer types from query/mutation return values
- Import types from `convex/_generated/api` using `typeof api.module.function` pattern
- Example: `type MyData = FunctionReturnType<typeof api.modules.myModule.myQuery>`
- Only define client-specific types for UI state, not for data coming from Convex

# Project Constraints

- UI/Design changes are FORBIDDEN - focus only on Convex backend code and integration
- Only modify data sent from Convex to client when necessary for integration
- Never re-add commented code marked with `--- IGNORE ---`
- ALWAYS use the app/queries folder for client-side Convex queries and mutations

# File Locations

- Convex backend: `convex/` directory
- Client queries/hooks: `src/queries/` directory
- Convex schema: `convex/schema.ts`
- Convex modules: `convex/modules/`
