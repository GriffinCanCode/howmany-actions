# HowMany GitHub Action

A GitHub Action for comprehensive code analysis using [HowMany](https://github.com/GriffinCanCode/howmany). This action provides detailed insights into code quality, complexity, maintainability, and development time estimates.

## Features

- 🔍 **Comprehensive Analysis**: Lines of code, complexity metrics, quality scores
- 📊 **Quality Gates**: Fail builds based on configurable quality thresholds
- 📝 **PR Comments**: Automatic pull request comments with analysis results
- 📈 **Multiple Formats**: JSON, HTML, and SARIF output support
- 🚀 **Fast Installation**: Automatic installation of HowMany CLI
- 🎯 **Targeted Analysis**: Support for specific file extensions and paths
- 📋 **GitHub Integration**: Native integration with GitHub workflows

## Quick Start

```yaml
name: Code Analysis
on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: GriffinCanCode/howmany-action@v1
        with:
          path: '.'
          output-format: 'json'
          create-pr-comment: true
```

## Inputs

### Basic Analysis Options

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `path` | Directory to analyze | No | `.` |
| `output-format` | Output format: `text`, `json`, `csv`, `html` | No | `json` |
| `show-files` | Show individual file statistics | No | `false` |
| `verbose` | Show detailed breakdown by extension | No | `true` |
| `max-depth` | Maximum directory depth to traverse | No | |
| `extensions` | Specific extensions to analyze (comma-separated) | No | |
| `include-hidden` | Include hidden files and directories | No | `false` |
| `sort-by` | Sort by: `files`, `lines`, `code`, `comments`, `size` | No | `lines` |
| `descending` | Sort in descending order | No | `true` |
| `ignore-patterns` | Additional ignore patterns (comma-separated) | No | |

### Quality Gate Options

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `fail-on-quality-gate` | Fail if quality gate not met | No | `false` |
| `quality-threshold` | Minimum overall quality score (0-100) | No | `70` |
| `maintainability-threshold` | Minimum maintainability score (0-100) | No | `65` |
| `documentation-threshold` | Minimum documentation coverage (0-100) | No | `20` |
| `complexity-threshold` | Maximum average complexity per function | No | `10` |

### Output Options

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `create-pr-comment` | Create/update PR comment with results | No | `true` |
| `upload-sarif` | Generate SARIF report for Code Scanning | No | `false` |
| `artifact-name` | Name for uploaded report artifact | No | `howmany-report` |

### Installation Options

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `howmany-version` | HowMany version to install | No | `latest` |

## Outputs

| Output | Description |
|--------|-------------|
| `report-path` | Path to generated report file |
| `quality-score` | Overall quality score (0-100) |
| `maintainability-score` | Maintainability index score (0-100) |
| `documentation-score` | Documentation coverage score (0-100) |
| `complexity-score` | Average complexity per function |
| `total-files` | Total number of files analyzed |
| `total-lines` | Total lines of code |
| `code-lines` | Lines of actual code |
| `comment-lines` | Lines of comments |
| `passed` | Whether quality gate passed (true/false) |
| `recommendations` | Quality improvement recommendations (JSON) |

## Usage Examples

### Basic Analysis

```yaml
name: Code Analysis
on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Analyze code
        uses: GriffinCanCode/howmany-action@v1
        with:
          path: './src'
          verbose: true
```

### Quality Gate with PR Comments

```yaml
name: Quality Gate
on: [pull_request]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Quality Gate
        uses: GriffinCanCode/howmany-action@v1
        with:
          fail-on-quality-gate: true
          quality-threshold: 80
          maintainability-threshold: 70
          documentation-threshold: 25
          complexity-threshold: 8
          create-pr-comment: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Multi-Language Analysis

```yaml
name: Multi-Language Analysis
on: [push]

jobs:
  analyze-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Analyze Rust Backend
        uses: GriffinCanCode/howmany-action@v1
        with:
          path: './backend'
          extensions: 'rs,toml'
          artifact-name: 'backend-analysis'
  
  analyze-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Analyze JavaScript Frontend
        uses: GriffinCanCode/howmany-action@v1
        with:
          path: './frontend'
          extensions: 'js,ts,jsx,tsx,vue'
          artifact-name: 'frontend-analysis'
```

### HTML Report Generation

```yaml
name: Generate Reports
on: [push]

jobs:
  reports:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate HTML Report
        uses: GriffinCanCode/howmany-action@v1
        with:
          output-format: 'html'
          show-files: true
          verbose: true
      
      - name: Upload HTML Report
        uses: actions/upload-artifact@v4
        with:
          name: howmany-html-report
          path: howmany-reports/
```

### Security Scanning Integration

```yaml
name: Security and Quality Scan
on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - name: Code Quality Analysis
        uses: GriffinCanCode/howmany-action@v1
        with:
          upload-sarif: true
          fail-on-quality-gate: true
          quality-threshold: 75
      
      - name: Upload SARIF to GitHub
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: howmany-reports/howmany-results.sarif
```

### Conditional Analysis

```yaml
name: Conditional Analysis
on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Analyze on main branch
        if: github.ref == 'refs/heads/main'
        uses: GriffinCanCode/howmany-action@v1
        with:
          fail-on-quality-gate: true
          quality-threshold: 85
      
      - name: Analyze on PR
        if: github.event_name == 'pull_request'
        uses: GriffinCanCode/howmany-action@v1
        with:
          create-pr-comment: true
          quality-threshold: 70
```

### Matrix Strategy for Multiple Projects

```yaml
name: Multi-Project Analysis
on: [push]

jobs:
  analyze:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        project: 
          - { name: 'backend', path: './backend', extensions: 'rs,toml' }
          - { name: 'frontend', path: './frontend', extensions: 'js,ts,vue' }
          - { name: 'docs', path: './docs', extensions: 'md,rst' }
    
    steps:
      - uses: actions/checkout@v4
      - name: Analyze ${{ matrix.project.name }}
        uses: GriffinCanCode/howmany-action@v1
        with:
          path: ${{ matrix.project.path }}
          extensions: ${{ matrix.project.extensions }}
          artifact-name: ${{ matrix.project.name }}-analysis
```

## Quality Metrics

The action evaluates several quality metrics:

### Overall Quality Score (0-100)
Weighted combination of all quality factors:
- **85-100**: Excellent code quality
- **70-84**: Good code quality
- **55-69**: Fair code quality
- **40-54**: Poor code quality
- **0-39**: Very poor code quality

### Maintainability Index (0-100)
Industry-standard metric based on:
- Cyclomatic complexity
- Lines of code
- Halstead volume
- Comment density

### Documentation Coverage (0-100%)
Percentage of code with documentation:
- Comments and docstrings
- README and documentation files
- Inline code comments

### Complexity Metrics
- **Cyclomatic Complexity**: Decision points in code
- **Cognitive Complexity**: Mental effort to understand
- **Nesting Depth**: Maximum indentation levels
- **Function Length**: Average and maximum sizes

## PR Comment Example

When `create-pr-comment` is enabled, the action creates rich PR comments:

```markdown
## 📊 HowMany Code Analysis

| Metric | Value | Status |
|--------|-------|--------|
| **Files Analyzed** | 127 | |
| **Total Lines** | 15,847 | |
| **Code Lines** | 11,234 | |
| **Overall Quality** | 82.4/100 | 🟢 |
| **Maintainability** | 78.2/100 | 🟢 |
| **Documentation** | 75.1% | 🟢 |

### 🕒 Development Time Estimate
3 days, 2 hours

### 🏗️ Project Structure
- **rs**: 45 files, 8,234 lines
- **js**: 32 files, 4,123 lines
- **py**: 28 files, 2,456 lines
- **md**: 15 files, 1,034 lines
```

## Troubleshooting

### Installation Issues

If HowMany installation fails:
1. Ensure the runner has Rust/Cargo available
2. Check network connectivity for crates.io
3. Try specifying a specific version instead of 'latest'

```yaml
- uses: GriffinCanCode/howmany-action@v1
  with:
    howmany-version: '0.3.2'
```

### Permission Issues

For PR comments and SARIF uploads:

```yaml
permissions:
  contents: read
  pull-requests: write  # For PR comments
  security-events: write  # For SARIF upload
```

### Large Repositories

For very large repositories, consider:
- Setting `max-depth` to limit traversal
- Using specific `extensions` to focus analysis
- Adding `ignore-patterns` for irrelevant directories

```yaml
- uses: GriffinCanCode/howmany-action@v1
  with:
    max-depth: 5
    extensions: 'rs,py,js'
    ignore-patterns: 'vendor,node_modules,target'
```

## Contributing

Contributions are welcome! Please see the [contributing guide](CONTRIBUTING.md) for details.

## License

This action is distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## Related Projects

- [HowMany CLI](https://github.com/GriffinCanCode/howmany) - The core analysis tool
- [HowMany VS Code Extension](https://github.com/GriffinCanCode/howmany-vscode) - IDE integration 