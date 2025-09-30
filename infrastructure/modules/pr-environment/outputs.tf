output "s3_bucket_name" {
  description = "Name of the PR S3 bucket"
  value       = aws_s3_bucket.pr_website.bucket
}

output "website_url" {
  description = "PR environment website URL"
  value       = "http://${aws_s3_bucket.pr_website.website_endpoint}"
}

output "pr_number" {
  description = "Pull request number"
  value       = var.pr_number
}

output "bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.pr_website.bucket_domain_name
}