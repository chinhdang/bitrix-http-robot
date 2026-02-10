# Quick Start Guide

Get your Bitrix24 HTTP Request Robot up and running in 10 minutes!

## Prerequisites

- Node.js 14 or higher installed
- Bitrix24 account (any plan)
- A public HTTPS domain (or use ngrok for testing)

## Step 1: Clone and Install (2 minutes)

```bash
# Clone or download the project
cd bitrix-http-robot

# Install dependencies
npm install
```

## Step 2: Configure Environment (3 minutes)

### Get Bitrix24 Access Token

1. Go to your Bitrix24 portal
2. Click on your profile → Developer resources → Other → Inbound webhook
3. Click "Add webhook"
4. Select permissions (minimum: `bizproc`)
5. Copy the webhook URL - the token is the last part

Example webhook URL:
```
https://your-domain.bitrix24.com/rest/1/abc123def456/
                                          ^^^^^^^^^^^
                                          This is your token
```

### Create .env File

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

Fill in:
```env
PORT=3000
BITRIX24_DOMAIN=your-domain.bitrix24.com
BITRIX24_ACCESS_TOKEN=abc123def456  # Your webhook token
HANDLER_URL=https://your-public-domain.com
```

**For local testing with ngrok:**
```env
HANDLER_URL=https://abc123.ngrok.io
```

## Step 3: Start Server (1 minute)

### Option A: Production

```bash
npm start
```

### Option B: Development (with auto-reload)

```bash
npm run dev
```

### Option C: Testing with ngrok

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
ngrok http 3000
# Copy the HTTPS URL to your .env as HANDLER_URL
```

## Step 4: Verify Server (1 minute)

Open browser or use curl:

```bash
curl https://your-domain.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## Step 5: Install to Bitrix24 (2 minutes)

```bash
npm run install-robot
```

You should see:
```
✅ Robot installed successfully!
✅ Activity installed successfully!
```

## Step 6: Test in Bitrix24 (3 minutes)

### Quick Test - Automation Rules

1. Go to **CRM → Deals**
2. Click **Automation Rules** tab
3. Click **Add robot**
4. Find **HTTP Request** in the list
5. Configure:
   ```
   URL: https://jsonplaceholder.typicode.com/posts/1
   Method: GET
   ```
6. Save
7. Create a test deal to trigger the automation
8. Check the automation log to see the response

### Quick Test - Workflow Designer

1. Go to **Settings → Workflow → Workflow Templates**
2. Create new workflow
3. Add **HTTP Request** activity
4. Configure same as above
5. Add a notification activity to display result:
   ```
   Response: {{Variable:http_request_robot_1_responseBody}}
   Status: {{Variable:http_request_robot_1_statusCode}}
   ```
6. Save and run workflow

## Common Quick Start Issues

### Server won't start

**Problem**: Port already in use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Change port in .env
```env
PORT=3001
```

---

**Problem**: Dependencies not installed
```
Error: Cannot find module 'express'
```

**Solution**: Run npm install
```bash
npm install
```

### Can't connect from Bitrix24

**Problem**: Server not accessible from internet

**Solution**: Use ngrok for testing
```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Copy HTTPS URL to .env
HANDLER_URL=https://abc123.ngrok.io

# Reinstall robot
npm run install-robot
```

### Robot not appearing in Bitrix24

**Problem**: Installation failed

**Solution**: Check access token has correct permissions
1. Go to webhook settings in Bitrix24
2. Ensure `bizproc` permission is checked
3. Get new token if needed
4. Update .env
5. Reinstall: `npm run install-robot`

### Getting timeout errors

**Problem**: Response takes too long

**Solution**: Increase timeout in robot configuration
```
Timeout: 60000  # 60 seconds
```

## Next Steps

### 1. Try Real Integration

**Slack Notification Example:**

```
URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
Method: POST
Headers: {"Content-Type": "application/json"}
Body: {"text": "New deal: {{Document:TITLE}}"}
```

### 2. Add Error Handling

In your workflow, add condition after HTTP Request:
```
IF {{Variable:http_request_robot_1_error}} != ""
  THEN → Send notification: "API call failed"
  ELSE → Continue workflow
```

### 3. Deploy to Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment options.

Recommended for beginners:
- **Render** - Free tier available, easy deploy
- **Railway** - Simple, $5/month
- **Heroku** - Well documented, $7/month

### 4. Explore Examples

Check [EXAMPLES.md](EXAMPLES.md) for:
- API integrations (Stripe, SendGrid, Twilio)
- Webhook examples (Slack, Zapier)
- Advanced workflows

## Testing Checklist

- [ ] Server starts without errors
- [ ] Health endpoint returns 200
- [ ] Robot appears in Bitrix24 automation rules
- [ ] Activity appears in Workflow Designer
- [ ] Test GET request works
- [ ] Test POST request works
- [ ] Error handling works (try invalid URL)
- [ ] Response variables accessible in workflow

## Quick Reference

### Start/Stop Server

```bash
# Start
npm start

# Start with auto-reload (development)
npm run dev

# Stop (Ctrl+C in terminal)
```

### Reinstall Robot

```bash
npm run install-robot
```

### Check Logs

```bash
# If using PM2
pm2 logs bitrix-http-robot

# If using Docker
docker-compose logs -f

# Otherwise, check terminal output
```

### Test Server

```bash
node test-server.js
```

## Support

If you encounter issues:

1. **Check server logs** - Look for error messages
2. **Verify configuration** - Double-check .env values
3. **Test endpoints** - Use curl to test server directly
4. **Check Bitrix24 logs** - Go to workflow/automation logs
5. **Review documentation** - See README.md for detailed info

## Quick Links

- [Full Documentation](README.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Usage Examples](EXAMPLES.md)
- [Test Public APIs](https://jsonplaceholder.typicode.com)
- [Webhook Testing](https://webhook.site)

---

**Congratulations! 🎉**

Your HTTP Request Robot is now ready to use. Start integrating Bitrix24 with any external API!
