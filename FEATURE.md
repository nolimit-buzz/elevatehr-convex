# ElevateHR — Feature Map & Module Breakdown

This document maps every feature in the app to its pages, Convex modules, and current status.
Status legend: ✅ Working · 🔴 Broken (dead WP API / no persistence) · 🟡 Degraded (partially broken) · ⚪ Unclear/needs verification · 🧹 Dead code

---

## 1. Auth Module

Convex: `convex/modules/auth.ts`, `convex/modules/company.ts`

| Feature | Page(s) | Convex fn | Status | What's needed |
|---|---|---|---|---|
| Company + admin user registration | `src/app/authentication/auth/Register.tsx` | `company.create` | ✅ Fixed | Already wired this session |
| Login | `src/app/dashboard/components/auth/AuthLogin.tsx` | `auth.Login` | ✅ Working | — |
| Admin login | `src/app/admin/login/page.tsx`, `admin/components/AdminAuthLogin.tsx` | `auth.AdminLogin` | 🟡 | Remove duplicate raw `localStorage.setItem("jwt", ...)` — only `setWithExpiry(DefaultConstants.tokenName, ...)` should be used |
| Onboarding wizard (post-signup company setup) | `src/app/onboarding/page.tsx` | should be `company.update` | 🔴 Broken | Still POSTs to dead `app.elevatehr.ai/wp-json/...`. Rewrite to call `company.update`/`company.create` via `AuthQueries`/`CompanyQueries`. Remove raw `localStorage` JWT read. |
| Calendly OAuth connect | `src/app/auth/calendly/page.tsx` | none (external OAuth) | 🟡 | Hardcoded placeholder host URI (`api.calendly.com/users/karenziboh`) — replace with real host lookup. One endpoint hits `stoplight.io` mock API instead of real Calendly — fix base URL. |

---

## 2. Jobs Module

Convex: `convex/modules/jobs.ts`

| Feature | Page(s) | Convex fn | Status | What's needed |
|---|---|---|---|---|
| Dashboard stats + job list | `src/app/dashboard/page.tsx` | `statistics.getDashboardStats`, `jobs.list` | ✅ Working | — |
| Job listings management | `src/app/dashboard/job-listings/page.tsx` | `jobs.list`, `jobs.remove` | ✅ Working | — |
| Create/edit job posting (AI-assisted) | `src/app/dashboard/create-job-posting/[job_id]/page.tsx` | `jobs.create`, `jobs.update`, `jobs.regenerateField` | ✅ Fixed | AI regenerate buttons wired this session; Groq model fixed (was using retired `llama-3.3-70b-versatile`, now `openai/gpt-oss-120b`) |
| Public job view (no auth) | `src/app/job-openings/[job_id]/page.tsx` | `jobs.getPublicJob`, `jobs.getPublicCompany` | ✅ Working | — |
| Public job apply (no auth) | `src/app/job-openings/[job_id]/apply/page.tsx` | `applications.getPublicJobApplicationForm`, `applications.generatePublicUploadUrl`, `applicationsNode.submitPublicApplication` | ✅ Working (verify end-to-end) | Test full submission flow |
| **Internal** "apply as logged-in user" | `src/app/dashboard/job-openings/[job_id]/apply/page.tsx` | should be `jobs.getPublicJob` + `applications.*` | 🔴 Broken | Fetches job via dead WP endpoint (line ~104), submits via dead WP endpoint (line ~354). Rewrite both to Convex equivalents. Remove raw `localStorage` JWT read. |
| Job detail viewer (orphan?) | `src/app/dashboard/jobs/[job_id]/page.tsx` | should be `jobs.get` | 🔴 Broken / ⚪ | Still calls dead WP endpoint. **First confirm whether this route is linked from anywhere in the nav** — if not, decide: fix or delete. |
| Upcoming interviews | `src/app/dashboard/upcoming-interviews/page.tsx` | none (Calendly only) | ⚪ | No Convex table backing — purely Calendly-sourced. Verify Calendly calls aren't hitting the mock endpoint too. |

