# Bitrix24 JS SDK (@bitrix24/b24jssdk) - Reference

> Version: 1.0.1 | License: MIT | TypeScript-first
> Docs: https://bitrix24.github.io/b24jssdk/
> GitHub: https://github.com/bitrix24/b24jssdk

## What is b24jssdk?

The **@bitrix24/b24jssdk** is the modern, official TypeScript/JavaScript SDK for the Bitrix24 REST API. It replaces the legacy `BX24` JS SDK (the one injected via `<script src="//api.bitrix24.com/api/v1/">`).

### Key differences from legacy BX24 SDK

| Feature | Legacy BX24 | @bitrix24/b24jssdk |
|---------|------------|-------------------|
| Language | JavaScript only | TypeScript-first |
| Module system | Global `BX24` object | ESM / UMD |
| Framework support | None | Vue, React, Nuxt, Node.js |
| Server-side | Not supported | B24Hook, B24OAuth |
| API versions | v2 only | v2 + v3 |
| List methods | Manual pagination | Auto-pagination (CallList, FetchList) |
| Batch | Manual chunking | Auto-chunking (BatchByChunk) |
| Installation | Script tag only | npm/yarn/pnpm/bun |

### Relationship to BX24

The legacy `BX24.callMethod()`, `BX24.placement.call()`, etc. are still functional but deprecated. The new SDK provides `B24Frame` which is the replacement for the `BX24` global when building iframe apps. For server-side use cases (webhooks, OAuth), the new SDK provides `B24Hook` and `B24OAuth` -- something the legacy SDK never had.

## Installation

```bash
npm install @bitrix24/b24jssdk
```

## Three Core Classes

| Class | Environment | Auth Mechanism | Use Case |
|-------|-------------|---------------|----------|
| `B24Frame` | Client (iframe) | Current user token (auto) | Apps embedded in Bitrix24 UI |
| `B24Hook` | Server (Node.js) | Webhook secret | Server scripts, automations |
| `B24OAuth` | Server (Node.js) | OAuth 2.0 + refresh | Production server apps |

All three extend `AbstractB24` and share the same API calling interface.

---

## B24Frame (Client-Side Iframe Apps)

### Initialization

```typescript
import { initializeB24Frame, B24Frame } from '@bitrix24/b24jssdk'

// initializeB24Frame() reads window.name (set by Bitrix parent frame)
// to extract DOMAIN, PROTOCOL, APP_SID, then calls init() internally
const $b24: B24Frame = await initializeB24Frame()

// When done (component unmount):
$b24.destroy()
```

The `initializeB24Frame()` function:
1. Parses `window.name` to get `DOMAIN|PROTOCOL|APP_SID`
2. Creates a `B24Frame` instance
3. Sends `getInitData` message to parent window
4. Receives `MessageInitData` containing auth tokens, placement info, options
5. Initializes AuthManager, PlacementManager, OptionsManager
6. Returns the ready-to-use `B24Frame`

### Vue Integration

```typescript
import { initializeB24Frame, type B24Frame } from '@bitrix24/b24jssdk'
import { ref, onMounted, onUnmounted } from 'vue'

const $b24 = ref<B24Frame>()

onMounted(async () => {
  $b24.value = await initializeB24Frame()
})

onUnmounted(() => {
  $b24.value?.destroy()
})
```

### React Integration

```typescript
import { initializeB24Frame, type B24Frame } from '@bitrix24/b24jssdk'
import { useEffect, useRef } from 'react'

const b24Ref = useRef<B24Frame | null>(null)

useEffect(() => {
  let isMounted = true
  async function init() {
    const b24 = await initializeB24Frame()
    if (isMounted) b24Ref.current = b24
  }
  init()
  return () => {
    isMounted = false
    b24Ref.current?.destroy()
  }
}, [])
```

### UMD / Script Tag (Browser)

```html
<script src="https://unpkg.com/@bitrix24/b24jssdk@latest/dist/umd/index.min.js"></script>
<script>
  const $b24 = await B24Js.initializeB24Frame()
  const response = await $b24.actions.v2.call.make({
    method: 'user.current',
    requestId: 'get-user'
  })
</script>
```

