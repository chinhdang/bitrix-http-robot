# Deep Research: Bitrix24 Robot Placement - Data Save/Load Mechanism

## Table of Contents
1. [Tong quan van de](#1-tong-quan-van-de)
2. [Co che luu du lieu tu Custom UI vao Bitrix](#2-co-che-luu-du-lieu-tu-custom-ui-vao-bitrix)
3. [Co che Bitrix lay du lieu khi mo lai robot](#3-co-che-bitrix-lay-du-lieu-khi-mo-lai-robot)
4. [Official Code Example (Full)](#4-official-code-example-full)
5. [Phan tich code hien tai va loi](#5-phan-tich-code-hien-tai-va-loi)
6. [De xuat giai phap](#6-de-xuat-giai-phap)

---

## 1. Tong quan van de

Project `bitrix-http-robot` dang gap van de: **du lieu tu custom UI khong duoc luu/load dung cach** khi nguoi dung cau hinh robot trong Bitrix24 Automation Rules.

Lich su git cho thay da thu nhieu cach:
- `saveSettings`, `finish`, `setPropertyValue`, `bindEvent('onSave')`, hidden form inputs
- Tat ca deu khong giai quyet triet de

---

## 2. Co che luu du lieu tu Custom UI vao Bitrix

### 2.1. Dang ky Robot voi Custom Placement

Khi dang ky robot qua `bizproc.robot.add`, can 2 tham so quan trong:

```js
{
  USE_PLACEMENT: 'Y',           // Bat custom UI
  PLACEMENT_HANDLER: 'https://your-app.com/placement-handler',  // URL cua custom UI
  PROPERTIES: {                 // Dinh nghia cac property
    propertyId1: { Name: '...', Type: 'string' },
    propertyId2: { Name: '...', Type: 'text', Multiple: 'Y' }
  }
}
```

**Luu y quan trong**: `PROPERTIES` dinh nghia cac truong du lieu ma Bitrix se luu. Moi property co `Name`, `Type`, va co the co `Multiple`, `Required`, `Default`.

### 2.2. Cach DUY NHAT de luu du lieu: `BX24.placement.call('setPropertyValue', ...)`

Theo tai lieu chinh thuc, **chi co MOT cach** de luu du lieu tu custom UI vao Bitrix:

```js
BX24.placement.call('setPropertyValue', {
    propertyId1: 'gia tri 1',
    propertyId2: ['gia tri a', 'gia tri b']   // cho Multiple: 'Y'
});
```

**Dac diem quan trong:**
- Tham so la mot **object** voi key la **ten property** (phai khop voi PROPERTIES khi dang ky robot)
- Value la string cho property don, array cho property Multiple
- **KHONG can callback** - method nay tuc thoi set gia tri
- **KHONG can su kien onSave hay bindEvent** - goi truc tiep setPropertyValue bat cu luc nao
- Gia tri duoc **luu ngay lap tuc** vao robot configuration cua Bitrix

### 2.3. Khi nao goi setPropertyValue?

Theo official example, **goi ngay khi user thay doi gia tri** (onchange event):

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

**Key insight**: Official code goi `setPropertyValue` **moi lan user thay doi input**, KHONG doi den khi bam Save. Bitrix tu dong luu gia tri nay vao robot config.

### 2.4. KHONG can va KHONG co cac method sau cho robot placement:
- ~~`BX24.placement.call('finish', ...)`~~ - Khong ton tai cho robot placement
- ~~`BX24.placement.call('saveSettings', ...)`~~ - Khong ton tai
- ~~`BX24.placement.bindEvent('onSave', ...)`~~ - Khong duoc document cho robot
- ~~`app.option.set`~~ - Day la luu data cho APP, khong phai cho robot properties

### 2.5. Commands va Events kha dung cho Robot Placement

Goi `BX24.placement.getInterface()` se tra ve danh sach commands/events kha dung.
Cho robot placement, command chinh (va co the duy nhat) la `setPropertyValue`.

---

## 3. Co che Bitrix lay du lieu khi mo lai robot

### 3.1. Du lieu duoc truyen qua POST den PLACEMENT_HANDLER

Khi user mo cau hinh robot, Bitrix gui POST request den `PLACEMENT_HANDLER` URL voi du lieu:

```
POST /placement/robot-settings

Body (form-urlencoded):
- PLACEMENT: 'DEFAULT' hoac ten placement
- PLACEMENT_OPTIONS: '{...}'   // JSON string
- DOMAIN: 'xxx.bitrix24.com'
- AUTH_ID: '...'
- REFRESH_ID: '...'
- member_id: '...'
- LANG: 'en'
```

### 3.2. Cau truc cua PLACEMENT_OPTIONS

`PLACEMENT_OPTIONS` la JSON string chua:

```json
{
  "code": "http_request_robot",      // Robot CODE
  "activity_name": "A12345_67890",   // ID cua robot instance trong workflow
  "properties": {                     // Dinh nghia properties (schema)
    "url": { "NAME": "URL", "TYPE": "string", ... },
    "method": { "NAME": "HTTP Method", "TYPE": "select", ... },
    "config": { "NAME": "Configuration", "TYPE": "text", ... }
  },
  "current_values": {                 // *** GIA TRI DA LUU ***
    "url": "https://api.example.com",
    "method": "POST",
    "config": "{\"url\":\"...\",\"headers\":[...]}"
  },
  "document_type": ["crm", "CCrmDocumentDeal", "DEAL"],
  "document_fields": {               // Cac truong cua document
    "ID": { "Name": "Deal ID", "Type": "int" },
    "TITLE": { "Name": "Deal Title", "Type": "string" },
    ...
  },
  "template": {                      // Template variables
    "parameters": { ... },
    "variables": { ... },
    "constants": { ... },
    "return_activities": { ... }      // Return values tu cac robot truoc
  }
}
```

### 3.3. Cach doc du lieu da luu DUNG

**Phia server (Node.js/PHP)**: Parse `PLACEMENT_OPTIONS` tu POST body:

```js
// Server-side (Node.js)
app.post('/placement/robot-settings', (req, res) => {
    const options = JSON.parse(req.body.PLACEMENT_OPTIONS);
    const currentValues = options.current_values;  // Gia tri da luu
    const properties = options.properties;          // Schema
    // Render HTML voi currentValues
});
```

**Phia client (BX24 JS SDK)**: Goi `BX24.placement.info()`:

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

### 3.4. QUAN TRONG: Hai cach doc du lieu

| Cach | Nguon | Khi nao dung |
|------|-------|--------------|
| Server-side: `req.body.PLACEMENT_OPTIONS` | POST body tu Bitrix | Khi render HTML ban dau |
| Client-side: `BX24.placement.info().options` | BX24 JS SDK | Khi can doc tu JavaScript |

**Ca hai deu tra ve cung mot du lieu** - `current_values` chua gia tri da luu truoc do.

---

## 4. Official Code Example (Full)

Day la code CHINH THUC tu Bitrix24 docs (https://apidocs.bitrix24.com/tutorials/bizproc/setting-robot.html):

### 4.1. Dang ky robot:

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
// Phan biet: trang install hay trang placement
if (!isset($_POST['PLACEMENT']) || $_POST['PLACEMENT'] === 'DEFAULT'):
    // Hien thi trang quan ly robot (install/uninstall)
else:
    // Hien thi form cau hinh robot
    $options = json_decode($_POST['PLACEMENT_OPTIONS'], true);

    foreach ($options['properties'] as $id => $property) {
        $multiple = isset($property['MULTIPLE']) && $property['MULTIPLE'] === 'Y';
        $val = (array) $options['current_values'][$id];  // *** DOC GIA TRI DA LUU ***

        if (!$val) $val[] = '';
        if ($multiple) $val[] = '';   // Them 1 input trong cho Multiple

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

### 4.3. Diem mau chot tu official code:

1. **Server render form** tu `$_POST['PLACEMENT_OPTIONS']` - khong dung BX24.placement.info() de load
2. **current_values** chua **gia tri da luu** tu lan truoc
3. **setPropertyValue** duoc goi **moi khi user thay doi input** (onchange)
4. **KHONG co nut Save** - du lieu tu dong luu khi goi setPropertyValue
5. **KHONG co bindEvent, onSave, finish** - chi can setPropertyValue

---

## 5. Phan tich code hien tai va loi

### 5.1. Cach dang ky robot (install.js) - CO VAN DE

**Van de 1: Property `config` luu JSON phuc tap**

```js
PROPERTIES: {
    config: {           // Luu toan bo config dang JSON string
        Type: 'text',
        Required: 'N'
    },
    url: { Type: 'string' },
    method: { Type: 'select', Options: {...} },
    ...
}
```

Day la cach tiep can khong theo docs. Official example dung **tung property rieng le**, khong gom het vao 1 truong JSON.

**Van de 2: Goi setPropertyValue chi khi bam Save**

```js
document.getElementById('configForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // ... validate ...
    BX24.placement.call('setPropertyValue', propertyValues);
    alert('Configuration updated!');
});
```

Official code goi `setPropertyValue` **moi khi input thay doi** (onchange), KHONG doi save.

### 5.2. Cach doc du lieu (placementHandler.js) - CO VAN DE

```js
// Hien tai: doc tu BX24.placement.info() phia client
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

**Van de**: Official code doc du lieu **phia server** tu `$_POST['PLACEMENT_OPTIONS']` roi render HTML voi gia tri da co san. Cach dung BX24.placement.info() cung co the hoat dong nhung PLACEMENT_OPTIONS duoc gui dang JSON string trong POST body - can xac nhan BX24.placement.info().options co chua `current_values` hay khong.

### 5.3. Tom tat loi chinh

| # | Loi | Official way |
|---|-----|-------------|
| 1 | Goi setPropertyValue khi bam Save | Goi setPropertyValue moi khi input thay doi (onchange) |
| 2 | Dung 1 property `config` chua JSON phuc tap | Dung tung property rieng le |
| 3 | Doc du lieu hoan toan o client-side | Doc du lieu o server-side tu POST body, render HTML san |
| 4 | Form co nut Save rieng | Khong can nut Save - auto save khi thay doi |
| 5 | Thu dung bindEvent, onSave, finish | Chi dung setPropertyValue |

---

## 6. De xuat giai phap

### Phuong an A: Theo sat Official Pattern (Khuyen nghi)

1. **Server-side render**: Doc `PLACEMENT_OPTIONS` tu POST body, parse JSON, render HTML voi gia tri da luu
2. **setPropertyValue on change**: Goi `setPropertyValue` moi khi user thay doi bat ky input nao
3. **Bo nut Save**: Khong can nut Save - Bitrix tu dong luu khi user bam nut "LUU" cua Bitrix
4. **Giu PROPERTIES don gian**: Moi truong la 1 property rieng (url, method, headers, body, timeout)

**Uu diem**: Theo dung official pattern, dam bao hoat dong
**Nhuoc diem**: Kho luu cau truc phuc tap (headers array, auth config) vi PROPERTIES chi ho tro cac kieu don gian (string, text, int, select, user, datetime)

### Phuong an B: Hybrid - dung 1 property `config` nhung fix cach save/load

1. **Giu property `config` (Type: text)** de luu JSON phuc tap
2. **Goi setPropertyValue NGAY khi input thay doi** (debounced)
3. **Server-side render**: Doc current_values.config tu POST body
4. **Bo nut Save**

**Uu diem**: Luu duoc cau truc phuc tap (headers, auth, form data)
**Nhuoc diem**: Khong hoan toan theo official pattern, nhung van dung setPropertyValue dung cach

### Phuong an C: Multi-property + config backup

1. **Dung tung property cho cac truong chinh**: url, method, timeout (de Bitrix hien thi trong summary)
2. **Them property `config` (Type: text)** de luu toan bo cau hinh chi tiet
3. **setPropertyValue on change** cho tat ca properties
4. **Server-side render** uu tien doc tu current_values

**Uu diem**: Ket hop ca hai, Bitrix co the hien thi url/method trong summary, config luu chi tiet
**Nhuoc diem**: Du lieu bi duplicate

---

## Phu luc: API Reference

### BX24.placement.call('setPropertyValue', params)
- **Muc dich**: Luu gia tri property cua robot
- **params**: Object `{ propertyName: value, ... }`
- **Khong co callback**
- **Goi bat cu luc nao** sau khi BX24.init()

### BX24.placement.info()
- **Tra ve**: `{ placement: string, options: object }`
- **options** chua thong tin ve robot placement (properties, current_values, document_fields, template)

### BX24.placement.getInterface(callback)
- **Tra ve**: `{ command: array, event: array }`
- Dung de xac nhan commands kha dung (vd: setPropertyValue)

### POST data den PLACEMENT_HANDLER
- `PLACEMENT`: Ten placement
- `PLACEMENT_OPTIONS`: JSON string chua properties, current_values, document_fields, template
- `DOMAIN`, `AUTH_ID`, `REFRESH_ID`, `member_id`, `LANG`, etc.

---

## 7. Ket qua thuc nghiem - Nhung thay doi dan den thanh cong

### 7.1. Milestone: URL luu thanh cong (commit 3480770)

**Phuong an da chon**: Phuong an B (Hybrid) - dung 1 property `config` (Type: text) luu JSON.

**3 thay doi quan trong dan den URL luu/load thanh cong:**

#### Thay doi 1: Server-side parse PLACEMENT_OPTIONS (placementHandler.js)
**Truoc**: Chi doc du lieu phia client qua `BX24.placement.info()`
**Sau**: Server doc `req.body.PLACEMENT_OPTIONS`, parse JSON, lay `current_values.config`, inject vao HTML dang `window.__SAVED_CONFIG__`

```js
// Server-side
let savedConfig = null;
const options = JSON.parse(req.body.PLACEMENT_OPTIONS);
if (options.current_values && options.current_values.config) {
    savedConfig = JSON.parse(options.current_values.config);
}
// Inject vao HTML
res.send(`<script>window.__SAVED_CONFIG__ = ${JSON.stringify(savedConfig)};</script> ...`);
```

**Tai sao quan trong**: Dam bao du lieu co san ngay khi HTML load, khong phu thuoc vao timing cua BX24 SDK.

#### Thay doi 2: setPropertyValue goi moi khi input thay doi (debounced 300ms)
**Truoc**: Chi goi `setPropertyValue` khi user bam nut Save
**Sau**: Moi input co `oninput="saveToPlacement()"`, goi debounced `setPropertyValue`

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

**Tai sao quan trong**: Bitrix chi luu gia tri khi user bam nut "LUU" cua Bitrix - nhung gia tri phai da duoc set truoc do qua `setPropertyValue`. Neu chi set khi bam Save cua minh, gia tri chua duoc truyen cho Bitrix truoc khi Bitrix close placement.

#### Thay doi 3: Don gian hoa PROPERTIES chi giu `config` (install.js)
**Truoc**: 6 properties (config, url, method, headers, body, timeout) - du thua, conflict
**Sau**: Chi 1 property `config` (Type: text) chua JSON

**Tai sao quan trong**: Tranh confusion giua individual properties va config JSON. executeHandler da doc tu config JSON, khong can individual properties.

### 7.2. Van de con lai
- **Body** (raw body, form data): Chua luu/load thanh cong - can dieu tra tiep
- Can kiem tra: bodyType co duoc set dung khi switch tab khong, getCurrentConfig() co tra ve body data khong

---

*Research compiled: 2026-02-11*
*Sources: Bitrix24 Official REST API Docs, b24restdocs GitHub, Bitrix MCP*
