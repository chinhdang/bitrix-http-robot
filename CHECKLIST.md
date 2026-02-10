# Setup and Deployment Checklist

Use this checklist to ensure proper setup and deployment of your Bitrix24 HTTP Request Robot.

## Pre-Installation Checklist

### System Requirements
- [ ] Node.js 14 or higher installed
- [ ] npm or yarn package manager available
- [ ] Git installed (optional, for version control)
- [ ] Terminal/command line access

### Bitrix24 Requirements
- [ ] Active Bitrix24 account (any plan)
- [ ] Admin access to Bitrix24 portal
- [ ] Access to Developer resources section

### Hosting Requirements
- [ ] Public HTTPS domain available OR
- [ ] ngrok installed for local testing

---

## Installation Checklist

### 1. Project Setup
- [ ] Clone or download project files
- [ ] Navigate to project directory: `cd bitrix-http-robot`
- [ ] Install dependencies: `npm install`
- [ ] Verify installation: Check `node_modules` folder created

### 2. Bitrix24 Configuration
- [ ] Log in to Bitrix24 portal
- [ ] Go to Developer resources → Other → Inbound webhook
- [ ] Click "Add webhook"
- [ ] Select `bizproc` permission (minimum required)
- [ ] Copy webhook URL
- [ ] Extract access token from URL (last part after final `/`)
- [ ] Note your Bitrix24 domain (e.g., `company.bitrix24.com`)

### 3. Environment Configuration
- [ ] Copy `.env.example` to `.env`: `cp .env.example .env`
- [ ] Open `.env` in text editor
- [ ] Fill in `BITRIX24_DOMAIN` (your portal domain)
- [ ] Fill in `BITRIX24_ACCESS_TOKEN` (from webhook)
- [ ] Fill in `HANDLER_URL` (your public HTTPS URL)
- [ ] Set `PORT` (default: 3000)
- [ ] Save `.env` file
- [ ] Verify no extra spaces or quotes around values

### 4. Server Deployment

#### Option A: Local Testing with ngrok
- [ ] Start server: `npm run dev`
- [ ] Open new terminal window
- [ ] Install ngrok: `npm install -g ngrok`
- [ ] Start ngrok: `ngrok http 3000`
- [ ] Copy HTTPS URL from ngrok output
- [ ] Update `HANDLER_URL` in `.env` with ngrok URL
- [ ] Restart server

#### Option B: Production Deployment
- [ ] Choose hosting platform (see DEPLOYMENT.md)
- [ ] Deploy application to hosting
- [ ] Configure environment variables on hosting platform
- [ ] Verify HTTPS is enabled
- [ ] Note public URL
- [ ] Update `HANDLER_URL` in `.env`

### 5. Verify Server
- [ ] Server started without errors
- [ ] Access health endpoint: `curl https://your-domain.com/health`
- [ ] Response shows `"status": "healthy"`
- [ ] No error messages in server logs

### 6. Install to Bitrix24
- [ ] Run installation: `npm run install-robot`
- [ ] Wait for completion
- [ ] Verify message: "✅ Robot installed successfully!"
- [ ] Verify message: "✅ Activity installed successfully!"
- [ ] Check for any error messages

---

## Testing Checklist

### Server Tests
- [ ] Run automated tests: `npm test`
- [ ] All tests pass (6/6)
- [ ] No error messages

### Bitrix24 Integration Tests

#### Test 1: Automation Rules
- [ ] Go to CRM → Deals
- [ ] Click "Automation Rules" tab
- [ ] Click "Add robot"
- [ ] Find "HTTP Request" in robot list
- [ ] Robot appears and can be selected
- [ ] Configure test request:
  - URL: `https://jsonplaceholder.typicode.com/posts/1`
  - Method: `GET`
- [ ] Save robot
- [ ] Create test deal to trigger automation
- [ ] Check automation log
- [ ] Response received successfully
- [ ] Status code = 200
- [ ] Response body contains data

#### Test 2: Workflow Designer
- [ ] Go to Settings → Workflow → Workflow Templates
- [ ] Create new workflow
- [ ] Add "HTTP Request" activity
- [ ] Activity appears in activity list
- [ ] Configure same test request as above
- [ ] Add notification activity to display response
- [ ] Save workflow
- [ ] Run workflow manually
- [ ] Check workflow log
- [ ] HTTP Request completed successfully
- [ ] Response variables accessible
- [ ] Notification shows correct data

#### Test 3: POST Request
- [ ] Create new automation/workflow
- [ ] Add HTTP Request robot/activity
- [ ] Configure POST request:
  - URL: `https://jsonplaceholder.typicode.com/posts`
  - Method: `POST`
  - Headers: `{"Content-Type": "application/json"}`
  - Body: `{"title": "test", "body": "test", "userId": 1}`
- [ ] Run and verify
- [ ] Status code = 201
- [ ] Response contains created object

#### Test 4: Error Handling
- [ ] Create test with invalid URL: `http://invalid-url-that-does-not-exist`
- [ ] Run automation/workflow
- [ ] Error field is populated
- [ ] Status code = 0
- [ ] Workflow handles error gracefully

#### Test 5: Custom Headers
- [ ] Create test with custom headers
- [ ] Use API that requires authentication (or httpbin.org/headers)
- [ ] Verify headers are sent correctly
- [ ] Response shows headers were received

