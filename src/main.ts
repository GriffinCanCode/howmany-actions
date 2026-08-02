import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import { promises as fs } from 'fs';
import * as path from 'path';

import { HowManyInstaller } from './utils/howmany-installer.js';
import { QualityGateEvaluator } from './utils/quality-gate.js';
import { HowManyResult } from './types/howmany.js';

/**
 * Main entry point for the GitHub Action
 */
async function run(): Promise<void> {
  try {
    core.info('🚀 Starting HowMany Code Analysis');

    // Get inputs
    const inputs = getActionInputs();
    core.info(`Analyzing path: ${inputs.path}`);

    // Install HowMany
    const installer = new HowManyInstaller(inputs.howmanyVersion);
    const howmanyPath = await installer.install();

    // Run analysis
    const results = await runHowManyAnalysis(howmanyPath, inputs);

    // Set basic outputs
    setBasicOutputs(results);

    // Evaluate quality gate if enabled
    if (inputs.failOnQualityGate) {
      const qualityGate = QualityGateEvaluator.fromInputs();
      const evaluator = new QualityGateEvaluator(qualityGate);
      const gateResult = evaluator.evaluate(results);

      evaluator.logResult(gateResult);

      if (!gateResult.passed) {
        core.setFailed('Quality gate failed');
        return;
      }
    }

    // Generate reports and artifacts
    await generateReports(results, inputs);

    // Create PR comment if enabled
    if (inputs.createPrComment && github.context.eventName === 'pull_request') {
      await createPrComment(results, inputs);
    }

    core.info('✅ HowMany analysis completed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.error(`Action failed: ${errorMessage}`);
    core.setFailed(errorMessage);
  }
}

/**
 * Get and validate action inputs
 */
function getActionInputs() {
  return {
    path: core.getInput('path') || '.',
    outputFormat: core.getInput('output-format') || 'json',
    showFiles: core.getBooleanInput('show-files'),
    verbose: core.getBooleanInput('verbose'),
    maxDepth: core.getInput('max-depth'),
    extensions: core.getInput('extensions'),
    includeHidden: core.getBooleanInput('include-hidden'),
    sortBy: core.getInput('sort-by') || 'lines',
    descending: core.getBooleanInput('descending'),
    ignorePatterns: core.getInput('ignore-patterns'),

    // New CLI and filtering options
    cliMode: core.getBooleanInput('cli-mode'),
    minLines: core.getInput('min-lines'),
    maxLines: core.getInput('max-lines'),
    minSize: core.getInput('min-size'),
    maxSize: core.getInput('max-size'),
    onlyLanguages: core.getInput('only-languages'),
    excludeLanguages: core.getInput('exclude-languages'),
    showComplexity: core.getBooleanInput('show-complexity'),
    showQuality: core.getBooleanInput('show-quality'),
    showRatios: core.getBooleanInput('show-ratios'),
    showSize: core.getBooleanInput('show-size'),

    // Quality gate options
    failOnQualityGate: core.getBooleanInput('fail-on-quality-gate'),
    qualityThreshold: parseFloat(core.getInput('quality-threshold') || '70'),
    maintainabilityThreshold: parseFloat(core.getInput('maintainability-threshold') || '65'),
    documentationThreshold: parseFloat(core.getInput('documentation-threshold') || '20'),
    complexityThreshold: parseFloat(core.getInput('complexity-threshold') || '10'),

    // Output options
    createPrComment: core.getBooleanInput('create-pr-comment'),
    uploadSarif: core.getBooleanInput('upload-sarif'),
    artifactName: core.getInput('artifact-name') || 'howmany-report',

    // Installation options
    howmanyVersion: core.getInput('howmany-version') || 'latest'
  };
}

/**
 * Run HowMany analysis with the specified parameters
 */
async function runHowManyAnalysis(howmanyPath: string, inputs: any): Promise<HowManyResult> {
  core.info('📊 Running HowMany analysis...');

  // Build command arguments based on inputs
  const args = [inputs.path];

  // CLI mode or JSON output
  if (inputs.cliMode) {
    args.push('--cli');
  } else {
    // Always use JSON output for parsing when not in CLI mode
    args.push('--output', 'json');
  }

  args.push('--no-interactive'); // Disable interactive mode for CI

  // Basic options
  if (inputs.showFiles) args.push('--files');
  if (inputs.verbose) args.push('--verbose');
  if (inputs.maxDepth) args.push('--depth', inputs.maxDepth);
  if (inputs.extensions) args.push('--ext', inputs.extensions);
  if (inputs.includeHidden) args.push('--hidden');
  if (inputs.sortBy) args.push('--sort', inputs.sortBy);
  if (inputs.descending) args.push('--desc');
  if (inputs.ignorePatterns) args.push('--ignore', inputs.ignorePatterns);

  // New filtering options
  if (inputs.minLines) args.push('--min-lines', inputs.minLines);
  if (inputs.maxLines) args.push('--max-lines', inputs.maxLines);
  if (inputs.minSize) args.push('--min-size', inputs.minSize);
  if (inputs.maxSize) args.push('--max-size', inputs.maxSize);
  if (inputs.onlyLanguages) args.push('--only', inputs.onlyLanguages);
  if (inputs.excludeLanguages) args.push('--exclude', inputs.excludeLanguages);

  // Enhanced output options (only in CLI mode)
  if (inputs.cliMode) {
    if (inputs.showComplexity) args.push('--show-complexity');
    if (inputs.showQuality) args.push('--show-quality');
    if (inputs.showRatios) args.push('--show-ratios');
    if (inputs.showSize) args.push('--show-size');
  }

  // Capture output
  let output = '';
  let errorOutput = '';

  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
      stderr: (data: Buffer) => {
        errorOutput += data.toString();
      }
    },
    ignoreReturnCode: false,
    silent: true
  };

  try {
    const exitCode = await exec.exec(howmanyPath, args, options);

    if (exitCode !== 0) {
      throw new Error(`HowMany analysis failed with exit code ${exitCode}: ${errorOutput}`);
    }

    // Handle CLI mode output differently
    if (inputs.cliMode) {
      // Parse CLI output to create a basic result object
      const lines = output.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const match = lastLine.match(/(\d+)\s+files,\s+(\d+)\s+lines/);

      if (match) {
        // Create a minimal result object for CLI mode
        const basicResult = {
          basic: {
            total_files: parseInt(match[1]),
            total_lines: parseInt(match[2]),
            code_lines: 0,
            comment_lines: 0,
            doc_lines: 0,
            blank_lines: 0,
            total_size: 0,
            average_file_size: 0,
            average_lines_per_file: 0,
            largest_file_size: 0,
            smallest_file_size: 0,
            stats_by_extension: {}
          }
        } as unknown as HowManyResult;

        core.info(
          `✅ CLI Analysis completed: ${basicResult.basic.total_files} files, ${basicResult.basic.total_lines} lines`
        );
        return basicResult;
      } else {
        throw new Error('Failed to parse CLI output');
      }
    } else {
      // Parse JSON output
      try {
        const results: HowManyResult = JSON.parse(output);
        core.info(
          `✅ Analysis completed: ${results.basic.total_files} files, ${results.basic.total_lines} lines`
        );

        return results;
      } catch (parseError) {
        core.error(`Failed to parse JSON output: ${parseError}`);
        core.error(`Raw output: ${output.substring(0, 500)}...`);
        throw new Error(`JSON parsing failed: ${parseError}`, { cause: parseError });
      }
    }
  } catch (error) {
    core.error(`HowMany execution failed: ${error}`);
    if (errorOutput) {
      core.error(`Error output: ${errorOutput}`);
    }
    throw error;
  }
}

