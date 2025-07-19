import * as core from '@actions/core';
import { HowManyResult, QualityGate, QualityGateResult, QualityViolation } from '../types/howmany';

export class QualityGateEvaluator {
  private qualityGate: QualityGate;

  constructor(qualityGate: QualityGate) {
    this.qualityGate = qualityGate;
  }

  /**
   * Evaluate quality gate against HowMany results
   */
  evaluate(results: HowManyResult): QualityGateResult {
    const violations: QualityViolation[] = [];
    const recommendations: string[] = [];

    // Extract scores from the results
    const overallScore = results.ratios.quality_metrics.overall_quality_score;
    const maintainabilityScore = results.complexity.quality_metrics.maintainability_index;
    const documentationScore = results.complexity.quality_metrics.documentation_coverage;
    const complexityScore = results.complexity.quality_metrics.avg_complexity;

    // Check overall quality score
    if (overallScore < this.qualityGate.overall_quality_threshold) {
      violations.push({
        rule: 'overall-quality',
        message: `Overall quality score (${overallScore.toFixed(1)}) is below threshold (${this.qualityGate.overall_quality_threshold})`,
        severity: 'error',
        actual_value: overallScore,
        threshold_value: this.qualityGate.overall_quality_threshold
      });
      recommendations.push(
        'Improve code quality by addressing complexity, documentation, and maintainability issues'
      );
    }

    // Check maintainability score
    if (maintainabilityScore < this.qualityGate.maintainability_threshold) {
      violations.push({
        rule: 'maintainability',
        message: `Maintainability score (${maintainabilityScore.toFixed(1)}) is below threshold (${this.qualityGate.maintainability_threshold})`,
        severity: 'error',
        actual_value: maintainabilityScore,
        threshold_value: this.qualityGate.maintainability_threshold
      });
      recommendations.push('Refactor large functions and reduce cyclomatic complexity');
    }

    // Check documentation coverage
    if (documentationScore < this.qualityGate.documentation_threshold) {
      violations.push({
        rule: 'documentation-coverage',
        message: `Documentation coverage (${documentationScore.toFixed(1)}%) is below threshold (${this.qualityGate.documentation_threshold}%)`,
        severity: 'warning',
        actual_value: documentationScore,
        threshold_value: this.qualityGate.documentation_threshold
      });
      recommendations.push('Add more comments and documentation to improve code understanding');
    }

    // Check complexity (higher is worse, so we check if it's above threshold)
    if (complexityScore > this.qualityGate.complexity_threshold) {
      violations.push({
        rule: 'complexity',
        message: `Average complexity (${complexityScore.toFixed(1)}) exceeds threshold (${this.qualityGate.complexity_threshold})`,
        severity: 'warning',
        actual_value: complexityScore,
        threshold_value: this.qualityGate.complexity_threshold
      });
      recommendations.push('Break down complex functions into smaller, focused methods');
    }

    // Additional recommendations based on the analysis
    this.addContextualRecommendations(results, recommendations);

    const passed = violations.filter(v => v.severity === 'error').length === 0;

    return {
      passed,
      overall_score: overallScore,
      maintainability_score: maintainabilityScore,
      documentation_score: documentationScore,
      complexity_score: complexityScore,
      violations,
      recommendations
    };
  }

  /**
   * Add contextual recommendations based on the analysis results
   */
  private addContextualRecommendations(results: HowManyResult, recommendations: string[]): void {
    const { complexity, ratios, basic } = results;

    // High technical debt
    if (complexity.quality_metrics.technical_debt_ratio > 40) {
      recommendations.push('High technical debt detected - prioritize refactoring efforts');
    }

    // Low function size health
    if (complexity.quality_metrics.function_size_health < 60) {
      recommendations.push('Consider breaking down large functions for better maintainability');
    }

    // High nesting depth
    if (complexity.max_nesting_depth > 5) {
      recommendations.push('Reduce nesting depth by extracting methods or using early returns');
    }

    // Low code ratio (too many comments/blanks)
    if (ratios.code_ratio < 0.6) {
      recommendations.push(
        'Code ratio is low - review if there are too many comments or blank lines'
      );
    }

    // Large codebase without good documentation
    if (basic.total_lines > 10000 && ratios.quality_metrics.documentation_score < 50) {
      recommendations.push(
        'Large codebase detected - improve documentation for better maintainability'
      );
    }

    // Many files but low consistency
    if (basic.total_files > 50 && ratios.quality_metrics.consistency_score < 70) {
      recommendations.push('Improve consistency in coding style across files');
    }

    // High code duplication
    if (complexity.quality_metrics.code_duplication_ratio > 15) {
      recommendations.push('High code duplication detected - extract common functionality');
    }
  }

  /**
   * Format quality gate result for logging
   */
  formatResult(result: QualityGateResult): string {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    const lines = [
      `Quality Gate: ${status}`,
      '',
      '📊 Scores:',
      `  Overall Quality: ${result.overall_score.toFixed(1)}/100`,
      `  Maintainability: ${result.maintainability_score.toFixed(1)}/100`,
      `  Documentation: ${result.documentation_score.toFixed(1)}%`,
      `  Avg Complexity: ${result.complexity_score.toFixed(1)}`,
      ''
    ];

    if (result.violations.length > 0) {
      lines.push('🚨 Violations:');
      for (const violation of result.violations) {
        const icon = violation.severity === 'error' ? '❌' : '⚠️';
        lines.push(`  ${icon} ${violation.message}`);
      }
      lines.push('');
    }

    if (result.recommendations.length > 0) {
      lines.push('💡 Recommendations:');
      for (const recommendation of result.recommendations) {
        lines.push(`  • ${recommendation}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Log quality gate result
   */
  logResult(result: QualityGateResult): void {
    const formatted = this.formatResult(result);

    if (result.passed) {
      core.info(formatted);
    } else {
      core.error(formatted);
    }

    // Set individual outputs
    core.setOutput('quality-score', result.overall_score.toString());
    core.setOutput('maintainability-score', result.maintainability_score.toString());
    core.setOutput('documentation-score', result.documentation_score.toString());
    core.setOutput('complexity-score', result.complexity_score.toString());
    core.setOutput('passed', result.passed.toString());
    core.setOutput('recommendations', JSON.stringify(result.recommendations));
  }

  /**
   * Create quality gate from action inputs
   */
  static fromInputs(): QualityGate {
    return {
      overall_quality_threshold: parseFloat(core.getInput('quality-threshold') || '70'),
      maintainability_threshold: parseFloat(core.getInput('maintainability-threshold') || '65'),
      documentation_threshold: parseFloat(core.getInput('documentation-threshold') || '20'),
      complexity_threshold: parseFloat(core.getInput('complexity-threshold') || '10')
    };
  }
}
