# Privacy Policy — SYNITY HTTP Request

**Last Updated**: February 2026
**Company**: SYNITY
**App**: SYNITY HTTP Request for Bitrix24

---

## 1. Introduction

This Privacy Policy describes how SYNITY ("we", "us", "our") collects, uses, and protects information when you use the SYNITY HTTP Request application ("the App") on the Bitrix24 platform.

## 2. Information We Collect

### 2.1 Account Information
When you install the App, we collect:
- **Bitrix24 Portal Identifier** (`member_id`) — a unique hash identifying your Bitrix24 account
- **Portal Domain** — your Bitrix24 portal URL (e.g., `yourcompany.bitrix24.com`)
- **OAuth Tokens** — access and refresh tokens provided by Bitrix24 for API authentication

### 2.2 Usage Data
When you use the App's automation rules, we log:
- **Request metadata**: URL, HTTP method, status code, execution time
- **Success/failure status** of each HTTP request
- **Error messages** when requests fail
- **Timestamp** of each request

### 2.3 What We Do NOT Collect
- We do **not** store the content of HTTP request bodies or responses
- We do **not** store HTTP headers or authentication credentials you configure
- We do **not** access or store your CRM data (deals, leads, contacts, etc.)
- We do **not** store personal information about your Bitrix24 users
- We do **not** track individual user actions within your portal

## 3. How We Use Information

We use the collected information exclusively to:
- **Operate the App**: Execute HTTP requests on your behalf as configured in automation rules
- **Enforce Usage Quotas**: Track monthly request counts against your plan limits
- **Provide Admin Dashboard**: Display request statistics and logs to portal administrators
- **Maintain and Improve**: Monitor service health, diagnose issues, and improve reliability

## 4. Data Storage and Security

### 4.1 Storage
- All data is stored in a PostgreSQL database hosted on Railway (cloud infrastructure)
- Data is encrypted in transit (TLS/HTTPS)
- Database access is restricted to the application server only

### 4.2 OAuth Token Security
- OAuth tokens are stored encrypted in the database
- Tokens are automatically refreshed before expiry
- Tokens are permanently deleted when you uninstall the App

### 4.3 Data Retention
- **Request logs**: Retained for 90 days, then automatically purged
- **Account data**: Retained while the App is installed, deleted on uninstall
- **OAuth tokens**: Deleted immediately on App uninstall

## 5. Data Sharing

We do **not** sell, rent, or share your data with any third parties.

Data is only transmitted to:
- **Your configured API endpoints**: As explicitly defined by you in the robot configuration
- **Bitrix24 API**: To register robots, send execution results, and verify authentication
- **Bitrix24 OAuth Server** (`oauth.bitrix.info`): To refresh authentication tokens

## 6. Your Rights

You have the right to:
- **Access**: View your usage data through the Admin Dashboard
- **Delete**: Uninstall the App to permanently delete all stored data
- **Restrict**: Control which automation rules use the App

## 7. Cookies

The App does not use cookies. Authentication is handled through Bitrix24's built-in OAuth mechanism.

## 8. Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be posted with an updated "Last Updated" date. Continued use of the App after changes constitutes acceptance.

## 9. Contact

For privacy-related inquiries:
- **Email**: support@synity.io
- **Website**: https://synity.io
