/**
 * Test Notion Query Method
 */

require('dotenv').config();
const { Client } = require('@notionhq/client');

async function testQuery() {
  console.log('🔍 Testing Notion Query Method\n');
  
  const notion = new Client({
    auth: process.env.NOTION_API_KEY
  });
  
  console.log('Client created:', typeof notion);
  console.log('Has databases:', !!notion.databases);
  console.log('databases type:', typeof notion.databases);
  console.log('databases keys:', Object.keys(notion.databases));
  console.log('');
  
  // Check if query exists
  console.log('Has query:', 'query' in notion.databases);
  console.log('query type:', typeof notion.databases.query);
  
  // Try to call query
  try {
    console.log('\n🔍 Attempting to query database...');
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      page_size: 1
    });
    
    console.log('✅ Query successful!');
    console.log('Results:', response.results.length);
  } catch (error) {
    console.log('❌ Query failed:', error.message);
    console.log('Error type:', error.constructor.name);
  }
}

testQuery();
