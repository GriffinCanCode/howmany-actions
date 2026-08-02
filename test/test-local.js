#!/usr/bin/env node

/**
 * Simple test script to verify the GitHub Action builds and basic functionality works
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing HowMany GitHub Action locally...\n');

try {
  // Test 1: Verify build works
  console.log('1️⃣ Testing build process...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful\n');

  // Test 2: Verify dist files exist
  console.log('2️⃣ Checking dist files...');
  const requiredFiles = [
    'dist/index.js',
    'dist/index.js.map',
    'dist/licenses.txt'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing required file: ${file}`);
    }
  }
  console.log('✅ All dist files present\n');

  // Test 3: Verify action.yml is valid
  console.log('3️⃣ Validating action.yml...');
  const actionContent = fs.readFileSync('action.yml', 'utf8');
  if (!actionContent.includes('name:') || !actionContent.includes('runs:')) {
    throw new Error('action.yml appears to be invalid');
  }
  console.log('✅ action.yml is valid\n');

  // Test 4: Check TypeScript compilation
  console.log('4️⃣ Testing TypeScript compilation...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful\n');

  // Test 5: Run linter
  console.log('5️⃣ Running linter...');
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed\n');

  console.log('🎉 All tests passed! The GitHub Action is ready to use.\n');
  
  console.log('📋 Next steps:');
  console.log('  1. Commit and push your changes');
  console.log('  2. Create a release tag (e.g., v1.0.0)');
  console.log('  3. Test with a real repository');
  console.log('  4. Publish to GitHub Marketplace\n');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
} 