---

## 3. Applications / Submissions Pipeline

Convex: `convex/modules/applications.ts`, `convex/modules/applicationsNode.ts`

| Feature | Page(s) | Convex fn | Status | What's needed |
|---|---|---|---|---|
| Applications kanban/pipeline (stage moves) | `src/app/dashboard/applications/page.tsx` | `applications.listWithFilters`, `applications.updateStage` | ✅ Working (main flow) | — |
| "Send assessment" action (candidate row) | `CandidatesListSection.tsx` (rendered inside Applications page + Submissions tab) | should be `applications.sendAssessment` | 🔴 Broken | POSTs to dead WP endpoint `applications/send-job-assessment`. Rewire to real Convex mutation. |
| "Compose email" template fetch (candidate row) | `CandidatesListSection.tsx` | should be `emailTemplates.getByType`/`list` | 🔴 Broken | Fetches from dead WP endpoint `email-templates`. Rewire. |
| "Send email + move stage" action (candidate row) | `CandidatesListSection.tsx` | should be `applications.moveToStageWithEmail` (may need creating) | 🔴 Broken | POSTs to dead WP endpoint `applications/move-stage`. Check if `moveToStageWithEmail` exists in `applications.ts`; if not, add it (combine `updateStage` + email send). |
| Per-job submissions list | `src/app/dashboard/job-posting/[job_id]/submissions/page.tsx` | `applications.listByJob` | ✅ Working | — |
| Applicant detail/resume view | `.../submissions/[applicant_id]/page.tsx` | `applications.get` | ✅ Working | — |
| Grade submitted assessment | `.../submissions/[applicant_id]/assessment/[assessment_id]/grade/page.tsx` | `applications.updateAssessmentScore`, `assessment.gradeTechnicalSubmission` | ✅ Working (verify) | Test full grading flow |
| Orphan "move stage" component | `src/app/dashboard/components/dashboard/ActionSection.tsx` | — | 🧹 Dead code | Not imported anywhere — delete or finish wiring if it turns out to be needed |

---

## 4. Assessments Module

Convex: `convex/modules/assessment.ts`

| Feature | Page(s) | Convex fn | Status | What's needed |
|---|---|---|---|---|
| Assessment library (company) | `src/app/dashboard/assessments/page.tsx` | `assessment.list`, `assessment.create`, `assessment.createTechnical` | ✅ Working | — |
| AI assessment builder | `src/app/dashboard/assessments/new/page.tsx` | `assessment.generateQuestions`, `generateSkills`, `generateTechnicalAssessmentContent` | ✅ Fixed (model) | Was using retired Groq model — fixed along with jobs/CV analysis |
| Grading entry (OpenAI-key gated) | `src/app/dashboard/assessments/grade/page.tsx` | `assessment.gradeTechnicalSubmission` | ⚪ | Verify this page's AI-key gating points at the right key field (`ai_api_key` on company, same as jobs) |
| **Public** candidate assessment-taking page | `src/app/assessment/page.tsx` | should be `jobs.getPublicJob` + a real submit mutation | 🔴 Broken | Loads job via dead WP endpoint (`active-jobs/{jobId}`). Submission is commented-out dead code; only writes "submitted" flag to `localStorage` — **nothing is persisted server-side**. Needs: (1) real job fetch, (2) a real Convex mutation to submit assessment answers tied to the application record. |
| **Public** pre-assessment instructions | `src/app/assessment/instructions/page.tsx` | should be `assessment.getPublic` + submit mutation | 🔴 Broken | Fetches assessment metadata from dead WP endpoint. Submits to dead WP endpoint. Rewire both. |

---

## 5. Admin Panel

Convex: `convex/modules/admin.ts`, `convex/modules/admin/*.ts`

