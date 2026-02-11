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
        // Save for debug endpoint
        req.app.locals.lastPlacementOptions = options;
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
    /* B24UI Design Tokens - aligned with https://bitrix24.github.io/b24ui */
    :root {
      /* Colors */
      --color-primary: #0075ff;
      --color-primary-dark: #0062d6;
      --color-primary-darker: #0050b3;
      --color-danger: #ff5752;
      --color-danger-dark: #e64940;
      --color-danger-darker: #cc3a34;
      --color-warning: #faa72c;
      --color-success: #1bce7b;
      --color-text: #333;
      --color-text-secondary: #525c69;
      --color-text-muted: #a8adb4;
      --color-border: #edeef0;
      --color-border-light: #edeef0;
      --color-bg: #ffffff;
      --color-bg-secondary: #eef2f4;
      --color-bg-tertiary: #f5f7f8;

      /* Spacing */
      --space-xs: 6px;
      --space-sm: 10px;
      --space-md: 16px;
      --space-lg: 24px;
      --space-xl: 32px;

      /* Radius */
      --radius-sm: 4px;
      --radius-md: 6px;
      --radius-lg: 10px;
      --radius-xl: 12px;

      /* Transitions */
      --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
      --transition-smooth: 200ms cubic-bezier(0.16, 1, 0.3, 1);

      /* Shadows */
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.06);
      --shadow-primary: 0 0 0 3px rgba(0, 117, 255, 0.15);
      --shadow-primary-hover: 0 0 0 1px rgba(0, 117, 255, 0.3), 0 4px 6px -1px rgba(0, 117, 255, 0.15);
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
      padding: 7px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 13px;
      line-height: 1.4;
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
      box-shadow: 0 0 0 1px var(--color-danger), 0 0 0 4px rgba(255, 87, 82, 0.1);
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
      width: 32px;
      height: 32px;
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
      box-shadow: 0 0 0 1px var(--color-primary), 0 4px 6px -1px rgba(0, 117, 255, 0.3);
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
      border: none;
      border-radius: 0;
      padding: 0;
      background: none;
      margin-bottom: var(--space-md);
    }

    .form-data-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .form-data-header h3 {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-data-row, .form-data-labels {
      display: grid;
      grid-template-columns: 1fr 2fr 32px 1.2fr 32px;
      gap: 6px;
      margin-bottom: 6px;
      align-items: start;
    }

    .form-data-labels {
      margin-bottom: 2px;
    }

    .form-data-labels span {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .form-data-row .test-data-input {
      background: var(--color-bg-tertiary);
      border-style: dashed;
    }

    .form-data-row .test-data-input:focus {
      background: var(--color-bg);
      border-style: solid;
    }

    .form-data-row input {
      margin-bottom: 0;
    }

    .btn {
      padding: 7px 14px;
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
      box-shadow: 0 0 0 1px rgba(0, 117, 255, 0.1), var(--shadow-sm);
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(180deg, var(--color-primary-dark) 0%, var(--color-primary-darker) 100%);
      box-shadow: var(--shadow-primary-hover), 0 2px 4px -2px rgba(0, 117, 255, 0.15);
      transform: translateY(-1px);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 0 0 1px rgba(0, 117, 255, 0.2), var(--shadow-sm);
    }

    .btn-danger {
      background: linear-gradient(180deg, var(--color-danger) 0%, var(--color-danger-dark) 100%);
      color: white;
      width: 32px;
      height: 32px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      border: none;
      box-shadow: 0 0 0 1px rgba(255, 87, 82, 0.1), var(--shadow-sm);
    }

    .btn-danger:hover:not(:disabled) {
      background: linear-gradient(180deg, var(--color-danger-dark) 0%, var(--color-danger-darker) 100%);
      box-shadow: 0 0 0 1px rgba(255, 87, 82, 0.2), 0 4px 6px -1px rgba(255, 87, 82, 0.3);
      transform: scale(1.05);
    }

    .btn-danger:active:not(:disabled) {
      transform: scale(0.98);
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

    .empty-state {
      text-align: center;
      padding: var(--space-md) 20px;
      color: var(--color-text-muted);
      font-size: 13px;
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
      background: rgba(0, 117, 255, 0.05);
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
      background: rgba(0, 117, 255, 0.1);
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
      grid-template-columns: 1fr 2fr 32px 32px;
      gap: 6px;
      margin-bottom: 6px;
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
      box-shadow: 0 0 0 1px rgba(0, 117, 255, 0.3), 0 4px 6px -1px rgba(0, 117, 255, 0.3);
    }

    .variable-item:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    .variable-item:active {
      transform: translateY(0);
      box-shadow: 0 0 0 1px rgba(0, 117, 255, 0.3), 0 2px 4px rgba(0, 117, 255, 0.3);
    }

    .no-variables {
      text-align: center;
      padding: 60px 20px;
      color: var(--color-text-muted);
      font-size: 14px;
    }

    /* Output Mapping Rows */
    .output-mapping-row {
      display: grid;
      grid-template-columns: auto 1fr 1fr 32px;
      gap: 6px;
      margin-bottom: 6px;
      align-items: start;
    }

    .output-mapping-row input {
      margin-bottom: 0;
    }

    .output-slot-label {
      display: flex;
      align-items: center;
      height: 32px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-primary);
      white-space: nowrap;
      padding: 0 4px;
    }

    /* Test Request Styles */
    .test-warning {
      background: #fff8e1;
      border: 1px solid #ffe082;
      border-left: 3px solid var(--color-warning);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      font-size: 12px;
      color: #8d6e00;
      line-height: 1.5;
      margin-bottom: var(--space-md);
    }

    .status-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: -0.1px;
      vertical-align: middle;
    }

    .status-badge.status-2xx {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge.status-3xx {
      background: #fff8e1;
      color: #f57f17;
    }

    .status-badge.status-4xx,
    .status-badge.status-5xx {
      background: #ffebee;
      color: #c62828;
    }

    .test-exec-time {
      font-size: 11px;
      color: var(--color-text-muted);
      vertical-align: middle;
      margin-left: 6px;
    }

    .response-body-pre {
      background: var(--color-bg-tertiary);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      padding: var(--space-md);
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.6;
      overflow-x: auto;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
      color: var(--color-text);
    }

    .test-error {
      background: #ffebee;
      border: 1px solid #ffcdd2;
      border-left: 3px solid var(--color-danger);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      font-size: 12px;
      color: #c62828;
      line-height: 1.5;
    }

    .btn-test {
      background: linear-gradient(180deg, var(--color-success) 0%, #17b86d 100%);
      color: white;
      box-shadow: 0 0 0 1px rgba(27, 206, 123, 0.1), var(--shadow-sm);
    }

    .btn-test:hover:not(:disabled) {
      background: linear-gradient(180deg, #17b86d 0%, #14a562 100%);
      box-shadow: 0 0 0 1px rgba(27, 206, 123, 0.2), 0 4px 6px -1px rgba(27, 206, 123, 0.3);
      transform: translateY(-1px);
    }

    .btn-test:active:not(:disabled) {
      transform: translateY(0);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .btn-loading .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      vertical-align: middle;
      margin-right: 6px;
    }

    /* Interactive JSON */
    .json-interactive {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.6;
    }

    .json-key { color: #7c3aed; }
    .json-string { color: #16a34a; }
    .json-number { color: #2563eb; }
    .json-bool { color: #ea580c; }
    .json-null { color: #9ca3af; font-style: italic; }
    .json-bracket { color: var(--color-text-muted); }

    .json-clickable {
      cursor: pointer;
      border-radius: 3px;
      padding: 0 2px;
      transition: background var(--transition-fast);
    }

    .json-clickable:hover {
      background: rgba(0, 117, 255, 0.15);
    }

    @keyframes flashAdded {
      0% { background: rgba(22, 163, 74, 0.3); }
      100% { background: transparent; }
    }

    .json-clickable-added {
      animation: flashAdded 0.8s ease-out;
    }

    /* Inline Mapping Preview */
    .mapping-preview {
      grid-column: 2 / -1;
      font-size: 11px;
      font-family: 'Monaco', 'Courier New', monospace;
      color: var(--color-text-muted);
      padding: 2px 0 4px 0;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .preview-value { color: #16a34a; }
    .preview-not-found { color: #9ca3af; font-style: italic; }
    .preview-fallback { color: #ea580c; }
  </style>
</head>
<body>
  <script>
    window.__SAVED_CONFIG__ = ${JSON.stringify(savedConfig)};
    window.__HANDLER_URL__ = '${process.env.HANDLER_URL || ''}';
  </script>
  <div class="container">
    <form id="configForm" action="javascript:void(0);" onsubmit="return false;">
      <!-- Hidden inputs removed - not needed for onSave event pattern -->

      <!-- Tabs Navigation -->
      <div class="tabs" role="tablist" aria-label="Request configuration sections">
        <button type="button" class="tab active" onclick="switchTab('request')" role="tab" aria-selected="true" aria-controls="tab-request" id="tab-btn-request">Request</button>
        <button type="button" class="tab" onclick="switchTab('headers')" role="tab" aria-selected="false" aria-controls="tab-headers" id="tab-btn-headers">Headers</button>
        <button type="button" class="tab" onclick="switchTab('body')" role="tab" aria-selected="false" aria-controls="tab-body" id="tab-btn-body">Body</button>
        <button type="button" class="tab" onclick="switchTab('auth')" role="tab" aria-selected="false" aria-controls="tab-auth" id="tab-btn-auth">Authorization</button>
        <button type="button" class="tab" onclick="switchTab('response')" role="tab" aria-selected="false" aria-controls="tab-response" id="tab-btn-response">Response</button>
      </div>

      <!-- Request Tab -->
      <div id="tab-request" class="tab-content active" role="tabpanel" aria-labelledby="tab-btn-request">
        <div class="form-group">
          <label for="url">URL *</label>
          <div class="input-wrapper">
            <input type="text" id="url" placeholder="https://api.example.com/endpoint" required maxlength="2000" oninput="updateCharCounter(this, 'url-counter'); saveToPlacement();" onchange="flushSave();" aria-describedby="url-help" aria-required="true">
            <span id="url-counter" class="char-counter" aria-live="polite">0/2000</span>
          </div>
          <button type="button" class="btn-dots" onclick="showVariablePicker('url')" title="Insert variable" aria-label="Insert variable into URL" style="position: absolute; right: 24px; margin-top: -38px;">⋯</button>
          <div class="help-text" id="url-help">Target URL for the HTTP request</div>
        </div>

        <div class="form-row-2col">
          <div class="form-group">
            <label for="method">HTTP Method *</label>
            <select id="method" required onchange="flushSave()">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div class="form-group">
            <label for="timeout">Timeout (ms)</label>
            <input type="number" id="timeout" value="30000" min="1000" max="300000" onchange="flushSave()">
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

            <div id="formDataLabels" class="form-data-labels" style="display: none;">
              <span>Key</span>
              <span>Value</span>
              <span></span>
              <span>Test Data</span>
              <span></span>
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
              <textarea id="rawBody" placeholder='{"key": "value"} or any raw content' rows="4" maxlength="10000" oninput="updateCharCounter(this, 'rawBody-counter'); saveToPlacement();" onchange="flushSave();"></textarea>
              <span id="rawBody-counter" class="char-counter">0/10000</span>
            </div>
            <button type="button" class="btn-dots" onclick="showVariablePicker('rawBody')" title="Insert variable" style="position: absolute; right: 24px; margin-top: -94px;">⋯</button>
            <div class="help-text">JSON, XML, or any raw body content</div>
          </div>
          <div class="form-group">
            <label for="rawBodyTestData">Test Data <span style="font-weight: 400; color: var(--color-text-muted); font-size: 12px;">— used instead of above when testing</span></label>
            <div class="input-wrapper">
              <textarea id="rawBodyTestData" class="test-data-input" placeholder='Test body with real values (replaces raw body during test)' rows="3" maxlength="10000" oninput="updateCharCounter(this, 'rawBodyTest-counter'); saveToPlacement();" onchange="flushSave();" style="border-style: dashed; background: var(--color-bg-tertiary);"></textarea>
              <span id="rawBodyTest-counter" class="char-counter">0/10000</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Authorization Tab -->
      <div id="tab-auth" class="tab-content">
        <div class="form-group">
          <label for="authType">Authorization Type</label>
          <select id="authType" onchange="switchAuthType(this.value); flushSave();">
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
                <input type="text" id="bearerToken" placeholder="Enter token" maxlength="500" oninput="updateCharCounter(this, 'bearer-counter'); saveToPlacement();" onchange="flushSave();">
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
              <input type="text" id="basicUsername" placeholder="Username" oninput="saveToPlacement()" onchange="flushSave()">
              <button type="button" class="btn-dots" onclick="showVariablePicker('basicUsername')" title="Insert variable">⋯</button>
            </div>
          </div>
          <div class="form-group">
            <label for="basicPassword">Password</label>
            <div class="input-with-button">
              <input type="password" id="basicPassword" placeholder="Password" oninput="saveToPlacement()" onchange="flushSave()">
              <button type="button" class="btn-dots" onclick="showVariablePicker('basicPassword')" title="Insert variable">⋯</button>
            </div>
          </div>
        </div>

        <!-- API Key -->
        <div id="auth-api-key" class="auth-section" style="display: none;">
          <div class="form-group">
            <label for="apiKeyName">Key Name</label>
            <input type="text" id="apiKeyName" placeholder="e.g., X-API-Key, api_key" oninput="saveToPlacement()" onchange="flushSave()">
          </div>
          <div class="form-group">
            <label for="apiKeyValue">Key Value</label>
            <div class="input-with-button">
              <div class="input-wrapper">
                <input type="text" id="apiKeyValue" placeholder="Enter API key" maxlength="500" oninput="updateCharCounter(this, 'apikey-counter'); saveToPlacement();" onchange="flushSave();">
                <span id="apikey-counter" class="char-counter">0/500</span>
              </div>
              <button type="button" class="btn-dots" onclick="showVariablePicker('apiKeyValue')" title="Insert variable">⋯</button>
            </div>
          </div>
          <div class="form-group">
            <label for="apiKeyLocation">Add to</label>
            <select id="apiKeyLocation" onchange="flushSave()">
              <option value="header">Header</option>
              <option value="query">Query Parameter</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Response Tab -->
      <div id="tab-response" class="tab-content" role="tabpanel" aria-labelledby="tab-btn-response">
        <!-- Test Request Section (top) -->
        <div class="form-data-section">
          <div class="form-data-header">
            <h3>Test Request <span id="testStatusBadge" class="status-badge" style="display:none;"></span><span id="testExecTime" class="test-exec-time"></span></h3>
            <button type="button" class="btn btn-test" onclick="sendTestRequest()" id="testRequestBtn">
              &#9654; Send Test
            </button>
          </div>

          <div id="testVariableWarning" class="test-warning" style="display:none;">
            &#9888; Config contains Bitrix variables (e.g. {=Document:...}). In test mode, variables are sent as literal strings — they are only resolved when the robot runs in a real workflow.
          </div>

          <div id="testResultsPanel" style="display:none;">
            <div id="testClickHint" class="help-text" style="display:none; margin-bottom:6px;">Click a value to add output mapping</div>
            <pre class="response-body-pre" id="testResponseBody"></pre>
            <div id="testErrorPanel" style="display:none;" class="test-error"></div>
          </div>
        </div>

        <!-- Output Mapping Section (bottom) -->
        <div class="form-data-section" style="margin-top: 12px;">
          <div class="form-data-header">
            <h3>Output Mapping</h3>
            <button type="button" class="btn btn-primary" onclick="addOutputMappingRow()" id="addOutputMappingBtn">+ Add Mapping</button>
          </div>

          <div id="outputMappingsContainer">
            <div class="empty-state">
              Send a test request, then click on JSON values to add mappings.
            </div>
          </div>
        </div>
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
    let outputMappingRows = [];
    let placementData = null;
    let availableVariables = [];
    let currentBodyType = 'none';
    let currentAuthType = 'none';
    const MAX_OUTPUT_MAPPINGS = 5;

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

      flushSave();
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
          <input type="text" placeholder="Header Name" value="\${key}" onchange="updateHeaderRow('\${rowId}', 'key', this.value); flushSave();" oninput="updateHeaderRow('\${rowId}', 'key', this.value); saveToPlacement();">
          <input type="text" placeholder="Header Value" value="\${value}" id="header_val_\${rowId}" onchange="updateHeaderRow('\${rowId}', 'value', this.value); flushSave();" oninput="updateHeaderRow('\${rowId}', 'value', this.value); saveToPlacement();">
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

      flushSave();
    }

    // --- Output Mapping functions ---

    function getNextOutputSlot() {
      var usedSlots = outputMappingRows.map(function(r) { return r.output; });
      for (var i = 1; i <= MAX_OUTPUT_MAPPINGS; i++) {
        if (usedSlots.indexOf('output_' + i) === -1) return 'output_' + i;
      }
      return null;
    }

    function addOutputMappingRow(path, output, fallback) {
      if (!output) {
        output = getNextOutputSlot();
      }
      if (!output) return; // all 5 slots used

      path = path || '';
      fallback = fallback || '';

      var container = document.getElementById('outputMappingsContainer');

      // Remove empty state
      if (outputMappingRows.length === 0) {
        container.innerHTML = '';
      }

      var rowId = 'omap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      var slotNum = output.replace('output_', '');

      outputMappingRows.push({ id: rowId, path: path, output: output, fallback: fallback });

      var rowHtml =
        '<div class="output-mapping-row" id="' + rowId + '">' +
          '<span class="output-slot-label">Output ' + slotNum + '</span>' +
          '<input type="text" placeholder="JSON path (e.g. data.order_id)" value="' + escapeAttr(path) + '" ' +
            'oninput="updateOutputMapping(\\'' + rowId + '\\', \\'path\\', this.value); saveToPlacement(); updateMappingPreviews();" ' +
            'onchange="updateOutputMapping(\\'' + rowId + '\\', \\'path\\', this.value); flushSave();">' +
          '<input type="text" placeholder="Fallback" value="' + escapeAttr(fallback) + '" ' +
            'oninput="updateOutputMapping(\\'' + rowId + '\\', \\'fallback\\', this.value); saveToPlacement(); updateMappingPreviews();" ' +
            'onchange="updateOutputMapping(\\'' + rowId + '\\', \\'fallback\\', this.value); flushSave();">' +
          '<button type="button" class="btn btn-danger" onclick="removeOutputMappingRow(\\'' + rowId + '\\')" title="Remove">×</button>' +
        '</div>';

      container.insertAdjacentHTML('beforeend', rowHtml);
      updateAddMappingButton();
    }

    function escapeAttr(str) {
      return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function updateOutputMapping(rowId, field, value) {
      var row = outputMappingRows.find(function(r) { return r.id === rowId; });
      if (row) row[field] = value;
    }

    function removeOutputMappingRow(rowId) {
      // Also remove the preview element right after the row
      var el = document.getElementById(rowId);
      if (el) {
        var next = el.nextElementSibling;
        if (next && next.classList.contains('mapping-preview')) next.remove();
        el.remove();
      }
      outputMappingRows = outputMappingRows.filter(function(r) { return r.id !== rowId; });

      if (outputMappingRows.length === 0) {
        document.getElementById('outputMappingsContainer').innerHTML =
          '<div class="empty-state">Send a test request above, then click on JSON values to add mappings — or click "+ Add Mapping" to add manually.</div>';
      }

      updateAddMappingButton();
      updateMappingPreviews();
      flushSave();
    }

    function updateAddMappingButton() {
      var btn = document.getElementById('addOutputMappingBtn');
      if (btn) {
        btn.disabled = outputMappingRows.length >= MAX_OUTPUT_MAPPINGS;
      }
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
              template: '{=Document:' + key + '}'
            }));
          }

          // Get template variables if available
          if (options.template && options.template.variables) {
            Object.keys(options.template.variables).forEach(key => {
              availableVariables.push({
                code: key,
                name: options.template.variables[key].Name || key,
                template: '{=Variable:' + key + '}'
              });
            });
          }

          // Get template parameters if available
          if (options.template && options.template.parameters) {
            Object.keys(options.template.parameters).forEach(key => {
              availableVariables.push({
                code: key,
                name: options.template.parameters[key].Name || key,
                template: '{=Parameter:' + key + '}'
              });
            });
          }

          // Get global constants if available
          if (options.template && options.template.global_constants && Array.isArray(options.template.global_constants)) {
            options.template.global_constants.forEach(function(constant) {
              availableVariables.push({
                code: constant.Id,
                name: '[Const] ' + (constant.Name || constant.Id),
                template: '{=GlobalConst:' + constant.Id + '}'
              });
            });
          }

          // Get global variables if available
          if (options.template && options.template.global_variables && Array.isArray(options.template.global_variables)) {
            options.template.global_variables.forEach(function(variable) {
              availableVariables.push({
                code: variable.Id,
                name: '[GVar] ' + (variable.Name || variable.Id),
                template: '{=GlobalVar:' + variable.Id + '}'
              });
            });
          }

          console.log('Available variables:', availableVariables);
        } catch (e) {
          console.error('Error parsing placement options:', e);
        }
      }

      // Load saved configuration
      // Build display name -> template map for reverse conversion
      buildDisplayNameMap();

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
              addFormDataRow(row.key, row.value, row.testData || '');
            });
          } else if (config.bodyType === 'raw') {
            document.getElementById('rawBody').value = config.rawBody || '';
            document.getElementById('rawBodyTestData').value = config.rawBodyTestData || '';
          }
        }

        // Load output mappings
        if (config.outputMappings && Array.isArray(config.outputMappings)) {
          config.outputMappings.forEach(function(mapping) {
            addOutputMappingRow(mapping.path || '', mapping.output || '', mapping.fallback || '');
          });
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
    function addFormDataRow(key = '', value = '', testData = '') {
      const container = document.getElementById('formDataContainer');

      // Remove empty state message and show labels
      if (formDataRows.length === 0) {
        container.innerHTML = '';
        document.getElementById('formDataLabels').style.display = 'grid';
      }

      const rowId = 'row_' + Date.now();
      const row = {
        id: rowId,
        key: key,
        value: value,
        testData: testData
      };

      formDataRows.push(row);

      const rowHtml = \`
        <div class="form-data-row" id="\${rowId}">
          <input type="text" placeholder="Key" value="\${key}" onchange="updateFormDataRow('\${rowId}', 'key', this.value); flushSave();" oninput="updateFormDataRow('\${rowId}', 'key', this.value); saveToPlacement();">
          <input type="text" placeholder="Value or {=Document:...}" value="\${value}" id="formdata_\${rowId}" onchange="updateFormDataRow('\${rowId}', 'value', this.value); flushSave();" oninput="updateFormDataRow('\${rowId}', 'value', this.value); saveToPlacement();">
          <button type="button" class="btn-dots" onclick="showVariablePicker('formdata_\${rowId}')" title="Insert variable">⋯</button>
          <input type="text" class="test-data-input" placeholder="Test value" value="\${testData}" onchange="updateFormDataRow('\${rowId}', 'testData', this.value); flushSave();" oninput="updateFormDataRow('\${rowId}', 'testData', this.value); saveToPlacement();">
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
        document.getElementById('formDataLabels').style.display = 'none';
      }

      flushSave();
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

      // Default variables if none loaded from placement
      if (availableVariables.length === 0) {
        console.log('No variables loaded from placement, using common defaults');
        availableVariables = [
          { code: 'ID', name: 'ID', template: '{=Document:ID}' },
          { code: 'CRM_ID', name: 'CRM item ID', template: '{=Document:CRM_ID}' },
          { code: 'TITLE', name: 'Lead name / Deal name', template: '{=Document:TITLE}' },
          { code: 'STATUS_ID', name: 'Stage', template: '{=Document:STATUS_ID}' },
          { code: 'ASSIGNED_BY_ID', name: 'Responsible', template: '{=Document:ASSIGNED_BY_ID}' },
          { code: 'NAME', name: 'Name', template: '{=Document:NAME}' },
          { code: 'LAST_NAME', name: 'Last name', template: '{=Document:LAST_NAME}' },
          { code: 'EMAIL', name: 'E-mail', template: '{=Document:EMAIL}' },
          { code: 'PHONE', name: 'Phone', template: '{=Document:PHONE}' },
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

        flushSave();
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
    // Reads directly from DOM to avoid stale JS array state
    function getCurrentConfig() {
      // Read headers directly from DOM
      var headers = [];
      document.querySelectorAll('#headersContainer .header-row').forEach(function(rowEl) {
        var inputs = rowEl.querySelectorAll('input');
        if (inputs.length >= 2 && inputs[0].value.trim()) {
          headers.push({ key: inputs[0].value, value: inputs[1].value });
        }
      });

      // Read form data directly from DOM
      var formData = [];
      if (currentBodyType === 'form-data') {
        document.querySelectorAll('#formDataContainer .form-data-row').forEach(function(rowEl) {
          var inputs = rowEl.querySelectorAll('input');
          if (inputs.length >= 3 && inputs[0].value.trim()) {
            formData.push({ key: inputs[0].value, value: inputs[1].value, testData: inputs[2].value || '' });
          }
        });
      }

      // Read output mappings directly from DOM
      var outputMappings = [];
      document.querySelectorAll('#outputMappingsContainer .output-mapping-row').forEach(function(rowEl) {
        var inputs = rowEl.querySelectorAll('input');
        var slotLabel = rowEl.querySelector('.output-slot-label');
        if (inputs.length >= 2 && inputs[0].value.trim()) {
          var slotNum = slotLabel ? slotLabel.textContent.trim().replace('Output ', '') : '1';
          outputMappings.push({
            path: inputs[0].value,
            fallback: inputs[1].value,
            output: 'output_' + slotNum
          });
        }
      });

      return {
        url: document.getElementById('url').value,
        method: document.getElementById('method').value,
        timeout: document.getElementById('timeout').value,
        headers: headers,
        bodyType: currentBodyType,
        formData: formData,
        rawBody: currentBodyType === 'raw' ? document.getElementById('rawBody').value : '',
        rawBodyTestData: currentBodyType === 'raw' ? document.getElementById('rawBodyTestData').value : '',
        authType: currentAuthType,
        bearerToken: currentAuthType === 'bearer' ? document.getElementById('bearerToken').value : '',
        basicUsername: currentAuthType === 'basic' ? document.getElementById('basicUsername').value : '',
        basicPassword: currentAuthType === 'basic' ? document.getElementById('basicPassword').value : '',
        apiKeyName: currentAuthType === 'api-key' ? document.getElementById('apiKeyName').value : '',
        apiKeyValue: currentAuthType === 'api-key' ? document.getElementById('apiKeyValue').value : '',
        apiKeyLocation: currentAuthType === 'api-key' ? document.getElementById('apiKeyLocation').value : 'header',
        outputMappings: outputMappings
      };
    }

    // Auto-save to placement
    var saveTimeout = null;
    var lastSavedConfig = '';

    // Build reverse map: display name -> {=Document:CODE} template
    // Used to convert Bitrix display names back to bizproc syntax before saving
    var displayNameToTemplate = {};
    function buildDisplayNameMap() {
      availableVariables.forEach(function(v) {
        if (v.name && v.template) {
          displayNameToTemplate[v.name] = v.template;
        }
      });
      console.log('Display name map built:', Object.keys(displayNameToTemplate).length, 'entries');
    }

    // Convert {{Display Name}} back to {=Document:CODE} in a string
    function convertDisplayToTemplate(str) {
      if (!str || typeof str !== 'string') return str;
      return str.replace(/\{\{([^}]+)\}\}/g, function(match, displayName) {
        var trimmed = displayName.trim();
        var template = displayNameToTemplate[trimmed];
        if (template) {
          console.log('Converting:', match, '->', template);
          return template;
        }
        return match; // keep original if no mapping found
      });
    }

    // Convert all string values in config object
    // Skip testData/rawBodyTestData — those contain real test values, not Bitrix templates
    var skipConvertFields = { testData: true, rawBodyTestData: true };
    function convertConfigDisplayNames(config) {
      var converted = {};
      Object.keys(config).forEach(function(key) {
        var val = config[key];
        if (skipConvertFields[key]) {
          converted[key] = val;
        } else if (typeof val === 'string') {
          converted[key] = convertDisplayToTemplate(val);
        } else if (Array.isArray(val)) {
          converted[key] = val.map(function(item) {
            if (typeof item === 'object' && item !== null) {
              var obj = {};
              Object.keys(item).forEach(function(k) {
                obj[k] = (typeof item[k] === 'string' && !skipConvertFields[k]) ? convertDisplayToTemplate(item[k]) : item[k];
              });
              return obj;
            }
            return typeof item === 'string' ? convertDisplayToTemplate(item) : item;
          });
        } else {
          converted[key] = val;
        }
      });
      return converted;
    }

    // Core save function - calls setPropertyValue immediately
    function doSave() {
      var config = getCurrentConfig();

      // Convert any {{Display Name}} back to {=Document:CODE} before saving
      config = convertConfigDisplayNames(config);

      var configString = JSON.stringify(config);

      // Skip if nothing changed
      if (configString === lastSavedConfig) return;

      lastSavedConfig = configString;
      console.log('Saving config to placement:', config);
      BX24.placement.call('setPropertyValue', {
        config: configString
      }, function(result) {
        console.log('setPropertyValue result:', result);
      });
    }

    // Debounced save - for oninput (while typing)
    function saveToPlacement() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(doSave, 150);
    }

    // Immediate save - for onchange (blur/commit) and structural changes
    function flushSave() {
      clearTimeout(saveTimeout);
      doSave();
    }

    // --- Test Request ---

    function sendTestRequest() {
      var config = getCurrentConfig();
      var btn = document.getElementById('testRequestBtn');
      var resultsPanel = document.getElementById('testResultsPanel');
      var warningEl = document.getElementById('testVariableWarning');
      var errorPanel = document.getElementById('testErrorPanel');

      // Validate URL
      if (!config.url || !config.url.trim()) {
        alert('Please enter a URL first.');
        return;
      }

      // Build test config: substitute test data values for actual values
      var testConfig = JSON.parse(JSON.stringify(config));
      if (testConfig.formData && Array.isArray(testConfig.formData)) {
        testConfig.formData = testConfig.formData.map(function(row) {
          return {
            key: row.key,
            value: row.testData ? row.testData : row.value
          };
        });
      }
      // Substitute raw body test data if provided
      if (testConfig.rawBodyTestData && testConfig.rawBodyTestData.trim()) {
        testConfig.rawBody = testConfig.rawBodyTestData;
      }
      delete testConfig.rawBodyTestData;

      // Check for remaining Bitrix variables after test data substitution
      var configStr = JSON.stringify(testConfig);
      var hasVars = /\\{=\\w+:\\w+\\}/.test(configStr);
      warningEl.style.display = hasVars ? 'block' : 'none';

      // Set loading state
      btn.disabled = true;
      btn.classList.add('btn-loading');
      btn.innerHTML = '<span class="spinner"></span> Sending...';
      resultsPanel.style.display = 'none';
      errorPanel.style.display = 'none';

      // Determine base URL
      var baseUrl = window.__HANDLER_URL__ || '';
      if (!baseUrl) {
        // Fallback: derive from current page URL
        var loc = window.location;
        baseUrl = loc.protocol + '//' + loc.host;
      }
      // Remove trailing slash
      baseUrl = baseUrl.replace(/\\/$/, '');

      fetch(baseUrl + '/bitrix-handler/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: testConfig })
      })
      .then(function(resp) { return resp.json(); })
      .then(function(data) {
        resultsPanel.style.display = 'block';
        var badge = document.getElementById('testStatusBadge');
        var timeEl = document.getElementById('testExecTime');

        if (data.success) {
          // Status badge inline with title
          badge.textContent = data.statusCode + ' ' + (data.statusText || '');
          badge.className = 'status-badge';
          badge.style.display = 'inline-block';
          if (data.statusCode >= 200 && data.statusCode < 300) badge.classList.add('status-2xx');
          else if (data.statusCode >= 300 && data.statusCode < 400) badge.classList.add('status-3xx');
          else if (data.statusCode >= 400 && data.statusCode < 500) badge.classList.add('status-4xx');
          else badge.classList.add('status-5xx');

          timeEl.textContent = data.executionTime + 'ms';

          // Response body
          var bodyEl = document.getElementById('testResponseBody');
          var hintEl = document.getElementById('testClickHint');
          if (data.responseBodyParsed) {
            lastTestResponseParsed = data.responseBodyParsed;
            bodyEl.innerHTML = renderInteractiveJson(data.responseBodyParsed);
            hintEl.style.display = 'block';
          } else {
            lastTestResponseParsed = null;
            bodyEl.textContent = data.responseBody || '(empty)';
            hintEl.style.display = 'none';
          }

          updateMappingPreviews();
          errorPanel.style.display = 'none';
        } else {
          lastTestResponseParsed = null;
          clearMappingPreviews();
          document.getElementById('testClickHint').style.display = 'none';
          badge.textContent = 'Error';
          badge.className = 'status-badge status-5xx';
          badge.style.display = 'inline-block';
          timeEl.textContent = data.executionTime ? data.executionTime + 'ms' : '';
          document.getElementById('testResponseBody').textContent = '';
          errorPanel.style.display = 'block';
          errorPanel.textContent = data.error || 'Unknown error';
        }

        if (data.hasVariables) {
          warningEl.style.display = 'block';
        }
      })
      .catch(function(err) {
        lastTestResponseParsed = null;
        clearMappingPreviews();
        document.getElementById('testClickHint').style.display = 'none';
        resultsPanel.style.display = 'block';
        errorPanel.style.display = 'block';
        errorPanel.textContent = 'Network error: ' + err.message;
        var badge = document.getElementById('testStatusBadge');
        badge.textContent = 'Error';
        badge.className = 'status-badge status-5xx';
        badge.style.display = 'inline-block';
        document.getElementById('testExecTime').textContent = '';
        document.getElementById('testResponseBody').textContent = '';
      })
      .finally(function() {
        btn.disabled = false;
        btn.classList.remove('btn-loading');
        btn.innerHTML = '&#9654; Send Test';
      });
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    // --- Interactive JSON rendering ---

    function renderInteractiveJson(obj) {
      return '<div class="json-interactive">' + renderJsonNode(obj, '', 0) + '</div>';
    }

    function renderJsonNode(value, path, indent) {
      var pad = '  '.repeat(indent);
      var pad1 = '  '.repeat(indent + 1);

      if (value === null) {
        return '<span class="json-clickable json-null" data-path="' + escapeAttr(path) + '" onclick="onJsonValueClick(this)">null</span>';
      }

      if (typeof value === 'boolean') {
        return '<span class="json-clickable json-bool" data-path="' + escapeAttr(path) + '" onclick="onJsonValueClick(this)">' + String(value) + '</span>';
      }

      if (typeof value === 'number') {
        return '<span class="json-clickable json-number" data-path="' + escapeAttr(path) + '" onclick="onJsonValueClick(this)">' + String(value) + '</span>';
      }

      if (typeof value === 'string') {
        return '<span class="json-clickable json-string" data-path="' + escapeAttr(path) + '" onclick="onJsonValueClick(this)">"' + escapeHtml(value) + '"</span>';
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return '<span class="json-bracket">[]</span>';
        var items = value.map(function(item, i) {
          var childPath = path ? path + '[' + i + ']' : '[' + i + ']';
          return pad1 + renderJsonNode(item, childPath, indent + 1) + (i < value.length - 1 ? ',' : '');
        });
        return '<span class="json-bracket">[</span>\\n' + items.join('\\n') + '\\n' + pad + '<span class="json-bracket">]</span>';
      }

      if (typeof value === 'object') {
        var keys = Object.keys(value);
        if (keys.length === 0) return '<span class="json-bracket">{}</span>';
        var entries = keys.map(function(key, i) {
          var childPath = path ? path + '.' + key : key;
          return pad1 + '<span class="json-key">"' + escapeHtml(key) + '"</span>: ' + renderJsonNode(value[key], childPath, indent + 1) + (i < keys.length - 1 ? ',' : '');
        });
        return '<span class="json-bracket">{</span>\\n' + entries.join('\\n') + '\\n' + pad + '<span class="json-bracket">}</span>';
      }

      return escapeHtml(String(value));
    }

    function onJsonValueClick(spanEl) {
      var path = spanEl.getAttribute('data-path');
      if (!path) return;

      // Check if path already exists in mapping rows
      var existing = outputMappingRows.find(function(r) { return r.path === path; });
      if (existing) {
        // Flash the existing span to indicate duplicate
        spanEl.classList.remove('json-clickable-added');
        void spanEl.offsetWidth; // trigger reflow
        spanEl.classList.add('json-clickable-added');
        return;
      }

      // Check max slots
      if (outputMappingRows.length >= MAX_OUTPUT_MAPPINGS) return;

      addOutputMappingRow(path);
      flushSave();
      updateMappingPreviews();

      // Flash feedback
      spanEl.classList.add('json-clickable-added');
    }

    // --- Inline value preview ---

    var lastTestResponseParsed = null;

    function extractJsonPathClient(obj, path) {
      if (!obj || !path) return undefined;
      var parts = path.replace(/\\[(\\d+)\\]/g, '.$1').split('.');
      var current = obj;
      for (var i = 0; i < parts.length; i++) {
        if (current === null || current === undefined) return undefined;
        current = current[parts[i]];
      }
      return current;
    }

    function updateMappingPreviews() {
      // Remove old previews
      document.querySelectorAll('.mapping-preview').forEach(function(el) { el.remove(); });

      if (!lastTestResponseParsed) return;

      document.querySelectorAll('#outputMappingsContainer .output-mapping-row').forEach(function(rowEl) {
        var inputs = rowEl.querySelectorAll('input');
        if (inputs.length < 2) return;
        var path = inputs[0].value.trim();
        var fallback = inputs[1].value;

        if (!path) return;

        var value = extractJsonPathClient(lastTestResponseParsed, path);
        var previewEl = document.createElement('div');
        previewEl.className = 'mapping-preview';

        if (value !== undefined) {
          var display = typeof value === 'object' ? JSON.stringify(value) : String(value);
          if (display.length > 80) display = display.substring(0, 80) + '...';
          previewEl.innerHTML = '<span class="preview-value">' + escapeHtml(display) + '</span>';
        } else if (fallback) {
          previewEl.innerHTML = '<span class="preview-fallback">not found, fallback: ' + escapeHtml(fallback) + '</span>';
        } else {
          previewEl.innerHTML = '<span class="preview-not-found">not found</span>';
        }

        rowEl.insertAdjacentElement('afterend', previewEl);
      });
    }

    function clearMappingPreviews() {
      document.querySelectorAll('.mapping-preview').forEach(function(el) { el.remove(); });
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
