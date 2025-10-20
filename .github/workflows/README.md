# GitHub Actions Workflows

This directory contains CI/CD workflows for the MediSupply Web project.

## Workflows

### 🔍 CI Pipeline (`ci.yml`)

Runs on every push and pull request to main branches.

**Includes:**

- Code formatting checks
- Linting
- Type checking
- Tests with coverage
- Build verification
- Codecov integration

### 📊 SonarCloud Analysis (`sonarcloud.yml`)

Automated static code analysis and coverage reporting.

**Features:**

- Runs tests with coverage
- Uploads results to SonarCloud
- **Gracefully skips if `SONAR_TOKEN` is not configured** ✨
- Provides helpful notices when skipped

**Setup Required:**

1. Add `SONAR_TOKEN` to repository secrets
2. Update `sonar.organization` in `sonar-project.properties`
3. See `docs/SONARCLOUD_QUICKSTART.md` for 5-minute setup

**Note:** This workflow will **pass** even without SonarCloud configured, allowing the CI pipeline to work while you set it up.

### 🚀 Pull Request Validation (`pr-validation.yml`)

Additional checks for pull requests.

### 📦 Release (`release.yml`)

Handles release automation and deployments.

## Secrets Required

| Secret         | Required      | Workflow   | Description                                        |
| -------------- | ------------- | ---------- | -------------------------------------------------- |
| `GITHUB_TOKEN` | ✅ (auto)     | All        | Automatically provided by GitHub                   |
| `SONAR_TOKEN`  | ⚠️ (optional) | SonarCloud | Token from SonarCloud (workflow passes without it) |

## Monitoring Workflows

View workflow runs:

- Go to **Actions** tab in GitHub repository
- Select a workflow from the left sidebar
- Click on a specific run to see details

## Troubleshooting

### SonarCloud shows "Skipped" notice

This is normal if you haven't set up SonarCloud yet:

- The workflow will pass ✅
- You'll see a notice that SonarCloud was skipped
- Follow `docs/SONARCLOUD_QUICKSTART.md` to enable it

### Workflow fails on fork

Forks don't have access to repository secrets by default:

- This is expected GitHub security behavior
- SonarCloud will be skipped automatically
- Other checks should still run

## Adding New Workflows

When creating new workflows:

1. Use clear, descriptive names
2. Document required secrets
3. Add graceful degradation for missing secrets
4. Update this README
5. Test on a feature branch first

## Best Practices

- ✅ Keep workflows fast and efficient
- ✅ Use caching for dependencies (`cache: 'npm'`)
- ✅ Handle missing secrets gracefully
- ✅ Provide helpful error messages
- ✅ Document all required setup steps
