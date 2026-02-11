# Terms of Service — SYNITY HTTP Request

**Last Updated**: February 2026
**Company**: SYNITY
**App**: SYNITY HTTP Request for Bitrix24

---

## 1. Acceptance of Terms

By installing and using the SYNITY HTTP Request application ("the App") on the Bitrix24 platform, you agree to be bound by these Terms of Service ("Terms"). If you do not agree, please do not install or use the App.

## 2. Description of Service

The App provides an automation rule (robot) and workflow activity for Bitrix24 that allows users to make HTTP requests to external APIs from within Bitrix24 automation rules and business processes. Features include:
- Configurable HTTP requests (GET, POST, PUT, PATCH, DELETE)
- Multiple authentication methods
- JSON response data extraction
- Built-in request testing
- Usage monitoring via admin dashboard

## 3. Eligibility

To use the App, you must:
- Have an active Bitrix24 account
- Have administrator permissions to install applications on your Bitrix24 portal
- Comply with Bitrix24's Terms of Service

## 4. Usage Plans and Quotas

### 4.1 Free Plan
- 100 HTTP requests per month
- No payment required

### 4.2 Paid Plans
- **Basic**: 1,000 requests/month — $5/month
- **Pro**: 10,000 requests/month — $15/month
- **Enterprise**: Unlimited requests — $29/month

### 4.3 Quota Enforcement
- Requests exceeding your plan's monthly quota will be blocked
- The automation rule will return a clear error message when quota is exceeded
- Quota resets on the 1st of each calendar month (UTC)

### 4.4 Pricing Changes
We reserve the right to modify pricing with 30 days advance notice. Changes do not affect the current billing period.

## 5. Acceptable Use

You agree NOT to use the App to:
- Send requests to endpoints you are not authorized to access
- Conduct denial-of-service attacks against external services
- Transmit malware, viruses, or malicious payloads
- Violate any applicable laws, regulations, or third-party rights
- Circumvent or attempt to circumvent usage quotas
- Scrape, harvest, or collect data in violation of target website terms

You are solely responsible for:
- The API endpoints you configure and the data you send
- Ensuring you have proper authorization for all external API calls
- Compliance with the terms of service of any third-party APIs you call

## 6. Availability and Support

### 6.1 Service Availability
We strive for high availability but do not guarantee 100% uptime. The App is provided on an "as-is" basis.

### 6.2 Fail-Open Design
The App is designed so that service outages (e.g., database unavailability) do not block your automation rules. If quota checking fails, requests are allowed through.

### 6.3 Support
- Email support: support@synity.io
- Response time: within 2 business days

## 7. Data and Privacy

Your use of the App is also governed by our [Privacy Policy](PRIVACY-POLICY.md). Key points:
- We only store request metadata (URL, method, status code, timing)
- We do not store request/response bodies or your CRM data
- All data is deleted when you uninstall the App

## 8. Intellectual Property

The App and all related code, design, and documentation are the property of SYNITY. You are granted a limited, non-exclusive, non-transferable license to use the App according to these Terms.

## 9. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW:
- SYNITY shall not be liable for any indirect, incidental, special, or consequential damages
- SYNITY shall not be liable for data loss, business interruption, or loss of profits arising from use of the App
- Our total liability shall not exceed the amount paid by you for the App in the 12 months preceding the claim
- SYNITY is not responsible for the behavior, availability, or responses of third-party APIs you call through the App

## 10. Indemnification

You agree to indemnify and hold SYNITY harmless from any claims, damages, or expenses arising from:
- Your use of the App
- Your violation of these Terms
- Your violation of any third-party rights
- The content of HTTP requests you send through the App

## 11. Termination

### 11.1 By You
You may stop using the App at any time by uninstalling it from your Bitrix24 portal.

### 11.2 By Us
We reserve the right to suspend or terminate your access to the App if you:
- Violate these Terms
- Engage in abusive usage patterns
- Fail to pay for a subscribed plan

### 11.3 Effect of Termination
Upon termination, all stored data (account info, tokens, request logs) will be permanently deleted.

## 12. Modifications

We may modify these Terms at any time. Material changes will be communicated via the App or email. Continued use after modification constitutes acceptance.

## 13. Governing Law

These Terms shall be governed by and construed in accordance with the laws of Vietnam, without regard to conflict of law provisions.

## 14. Contact

For questions about these Terms:
- **Email**: support@synity.io
- **Website**: https://synity.io
