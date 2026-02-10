# Bitrix24 Local Application Setup Guide

## ⚠️ QUAN TRỌNG

Custom robots **PHẢI** được đăng ký thông qua **Local Application**, KHÔNG thể dùng inbound webhook thông thường.

---

## Tại sao cần Local Application?

Methods `bizproc.robot.add` và `bizproc.activity.add` yêu cầu:
- ✅ Application context (quyền ứng dụng)
- ✅ OAuth authentication với scope `bizproc`
- ❌ KHÔNG hoạt động với inbound webhook

---

## Bước 1: Tạo Local Application

### 1.1 Truy cập Developer Resources

```
1. Đăng nhập Bitrix24 với quyền Administrator
2. Click vào avatar (góc phải) → Settings
3. Tìm "Developer resources" (hoặc "Tài nguyên nhà phát triển")
4. Section "Other" → Click "Local application"
5. Click button "Add" hoặc "Create"
```

**Đường dẫn URL:**
```
https://your-domain.bitrix24.com/devops/index.php
```

### 1.2 Điền thông tin Application

| Field | Value | Required |
|-------|-------|----------|
| **Application Name** | HTTP Request Robot | ✅ Yes |
| **Description** | Custom robot for making HTTP requests to external APIs from workflows | No |
| **URL của handler** | `https://bitrix-http-robot.up.railway.app/` | ✅ Yes |
| **Path to application folder** | (Leave empty for external server) | No |

### 1.3 Chọn Permissions (Scopes)

Chọn các quyền sau:

| Scope | Description | Required |
|-------|-------------|----------|
| ✅ **bizproc** | Business Processes | ✅ **BẮT BUỘC** |
| ✅ **user** | User Information | Recommended |
| ☐ crm | CRM | Optional |
| ☐ task | Tasks | Optional |

**Chỉ cần `bizproc` là đủ**, các scope khác tùy vào nhu cầu của bạn.

### 1.4 Save Application

Click **"Save"** hoặc **"Add"**

---

## Bước 2: Lấy Application Credentials

Sau khi tạo xong, bạn sẽ thấy:

### 2.1 Application Information

```
Application ID (Client ID): 123456789
Application Secret: abc123def456xyz
```

### 2.2 Access Token

Có 2 cách lấy access token:

#### **Cách 1: Qua Local Application URL** (Đơn giản nhất)

```
1. Trong danh sách Applications, click vào app vừa tạo
2. Bạn sẽ thấy URL có dạng:
   https://your-domain.bitrix24.com/rest/APP_ID/TOKEN/

3. TOKEN là access token của bạn
```

Ví dụ URL:
```
https://tamgiac.bitrix24.com/rest/local.123456789.abc123/defgh5678/
                                        ^^^^^^^^^  ^^^^^^^^^^^
                                        APP_ID     ACCESS_TOKEN
```

Access Token = `defgh5678`

#### **Cách 2: Qua OAuth Flow** (Cho production)

1. Tạo authorization URL:
```
https://your-domain.bitrix24.com/oauth/authorize/?client_id=APP_ID&response_type=code
```

2. User authorize → Nhận code
3. Exchange code for token:
```
POST https://oauth.bitrix.info/oauth/token/
  ?grant_type=authorization_code
  &client_id=APP_ID
  &client_secret=APP_SECRET
  &code=RECEIVED_CODE
```

4. Response:
```json
{
  "access_token": "your_access_token",
  "refresh_token": "your_refresh_token",
  "expires_in": 3600
}
```

---

## Bước 3: Cập nhật .env File

Update file `.env` với thông tin từ Local Application:

```env
# Server Configuration
PORT=3000

# Bitrix24 Configuration
BITRIX24_DOMAIN=tamgiac.bitrix24.com

# Access token từ Local Application (KHÔNG phải inbound webhook)
BITRIX24_ACCESS_TOKEN=defgh5678

# User ID (thường là 1 cho admin)
BITRIX24_USER_ID=1

# Public HTTPS URL
HANDLER_URL=https://bitrix-http-robot.up.railway.app
```

### Tìm User ID của bạn:

```
1. Vào Bitrix24 → Company → Company structure
2. Click vào tên của bạn
3. Trong URL sẽ có: /company/personal/user/1/
                                          ^
                                        User ID
```

Hoặc dùng REST API:
```
GET https://tamgiac.bitrix24.com/rest/1/YOUR_TOKEN/user.current
```

