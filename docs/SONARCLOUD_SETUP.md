# SonarCloud Setup Guide

This guide will help you set up SonarCloud for static code analysis and coverage checks on the MediSupply Web project.

## Prerequisites

- GitHub account with admin access to the repository
- SonarCloud account (you can sign up with your GitHub account at https://sonarcloud.io)

## Step 1: Create SonarCloud Organization

1. Go to https://sonarcloud.io
2. Click "Log in" and authenticate with GitHub
3. Click on the "+" icon in the top right corner
4. Select "Analyze new project"
5. Click "Import an organization from GitHub"
6. Select your GitHub organization or create a new one
7. Note down your organization key (you'll need this later)

## Step 2: Create SonarCloud Project

1. In SonarCloud, go to "My Projects"
2. Click "+" and select "Analyze new project"
3. Select the `medisupply-web` repository
4. Click "Set Up"
5. Choose "With GitHub Actions" as the analysis method
6. Note down the project key (should be `medisupply-web`)

## Step 3: Update SonarCloud Configuration

1. Open `sonar-project.properties` in the root of the project
2. Update the following line with your organization key:
   ```properties
   sonar.organization=your-organization-key
   ```
   Replace `your-organization-key` with the organization key from Step 1

## Step 4: Add SonarCloud Token to GitHub Secrets

1. In SonarCloud, go to your account settings (click on your avatar → My Account)
2. Go to "Security" tab
3. Generate a new token:
   - Name: `medisupply-web-github-actions`
   - Type: User Token
   - Click "Generate"
4. Copy the generated token

5. In GitHub, go to your repository
6. Navigate to Settings → Secrets and variables → Actions
7. Click "New repository secret"
8. Add the secret:
   - Name: `SONAR_TOKEN`
   - Value: Paste the token you copied from SonarCloud
9. Click "Add secret"

## Step 5: Verify the Setup

The SonarCloud analysis will run automatically on:

- Push to `main`, `develop`, `release/**`, or `hotfix/**` branches
- Pull requests to `main`, `develop`, or `release/**` branches

**Important:** The workflow is configured to gracefully skip SonarCloud analysis if `SONAR_TOKEN` is not configured. This means:

- ✅ The workflow will **pass** even without the token
- ⚠️ A notice will appear that SonarCloud was skipped
- 🔧 This allows the CI pipeline to work while you're setting up SonarCloud

To verify the setup:

1. Create a new branch and make a small change
2. Push the branch and create a pull request
3. Check the "Checks" tab in the pull request to see the SonarCloud analysis running
4. After the workflow completes, go to https://sonarcloud.io to view the analysis results

## Step 6: Add SonarCloud Badge (Optional)

1. In SonarCloud, go to your project dashboard
2. Click on "Project Information" in the bottom right
3. Copy the badge markdown
4. Add it to your `README.md` file

Example:

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=medisupply-web&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=medisupply-web)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=medisupply-web&metric=coverage)](https://sonarcloud.io/summary/new_code?id=medisupply-web)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=medisupply-web&metric=bugs)](https://sonarcloud.io/summary/new_code?id=medisupply-web)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=medisupply-web&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=medisupply-web)
```

## Running Coverage Locally

To generate coverage reports locally:

```bash
# Run tests with coverage
npm run test:coverage

# View the HTML coverage report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

## Understanding SonarCloud Metrics

### Quality Gate

- **Passed**: Your code meets all quality criteria
- **Failed**: Your code has issues that need to be addressed

### Key Metrics

- **Coverage**: Percentage of code covered by tests (target: 90%)
- **Bugs**: Potential runtime errors
- **Vulnerabilities**: Security issues
- **Code Smells**: Maintainability issues
- **Duplications**: Repeated code blocks
- **Technical Debt**: Estimated time to fix all issues

## Troubleshooting

### Workflow Shows "SonarCloud analysis was skipped"

This is **normal behavior** when `SONAR_TOKEN` is not configured:

- ✅ The workflow passes successfully
- ℹ️ A notice indicates that SonarCloud was skipped
- 🔧 Follow Step 4 to add the `SONAR_TOKEN` secret

### Workflow Fails with "SONAR_TOKEN not found" (Legacy Issue)

This should not happen with the current configuration, but if it does:

- Ensure you've added the `SONAR_TOKEN` secret to GitHub (Step 4)
- The secret name must be exactly `SONAR_TOKEN`
- The workflow has been updated to skip gracefully if the token is missing

### Analysis Shows No Coverage

- Ensure tests are running successfully: `npm run test:coverage`
- Check that `coverage/lcov.info` file is generated
- Verify the `sonar.javascript.lcov.reportPaths` path in `sonar-project.properties`

### Wrong Organization or Project Key

- Update `sonar.organization` in `sonar-project.properties`
- Ensure `sonar.projectKey` matches your SonarCloud project key

### Analysis Fails During Workflow

- Check the workflow logs in GitHub Actions
- Ensure all dependencies are installed correctly
- Verify that the API client generation step succeeds

## Quality Standards

This project maintains the following quality standards:

- **Code Coverage**: Minimum 90% (branches, functions, lines, statements)
- **Maintainability Rating**: A
- **Reliability Rating**: A
- **Security Rating**: A
- **Technical Debt Ratio**: ≤ 5%

## Additional Resources

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [GitHub Actions Integration](https://docs.sonarcloud.io/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud/)
- [SonarCloud Metric Definitions](https://docs.sonarcloud.io/digging-deeper/metric-definitions/)
- [Quality Gates](https://docs.sonarcloud.io/improving/quality-gates/)

## Support

If you encounter any issues with the SonarCloud setup, please:

1. Check the troubleshooting section above
2. Review the GitHub Actions workflow logs
3. Check the SonarCloud project settings
4. Create an issue in the repository with detailed information
