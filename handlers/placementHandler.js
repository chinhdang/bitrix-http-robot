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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    h2 {
      margin-bottom: 20px;
      color: #333;
      font-size: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #555;
      font-size: 14px;
    }

    input[type="text"],
    input[type="number"],
    select,
    textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.3s;
    }

    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: #2fc6f6;
    }

    textarea {
      min-height: 80px;
      resize: vertical;
    }

    .form-data-section {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 20px;
      background: #fafafa;
      margin-bottom: 20px;
    }

    .form-data-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .form-data-header h3 {
      font-size: 16px;
      color: #333;
    }

    .form-data-row {
      display: grid;
      grid-template-columns: 1fr 2fr 40px;
      gap: 10px;
      margin-bottom: 10px;
      align-items: start;
    }

    .form-data-row input {
      margin-bottom: 0;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #2fc6f6;
      color: white;
    }

    .btn-primary:hover {
      background: #1fb5e5;
    }

    .btn-success {
      background: #52c41a;
      color: white;
      padding: 12px 24px;
      font-size: 16px;
    }

    .btn-success:hover {
      background: #3db00f;
    }

    .btn-danger {
      background: #ff4d4f;
      color: white;
      width: 36px;
      height: 36px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-danger:hover {
      background: #ff1f21;
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #666;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .actions {
      display: flex;
      gap: 10px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .help-text {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .alert-info {
      background: #e6f7ff;
      border: 1px solid #91d5ff;
      color: #1890ff;
    }

    .empty-state {
      text-align: center;
      padding: 20px;
      color: #999;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>🚀 HTTP Request Configuration</h2>

    <div class="alert alert-info">
      <strong>Pro Tip:</strong> You can use Bitrix24 variables like {{Document:TITLE}} in any field!
    </div>

    <form id="configForm">
      <div class="form-group">
        <label for="url">URL *</label>
        <input type="text" id="url" placeholder="https://api.example.com/endpoint" required>
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
        <textarea id="headers" placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'></textarea>
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
        <textarea id="rawBody" placeholder='{"key": "value"} or any raw content'></textarea>
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

  <script>
    let formDataRows = [];

    // Initialize Bitrix24 App
    BX24.init(function() {
      console.log('Bitrix24 initialized');

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
          <input type="text" placeholder="Value (can use {{Document:FIELD}})" value="\${value}" onchange="updateFormDataRow('\${rowId}', 'value', this.value)">
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
