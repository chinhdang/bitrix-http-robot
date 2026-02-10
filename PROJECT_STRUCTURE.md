# Project Structure

Complete overview of the Bitrix24 HTTP Request Robot project structure and file organization.

## Directory Tree

```
bitrix-http-robot/
├── handlers/                   # Request handlers
│   ├── executeHandler.js       # Main robot/activity execution handler
│   └── installHandler.js       # App lifecycle handlers (install/uninstall)
├── services/                   # Business logic services
│   ├── bitrixApi.js           # Bitrix24 API client (bizproc.event.send)
│   └── httpRequest.js         # HTTP request service
├── utils/                      # Utility functions
│   ├── logger.js              # Logging utility
│   └── validation.js          # Input validation functions
├── server.js                   # Main Express server
├── install.js                  # Robot/Activity installation script
├── test-server.js             # Server testing script
├── package.json               # Node.js dependencies and scripts
├── .env                       # Environment configuration (ignored in git)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── README.md                  # Main documentation
├── QUICKSTART.md              # Quick start guide
├── DEPLOYMENT.md              # Deployment guide
├── EXAMPLES.md                # Usage examples
└── PROJECT_STRUCTURE.md       # This file
```

## File Descriptions

### Core Server Files

#### `server.js`
Main Express application server.

**Responsibilities:**
- Initialize Express app
- Configure middleware (body-parser, logging)
- Define routes
- Error handling
- Server startup and graceful shutdown

**Key endpoints:**
- `POST /bitrix-handler/execute` - Robot/Activity execution
- `POST /bitrix-handler/install` - Installation handler
- `POST /bitrix-handler/uninstall` - Uninstallation handler
- `GET /health` - Health check
- `GET /` - Root endpoint

**Dependencies:**
- Express.js for HTTP server
- body-parser for request parsing
- dotenv for environment variables
- All handlers and utilities

---

#### `install.js`
Installation script for registering robot and activity with Bitrix24.

**Responsibilities:**
- Validate configuration
- Register robot using `bizproc.robot.add`
- Register activity using `bizproc.activity.add`
- Display installation results

**Usage:**
```bash
npm run install-robot
```

**Configuration:**
Defines complete robot/activity structure including:
- Properties (input fields)
- Return properties (output values)
- Names and descriptions (multilingual)
- Handler URL
- Subscription settings

---

#### `test-server.js`
Automated testing script for server functionality.

**Tests:**
- Health check endpoint
- Root endpoint
- Execute handler with GET request
- Execute handler with POST request
- Invalid URL handling
- Timeout handling

**Usage:**
```bash
npm test
# or
node test-server.js
```

---

### Handlers

#### `handlers/executeHandler.js`
Main handler for robot/activity execution.

**Flow:**
1. Receive request from Bitrix24
2. Validate event_token and auth
3. Validate properties (URL, method, headers, etc.)
4. Make HTTP request to external API
5. Send result back to Bitrix24 via `bizproc.event.send`
6. Return response to Bitrix24

**Input:**
```javascript
{
  event_token: string,
  properties: {
    url: string,
    method: string,
    headers: string (JSON),
    body: string,
    timeout: number
  },
  auth: object,
  document_id: mixed,
  document_type: array
}
```

**Output:**
```javascript
{
  success: boolean,
  message: string,
  error?: string
}
```

**Error handling:**
- Validation errors
- HTTP request errors
- Timeout errors
- Network errors
- All errors sent back to Bitrix24

---

#### `handlers/installHandler.js`
Handles app lifecycle events (optional, for future use).

**Functions:**
- `handleInstall()` - Process installation events
- `handleUninstall()` - Process uninstallation events

**Use cases:**
- Store installation data
- Initialize configurations
- Clean up on uninstall
- OAuth flow handling

---

### Services

#### `services/httpRequest.js`
HTTP request service using axios.

**Main function:**
```javascript
makeHttpRequest({
  url: string,
  method: string,
  headers: object,
  body: string,
  timeout: number
})
```