| Feature | Page(s) | Convex fn | Status | What's needed |
|---|---|---|---|---|
| Admin dashboard | `src/app/admin/page.tsx` | `admin.getDashboardStats` | ✅ Working | — |
| Activity feed | `src/app/admin/activity/page.tsx` | `admin.getRecentActivity` | ✅ Working | — |
| Recruiters list/detail | `src/app/admin/recruiters/page.tsx`, `[companyId]/page.tsx` | `admin.getRecruiters`, `getRecruiterDetails` | ✅ Working | — |
| Recruiter activity logs | `[companyId]/activity-logs/page.tsx` | `admin.getRecruiterActivityLogs` | ✅ Working | — |
| Recruiter jobs list/detail | `[companyId]/jobs/page.tsx`, `jobs/[jobId]/page.tsx` | `admin.getRecruiterJobDetails` | ✅ Working | — |
| Admin global assessment templates | `src/app/admin/assessments/page.tsx`, `new/page.tsx` | `admin/assessments.list/create/createTechnical` | ✅ Working | — |
| Admin global email templates | `src/app/admin/templates/page.tsx` | `admin/emailTemplates.list/save` | ✅ Working | — |
| Admin settings | `src/app/admin/settings/page.tsx` | unclear | ⚪ | No Convex module found backing this in the audit — verify whether it persists anything or is a stub UI |

---

## 6. Email Templates (per-company)

Convex: `convex/modules/emailTemplates.ts`

| Feature | Page(s) | Convex fn | Status | What's needed |
|---|---|---|---|---|
| Template editor | `src/app/dashboard/email-templates/page.tsx` | `emailTemplates.list/getByType/upsert/remove` | ✅ Working | — |

---

## 7. Notifications

Convex: `convex/modules/notifications.ts`

| Feature | Page(s) | Convex fn | Status | What's needed |
|---|---|---|---|---|
| Notification center | `src/app/dashboard/notifications/page.tsx` | `notifications.list/markAsRead/markAllAsRead/remove` | ✅ Working | — |

---

## 8. Profile / Settings

Convex: `convex/modules/auth.ts` (`UpdateProfile`), `convex/modules/company.ts` (`update`)

| Feature | Page(s) | Convex fn | Status | What's needed |
|---|---|---|---|---|
| Profile + company settings | `src/app/dashboard/profile/page.tsx` | `auth.UpdateProfile`, `company.update` | ✅ Working | This is where the AI API key (Groq) gets saved — confirm it's saving correctly after your recent test |
| OpenAI/Groq API key setup guide | `src/app/dashboard/profile/openai-api-key-setup/page.tsx` | tied to `company.update` field `ai_api_key` | ⚪ | Verify the instructions on this page match Groq (not OpenAI) since the backend actually uses Groq |
| Calendly connection (inside profile) | same page, Calendly section | external OAuth + `company.update` | 🟡 | Shares the mock-endpoint/hardcoded-URL issue from Auth module §1 |

---

## 9. Known cross-cutting issues (not tied to one feature)

- **`company.get`** (`convex/modules/company.ts`) — declares empty `args: {}` but handler reads `args.companyIdOverride`, which can never be passed. Dormant "admin view as company" path that silently no-ops. Not called by anything today — low priority.
- **`company.get` is a mutation, not a query** — should be `flexibleQuery` for consistency/reactivity, matches no other read-only Convex fn in the codebase.
- **`src/app/lib/errorHandler.ts`** — built around raw `fetch`/`Response`, manual `localStorage` clearing on 403. Only relevant to legacy REST calls; verify nothing still imports it once all dead-API callers are migrated, then delete.
- **Duplicate JWT storage** — `AdminAuthLogin.tsx` writes both `setWithExpiry(DefaultConstants.tokenName, ...)` (correct) and raw `localStorage.setItem("jwt", ...)` (legacy). The raw `"jwt"` key is what all the broken dead-API pages read from — once those pages are migrated to Convex, this duplicate write should be removed too.
