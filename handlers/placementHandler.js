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

    // Parse saved config from POST body (server-side)
    let savedConfig = null;
    try {
      if (req.body.PLACEMENT_OPTIONS) {
        const options = typeof req.body.PLACEMENT_OPTIONS === 'string'
          ? JSON.parse(req.body.PLACEMENT_OPTIONS)
          : req.body.PLACEMENT_OPTIONS;
        logger.info('PLACEMENT_OPTIONS parsed', { options });
        if (options.current_values && options.current_values.config) {
          savedConfig = JSON.parse(options.current_values.config);
          logger.info('Loaded saved config', { savedConfig });
        }
      }
    } catch (e) {
      logger.warn('Could not parse saved config from PLACEMENT_OPTIONS', { error: e.message });
    }

    // Return custom HTML interface
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HTTP Request Configuration</title>
  <script src="//api.bitrix24.com/api/v1/"></script>
  <style>
    /* B24UI Design Tokens - CSS Custom Properties for theming */
    :root {
      /* Colors */
      --color-primary: #2fc6f6;
      --color-primary-dark: #1fb5e5;
      --color-primary-darker: #0ea5d5;
      --color-danger: #ff5c5c;
      --color-danger-dark: #ff4747;
      --color-danger-darker: #ff3232;
      --color-warning: #ff9f43;
      --color-text: #333f50;
      --color-text-secondary: #525c69;
      --color-text-muted: #a8adb4;
      --color-border: #dfe3e8;
      --color-border-light: #eef2f5;
      --color-bg: #ffffff;
      --color-bg-secondary: #fafbfc;
      --color-bg-tertiary: #f3f5f7;

      /* Spacing */
      --space-xs: 6px;
      --space-sm: 10px;
      --space-md: 16px;
      --space-lg: 24px;
      --space-xl: 32px;

      /* Radius */
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 10px;
      --radius-xl: 12px;

      /* Transitions */
      --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
      --transition-smooth: 200ms cubic-bezier(0.16, 1, 0.3, 1);

      /* Shadows */
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      --shadow-primary: 0 0 0 1px var(--color-primary), 0 0 0 4px rgba(47, 198, 246, 0.1);
      --shadow-primary-hover: 0 0 0 1px rgba(47, 198, 246, 0.2), 0 4px 6px -1px rgba(47, 198, 246, 0.2);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      padding: 0;
      margin: 0;
      background: var(--color-bg-secondary);
      color: var(--color-text-secondary);
    }

    .container {
      max-width: 100%;
      margin: 0;
      background: var(--color-bg);
      padding: var(--space-md) 20px;
    }

    h2 {
      margin-bottom: var(--space-lg);
      color: var(--color-text);
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.3px;
    }

    .form-group {
      margin-bottom: var(--space-md);
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
      margin-bottom: var(--space-xs);
      font-weight: 500;
      color: var(--color-text-secondary);
      font-size: 13px;
      letter-spacing: -0.1px;
    }

    input[type="text"],
    input[type="number"],
    input[type="password"],
    select,
    textarea {
      width: 100%;
      padding: var(--space-sm) 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 13px;
      line-height: 1.5;
      font-family: inherit;
      transition: all var(--transition-fast);
      background: var(--color-bg);
      color: var(--color-text);
    }

    /* Validation states */
    input:invalid:not(:placeholder-shown),
    textarea:invalid:not(:placeholder-shown) {
      border-color: var(--color-danger);
    }

    input.error,
    textarea.error,
    select.error {
      border-color: var(--color-danger);
      box-shadow: 0 0 0 1px var(--color-danger), 0 0 0 4px rgba(255, 92, 92, 0.1);
    }

    .error-message {
      display: none;
      margin-top: var(--space-xs);
      font-size: 12px;
      color: var(--color-danger);
      line-height: 1.4;
    }

    .error-message.visible {
      display: block;
    }

    .btn-dots {
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      color: var(--color-text-muted);
      width: 40px;
      height: 40px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: normal;
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }

    .btn-dots:hover {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: var(--color-bg);
      box-shadow: 0 0 0 1px var(--color-primary), 0 4px 6px -1px rgba(47, 198, 246, 0.3);
      transform: scale(1.05);
    }

    .btn-dots:active {
      transform: scale(0.98);
    }

    .btn-dots:focus-visible {
      outline: none;
      box-shadow: var(--shadow-primary);
    }

    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: var(--shadow-primary);
    }

    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: var(--shadow-primary);
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    input::placeholder,
    textarea::placeholder {
      color: var(--color-text-muted);
    }

    textarea {
      min-height: 80px;
      resize: vertical;
    }

    .form-data-section {
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      background: var(--color-bg-secondary);
      margin-bottom: 12px;
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
      color: var(--color-text);
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
      padding: var(--space-sm) 18px;
      border: none;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      letter-spacing: -0.1px;
      line-height: 1.5;
    }

    .btn:focus-visible {
      outline: none;
      box-shadow: var(--shadow-primary);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-primary {
      background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      color: white;
      box-shadow: 0 0 0 1px rgba(47, 198, 246, 0.1), var(--shadow-sm);
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(180deg, var(--color-primary-dark) 0%, var(--color-primary-darker) 100%);
      box-shadow: var(--shadow-primary-hover), 0 2px 4px -2px rgba(47, 198, 246, 0.15);
      transform: translateY(-1px);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 0 0 1px rgba(47, 198, 246, 0.2), var(--shadow-sm);
    }

    .btn-success {
      background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      color: white;
      padding: var(--space-sm) var(--space-lg);
      font-size: 13px;
      box-shadow: 0 0 0 1px rgba(47, 198, 246, 0.1), var(--shadow-sm);
    }

    .btn-success:hover:not(:disabled) {
      background: linear-gradient(180deg, var(--color-primary-dark) 0%, var(--color-primary-darker) 100%);
      box-shadow: var(--shadow-primary-hover), 0 2px 4px -2px rgba(47, 198, 246, 0.15);
      transform: translateY(-1px);
    }

    .btn-success:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-danger {
      background: linear-gradient(180deg, var(--color-danger) 0%, var(--color-danger-dark) 100%);
      color: white;
      width: 40px;
      height: 40px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      border: none;
      box-shadow: 0 0 0 1px rgba(255, 92, 92, 0.1), var(--shadow-sm);
    }

    .btn-danger:hover:not(:disabled) {
      background: linear-gradient(180deg, var(--color-danger-dark) 0%, var(--color-danger-darker) 100%);
      box-shadow: 0 0 0 1px rgba(255, 92, 92, 0.2), 0 4px 6px -1px rgba(255, 92, 92, 0.3);
      transform: scale(1.05);
    }

    .btn-danger:active:not(:disabled) {
      transform: scale(0.98);
    }

    .btn-secondary {
      background: var(--color-bg);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
    }

    .btn-secondary:hover:not(:disabled) {
      background: #f8f9fa;
      border-color: #d0d5db;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .btn-secondary:active:not(:disabled) {
      background: var(--color-bg-tertiary);
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-top: var(--space-md);
      padding-top: var(--space-md);
      border-top: 1px solid var(--color-border-light);
    }

    /* Two columns for compact fields */
    .form-row-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .help-text {
      font-size: 12px;
      color: var(--color-text-muted);
      margin-top: var(--space-xs);
      line-height: 1.5;
    }

    .alert {
      padding: 14px 18px;
      border-radius: var(--radius-md);
      margin-bottom: var(--space-lg);
      font-size: 13px;
      line-height: 1.6;
      border-left: 3px solid;
    }

    .alert-info {
      background: #e8f7ff;
      border-left-color: var(--color-primary);
      color: #0087c7;
    }

    .empty-state {
      text-align: center;
      padding: var(--space-md) 20px;
      color: var(--color-text-muted);
      font-size: 13px;
    }

    /* Keyboard shortcut hint */
    .keyboard-hint {
      display: inline-block;
      padding: 2px 6px;
      background: var(--color-bg-tertiary);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-size: 11px;
      font-family: monospace;
      color: var(--color-text-muted);
      margin-left: 8px;
    }

    /* Tabs Interface */
    .tabs {
      display: flex;
      border-bottom: 1px solid var(--color-border-light);
      margin-bottom: var(--space-md);
      gap: 2px;
      role: tablist;
    }

    .tab {
      padding: var(--space-sm) var(--space-md);
      border: none;
      background: none;
      color: var(--color-text-secondary);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all var(--transition-fast);
      position: relative;
    }

    .tab:hover {
      color: var(--color-primary);
      background: rgba(47, 198, 246, 0.05);
    }

    .tab.active {
      color: var(--color-primary);
      border-bottom-color: var(--color-primary);
    }

    .tab:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: -2px;
      border-radius: var(--radius-sm);
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    /* Character Counter */
    .char-counter {
      position: absolute;
      right: 12px;
      top: 12px;
      font-size: 11px;
      color: var(--color-text-muted);
      pointer-events: none;
      transition: color var(--transition-fast);
    }

    .input-wrapper {
      position: relative;
    }

    .input-wrapper input,
    .input-wrapper textarea {
      padding-right: 70px;
    }

    code {
      background: var(--color-bg-tertiary);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      color: var(--color-primary);
    }

    /* Segmented Control for Body Type */
    .segmented-control {
      display: inline-flex;
      background: var(--color-bg-tertiary);
      border-radius: var(--radius-md);
      padding: 3px;
      gap: 2px;
      margin-bottom: var(--space-md);
      role: radiogroup;
    }

    .segment {
      padding: 6px var(--space-md);
      border: none;
      background: transparent;
      color: var(--color-text-secondary);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }

    .segment:hover {
      background: rgba(47, 198, 246, 0.1);
      color: var(--color-primary);
    }

    .segment.active {
      background: var(--color-bg);
      color: var(--color-primary);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .segment:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: -2px;
    }

    /* Headers as Key-Value Pairs */
    .header-row {
      display: grid;
      grid-template-columns: 1fr 2fr 38px 38px;
      gap: 8px;
      margin-bottom: 8px;
      align-items: start;
    }

    .header-row input {
      margin-bottom: 0;
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
      animation: overlayShow var(--transition-smooth);
    }

    @media (prefers-reduced-motion: reduce) {
      .modal-overlay {
        backdrop-filter: none;
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
      background: var(--color-bg);
      border-radius: var(--radius-xl);
      width: 90vw;
      max-width: 720px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), var(--shadow-lg);
      animation: contentShow var(--transition-smooth);
      will-change: transform;
    }

    .modal-header {
      padding: var(--space-lg) 28px 20px;
      border-bottom: 1px solid var(--color-border-light);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-secondary);
      letter-spacing: -0.2px;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 28px;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }

    .modal-close:hover {
      background: var(--color-bg-tertiary);
      color: #535c69;
    }

    .modal-close:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: -2px;
    }

    .modal-body {
      padding: var(--space-lg) 28px 28px;
      overflow-y: auto;
      overflow-x: hidden;
      flex: 1;
      background: var(--color-bg-secondary);
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
      padding: 11px var(--space-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 13px;
      line-height: 1.5;
      margin-bottom: 20px;
      background: var(--color-bg);
      transition: all var(--transition-fast);
      color: var(--color-text);
      box-shadow: var(--shadow-sm);
    }

    .modal-search:focus {
      outline: none;
      border-color: var(--color-primary);
      background: var(--color-bg);
      box-shadow: var(--shadow-primary);
    }

    .modal-search::placeholder {
      color: var(--color-text-muted);
      opacity: 0.8;
    }

    .variable-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--space-sm);
    }

    .variable-item {
      padding: 12px var(--space-md);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      background: var(--color-bg);
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-secondary);
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.04);
      line-height: 1.5;
    }

    .variable-item:hover,
    .variable-item:focus {
      background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      border-color: transparent;
      color: var(--color-bg);
      transform: translateY(-2px);
      box-shadow: 0 0 0 1px rgba(47, 198, 246, 0.3), 0 4px 6px -1px rgba(47, 198, 246, 0.3);
    }

    .variable-item:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    .variable-item:active {
      transform: translateY(0);
      box-shadow: 0 0 0 1px rgba(47, 198, 246, 0.3), 0 2px 4px rgba(47, 198, 246, 0.3);
    }

    .no-variables {
      text-align: center;
      padding: 60px 20px;
      color: var(--color-text-muted);
      font-size: 14px;
    }
  </style>