**Features:**
- Supports GET, POST, PUT, DELETE
- Handles all HTTP status codes
- Automatic JSON parsing for JSON Content-Type
- Timeout handling
- Error handling for network failures

**Returns:**
```javascript
{
  data: any,
  status: number,
  headers: object,
  statusText: string
}
```

---

#### `services/bitrixApi.js`
Bitrix24 REST API client.

**Main function:**
```javascript
sendBizprocEvent({
  event_token: string,
  return_values: object,
  log_message: string,
  auth: object
})
```

**Features:**
- Calls `bizproc.event.send` method
- Returns workflow execution results to Bitrix24
- Error handling for API calls
- Domain and token extraction

**Critical for:**
- `USE_SUBSCRIPTION` pattern
- Returning values to workflow
- Continuing workflow execution

---

### Utilities

#### `utils/validation.js`
Input validation functions.

**Functions:**
- `isValidUrl(url)` - Validates URL format
- `isValidJson(str)` - Validates JSON string
- `isValidTimeout(timeout)` - Validates timeout range
- `isValidMethod(method)` - Validates HTTP method
- `validateProperties(properties)` - Main validation function

**Returns:**
```javascript
{
  valid: boolean,
  errors: array of strings
}
```

**Security features:**
- URL format validation
- HTTP/HTTPS protocol check
- Method whitelist
- Timeout limits (1ms - 300000ms)
- JSON syntax validation

---

#### `utils/logger.js`
Logging utility for structured logging.

**Functions:**
- `info(message, data)` - Info level logs
- `error(message, data)` - Error level logs
- `warn(message, data)` - Warning level logs
- `debug(message, data)` - Debug level logs (dev only)

**Output format:**
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "INFO",
  "message": "Request received",
  "data": {...}
}
```

---

### Configuration Files

#### `package.json`
Node.js package configuration.

**Scripts:**
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run install-robot` - Install robot/activity to Bitrix24
- `npm test` - Run server tests

**Dependencies:**
- `express` - Web framework
- `axios` - HTTP client
- `body-parser` - Request parsing
- `dotenv` - Environment variables

**Dev Dependencies:**
- `nodemon` - Auto-reload for development

---

#### `.env`
Environment configuration (not in git).

**Variables:**
```env
PORT=3000
BITRIX24_DOMAIN=your-domain.bitrix24.com
BITRIX24_ACCESS_TOKEN=your_token
HANDLER_URL=https://your-domain.com
NODE_ENV=production
```

---

#### `.env.example`
Template for environment configuration.

Copy to `.env` and fill in values.

---

#### `.gitignore`
Git ignore rules.

**Ignored files:**
- `node_modules/` - Dependencies
- `.env` - Sensitive configuration
- `*.log` - Log files
- `.DS_Store` - macOS files

---

### Documentation Files

#### `README.md`
Main documentation.

**Contents:**
- Features overview
- Installation instructions
- Usage guide
- Configuration reference
- API documentation
- Troubleshooting
- Security considerations

---

#### `QUICKSTART.md`
Quick start guide for beginners.

**Contents:**
- Step-by-step setup (10 minutes)
- Prerequisites
- Configuration
- Testing
- Common issues
- Next steps

---

#### `DEPLOYMENT.md`
Deployment guide for production.

**Contents:**
- Deployment options (Cloud, PaaS, VPS, Docker)
- Step-by-step instructions for each platform
- SSL/HTTPS configuration
- Environment variables
- Monitoring and logging
- Scaling considerations
- Cost optimization

---

#### `EXAMPLES.md`
Real-world usage examples.

**Contents:**
- Basic examples (GET, POST, PUT, DELETE)
- API integrations (Slack, Twilio, SendGrid, Stripe)
- Webhook examples
- Advanced use cases
- Error handling patterns
- Best practices

---

#### `PROJECT_STRUCTURE.md`
This file - complete project structure documentation.

---

## Data Flow

