// Simple script to test Warden AI webhook responses locally
const http = require('http');
const crypto = require('crypto');

// Configuration
const serverUrl = 'http://localhost:4000';
const webhookSecret = process.env.WEBHOOK_SECRET || 'test-secret';

// Function to generate signature for the request
function generateSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('base64');
}

// Function to send HTTP POST request without external dependencies
function sendPostRequest(url, payload, signature) {
  return new Promise((resolve, reject) => {
    const payloadStr = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
        'Content-Length': Buffer.byteLength(payloadStr)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payloadStr);
    req.end();
  });
}

// Test payloads with different Warden personalities
const testPayloads = [
  {
    eventType: 'request',
    wardenData: {
      name: 'Warden Aerith',
      personality: { conversationStyle: 'confident_outgoing' }
    }
  },
  {
    eventType: 'request',
    wardenData: {
      name: 'Warden Thorne',
      personality: { conversationStyle: 'cautious_reserved' }
    }
  },
  {
    eventType: 'request',
    wardenData: {
      name: 'Warden Kael',
      personality: { conversationStyle: 'blunt_direct' }
    }
  },
  {
    eventType: 'response',
    wardenData: {
      name: 'Warden Aerith',
      personality: { conversationStyle: 'confident_outgoing' }
    }
  }
];

// Function to send test requests
async function testWebhook() {
  console.log('Testing Warden AI Webhook Responses...\n');
  
  for (const payload of testPayloads) {
    const signature = generateSignature(payload, webhookSecret);
    
    try {
      const result = await sendPostRequest(serverUrl, payload, signature);
      console.log(`Test for ${payload.wardenData.name} (${payload.wardenData.personality.conversationStyle}, Event: ${payload.eventType}):`);
      console.log(`Status: ${result.status}`);
      if (result.status === 200) {
        console.log(`Response Text: ${result.data.text}`);
        console.log(`Warden Name: ${result.data.wardenName}`);
      } else {
        console.log(`Error Response: ${JSON.stringify(result.data, null, 2)}`);
      }
      console.log('---\n');
    } catch (error) {
      console.error(`Error testing ${payload.wardenData.name}:`, error.message);
      console.log('---\n');
    }
  }
}

// Run the tests
testWebhook();
