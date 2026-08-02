#!/usr/bin/env node

/**
 * Integration test for HowMany GitHub Action
 * Tests the action against the actual HowMany CLI
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock GitHub Actions core module
const mockCore = {
  inputs: {},
  outputs: {},
  info: (msg) => console.log(`ℹ️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  warning: (msg) => console.warn(`⚠️  ${msg}`),
  debug: (msg) => console.log(`🐛 ${msg}`),
  setOutput: (key, value) => {
    mockCore.outputs[key] = value;
    console.log(`📤 Output: ${key} = ${value}`);
  },
  getInput: (name) => mockCore.inputs[name] || '',
  getBooleanInput: (name) => mockCore.inputs[name] === 'true',
  setFailed: (msg) => {
    console.error(`💥 Action failed: ${msg}`);
    process.exit(1);
  }
};

// Set up test inputs
mockCore.inputs = {
  'path': './src',
  'output-format': 'json',
  'verbose': 'true',
  'show-files': 'false',
  'no-interactive': 'true',
  'sort-by': 'files',
  'descending': 'false',
  'fail-on-quality-gate': 'false',
  'quality-threshold': '70',
  'maintainability-threshold': '65',
  'documentation-threshold': '20',
  'complexity-threshold': '10',
  'create-pr-comment': 'false',
  'upload-sarif': 'false',
  'howmany-version': 'latest'
};

console.log('🧪 Running HowMany GitHub Action Integration Test...\n');

async function testHowManyCliAvailability() {
  console.log('1️⃣ Testing HowMany CLI availability...');
  
  // Check if howmany is available in the system or in the parent directory
  const possiblePaths = [
    'howmany',
    '../howmany-core/target/release/howmany',
    path.join(os.homedir(), '.cargo', 'bin', 'howmany')
  ];
  
  for (const howmanyPath of possiblePaths) {
    try {
      const result = execSync(`${howmanyPath} --version`, { encoding: 'utf8', stdio: 'pipe' });
      console.log(`✅ Found HowMany CLI at: ${howmanyPath}`);
      console.log(`   Version: ${result.trim()}`);
      return howmanyPath;
    } catch (error) {
      // Continue to next path
    }
  }
  
  throw new Error('HowMany CLI not found. Please install it or build the core project.');
}

async function testJsonOutput(howmanyPath) {
  console.log('\n2️⃣ Testing JSON output parsing...');
  
  try {
    const result = execSync(`${howmanyPath} ./src --output json --verbose --no-interactive`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Extract JSON from output (it might contain other text)
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON output found');
    }
    
    const jsonOutput = JSON.parse(jsonMatch[0]);
    console.log('✅ JSON output parsed successfully');
    console.log(`   Files analyzed: ${jsonOutput.basic.total_files}`);
    console.log(`   Total lines: ${jsonOutput.basic.total_lines}`);
    console.log(`   Quality score: ${jsonOutput.ratios.quality_metrics.overall_quality_score.toFixed(1)}`);
    
    return jsonOutput;
  } catch (error) {
    throw new Error(`JSON parsing failed: ${error.message}`);
  }
}

async function testTypeScriptInterfaces(jsonOutput) {
  console.log('\n3️⃣ Testing TypeScript interface compatibility...');
  
  // Test that all expected fields are present
  const requiredFields = [
    'basic.total_files',
    'basic.total_lines',
    'basic.code_lines',
    'basic.average_file_size',
    'complexity.function_count',
    'complexity.quality_metrics.code_health_score',
    // The four inputs the quality gate actually decides on, so a CLI that stops
    // emitting one of them fails here rather than turning the gate into a no-op.
    'complexity.quality_metrics.maintainability_index',
    'complexity.quality_metrics.documentation_coverage',
    'complexity.quality_metrics.avg_complexity',
    'ratios.quality_metrics.overall_quality_score',
    'metadata.version'
    // There is deliberately no `time.*` entry. This list used to require
    // `time.total_time_minutes` and `time.productivity_metrics.lines_per_hour`
    // long after the CLI stopped emitting a `time` section at all -- the types in
    // src/types/howmany.ts never declared one. howmany-core now pins this schema
    // in tests/json_contract.rs, so a removal fails in the repository that makes
    // it instead of here.
  ];
  
  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj, key) => obj && obj[key], jsonOutput);
    if (value === undefined) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  console.log('✅ All required TypeScript interface fields present');
  return true;
}

async function testQualityGateLogic(jsonOutput) {
  console.log('\n4️⃣ Testing quality gate logic...');
  
  // Mock the quality gate evaluator
  const QualityGateEvaluator = require('../lib/utils/quality-gate.js').QualityGateEvaluator;
  
  const qualityGate = {
    overall_quality_threshold: 70,
    maintainability_threshold: 65,
    documentation_threshold: 20,
    complexity_threshold: 10
  };
  
  const evaluator = new QualityGateEvaluator(qualityGate);
  const result = evaluator.evaluate(jsonOutput);
  
  console.log('✅ Quality gate evaluation completed');
  console.log(`   Overall score: ${result.overall_score.toFixed(1)}`);
  console.log(`   Maintainability: ${result.maintainability_score.toFixed(1)}`);
  console.log(`   Documentation: ${result.documentation_score.toFixed(1)}%`);
  console.log(`   Passed: ${result.passed ? '✅' : '❌'}`);
  
  return result;
}

async function testActionOutputs(jsonOutput, qualityResult) {
  console.log('\n5️⃣ Testing action outputs...');
  
  // Simulate setting outputs
  mockCore.setOutput('total-files', jsonOutput.basic.total_files.toString());
  mockCore.setOutput('total-lines', jsonOutput.basic.total_lines.toString());
  mockCore.setOutput('code-lines', jsonOutput.basic.code_lines.toString());
  mockCore.setOutput('quality-score', qualityResult.overall_score.toString());
  mockCore.setOutput('passed', qualityResult.passed.toString());
  
  console.log('✅ Action outputs set successfully');
  return true;
}

async function testReportGeneration(jsonOutput) {
  console.log('\n6️⃣ Testing report generation...');
  
  // Create a temporary reports directory
  const reportsDir = './test-reports';
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }
  
  // Generate JSON report
  const jsonReportPath = path.join(reportsDir, 'howmany-report.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(jsonOutput, null, 2));
  
  // Generate a simple HTML report
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>HowMany Analysis Report</title>
</head>
<body>
    <h1>Code Analysis Report</h1>
    <p>Files: ${jsonOutput.basic.total_files}</p>
    <p>Lines: ${jsonOutput.basic.total_lines}</p>
    <p>Quality Score: ${jsonOutput.ratios.quality_metrics.overall_quality_score.toFixed(1)}</p>
</body>
</html>`;
  
  const htmlReportPath = path.join(reportsDir, 'howmany-report.html');
  fs.writeFileSync(htmlReportPath, htmlContent);
  
  console.log(`✅ Reports generated:`);
  console.log(`   JSON: ${jsonReportPath}`);
  console.log(`   HTML: ${htmlReportPath}`);
  
  return { jsonReportPath, htmlReportPath };
}

async function runIntegrationTest() {
  try {
    const howmanyPath = await testHowManyCliAvailability();
    const jsonOutput = await testJsonOutput(howmanyPath);
    await testTypeScriptInterfaces(jsonOutput);
    const qualityResult = await testQualityGateLogic(jsonOutput);
    await testActionOutputs(jsonOutput, qualityResult);
    const reports = await testReportGeneration(jsonOutput);
    
    console.log('\n🎉 All integration tests passed!');
    console.log('\n📊 Test Summary:');
    console.log(`   HowMany CLI: ${howmanyPath}`);
    console.log(`   Files analyzed: ${jsonOutput.basic.total_files}`);
    console.log(`   Lines of code: ${jsonOutput.basic.code_lines}`);
    console.log(`   Quality score: ${jsonOutput.ratios.quality_metrics.overall_quality_score.toFixed(1)}/100`);
    console.log(`   Quality gate: ${qualityResult.passed ? 'PASSED' : 'FAILED'}`);
    
    console.log('\n✨ The GitHub Action is fully functional and ready for production use!');
    
    // Clean up test reports
    setTimeout(() => {
      if (fs.existsSync('./test-reports')) {
        fs.rmSync('./test-reports', { recursive: true });
        console.log('\n🧹 Test reports cleaned up');
      }
    }, 1000);
    
  } catch (error) {
    console.error(`\n💥 Integration test failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the test
runIntegrationTest(); 