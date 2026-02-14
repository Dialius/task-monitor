/**
 * Test Notion using request method
 */

require('dotenv').config();
const { Client } = require('@notionhq/client');

async function testRequest() {
  console.log('🔍 Testing Notion using request() method\n');
  
  const notion = new Client({
    auth: process.env.NOTION_API_KEY
  });
  
  console.log('Client methods:', Object.keys(notion));
  console.log('Has request:', typeof notion.request);
  console.log('');
  
  // Try using request method
  try {
    console.log('🔍 Attempting to query using request()...');
    const response = await notion.request({
      path: `databases/${process.env.NOTION_DATABASE_ID}/query`,
      method: 'POST',
      body: {
        page_size: 1
      }
    });
    
    console.log('✅ Query successful using request()!');
    console.log('Results:', response.results.length);
  } catch (error) {
    console.log('❌ Query failed:', error.message);
  }
}

testRequest();
