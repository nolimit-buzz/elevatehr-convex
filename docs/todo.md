# Todo List

## Phase 1: Core Permission Changes

- [ ] 1. Update permission.ts - add flexibleQuery, flexibleMutation, flexibleAction
- [ ] 2. Test permission.ts changes in isolation

## Phase 2: Backend Module Updates

- [ ] 3. Update jobs.ts - replace authed functions with flexible
- [ ] 4. Update applications.ts - replace authed functions with flexible
- [ ] 5. Update assessment.ts - replace authed functions with flexible
- [ ] 6. Update notifications.ts - replace authed functions with flexible
- [ ] 7. Update emailTemplates.ts - replace authed functions with flexible
- [ ] 8. Update statistics.ts - replace authed functions with flexible
- [ ] 9. Update company.ts - replace authed functions with flexible

## Phase 3: Simplification

- [ ] 10. Simplify handler authorization - use ctx.\_isAdmin + keep companyIdOverride
- [ ] 11. Clean up defensive validation code

## Phase 4: Client Updates

- [ ] 12. Update client hooks - remove useCompanyIdOverride helper
- [ ] 13. Keep impersonation URL pattern in admin page

## Phase 5: Testing

- [ ] 14. Test impersonation flow end-to-end
