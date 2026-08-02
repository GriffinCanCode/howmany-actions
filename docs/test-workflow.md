# 🧪 Testing the HowMany GitHub Action

## Quick Test Workflow

To test the deployed HowMany GitHub Action, create this workflow in any repository:

### 1. Create Test Workflow File

Create `.github/workflows/test-howmany.yml`:

```yaml
name: Test HowMany Action
on: 
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-howmany:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v7
      
      - name: Run HowMany Analysis
        uses: GriffinCanCode/howmany-actions@v1
        with:
          path: '.'
          verbose: true
          create-pr-comment: true
          quality-threshold: 70
          fail-on-quality-gate: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload Analysis Report
        uses: actions/upload-artifact@v7
        with:
          name: howmany-analysis
          path: howmany-reports/
```

### 2. Advanced Test with Quality Gate

```yaml
name: Quality Gate Test
on: [pull_request]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v7
      
      - name: HowMany Quality Gate
        uses: GriffinCanCode/howmany-actions@v1
        with:
          path: '.'
          fail-on-quality-gate: true
          quality-threshold: 75
          maintainability-threshold: 70
          documentation-threshold: 20
          complexity-threshold: 10
          create-pr-comment: true
          upload-sarif: true
          verbose: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 3. Multi-Language Project Test

```yaml
name: Multi-Language Analysis
on: [push]

jobs:
  analyze:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        component:
          - { name: 'backend', path: './backend', extensions: 'rs,toml' }
          - { name: 'frontend', path: './frontend', extensions: 'js,ts,jsx,tsx' }
          - { name: 'docs', path: './docs', extensions: 'md,rst' }
    
    steps:
      - uses: actions/checkout@v7
      
      - name: Analyze ${{ matrix.component.name }}
        uses: GriffinCanCode/howmany-actions@v1
        with:
          path: ${{ matrix.component.path }}
          extensions: ${{ matrix.component.extensions }}
          output-format: 'html'
          artifact-name: ${{ matrix.component.name }}-analysis
          verbose: true
```

## Expected Results

### ✅ Success Indicators

1. **Action Runs Successfully**
   - No installation errors
   - HowMany CLI downloads and installs properly
   - Analysis completes within 30 seconds

2. **Outputs Generated**
   - `howmany-reports/` directory created
   - JSON report with complete analysis data
   - HTML report (if requested)
   - SARIF report (if enabled)

3. **GitHub Integration Works**
   - PR comments appear with analysis results
   - Action outputs are set correctly
   - Artifacts uploaded successfully

### 📊 Sample Output

The action should produce output similar to:
```
📊 HowMany Analysis Results:
   • Files: 45
   • Lines: 12,847
   • Quality Score: 78.3/100
   • Time Estimate: 2 days, 4 hours
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure `GITHUB_TOKEN` is provided
   - Check repository permissions for PR comments

2. **Installation Fails**
   - Verify runner has internet access
   - Check if Rust/Cargo installation succeeds

3. **Analysis Fails**
   - Verify target path exists
   - Check file extensions are supported
   - Review ignore patterns

### Debug Mode

For debugging, add:
```yaml
- name: Debug HowMany
  uses: GriffinCanCode/howmany-actions@v1
  with:
    path: '.'
    verbose: true
    show-files: true
  env:
    ACTIONS_STEP_DEBUG: true
```

## Repository Links

- **Action Repository**: https://github.com/GriffinCanCode/howmany-actions
- **Release**: https://github.com/GriffinCanCode/howmany-actions/releases/tag/v1.0.0
- **Marketplace**: (Coming soon after publication)

---

**Ready to test!** 🚀 The action is deployed and available for immediate use. 