---

## Bước 4: Test Application

### 4.1 Test với REST API

```bash
# Test basic API call
curl "https://tamgiac.bitrix24.com/rest/1/YOUR_TOKEN/user.current"
```

Kết quả mong đợi:
```json
{
  "result": {
    "ID": "1",
    "NAME": "Your Name",
    "EMAIL": "your@email.com",
    ...
  }
}
```

### 4.2 Test bizproc scope

```bash
# Check if bizproc methods available
curl "https://tamgiac.bitrix24.com/rest/1/YOUR_TOKEN/bizproc.robot.list"
```

Nếu thấy response (dù là empty list) = OK!
```json
{
  "result": [],
  "time": {...}
}
```

---

## Bước 5: Install Robot

Bây giờ chạy installation script:

```bash
npm run install-robot
```

Kết quả mong đợi:
```
✅ Robot installed successfully!
✅ Activity installed successfully!
```

---

## Troubleshooting

### Lỗi: "ACCESS_DENIED - Application context required"

**Nguyên nhân:** Bạn đang dùng inbound webhook thay vì Local Application

**Giải pháp:**
1. Xóa inbound webhook cũ
2. Tạo Local Application như hướng dẫn trên
3. Dùng token từ Local Application

---

### Lỗi: "invalid_token"

**Nguyên nhân:** Token không đúng hoặc đã hết hạn

**Giải pháp:**
1. Kiểm tra lại token trong URL của Local Application
2. Nếu dùng OAuth, refresh token:
```bash
curl -X POST "https://oauth.bitrix.info/oauth/token/" \
  -d "grant_type=refresh_token" \
  -d "client_id=APP_ID" \
  -d "client_secret=APP_SECRET" \
  -d "refresh_token=REFRESH_TOKEN"
```

---

### Lỗi: "Scope 'bizproc' required"

**Nguyên nhân:** Application không có quyền bizproc

**Giải pháp:**
1. Vào Settings → Developer resources → Local applications
2. Edit application
3. Check ✅ bizproc scope
4. Save
5. Có thể cần reauthorize application

---

### Robot không xuất hiện trong Bitrix24

**Kiểm tra:**
```bash
# List installed robots
curl "https://tamgiac.bitrix24.com/rest/1/YOUR_TOKEN/bizproc.robot.list"
```

Nếu thấy `"http_request_robot"` trong list = Đã cài đặt thành công!

**Nếu không thấy:**
1. Check installation logs
2. Verify HANDLER URL accessible
3. Try uninstall và install lại

---

### Uninstall Robot (nếu cần)

```bash
curl -X POST "https://tamgiac.bitrix24.com/rest/1/YOUR_TOKEN/bizproc.robot.delete" \
  -d "CODE=http_request_robot"
```

---

## Lưu ý quan trọng

### Security

- ✅ Giữ Application Secret **TUYỆT ĐỐI** bảo mật
- ✅ KHÔNG commit token vào Git
- ✅ Rotate token định kỳ
- ✅ Dùng HTTPS cho HANDLER URL

### Token Expiration

- Access token từ Local Application URL: **Không hết hạn** (trừ khi xóa app)
- Access token từ OAuth flow: **Hết hạn sau 1 giờ** → Cần refresh

### Handler URL

- ✅ PHẢI là HTTPS (Bitrix24 yêu cầu)
- ✅ PHẢI publicly accessible
- ✅ Response time < 30 giây (Bitrix24 timeout)

---

## Tóm tắt

1. ✅ Tạo Local Application trong Bitrix24
2. ✅ Chọn scope `bizproc`
3. ✅ Lấy Access Token từ Application URL
4. ✅ Update `.env` với token mới
5. ✅ Run `npm run install-robot`
6. ✅ Test trong Bitrix24 workflow

**Sau khi hoàn thành, robot sẽ xuất hiện trong:**
- Automation Rules (CRM)
- Workflow Designer (Settings → Workflow)

---

## Tham khảo

- [Bitrix24 Local Applications](https://apidocs.bitrix24.com/local-integrations/local-apps.html)
- [OAuth 2.0 Documentation](https://apidocs.bitrix24.com/api-reference/oauth/index.html)
- [bizproc.robot.add Method](https://apidocs.bitrix24.com/api-reference/bizproc/bizproc-robot/bizproc-robot-add.html)
- [REST API Overview](https://apidocs.bitrix24.com/getting-started/index.html)