### 1. Installation Flow

```
install.js
  ↓
bizproc.robot.add (Bitrix24 API)
  ↓
bizproc.activity.add (Bitrix24 API)
  ↓
Robot/Activity registered in Bitrix24
```

### 2. Execution Flow

```
Bitrix24 Workflow Trigger
  ↓
POST /bitrix-handler/execute
  ↓
handlers/executeHandler.js
  ↓
utils/validation.js (validate input)
  ↓
services/httpRequest.js (make HTTP request)
  ↓
services/bitrixApi.js (send result back)
  ↓
Workflow continues with return values
```

### 3. Error Flow

```
Error occurs in executeHandler
  ↓
Catch error
  ↓
Prepare error return values
  ↓
services/bitrixApi.js (send error)
  ↓
utils/logger.js (log error)
  ↓
Return error response to Bitrix24
```

## Key Design Patterns

### 1. Separation of Concerns
- **Handlers**: HTTP request/response handling
- **Services**: Business logic
- **Utils**: Reusable utilities

### 2. Error Handling
- Try-catch blocks in all async functions
- Always send response to Bitrix24 (even on error)
- Structured error logging

### 3. Validation
- Input validation before processing
- Security checks (URL format, method whitelist)
- Error messages for user feedback

### 4. Logging
- Structured JSON logging
- Different log levels
- Request/response tracking

### 5. Configuration
- Environment-based configuration
- Separation of code and config
- Template for easy setup

## Extension Points

### Adding New Features

#### 1. Add Authentication Presets
Create `services/authPresets.js`:
```javascript
module.exports = {
  bearer: (token) => ({
    'Authorization': `Bearer ${token}`
  }),
  basic: (username, password) => ({
    'Authorization': `Basic ${btoa(username + ':' + password)}`
  })
};
```

#### 2. Add Response Transformations
Create `services/transformers.js`:
```javascript
module.exports = {
  jsonPath: (data, path) => { /* extract value */ },
  xml2json: (xml) => { /* convert XML to JSON */ }
};
```

#### 3. Add Rate Limiting
Update `server.js`:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 60000, max: 100 });
app.use('/bitrix-handler/', limiter);
```

#### 4. Add Request Retry Logic
Update `services/httpRequest.js`:
```javascript
async function makeHttpRequestWithRetry(config, retries = 3) {
  // Implement retry logic
}
```

## Testing Strategy

### Unit Tests (Future)
- Test validation functions
- Test HTTP request service
- Test Bitrix API client

### Integration Tests
- Use `test-server.js` for full flow testing
- Test with real Bitrix24 instance
- Test different scenarios

### Manual Testing
- Test in Bitrix24 Automation Rules
- Test in Workflow Designer
- Test with various external APIs

## Performance Considerations

### Current Implementation
- Synchronous request processing
- Single server instance
- No caching
- No rate limiting

### Optimization Opportunities
1. **Async processing** - Queue requests for heavy workloads
2. **Caching** - Cache repeated requests
3. **Connection pooling** - Reuse HTTP connections
4. **Request batching** - Batch multiple requests
5. **Horizontal scaling** - Multiple server instances

## Security Considerations

### Current Implementation
- Input validation
- HTTPS required
- No sensitive data logging

### Security Enhancements
1. **URL whitelist** - Restrict allowed domains
2. **Rate limiting** - Prevent abuse
3. **IP blocking** - Block internal IPs
4. **Request signing** - Verify requests from Bitrix24
5. **Secret rotation** - Regular token updates

## Maintenance

### Regular Tasks
- Update dependencies: `npm update`
- Review logs for errors
- Monitor server performance
- Backup configuration

### Version Updates
- Update version in `package.json`
- Document changes in changelog
- Test thoroughly before deployment
- Deploy with zero downtime

## Contributing

To contribute to this project:
1. Follow existing code structure
2. Add tests for new features
3. Update documentation
4. Follow code style
5. Submit pull request

## License

ISC - See package.json for details.
