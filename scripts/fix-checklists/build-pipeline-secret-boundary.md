# build-pipeline-secret-boundary — manual fix checklist

Diagnostics found: **2**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### .github/workflows/ci.yml

- L80: The build or install pipeline can execute package lifecycle code while CI secrets may be present.

### .github/workflows/vex-ci.yml

- L98: The build or install pipeline can execute package lifecycle code while CI secrets may be present.
