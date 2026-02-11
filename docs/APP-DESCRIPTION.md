# App Description for Bitrix24 Marketplace

## English

### Short Description (150 chars)
Make HTTP requests to any external API directly from Bitrix24 automation rules and business processes. Extract and map response data to workflow variables.

### Full Description

**SYNITY HTTP Request** is a powerful automation rule (robot) and workflow activity that allows you to make HTTP requests to any external API directly from Bitrix24 automation rules and business processes.

#### Key Features

**Flexible HTTP Requests**
- Support for GET, POST, PUT, PATCH, DELETE methods
- Custom headers configuration
- Multiple body types: JSON form data, raw body, URL-encoded
- Configurable request timeout

**Authentication Options**
- Bearer Token
- Basic Authentication (username/password)
- API Key (header or query parameter)
- No authentication (public APIs)

**Response Data Extraction**
- Extract specific values from JSON responses using dot-notation paths
- Support for nested objects and arrays (e.g., `data.items[0].name`)
- Map up to 5 response values to workflow variables
- Fallback values for missing data

**Built-in Test Feature**
- Test your API requests before deploying to production
- Preview response data with syntax highlighting
- Test with sample data (no Bitrix24 variables needed)
- Verify JSON path extraction in real-time

**CRM Variable Support**
- Use any CRM field as request parameter (URL, headers, body)
- Built-in variable picker for easy field selection
- Variables are resolved at runtime with actual values

**Admin Dashboard**
- Monitor request statistics and success rates
- View detailed request logs with filters
- Track monthly usage against plan quota

#### Use Cases

- **CRM Integration**: Send deal/lead data to external CRM, ERP, or accounting systems
- **Notifications**: Trigger SMS, email, or messenger notifications via API
- **Data Enrichment**: Fetch additional data from external services and save to CRM fields
- **E-commerce**: Sync orders, update inventory, check payment status
- **Webhooks**: Send webhook notifications to any external system
- **AI/ML**: Call AI APIs (ChatGPT, Claude, etc.) to process CRM data

#### How to Use

1. Install the app from Bitrix24 Marketplace
2. Go to any CRM entity automation rules (Deals, Leads, etc.)
3. Add "[SYNITY] HTTP Request" robot
4. Configure URL, method, headers, and body
5. Use the Test button to verify your configuration
6. Set up output mappings to capture response data
7. Use extracted values in subsequent automation rules

#### Pricing

| Plan | Monthly Requests | Price |
|------|-----------------|-------|
| Free | 100 | $0/month |
| Basic | 1,000 | $5/month |
| Pro | 10,000 | $15/month |
| Enterprise | Unlimited | $29/month |

---

## Tieng Viet

### Mo ta ngan (150 ky tu)
Gui yeu cau HTTP den bat ky API ben ngoai tu quy tac tu dong hoa va quy trinh kinh doanh Bitrix24. Trich xuat va anh xa du lieu phan hoi vao bien quy trinh.

### Mo ta day du

**SYNITY HTTP Request** la mot quy tac tu dong hoa (robot) va hoat dong quy trinh manh me cho phep ban gui yeu cau HTTP den bat ky API ben ngoai truc tiep tu quy tac tu dong hoa va quy trinh kinh doanh Bitrix24.

#### Tinh nang chinh

**Yeu cau HTTP linh hoat**
- Ho tro cac phuong thuc GET, POST, PUT, PATCH, DELETE
- Cau hinh header tuy chinh
- Nhieu loai body: JSON form data, raw body, URL-encoded
- Timeout yeu cau co the cau hinh

**Tuy chon xac thuc**
- Bearer Token
- Basic Authentication (ten dang nhap/mat khau)
- API Key (header hoac query parameter)
- Khong xac thuc (API cong khai)

**Trich xuat du lieu phan hoi**
- Trich xuat gia tri cu the tu phan hoi JSON bang duong dan ky phap dau cham
- Ho tro doi tuong long nhau va mang (vi du: `data.items[0].name`)
- Anh xa den 5 gia tri phan hoi vao bien quy trinh
- Gia tri mac dinh cho du lieu thieu

**Tinh nang test tich hop**
- Kiem tra yeu cau API truoc khi trien khai
- Xem truoc du lieu phan hoi voi highlight cu phap
- Test voi du lieu mau (khong can bien Bitrix24)
- Xac minh trich xuat duong dan JSON theo thoi gian thuc

**Ho tro bien CRM**
- Su dung bat ky truong CRM nao lam tham so yeu cau (URL, headers, body)
- Cong cu chon bien tich hop de chon truong de dang
- Bien duoc phan giai tai thoi diem chay voi gia tri thuc te

**Bang dieu khien quan tri**
- Theo doi thong ke yeu cau va ty le thanh cong
- Xem nhat ky yeu cau chi tiet voi bo loc
- Theo doi su dung hang thang theo han muc goi

#### Truong hop su dung

- **Tich hop CRM**: Gui du lieu deal/lead den he thong CRM, ERP hoac ke toan ben ngoai
- **Thong bao**: Kich hoat thong bao SMS, email hoac messenger qua API
- **Lam giau du lieu**: Lay du lieu bo sung tu dich vu ben ngoai va luu vao truong CRM
- **Thuong mai dien tu**: Dong bo don hang, cap nhat ton kho, kiem tra trang thai thanh toan
- **Webhooks**: Gui thong bao webhook den bat ky he thong ben ngoai nao
- **AI/ML**: Goi API AI (ChatGPT, Claude, v.v.) de xu ly du lieu CRM

#### Cach su dung

1. Cai dat ung dung tu Bitrix24 Marketplace
2. Vao quy tac tu dong hoa cua bat ky thuc the CRM nao (Deals, Leads, v.v.)
3. Them robot "[SYNITY] HTTP Request"
4. Cau hinh URL, phuong thuc, headers va body
5. Su dung nut Test de xac minh cau hinh
6. Thiet lap output mappings de bat du lieu phan hoi
7. Su dung gia tri da trich xuat trong cac quy tac tu dong hoa tiep theo

#### Bang gia

| Goi | Yeu cau hang thang | Gia |
|-----|-------------------|-----|
| Mien phi | 100 | 0 dong/thang |
| Co ban | 1.000 | $5/thang |
| Chuyen nghiep | 10.000 | $15/thang |
| Doanh nghiep | Khong gioi han | $29/thang |