### B24Frame Sub-Managers

```typescript
$b24.auth        // AuthActions - getAuthData(), refreshAuth(), isAdmin
$b24.placement   // PlacementManager - placement info, call(), bindEvent()
$b24.parent      // ParentManager - parent window communication
$b24.options     // OptionsManager - app/user options
$b24.dialog      // DialogManager - Bitrix24 dialogs
$b24.slider      // SliderManager - open sliders
$b24.actions     // ActionsManager - v2/v3 REST API methods
$b24.tools       // ToolsManager - healthCheck, ping
```

### B24Frame Properties

```typescript
$b24.isFirstRun    // boolean - true on first app launch
$b24.isInstallMode // boolean - true during installation
$b24.getAppSid()   // string - application session ID
$b24.getLang()      // B24LangList - current language
```

---

## B24Hook (Server-Side Webhook)

### Initialization

```typescript
import { B24Hook } from '@bitrix24/b24jssdk'

// From URL (recommended)
const $b24 = B24Hook.fromWebhookUrl(
  'https://your-domain.bitrix24.com/rest/1/your-webhook-secret/'
)

// From params
const $b24 = new B24Hook({
  b24Url: 'https://your-domain.bitrix24.com',
  userId: 1,
  secret: 'your-webhook-secret'
})
```

**IMPORTANT**: B24Hook emits a client-side warning if used in a browser. The webhook secret must NEVER be exposed in client code. Call `$b24.offClientSideWarning()` only if you explicitly understand the risk.

### URL Formats Supported

- v2: `https://domain.bitrix24.com/rest/{userId}/{secret}`
- v3: `https://domain.bitrix24.com/rest/api/{userId}/{secret}`

---

## B24OAuth (Server-Side OAuth 2.0)

### Initialization

```typescript
import { B24OAuth } from '@bitrix24/b24jssdk'

const $b24 = new B24OAuth(
  // B24OAuthParams - from Bitrix24 OAuth handshake
  {
    applicationToken: 'app-token',
    userId: 1,
    memberId: 'member-id',
    accessToken: 'current-access-token',
    refreshToken: 'current-refresh-token',
    expires: 1234567890,
    expiresIn: 3600,
    scope: 'crm,bizproc',
    domain: 'your-domain.bitrix24.com',
    clientEndpoint: 'https://your-domain.bitrix24.com/rest/',
    serverEndpoint: 'https://oauth.bitrix.info/rest/',
    status: 'L'  // EnumAppStatus
  },
  // B24OAuthSecret
  {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret'
  }
)
```

### Token Refresh Callbacks

```typescript
// Called AFTER successful refresh (persist new tokens)
$b24.setCallbackRefreshAuth(async ({ authData, b24OAuthParams }) => {
  await saveToDatabase(b24OAuthParams) // persist updated tokens
})

// Custom refresh handler (replace default OAuth endpoint call)
$b24.setCustomRefreshAuth(async () => {
  const tokens = await myCustomTokenRefresh()
  return {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expires: tokens.expires,
    expires_in: tokens.expiresIn,
    client_endpoint: tokens.clientEndpoint,
    server_endpoint: tokens.serverEndpoint,
    member_id: tokens.memberId,
    scope: tokens.scope,
    status: tokens.status,
    domain: tokens.domain
  }
})

// Check admin status
await $b24.initIsAdmin('check-admin')
console.log($b24.auth.isAdmin)
```

---

## Making REST API Calls

All three classes share the same `actions` interface.

### Single Call (call.make)

```typescript
const response = await $b24.actions.v2.call.make({
  method: 'crm.contact.get',
  params: { id: 123 },
  requestId: 'get-contact-123'  // always provide for tracking
})

if (response.isSuccess) {
  const data = response.getData()
  console.log(data)
} else {
  console.error(response.getErrorMessages())
}
```

### List with Auto-Pagination (callList.make)

Fetches ALL pages automatically. Good for < 1000 records.

