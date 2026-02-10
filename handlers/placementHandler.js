/**
 * Placement Handler for Custom Robot Settings UI
 * This provides a custom interface for configuring the HTTP Request Robot
 */

const logger = require('../utils/logger');

/**
 * Handle placement request for robot settings
 * Returns HTML/JS for custom settings interface
 */
async function handleRobotSettings(req, res) {
  try {
    logger.info('Placement handler called', {
      placement: req.body.PLACEMENT,
      domain: req.body.DOMAIN
    });

    // Return custom HTML interface
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HTTP Request Configuration</title>
  <script src="//api.bitrix24.com/api/v1/"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      padding: 0;
      margin: 0;
      background: #fafbfc;
      color: #525c69;
    }

    .container {
      max-width: 100%;
      margin: 0;
      background: #ffffff;
      padding: 24px 28px;
    }

    h2 {
      margin-bottom: 24px;
      color: #333f50;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.3px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .input-with-button {
      display: flex;
      gap: 8px;
      align-items: start;
    }

    .input-with-button > input,
    .input-with-button > textarea {
      flex: 1;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #525c69;
      font-size: 13px;
      letter-spacing: -0.1px;
    }

    input[type="text"],
    input[type="number"],
    select,
    textarea {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #dfe3e8;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.5;
      font-family: inherit;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      background: #ffffff;
      color: #333f50;
    }

    .btn-dots {
      background: #ffffff;
      border: 1px solid #dfe3e8;
      color: #a8adb4;
      width: 40px;
      height: 40px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: normal;
      cursor: pointer;
      border-radius: 8px;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
    }

    .btn-dots:hover {
      background: #2fc6f6;
      border-color: #2fc6f6;
      color: #ffffff;
      box-shadow:
        0 0 0 1px #2fc6f6,
        0 4px 6px -1px rgba(47, 198, 246, 0.3);
      transform: scale(1.05);
    }

    .btn-dots:active {
      transform: scale(0.98);
    }

    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: #2fc6f6;
      box-shadow:
        0 0 0 1px #2fc6f6,
        0 0 0 4px rgba(47, 198, 246, 0.1);
    }

    @media (prefers-reduced-motion: reduce) {
      input, select, textarea, .btn, .btn-dots, .variable-item {
        transition-duration: 1ms;
      }
    }

    input::placeholder,
    textarea::placeholder {
      color: #a8adb4;
    }

    textarea {
      min-height: 80px;
      resize: vertical;
    }

    .form-data-section {
      border: 1px solid #eef2f5;
      border-radius: 10px;
      padding: 24px;
      background: #fafbfc;
      margin-bottom: 20px;
    }

    .form-data-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }

    .form-data-header h3 {
      font-size: 15px;
      font-weight: 600;
      color: #333f50;
      letter-spacing: -0.2px;
    }

    .form-data-row {
      display: grid;
      grid-template-columns: 1fr 2fr 38px 38px;
      gap: 10px;
      margin-bottom: 10px;
      align-items: start;
    }

    .form-data-row input {
      margin-bottom: 0;
    }

    .btn {
      padding: 10px 18px;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: -0.1px;
      line-height: 1.5;
    }

    .btn-primary {
      background: linear-gradient(180deg, #2fc6f6 0%, #1fb5e5 100%);
      color: white;
      box-shadow:
        0 0 0 1px rgba(47, 198, 246, 0.1),
        0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    .btn-primary:hover {
      background: linear-gradient(180deg, #1fb5e5 0%, #0ea5d5 100%);
      box-shadow:
        0 0 0 1px rgba(47, 198, 246, 0.2),
        0 4px 6px -1px rgba(47, 198, 246, 0.2),
        0 2px 4px -2px rgba(47, 198, 246, 0.15);
      transform: translateY(-1px);
    }

    .btn-primary:active {
      transform: translateY(0);
      box-shadow:
        0 0 0 1px rgba(47, 198, 246, 0.2),
        0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    .btn-success {
      background: linear-gradient(180deg, #57c489 0%, #48b57a 100%);
      color: white;
      padding: 12px 28px;
      font-size: 13px;
      box-shadow:
        0 0 0 1px rgba(87, 196, 137, 0.1),
        0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    .btn-success:hover {
      background: linear-gradient(180deg, #48b57a 0%, #39a66b 100%);
      box-shadow:
        0 0 0 1px rgba(87, 196, 137, 0.2),
        0 4px 6px -1px rgba(87, 196, 137, 0.2),
        0 2px 4px -2px rgba(87, 196, 137, 0.15);
      transform: translateY(-1px);
    }

    .btn-success:active {
      transform: translateY(0);
    }

    .btn-danger {
      background: linear-gradient(180deg, #ff5c5c 0%, #ff4747 100%);
      color: white;
      width: 40px;
      height: 40px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: none;
      box-shadow:
        0 0 0 1px rgba(255, 92, 92, 0.1),
        0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    .btn-danger:hover {
      background: linear-gradient(180deg, #ff4747 0%, #ff3232 100%);
      box-shadow:
        0 0 0 1px rgba(255, 92, 92, 0.2),
        0 4px 6px -1px rgba(255, 92, 92, 0.3);
      transform: scale(1.05);
    }

    .btn-danger:active {
      transform: scale(0.98);
    }

    .btn-secondary {
      background: #ffffff;
      color: #525c69;
      border: 1px solid #dfe3e8;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }

    .btn-secondary:hover {
      background: #f8f9fa;
      border-color: #d0d5db;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .btn-secondary:active {
      background: #f3f5f7;
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #eef2f5;
    }

    .help-text {
      font-size: 12px;
      color: #a8adb4;
      margin-top: 6px;
      line-height: 1.5;
    }

    .alert {
      padding: 14px 18px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 13px;
      line-height: 1.6;
      border-left: 3px solid;
    }

    .alert-info {
      background: #e8f7ff;
      border-left-color: #2fc6f6;
      color: #0087c7;
    }

    .empty-state {
      text-align: center;
      padding: 32px 20px;
      color: #a8adb4;
      font-size: 13px;
    }

    /* Variable Picker Modal - B24UI Style */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 10000;
      justify-content: center;
      align-items: center;
      animation: overlayShow 200ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    @media (prefers-reduced-motion: reduce) {
      .modal-overlay {
        backdrop-filter: none;
        animation-duration: 1ms;
      }
    }

    .modal-overlay.active {
      display: flex;
    }

    @keyframes overlayShow {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes contentShow {
      from {
        opacity: 0;
        transform: translate(-50%, -48%) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    .modal-content {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ffffff;
      border-radius: 12px;
      width: 90vw;
      max-width: 720px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow:
        0 0 0 1px rgba(0, 0, 0, 0.05),
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -4px rgba(0, 0, 0, 0.1);
      animation: contentShow 200ms cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
    }

    @media (prefers-reduced-motion: reduce) {
      .modal-content {
        animation-duration: 1ms;
      }
    }

    .modal-header {
      padding: 24px 28px 20px;
      border-bottom: 1px solid #eef2f5;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #525c69;
      letter-spacing: -0.2px;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 28px;
      color: #a8adb4;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .modal-close:hover {
      background: #f3f5f7;
      color: #535c69;
    }

    .modal-body {
      padding: 24px 28px 28px;
      overflow-y: auto;
      overflow-x: hidden;
      flex: 1;
      background: #fafbfc;
    }

    /* Thin scrollbar like B24UI */
    .modal-body::-webkit-scrollbar {
      width: 6px;
    }

    .modal-body::-webkit-scrollbar-track {
      background: transparent;
    }

    .modal-body::-webkit-scrollbar-thumb {
      background: #d0d5db;
      border-radius: 3px;
    }

    .modal-body::-webkit-scrollbar-thumb:hover {
      background: #a8adb4;
    }

    .modal-search {
      width: 100%;
      padding: 11px 16px;
      border: 1px solid #dfe3e8;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.5;
      margin-bottom: 20px;
      background: #ffffff;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      color: #333f50;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }

    .modal-search:focus {
      outline: none;
      border-color: #2fc6f6;
      background: #ffffff;
      box-shadow:
        0 0 0 1px #2fc6f6,
        0 0 0 4px rgba(47, 198, 246, 0.1);
    }

    .modal-search::placeholder {
      color: #a8adb4;
      opacity: 0.8;
    }

    .variable-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
    }

    .variable-item {
      padding: 12px 16px;
      border: 1px solid #eef2f5;
      border-radius: 8px;
      cursor: pointer;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      background: #ffffff;
      font-size: 13px;
      font-weight: 500;
      color: #525c69;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      box-shadow:
        0 0 0 1px rgba(0, 0, 0, 0.02),
        0 1px 2px rgba(0, 0, 0, 0.04);
      line-height: 1.5;
    }

    .variable-item:hover {
      background: linear-gradient(180deg, #2fc6f6 0%, #1fb5e5 100%);
      border-color: transparent;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow:
        0 0 0 1px rgba(47, 198, 246, 0.3),
        0 4px 6px -1px rgba(47, 198, 246, 0.3),
        0 2px 4px -2px rgba(47, 198, 246, 0.2);
    }

    .variable-item:active {
      transform: translateY(0);
      box-shadow:
        0 0 0 1px rgba(47, 198, 246, 0.3),
        0 2px 4px rgba(47, 198, 246, 0.3);
    }

    .no-variables {
      text-align: center;
      padding: 60px 20px;
      color: #a8adb4;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>HTTP Request Configuration</h2>

    <div class="alert alert-info">
      <strong>Tip:</strong> Use the ⋯ button to insert workflow variables like {{Document:TITLE}} into any field
    </div>

    <form id="configForm">
      <div class="form-group">
        <label for="url">URL *</label>
        <div class="input-with-button">
          <input type="text" id="url" placeholder="https://api.example.com/endpoint" required>
          <button type="button" class="btn-dots" onclick="showVariablePicker('url')" title="Insert variable">⋯</button>
        </div>
        <div class="help-text">Target URL for the HTTP request</div>
      </div>

      <div class="form-group">
        <label for="method">HTTP Method *</label>
        <select id="method" required>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div class="form-group">
        <label for="headers">Headers (JSON)</label>
        <div class="input-with-button">
          <textarea id="headers" placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'></textarea>
          <button type="button" class="btn-dots" onclick="showVariablePicker('headers')" title="Insert variable">⋯</button>
        </div>
        <div class="help-text">Request headers as JSON object</div>
      </div>

      <div class="form-data-section">
        <div class="form-data-header">
          <h3>📋 Form Data / Request Body</h3>
          <button type="button" class="btn btn-primary" onclick="addFormDataRow()">+ Add Field</button>
        </div>

        <div id="formDataContainer">
          <div class="empty-state">
            Click "+ Add Field" to add form data fields
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="rawBody">Or use Raw Body (overrides Form Data if filled)</label>
        <div class="input-with-button">
          <textarea id="rawBody" placeholder='{"key": "value"} or any raw content'></textarea>
          <button type="button" class="btn-dots" onclick="showVariablePicker('rawBody')" title="Insert variable">⋯</button>
        </div>
        <div class="help-text">Use this for JSON, XML, or any raw body content</div>
      </div>

      <div class="form-group">
        <label for="timeout">Timeout (ms)</label>
        <input type="number" id="timeout" value="30000" min="1000" max="300000">
        <div class="help-text">Request timeout in milliseconds (max: 300000)</div>
      </div>

      <div class="actions">
        <button type="submit" class="btn btn-success">✓ Save Configuration</button>
        <button type="button" class="btn btn-secondary" onclick="BX24.closeApplication()">Cancel</button>
      </div>
    </form>
  </div>

  <!-- Variable Picker Modal -->
  <div class="modal-overlay" id="variableModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Insert Variable</h3>
        <button class="modal-close" onclick="closeVariablePicker()">×</button>
      </div>
      <div class="modal-body">
        <input type="text" class="modal-search" id="variableSearch" placeholder="Search fields..." onkeyup="filterVariables()">
        <ul class="variable-list" id="variableList"></ul>
      </div>
    </div>
  </div>

  <script>
    let formDataRows = [];
    let placementData = null;
    let availableVariables = [];

    // Initialize Bitrix24 App
    BX24.init(function() {
      console.log('Bitrix24 initialized');

      // Get placement info and available interface
      placementData = BX24.placement.info();
      console.log('Placement data:', placementData);

      // Check available commands
      BX24.placement.getInterface(function(result) {
        console.log('Available commands:', result);
      });

      // Extract available variables from placement options
      if (placementData.options) {
        try {
          const options = typeof placementData.options === 'string'
            ? JSON.parse(placementData.options)
            : placementData.options;

          // Get document fields if available
          if (options.document_fields) {
            availableVariables = Object.keys(options.document_fields).map(key => ({
              code: key,
              name: options.document_fields[key].Name || key,
              template: '{{Document:' + key + '}}'
            }));
          }

          // Get template variables if available
          if (options.template && options.template.variables) {
            Object.keys(options.template.variables).forEach(key => {
              availableVariables.push({
                code: key,
                name: options.template.variables[key].Name || key,
                template: '{{Variable:' + key + '}}'
              });
            });
          }

          // Get template parameters if available
          if (options.template && options.template.parameters) {
            Object.keys(options.template.parameters).forEach(key => {
              availableVariables.push({
                code: key,
                name: options.template.parameters[key].Name || key,
                template: '{{Parameter:' + key + '}}'
              });
            });
          }

          console.log('Available variables:', availableVariables);
        } catch (e) {
          console.error('Error parsing placement options:', e);
        }
      }

      // Load saved configuration
      loadConfiguration();
    });

    // Load configuration from placement options
    function loadConfiguration() {
      const placementOptions = BX24.placement.info();
      console.log('Placement options:', placementOptions);

      // If we have saved data, load it
      if (placementOptions.options) {
        try {
          const config = JSON.parse(placementOptions.options);

          if (config.url) document.getElementById('url').value = config.url;
          if (config.method) document.getElementById('method').value = config.method;
          if (config.headers) document.getElementById('headers').value = config.headers;
          if (config.rawBody) document.getElementById('rawBody').value = config.rawBody;
          if (config.timeout) document.getElementById('timeout').value = config.timeout;

          // Load form data rows
          if (config.formData && Array.isArray(config.formData)) {
            config.formData.forEach(row => {
              addFormDataRow(row.key, row.value);
            });
          }
        } catch (e) {
          console.error('Error loading config:', e);
        }
      }
    }

    // Add a form data row
    function addFormDataRow(key = '', value = '') {
      const container = document.getElementById('formDataContainer');

      // Remove empty state message
      if (formDataRows.length === 0) {
        container.innerHTML = '';
      }

      const rowId = 'row_' + Date.now();
      const row = {
        id: rowId,
        key: key,
        value: value
      };

      formDataRows.push(row);

      const rowHtml = \`
        <div class="form-data-row" id="\${rowId}">
          <input type="text" placeholder="Key" value="\${key}" onchange="updateFormDataRow('\${rowId}', 'key', this.value)">
          <input type="text" placeholder="Value (can use {{Document:FIELD}})" value="\${value}" id="formdata_\${rowId}" onchange="updateFormDataRow('\${rowId}', 'value', this.value)">
          <button type="button" class="btn-dots" onclick="showVariablePicker('formdata_\${rowId}')" title="Insert variable">⋯</button>
          <button type="button" class="btn btn-danger" onclick="removeFormDataRow('\${rowId}')" title="Remove">×</button>
        </div>
      \`;

      container.insertAdjacentHTML('beforeend', rowHtml);
    }

    // Update form data row
    function updateFormDataRow(rowId, field, value) {
      const row = formDataRows.find(r => r.id === rowId);
      if (row) {
        row[field] = value;
      }
    }

    // Remove form data row
    function removeFormDataRow(rowId) {
      const element = document.getElementById(rowId);
      if (element) {
        element.remove();
      }

      formDataRows = formDataRows.filter(r => r.id !== rowId);

      // Show empty state if no rows
      if (formDataRows.length === 0) {
        document.getElementById('formDataContainer').innerHTML =
          '<div class="empty-state">Click "+ Add Field" to add form data fields</div>';
      }
    }

    let currentFieldId = null;

    // Show variable picker
    function showVariablePicker(fieldId) {
      currentFieldId = fieldId;
      console.log('Opening variable picker for field:', fieldId);

      // Show custom variable picker directly
      showCustomVariablePicker();
    }

    // Show custom variable picker modal
    function showCustomVariablePicker() {
      console.log('showCustomVariablePicker called');
      console.log('Available variables:', availableVariables);

      // Default variables if none loaded yet
      if (availableVariables.length === 0) {
        console.log('No variables loaded, using defaults');
        availableVariables = [
          { code: 'ID', name: 'Document ID', template: '{{Document:ID}}' },
          { code: 'TITLE', name: 'Document Title', template: '{{Document:TITLE}}' },
          { code: 'CREATED_BY', name: 'Created By', template: '{{Document:CREATED_BY}}' },
          { code: 'MODIFIED_BY', name: 'Modified By', template: '{{Document:MODIFIED_BY}}' },
        ];
      }

      // Render variable list
      renderVariableList(availableVariables);

      // Show modal
      const modal = document.getElementById('variableModal');
      if (modal) {
        console.log('Showing modal');
        modal.classList.add('active');
        const searchInput = document.getElementById('variableSearch');
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
      } else {
        console.error('Modal element not found!');
      }
    }

    // Render variable list
    function renderVariableList(variables) {
      const listContainer = document.getElementById('variableList');

      if (variables.length === 0) {
        listContainer.innerHTML = '<div class="no-variables">No variables found</div>';
        return;
      }

      listContainer.innerHTML = variables.map(v => \`
        <li class="variable-item" onclick="selectVariable('\${v.template}')" title="\${v.template}">
          \${v.name}
        </li>
      \`).join('');
    }

    // Filter variables by search
    function filterVariables() {
      const search = document.getElementById('variableSearch').value.toLowerCase();
      const filtered = availableVariables.filter(v =>
        v.name.toLowerCase().includes(search) ||
        v.code.toLowerCase().includes(search) ||
        v.template.toLowerCase().includes(search)
      );
      renderVariableList(filtered);
    }

    // Select variable from picker
    function selectVariable(template) {
      insertVariableIntoField(currentFieldId, template);
      closeVariablePicker();
    }

    // Close variable picker
    function closeVariablePicker() {
      document.getElementById('variableModal').classList.remove('active');
      currentFieldId = null;
    }

    // Close modal when clicking outside (set up immediately since script is at bottom)
    setTimeout(function() {
      const modal = document.getElementById('variableModal');
      if (modal) {
        modal.addEventListener('click', function(e) {
          if (e.target === this) {
            closeVariablePicker();
          }
        });
      }
    }, 0);

    // Insert variable into field
    function insertVariableIntoField(fieldId, variable) {
      const field = document.getElementById(fieldId);
      if (field) {
        const start = field.selectionStart;
        const end = field.selectionEnd;
        const text = field.value;

        // Insert at cursor position
        field.value = text.substring(0, start) + variable + text.substring(end);

        // Update form data row if this is a form data field
        if (fieldId.startsWith('formdata_')) {
          const rowId = fieldId.replace('formdata_', '');
          updateFormDataRow(rowId, 'value', field.value);
        }

        // Set cursor position after inserted variable
        field.selectionStart = field.selectionEnd = start + variable.length;
        field.focus();
      }
    }

    // Handle form submission
    document.getElementById('configForm').addEventListener('submit', function(e) {
      e.preventDefault();

      // Collect configuration
      const config = {
        url: document.getElementById('url').value,
        method: document.getElementById('method').value,
        headers: document.getElementById('headers').value,
        rawBody: document.getElementById('rawBody').value,
        timeout: document.getElementById('timeout').value,
        formData: formDataRows.map(row => ({
          key: row.key,
          value: row.value
        })).filter(row => row.key) // Only include rows with keys
      };

      // Validate URL
      if (!config.url) {
        alert('URL is required');
        return;
      }

      // Send back to Bitrix24
      BX24.placement.call('finish', {
        config: JSON.stringify(config)
      });
    });
  </script>
</body>
</html>
    `);

  } catch (error) {
    logger.error('Error in placement handler', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).send('Error loading configuration interface');
  }
}

module.exports = {
  handleRobotSettings
};
