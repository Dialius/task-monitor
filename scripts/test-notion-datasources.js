/**
 * Test Notion using dataSources
 */

require('dotenv').config();
const { Client } = require('@notionhq/client');

async function testDataSources() {
  console.log('🔍 Testing Notion using dataSources\n');
  
  const notion = new Client({
    auth: process.env.NOTION_API_KEY
  });
  
  console.log('dataSources methods:', Object.keys(notion.dataSources));
  console.log('Has query:', typeof notion.dataSources.query);
  console.log('');
  
  // Try using dataSources.query
  try {
    console.log('🔍 Attempting to query using dataSources.query()...');
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_DATABASE_ID,
      page_size: 1
    });
    
    console.log('✅ Query successful using dataSources.query()!');
    console.log('Results:', response.results.length);
  } catch (error) {
    console.log('❌ Query failed:', error.message);
    console.log('Error code:', error.code);
  }
}

testDataSources();