---

## Production Readiness Checklist

### Security
- [ ] HTTPS enabled and working
- [ ] SSL certificate valid
- [ ] Access tokens stored securely (not in code)
- [ ] `.env` file in `.gitignore`
- [ ] No sensitive data in logs
- [ ] Input validation working
- [ ] Timeout limits configured

### Performance
- [ ] Server responds quickly (< 2 seconds for most requests)
- [ ] No memory leaks
- [ ] Error handling working correctly
- [ ] Logging configured properly

### Monitoring
- [ ] Health check endpoint accessible
- [ ] Logs are being generated
- [ ] Error logging working
- [ ] Can monitor server status

### Backup & Recovery
- [ ] Environment configuration documented
- [ ] Code in version control (Git)
- [ ] Deployment process documented
- [ ] Rollback plan ready

### Documentation
- [ ] README.md reviewed
- [ ] Team knows how to use robot
- [ ] Examples documented
- [ ] Troubleshooting guide available

---

## Post-Deployment Checklist

### Day 1
- [ ] Monitor server logs for errors
- [ ] Check health endpoint regularly
- [ ] Test with real workflows
- [ ] Verify response times acceptable

### Week 1
- [ ] Review all automation logs
- [ ] Check for any error patterns
- [ ] Verify all use cases working
- [ ] Get user feedback

### Month 1
- [ ] Review performance metrics
- [ ] Check server resource usage
- [ ] Update documentation if needed
- [ ] Plan any necessary improvements

---

## Troubleshooting Checklist

### Server Issues
- [ ] Check server is running: `curl https://your-domain.com/health`
- [ ] Review server logs for errors
- [ ] Verify environment variables set correctly
- [ ] Check port is not blocked by firewall
- [ ] Verify SSL certificate is valid
- [ ] Test with curl or Postman directly

### Robot Not Appearing
- [ ] Verify installation completed successfully
- [ ] Check access token has `bizproc` permission
- [ ] Try uninstalling and reinstalling
- [ ] Clear Bitrix24 cache
- [ ] Check Bitrix24 error logs

### Requests Failing
- [ ] Verify target URL is accessible
- [ ] Check request method is correct
- [ ] Verify headers are valid JSON
- [ ] Check body format is correct
- [ ] Verify timeout is sufficient
- [ ] Review error message in workflow log

### Variables Not Available
- [ ] Verify `USE_SUBSCRIPTION: 'Y'` in install.js
- [ ] Check `bizproc.event.send` is being called
- [ ] Review server logs for `bizproc.event.send` calls
- [ ] Verify event_token is correct
- [ ] Check auth object has domain and token

---

## Maintenance Checklist

### Weekly
- [ ] Check server health
- [ ] Review error logs
- [ ] Monitor resource usage

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Review and rotate access tokens if needed
- [ ] Check for Node.js updates
- [ ] Review and optimize performance

### Quarterly
- [ ] Full security audit
- [ ] Review and update documentation
- [ ] Test disaster recovery plan
- [ ] Evaluate new features

---

## Upgrade Checklist

### Before Upgrade
- [ ] Backup current configuration
- [ ] Document current version
- [ ] Test in staging environment
- [ ] Plan rollback procedure
- [ ] Schedule maintenance window

### During Upgrade
- [ ] Stop current server
- [ ] Backup `.env` file
- [ ] Update code/dependencies
- [ ] Restore `.env` file
- [ ] Test server starts correctly
- [ ] Verify health endpoint

### After Upgrade
- [ ] Test all functionality
- [ ] Monitor for errors
- [ ] Verify workflows still work
- [ ] Check performance
- [ ] Update documentation

---

## Success Criteria

### Installation Success
✅ Server running without errors
✅ Health endpoint returns 200
✅ Robot appears in Bitrix24
✅ Activity appears in Workflow Designer
✅ Test requests work correctly
✅ Response variables accessible

### Production Success
✅ Uptime > 99%
✅ Average response time < 2 seconds
✅ Zero critical errors
✅ Users can use robot without assistance
✅ All integrations working
✅ Team satisfied with functionality

---

## Quick Reference

### Important Commands
```bash
# Install dependencies
npm install

# Start production server
npm start

# Start development server
npm run dev

# Install robot to Bitrix24
npm run install-robot

# Run tests
npm test

# Check server health
curl https://your-domain.com/health
```

### Important URLs
- Server root: `https://your-domain.com/`
- Health check: `https://your-domain.com/health`
- Execute handler: `https://your-domain.com/bitrix-handler/execute`
- Bitrix24 webhook: `https://your-domain.bitrix24.com/rest/1/YOUR_TOKEN/`

### Important Files
- Configuration: `.env`
- Main server: `server.js`
- Installation: `install.js`
- Testing: `test-server.js`
- Main docs: `README.md`

---

## Support Resources

- 📘 Quick Start: `QUICKSTART.md`
- 📘 Full Documentation: `README.md`
- 📘 Deployment Guide: `DEPLOYMENT.md`
- 📘 Usage Examples: `EXAMPLES.md`
- 📘 Project Structure: `PROJECT_STRUCTURE.md`
- 📘 Implementation Summary: `IMPLEMENTATION_SUMMARY.md`

---

**Print this checklist and check off items as you complete them!**

Good luck with your Bitrix24 HTTP Request Robot deployment! 🚀
