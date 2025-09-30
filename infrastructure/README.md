# Infrastructure Setup

This directory contains Terraform configurations for deploying the MediSupply Web application infrastructure on AWS.

## Architecture

### Production Environment (`infrastructure/main/`)

- **S3 Bucket**: Static website hosting with encryption
- **CloudFront**: Global CDN for performance and SSL termination
- **SSL Certificate**: Automatic HTTPS with custom domain (optional)
- **Cost Optimization**:
  - CloudFront PriceClass_100 (North America & Europe only)
  - S3 lifecycle rules for cleanup
  - Suspended versioning by default

### PR Environments (`infrastructure/modules/pr-environment/`)

- **Temporary S3 Buckets**: One per pull request with `pr-{number}-` prefix
- **Public Access**: Direct S3 website hosting (no CloudFront for cost savings)
- **Auto Cleanup**: 7-day TTL with lifecycle rules
- **GitHub Integration**: Automatic deploy/destroy on PR open/close

## Cost Estimates (Monthly)

### Production Environment

- **S3 Storage**: ~$0.02/GB (first 50 TB)
- **CloudFront**: $0.085/GB (first 10 TB) + $0.01/10k requests
- **SSL Certificate**: Free (ACM)
- **Estimated Total**: $5-15/month for typical usage

### PR Environments

- **S3 Storage**: ~$0.02/GB per environment
- **Data Transfer**: $0.09/GB
- **Estimated Cost per PR**: $1-3 for 7-day lifecycle

## Setup Instructions

### Prerequisites

1. AWS Account with programmatic access
2. Terraform >= 1.0 installed
3. Domain name (optional, for custom SSL)
4. AWS credentials configured (via AWS CLI, environment variables, or IAM roles)

### Production Deployment

1. **Configure AWS credentials** (choose one method):

   ```bash
   # Option 1: AWS CLI
   aws configure

   # Option 2: Environment variables
   export AWS_ACCESS_KEY_ID="your-access-key"
   export AWS_SECRET_ACCESS_KEY="your-secret-key"
   ```

2. **Initialize Terraform**:

   ```bash
   cd infrastructure/main
   terraform init
   ```

3. **Create terraform.tfvars** (optional):

   ```hcl
   project_name = "medisupply-web"
   environment = "prod"
   domain_name = "your-domain.com"  # Optional
   enable_ssl = true                # Only if domain_name is set
   aws_region = "us-east-1"
   ```

4. **Deploy infrastructure**:

   ```bash
   terraform plan
   terraform apply
   ```

5. **Configure DNS** (if using custom domain):
   - Add CNAME record: `your-domain.com` → CloudFront domain
   - Add certificate validation records to your DNS

### PR Environment Setup

1. **Configure GitHub Secrets**:
   - `AWS_ACCESS_KEY_ID`: AWS access key (contact admin)
   - `AWS_SECRET_ACCESS_KEY`: AWS secret key (contact admin)

2. **Enable GitHub Actions**:
   - The workflows will automatically run on PR events
   - Each PR gets a unique environment with URL: `http://pr-{number}-medisupply-web-{suffix}.s3-website-us-east-1.amazonaws.com`

### Deployment Process

1. **Build the application**:

   ```bash
   yarn build
   ```

2. **Deploy to S3**:

   ```bash
   # Production
   aws s3 sync ./out s3://your-production-bucket --delete

   # PR Environment (handled automatically by GitHub Actions)
   aws s3 sync ./out s3://pr-123-medisupply-web-abc123 --delete
   ```

## Security Considerations

### Production

- S3 bucket blocks public access
- CloudFront Origin Access Control (OAC) for secure S3 access
- HTTPS enforced via CloudFront
- Server-side encryption enabled

### PR Environments

- Public S3 website hosting (for simplicity and cost)
- HTTP only (no SSL for temporary environments)
- Automatic cleanup to prevent resource accumulation

## Maintenance

### Cleanup Old PR Environments

Run the cleanup script periodically:

```bash
./infrastructure/scripts/cleanup-old-pr-environments.sh
```

### State Management

Consider using remote state for production:

```hcl
# Uncomment in main.tf
backend "s3" {
  bucket = "your-terraform-state-bucket"
  key    = "medisupply-web/terraform.tfstate"
  region = "us-east-1"
}
```

## Troubleshooting

### Common Issues

1. **SSL Certificate validation timeout**:
   - Ensure DNS validation records are added to your domain
   - Certificate must be in us-east-1 region for CloudFront

2. **S3 bucket name conflicts**:
   - Bucket names are globally unique
   - Random suffix is added automatically

3. **CloudFront cache issues**:
   - Create invalidation: `aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"`

4. **PR environments not cleaning up**:
   - Check GitHub Actions logs
   - Manually run cleanup script
   - Verify AWS credentials in GitHub secrets

## Additional Resources

- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront with S3](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
