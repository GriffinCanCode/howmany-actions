/**
 * TypeScript interfaces for HowMany JSON output
 * Based on the actual Rust structs from the codebase
 */

export interface HowManyResult {
  basic: BasicStats;
  complexity: ComplexityStats;
  time: TimeStats;
  ratios: RatioStats;
  metadata: StatsMetadata;
}

export interface BasicStats {
  total_files: number;
  total_lines: number;
  code_lines: number;
  comment_lines: number;
  doc_lines: number;
  blank_lines: number;
  total_size: number;
  stats_by_extension: Record<string, ExtensionStats>;
}

export interface ExtensionStats {
  file_count: number;
  total_lines: number;
  code_lines: number;
  comment_lines: number;
  doc_lines: number;
  blank_lines: number;
  total_size: number;
}

export interface ComplexityStats {
  function_count: number;
  cyclomatic_complexity: number;
  cognitive_complexity: number;
  max_nesting_depth: number;
  average_function_length: number;
  total_function_lines: number;
  average_parameters_per_function: number;
  max_parameters_per_function: number;
  maintainability_index: number;
  complexity_distribution: ComplexityDistribution;
  structure_distribution: StructureDistribution;
  total_structures: number;
  methods_per_class: number;
  quality_metrics: QualityMetrics;
}

export interface ComplexityDistribution {
  very_low: number;
  low: number;
  medium: number;
  high: number;
  very_high: number;
}

export interface StructureDistribution {
  classes: number;
  interfaces: number;
  traits: number;
  enums: number;
  structs: number;
  modules: number;
}

export interface QualityMetrics {
  code_health_score: number;
  maintainability_index: number;
  documentation_coverage: number;
  avg_complexity: number;
  function_size_health: number;
  nesting_depth_health: number;
  code_duplication_ratio: number;
  technical_debt_ratio: number;
}

export interface TimeStats {
  total_time_formatted: string;
  code_time_formatted: string;
  doc_time_formatted: string;
  total_development_hours: number;
  code_development_hours: number;
  documentation_hours: number;
  estimated_team_size: number;
  project_maturity: string;
}

export interface RatioStats {
  code_ratio: number;
  comment_ratio: number;
  doc_ratio: number;
  blank_ratio: number;
  comment_to_code_ratio: number;
  doc_to_code_ratio: number;
  ratios_by_extension: Record<string, ExtensionRatios>;
  language_distribution: Record<string, number>;
  file_distribution: Record<string, number>;
  size_distribution: Record<string, number>;
  quality_metrics: RatioQualityMetrics;
}

export interface ExtensionRatios {
  code_ratio: number;
  comment_ratio: number;
  doc_ratio: number;
  blank_ratio: number;
  comment_to_code_ratio: number;
  doc_to_code_ratio: number;
  lines_per_file: number;
  size_per_file: number;
}

export interface RatioQualityMetrics {
  documentation_score: number;
  maintainability_score: number;
  readability_score: number;
  consistency_score: number;
  overall_quality_score: number;
}

export interface StatsMetadata {
  calculation_time_ms: number;
  version: string;
  timestamp: string;
  file_count_analyzed: number;
  total_bytes_analyzed: number;
  languages_detected: string[];
  analysis_depth: string;
}

// Quality Gate Configuration
export interface QualityGate {
  overall_quality_threshold: number;
  maintainability_threshold: number;
  documentation_threshold: number;
  complexity_threshold: number;
}

// Quality Gate Result
export interface QualityGateResult {
  passed: boolean;
  overall_score: number;
  maintainability_score: number;
  documentation_score: number;
  complexity_score: number;
  violations: QualityViolation[];
  recommendations: string[];
}

export interface QualityViolation {
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  actual_value: number;
  threshold_value: number;
}

// SARIF Format Support
export interface SarifReport {
  version: string;
  $schema: string;
  runs: SarifRun[];
}

export interface SarifRun {
  tool: SarifTool;
  results: SarifResult[];
}

export interface SarifTool {
  driver: SarifDriver;
}

export interface SarifDriver {
  name: string;
  version: string;
  informationUri: string;
  rules: SarifRule[];
}

export interface SarifRule {
  id: string;
  name: string;
  shortDescription: SarifMessage;
  fullDescription: SarifMessage;
  help: SarifMessage;
  defaultConfiguration: SarifConfiguration;
}

export interface SarifMessage {
  text: string;
}

export interface SarifConfiguration {
  level: 'error' | 'warning' | 'note' | 'none';
}

export interface SarifResult {
  ruleId: string;
  level: 'error' | 'warning' | 'note';
  message: SarifMessage;
  locations?: SarifLocation[];
}

export interface SarifLocation {
  physicalLocation: SarifPhysicalLocation;
}

export interface SarifPhysicalLocation {
  artifactLocation: SarifArtifactLocation;
  region: SarifRegion;
}

export interface SarifArtifactLocation {
  uri: string;
}

export interface SarifRegion {
  startLine: number;
  startColumn?: number;
  endLine?: number;
  endColumn?: number;
} 