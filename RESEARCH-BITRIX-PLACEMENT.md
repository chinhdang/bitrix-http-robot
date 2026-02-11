# Deep Research: Bitrix24 Robot Placement - Cơ chế Save/Load dữ liệu

## Mục lục
1. [Tổng quan vấn đề](#1-tổng-quan-vấn-đề)
2. [Cơ chế lưu dữ liệu từ Custom UI vào Bitrix](#2-cơ-chế-lưu-dữ-liệu-từ-custom-ui-vào-bitrix)
3. [Cơ chế Bitrix lấy dữ liệu khi mở lại robot](#3-cơ-chế-bitrix-lấy-dữ-liệu-khi-mở-lại-robot)
4. [Official Code Example (Full)](#4-official-code-example-full)
5. [Phân tích code hiện tại và lỗi](#5-phân-tích-code-hiện-tại-và-lỗi)
6. [Đề xuất giải pháp](#6-đề-xuất-giải-pháp)
7. [Kết quả thực nghiệm](#7-kết-quả-thực-nghiệm)

---

## 1. Tổng quan vấn đề

Project `bitrix-http-robot` đang gặp vấn đề: **dữ liệu từ custom UI không được lưu/load đúng cách** khi người dùng cấu hình robot trong Bitrix24 Automation Rules.

Lịch sử git cho thấy đã thử nhiều cách:
- `saveSettings`, `finish`, `setPropertyValue`, `bindEvent('onSave')`, hidden form inputs
- Tất cả đều không giải quyết triệt để

---

## 2. Cơ chế lưu dữ liệu từ Custom UI vào Bitrix

### 2.1. Đăng ký Robot với Custom Placement

Khi đăng ký robot qua `bizproc.robot.add`, cần 2 tham số quan trọng:

```js
{
  USE_PLACEMENT: 'Y',           // Bật custom UI
  PLACEMENT_HANDLER: 'https://your-app.com/placement-handler',  // URL của custom UI
  PROPERTIES: {                 // Định nghĩa các property
    propertyId1: { Name: '...', Type: 'string' },
    propertyId2: { Name: '...', Type: 'text', Multiple: 'Y' }
  }
}
```

**Lưu ý quan trọng**: `PROPERTIES` định nghĩa các trường dữ liệu mà Bitrix sẽ lưu. Mỗi property có `Name`, `Type`, và có thể có `Multiple`, `Required`, `Default`.

### 2.2. Cách DUY NHẤT để lưu dữ liệu: `BX24.placement.call('setPropertyValue', ...)`

Theo tài liệu chính thức, **chỉ có MỘT cách** để lưu dữ liệu từ custom UI vào Bitrix:

```js
BX24.placement.call('setPropertyValue', {
    propertyId1: 'giá trị 1',
    propertyId2: ['giá trị a', 'giá trị b']   // cho Multiple: 'Y'
});
```

**Đặc điểm quan trọng:**
- Tham số là một **object** với key là **tên property** (phải khớp với PROPERTIES khi đăng ký robot)
- Value là string cho property đơn, array cho property Multiple
- **KHÔNG cần callback** - method này tức thời set giá trị
- **KHÔNG cần sự kiện onSave hay bindEvent** - gọi trực tiếp setPropertyValue bất cứ lúc nào
- Giá trị được **lưu ngay lập tức** vào robot configuration của Bitrix

### 2.3. Khi nào gọi setPropertyValue?

Theo official example, **gọi ngay khi user thay đổi giá trị** (onchange event):

```html
<input name="string" value="..."
       onchange="setPropertyValue('string', this.name, 0)">
```

```js
function setPropertyValue(name, inputName, multiple) {
    var form = new FormData(document.forms.props);
    var value = multiple ? form.getAll(inputName) : form.get(inputName);
    var params = {};
    params[name] = value;
    BX24.placement.call('setPropertyValue', params);
}
```

**Key insight**: Official code gọi `setPropertyValue` **mỗi lần user thay đổi input**, KHÔNG đợi đến khi bấm Save. Bitrix tự động lưu giá trị này vào robot config.

### 2.4. KHÔNG cần và KHÔNG có các method sau cho robot placement:
- ~~`BX24.placement.call('finish', ...)`~~ - Không tồn tại cho robot placement
- ~~`BX24.placement.call('saveSettings', ...)`~~ - Không tồn tại
- ~~`BX24.placement.bindEvent('onSave', ...)`~~ - Không được document cho robot
- ~~`app.option.set`~~ - Đây là lưu data cho APP, không phải cho robot properties

### 2.5. Commands và Events khả dụng cho Robot Placement

Gọi `BX24.placement.getInterface()` sẽ trả về danh sách commands/events khả dụng.
Cho robot placement, command chính (và có thể duy nhất) là `setPropertyValue`.

---

## 3. Cơ chế Bitrix lấy dữ liệu khi mở lại robot

### 3.1. Dữ liệu được truyền qua POST đến PLACEMENT_HANDLER

Khi user mở cấu hình robot, Bitrix gửi POST request đến `PLACEMENT_HANDLER` URL với dữ liệu:

```
POST /placement/robot-settings

Body (form-urlencoded):
- PLACEMENT: 'DEFAULT' hoặc tên placement
- PLACEMENT_OPTIONS: '{...}'   // JSON string
- DOMAIN: 'xxx.bitrix24.com'
- AUTH_ID: '...'
- REFRESH_ID: '...'
- member_id: '...'
- LANG: 'en'
```

### 3.2. Cấu trúc của PLACEMENT_OPTIONS

`PLACEMENT_OPTIONS` là JSON string chứa:

```json
{
  "code": "http_request_robot",      // Robot CODE
  "activity_name": "A12345_67890",   // ID của robot instance trong workflow
  "properties": {                     // Định nghĩa properties (schema)
    "url": { "NAME": "URL", "TYPE": "string", ... },
    "method": { "NAME": "HTTP Method", "TYPE": "select", ... },
    "config": { "NAME": "Configuration", "TYPE": "text", ... }
  },
  "current_values": {                 // *** GIÁ TRỊ ĐÃ LƯU ***
    "url": "https://api.example.com",
    "method": "POST",
    "config": "{\"url\":\"...\",\"headers\":[...]}"
  },
  "document_type": ["crm", "CCrmDocumentDeal", "DEAL"],
  "document_fields": {               // Các trường của document
    "ID": { "Name": "Deal ID", "Type": "int" },
    "TITLE": { "Name": "Deal Title", "Type": "string" },
    ...
  },
  "template": {                      // Template variables
    "parameters": { ... },
    "variables": { ... },
    "constants": { ... },
    "global_constants": [ ... ],
    "return_activities": { ... }      // Return values từ các robot trước
  }
}
```

### 3.3. Cách đọc dữ liệu đã lưu ĐÚNG

**Phía server (Node.js/PHP)**: Parse `PLACEMENT_OPTIONS` từ POST body:

```js
// Server-side (Node.js)
app.post('/placement/robot-settings', (req, res) => {
    const options = JSON.parse(req.body.PLACEMENT_OPTIONS);
    const currentValues = options.current_values;  // Giá trị đã lưu
    const properties = options.properties;          // Schema
    // Render HTML với currentValues
});
```

**Phía client (BX24 JS SDK)**: Gọi `BX24.placement.info()`:

```js
BX24.init(function() {
    var info = BX24.placement.info();
    // info.placement = 'DEFAULT'
    // info.options = { code, properties, current_values, ... }

    var currentValues = info.options.current_values;
    // currentValues.url = "https://..."
    // currentValues.config = "{...}"
});
```

### 3.4. QUAN TRỌNG: Hai cách đọc dữ liệu

| Cách | Nguồn | Khi nào dùng |
|------|-------|--------------|
| Server-side: `req.body.PLACEMENT_OPTIONS` | POST body từ Bitrix | Khi render HTML ban đầu |
| Client-side: `BX24.placement.info().options` | BX24 JS SDK | Khi cần đọc từ JavaScript |

**Cả hai đều trả về cùng một dữ liệu** - `current_values` chứa giá trị đã lưu trước đó.

---

## 4. Official Code Example (Full)

Đây là code CHÍNH THỨC từ Bitrix24 docs (https://apidocs.bitrix24.com/tutorials/bizproc/setting-robot.html):

### 4.1. Đăng ký robot:

```js
var params = {
    'CODE': 'robot',
    'HANDLER': 'http://handler.com',
    'AUTH_USER_ID': 1,
    'NAME': 'Example of Robot Embedding',
    'USE_PLACEMENT': 'Y',
    'PLACEMENT_HANDLER': 'http://handler.com',
    'PROPERTIES': {
        'string': {
            'Name': 'Parameter 1',
            'Type': 'string'
        },
        'stringm': {
            'Name': 'Parameter 2',
            'Type': 'string',
            'Multiple': 'Y',
            'Default': ['value 1', 'value 2']
        }
    }
};
BX24.callMethod('bizproc.robot.add', params, function(result) {
    if(result.error()) alert("Error: " + result.error());
});
```

### 4.2. Placement Handler (full code):

```php
<?php
// Phân biệt: trang install hay trang placement
if (!isset($_POST['PLACEMENT']) || $_POST['PLACEMENT'] === 'DEFAULT'):
    // Hiển thị trang quản lý robot (install/uninstall)
else:
    // Hiển thị form cấu hình robot
    $options = json_decode($_POST['PLACEMENT_OPTIONS'], true);

    foreach ($options['properties'] as $id => $property) {
        $multiple = isset($property['MULTIPLE']) && $property['MULTIPLE'] === 'Y';
        $val = (array) $options['current_values'][$id];  // *** ĐỌC GIÁ TRỊ ĐÃ LƯU ***

        if (!$val) $val[] = '';
        if ($multiple) $val[] = '';   // Thêm 1 input trống cho Multiple

        $name = $multiple ? $id.'[]' : $id;
        ?>
        <div class="form-group">
            <label><?=htmlspecialchars($property['NAME'])?>:</label>
            <?foreach ($val as $v):?>
            <p><input name="<?=$name?>"
                      value="<?=htmlspecialchars((string)$v)?>"
                      onchange="setPropertyValue('<?=$id?>', this.name, <?=(int)$multiple?>)">
            </p>
            <?endforeach;?>
        </div>
        <?php
    }
endif;
?>

<script>
function setPropertyValue(name, inputName, multiple) {
    var form = new FormData(document.forms.props);
    var value = multiple ? form.getAll(inputName) : form.get(inputName);
    var params = {};
    params[name] = value;
    BX24.placement.call('setPropertyValue', params);
}
</script>
```

### 4.3. Điểm mấu chốt từ official code:

1. **Server render form** từ `$_POST['PLACEMENT_OPTIONS']` - không dùng BX24.placement.info() để load
2. **current_values** chứa **giá trị đã lưu** từ lần trước
3. **setPropertyValue** được gọi **mỗi khi user thay đổi input** (onchange)
4. **KHÔNG có nút Save** - dữ liệu tự động lưu khi gọi setPropertyValue
5. **KHÔNG có bindEvent, onSave, finish** - chỉ cần setPropertyValue

---

## 5. Phân tích code hiện tại và lỗi

### 5.1. Cách đăng ký robot (install.js) - CÓ VẤN ĐỀ

**Vấn đề 1: Property `config` lưu JSON phức tạp**

```js
PROPERTIES: {
    config: {           // Lưu toàn bộ config dạng JSON string
        Type: 'text',
        Required: 'N'
    },
    url: { Type: 'string' },
    method: { Type: 'select', Options: {...} },
    ...
}
```

Đây là cách tiếp cận không theo docs. Official example dùng **từng property riêng lẻ**, không gom hết vào 1 trường JSON.

**Vấn đề 2: Gọi setPropertyValue chỉ khi bấm Save**

```js
document.getElementById('configForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // ... validate ...
    BX24.placement.call('setPropertyValue', propertyValues);
    alert('Configuration updated!');
});
```

Official code gọi `setPropertyValue` **mỗi khi input thay đổi** (onchange), KHÔNG đợi save.

### 5.2. Cách đọc dữ liệu (placementHandler.js) - CÓ VẤN ĐỀ

```js
// Hiện tại: đọc từ BX24.placement.info() phía client
function loadConfiguration() {
    const placementOptions = BX24.placement.info();
    if (placementOptions.options &&
        placementOptions.options.current_values &&
        placementOptions.options.current_values.config) {
        const config = JSON.parse(placementOptions.options.current_values.config);
        // ... load form ...
    }
}
```

**Vấn đề**: Official code đọc dữ liệu **phía server** từ `$_POST['PLACEMENT_OPTIONS']` rồi render HTML với giá trị đã có sẵn. Cách dùng BX24.placement.info() cũng có thể hoạt động nhưng PLACEMENT_OPTIONS được gửi dạng JSON string trong POST body - cần xác nhận BX24.placement.info().options có chứa `current_values` hay không.

### 5.3. Tóm tắt lỗi chính

| # | Lỗi | Cách đúng (Official) |
|---|-----|-------------|
| 1 | Gọi setPropertyValue khi bấm Save | Gọi setPropertyValue mỗi khi input thay đổi (onchange) |
| 2 | Dùng 1 property `config` chứa JSON phức tạp | Dùng từng property riêng lẻ |
| 3 | Đọc dữ liệu hoàn toàn ở client-side | Đọc dữ liệu ở server-side từ POST body, render HTML sẵn |
| 4 | Form có nút Save riêng | Không cần nút Save - auto save khi thay đổi |
| 5 | Thử dùng bindEvent, onSave, finish | Chỉ dùng setPropertyValue |

---

## 6. Đề xuất giải pháp

### Phương án A: Theo sát Official Pattern (Khuyến nghị)

1. **Server-side render**: Đọc `PLACEMENT_OPTIONS` từ POST body, parse JSON, render HTML với giá trị đã lưu
2. **setPropertyValue on change**: Gọi `setPropertyValue` mỗi khi user thay đổi bất kỳ input nào
3. **Bỏ nút Save**: Không cần nút Save - Bitrix tự động lưu khi user bấm nút "LƯU" của Bitrix
4. **Giữ PROPERTIES đơn giản**: Mỗi trường là 1 property riêng (url, method, headers, body, timeout)

**Ưu điểm**: Theo đúng official pattern, đảm bảo hoạt động
**Nhược điểm**: Khó lưu cấu trúc phức tạp (headers array, auth config) vì PROPERTIES chỉ hỗ trợ các kiểu đơn giản (string, text, int, select, user, datetime)

### Phương án B: Hybrid - dùng 1 property `config` nhưng fix cách save/load

1. **Giữ property `config` (Type: text)** để lưu JSON phức tạp
2. **Gọi setPropertyValue NGAY khi input thay đổi** (debounced)
3. **Server-side render**: Đọc current_values.config từ POST body
4. **Bỏ nút Save**

**Ưu điểm**: Lưu được cấu trúc phức tạp (headers, auth, form data)
**Nhược điểm**: Không hoàn toàn theo official pattern, nhưng vẫn dùng setPropertyValue đúng cách

### Phương án C: Multi-property + config backup

1. **Dùng từng property cho các trường chính**: url, method, timeout (để Bitrix hiển thị trong summary)
2. **Thêm property `config` (Type: text)** để lưu toàn bộ cấu hình chi tiết
3. **setPropertyValue on change** cho tất cả properties
4. **Server-side render** ưu tiên đọc từ current_values

**Ưu điểm**: Kết hợp cả hai, Bitrix có thể hiển thị url/method trong summary, config lưu chi tiết
**Nhược điểm**: Dữ liệu bị duplicate

---

## Phụ lục: API Reference

### BX24.placement.call('setPropertyValue', params)
- **Mục đích**: Lưu giá trị property của robot
- **params**: Object `{ propertyName: value, ... }`
- **Không có callback**
- **Gọi bất cứ lúc nào** sau khi BX24.init()

### BX24.placement.info()
- **Trả về**: `{ placement: string, options: object }`
- **options** chứa thông tin về robot placement (properties, current_values, document_fields, template)

### BX24.placement.getInterface(callback)
- **Trả về**: `{ command: array, event: array }`
- Dùng để xác nhận commands khả dụng (vd: setPropertyValue)

### POST data đến PLACEMENT_HANDLER
- `PLACEMENT`: Tên placement
- `PLACEMENT_OPTIONS`: JSON string chứa properties, current_values, document_fields, template
- `DOMAIN`, `AUTH_ID`, `REFRESH_ID`, `member_id`, `LANG`, etc.

---

## 7. Kết quả thực nghiệm - Những thay đổi dẫn đến thành công

### 7.1. Milestone: URL lưu thành công (commit 3480770)

**Phương án đã chọn**: Phương án B (Hybrid) - dùng 1 property `config` (Type: text) lưu JSON.

**3 thay đổi quan trọng dẫn đến URL lưu/load thành công:**

#### Thay đổi 1: Server-side parse PLACEMENT_OPTIONS (placementHandler.js)
**Trước**: Chỉ đọc dữ liệu phía client qua `BX24.placement.info()`
**Sau**: Server đọc `req.body.PLACEMENT_OPTIONS`, parse JSON, lấy `current_values.config`, inject vào HTML dạng `window.__SAVED_CONFIG__`

```js
// Server-side
let savedConfig = null;
const options = JSON.parse(req.body.PLACEMENT_OPTIONS);
if (options.current_values && options.current_values.config) {
    savedConfig = JSON.parse(options.current_values.config);
}
// Inject vào HTML
res.send(`<script>window.__SAVED_CONFIG__ = ${JSON.stringify(savedConfig)};</script> ...`);
```

**Tại sao quan trọng**: Đảm bảo dữ liệu có sẵn ngay khi HTML load, không phụ thuộc vào timing của BX24 SDK.

#### Thay đổi 2: setPropertyValue gọi mỗi khi input thay đổi (debounced 300ms)
**Trước**: Chỉ gọi `setPropertyValue` khi user bấm nút Save
**Sau**: Mỗi input có `oninput="saveToPlacement()"`, gọi debounced `setPropertyValue`

```js
var saveTimeout = null;
function saveToPlacement() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(function() {
        var config = getCurrentConfig();
        BX24.placement.call('setPropertyValue', { config: JSON.stringify(config) });
    }, 300);
}
```

**Tại sao quan trọng**: Bitrix chỉ lưu giá trị khi user bấm nút "LƯU" của Bitrix - nhưng giá trị phải đã được set trước đó qua `setPropertyValue`. Nếu chỉ set khi bấm Save của mình, giá trị chưa được truyền cho Bitrix trước khi Bitrix close placement.

#### Thay đổi 3: Đơn giản hóa PROPERTIES chỉ giữ `config` (install.js)
**Trước**: 6 properties (config, url, method, headers, body, timeout) - dư thừa, conflict
**Sau**: Chỉ 1 property `config` (Type: text) chứa JSON

**Tại sao quan trọng**: Tránh confusion giữa individual properties và config JSON. executeHandler đã đọc từ config JSON, không cần individual properties.

### 7.2. Milestone: Body (Form Data) lưu thành công (commit 4968170)

**3 bugs đã fix:**

1. **`body-form-data` section hiển thị khi không nên**: Section form-data không có `display:none` trong HTML mặc định. Khi bodyType là 'none', user thấy form-data section và có thể nhập data, nhưng `currentBodyType` vẫn là 'none' → `getCurrentConfig()` bỏ qua body data vì `currentBodyType !== 'form-data'`. Fix: thêm `style="display: none;"` cho `body-form-data` section.

2. **Load không hide/show đúng các body section**: Khi load saved config với bodyType 'raw', code chỉ show raw section mà KHÔNG hide form-data section (và ngược lại). Fix: set `display` cho CẢ HAI section khi load (`form-data` và `raw`).

3. **rawBody không load khi giá trị rỗng**: Điều kiện `config.rawBody` là falsy khi rawBody là `''` (empty string). Fix: bỏ điều kiện `&& config.rawBody`, luôn set rawBody value (dùng `config.rawBody || ''`).

**Bài học**: Khi có nhiều section ẩn/hiện, phải đảm bảo:
- Tất cả section ẩn mặc định (display:none)
- Khi load, set display cho TẤT CẢ section (không chỉ section cần hiện)
- Không dùng truthy check cho các giá trị có thể là empty string

### 7.3. Milestone: Fix độ tin cậy của Save (commit cc60edd)

**Vấn đề**: User thay đổi giá trị, bấm LƯU nhưng Bitrix giữ giá trị cũ.

**2 nguyên nhân chính:**

1. **Race condition với debounce 300ms**: User bấm LƯU của Bitrix trước khi debounce timeout kết thúc → `setPropertyValue` chưa được gọi → Bitrix lưu giá trị cũ.

2. **Stale JS array**: `getCurrentConfig()` đọc từ `formDataRows`/`headerRows` JS array thay vì trực tiếp từ DOM. Khi user sửa trực tiếp trong input, array có thể không đồng bộ với DOM.

**Fix:**
- Tách `saveToPlacement()` (debounced 150ms, cho oninput) và `flushSave()` (gọi ngay, cho onchange/blur/structural changes)
- `getCurrentConfig()` đọc headers và formData trực tiếp từ DOM bằng `querySelectorAll` thay vì từ JS array
- Thêm `lastSavedConfig` để skip duplicate saves
- Thêm callback cho `setPropertyValue` để log kết quả

### 7.4. Milestone: Biến Bitrix được resolve thành công (commit b12e236)

**Vấn đề**: Biến template như `{=Document:CRM_ID}` bị Bitrix auto-convert thành display name `{{CRM item ID}}` trong `current_values`. Khi user mở lại settings và save bất kỳ thay đổi, code gửi `{{CRM item ID}}` (display name) ngược lại → Bitrix coi là literal string → không resolve khi robot chạy.

**Phát hiện quan trọng về hệ thống biến Bitrix:**

| Khía cạnh | Chi tiết |
|-----------|---------|
| Cú pháp đúng | `{=Document:FIELD_CODE}` (VD: `{=Document:CRM_ID}`) |
| Display name | Bitrix tự động convert thành `{{Display Name}}` trong current_values |
| Resolve | Bitrix resolve `{=Document:CODE}` trong TEXT properties khi robot chạy, KỂ CẢ khi nằm trong JSON string |
| document_fields | PLACEMENT_OPTIONS chứa `document_fields` mapping FIELD_CODE → Display Name |

**Fix - `convertConfigDisplayNames()`:**
- Build reverse map từ `availableVariables`: display name → `{=Document:CODE}`
- Trước khi gọi `setPropertyValue`, scan toàn bộ config và replace `{{Display Name}}` → `{=Document:CODE}`
- Đảm bảo Bitrix luôn nhận đúng cú pháp bizproc để resolve

```js
// Reverse mapping
function convertDisplayToTemplate(str) {
    return str.replace(/\{\{([^}]+)\}\}/g, function(match, displayName) {
        var variable = availableVariables.find(v => v.name === displayName.trim());
        if (variable) return variable.template;
        return match;
    });
}
```

**Kết quả thực nghiệm - Robot chạy thành công:**
```
Cấu hình:                          → Giá trị nhận được:
{=Document:CRM_ID}                  → "L_262"
{=Document:OPPORTUNITY}              → "0.00"
{=Document:STATUS_ID_PRINTABLE}      → "Submitted Form"
{=Document:TIME_CREATE}              → "23:48"
```

### 7.5. Variable Picker - Hiển thị và sử dụng

Variable picker (nút `⋯`) đọc `document_fields` từ PLACEMENT_OPTIONS và hiển thị tất cả trường khả dụng.

**Các loại biến được hỗ trợ:**
| Loại | Template format | Ví dụ |
|------|----------------|-------|
| Document fields | `{=Document:FIELD_CODE}` | `{=Document:CRM_ID}`, `{=Document:TITLE}` |
| Template variables | `{=Variable:ID}` | `{=Variable:var_123}` |
| Template parameters | `{=Parameter:ID}` | `{=Parameter:param_1}` |
| Global constants | `{=GlobalConst:ID}` | `{=GlobalConst:Constant1735836371481}` |
| Global variables | `{=GlobalVar:ID}` | `{=GlobalVar:Variable_123}` |

### 7.6. Full Data Flow (đã xác nhận hoạt động)

```
1. User mở robot settings
   → Bitrix POST đến PLACEMENT_HANDLER với PLACEMENT_OPTIONS
   → Server parse current_values.config, inject window.__SAVED_CONFIG__
   → Client load form, hiển thị {{Display Name}} (từ Bitrix)

2. User thay đổi config (nhập tay hoặc dùng variable picker)
   → oninput: saveToPlacement() (debounced 150ms)
   → onchange/blur: flushSave() (ngay lập tức)
   → convertConfigDisplayNames() convert {{Name}} → {=Document:CODE}
   → BX24.placement.call('setPropertyValue', {config: JSON.stringify(...)})

3. User bấm LƯU của Bitrix
   → Bitrix đọc giá trị từ setPropertyValue, lưu vào robot config

4. Robot chạy (trigger bởi automation rule)
   → Bitrix resolve {=Document:CODE} → giá trị thực
   → POST đến execute handler với properties.config (JSON với giá trị thực)
   → executeHandler parse config, thực hiện HTTP request
   → Gửi kết quả về Bitrix qua bizproc.event.send
```

---

*Tài liệu nghiên cứu: 2026-02-11*
*Nguồn: Bitrix24 Official REST API Docs, b24restdocs GitHub, Bitrix MCP*
*Cập nhật lần cuối: 2026-02-11 - Toàn bộ pipeline đã xác nhận hoạt động*
