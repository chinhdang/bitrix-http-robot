<template>
  <div class="guide">
    <h1 class="page-title">Guide</h1>

    <section class="card">
      <h2>What is SYNITY HTTP Request?</h2>
      <p>
        A custom Bitrix24 automation robot that makes HTTP requests to external APIs and returns
        the response data directly into your business process workflow.
      </p>
    </section>

    <section class="card">
      <h2>Features</h2>
      <ul>
        <li><strong>HTTP Methods</strong> — GET, POST, PUT, PATCH, DELETE</li>
        <li><strong>Authentication</strong> — Bearer token, Basic auth, API key</li>
        <li><strong>Custom Headers</strong> — Add any request headers</li>
        <li><strong>Request Body</strong> — Raw JSON or form data</li>
        <li><strong>Output Mapping</strong> — Extract JSON fields from response using dot-notation paths</li>
        <li><strong>Bitrix Variables</strong> — Use <code>{=Document:FIELD}</code> syntax in any field</li>
      </ul>
    </section>

    <section class="card">
      <h2>Setup Instructions</h2>
      <ol>
        <li>Go to <strong>CRM &rarr; Automation Rules</strong> for any entity (Deal, Lead, etc.)</li>
        <li>Add a new rule &rarr; find <strong>[SYNITY]</strong> in the list</li>
        <li>Configure the request URL, method, headers, body, and authentication</li>
        <li>Set up Output Mappings to extract specific JSON fields from the response</li>
        <li>Use the <strong>Test Request</strong> button to verify your configuration</li>
        <li>Save the robot — it will execute when the automation triggers</li>
      </ol>
    </section>

    <section class="card">
      <h2>Output Mapping</h2>
      <p>Extract values from the JSON response using dot-notation paths:</p>
      <table class="guide-table">
        <thead>
          <tr><th>Path</th><th>Example JSON</th><th>Result</th></tr>
        </thead>
        <tbody>
          <tr><td><code>data.id</code></td><td><code>{"data":{"id":123}}</code></td><td>123</td></tr>
          <tr><td><code>items[0].name</code></td><td><code>{"items":[{"name":"Foo"}]}</code></td><td>Foo</td></tr>
          <tr><td><code>status</code></td><td><code>{"status":"ok"}</code></td><td>ok</td></tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h2>FAQ</h2>
      <div class="faq-item">
        <strong>Why do I see display names like <code v-pre>{{CRM item ID}}</code>?</strong>
        <p>Bitrix24 auto-converts variable codes to display names. The robot handles this automatically.</p>
      </div>
      <div class="faq-item">
        <strong>Can I use this with webhooks?</strong>
        <p>Yes! The robot can send requests to any URL, including webhook endpoints.</p>
      </div>
      <div class="faq-item">
        <strong>What happens when I exceed my quota?</strong>
        <p>Requests will return an error message. Upgrade your plan to increase the limit.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1f2937;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card h2 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.card p {
  color: #4b5563;
  line-height: 1.6;
}

.card ul, .card ol {
  margin-left: 20px;
  color: #4b5563;
  line-height: 1.8;
}

.card code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.guide-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  font-size: 13px;
}

.guide-table th {
  text-align: left;
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
}

.guide-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
}

.faq-item {
  margin-bottom: 12px;
}

.faq-item strong {
  display: block;
  margin-bottom: 4px;
  color: #1f2937;
}

.faq-item p {
  margin: 0;
  font-size: 13px;
}
</style>