```typescript
const response = await $b24.actions.v2.callList.make({
  method: 'crm.contact.list',
  params: {
    select: ['ID', 'NAME', 'LAST_NAME', 'EMAIL'],
    filter: { '>ID': 0 },
    order: { ID: 'ASC' }
  },
  idKey: 'ID',                    // field used for pagination cursor
  customKeyForResult: 'items',    // key name in response data
  requestId: 'list-contacts'
})

const allContacts = response.getData()
```

### Streaming Large Lists (fetchList.make)

AsyncGenerator for memory-efficient processing. Good for > 1000 records.

```typescript
const generator = $b24.actions.v2.fetchList.make({
  method: 'crm.contact.list',
  params: {
    select: ['ID', 'NAME'],
    order: { ID: 'ASC' }
  },
  idKey: 'ID',
  customKeyForResult: 'items',
  requestId: 'stream-contacts'
})

for await (const chunk of generator) {
  console.log(`Processing ${chunk.length} items`)
  // Process each chunk without holding all data in memory
}
```

### Batch (batch.make)

Execute up to 50 commands in a single HTTP request.

```typescript
const response = await $b24.actions.v2.batch.make({
  calls: [
    ['crm.contact.get', { id: 1 }],
    ['crm.contact.get', { id: 2 }],
    ['crm.deal.list', { filter: { CONTACT_ID: 1 } }]
  ],
  options: {
    isHaltOnError: true,    // stop on first error
    requestId: 'batch-get'
  }
})
```

### Batch with Auto-Chunking (batchByChunk.make)

Automatically splits > 50 commands into multiple batch requests.

```typescript
const commands = Array.from({ length: 150 }, (_, i) => [
  'crm.contact.add',
  { fields: { NAME: `Contact ${i + 1}` } }
])

const result = await $b24.actions.v2.batchByChunk.make({
  calls: commands,
  options: { requestId: 'bulk-create' }
})
```

### v2 vs v3 API

```typescript
// v2 - traditional Bitrix REST format
$b24.actions.v2.call.make({ method: '...', params: { ... } })

// v3 - newer format with array-based filters, higher limits (up to 1000/page)
$b24.actions.v3.callList.make({
  method: 'main.eventlog.list',
  params: {
    filter: [['userId', '=', 1]],  // array-based filter syntax
    select: ['id', 'userId']
  },
  idKey: 'id',
  customKeyForResult: 'items',
  limit: 600,  // v3 supports up to 1000 vs v2's 50
  requestId: 'v3-list'
})
```

---

## Placement Manager

For apps embedded in specific Bitrix24 UI locations (CRM card, activity timeline, robot settings, etc.).

### Reading Placement Context

```typescript
const $b24 = await initializeB24Frame()

// What placement is this?
$b24.placement.placement  // e.g., 'CRM_DEAL_DETAIL_TAB', 'DEFAULT'
$b24.placement.isDefault  // true if no specific placement
$b24.placement.isSliderMode  // true if opened in a slider

// Placement options (data passed by Bitrix to this placement)
const options = $b24.placement.options
// For robot placement: { current_values: {...}, document_fields: {...} }
```

### Placement Interface Commands

```typescript
// Get available interface commands for this placement
const iface = await $b24.placement.getInterface()

// Call a placement command (e.g., setPropertyValue for robot config)
await $b24.placement.call('setPropertyValue', {
  url: 'https://api.example.com',
  method: 'POST'
})

// Bind to placement events
await $b24.placement.bindEvent('onSave', (data) => {
  console.log('Save triggered', data)
})

// Custom bind with parameters
await $b24.placement.callCustomBind(
  'someCommand',
  { param1: 'value1' },
  (result) => { console.log(result) }
)
```

### PlacementManager Source Reference

```typescript
class PlacementManager {
  get placement(): string        // placement identifier
  get title(): string            // alias for placement (backward compat)
  get isDefault(): boolean       // true if 'DEFAULT'
  get options(): any             // PLACEMENT_OPTIONS from init data
  get isSliderMode(): boolean    // options?.IFRAME === 'Y'

  async getInterface(): Promise<any>
  async bindEvent(eventName: string, callback: Function): Promise<any>
  async call(command: string, parameters?: Record<string, any>): Promise<any>
  async callCustomBind(command: string, params?: any, callback?: Function): Promise<any>
}
```

---

