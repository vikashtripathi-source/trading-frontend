// Debug script to verify environment configuration
const fs = require('fs');
const path = require('path');

// Read environment file
const envPath = path.join(__dirname, 'src', 'environments', 'environment.ts');
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('Environment file content:');
console.log(envContent);
console.log('==========================');

// Check if port 8081 is mentioned
if (envContent.includes('8081')) {
  console.log('✅ Port 8081 found in environment.ts');
} else {
  console.log('❌ Port 8081 NOT found in environment.ts');
}

if (envContent.includes('useMockApi: false')) {
  console.log('✅ Mock API disabled');
} else {
  console.log('❌ Mock API still enabled');
}