</head>
<body>
  <script>window.__SAVED_CONFIG__ = ${JSON.stringify(savedConfig)};</script>
  <div class="container">
    <form id="configForm" action="javascript:void(0);" onsubmit="return false;">
      <!-- Hidden inputs removed - not needed for onSave event pattern -->

      <!-- Tabs Navigation -->
      <div class="tabs" role="tablist" aria-label="Request configuration sections">
        <button type="button" class="tab active" onclick="switchTab('request')" role="tab" aria-selected="true" aria-controls="tab-request" id="tab-btn-request">Request</button>
        <button type="button" class="tab" onclick="switchTab('headers')" role="tab" aria-selected="false" aria-controls="tab-headers" id="tab-btn-headers">Headers</button>
        <button type="button" class="tab" onclick="switchTab('body')" role="tab" aria-selected="false" aria-controls="tab-body" id="tab-btn-body">Body</button>
        <button type="button" class="tab" onclick="switchTab('auth')" role="tab" aria-selected="false" aria-controls="tab-auth" id="tab-btn-auth">Authorization</button>
      </div>

      <!-- Request Tab -->
      <div id="tab-request" class="tab-content active" role="tabpanel" aria-labelledby="tab-btn-request">
        <div class="form-group">
          <label for="url">URL *</label>
          <div class="input-wrapper">
            <input type="text" id="url" placeholder="https://api.example.com/endpoint" required maxlength="2000" oninput="updateCharCounter(this, 'url-counter'); saveToPlacement();" aria-describedby="url-help" aria-required="true">
            <span id="url-counter" class="char-counter" aria-live="polite">0/2000</span>
          </div>
          <button type="button" class="btn-dots" onclick="showVariablePicker('url')" title="Insert variable" aria-label="Insert variable into URL" style="position: absolute; right: 24px; margin-top: -38px;">⋯</button>
          <div class="help-text" id="url-help">Target URL for the HTTP request</div>
        </div>

        <div class="form-row-2col">
          <div class="form-group">
            <label for="method">HTTP Method *</label>
            <select id="method" required onchange="saveToPlacement()">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div class="form-group">
            <label for="timeout">Timeout (ms)</label>
            <input type="number" id="timeout" value="30000" min="1000" max="300000" onchange="saveToPlacement()">
          </div>
        </div>
      </div>

      <!-- Headers Tab -->
      <div id="tab-headers" class="tab-content">
        <div class="form-data-section">
          <div class="form-data-header">
            <h3>Request Headers</h3>
            <button type="button" class="btn btn-primary" onclick="addHeaderRow()">+ Add Header</button>
          </div>

          <div id="headersContainer">
            <div class="empty-state">
              Click "+ Add Header" to add request headers
            </div>
          </div>
        </div>
      </div>

      <!-- Body Tab -->
      <div id="tab-body" class="tab-content">
        <div class="form-group">
          <label>Body Type</label>
          <div class="segmented-control">
            <button type="button" class="segment active" onclick="switchBodyType('none')">None</button>
            <button type="button" class="segment" onclick="switchBodyType('form-data')">Form Data</button>
            <button type="button" class="segment" onclick="switchBodyType('raw')">Raw</button>
          </div>
        </div>

        <!-- Form Data Section -->
        <div id="body-form-data" class="body-section" style="display: none;">
          <div class="form-data-section">
            <div class="form-data-header">
              <h3>Form Data Fields</h3>
              <button type="button" class="btn btn-primary" onclick="addFormDataRow()">+ Add Field</button>
            </div>

            <div id="formDataContainer">
              <div class="empty-state">
                Click "+ Add Field" to add form data fields
              </div>
            </div>
          </div>
        </div>

        <!-- Raw Body Section -->
        <div id="body-raw" class="body-section" style="display: none;">
          <div class="form-group">
            <label for="rawBody">Raw Body Content</label>
            <div class="input-wrapper">
              <textarea id="rawBody" placeholder='{"key": "value"} or any raw content' rows="4" maxlength="10000" oninput="updateCharCounter(this, 'rawBody-counter'); saveToPlacement();"></textarea>
              <span id="rawBody-counter" class="char-counter">0/10000</span>
            </div>
            <button type="button" class="btn-dots" onclick="showVariablePicker('rawBody')" title="Insert variable" style="position: absolute; right: 24px; margin-top: -94px;">⋯</button>
            <div class="help-text">JSON, XML, or any raw body content</div>
          </div>
        </div>
      </div>

      <!-- Authorization Tab -->
      <div id="tab-auth" class="tab-content">
        <div class="form-group">
          <label for="authType">Authorization Type</label>
          <select id="authType" onchange="switchAuthType(this.value); saveToPlacement();">
            <option value="none">No Auth</option>
            <option value="bearer">Bearer Token</option>
            <option value="basic">Basic Auth</option>
            <option value="api-key">API Key</option>
          </select>
        </div>

        <!-- Bearer Token -->
        <div id="auth-bearer" class="auth-section" style="display: none;">
          <div class="form-group">
            <label for="bearerToken">Bearer Token</label>
            <div class="input-with-button">
              <div class="input-wrapper">
                <input type="text" id="bearerToken" placeholder="Enter token" maxlength="500" oninput="updateCharCounter(this, 'bearer-counter'); saveToPlacement();">
                <span id="bearer-counter" class="char-counter">0/500</span>
              </div>
              <button type="button" class="btn-dots" onclick="showVariablePicker('bearerToken')" title="Insert variable">⋯</button>
            </div>
          </div>
        </div>

        <!-- Basic Auth -->
        <div id="auth-basic" class="auth-section" style="display: none;">
          <div class="form-group">
            <label for="basicUsername">Username</label>
            <div class="input-with-button">
              <input type="text" id="basicUsername" placeholder="Username" oninput="saveToPlacement()">
              <button type="button" class="btn-dots" onclick="showVariablePicker('basicUsername')" title="Insert variable">⋯</button>
            </div>
          </div>
          <div class="form-group">
            <label for="basicPassword">Password</label>
            <div class="input-with-button">
              <input type="password" id="basicPassword" placeholder="Password" oninput="saveToPlacement()">
              <button type="button" class="btn-dots" onclick="showVariablePicker('basicPassword')" title="Insert variable">⋯</button>
            </div>
          </div>
        </div>

        <!-- API Key -->
        <div id="auth-api-key" class="auth-section" style="display: none;">
          <div class="form-group">
            <label for="apiKeyName">Key Name</label>
            <input type="text" id="apiKeyName" placeholder="e.g., X-API-Key, api_key" oninput="saveToPlacement()">
          </div>
          <div class="form-group">
            <label for="apiKeyValue">Key Value</label>
            <div class="input-with-button">
              <div class="input-wrapper">
                <input type="text" id="apiKeyValue" placeholder="Enter API key" maxlength="500" oninput="updateCharCounter(this, 'apikey-counter'); saveToPlacement();">
                <span id="apikey-counter" class="char-counter">0/500</span>
              </div>
              <button type="button" class="btn-dots" onclick="showVariablePicker('apiKeyValue')" title="Insert variable">⋯</button>
            </div>
          </div>
          <div class="form-group">
            <label for="apiKeyLocation">Add to</label>
            <select id="apiKeyLocation" onchange="saveToPlacement()">
              <option value="header">Header</option>
              <option value="query">Query Parameter</option>
            </select>
          </div>
        </div>
      </div>

      <div class="actions">
        <span class="help-text" style="flex: 1; align-self: center;">Configuration is auto-saved. Click Bitrix's "SAVE" button to finish.</span>
        <button type="button" class="btn btn-secondary" onclick="BX24.closeApplication()" aria-label="Cancel and close">
          Cancel
          <span class="keyboard-hint">Esc</span>
        </button>
      </div>
    </form>
  </div>

  <!-- Variable Picker Modal -->
  <div class="modal-overlay" id="variableModal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modal-title">Insert Variable</h3>
        <button class="modal-close" onclick="closeVariablePicker()" aria-label="Close modal">×</button>
      </div>
      <div class="modal-body">
        <input type="text" class="modal-search" id="variableSearch" placeholder="Search fields..." onkeyup="filterVariables()" aria-label="Search variables">
        <ul class="variable-list" id="variableList" role="list"></ul>
      </div>
    </div>
  </div>

  <script>
    let formDataRows = [];
    let headerRows = [];
    let placementData = null;
    let availableVariables = [];
    let currentBodyType = 'none';
    let currentAuthType = 'none';

    // Tab switching with ARIA support
    function switchTab(tabName) {
      // Update tab buttons
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      });
      const activeTab = event.target;
      activeTab.classList.add('active');
      activeTab.setAttribute('aria-selected', 'true');

      // Update tab content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      const activeContent = document.getElementById('tab-' + tabName);
      activeContent.classList.add('active');

      // Focus first input in the activated tab
      setTimeout(() => {
        const firstInput = activeContent.querySelector('input, select, textarea');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }

    // Character counter
    function updateCharCounter(input, counterId) {
      const counter = document.getElementById(counterId);
      if (!counter) return;
      const current = input.value.length;
      const max = input.maxLength;
      counter.textContent = current + '/' + max;

      // Color coding
      if (current > max * 0.9) {
        counter.style.color = '#ff5c5c';
      } else if (current > max * 0.7) {
        counter.style.color = '#ff9f43';
      } else {
        counter.style.color = '#a8adb4';
      }
    }

    // Switch body type
    function switchBodyType(type) {
      currentBodyType = type;

      // Update segments
      document.querySelectorAll('.segment').forEach(seg => seg.classList.remove('active'));
      event.target.classList.add('active');

      // Show/hide sections
      document.getElementById('body-form-data').style.display = type === 'form-data' ? 'block' : 'none';
      document.getElementById('body-raw').style.display = type === 'raw' ? 'block' : 'none';

      saveToPlacement();
    }

    // Switch auth type
    function switchAuthType(type) {
      currentAuthType = type;

      // Hide all auth sections
      document.querySelectorAll('.auth-section').forEach(section => {
        section.style.display = 'none';
      });

      // Show selected section
      if (type !== 'none') {
        var section = document.getElementById('auth-' + type);
        if (section) section.style.display = 'block';
      }
    }

    // Note: saveToPlacement is called from the onchange handler on authType select

    // Add header row
    function addHeaderRow(key = '', value = '') {
      const container = document.getElementById('headersContainer');

      // Remove empty state message
      if (headerRows.length === 0) {
        container.innerHTML = '';
      }

      const rowId = 'header_' + Date.now();
      const row = {
        id: rowId,
        key: key,
        value: value
      };

      headerRows.push(row);

      const rowHtml = \`
        <div class="header-row" id="\${rowId}">
          <input type="text" placeholder="Header Name" value="\${key}" onchange="updateHeaderRow('\${rowId}', 'key', this.value); saveToPlacement();" oninput="updateHeaderRow('\${rowId}', 'key', this.value); saveToPlacement();">
          <input type="text" placeholder="Header Value" value="\${value}" id="header_val_\${rowId}" onchange="updateHeaderRow('\${rowId}', 'value', this.value); saveToPlacement();" oninput="updateHeaderRow('\${rowId}', 'value', this.value); saveToPlacement();">
          <button type="button" class="btn-dots" onclick="showVariablePicker('header_val_\${rowId}')" title="Insert variable">⋯</button>
          <button type="button" class="btn btn-danger" onclick="removeHeaderRow('\${rowId}')" title="Remove">×</button>
        </div>
      \`;

      container.insertAdjacentHTML('beforeend', rowHtml);
    }

    // Update header row
    function updateHeaderRow(rowId, field, value) {
      const row = headerRows.find(r => r.id === rowId);
      if (row) {
        row[field] = value;
      }
    }

    // Remove header row
    function removeHeaderRow(rowId) {
      const element = document.getElementById(rowId);
      if (element) {
        element.remove();
      }

      headerRows = headerRows.filter(r => r.id !== rowId);

      // Show empty state if no rows
      if (headerRows.length === 0) {
        document.getElementById('headersContainer').innerHTML =
          '<div class="empty-state">Click "+ Add Header" to add request headers</div>';
      }

      saveToPlacement();
    }

    // Keyboard shortcuts handler
    document.addEventListener('keydown', function(e) {
      // Cmd/Ctrl + S - prevent default (auto-saved)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
      }

      // Escape to cancel/close
      if (e.key === 'Escape') {
        // Close modal if open
        const modal = document.getElementById('variableModal');
        if (modal && modal.classList.contains('active')) {
          closeVariablePicker();
        } else {
          // Otherwise close the application
          BX24.closeApplication();
        }
      }

      // Trap focus in modal when open
      if (e.key === 'Tab') {
        const modal = document.getElementById('variableModal');
        if (modal && modal.classList.contains('active')) {
          trapFocusInModal(e, modal);
        }
      }
    });

    // Trap focus within modal for accessibility
    function trapFocusInModal(e, modal) {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }

    // Initialize Bitrix24 App
    BX24.init(function() {
      console.log('Bitrix24 initialized');

      // Get placement info and available interface
      placementData = BX24.placement.info();
      console.log('Placement data:', placementData);

      // No event binding needed - setPropertyValue will be called on form submit

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

      // Initialize character counters
      setTimeout(function() {
        updateCharCounter(document.getElementById('url'), 'url-counter');
        updateCharCounter(document.getElementById('rawBody'), 'rawBody-counter');
      }, 100);
    });

    // Load configuration from server-injected data or fallback to client-side
    function loadConfiguration() {
      // Try server-injected config first (most reliable)
      let config = window.__SAVED_CONFIG__;

      // Fallback: try client-side placement info
      if (!config) {
        try {
          const placementOptions = BX24.placement.info();
          console.log('Fallback: placement info:', placementOptions);
          if (placementOptions.options && placementOptions.options.current_values && placementOptions.options.current_values.config) {
            config = JSON.parse(placementOptions.options.current_values.config);
          }
        } catch (e) {
          console.warn('Fallback placement info failed:', e);
        }
      }

      if (!config) {
        console.log('No saved config found - first open');
        return;
      }

      console.log('Loading saved config:', config);

      try {
        if (config.url) document.getElementById('url').value = config.url;
        if (config.method) document.getElementById('method').value = config.method;
        if (config.timeout) document.getElementById('timeout').value = config.timeout;

        // Load headers
        if (config.headers && Array.isArray(config.headers)) {
          config.headers.forEach(header => {
            addHeaderRow(header.key, header.value);
          });
        }

        // Load body type and data
        if (config.bodyType && config.bodyType !== 'none') {
          currentBodyType = config.bodyType;
          var segments = document.querySelectorAll('.segment');
          segments.forEach(function(seg) {
            seg.classList.remove('active');
            if (seg.textContent.toLowerCase().replace(' ', '-') === config.bodyType) {
              seg.classList.add('active');
            }
          });

          // Show/hide body sections properly
          document.getElementById('body-form-data').style.display = config.bodyType === 'form-data' ? 'block' : 'none';
          document.getElementById('body-raw').style.display = config.bodyType === 'raw' ? 'block' : 'none';

          if (config.bodyType === 'form-data' && config.formData) {
            config.formData.forEach(function(row) {
              addFormDataRow(row.key, row.value);
            });
          } else if (config.bodyType === 'raw') {
            document.getElementById('rawBody').value = config.rawBody || '';
          }
        }

        // Load auth
        if (config.authType) {
          document.getElementById('authType').value = config.authType;
          switchAuthType(config.authType);

          if (config.authType === 'bearer' && config.bearerToken) {
            document.getElementById('bearerToken').value = config.bearerToken;
          } else if (config.authType === 'basic') {
            if (config.basicUsername) document.getElementById('basicUsername').value = config.basicUsername;
            if (config.basicPassword) document.getElementById('basicPassword').value = config.basicPassword;
          } else if (config.authType === 'api-key') {
            if (config.apiKeyName) document.getElementById('apiKeyName').value = config.apiKeyName;
            if (config.apiKeyValue) document.getElementById('apiKeyValue').value = config.apiKeyValue;
            if (config.apiKeyLocation) document.getElementById('apiKeyLocation').value = config.apiKeyLocation;
          }
        }
      } catch (e) {
        console.error('Error loading config:', e);
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
          <input type="text" placeholder="Key" value="\${key}" onchange="updateFormDataRow('\${rowId}', 'key', this.value); saveToPlacement();" oninput="updateFormDataRow('\${rowId}', 'key', this.value); saveToPlacement();">
          <input type="text" placeholder="Value (can use {{Document:FIELD}})" value="\${value}" id="formdata_\${rowId}" onchange="updateFormDataRow('\${rowId}', 'value', this.value); saveToPlacement();" oninput="updateFormDataRow('\${rowId}', 'value', this.value); saveToPlacement();">
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

      saveToPlacement();
    }

    let currentFieldId = null;
    let previouslyFocusedElement = null;

    // Show variable picker
    function showVariablePicker(fieldId) {
      currentFieldId = fieldId;
      previouslyFocusedElement = document.activeElement;
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
        listContainer.innerHTML = '<div class="no-variables" role="status">No variables found</div>';
        return;
      }

      listContainer.innerHTML = variables.map(v => \`
        <li class="variable-item"
            onclick="selectVariable('\${v.template}')"
            onkeydown="if(event.key==='Enter' || event.key===' '){event.preventDefault();selectVariable('\${v.template}');}"
            title="\${v.template}"
            tabindex="0"
            role="button"
            aria-label="Insert variable \${v.name}">
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

      // Restore focus to previously focused element
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
        previouslyFocusedElement = null;
      }
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

        saveToPlacement();
      }
    }

    // Form validation
    function validateForm() {
      let isValid = true;
      const urlInput = document.getElementById('url');

      // Clear previous errors
      document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      document.querySelectorAll('.error-message').forEach(el => el.classList.remove('visible'));

      // Validate URL
      if (!urlInput.value.trim()) {
        showError(urlInput, 'URL is required');
        isValid = false;
      } else if (!isValidUrl(urlInput.value.trim())) {
        showError(urlInput, 'Please enter a valid URL (must start with http:// or https://)');
        isValid = false;
      }

      return isValid;
    }

    function isValidUrl(string) {
      try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch (_) {
        return false;
      }
    }

    function showError(input, message) {
      input.classList.add('error');

      // Create or update error message
      let errorEl = input.parentElement.querySelector('.error-message');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.setAttribute('role', 'alert');
        input.parentElement.appendChild(errorEl);
      }

      errorEl.textContent = message;
      errorEl.classList.add('visible');

      // Focus the invalid field
      input.focus();
    }

    // Helper function to get current configuration
    function getCurrentConfig() {
      return {
        url: document.getElementById('url').value,
        method: document.getElementById('method').value,
        timeout: document.getElementById('timeout').value,

        // Headers
        headers: headerRows.map(row => ({
          key: row.key,
          value: row.value
        })).filter(row => row.key),

        // Body
        bodyType: currentBodyType,
        formData: currentBodyType === 'form-data' ? formDataRows.map(row => ({
          key: row.key,
          value: row.value
        })).filter(row => row.key) : [],
        rawBody: currentBodyType === 'raw' ? document.getElementById('rawBody').value : '',

        // Auth
        authType: currentAuthType,
        bearerToken: currentAuthType === 'bearer' ? document.getElementById('bearerToken').value : '',
        basicUsername: currentAuthType === 'basic' ? document.getElementById('basicUsername').value : '',
        basicPassword: currentAuthType === 'basic' ? document.getElementById('basicPassword').value : '',
        apiKeyName: currentAuthType === 'api-key' ? document.getElementById('apiKeyName').value : '',
        apiKeyValue: currentAuthType === 'api-key' ? document.getElementById('apiKeyValue').value : '',
        apiKeyLocation: currentAuthType === 'api-key' ? document.getElementById('apiKeyLocation').value : 'header'
      };
    }

    // Debounced auto-save to placement on every input change
    var saveTimeout = null;
    function saveToPlacement() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(function() {
        var config = getCurrentConfig();
        var configString = JSON.stringify(config);
        console.log('Auto-saving config to placement:', config);
        BX24.placement.call('setPropertyValue', {
          config: configString
        });
        console.log('setPropertyValue called with config');
      }, 300);
    }
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