## MessageInitData (What B24Frame Receives on Init)

```typescript
type MessageInitData = {
  // Auth
  AUTH_ID: string         // access token
  REFRESH_ID: string      // refresh token
  AUTH_EXPIRES: string    // expiration timestamp

  // Context
  DOMAIN: string          // e.g., 'your-domain.bitrix24.com'
  PROTOCOL: string        // '1' for HTTPS
  PATH: string            // REST API path
  LANG: string            // e.g., 'en', 'ru'
  MEMBER_ID: string       // portal member ID
  IS_ADMIN: boolean       // current user is admin

  // App Options
  APP_OPTIONS: Record<string, any>   // app-level settings
  USER_OPTIONS: Record<string, any>  // user-level settings

  // Placement
  PLACEMENT: string                   // placement identifier
  PLACEMENT_OPTIONS: Record<string, any>  // placement-specific data

  // Installation
  INSTALL: boolean        // true during installation flow
  FIRST_RUN: boolean      // true on first launch
}
```

---

## Auth Types

```typescript
type B24HookParams = {
  b24Url: string    // e.g., 'https://domain.bitrix24.com'
  userId: number    // webhook user ID
  secret: string    // webhook secret
}

type B24OAuthSecret = {
  clientId: string
  clientSecret: string
}

interface B24OAuthParams {
  applicationToken: string
  userId: number
  memberId: string
  accessToken: string
  refreshToken: string
  expires: number
  expiresIn: number
  scope: string
  domain: string
  clientEndpoint: string
  serverEndpoint: string
  status: string  // EnumAppStatus
}

interface AuthActions {
  getAuthData(): false | AuthData
  refreshAuth(): Promise<AuthData>
  getUniq(prefix: string): string
  isAdmin: boolean
  getTargetOrigin(): string
  getTargetOriginWithPath(): Map<ApiVersion, string>
}

type AuthData = {
  access_token: string
  refresh_token: string
  expires: number
  expires_in: number
  domain: string
  member_id: string
}
```

---

## Logging

```typescript
import { LoggerFactory } from '@bitrix24/b24jssdk'

// Browser logger
const $logger = LoggerFactory.createForBrowser(
  'MyApp',
  import.meta.env?.DEV === true  // enable debug in dev
)

$logger.info('Operation completed', { contactId: 123 })
$logger.warn('Rate limit approaching', { remaining: 5 })
$logger.error('API call failed', { method: 'crm.deal.add', error: err })
$logger.debug('Debug data', { payload })

// Attach logger to B24 instance
$b24.setLogger($logger)
```

---

## Health Check and Ping

```typescript
// Verify REST API is available
const isHealthy = await $b24.tools.healthCheck.make({
  requestId: 'health-check'
})

// Measure API response time
const pingTime = await $b24.tools.ping.make({
  requestId: 'ping-test'
})
```

---

## CRM Examples

### Create Contact

```typescript
const response = await $b24.actions.v2.call.make({
  method: 'crm.contact.add',
  params: {
    fields: {
      NAME: 'John',
      LAST_NAME: 'Doe',
      EMAIL: [{ VALUE: 'john@example.com', VALUE_TYPE: 'WORK' }],
      PHONE: [{ VALUE: '+1234567890', VALUE_TYPE: 'MOBILE' }]
    }
  },
  requestId: 'create-contact'
})
const contactId = response.getData()  // returns new ID
```

### List Deals with Filter

```typescript
const response = await $b24.actions.v2.callList.make({
  method: 'crm.deal.list',
  params: {
    select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY'],
    filter: { 'STAGE_ID': 'NEW', '>OPPORTUNITY': 1000 },
    order: { OPPORTUNITY: 'DESC' }
  },
  idKey: 'ID',
  customKeyForResult: 'deals',
  requestId: 'list-deals'
})
```

### Bulk Create Deals

```typescript
const deals = [
  { TITLE: 'Deal 1', OPPORTUNITY: 5000 },
  { TITLE: 'Deal 2', OPPORTUNITY: 10000 },
  // ... up to any number
]

const commands = deals.map(d => ['crm.deal.add', { fields: d }])

const result = await $b24.actions.v2.batchByChunk.make({
  calls: commands,
  options: { requestId: 'bulk-deals' }
})
```

