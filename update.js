const axios = require('axios');
require('dotenv').config();

const { robotConfig } = require('./install');
const { getAccessToken } = require('./services/tokenManager');

const DOMAIN = process.env.BITRIX24_DOMAIN;
const HANDLER_URL = process.env.HANDLER_URL;
const USER_ID = process.env.BITRIX24_USER_ID || '1';

const CODE = 'http_request_robot';

async function updateRobot() {
  try {
    console.log('\n============================================================');
    console.log('Bitrix24 HTTP Request Robot - Update Script');
    console.log('============================================================\n');

    console.log('Configuration:');
    console.log(`  Domain: ${DOMAIN}`);
    console.log(`  Handler URL: ${HANDLER_URL}`);
    console.log(`  Code: ${CODE}\n`);

    const accessToken = await getAccessToken();
    const url = `https://${DOMAIN}/rest/bizproc.robot.update?auth=${accessToken}`;

    const data = {
      CODE: CODE,
      FIELDS: {
        HANDLER: `${HANDLER_URL}/bitrix-handler/execute`,
        AUTH_USER_ID: parseInt(USER_ID),
        USE_SUBSCRIPTION: 'Y',
        USE_PLACEMENT: 'Y',
        PLACEMENT_HANDLER: `${HANDLER_URL}/placement/robot-settings`,
        NAME: robotConfig.NAME,
        DESCRIPTION: robotConfig.DESCRIPTION,
        RETURN_PROPERTIES: robotConfig.RETURN_PROPERTIES
      }
    };

    console.log('Updating robot for Automation Rules...');
    console.log('RETURN_PROPERTIES:', Object.keys(robotConfig.RETURN_PROPERTIES).join(', '));
    const response = await axios.post(url, data);

    if (response.data.error) {
      console.log('❌ Error updating robot:', response.data);
    } else {
      console.log('✅ Robot updated successfully!');
      console.log('Response:', response.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function updateActivity() {
  try {
    const accessToken = await getAccessToken();
    const url = `https://${DOMAIN}/rest/bizproc.activity.update?auth=${accessToken}`;

    const data = {
      CODE: CODE,
      FIELDS: {
        HANDLER: `${HANDLER_URL}/bitrix-handler/execute`,
        AUTH_USER_ID: parseInt(USER_ID),
        USE_SUBSCRIPTION: 'Y',
        USE_PLACEMENT: 'Y',
        PLACEMENT_HANDLER: `${HANDLER_URL}/placement/robot-settings`,
        NAME: robotConfig.NAME,
        DESCRIPTION: robotConfig.DESCRIPTION,
        RETURN_PROPERTIES: robotConfig.RETURN_PROPERTIES
      }
    };

    console.log('\nUpdating activity for Workflow Designer...');
    const response = await axios.post(url, data);

    if (response.data.error) {
      console.log('❌ Error updating activity:', response.data);
    } else {
      console.log('✅ Activity updated successfully!');
      console.log('Response:', response.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function update() {
  await updateRobot();
  await updateActivity();

  console.log('\n============================================================');
  console.log('Update completed!');
  console.log('============================================================\n');
}

update();
