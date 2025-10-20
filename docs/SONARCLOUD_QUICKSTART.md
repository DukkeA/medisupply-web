# SonarCloud Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Sign Up & Create Project

```bash
1. Go to https://sonarcloud.io
2. Sign in with GitHub
3. Click "+" → "Analyze new project"
4. Select "medisupply-web" repository
5. Choose "With GitHub Actions"
```

### 2. Get Your Keys

- **Organization Key**: Found in SonarCloud → My Organizations → [Your Org] → Administration → Organization Key
- **Project Key**: Should be `medisupply-web` (default)

### 3. Update Configuration

Edit `sonar-project.properties`:

```properties
sonar.organization=YOUR_ORGANIZATION_KEY_HERE
```

### 4. Add GitHub Secret

```bash
1. SonarCloud → My Account → Security → Generate Token
2. GitHub → Settings → Secrets and variables → Actions → New secret
3. Name: SONAR_TOKEN
4. Value: [Paste token from step 1]
```

### 5. Push & Verify

```bash
git add .
git commit -m "feat: add SonarCloud integration"
git push origin develop
```

Check GitHub Actions → SonarCloud Analysis workflow should run automatically.

**Note:** The workflow will pass even without `SONAR_TOKEN` - it will just skip the SonarCloud scan with a notice. This allows the CI pipeline to pass while you're setting up SonarCloud.

## 📊 View Results

Visit: `https://sonarcloud.io/project/overview?id=medisupply-web`

## 🎯 Quality Gates

Current standards:

- ✅ Coverage: ≥90%
- ✅ Maintainability: A rating
- ✅ Reliability: A rating
- ✅ Security: A rating

## 🔍 Local Testing

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

## 📝 Badges for README

Add these badges to your README.md:

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=medisupply-web&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=medisupply-web)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=medisupply-web&metric=coverage)](https://sonarcloud.io/summary/new_code?id=medisupply-web)
```

## 🆘 Common Issues

| Issue                   | Solution                                                          |
| ----------------------- | ----------------------------------------------------------------- |
| "SONAR_TOKEN not found" | Add secret in GitHub Settings → Secrets → Actions                 |
| No coverage data        | Run `npm run test:coverage` and check `coverage/lcov.info` exists |
| Wrong organization      | Update `sonar.organization` in `sonar-project.properties`         |

## 📚 Full Documentation

See [SONARCLOUD_SETUP.md](./SONARCLOUD_SETUP.md) for detailed instructions.

## ✅ Checklist

- [ ] Created SonarCloud account
- [ ] Created project in SonarCloud
- [ ] Updated `sonar.organization` in config file
- [ ] Added `SONAR_TOKEN` to GitHub secrets
- [ ] Pushed changes to trigger workflow
- [ ] Verified workflow runs successfully
- [ ] Checked SonarCloud dashboard shows results
- [ ] Added badges to README (optional)