/**
 * Set basic action outputs
 */
function setBasicOutputs(results: HowManyResult): void {
  core.setOutput('total-files', results.basic.total_files.toString());
  core.setOutput('total-lines', results.basic.total_lines.toString());
  core.setOutput('code-lines', results.basic.code_lines.toString());
  core.setOutput('comment-lines', results.basic.comment_lines.toString());

  // Create summary
  const summary = `📊 **Code Analysis Summary**
📁 **Files:** ${results.basic.total_files}
📏 **Total Lines:** ${results.basic.total_lines}
💻 **Code Lines:** ${results.basic.code_lines}
💬 **Comment Lines:** ${results.basic.comment_lines}
📚 **Doc Lines:** ${results.basic.doc_lines}
⬜ **Blank Lines:** ${results.basic.blank_lines}
💾 **Total Size:** ${results.basic.total_size} bytes
🏆 **Quality Score:** ${results.ratios.quality_metrics.overall_quality_score.toFixed(1)}/100`;

  core.summary.addRaw(summary);
}

/**
 * Generate reports and upload as artifacts
 */
async function generateReports(results: HowManyResult, inputs: any): Promise<void> {
  const reportDir = 'howmany-reports';
  await fs.mkdir(reportDir, { recursive: true });

  // Generate JSON report
  const jsonReportPath = path.join(reportDir, 'howmany-analysis.json');
  await fs.writeFile(jsonReportPath, JSON.stringify(results, null, 2));
  core.setOutput('report-path', jsonReportPath);
  core.info(`📄 JSON report generated: ${jsonReportPath}`);

  // Generate additional formats if requested
  if (inputs.outputFormat === 'html') {
    await generateHtmlReport(results, reportDir);
  }

  if (inputs.uploadSarif) {
    await generateSarifReport(results, reportDir);
  }
}

