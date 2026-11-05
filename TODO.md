# TODO — Get everything working end-to-end

Tick these off in order. See FEATURE.md for full context/detail on each item.
Priority order: 🔴 blocking bugs first, then 🟡 degraded features, then ⚪ verification, then 🧹 cleanup.

## 🔴 Blocking — fix first

- [x] Registration form calling dead WP API → now calls `company.create`
- [x] Job posting AI "regenerate" buttons were stubs → now call `jobs.regenerateField`
- [x] Groq model `llama-3.3-70b-versatile` retired → swapped to `openai/gpt-oss-120b` everywhere
- [ ] **Onboarding wizard** (`src/app/onboarding/page.tsx`) — rewrite to call `company.update`, remove dead WP POST + raw localStorage JWT read
- [ ] **Public assessment-taking page** (`src/app/assessment/page.tsx`) — fetch job via `jobs.getPublicJob` instead of dead WP endpoint; implement a real Convex submit mutation (currently only sets a localStorage flag, nothing persists)
- [ ] **Public assessment instructions page** (`src/app/assessment/instructions/page.tsx`) — fetch assessment via real Convex query instead of dead WP endpoint; wire submit to the same new submit mutation above
- [ ] **Internal "apply as logged-in user" flow** (`src/app/dashboard/job-openings/[job_id]/apply/page.tsx`) — fetch job via `jobs.getPublicJob`/`jobs.get`, submit via `applications.generatePublicUploadUrl` + `applicationsNode.submitPublicApplication`
- [ ] **Confirm `dashboard/jobs/[job_id]/page.tsx` is actually linked/used anywhere** — if yes, fix (point at `jobs.get`); if orphan, delete the route

## 🟡 Degraded — fix second

- [ ] **`CandidatesListSection.tsx` — "Send assessment" button** — wire to real `applications.sendAssessment` (check if it exists; add if not)
- [ ] **`CandidatesListSection.tsx` — "Compose email" template fetch** — wire to `emailTemplates.getByType`/`list`
- [ ] **`CandidatesListSection.tsx` — "Send email + move stage" button** — wire to `applications.moveToStageWithEmail` (check if it exists; add if not — likely needs to combine `updateStage` + an email-send action)
- [ ] **Calendly integration cleanup** (`src/app/auth/calendly/page.tsx`) — replace hardcoded test user URL (`api.calendly.com/users/karenziboh`) with real host lookup; replace `stoplight.io` mock endpoint with real Calendly API base URL
- [ ] **Admin login duplicate JWT storage** (`AdminAuthLogin.tsx`) — remove the raw `localStorage.setItem("jwt", ...)` line, keep only `setWithExpiry`

## ⚪ Needs verification (probably fine, confirm with a real click-through)

- [ ] Public job apply flow (`job-openings/[job_id]/apply/page.tsx`, no-auth) — click through a full submission end-to-end
- [ ] Assessment grading flow (submissions → grade page) — click through end-to-end
- [ ] `src/app/dashboard/assessments/grade/page.tsx` — confirm the AI-key gating checks the same `ai_api_key` field on `companies` used by job generation
- [ ] `src/app/dashboard/profile/openai-api-key-setup/page.tsx` — confirm instructions actually say "Groq" not "OpenAI" (backend only supports Groq right now)
- [ ] `src/app/admin/settings/page.tsx` — figure out if this persists anything at all or is a non-functional stub
- [ ] `src/app/dashboard/upcoming-interviews/page.tsx` — confirm Calendly calls here aren't also hitting the mock endpoint

## 🧹 Cleanup (no user-facing impact, do last or skip)

- [ ] Delete or finish `src/app/dashboard/components/dashboard/ActionSection.tsx` (orphan, unused anywhere)
- [ ] Delete `src/app/lib/errorHandler.ts` once nothing imports it anymore (legacy REST-only error handler)
- [ ] `convex/modules/company.ts` — fix `get` to actually accept `companyIdOverride` in its args validator (or remove the dead code path), and convert it from `flexibleMutation` to `flexibleQuery` for consistency

## End-of-night acceptance test (do this last, run through live in the browser)

- [ ] Register a brand-new company end-to-end → lands on dashboard
- [ ] Complete onboarding wizard → data actually saved (reload and confirm it persisted)
- [ ] Set Groq API key in Profile → create a job posting → AI description generates → regenerate each of the 3 sections individually
- [ ] Publish job → open public job page in incognito → apply as a candidate (no login) → confirm application appears in dashboard pipeline
- [ ] Move that application through pipeline stages, including send-assessment and send-email-and-move-stage actions
- [ ] Candidate opens assessment link → reads instructions → takes assessment → submits → confirm it shows up server-side (not just localStorage) and recruiter can grade it
- [ ] Recruiter grades submission → score shows on applicant detail page
- [ ] Check notifications fired for key events (new application, assessment submitted, etc.)
- [ ] Admin login → dashboard stats, recruiters list, activity logs all load real data
