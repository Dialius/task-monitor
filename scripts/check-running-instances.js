/**
 * Check for running bot instances
 * Helps diagnose connectionReplaced (440) errors
 */

const { exec } = require('child_process');
const os = require('os');

console.log('\n🔍 Checking for running bot instances...\n');

const platform = os.platform();
let command;

if (platform === 'win32') {
  // Windows: Check for node processes running index.js or bot.js
  command = 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH';
} else {
  // Linux/Mac: Check for node processes
  command = 'ps aux | grep node | grep -v grep';
}

exec(command, (error, stdout, stderr) => {
  if (error && platform !== 'win32') {
    console.log('✅ No bot instances found running\n');
    return;
  }

  if (stderr) {
    console.error('❌ Error checking processes:', stderr);
    return;
  }

  if (platform === 'win32') {
    // Parse Windows tasklist output
    const lines = stdout.trim().split('\n');
    const nodeProcesses = lines.filter(line => line.includes('node.exe'));
    
    if (nodeProcesses.length === 0) {
      console.log('✅ No bot instances found running\n');
    } else {
      console.log(`⚠️  Found ${nodeProcesses.length} Node.js process(es):\n`);
      nodeProcesses.forEach((line, index) => {
        const parts = line.split(',').map(p => p.replace(/"/g, '').trim());
        console.log(`   ${index + 1}. PID: ${parts[1]} - ${parts[0]}`);
      });
      console.log('\n💡 If you see multiple instances, stop them with:');
      console.log('   taskkill /F /IM node.exe\n');
    }
  } else {
    // Parse Linux/Mac ps output
    const lines = stdout.trim().split('\n');
    
    if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
      console.log('✅ No bot instances found running\n');
    } else {
      console.log(`⚠️  Found ${lines.length} Node.js process(es):\n`);
      lines.forEach((line, index) => {
        console.log(`   ${index + 1}. ${line}`);
      });
      console.log('\n💡 If you see multiple instances, stop them with:');
      console.log('   pkill -f node\n');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📋 Common causes of connectionReplaced (440):\n');
  console.log('   1. Multiple bot instances running');
  console.log('   2. WhatsApp Web open in browser');
  console.log('   3. Another device using the same WhatsApp account');
  console.log('   4. Bot restarted too quickly (session conflict)\n');
  console.log('🔧 Solutions:\n');
  console.log('   1. Stop all bot instances: npm run stop (or Ctrl+C)');
  console.log('   2. Close WhatsApp Web in all browsers');
  console.log('   3. Check WhatsApp > Linked Devices > Remove unused');
  console.log('   4. Wait 10-15 seconds before restarting bot\n');
});
