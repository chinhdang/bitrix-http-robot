# Usage Examples

This document provides real-world examples of using the HTTP Request Robot in Bitrix24.

## Table of Contents

1. [Basic Examples](#basic-examples)
2. [API Integration Examples](#api-integration-examples)
3. [Webhook Examples](#webhook-examples)
4. [Advanced Use Cases](#advanced-use-cases)
5. [Error Handling Examples](#error-handling-examples)

## Basic Examples

### Example 1: Simple GET Request

**Scenario**: Fetch user data from external API

**Configuration**:
```
URL: https://jsonplaceholder.typicode.com/users/1
Method: GET
Headers: (empty)
Body: (empty)
Timeout: 30000
```

**Result Variables**:
```
{{Variable:http_request_robot_1_responseBody}} = {"id": 1, "name": "Leanne Graham", ...}
{{Variable:http_request_robot_1_statusCode}} = 200
```

**Use Case**: Validate customer data against external database.

---

### Example 2: POST Request with JSON

**Scenario**: Create a new record in external system

**Configuration**:
```
URL: https://api.example.com/customers
Method: POST
Headers: {"Content-Type": "application/json", "Authorization": "Bearer YOUR_TOKEN"}
Body: {"name": "{{Document:TITLE}}", "email": "{{Document:EMAIL}}", "phone": "{{Document:PHONE}}"}
Timeout: 30000
```

**Result Variables**:
```
{{Variable:http_request_robot_1_responseBody}} = {"id": 123, "status": "created"}
{{Variable:http_request_robot_1_statusCode}} = 201
```

**Use Case**: Sync new deals to external CRM system.

---

### Example 3: PUT Request to Update Data

**Scenario**: Update customer status in external system

**Configuration**:
```
URL: https://api.example.com/customers/{{Document:UF_CUSTOMER_ID}}
Method: PUT
Headers: {"Content-Type": "application/json", "Authorization": "Bearer YOUR_TOKEN"}
Body: {"status": "{{Document:STAGE_ID}}", "updated_at": "{{GlobalVar:Datetime}}"}
Timeout: 30000
```

**Use Case**: Keep external systems in sync when deal stage changes.

---

### Example 4: DELETE Request

**Scenario**: Remove record from external system

**Configuration**:
```
URL: https://api.example.com/temp-records/{{Document:UF_TEMP_ID}}
Method: DELETE
Headers: {"Authorization": "Bearer YOUR_TOKEN"}
Body: (empty)
Timeout: 30000
```

**Use Case**: Clean up temporary data in external systems.

## API Integration Examples

### Example 5: Slack Notification

**Scenario**: Send notification to Slack channel when deal is won

**Configuration**:
```
URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
Method: POST
Headers: {"Content-Type": "application/json"}
Body: {
  "text": "🎉 New deal won!",
  "attachments": [{
    "color": "good",
    "fields": [
      {"title": "Deal", "value": "{{Document:TITLE}}", "short": true},
      {"title": "Amount", "value": "{{Document:OPPORTUNITY}}", "short": true},
      {"title": "Client", "value": "{{Document:COMPANY_TITLE}}", "short": true}
    ]
  }]
}
Timeout: 15000
```

**Workflow Logic**:
1. Deal stage changes to "Won"
2. HTTP Request robot sends Slack notification
3. Team gets instant notification

---

### Example 6: Send SMS via Twilio

**Scenario**: Send SMS notification to client

**Configuration**:
```
URL: https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json
Method: POST
Headers: {
  "Content-Type": "application/x-www-form-urlencoded",
  "Authorization": "Basic YOUR_BASE64_ENCODED_CREDENTIALS"
}
Body: From=+1234567890&To={{Document:PHONE}}&Body=Hello {{Document:CONTACT_NAME}}, your order is ready!
Timeout: 20000
```

**Use Case**: Automated client notifications.

---

### Example 7: Google Sheets Integration

**Scenario**: Add row to Google Sheets

**Configuration**:
```
URL: https://sheets.googleapis.com/v4/spreadsheets/SPREADSHEET_ID/values/Sheet1!A:D:append?valueInputOption=RAW
Method: POST
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_GOOGLE_TOKEN"
}
Body: {
  "values": [[
    "{{Document:TITLE}}",
    "{{Document:OPPORTUNITY}}",
    "{{Document:STAGE_ID}}",
    "{{GlobalVar:Datetime}}"
  ]]
}
Timeout: 30000
```

**Use Case**: Export deals to Google Sheets for reporting.

---

### Example 8: Stripe Payment

**Scenario**: Create payment intent in Stripe

**Configuration**:
```
URL: https://api.stripe.com/v1/payment_intents
Method: POST
Headers: {
  "Content-Type": "application/x-www-form-urlencoded",
  "Authorization": "Bearer YOUR_STRIPE_SECRET_KEY"
}
Body: amount={{Document:OPPORTUNITY_CENTS}}&currency=usd&customer={{Document:UF_STRIPE_CUSTOMER_ID}}
Timeout: 30000
```

**Next Step**: Use `{{Variable:http_request_robot_1_responseBody}}` to extract payment URL and send to customer.

---

### Example 9: SendGrid Email

**Scenario**: Send custom email via SendGrid

**Configuration**:
```
URL: https://api.sendgrid.com/v3/mail/send
Method: POST
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_SENDGRID_API_KEY"
}
Body: {
  "personalizations": [{
    "to": [{"email": "{{Document:EMAIL}}"}],
    "subject": "Thank you for your order!"
  }],
  "from": {"email": "noreply@yourcompany.com"},
  "content": [{
    "type": "text/plain",
    "value": "Dear {{Document:CONTACT_NAME}}, thank you for order {{Document:TITLE}}!"
  }]
}
Timeout: 30000
```

**Use Case**: Custom transactional emails.

## Webhook Examples

### Example 10: Trigger External Webhook

**Scenario**: Notify external system of deal creation

**Configuration**:
```
URL: https://your-system.com/webhooks/deal-created
Method: POST
Headers: {
  "Content-Type": "application/json",
  "X-Webhook-Secret": "YOUR_SECRET_KEY"
}
Body: {
  "event": "deal.created",
  "deal_id": "{{Document:ID}}",
  "title": "{{Document:TITLE}}",
  "amount": "{{Document:OPPORTUNITY}}",
  "client": "{{Document:COMPANY_TITLE}}",
  "timestamp": "{{GlobalVar:Datetime}}"
}
Timeout: 30000
```

---

### Example 11: Zapier Webhook

**Scenario**: Trigger Zapier automation

**Configuration**:
```
URL: https://hooks.zapier.com/hooks/catch/YOUR_HOOK_ID/
Method: POST
Headers: {"Content-Type": "application/json"}
Body: {
  "deal_name": "{{Document:TITLE}}",
  "amount": "{{Document:OPPORTUNITY}}",
  "stage": "{{Document:STAGE_ID}}"
}
Timeout: 30000
```

**Use Case**: Connect Bitrix24 to thousands of apps via Zapier.

## Advanced Use Cases

### Example 12: Conditional API Call Based on Response

**Workflow Structure**:
1. HTTP Request Robot → Check customer existence
2. Condition → Check status code
3. Branch A (200): Update existing customer
4. Branch B (404): Create new customer

**Robot 1 Configuration**:
```
URL: https://api.example.com/customers/search?email={{Document:EMAIL}}
Method: GET
Headers: {"Authorization": "Bearer YOUR_TOKEN"}
```

**Condition**:
```
IF {{Variable:http_request_robot_1_statusCode}} == 200
  THEN → Update Customer (Robot 2)
  ELSE → Create Customer (Robot 3)
```

---

### Example 13: Parse JSON Response and Use Values

**Workflow Structure**:
1. HTTP Request Robot → Get exchange rates
2. Extract values from JSON response
3. Calculate amount in different currency
4. Update deal field

**Robot Configuration**:
```
URL: https://api.exchangerate-api.com/v4/latest/USD
Method: GET
```

**Response Example**:
```json
{
  "rates": {
    "EUR": 0.85,
    "GBP": 0.73
  }
}
```

**Next Step**: Use JavaScript activity to parse response:
```javascript
const response = JSON.parse('{{Variable:http_request_robot_1_responseBody}}');
const eurRate = response.rates.EUR;
const amountInEur = {{Document:OPPORTUNITY}} * eurRate;
// Store in variable or field
```

---

### Example 14: Retry Logic with Conditions

**Workflow Structure**:
1. HTTP Request Robot → API call
2. Condition → Check if successful
3. If failed (status 5xx) → Wait 5 seconds
4. Loop back to step 1 (max 3 times)
5. If still failed → Notify admin

**Condition**:
```
IF {{Variable:http_request_robot_1_statusCode}} >= 500
  AND {{Variable:retry_count}} < 3
  THEN → Wait → Retry
  ELSE IF {{Variable:retry_count}} >= 3
  THEN → Send Error Notification
  ELSE → Continue workflow
```

---

### Example 15: Chain Multiple API Calls

**Scenario**: Get customer ID, then fetch customer details, then update

**Workflow Structure**:
1. Robot 1: Search customer by email
2. Robot 2: Get full customer details using ID from Robot 1
3. Robot 3: Update customer with new data
4. Robot 4: Send confirmation webhook

**Robot 1**:
```
URL: https://api.example.com/customers?email={{Document:EMAIL}}
Method: GET
Result: {{Variable:robot_1_responseBody}} = {"id": 123, ...}
```

**Robot 2** (uses result from Robot 1):
```
URL: https://api.example.com/customers/123
Method: GET
Headers: {"Authorization": "Bearer TOKEN"}
```

Use JavaScript activity to extract ID:
```javascript
const searchResult = JSON.parse('{{Variable:robot_1_responseBody}}');
const customerId = searchResult.id;
```

---

### Example 16: File Upload via API

**Scenario**: Upload document to external storage

**Configuration**:
```
URL: https://api.example.com/upload
Method: POST
Headers: {
  "Content-Type": "multipart/form-data",
  "Authorization": "Bearer YOUR_TOKEN"
}
Body: {
  "file": "{{Document:FILE_URL}}",
  "filename": "{{Document:TITLE}}.pdf",
  "metadata": {
    "deal_id": "{{Document:ID}}",
    "uploaded_by": "{{User:ID}}"
  }
}
Timeout: 60000
```

**Note**: You may need to first download file from Bitrix24, encode it, then upload.

## Error Handling Examples

### Example 17: Check for Errors

**Workflow Structure**:
1. HTTP Request Robot
2. Condition: Check error field
3. If error exists → Send notification to admin
4. Else → Continue normal flow

**Condition**:
```
IF {{Variable:http_request_robot_1_error}} != ""
  THEN → Send Error Notification
  ELSE → Continue
```

---

### Example 18: Handle Different Status Codes

**Workflow Structure**:
1. HTTP Request Robot
2. Switch based on status code:
   - 200-299: Success path
   - 400-499: Client error path (notify user)
   - 500-599: Server error path (retry or notify admin)

**Conditions**:
```
IF {{Variable:http_request_robot_1_statusCode}} >= 200
   AND {{Variable:http_request_robot_1_statusCode}} < 300
  THEN → Success actions

ELSE IF {{Variable:http_request_robot_1_statusCode}} >= 400
   AND {{Variable:http_request_robot_1_statusCode}} < 500
  THEN → Client error handling

ELSE IF {{Variable:http_request_robot_1_statusCode}} >= 500
  THEN → Server error handling
```

---

### Example 19: Validate Response Structure

**JavaScript Activity** (after HTTP Request):
```javascript
try {
  const response = JSON.parse('{{Variable:http_request_robot_1_responseBody}}');

  // Validate required fields exist
  if (!response.id || !response.status) {
    throw new Error('Invalid response structure');
  }

  // Extract and store values
  const customerId = response.id;
  const status = response.status;

  // Set workflow variables
  SetVariable('customer_id', customerId);
  SetVariable('customer_status', status);
  SetVariable('is_valid', 'true');

} catch (error) {
  SetVariable('is_valid', 'false');
  SetVariable('error_message', error.message);
}
```

---

### Example 20: Timeout Handling

**Scenario**: Handle slow API responses

**Configuration**:
```
URL: https://slow-api.example.com/process
Method: POST
Headers: {"Content-Type": "application/json"}
Body: {"data": "..."}
Timeout: 10000  # 10 seconds
```

**Error Handling**:
```
IF {{Variable:http_request_robot_1_error}} CONTAINS "timeout"
  THEN → Notify: "API timeout - will retry in background"
  ELSE IF {{Variable:http_request_robot_1_statusCode}} == 200
  THEN → Continue normal flow
```

## Tips and Best Practices

### 1. Variable Naming
Use clear variable names in your workflow:
```
{{Variable:stripe_payment_response}}
{{Variable:customer_lookup_status}}
{{Variable:shipping_webhook_result}}
```

### 2. Logging
Add logging activities to track workflow execution:
```
Log: "Calling customer API for email: {{Document:EMAIL}}"
HTTP Request Robot
Log: "API returned status: {{Variable:http_request_robot_1_statusCode}}"
```

### 3. Security
- Never hardcode API keys in workflows (use Bitrix24 settings or external key management)
- Use HTTPS only
- Validate and sanitize inputs before sending

### 4. Error Messages
Provide helpful error messages:
```
IF {{Variable:http_request_robot_1_error}} != ""
  THEN → Send notification:
    "Failed to sync customer {{Document:TITLE}} to external system.
     Error: {{Variable:http_request_robot_1_error}}
     Please contact administrator."
```

### 5. Testing
Test workflows with:
- Valid requests
- Invalid URLs
- Network timeouts
- Different status codes
- Malformed JSON

Use test APIs:
- https://jsonplaceholder.typicode.com (REST API testing)
- https://httpbin.org (HTTP testing)
- https://webhook.site (Webhook testing)

## Conclusion

These examples demonstrate the versatility of the HTTP Request Robot. You can integrate Bitrix24 with virtually any external service that provides an HTTP API.

For more complex integrations, consider:
- Breaking down into smaller steps
- Adding proper error handling
- Implementing retry logic
- Logging all API interactions
- Testing thoroughly before production use
