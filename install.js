const axios = require('axios');
require('dotenv').config();

const BITRIX24_DOMAIN = process.env.BITRIX24_DOMAIN;
const ACCESS_TOKEN = process.env.BITRIX24_ACCESS_TOKEN;
const HANDLER_URL = process.env.HANDLER_URL;
const USER_ID = process.env.BITRIX24_USER_ID || '1'; // Default to user 1 (admin)

// Robot/Activity configuration
const robotConfig = {
  CODE: 'http_request_robot',
  HANDLER: `${HANDLER_URL}/bitrix-handler/execute`,
  AUTH_USER_ID: parseInt(USER_ID), // User whose permissions will be used
  USE_SUBSCRIPTION: 'Y', // CRITICAL: Makes Bitrix24 wait for bizproc.event.send
  USE_PLACEMENT: 'Y', // Enable custom UI for settings
  PLACEMENT_HANDLER: `${HANDLER_URL}/placement/robot-settings`,
  NAME: {
    'en': 'HTTP Request',
    'ru': 'HTTP Запрос'
  },
  DESCRIPTION: {
    'en': 'Makes HTTP request to external server and returns response (body, status code, headers)',
    'ru': 'Выполняет HTTP запрос к внешнему серверу и возвращает результат (тело, код статуса, заголовки)'
  },
  PROPERTIES: {
    url: {
      Name: {
        'en': 'URL',
        'ru': 'URL'
      },
      Description: {
        'en': 'Target URL for the HTTP request',
        'ru': 'URL адрес для HTTP запроса'
      },
      Type: 'string',
      Required: 'Y'
    },
    method: {
      Name: {
        'en': 'HTTP Method',
        'ru': 'HTTP Метод'
      },
      Description: {
        'en': 'HTTP method to use',
        'ru': 'HTTP метод для использования'
      },
      Type: 'select',
      Required: 'Y',
      Default: 'GET',
      Options: {
        'GET': 'GET',
        'POST': 'POST',
        'PUT': 'PUT',
        'DELETE': 'DELETE'
      }
    },
    headers: {
      Name: {
        'en': 'Headers (JSON)',
        'ru': 'Заголовки (JSON)'
      },
      Description: {
        'en': 'Request headers as JSON object. Example: {"Content-Type": "application/json", "Authorization": "Bearer token"}',
        'ru': 'Заголовки запроса в формате JSON. Пример: {"Content-Type": "application/json", "Authorization": "Bearer token"}'
      },
      Type: 'text',
      Required: 'N'
    },
    body: {
      Name: {
        'en': 'Request Body',
        'ru': 'Тело запроса'
      },
      Description: {
        'en': 'Request body content (for POST/PUT requests)',
        'ru': 'Содержимое тела запроса (для POST/PUT запросов)'
      },
      Type: 'text',
      Required: 'N'
    },
    timeout: {
      Name: {
        'en': 'Timeout (ms)',
        'ru': 'Таймаут (мс)'
      },
      Description: {
        'en': 'Request timeout in milliseconds (default: 30000, max: 300000)',
        'ru': 'Таймаут запроса в миллисекундах (по умолчанию: 30000, макс: 300000)'
      },
      Type: 'int',
      Required: 'N',
      Default: '30000'
    }
  },
  RETURN_PROPERTIES: {
    responseBody: {
      Name: {
        'en': 'Response Body',
        'ru': 'Тело ответа'
      },
      Description: {
        'en': 'Response body content',
        'ru': 'Содержимое тела ответа'
      },
      Type: 'text'
    },
    statusCode: {
      Name: {
        'en': 'Status Code',
        'ru': 'Код статуса'
      },
      Description: {
        'en': 'HTTP status code (e.g., 200, 404, 500)',
        'ru': 'HTTP код статуса (например, 200, 404, 500)'
      },
      Type: 'int'
    },
    responseHeaders: {
      Name: {
        'en': 'Response Headers (JSON)',
        'ru': 'Заголовки ответа (JSON)'
      },
      Description: {
        'en': 'Response headers as JSON string',
        'ru': 'Заголовки ответа в формате JSON строки'
      },
      Type: 'text'
    },
    error: {
      Name: {
        'en': 'Error Message',
        'ru': 'Сообщение об ошибке'
      },
      Description: {
        'en': 'Error message if request failed',
        'ru': 'Сообщение об ошибке, если запрос не выполнен'
      },
      Type: 'string'
    }
  }
};

