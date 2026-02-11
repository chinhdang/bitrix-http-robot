const axios = require('axios');
require('dotenv').config();

const { getAccessToken } = require('./services/tokenManager');

const DOMAIN = process.env.BITRIX24_DOMAIN;
const CODE = 'http_request_robot';

async function uninstallRobot() {
  try {
    console.log('\n============================================================');
    console.log('Bitrix24 HTTP Request Robot - Uninstall Script');
    console.log('============================================================\n');

    console.log('Uninstalling robot...');
    const accessToken = await getAccessToken();
    const url = `https://${DOMAIN}/rest/bizproc.robot.delete?auth=${accessToken}`;

    const response = await axios.post(url, { CODE: CODE });

    if (response.data.error) {
      console.log('❌ Error uninstalling robot:', response.data);
    } else {
      console.log('✅ Robot uninstalled successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function uninstallActivity() {
  try {
    console.log('\nUninstalling activity...');
    const accessToken = await getAccessToken();
    const url = `https://${DOMAIN}/rest/bizproc.activity.delete?auth=${accessToken}`;

    const response = await axios.post(url, { CODE: CODE });

    if (response.data.error) {
      console.log('❌ Error uninstalling activity:', response.data);
    } else {
      console.log('✅ Activity uninstalled successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function uninstall() {
  await uninstallRobot();
  await uninstallActivity();

  console.log('\n============================================================');
  console.log('Uninstall completed!');
  console.log('Now run: node install.js');
  console.log('============================================================\n');
}

uninstall();