/**
 * Generate HTML report by running HowMany again with HTML output
 */
async function generateHtmlReport(results: HowManyResult, reportDir: string): Promise<void> {
  try {
    core.info('📊 Generating HTML report...');

    // Run HowMany again with HTML output
    const htmlArgs = [core.getInput('path') || '.', '--output', 'html', '--no-interactive'];

    await exec.exec('howmany', htmlArgs, { cwd: process.cwd() });

    // Move the generated HTML file to reports directory
    const defaultHtmlPath = 'howmany-report.html';
    const targetHtmlPath = path.join(reportDir, 'howmany-analysis.html');

    try {
      await fs.access(defaultHtmlPath);
      await fs.rename(defaultHtmlPath, targetHtmlPath);
      core.info(`📊 HTML report generated: ${targetHtmlPath}`);
    } catch {
      core.warning('HTML report generation may have failed - file not found');
    }
  } catch (error) {
    core.warning(`Failed to generate HTML report: ${error}`);
  }
}

/**
 * Generate SARIF report for GitHub Code Scanning
 */
async function generateSarifReport(results: HowManyResult, reportDir: string): Promise<void> {
  // This is a simplified SARIF implementation
  // In a full implementation, you'd want to map specific quality issues to code locations
  const sarif = {
    version: '2.1.0',
    $schema:
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    runs: [
      {
        tool: {
          driver: {
            name: 'HowMany',
            version: results.metadata.version,
            informationUri: 'https://github.com/GriffinCanCode/howmany',
            rules: [
              {
                id: 'quality-score-low',
                name: 'Low Quality Score',
                shortDescription: {
                  text: 'Overall code quality score is below recommended threshold'
                },
                fullDescription: {
                  text: 'The overall quality score indicates potential maintainability issues'
                },
                help: {
                  text: 'Improve code quality by addressing complexity, documentation, and maintainability issues'
                },
                defaultConfiguration: { level: 'warning' }
              }
            ]
          }
        },
        results: [] as Array<{
          ruleId: string;
          level: 'error' | 'warning' | 'note';
          message: { text: string };
        }>
      }
    ]
  };

  // Add quality issues as SARIF results
  if (results.ratios.quality_metrics.overall_quality_score < 70) {
    sarif.runs[0].results.push({
      ruleId: 'quality-score-low',
      level: 'warning',
      message: {
        text: `Overall quality score (${results.ratios.quality_metrics.overall_quality_score.toFixed(1)}) is below recommended threshold (70)`
      }
    });
  }

  const sarifPath = path.join(reportDir, 'howmany-results.sarif');
  await fs.writeFile(sarifPath, JSON.stringify(sarif, null, 2));
  core.info(`🔍 SARIF report generated: ${sarifPath}`);

  // Upload SARIF to GitHub Code Scanning
  await uploadSarifToGitHub(sarifPath);
}

