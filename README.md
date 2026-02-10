# Bitrix24 HTTP Request Robot

A custom robot/activity for Bitrix24 that enables making HTTP requests to external APIs directly from workflows and automation rules. Works like Postman integrated into Bitrix24!

## Features

- ✅ Support for GET, POST, PUT, DELETE HTTP methods
- ✅ Full response data: body, status code, and headers
- ✅ Works in both Automation Rules and Workflow Designer
- ✅ Custom headers support (including Authorization)
- ✅ Request timeout configuration
- ✅ Comprehensive error handling
- ✅ JSON and text response support

## Architecture

```
Bitrix24 Workflow → HTTP Request Robot → External API
                         ↓
                    Your Server (Node.js)
                         ↓
                    bizproc.event.send
                         ↓
                    Bitrix24 (returns values)
```

## Installation

### 1. Clone and Install Dependencies

```bash
cd bitrix-http-robot
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
BITRIX24_DOMAIN=your-domain.bitrix24.com
BITRIX24_ACCESS_TOKEN=your_access_token_here
HANDLER_URL=https://your-public-domain.com
```

**Important:** `HANDLER_URL` must be publicly accessible via HTTPS.

### 3. Deploy Your Server

Deploy the server to a hosting provider with HTTPS support:

- **Cloud providers**: AWS, Google Cloud, Azure
- **PaaS**: Heroku, Render, Railway
- **VPS**: DigitalOcean, Linode with nginx
- **Local testing**: ngrok

```bash
# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

### 4. Install Robot and Activity to Bitrix24

```bash
npm run install-robot
```

This will register:
- **Robot** for Automation Rules
- **Activity** for Workflow Designer

## Usage

### In Automation Rules

1. Go to CRM → Deals (or any other entity)
2. Click "Automation Rules"
3. Add a new rule
4. Find "HTTP Request" in the list of robots
5. Configure the request parameters
6. Use response variables in subsequent actions

### In Workflow Designer

1. Go to Settings → Workflow → Workflow Templates
2. Create or edit a workflow
3. Add "HTTP Request" activity
4. Configure the request
5. Use the return values in next steps

### Configuration Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **URL** | String | Yes | Target URL (must start with http:// or https://) |
| **HTTP Method** | Select | Yes | GET, POST, PUT, or DELETE |
| **Headers** | JSON | No | Request headers as JSON object |
| **Request Body** | Text | No | Body content (for POST/PUT) |
| **Timeout** | Integer | No | Timeout in milliseconds (default: 30000, max: 300000) |

### Return Values

After execution, these variables are available in your workflow:

| Variable | Type | Description |
|----------|------|-------------|
| **Response Body** | Text | Response body content (JSON or text) |
| **Status Code** | Integer | HTTP status code (200, 404, 500, etc.) |
| **Response Headers** | Text | Response headers as JSON string |
| **Error Message** | String | Error message if request failed |

### Example Use Cases

#### 1. Simple GET Request

```
URL: https://api.example.com/users/123
Method: GET
Headers: {"Authorization": "Bearer your-token"}
```

Access response:
```
{{Variable:http_request_robot_1_responseBody}}
{{Variable:http_request_robot_1_statusCode}}
```

#### 2. POST Request with JSON

```
URL: https://api.example.com/create
Method: POST
Headers: {"Content-Type": "application/json"}
Body: {"name": "{{Document:TITLE}}", "amount": {{Document:OPPORTUNITY}}}
```

#### 3. Webhook Notification

```
URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
Method: POST
Headers: {"Content-Type": "application/json"}
Body: {"text": "New deal created: {{Document:TITLE}}"}
```

#### 4. External API Integration

```
URL: https://api.external-crm.com/sync
Method: PUT
Headers: {"Authorization": "Bearer token", "Content-Type": "application/json"}
Body: {"deal_id": {{Document:ID}}, "status": "{{Document:STAGE_ID}}"}
```

## Development

### Project Structure

```
bitrix-http-robot/
├── server.js              # Main Express server
├── handlers/
│   ├── executeHandler.js  # Robot execution handler
│   └── installHandler.js  # Installation hooks
├── services/
│   ├── httpRequest.js     # HTTP request logic
│   └── bitrixApi.js       # Bitrix24 API client
├── utils/
│   ├── validation.js      # Input validation
│   └── logger.js          # Logging utility
├── install.js             # Installation script
├── package.json
├── .env.example
└── README.md
```

### Running Tests

Create test workflows in Bitrix24 to test different scenarios:

1. **Test GET request**: Use jsonplaceholder.typicode.com
2. **Test POST request**: Create data on test API
3. **Test error handling**: Use invalid URL
4. **Test timeout**: Use slow endpoint
5. **Test headers**: Use API requiring authentication

### Debugging

Check logs for detailed information:

```bash
# View server logs
tail -f /path/to/logs/server.log

# Or use console output in development mode
NODE_ENV=development npm run dev
```

## Security Considerations

### Input Validation

- URL format is validated
- HTTP methods are restricted to GET, POST, PUT, DELETE
- Headers must be valid JSON
- Timeout is limited to 5 minutes maximum

### Optional Security Enhancements

Add to `utils/validation.js` for stricter security:

```javascript
// Block internal IPs
function isInternalUrl(url) {
  const parsed = new URL(url);
  const hostname = parsed.hostname;

  // Block localhost, private IPs
  return hostname === 'localhost'
    || hostname.startsWith('127.')
    || hostname.startsWith('192.168.')
    || hostname.startsWith('10.')
    || hostname.startsWith('172.16.');
}

// Whitelist allowed domains
const ALLOWED_DOMAINS = [
  'api.example.com',
  'webhook.example.com'
];

function isDomainAllowed(url) {
  const parsed = new URL(url);
  return ALLOWED_DOMAINS.some(domain =>
    parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
  );
}
```

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});

app.use('/bitrix-handler/', limiter);
```

## Troubleshooting

### Robot not appearing in Bitrix24

- Check that installation script completed successfully
- Verify your access token has `bizproc` scope
- Try uninstalling and reinstalling

### Requests timing out

- Check that your server is publicly accessible
- Verify HTTPS is properly configured
- Check server logs for errors
- Increase timeout value

### Response values not available

- Ensure `USE_SUBSCRIPTION: 'Y'` is set in robot config
- Check that `bizproc.event.send` is being called
- Verify event_token is passed correctly

### Server errors

- Check server logs for detailed error messages
- Verify .env configuration
- Test server health endpoint: `https://your-domain.com/health`
- Check that all dependencies are installed

## API Reference

### POST /bitrix-handler/execute

Main handler endpoint called by Bitrix24.

**Request body:**
```json
{
  "event_token": "string",
  "properties": {
    "url": "string",
    "method": "string",
    "headers": "string (JSON)",
    "body": "string",
    "timeout": "integer"
  },
  "auth": {
    "domain": "string",
    "access_token": "string"
  },
  "document_id": "mixed",
  "document_type": "array"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request processed successfully"
}
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

ISC

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review server logs
3. Test with simple requests first
4. Verify configuration

## Changelog

### Version 1.0.0
- Initial release
- Support for GET, POST, PUT, DELETE methods
- Full response data (body, status, headers)
- Works in Automation Rules and Workflow Designer
- Comprehensive error handling
- Validation and logging