/**
 * Install robot for Automation Rules
 */
async function installRobot() {
  try {
    console.log('Installing robot for Automation Rules...');
    console.log(`Domain: ${BITRIX24_DOMAIN}`);
    console.log(`Handler URL: ${robotConfig.HANDLER}`);

    const response = await axios.post(
      `https://${BITRIX24_DOMAIN}/rest/bizproc.robot.add?auth=${ACCESS_TOKEN}`,
      robotConfig
    );

    if (response.data.error) {
      console.error('❌ Robot installation failed:', response.data.error_description);

      if (response.data.error === 'ACCESS_DENIED' || response.data.error === 'invalid_token') {
        console.error('\n⚠️  IMPORTANT: bizproc.robot.add requires Application Context!');
        console.error('   You cannot use a regular inbound webhook.');
        console.error('   Please create a Local Application in Bitrix24:');
        console.error('   Settings → Developer resources → Other → Local application\n');
      }

      return false;
    }

    console.log('✅ Robot installed successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error installing robot:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Install activity for Workflow Designer
 */
async function installActivity() {
  try {
    console.log('\nInstalling activity for Workflow Designer...');
    console.log(`Domain: ${BITRIX24_DOMAIN}`);
    console.log(`Handler URL: ${robotConfig.HANDLER}`);

    const response = await axios.post(
      `https://${BITRIX24_DOMAIN}/rest/bizproc.activity.add?auth=${ACCESS_TOKEN}`,
      robotConfig
    );

    if (response.data.error) {
      console.error('❌ Activity installation failed:', response.data.error_description);

      if (response.data.error === 'ACCESS_DENIED' || response.data.error === 'invalid_token') {
        console.error('\n⚠️  IMPORTANT: bizproc.activity.add requires Application Context!');
        console.error('   You cannot use a regular inbound webhook.');
        console.error('   Please create a Local Application in Bitrix24:');
        console.error('   Settings → Developer resources → Other → Local application\n');
      }

      return false;
    }

    console.log('✅ Activity installed successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error installing activity:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Check if configuration is valid
 */
function validateConfig() {
  const errors = [];

  if (!BITRIX24_DOMAIN) {
    errors.push('BITRIX24_DOMAIN is not set in .env');
  }

  if (!ACCESS_TOKEN) {
    errors.push('BITRIX24_ACCESS_TOKEN is not set in .env');
  }

  if (!HANDLER_URL) {
    errors.push('HANDLER_URL is not set in .env');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }

  return true;
}

/**
 * Main installation function
 */
async function install() {
  console.log('='.repeat(60));
  console.log('Bitrix24 HTTP Request Robot - Installation Script');
  console.log('='.repeat(60));

  // Validate configuration
  if (!validateConfig()) {
    console.log('\nPlease configure your .env file with the required values.');
    console.log('See .env.example for reference.');
    process.exit(1);
  }

  console.log('\nConfiguration:');
  console.log(`  Domain: ${BITRIX24_DOMAIN}`);
  console.log(`  Handler URL: ${HANDLER_URL}`);
  console.log('');

  // Install robot and activity
  const robotSuccess = await installRobot();
  const activitySuccess = await installActivity();

  console.log('\n' + '='.repeat(60));
  console.log('Installation Summary:');
  console.log('='.repeat(60));
  console.log(`Robot (Automation Rules): ${robotSuccess ? '✅ Installed' : '❌ Failed'}`);
  console.log(`Activity (Workflow Designer): ${activitySuccess ? '✅ Installed' : '❌ Failed'}`);
  console.log('='.repeat(60));

  if (robotSuccess && activitySuccess) {
    console.log('\n🎉 Installation completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Go to your Bitrix24 portal');
    console.log('2. Create or edit a business process');
    console.log('3. Add "HTTP Request" robot/activity');
    console.log('4. Configure the request parameters');
    console.log('5. Use the response variables in subsequent actions');
  } else {
    console.log('\n⚠️  Installation completed with errors.');
    console.log('Please check the error messages above and try again.');
  }
}

// Run installation
install();