/**
 * Upload SARIF file to GitHub Code Scanning
 */
async function uploadSarifToGitHub(sarifPath: string): Promise<void> {
  try {
    // Use GitHub's upload-sarif action functionality
    core.info('📤 Uploading SARIF to GitHub Code Scanning...');

    // Set output for potential use with upload-sarif action
    core.setOutput('sarif-file', sarifPath);

    // Log instructions for manual upload if needed
    core.info(`📋 SARIF file ready for upload: ${sarifPath}`);
    core.info('💡 To upload to GitHub Code Scanning, use:');
    core.info('   - github/codeql-action/upload-sarif@v3');
    core.info(`   - sarif_file: ${sarifPath}`);
  } catch (error) {
    core.warning(`⚠️  Failed to prepare SARIF upload: ${error}`);
  }
}

/**
 * Create or update PR comment with analysis results
 */
async function createPrComment(results: HowManyResult, _inputs: any): Promise<void> {
  try {
    const token = core.getInput('github-token') || process.env.GITHUB_TOKEN;
    if (!token) {
      core.warning('GitHub token not provided, skipping PR comment');
      return;
    }

    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;
    const pullNumber = github.context.payload.pull_request?.number;

    if (!pullNumber) {
      core.warning('Not a pull request, skipping PR comment');
      return;
    }

    const comment = generatePrComment(results);

    // Check if we already have a comment
    const comments = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pullNumber
    });

    const existingComment = comments.data.find(comment =>
      comment.body?.includes('<!-- HowMany Analysis -->')
    );

    if (existingComment) {
      // Update existing comment
      await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: existingComment.id,
        body: comment
      });
      core.info('📝 Updated existing PR comment');
    } else {
      // Create new comment
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body: comment
      });
      core.info('📝 Created new PR comment');
    }
  } catch (error) {
    core.warning(`Failed to create PR comment: ${error}`);
  }
}

/**
 * Generate PR comment content
 */
function generatePrComment(results: HowManyResult): string {
  const qualityScore = results.ratios.quality_metrics.overall_quality_score;
  const maintainability = results.complexity.quality_metrics.maintainability_index;
  const documentation = results.complexity.quality_metrics.documentation_coverage;

  const qualityIcon = qualityScore >= 80 ? '🟢' : qualityScore >= 60 ? '🟡' : '🔴';
  const maintainabilityIcon = maintainability >= 70 ? '🟢' : maintainability >= 50 ? '🟡' : '🔴';
  const docIcon = documentation >= 25 ? '🟢' : documentation >= 15 ? '🟡' : '🔴';

  return `<!-- HowMany Analysis -->
## 📊 HowMany Code Analysis

| Metric | Value | Status |
|--------|-------|--------|
| **Files Analyzed** | ${results.basic.total_files.toLocaleString()} | |
| **Total Lines** | ${results.basic.total_lines.toLocaleString()} | |
| **Code Lines** | ${results.basic.code_lines.toLocaleString()} | |
| **Overall Quality** | ${qualityScore.toFixed(1)}/100 | ${qualityIcon} |
| **Maintainability** | ${maintainability.toFixed(1)}/100 | ${maintainabilityIcon} |
| **Documentation** | ${documentation.toFixed(1)}% | ${docIcon} |

### 🏆 Quality Metrics
${results.ratios.quality_metrics.overall_quality_score.toFixed(1)}/100

---
*Analysis generated by [HowMany](https://github.com/GriffinCanCode/howmany) v${results.metadata.version}*`;
}

export { run };