---

## Migration from Legacy BX24 SDK

### Before (legacy)

```javascript
BX24.init(function() {
  BX24.callMethod('crm.contact.get', { id: 123 }, function(result) {
    if (result.error()) {
      console.error(result.error())
    } else {
      console.log(result.data())
    }
  })
})

// Placement
BX24.placement.call('setPropertyValue', { url: 'https://...' })
```

### After (b24jssdk)

```typescript
import { initializeB24Frame } from '@bitrix24/b24jssdk'

const $b24 = await initializeB24Frame()

const response = await $b24.actions.v2.call.make({
  method: 'crm.contact.get',
  params: { id: 123 },
  requestId: 'get-contact'
})

if (response.isSuccess) {
  console.log(response.getData())
} else {
  console.error(response.getErrorMessages())
}

// Placement
await $b24.placement.call('setPropertyValue', { url: 'https://...' })
```

### Deprecated Methods (will be removed in v2.0.0)

| Deprecated | Replacement |
|-----------|-------------|
| `$b24.callMethod()` | `$b24.actions.v2.call.make()` |
| `$b24.callListMethod()` | `$b24.actions.v2.callList.make()` |
| `$b24.fetchListMethod()` | `$b24.actions.v2.fetchList.make()` |
| `$b24.callBatch()` | `$b24.actions.v2.batch.make()` |
| `$b24.callBatchByChunk()` | `$b24.actions.v2.batchByChunk.make()` |
| `LoggerBrowser` | `LoggerFactory.createForBrowser()` |

---

## Nuxt 4 Integration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@bitrix24/b24jssdk-nuxt']
})
```

---

## Project Structure (Source)

```
packages/jssdk/src/
  core/
    abstract-b24.ts    -- Base class for B24Frame/B24Hook/B24OAuth
    actions/           -- v2/v3 action managers (call, callList, batch, etc.)
    http/              -- HTTP clients for v2/v3
    interaction/       -- Message passing
    language/          -- i18n
    result.ts          -- Response wrapper
    sdk-error.ts       -- Error class (all errors extend SdkError)
    tools/             -- Type utilities
  frame/
    b24.ts             -- B24Frame class
    auth.ts            -- AuthManager (iframe auth)
    dialog.ts          -- DialogManager
    frame.ts           -- AppFrame (low-level frame)
    message/           -- MessageManager + MessageCommands
    options.ts         -- OptionsManager
    parent.ts          -- ParentManager
    placement.ts       -- PlacementManager
    slider.ts          -- SliderManager
  hook/
    b24.ts             -- B24Hook class
    auth.ts            -- AuthHookManager
  oauth/
    b24.ts             -- B24OAuth class
    auth.ts            -- AuthOAuthManager (token refresh)
  loader-b24frame.ts   -- initializeB24Frame() function
  logger/              -- LoggerFactory
  tools/               -- Utility helpers
  types/               -- All TypeScript type definitions
    auth.ts            -- Auth types
    b24.ts             -- TypeB24 interface, ApiVersion
    crm/               -- CRM entity types
    placement/         -- Placement types (UF interface)
    ...
```

---

## Key Takeaways for This Project (bitrix-http-robot)

1. **Current approach (legacy BX24)**: The placement handler in `handlers/placementHandler.js` uses the legacy `BX24.placement.call('setPropertyValue', ...)` pattern via script tag `<script src="//api.bitrix24.com/api/v1/">`. This still works and is fine for a simple robot config UI.

2. **If migrating to b24jssdk**: Would use `initializeB24Frame()` then `$b24.placement.call('setPropertyValue', {...})`. The placement API is essentially the same, just wrapped in the new SDK's PlacementManager class.

3. **Server-side (executeHandler)**: Could use `B24Hook` or `B24OAuth` instead of raw `axios` calls to the Bitrix REST API, getting automatic pagination, batching, and token refresh for free.

4. **The new SDK's PlacementManager still uses the same underlying commands**: `setPropertyValue`, `getInterface`, `bindEvent`. The wire protocol with the Bitrix parent frame is unchanged.
