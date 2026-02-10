const axios = require('axios');
require('dotenv').config();

const DOMAIN = process.env.BITRIX24_DOMAIN;
const ACCESS_TOKEN = process.env.BITRIX24_ACCESS_TOKEN;
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

    const url = `https://${DOMAIN}/rest/bizproc.robot.update?auth=${ACCESS_TOKEN}`;

    const data = {
      CODE: CODE,
      HANDLER: `${HANDLER_URL}/bitrix-handler/execute`,
      AUTH_USER_ID: parseInt(USER_ID),
      USE_SUBSCRIPTION: 'Y',
      USE_PLACEMENT: 'Y',
      PLACEMENT_HANDLER: `${HANDLER_URL}/placement/robot-settings`
    };

    console.log('Updating robot for Automation Rules...');
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
    const url = `https://${DOMAIN}/rest/bizproc.activity.update?auth=${ACCESS_TOKEN}`;

    const data = {
      CODE: CODE,
      HANDLER: `${HANDLER_URL}/bitrix-handler/execute`,
      AUTH_USER_ID: parseInt(USER_ID),
      USE_SUBSCRIPTION: 'Y',
      USE_PLACEMENT: 'Y',
      PLACEMENT_HANDLER: `${HANDLER_URL}/placement/robot-settings`
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
