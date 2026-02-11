# Bitrix24 Marketplace Submission Guide

## Prerequisites

### 1. Technology Partner Account
- Register at [vendors.bitrix24.com](https://vendors.bitrix24.com)
- Company information required: name, website, contact email
- Partner code assigned after approval (e.g., `synity`)
- Takes 1-3 business days for approval

### 2. OAuth Application Credentials
- After partner approval, create an app at [vendors.bitrix24.com](https://vendors.bitrix24.com)
- Obtain `client_id` and `client_secret`
- Set these as environment variables: `BITRIX_CLIENT_ID`, `BITRIX_CLIENT_SECRET`

### 3. Server Infrastructure
- Production server with HTTPS (Railway: `bitrix-http-robot-production.up.railway.app`)
- PostgreSQL database for token storage and usage tracking
- 99.9% uptime recommended

---

## App Configuration (vendors.bitrix24.com)

### Application Form Fields

| Field | Value |
|-------|-------|
| **App Name (EN)** | SYNITY HTTP Request |
| **App Name (RU)** | SYNITY HTTP-запрос |
| **App Code** | `synity.http_request` |
| **Version** | `2.1.0` |
| **Category** | Developer tools / Automation |
| **Type** | Server-side application (with UI) |
| **Pricing** | Free (with premium plans) |

### URLs to Configure

| URL Type | Value |
|----------|-------|
| **Application URL** | `https://bitrix-http-robot-production.up.railway.app/admin` |
| **Install Handler** | `https://bitrix-http-robot-production.up.railway.app/bitrix-handler/install` |
| **Uninstall Handler** | `https://bitrix-http-robot-production.up.railway.app/bitrix-handler/uninstall` |

### Required Scopes (Permissions)

| Scope | Purpose |
|-------|---------|
| `bizproc` | Register and execute automation rules/activities |
| `crm` | Access CRM document fields for variable picker |
| `placement` | Register custom UI placement for robot settings |

### Event Handlers

| Event | Handler URL |
|-------|------------|
| `ONAPPINSTALL` | `https://bitrix-http-robot-production.up.railway.app/bitrix-handler/install` |
| `ONAPPUNINSTALL` | `https://bitrix-http-robot-production.up.railway.app/bitrix-handler/uninstall` |

---

## Submission Checklist

### Code Readiness
- [x] OAuth token storage (PostgreSQL `oauth_tokens` table)
- [x] Token auto-refresh via `oauth.bitrix.info`
- [x] Auto-register robot on `ONAPPINSTALL`
- [x] Cleanup tokens on `ONAPPUNINSTALL`
- [x] Multi-tenant support (per `member_id`)
- [x] Fail-open pattern (DB errors don't block robot execution)
- [ ] Test on fresh Bitrix24 portal (not your dev portal)

### Environment Variables (Production)
- [ ] `BITRIX_CLIENT_ID` — from vendors.bitrix24.com
- [ ] `BITRIX_CLIENT_SECRET` — from vendors.bitrix24.com
- [ ] `HANDLER_URL` — `https://bitrix-http-robot-production.up.railway.app`
- [ ] `DATABASE_URL` — Railway PostgreSQL connection string

### Marketplace Listing Content
- [ ] App icon (200x200 PNG, transparent background)
- [ ] Screenshots (1280x800 or similar, at least 3)
  - Robot configuration UI
  - Test request feature
  - Admin dashboard
- [ ] App description EN — see `docs/APP-DESCRIPTION.md`
- [ ] App description VN — see `docs/APP-DESCRIPTION.md`
- [ ] Privacy Policy URL — see `docs/PRIVACY-POLICY.md`
- [ ] Terms of Service URL — see `docs/TERMS-OF-SERVICE.md`
- [ ] Support contact email
- [ ] Documentation/Help URL

### Screenshots Needed
1. **Robot in automation rules list** — showing [SYNITY] HTTP Request available
2. **Robot configuration UI** — full placement UI with URL, method, headers, body
3. **Test Request feature** — showing test results with response data
4. **Output mapping** — JSON path extraction to output variables
5. **Admin dashboard** — stats, usage, request log
6. **Variable picker** — selecting CRM fields as request parameters

### Testing Before Submission
- [ ] Install on fresh Bitrix24 trial portal
- [ ] Verify robot auto-registers on install
- [ ] Create automation rule using the robot
- [ ] Execute robot and verify response data
- [ ] Test output mapping to next rule
- [ ] Verify admin page loads correctly
- [ ] Uninstall and verify cleanup
- [ ] Reinstall and verify everything works again

---

## Moderation Process

### What Bitrix Reviews
1. **Functionality** — App works as described
2. **Security** — No data leaks, proper auth verification
3. **UI/UX** — Clean interface, follows Bitrix24 design guidelines
4. **Performance** — No excessive API calls, reasonable response times
5. **Description** — Accurate, clear, no misleading claims
6. **Compliance** — Privacy policy, terms of service present

### Common Rejection Reasons
- Missing error handling for edge cases
- App breaks if user has limited permissions
- No uninstall cleanup
- Poor/missing localization
- Excessive REST API calls (rate limiting issues)
- UI doesn't work in Bitrix24 iframe

### Timeline
- Initial review: 3-7 business days
- Revision cycle: 2-5 business days per round
- Total: typically 1-3 weeks

---

## Post-Publication

### Monitoring
- Monitor request logs in admin dashboard
- Track install/uninstall rates
- Monitor OAuth token refresh failures
- Set up alerts for server errors

### Updates
- Update version in vendors.bitrix24.com
- Each update goes through moderation again (usually faster)
- Use `bizproc.robot.update` for robot config changes (auto-applied on token refresh)

### Support
- Respond to marketplace reviews
- Monitor support email
- Keep documentation updated
